import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { generalLimiter } from './middleware/rateLimit.js';
import { authRoutes } from './routes/auth.routes.js';
import { restaurantRoutes } from './routes/restaurant.routes.js';

const app = express();

// Security and utility middleware
app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(morgan('dev'));

// Webhook route must come before express.json() because it needs the raw body
// app.post('/api/v1/payments/webhook', express.raw({ type: 'application/json' }), webhookHandler);

// Parse JSON bodies
app.use(express.json());

// Global rate limiter
app.use('/api', generalLimiter);

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/restaurants', restaurantRoutes);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ error: { code: 'not_found', message: 'Route not found' } });
});

// Global error handler
app.use(errorHandler);

export { app };
