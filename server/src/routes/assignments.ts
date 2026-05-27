import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Assignment from '../models/Assignment';
import { getQueue } from '../workers/questionWorker';
import { getRedis } from '../config/redis';

const router = Router();

// Multer config
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = 'uploads';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['.pdf', '.png', '.jpg', '.jpeg', '.txt', '.heic', '.heif', '.webp', '.gif', '.bmp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(null, true); // Accept all files to avoid mobile upload issues
  },
});

// GET all assignments
router.get('/', async (_req: Request, res: Response) => {
  try {
    const assignments = await Assignment.find()
      .select('-generatedPaper -uploadedFileText')
      .sort({ createdAt: -1 });
    res.json(assignments);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET single assignment
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check Redis cache first
    const redis = getRedis();
    if (redis) {
      const cached = await redis.get(`paper:${id}`);
      if (cached) {
        const assignment = await Assignment.findById(id).select('-uploadedFileText');
        if (assignment) {
          const result = assignment.toObject();
          result.generatedPaper = JSON.parse(cached);
          return res.json(result);
        }
      }
    }

    const assignment = await Assignment.findById(id);
    if (!assignment) return res.status(404).json({ error: 'Not found' });
    res.json(assignment);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST create assignment and start generation
router.post('/', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const body = JSON.parse(req.body.data || '{}');

    const {
      title,
      subject,
      className,
      dueDate,
      questionTypes,
      additionalInfo,
      totalQuestions,
      totalMarks,
    } = body;

    if (!title || !dueDate || !questionTypes?.length) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Parse uploaded file text if PDF
    let uploadedFileText = '';
    let uploadedFileUrl = '';
    if (req.file) {
      uploadedFileUrl = `/uploads/${req.file.filename}`;
      if (req.file.mimetype === 'application/pdf') {
        try {
          const pdfParse = require('pdf-parse');
          const buffer = fs.readFileSync(req.file.path);
          const data = await pdfParse(buffer);
          uploadedFileText = data.text;
        } catch {
          // PDF parsing failed, continue without text
        }
      }
    }

    const assignment = await Assignment.create({
      title,
      subject: subject || '',
      className: className || '',
      dueDate,
      questionTypes,
      additionalInfo: additionalInfo || '',
      uploadedFileUrl,
      uploadedFileText,
      totalQuestions: totalQuestions || 0,
      totalMarks: totalMarks || 0,
      status: 'processing',
    });

    // Add to BullMQ queue
    const queue = getQueue();
    const job = await queue.add(
      'generate',
      { assignmentId: assignment._id.toString() },
      { attempts: 3, backoff: { type: 'exponential', delay: 2000 } }
    );

    assignment.jobId = job.id;
    await assignment.save();

    // Notify via socket
    const io = req.app.get('io');
    if (io) {
      io.emit('assignment-created', {
        assignmentId: assignment._id,
        status: 'processing',
      });
    }

    res.status(201).json(assignment);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST regenerate
router.post('/:id/regenerate', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const assignment = await Assignment.findById(id);
    if (!assignment) return res.status(404).json({ error: 'Not found' });

    assignment.status = 'processing';
    assignment.generatedPaper = undefined;
    await assignment.save();

    // Clear cache
    const redis = getRedis();
    if (redis) await redis.del(`paper:${id}`);

    const queue = getQueue();
    const job = await queue.add(
      'generate',
      { assignmentId: id },
      { attempts: 3, backoff: { type: 'exponential', delay: 2000 } }
    );

    assignment.jobId = job.id;
    await assignment.save();

    const io = req.app.get('io');
    if (io) {
      io.to(`assignment:${id}`).emit('status', {
        assignmentId: id,
        status: 'processing',
        progress: 0,
      });
    }

    res.json({ message: 'Regeneration started', jobId: job.id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE assignment
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await Assignment.findByIdAndDelete(id);

    const redis = getRedis();
    if (redis) await redis.del(`paper:${id}`);

    res.json({ message: 'Deleted' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
