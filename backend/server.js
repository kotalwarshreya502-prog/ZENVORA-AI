import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';
import apiRouter from './routes/api.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from backend/.env (dev) — Render/prod sets them via dashboard
dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ─── Allowed Origins ───────────────────────────────────────────────────────────
// Add your deployed frontend URL to CLIENT_URL in production env variables.
// In development, localhost:5173 is always allowed.
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
];

if (process.env.CLIENT_URL) {
  // Support comma-separated list: CLIENT_URL=https://app.zenvora.ai,https://www.zenvora.ai
  process.env.CLIENT_URL.split(',').forEach((url) => {
    const trimmed = url.trim();
    if (trimmed && !allowedOrigins.includes(trimmed)) {
      allowedOrigins.push(trimmed);
    }
  });
}

// ─── Security ─────────────────────────────────────────────────────────────────
app.use(helmet());

// ─── Request Logging ──────────────────────────────────────────────────────────
if (NODE_ENV !== 'test') {
  app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server requests (no Origin header), configured allowed origins, or onrender.com preview domains
      if (!origin || allowedOrigins.includes(origin) || (origin && origin.endsWith('.onrender.com'))) {
        return callback(null, true);
      }
      return callback(new Error(`CORS: Origin '${origin}' not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ─── Body Parsers ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Root Welcome ─────────────────────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.status(200).json({
    name: 'ZENVORA AI API',
    tagline: 'Smarter Marketing. Sustainable Growth.',
    status: 'online',
    version: '1.0.0',
    environment: NODE_ENV,
    documentation: '/api/health',
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api', apiRouter);

// ─── Error Handling ───────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
const server = app.listen(PORT, async () => {
  console.log('\n=============================================================');
  console.log(`🚀 ZENVORA AI Backend running on port ${PORT}`);
  console.log(`📡 Environment : ${NODE_ENV}`);
  console.log(`🌐 CORS origins: ${allowedOrigins.join(', ')}`);
  console.log(`🩺 Health check: /api/health`);
  console.log('=============================================================\n');

  // Connect to MongoDB Atlas (non-blocking)
  await connectDB();
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received — closing server gracefully.');
  server.close(() => process.exit(0));
});

export default app;
