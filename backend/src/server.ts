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

const ALLOWED_ORIGINS = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
  : ['https://bdsdiemtam.com', 'https://www.bdsdiemtam.com'];

const corsOptions = {
  origin: (origin: string | undefined, cb: (err: Error | null, allow?: boolean) => void) => {
    // Cho phép requests không có origin (mobile apps, Postman, server-to-server)
    if (!origin) return cb(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
};

const io = new Server(server, { cors: { origin: ALLOWED_ORIGINS, credentials: true } });

// Gắn io vào app để dùng ở mọi Controller qua req.app.get('io')
app.set('io', io);
const PORT = process.env.PORT || 5000;

// Middlewares cơ bản
app.use(cors(corsOptions));
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
  console.log(`🚀 Server is running on https://localhost:${PORT}`);
});