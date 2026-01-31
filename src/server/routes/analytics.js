const express = require('express');
const { query } = require('../../database/db');
const Project = require('../models/Project');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/analytics/overview - Overall user analytics
router.get('/overview', (req, res) => {
  try {
    const userId = req.user.id;

    // Total projects
    const totalProjects = query.get(
      `SELECT COUNT(*) as count FROM projects WHERE user_id = ?`,
      [userId]
    ).count;

    // Active projects
    const activeProjects = query.get(
      `SELECT COUNT(*) as count FROM projects WHERE user_id = ? AND status = 'active'`,
      [userId]
    ).count;

    // Total scope items
    const totalScopeItems = query.get(
      `SELECT COUNT(*) as count FROM scope_items si
       JOIN projects p ON si.project_id = p.id
       WHERE p.user_id = ?`,
      [userId]
    ).count;

    // Total requests
    const requestStats = query.get(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN r.status = 'in-scope' THEN 1 ELSE 0 END) as in_scope,
        SUM(CASE WHEN r.status = 'out-of-scope' THEN 1 ELSE 0 END) as out_of_scope
       FROM requests r
       JOIN projects p ON r.project_id = p.id
       WHERE p.user_id = ?`,
      [userId]
    );

    // Change orders revenue
    const revenueStats = query.get(
      `SELECT 
        COUNT(*) as total_orders,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_orders,
        SUM(CASE WHEN status = 'approved' THEN price ELSE 0 END) as approved_revenue,
        SUM(price) as potential_revenue
       FROM change_orders co
       JOIN projects p ON co.project_id = p.id
       WHERE p.user_id = ?`,
      [userId]
    );

    // Scope creep rate (out-of-scope / total requests)
    const scopeCreepRate = requestStats.total > 0
      ? Math.round((requestStats.out_of_scope / requestStats.total) * 100)
      : 0;

    res.json({
      projects: {
        total: totalProjects,
        active: activeProjects,
        completed: totalProjects - activeProjects
      },
      scope: {
        totalItems: totalScopeItems
      },
      requests: {
        total: requestStats.total,
        inScope: requestStats.in_scope,
        outOfScope: requestStats.out_of_scope,
        scopeCreepRate: `${scopeCreepRate}%`
      },
      revenue: {
        totalChangeOrders: revenueStats.total_orders || 0,
        approvedOrders: revenueStats.approved_orders || 0,
        approvedRevenue: revenueStats.approved_revenue || 0,
        potentialRevenue: revenueStats.potential_revenue || 0,
        savedFromTracking: revenueStats.approved_revenue || 0
      }
    });
  } catch (err) {
    console.error('Get analytics overview error:', err);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// GET /api/analytics/clients - Client-level analytics
router.get('/clients', (req, res) => {
  try {
    const userId = req.user.id;

    // Scope creep by client
    const clientStats = query.all(
      `SELECT 
        p.client_name,
        COUNT(DISTINCT p.id) as project_count,
        COUNT(r.id) as total_requests,
        SUM(CASE WHEN r.status = 'out-of-scope' THEN 1 ELSE 0 END) as out_of_scope_requests,
        ROUND(CAST(SUM(CASE WHEN r.status = 'out-of-scope' THEN 1 ELSE 0 END) AS FLOAT) / COUNT(r.id) * 100, 1) as scope_creep_rate,
        SUM(CASE WHEN co.status = 'approved' THEN co.price ELSE 0 END) as revenue_from_overages
       FROM projects p
       LEFT JOIN requests r ON p.id = r.project_id
       LEFT JOIN change_orders co ON p.id = co.project_id
       WHERE p.user_id = ?
       GROUP BY p.client_name
       ORDER BY scope_creep_rate DESC`,
      [userId]
    );

    res.json({ clients: clientStats });
  } catch (err) {
    console.error('Get client analytics error:', err);
    res.status(500).json({ error: 'Failed to fetch client analytics' });
  }
});

// GET /api/analytics/trends - Trend data over time
router.get('/trends', (req, res) => {
  try {
    const userId = req.user.id;
    const { period = '30' } = req.query; // days

    const daysAgo = parseInt(period);
    const cutoffTimestamp = Math.floor(Date.now() / 1000) - (daysAgo * 24 * 60 * 60);

    // Requests over time (grouped by day)
    const requestTrends = query.all(
      `SELECT 
        DATE(requested_at, 'unixepoch') as date,
        COUNT(*) as total,
        SUM(CASE WHEN status = 'in-scope' THEN 1 ELSE 0 END) as in_scope,
        SUM(CASE WHEN status = 'out-of-scope' THEN 1 ELSE 0 END) as out_of_scope
       FROM requests r
       JOIN projects p ON r.project_id = p.id
       WHERE p.user_id = ? AND r.requested_at > ?
       GROUP BY DATE(requested_at, 'unixepoch')
       ORDER BY date ASC`,
      [userId, cutoffTimestamp]
    );

    // Change orders over time
    const revenueTrends = query.all(
      `SELECT 
        DATE(created_at, 'unixepoch') as date,
        COUNT(*) as orders,
        SUM(price) as revenue
       FROM change_orders co
       JOIN projects p ON co.project_id = p.id
       WHERE p.user_id = ? AND co.created_at > ?
       GROUP BY DATE(created_at, 'unixepoch')
       ORDER BY date ASC`,
      [userId, cutoffTimestamp]
    );

    res.json({
      period: `${daysAgo} days`,
      requests: requestTrends,
      revenue: revenueTrends
    });
  } catch (err) {
    console.error('Get trend analytics error:', err);
    res.status(500).json({ error: 'Failed to fetch trends' });
  }
});

// GET /api/analytics/scope-health - Scope health across all projects
router.get('/scope-health', (req, res) => {
  try {
    const userId = req.user.id;

    // Projects with exceeded scope
    const exceededProjects = query.all(
      `SELECT 
        p.project_name,
        p.client_name,
        si.description,
        si.limit_value,
        si.used_count,
        (si.used_count - si.limit_value) as overage
       FROM scope_items si
       JOIN projects p ON si.project_id = p.id
       WHERE p.user_id = ? AND si.limit_value IS NOT NULL AND si.used_count > si.limit_value
       ORDER BY overage DESC`,
      [userId]
    );

    // Projects at risk (>80% usage)
    const atRiskProjects = query.all(
      `SELECT 
        p.project_name,
        p.client_name,
        si.description,
        si.limit_value,
        si.used_count,
        ROUND(CAST(si.used_count AS FLOAT) / si.limit_value * 100, 1) as percentage
       FROM scope_items si
       JOIN projects p ON si.project_id = p.id
       WHERE p.user_id = ? 
         AND si.limit_value IS NOT NULL 
         AND CAST(si.used_count AS FLOAT) / si.limit_value >= 0.8
         AND si.used_count <= si.limit_value
       ORDER BY percentage DESC`,
      [userId]
    );

    res.json({
      exceeded: exceededProjects,
      atRisk: atRiskProjects,
      summary: {
        exceededCount: exceededProjects.length,
        atRiskCount: atRiskProjects.length
      }
    });
  } catch (err) {
    console.error('Get scope health error:', err);
    res.status(500).json({ error: 'Failed to fetch scope health' });
  }
});

module.exports = router;
