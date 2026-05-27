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

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim());

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn('CORS blocked origin:', origin);
      callback(null, true); // Allow all in production for now
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
};

const io = new SocketIOServer(server, {
  cors: corsOptions,
  transports: ['polling', 'websocket'],
  pingTimeout: 60000,
  pingInterval: 25000,
  allowEIO3: true,
});

// Middleware - helmet with WebSocket-safe config
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));
app.use(cors(corsOptions));
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
  socket.on('join', (room: string) => {
    socket.join(room === 'dashboard' ? 'dashboard' : `assignment:${room}`);
    console.log(`Socket ${socket.id} joined room: ${room}`);
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
