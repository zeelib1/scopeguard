const express = require('express');
const ScopeTemplates = require('../models/ScopeTemplates');
const Project = require('../models/Project');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/scope-templates - Get all available templates
router.get('/', (req, res) => {
  try {
    const { search } = req.query;
    
    let templates;
    if (search) {
      templates = ScopeTemplates.search(search);
    } else {
      templates = ScopeTemplates.getAll();
    }
    
    res.json({ templates });
  } catch (err) {
    console.error('Get templates error:', err);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

// GET /api/scope-templates/:templateId - Get specific template details
router.get('/:templateId', (req, res) => {
  try {
    const template = ScopeTemplates.getById(req.params.templateId);
    res.json({ template });
  } catch (err) {
    console.error('Get template error:', err);
    res.status(404).json({ error: err.message || 'Template not found' });
  }
});

// POST /api/scope-templates/:templateId/apply/:projectId - Apply template to project
router.post('/:templateId/apply/:projectId', (req, res) => {
  try {
    const { templateId, projectId } = req.params;
    
    // Verify project ownership
    if (!Project.belongsToUser(projectId, req.user.id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const scopeItems = ScopeTemplates.applyToProject(templateId, projectId);
    
    res.status(201).json({ 
      message: 'Template applied successfully',
      scopeItems,
      count: scopeItems.length
    });
  } catch (err) {
    console.error('Apply template error:', err);
    res.status(400).json({ error: err.message || 'Failed to apply template' });
  }
});

module.exports = router;
