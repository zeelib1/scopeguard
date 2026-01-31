import express, { Request, Response, NextFunction } from 'express';
import ScopeItem from '../models/ScopeItem';
import Project from '../models/Project';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = express.Router({ mergeParams: true }); // To access :projectId from parent route

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

// GET /api/projects/:projectId/scope-items - Get all scope items for project
router.get('/', (req: AuthRequest, res: Response): void => {
  try {
    const items = ScopeItem.getProjectStats(req.params.projectId);
    res.json({ scopeItems: items });
  } catch (err) {
    console.error('Get scope items error:', err);
    res.status(500).json({ error: 'Failed to fetch scope items' });
  }
});

// POST /api/projects/:projectId/scope-items - Create scope item
router.post('/', (req: AuthRequest, res: Response): void => {
  try {
    const { description, limit_value, limit_type } = req.body;

    if (!description) {
      res.status(400).json({ error: 'Description required' });
    }

    const item = ScopeItem.create({
      project_id: req.params.projectId,
      description,
      limit_value: limit_value || null,
      limit_type: limit_type || 'count'
    });

    res.status(201).json({ scopeItem: ScopeItem.getUsageStats(item.id) });
  } catch (err) {
    console.error('Create scope item error:', err);
    res.status(500).json({ error: 'Failed to create scope item' });
  }
});

// GET /api/projects/:projectId/scope-items/:id - Get single scope item with stats
router.get('/:id', (req: AuthRequest, res: Response): void => {
  try {
    const stats = ScopeItem.getUsageStats(req.params.id);
    
    if (!stats) {
      res.status(404).json({ error: 'Scope item not found' });
    }

    res.json({ scopeItem: stats });
  } catch (err) {
    console.error('Get scope item error:', err);
    res.status(500).json({ error: 'Failed to fetch scope item' });
  }
});

// PUT /api/projects/:projectId/scope-items/:id - Update scope item
router.put('/:id', (req: AuthRequest, res: Response): void => {
  try {
    const item = ScopeItem.findById(req.params.id);
    
    if (!item) {
      res.status(404).json({ error: 'Scope item not found' });
    }

    const { description, limit_value, limit_type } = req.body;

    const updated = ScopeItem.update(req.params.id, {
      description,
      limit_value,
      limit_type
    });

    res.json({ scopeItem: ScopeItem.getUsageStats(updated.id) });
  } catch (err) {
    console.error('Update scope item error:', err);
    res.status(500).json({ error: 'Failed to update scope item' });
  }
});

// DELETE /api/projects/:projectId/scope-items/:id - Delete scope item
router.delete('/:id', (req: AuthRequest, res: Response): void => {
  try {
    const item = ScopeItem.findById(req.params.id);
    
    if (!item) {
      res.status(404).json({ error: 'Scope item not found' });
    }

    ScopeItem.delete(req.params.id);
    res.json({ message: 'Scope item deleted successfully' });
  } catch (err) {
    console.error('Delete scope item error:', err);
    res.status(500).json({ error: 'Failed to delete scope item' });
  }
});

export default router;
