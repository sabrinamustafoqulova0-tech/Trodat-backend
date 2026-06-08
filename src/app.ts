// ===========================================
// Trodat Shop Backend - Express App
// ===========================================

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth.routes';
import stampsRoutes from './routes/stamps.routes';
import categoriesRoutes from './routes/categories.routes';
import cartRoutes from './routes/cart.routes';
import ordersRoutes from './routes/orders.routes';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger';

const app = express();

// ── Global Middleware ──────────────────────
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP to allow Swagger UI to work correctly
}));
app.use(cors({
  origin: true, // Allow all origins in development (or specifically include localhost:3001)
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Rate Limiting ──────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'error', message: 'Too many requests, please try again later.' },
});
app.use('/api/v1/auth', limiter);

// ── Health Check ───────────────────────────
app.get('/api/v1/health', (_req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ── Swagger Documentation ──────────────────
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Redirect root to swagger docs
app.get('/', (_req, res) => {
  res.redirect('/api-docs');
});

// ── API Routes ─────────────────────────────
app.use((req, _res, next) => {
  if (req.url.startsWith('/api/v1')) {
    console.log(`[API] ${req.method} ${req.url}`);
  }
  next();
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/stamps', stampsRoutes);
app.use('/api/v1/categories', categoriesRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/orders', ordersRoutes);

// ── Error Handling ─────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
