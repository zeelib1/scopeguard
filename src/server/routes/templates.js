const express = require('express');
const { getTemplateList, getTemplate } = require('../templates/projectTemplates');
const Project = require('../models/Project');
const ScopeItem = require('../models/ScopeItem');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/templates - List all available templates
router.get('/', (req, res) => {
  try {
    const templates = getTemplateList();
    res.json({ templates });
  } catch (err) {
    console.error('Get templates error:', err);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

// GET /api/templates/:templateId - Get specific template details
router.get('/:templateId', (req, res) => {
  try {
    const template = getTemplate(req.params.templateId);
    
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json({ template });
  } catch (err) {
    console.error('Get template error:', err);
    res.status(500).json({ error: 'Failed to fetch template' });
  }
});

// POST /api/templates/:templateId/create-project - Create project from template
router.post('/:templateId/create-project', (req, res) => {
  try {
    const template = getTemplate(req.params.templateId);
    
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    const { client_name, project_name, description } = req.body;

    if (!client_name) {
      return res.status(400).json({ error: 'Client name required' });
    }

    // Create project
    const project = Project.create({
      user_id: req.user.id,
      client_name,
      project_name: project_name || template.name,
      description: description || template.description
    });

    // Create scope items from template
    template.scope_items.forEach(item => {
      ScopeItem.create({
        project_id: project.id,
        description: item.description,
        limit_value: item.limit_value,
        limit_type: item.limit_type
      });
    });

    // Get complete project with scope items
    const scopeItems = ScopeItem.findByProjectId(project.id);

    res.status(201).json({
      project,
      scopeItems,
      message: `Project created from template: ${template.name}`
    });
  } catch (err) {
    console.error('Create project from template error:', err);
    res.status(500).json({ error: 'Failed to create project from template' });
  }
});

module.exports = router;
