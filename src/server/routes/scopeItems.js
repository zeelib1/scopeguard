const express = require('express');
const ScopeItem = require('../models/ScopeItem');
const Project = require('../models/Project');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router({ mergeParams: true }); // To access :projectId from parent route

// All routes require authentication
router.use(authMiddleware);

// Middleware to verify project ownership
const verifyProjectOwnership = (req, res, next) => {
  const projectId = req.params.projectId;
  
  if (!Project.belongsToUser(projectId, req.user.id)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  next();
};

router.use(verifyProjectOwnership);

// GET /api/projects/:projectId/scope-items - Get all scope items for project
router.get('/', (req, res) => {
  try {
    const items = ScopeItem.getProjectStats(req.params.projectId);
    res.json({ scopeItems: items });
  } catch (err) {
    console.error('Get scope items error:', err);
    res.status(500).json({ error: 'Failed to fetch scope items' });
  }
});

// POST /api/projects/:projectId/scope-items - Create scope item
router.post('/', (req, res) => {
  try {
    const { description, limit_value, limit_type } = req.body;

    if (!description) {
      return res.status(400).json({ error: 'Description required' });
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
router.get('/:id', (req, res) => {
  try {
    const stats = ScopeItem.getUsageStats(req.params.id);
    
    if (!stats) {
      return res.status(404).json({ error: 'Scope item not found' });
    }

    res.json({ scopeItem: stats });
  } catch (err) {
    console.error('Get scope item error:', err);
    res.status(500).json({ error: 'Failed to fetch scope item' });
  }
});

// PUT /api/projects/:projectId/scope-items/:id - Update scope item
router.put('/:id', (req, res) => {
  try {
    const item = ScopeItem.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ error: 'Scope item not found' });
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
router.delete('/:id', (req, res) => {
  try {
    const item = ScopeItem.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ error: 'Scope item not found' });
    }

    ScopeItem.delete(req.params.id);
    res.json({ message: 'Scope item deleted successfully' });
  } catch (err) {
    console.error('Delete scope item error:', err);
    res.status(500).json({ error: 'Failed to delete scope item' });
  }
});

module.exports = router;
