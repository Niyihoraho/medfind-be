// ─── MEDFIND API SERVER ──────────────────────────────────────────
// Express entry point with all middleware and route registration.

import 'dotenv/config';
import 'express-async-errors';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';

// ─── POLYFILLS ────────────────────────────────────────────────────
// BigInt serialization fix for Express/JSON.stringify
(BigInt.prototype as any).toJSON = function () {
  const num = Number(this);
  return Number.isSafeInteger(num) ? num : this.toString();
};

// Route imports
import authRoutes from './routes/auth.routes';
import locationRoutes from './routes/location.routes';
import facilityRoutes from './routes/facility.routes';
import appointmentRoutes from './routes/appointment.routes';
import lookupRoutes from './routes/lookup.routes';
import adminRoutes from './routes/admin.routes';

const app = express();
const PORT = process.env.PORT || 5000;

// ─── GLOBAL MIDDLEWARE ───────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
  ],
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static(path.join(process.cwd(), 'public/uploads')));

// ─── HEALTH CHECK ────────────────────────────────────────────────
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ success: true, message: 'MEDFIND API is running', timestamp: new Date().toISOString() });
});

// ─── API ROUTES ──────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api', locationRoutes);
app.use('/api/facilities', facilityRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api', lookupRoutes);
app.use('/api/admin', adminRoutes);

// ─── 404 HANDLER ─────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, error: 'Route not found', code: 404 });
});

// ─── GLOBAL ERROR HANDLER ────────────────────────────────────────
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('❌ Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    code: 500,
  });
});

// ─── START SERVER ────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🏥 MEDFIND API running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health\n`);
});

export default app;
