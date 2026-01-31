require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'ScopeGuard API',
    timestamp: new Date().toISOString()
  });
});

// Routes
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const scopeItemRoutes = require('./routes/scopeItems');
const requestRoutes = require('./routes/requests');
const dashboardRoutes = require('./routes/dashboard');
const changeOrderRoutes = require('./routes/changeOrders');
const portalRoutes = require('./routes/portal');
const templateRoutes = require('./routes/templates');

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/projects/:projectId/scope-items', scopeItemRoutes);
app.use('/api/projects/:projectId/requests', requestRoutes);
app.use('/api/projects/:projectId/status', dashboardRoutes);
app.use('/api/projects/:projectId/change-orders', changeOrderRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api', portalRoutes); // Portal routes (includes public endpoint)

// API info endpoint
app.get('/api', (req, res) => {
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
app.use((err, req, res, next) => {
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

module.exports = app;
