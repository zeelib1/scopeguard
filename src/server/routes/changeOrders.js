const express = require('express');
const ChangeOrder = require('../models/ChangeOrder');
const Project = require('../models/Project');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

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

// GET /api/projects/:projectId/change-orders - Get all change orders
router.get('/', (req, res) => {
  try {
    const { status } = req.query;
    const changeOrders = ChangeOrder.findByProjectId(req.params.projectId, status);
    const stats = ChangeOrder.getProjectStats(req.params.projectId);
    
    res.json({ changeOrders, stats });
  } catch (err) {
    console.error('Get change orders error:', err);
    res.status(500).json({ error: 'Failed to fetch change orders' });
  }
});

// POST /api/projects/:projectId/change-orders - Create change order
router.post('/', (req, res) => {
  try {
    const { title, description, price, request_ids } = req.body;

    if (!title || price === undefined) {
      return res.status(400).json({ error: 'Title and price required' });
    }

    const changeOrder = ChangeOrder.create({
      project_id: req.params.projectId,
      title,
      description,
      price: parseFloat(price),
      request_ids
    });

    res.status(201).json({ changeOrder });
  } catch (err) {
    console.error('Create change order error:', err);
    res.status(500).json({ error: 'Failed to create change order' });
  }
});

// POST /api/projects/:projectId/change-orders/generate - Generate from out-of-scope requests
router.post('/generate', (req, res) => {
  try {
    const { request_ids, title, price } = req.body;

    if (!request_ids || !Array.isArray(request_ids) || request_ids.length === 0) {
      return res.status(400).json({ error: 'At least one request ID required' });
    }

    if (!title || price === undefined) {
      return res.status(400).json({ error: 'Title and price required' });
    }

    const changeOrder = ChangeOrder.generateFromRequests(
      req.params.projectId,
      request_ids,
      { title, price: parseFloat(price) }
    );

    res.status(201).json({ changeOrder });
  } catch (err) {
    console.error('Generate change order error:', err);
    res.status(500).json({ 
      error: err.message || 'Failed to generate change order' 
    });
  }
});

// GET /api/projects/:projectId/change-orders/:id - Get single change order
router.get('/:id', (req, res) => {
  try {
    const changeOrder = ChangeOrder.findById(req.params.id);
    
    if (!changeOrder) {
      return res.status(404).json({ error: 'Change order not found' });
    }

    res.json({ changeOrder });
  } catch (err) {
    console.error('Get change order error:', err);
    res.status(500).json({ error: 'Failed to fetch change order' });
  }
});

// PUT /api/projects/:projectId/change-orders/:id - Update change order
router.put('/:id', (req, res) => {
  try {
    const changeOrder = ChangeOrder.findById(req.params.id);
    
    if (!changeOrder) {
      return res.status(404).json({ error: 'Change order not found' });
    }

    const { title, description, price, status } = req.body;

    const updated = ChangeOrder.update(req.params.id, {
      title,
      description,
      price: price !== undefined ? parseFloat(price) : undefined,
      status
    });

    res.json({ changeOrder: updated });
  } catch (err) {
    console.error('Update change order error:', err);
    res.status(500).json({ error: 'Failed to update change order' });
  }
});

// POST /api/projects/:projectId/change-orders/:id/approve - Approve change order
router.post('/:id/approve', (req, res) => {
  try {
    const changeOrder = ChangeOrder.findById(req.params.id);
    
    if (!changeOrder) {
      return res.status(404).json({ error: 'Change order not found' });
    }

    const updated = ChangeOrder.approve(req.params.id);

    res.json({ changeOrder: updated });
  } catch (err) {
    console.error('Approve change order error:', err);
    res.status(500).json({ error: 'Failed to approve change order' });
  }
});

// POST /api/projects/:projectId/change-orders/:id/reject - Reject change order
router.post('/:id/reject', (req, res) => {
  try {
    const changeOrder = ChangeOrder.findById(req.params.id);
    
    if (!changeOrder) {
      return res.status(404).json({ error: 'Change order not found' });
    }

    const updated = ChangeOrder.reject(req.params.id);

    res.json({ changeOrder: updated });
  } catch (err) {
    console.error('Reject change order error:', err);
    res.status(500).json({ error: 'Failed to reject change order' });
  }
});

// DELETE /api/projects/:projectId/change-orders/:id - Delete change order
router.delete('/:id', (req, res) => {
  try {
    const changeOrder = ChangeOrder.findById(req.params.id);
    
    if (!changeOrder) {
      return res.status(404).json({ error: 'Change order not found' });
    }

    ChangeOrder.delete(req.params.id);
    res.json({ message: 'Change order deleted successfully' });
  } catch (err) {
    console.error('Delete change order error:', err);
    res.status(500).json({ error: 'Failed to delete change order' });
  }
});

module.exports = router;
