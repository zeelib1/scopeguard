import express, { Request, Response, NextFunction } from 'express';
import Request from '../models/Request';
import ChangeOrder from '../models/ChangeOrder';
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

// POST /api/projects/:projectId/bulk/categorize - Bulk categorize requests
router.post('/categorize', (req: AuthRequest, res: Response): void => {
  try {
    const { request_ids, status, scope_item_id } = req.body;

    if (!request_ids || !Array.isArray(request_ids) || request_ids.length === 0) {
      res.status(400).json({ error: 'request_ids array required' });
    }

    if (!status || !['in-scope', 'out-of-scope'].includes(status)) {
      res.status(400).json({ error: 'Valid status required (in-scope or out-of-scope)' });
    }

    const results = {
      success: [],
      failed: []
    };

    request_ids.forEach(requestId => {
      try {
        const updated = Request.categorize(requestId, status, scope_item_id);
        results.success.push(updated);
      } catch (err) {
        results.failed.push({ id: requestId, error: err.message });
      }
    });

    res.json({
      message: `Categorized ${results.success.length} of ${request_ids.length} requests`,
      results
    });
  } catch (err) {
    console.error('Bulk categorize error:', err);
    res.status(500).json({ error: 'Failed to categorize requests' });
  }
});

// POST /api/projects/:projectId/bulk/create-change-order - Create change order from multiple requests
router.post('/create-change-order', (req: AuthRequest, res: Response): void => {
  try {
    const { request_ids, title, price } = req.body;

    if (!request_ids || !Array.isArray(request_ids) || request_ids.length === 0) {
      res.status(400).json({ error: 'request_ids array required' });
    }

    if (!title || price === undefined) {
      res.status(400).json({ error: 'title and price required' });
    }

    const changeOrder = ChangeOrder.generateFromRequests(
      req.params.projectId,
      request_ids,
      { title, price: parseFloat(price) }
    );

    res.status(201).json({
      message: `Created change order from ${request_ids.length} requests`,
      changeOrder
    });
  } catch (err) {
    console.error('Bulk create change order error:', err);
    res.status(500).json({ 
      error: err.message || 'Failed to create change order' 
    });
  }
});

// POST /api/projects/:projectId/bulk/delete-requests - Bulk delete requests
router.post('/delete-requests', (req: AuthRequest, res: Response): void => {
  try {
    const { request_ids } = req.body;

    if (!request_ids || !Array.isArray(request_ids) || request_ids.length === 0) {
      res.status(400).json({ error: 'request_ids array required' });
    }

    const results = {
      deleted: 0,
      failed: []
    };

    request_ids.forEach(requestId => {
      try {
        Request.delete(requestId);
        results.deleted++;
      } catch (err) {
        results.failed.push({ id: requestId, error: err.message });
      }
    });

    res.json({
      message: `Deleted ${results.deleted} of ${request_ids.length} requests`,
      results
    });
  } catch (err) {
    console.error('Bulk delete error:', err);
    res.status(500).json({ error: 'Failed to delete requests' });
  }
});

// POST /api/projects/:projectId/bulk/update-requests - Bulk update request fields
router.post('/update-requests', (req: AuthRequest, res: Response): void => {
  try {
    const { request_ids, updates } = req.body;

    if (!request_ids || !Array.isArray(request_ids) || request_ids.length === 0) {
      res.status(400).json({ error: 'request_ids array required' });
    }

    if (!updates || typeof updates !== 'object') {
      res.status(400).json({ error: 'updates object required' });
    }

    const results = {
      success: [],
      failed: []
    };

    request_ids.forEach(requestId => {
      try {
        const updated = Request.update(requestId, updates);
        results.success.push(updated);
      } catch (err) {
        results.failed.push({ id: requestId, error: err.message });
      }
    });

    res.json({
      message: `Updated ${results.success.length} of ${request_ids.length} requests`,
      results
    });
  } catch (err) {
    console.error('Bulk update error:', err);
    res.status(500).json({ error: 'Failed to update requests' });
  }
});

export default router;
