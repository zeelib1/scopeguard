const express = require('express');
const Report = require('../models/Report');
const Project = require('../models/Project');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/reports/weekly - Get weekly digest for user
router.get('/weekly', (req, res) => {
  try {
    const digest = Report.generateWeeklyDigest(req.user.id);
    res.json({ digest });
  } catch (err) {
    console.error('Generate weekly digest error:', err);
    res.status(500).json({ error: 'Failed to generate weekly digest' });
  }
});

// GET /api/reports/project/:projectId - Get project report
router.get('/project/:projectId', (req, res) => {
  try {
    const projectId = req.params.projectId;
    
    // Verify project ownership
    if (!Project.belongsToUser(projectId, req.user.id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const report = Report.generateProjectReport(projectId);
    
    // Check if user wants plain text format
    if (req.query.format === 'text') {
      const textReport = Report.formatReportAsText(report);
      res.type('text/plain');
      res.send(textReport);
    } else {
      res.json({ report });
    }
  } catch (err) {
    console.error('Generate project report error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate project report' });
  }
});

// GET /api/reports/project/:projectId/email - Email project report
router.get('/project/:projectId/email', (req, res) => {
  try {
    const projectId = req.params.projectId;
    
    // Verify project ownership
    if (!Project.belongsToUser(projectId, req.user.id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const report = Report.generateProjectReport(projectId);
    const textReport = Report.formatReportAsText(report);

    // In a real implementation, this would send an email
    // For now, we'll just return the formatted report
    res.json({
      message: 'Report generated (email integration pending)',
      report: textReport,
      suggestion: 'Use format=text query parameter to get plain text version'
    });
  } catch (err) {
    console.error('Email report error:', err);
    res.status(500).json({ error: 'Failed to email report' });
  }
});

module.exports = router;
