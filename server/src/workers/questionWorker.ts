import { Queue, Worker, Job } from 'bullmq';
import { Server as SocketIOServer } from 'socket.io';
import Redis from 'ioredis';
import Assignment from '../models/Assignment';
import { generateQuestionPaper } from '../services/aiService';

let questionQueue: Queue;

export function getQueue(): Queue {
  return questionQueue;
}

export function setupWorker(io: SocketIOServer, redis: Redis) {
  const connection = { connection: redis };

  questionQueue = new Queue('question-generation', connection);

  const worker = new Worker(
    'question-generation',
    async (job: Job) => {
      const { assignmentId } = job.data;
      console.log(`Processing job for assignment: ${assignmentId}`);

      // Update status
      await Assignment.findByIdAndUpdate(assignmentId, { status: 'processing' });
      io.to(`assignment:${assignmentId}`).emit('status', {
        assignmentId,
        status: 'processing',
        progress: 10,
      });

      try {
        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) throw new Error('Assignment not found');

        // Emit progress
        io.to(`assignment:${assignmentId}`).emit('status', {
          assignmentId,
          status: 'processing',
          progress: 20,
        });

        // Simulate progressive updates while AI generates
        let currentProgress = 20;
        const progressInterval = setInterval(() => {
          currentProgress = Math.min(75, currentProgress + Math.round(Math.random() * 8 + 2));
          io.to(`assignment:${assignmentId}`).emit('status', {
            assignmentId,
            status: 'processing',
            progress: currentProgress,
          });
        }, 2000);

        // Generate via AI
        const paper = await generateQuestionPaper(assignment);
        clearInterval(progressInterval);

        io.to(`assignment:${assignmentId}`).emit('status', {
          assignmentId,
          status: 'processing',
          progress: 85,
        });

        // Save result
        assignment.generatedPaper = paper;
        assignment.status = 'completed';
        await assignment.save();

        // Cache in Redis
        await redis.set(
          `paper:${assignmentId}`,
          JSON.stringify(paper),
          'EX',
          3600
        );

        io.to(`assignment:${assignmentId}`).emit('status', {
          assignmentId,
          status: 'completed',
          progress: 100,
        });

        io.to(`assignment:${assignmentId}`).emit('paper-ready', {
          assignmentId,
          paper,
        });

        return paper;
      } catch (err: any) {
        console.error('Job failed:', err);
        await Assignment.findByIdAndUpdate(assignmentId, { status: 'failed' });
        io.to(`assignment:${assignmentId}`).emit('status', {
          assignmentId,
          status: 'failed',
          error: err.message,
        });
        throw err;
      }
    },
    { ...connection, concurrency: 2 }
  );

  worker.on('completed', (job) => {
    console.log(`Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed:`, err.message);
  });
}
