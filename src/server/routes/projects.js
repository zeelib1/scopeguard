const express = require('express');
const Project = require('../models/Project');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/projects - Get all projects for current user
router.get('/', (req, res) => {
  try {
    const { status } = req.query;
    const projects = Project.findByUserId(req.user.id, status);
    res.json({ projects });
  } catch (err) {
    console.error('Get projects error:', err);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// POST /api/projects - Create new project
router.post('/', (req, res) => {
  try {
    const { client_name, project_name, description } = req.body;

    // Validation
    if (!client_name || !project_name) {
      return res.status(400).json({ error: 'Client name and project name required' });
    }

    const project = Project.create({
      user_id: req.user.id,
      client_name,
      project_name,
      description
    });

    res.status(201).json({ project });
  } catch (err) {
    console.error('Create project error:', err);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// GET /api/projects/:id - Get single project
router.get('/:id', (req, res) => {
  try {
    const project = Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check ownership
    if (!Project.belongsToUser(project.id, req.user.id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get overview stats
    const overview = Project.getOverview(project.id);

    res.json({ project, overview });
  } catch (err) {
    console.error('Get project error:', err);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// PUT /api/projects/:id - Update project
router.put('/:id', (req, res) => {
  try {
    const project = Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check ownership
    if (!Project.belongsToUser(project.id, req.user.id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { client_name, project_name, description, status } = req.body;

    const updated = Project.update(req.params.id, {
      client_name,
      project_name,
      description,
      status
    });

    res.json({ project: updated });
  } catch (err) {
    console.error('Update project error:', err);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// DELETE /api/projects/:id - Delete project
router.delete('/:id', (req, res) => {
  try {
    const project = Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check ownership
    if (!Project.belongsToUser(project.id, req.user.id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    Project.delete(req.params.id);

    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    console.error('Delete project error:', err);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

module.exports = router;
