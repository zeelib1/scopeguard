const express = require('express');
const PortalToken = require('../models/PortalToken');
const Project = require('../models/Project');
const ScopeItem = require('../models/ScopeItem');
const Request = require('../models/Request');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// POST /api/projects/:projectId/portal/generate - Generate portal token (auth required)
router.post('/projects/:projectId/portal/generate', authMiddleware, (req, res) => {
  try {
    const projectId = req.params.projectId;

    // Verify ownership
    if (!Project.belongsToUser(projectId, req.user.id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { expires_in_days } = req.body;

    const portalToken = PortalToken.generate(
      projectId,
      expires_in_days ? parseInt(expires_in_days) : null
    );

    res.status(201).json({
      portalToken,
      url: `${req.protocol}://${req.get('host')}/portal/${portalToken.token}`
    });
  } catch (err) {
    console.error('Generate portal token error:', err);
    res.status(500).json({ error: 'Failed to generate portal token' });
  }
});

// GET /api/projects/:projectId/portal/tokens - Get all portal tokens for project (auth required)
router.get('/projects/:projectId/portal/tokens', authMiddleware, (req, res) => {
  try {
    const projectId = req.params.projectId;

    // Verify ownership
    if (!Project.belongsToUser(projectId, req.user.id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const tokens = PortalToken.findByProjectId(projectId);

    res.json({ tokens });
  } catch (err) {
    console.error('Get portal tokens error:', err);
    res.status(500).json({ error: 'Failed to fetch portal tokens' });
  }
});

// DELETE /api/projects/:projectId/portal/tokens/:tokenId - Revoke token (auth required)
router.delete('/projects/:projectId/portal/tokens/:tokenId', authMiddleware, (req, res) => {
  try {
    const projectId = req.params.projectId;

    // Verify ownership
    if (!Project.belongsToUser(projectId, req.user.id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    PortalToken.revoke(req.params.tokenId);

    res.json({ message: 'Token revoked successfully' });
  } catch (err) {
    console.error('Revoke portal token error:', err);
    res.status(500).json({ error: 'Failed to revoke token' });
  }
});

// GET /portal/:token - Public client portal view (NO AUTH)
router.get('/portal/:token', (req, res) => {
  try {
    const token = req.params.token;

    // Verify token
    const verification = PortalToken.verify(token);

    if (!verification.valid) {
      return res.status(403).json({ 
        error: 'Invalid or expired token',
        reason: verification.reason
      });
    }

    // Update last accessed
    PortalToken.updateAccessed(token);

    const projectId = verification.projectId;

    // Get project info
    const project = Project.findById(projectId);

    // Get scope items with stats
    const scopeItems = ScopeItem.getProjectStats(projectId);

    // Get request stats (not full request details - clients don't need to see everything)
    const requestStats = Request.getProjectStats(projectId);

    // Calculate overall progress
    const itemsWithLimits = scopeItems.filter(item => item.limit_value !== null);
    const avgProgress = itemsWithLimits.length > 0
      ? itemsWithLimits.reduce((sum, item) => sum + (item.percentage || 0), 0) / itemsWithLimits.length
      : 0;

    // Client-friendly view
    res.json({
      project: {
        name: project.project_name,
        client_name: project.client_name,
        description: project.description,
        status: project.status
      },
      scope: {
        items: scopeItems.map(item => ({
          description: item.description,
          limit: item.limit_value,
          used: item.used_count,
          remaining: item.remaining,
          percentage: item.percentage,
          isExceeded: item.is_exceeded,
          isWarning: item.is_warning
        })),
        overallProgress: Math.round(avgProgress)
      },
      activity: {
        totalRequests: requestStats.total,
        inScope: requestStats.in_scope,
        outOfScope: requestStats.out_of_scope
      },
      message: project.status === 'active' 
        ? 'Project is active and on track.'
        : 'Project status updated.'
    });
  } catch (err) {
    console.error('Portal view error:', err);
    res.status(500).json({ error: 'Failed to load portal' });
  }
});

module.exports = router;
