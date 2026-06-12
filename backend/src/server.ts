import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import { errorHandler } from './middlewares/error.middleware';
import routes from './routes';

// Nạp biến môi trường
dotenv.config();

const app = express();
const server = http.createServer(app);

const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
const io = new Server(server, { cors: { origin: CORS_ORIGIN } });

// Gắn io vào app để dùng ở mọi Controller qua req.app.get('io')
app.set('io', io);
const PORT = process.env.PORT || 5000;

// Middlewares cơ bản
app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Route
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'success', message: 'Điểm Tâm BĐS API is running smoothly!' });
});

// Khai báo toàn bộ API Routes vào hệ thống
app.use('/api', routes);

// Global Error Handling Middleware (Luôn đặt ở cuối cùng trước khi app.listen)
app.use(errorHandler);

// Lắng nghe kết nối Socket.io
io.on('connection', (socket) => {
  console.log('⚡ Client connected to Socket.io:', socket.id);
  socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
});

// Khởi động server
server.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});