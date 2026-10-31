import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';

// Routes imports
import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import academicRoutes from './routes/academicRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
import skillRoutes from './routes/skillRoutes.js';
import careerRoutes from './routes/careerRoutes.js';
import skillGapRoutes from './routes/skillGapRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import configRoutes from './routes/configRoutes.js';
import auditLogRoutes from './routes/auditLogRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import recommendationRoutes from './routes/recommendationRoutes.js';

const app = express();

// Standard Middlewares
app.use(express.json());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// Request Logger
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health Check API
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({
    status: 'healthy',
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/academic-records', academicRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/careers', careerRoutes);
app.use('/api/skill-gap', skillGapRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin/config', configRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/recommendations', recommendationRoutes);

// Catch 404
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Not Found - ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Error Trace:', err.stack);
  
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    errors: err.errors || [],
    // Avoid leaking stack trace in production environments
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

export default app;
