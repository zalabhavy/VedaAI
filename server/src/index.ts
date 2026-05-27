import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { connectDB } from './config/db';
import { connectRedis } from './config/redis';
import { setupWorker } from './workers/questionWorker';
import assignmentRoutes from './routes/assignments';

const app = express();
const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000' }));
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static('uploads'));

// Make io accessible in routes
app.set('io', io);

// Routes
app.use('/api/assignments', assignmentRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Socket.io
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('join', (assignmentId: string) => {
    socket.join(`assignment:${assignmentId}`);
  });
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start
const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();
  const redis = await connectRedis();
  setupWorker(io, redis);

  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

start().catch(console.error);

export { io };
