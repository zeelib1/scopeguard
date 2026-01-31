import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Serve static files (landing page)
app.use(express.static('public'));

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'ScopeGuard API',
    timestamp: new Date().toISOString()
  });
});

// Routes
import authRoutes from './routes/auth';
import projectRoutes from './routes/projects';
import scopeItemRoutes from './routes/scopeItems';
import requestRoutes from './routes/requests';
import dashboardRoutes from './routes/dashboard';
import changeOrderRoutes from './routes/changeOrders';
import communicationsRoutes from './routes/communications';
import reportsRoutes from './routes/reports';
import activityLogRoutes from './routes/activityLog';
import budgetRoutes from './routes/budget';
import portalRoutes from './routes/portal';
import templateRoutes from './routes/templates';
import scopeTemplatesRoutes from './routes/scopeTemplates';
import stripeRoutes from './routes/stripe';
import analyticsRoutes from './routes/analytics';
import exportRoutes from './routes/export';
import bulkRoutes from './routes/bulk';
import teamRoutes from './routes/team';
import webhooksRoutes from './routes/webhooks';

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/projects/:projectId/scope-items', scopeItemRoutes);
app.use('/api/projects/:projectId/requests', requestRoutes);
app.use('/api/projects/:projectId/communications', communicationsRoutes);
app.use('/api/projects/:projectId/team', teamRoutes);
app.use('/api/projects/:projectId/status', dashboardRoutes);
app.use('/api/projects/:projectId/change-orders', changeOrderRoutes);
app.use('/api/projects/:projectId/export', exportRoutes);
app.use('/api/projects/:projectId/bulk', bulkRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/activity', activityLogRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/scope-templates', scopeTemplatesRoutes);
app.use('/api/webhooks', webhooksRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api', portalRoutes); // Portal routes (includes public endpoint)

// API info endpoint
app.get('/api', (req: Request, res: Response) => {
  res.json({
    message: 'ScopeGuard API',
    version: '0.1.0',
    endpoints: {
      auth: '/api/auth/*',
      projects: '/api/projects',
      requests: '/api/projects/:id/requests',
      changeOrders: '/api/change-orders',
      portal: '/portal/:token'
    }
  });
});

// Error handling
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🛡️  ScopeGuard API running on http://localhost:${PORT}`);
  console.log(`📝 API docs: http://localhost:${PORT}/api`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
