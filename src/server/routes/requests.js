const express = require('express');
const Request = require('../models/Request');
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

// GET /api/projects/:projectId/requests - Get all requests for project
router.get('/', (req, res) => {
  try {
    const { status } = req.query;
    const requests = Request.findByProjectId(req.params.projectId, status);
    const stats = Request.getProjectStats(req.params.projectId);
    
    res.json({ requests, stats });
  } catch (err) {
    console.error('Get requests error:', err);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

// POST /api/projects/:projectId/requests - Create new request
router.post('/', (req, res) => {
  try {
    const { description, source, status, scope_item_id, notes } = req.body;

    if (!description) {
      return res.status(400).json({ error: 'Description required' });
    }

    const request = Request.create({
      project_id: req.params.projectId,
      description,
      source,
      status: status || 'pending',
      scope_item_id,
      notes
    });

    res.status(201).json({ request });
  } catch (err) {
    console.error('Create request error:', err);
    res.status(500).json({ error: 'Failed to create request' });
  }
});

// GET /api/projects/:projectId/requests/:id - Get single request
router.get('/:id', (req, res) => {
  try {
    const request = Request.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    res.json({ request });
  } catch (err) {
    console.error('Get request error:', err);
    res.status(500).json({ error: 'Failed to fetch request' });
  }
});

// PUT /api/projects/:projectId/requests/:id - Update request
router.put('/:id', (req, res) => {
  try {
    const request = Request.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    const { description, source, status, scope_item_id, notes } = req.body;

    const updated = Request.update(req.params.id, {
      description,
      source,
      status,
      scope_item_id,
      notes
    });

    res.json({ request: updated });
  } catch (err) {
    console.error('Update request error:', err);
    res.status(500).json({ error: 'Failed to update request' });
  }
});

// POST /api/projects/:projectId/requests/:id/categorize - Categorize request
router.post('/:id/categorize', (req, res) => {
  try {
    const request = Request.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    const { status, scope_item_id } = req.body;

    if (!status || !['in-scope', 'out-of-scope'].includes(status)) {
      return res.status(400).json({ error: 'Status must be in-scope or out-of-scope' });
    }

    const updated = Request.categorize(req.params.id, status, scope_item_id);

    res.json({ request: updated });
  } catch (err) {
    console.error('Categorize request error:', err);
    res.status(500).json({ error: 'Failed to categorize request' });
  }
});

// DELETE /api/projects/:projectId/requests/:id - Delete request
router.delete('/:id', (req, res) => {
  try {
    const request = Request.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    Request.delete(req.params.id);
    res.json({ message: 'Request deleted successfully' });
  } catch (err) {
    console.error('Delete request error:', err);
    res.status(500).json({ error: 'Failed to delete request' });
  }
});

module.exports = router;
