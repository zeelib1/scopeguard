const express = require('express');
const Project = require('../models/Project');
const ScopeItem = require('../models/ScopeItem');
const Request = require('../models/Request');
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

// GET /api/projects/:projectId/status - Complete project status dashboard
router.get('/', (req, res) => {
  try {
    const projectId = req.params.projectId;

    // Get project info
    const project = Project.findById(projectId);
    const projectOverview = Project.getOverview(projectId);

    // Get scope items with usage stats
    const scopeItems = ScopeItem.getProjectStats(projectId);

    // Get request statistics
    const requestStats = Request.getProjectStats(projectId);

    // Get recent requests (last 10)
    const recentRequests = Request.findByProjectId(projectId).slice(0, 10);

    // Calculate warnings and alerts
    const warnings = [];
    const exceeded = [];

    scopeItems.forEach(item => {
      if (item.is_exceeded) {
        exceeded.push({
          scope_item_id: item.id,
          description: item.description,
          limit: item.limit_value,
          used: item.used_count,
          overage: item.used_count - item.limit_value
        });
      } else if (item.is_warning && !item.is_exceeded) {
        warnings.push({
          scope_item_id: item.id,
          description: item.description,
          limit: item.limit_value,
          used: item.used_count,
          remaining: item.remaining,
          percentage: item.percentage
        });
      }
    });

    // Calculate scope health score (0-100)
    let healthScore = 100;
    
    if (scopeItems.length > 0) {
      const avgUsage = scopeItems
        .filter(item => item.percentage !== null)
        .reduce((sum, item) => sum + item.percentage, 0) / scopeItems.length;
      
      healthScore = Math.max(0, 100 - avgUsage);
    }

    // Determine overall status
    let overallStatus = 'healthy'; // healthy, warning, critical
    
    if (exceeded.length > 0) {
      overallStatus = 'critical';
    } else if (warnings.length > 0 || requestStats.out_of_scope > 0) {
      overallStatus = 'warning';
    }

    // Response
    res.json({
      project: {
        ...project,
        overview: projectOverview
      },
      status: {
        overall: overallStatus,
        healthScore: Math.round(healthScore),
        warnings: warnings.length,
        exceeded: exceeded.length,
        outOfScopeRequests: requestStats.out_of_scope
      },
      scopeItems,
      requests: {
        stats: requestStats,
        recent: recentRequests
      },
      alerts: {
        warnings,
        exceeded
      }
    });
  } catch (err) {
    console.error('Get status error:', err);
    res.status(500).json({ error: 'Failed to fetch project status' });
  }
});

module.exports = router;
