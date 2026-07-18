// ============================================================
// src/app.ts
// Express application factory.
// All middleware and routes are registered here.
// The server.ts file starts the HTTP listener separately so
// the app can be imported in tests without binding a port.
// ============================================================

import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';

import { env, corsOrigins, isDev } from './config/env';
import { requestLogger } from './middleware/requestLogger.middleware';
import { errorMiddleware } from './middleware/error.middleware';
import { notFoundMiddleware } from './middleware/notFound.middleware';
import apiRouter from './routes/index';

// ---- Create App ----
const app: Application = express();

// ============================================================
// SECURITY MIDDLEWARE
// ============================================================

// Helmet — sets secure HTTP headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // allow image serving
    contentSecurityPolicy: isDev ? false : undefined,
  }),
);

// CORS — restrict origins based on env
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. curl, Postman, mobile)
      if (!origin) return callback(null, true);
      if (corsOrigins.includes(origin) || corsOrigins.includes('*')) {
        return callback(null, true);
      }
      return callback(new Error(`CORS: Origin "${origin}" is not allowed`));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
    exposedHeaders: ['X-Request-ID'],
    credentials: true,
    maxAge: 86400, // preflight cache: 24h
  }),
);

// ============================================================
// PERFORMANCE MIDDLEWARE
// ============================================================

// Compress responses (gzip / deflate)
app.use(compression());

// ============================================================
// REQUEST PARSING
// ============================================================

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================================
// LOGGING
// ============================================================

// Morgan — HTTP access log (dev: colourful, prod: combined)
if (env.LOG_FORMAT === 'dev' || isDev) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Custom request logger — stamps requestId + latency
app.use(requestLogger);

// ============================================================
// RATE LIMITING
// ============================================================

const limiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max:      env.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
    timestamp: new Date().toISOString(),
  },
  skip: (req) => req.path === `${env.API_PREFIX}/health/ping`, // skip health pings
});

app.use(env.API_PREFIX, limiter);

// ============================================================
// STATIC FILE SERVING (uploads)
// ============================================================

app.use(
  '/uploads',
  express.static(path.resolve(process.cwd(), env.UPLOAD_DIR), {
    maxAge: '1d',
    etag: true,
  }),
);

// ============================================================
// API ROUTES
// ============================================================

app.use(env.API_PREFIX, apiRouter);

// ============================================================
// ERROR HANDLING (must be LAST)
// ============================================================

// 404 — unknown routes
app.use(notFoundMiddleware);

// Global error handler
app.use(errorMiddleware);

export default app;
