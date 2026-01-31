import express, { Request, Response, NextFunction } from 'express';
import ActivityLog from '../models/ActivityLog';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/activity - Get recent activity
router.get('/', (req: AuthRequest, res: Response): void => {
  try {
    const { entity_type, action, limit, since } = req.query;
    
    const filters = { user_id: req.user.id };
    if (entity_type) filters.entity_type = entity_type;
    if (action) filters.action = action;
    if (since) filters.since = parseInt(since);

    const logs = ActivityLog.getRecent(parseInt(limit) || 50, filters);
    
    res.json({ logs });
  } catch (err) {
    console.error('Get activity error:', err);
    res.status(500).json({ error: 'Failed to fetch activity logs' });
  }
});

// GET /api/activity/:entityType/:entityId - Get activity for specific entity
router.get('/:entityType/:entityId', (req: AuthRequest, res: Response): void => {
  try {
    const { entityType, entityId } = req.params;
    const limit = parseInt(req.query.limit) || 50;

    const logs = ActivityLog.findByEntity(entityType, parseInt(entityId), limit);
    
    res.json({ logs });
  } catch (err) {
    console.error('Get entity activity error:', err);
    res.status(500).json({ error: 'Failed to fetch entity activity' });
  }
});

export default router;
