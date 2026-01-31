import express, { Request, Response, NextFunction } from 'express';
import CommunicationLog from '../models/CommunicationLog';
import Project from '../models/Project';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = express.Router({ mergeParams: true });

// All routes require authentication
router.use(authMiddleware);

// Middleware to verify project ownership
const verifyProjectOwnership = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const projectId = req.params.projectId;
  
  if (!Project.belongsToUser(projectId, req.user.id)) {
    res.status(403).json({ error: 'Access denied' });
  }
  
  next();
};

router.use(verifyProjectOwnership);

// GET /api/projects/:projectId/communications - Get all communication logs for project
router.get('/', (req: AuthRequest, res: Response): void => {
  try {
    const { type, start_date, end_date, limit } = req.query;
    
    const options = {};
    if (type) options.type = type;
    if (start_date) options.start_date = parseInt(start_date);
    if (end_date) options.end_date = parseInt(end_date);
    if (limit) options.limit = parseInt(limit);

    const communications = CommunicationLog.findByProjectId(req.params.projectId, options);
    const stats = CommunicationLog.getProjectStats(req.params.projectId);
    
    res.json({ communications, stats });
  } catch (err) {
    console.error('Get communications error:', err);
    res.status(500).json({ error: 'Failed to fetch communications' });
  }
});

// POST /api/projects/:projectId/communications - Create new communication log
router.post('/', (req: AuthRequest, res: Response): void => {
  try {
    const { communication_type, subject, notes, occurred_at } = req.body;

    if (!communication_type) {
      res.status(400).json({ error: 'Communication type required' });
    }

    if (!notes) {
      res.status(400).json({ error: 'Notes required' });
    }

    const communication = CommunicationLog.create({
      project_id: req.params.projectId,
      user_id: req.user.id,
      communication_type,
      subject,
      notes,
      occurred_at: occurred_at ? parseInt(occurred_at) : undefined
    });

    res.status(201).json({ communication });
  } catch (err) {
    console.error('Create communication error:', err);
    res.status(400).json({ error: err.message || 'Failed to create communication log' });
  }
});

// GET /api/projects/:projectId/communications/:id - Get single communication log
router.get('/:id', (req: AuthRequest, res: Response): void => {
  try {
    const communication = CommunicationLog.findById(req.params.id);
    
    if (!communication) {
      res.status(404).json({ error: 'Communication log not found' });
    }

    res.json({ communication });
  } catch (err) {
    console.error('Get communication error:', err);
    res.status(500).json({ error: 'Failed to fetch communication log' });
  }
});

// PUT /api/projects/:projectId/communications/:id - Update communication log
router.put('/:id', (req: AuthRequest, res: Response): void => {
  try {
    const communication = CommunicationLog.findById(req.params.id);
    
    if (!communication) {
      res.status(404).json({ error: 'Communication log not found' });
    }

    const { communication_type, subject, notes, occurred_at } = req.body;

    const updated = CommunicationLog.update(req.params.id, {
      communication_type,
      subject,
      notes,
      occurred_at: occurred_at ? parseInt(occurred_at) : undefined
    });

    res.json({ communication: updated });
  } catch (err) {
    console.error('Update communication error:', err);
    res.status(400).json({ error: err.message || 'Failed to update communication log' });
  }
});

// DELETE /api/projects/:projectId/communications/:id - Delete communication log
router.delete('/:id', (req: AuthRequest, res: Response): void => {
  try {
    const communication = CommunicationLog.findById(req.params.id);
    
    if (!communication) {
      res.status(404).json({ error: 'Communication log not found' });
    }

    CommunicationLog.delete(req.params.id);
    res.json({ message: 'Communication log deleted successfully' });
  } catch (err) {
    console.error('Delete communication error:', err);
    res.status(500).json({ error: 'Failed to delete communication log' });
  }
});

export default router;
