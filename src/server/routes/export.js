const express = require('express');
const Project = require('../models/Project');
const ScopeItem = require('../models/ScopeItem');
const Request = require('../models/Request');
const ChangeOrder = require('../models/ChangeOrder');
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

// GET /api/projects/:projectId/export/markdown - Export project report as Markdown
router.get('/markdown', (req, res) => {
  try {
    const projectId = req.params.projectId;

    // Get project info
    const project = Project.findById(projectId);
    const overview = Project.getOverview(projectId);

    // Get scope items with stats
    const scopeItems = ScopeItem.getProjectStats(projectId);

    // Get all requests
    const requests = Request.findByProjectId(projectId);
    const requestStats = Request.getProjectStats(projectId);

    // Get change orders
    const changeOrders = ChangeOrder.findByProjectId(projectId);
    const coStats = ChangeOrder.getProjectStats(projectId);

    // Generate Markdown report
    const report = `# ScopeGuard Project Report

## Project Information

- **Project Name:** ${project.project_name}
- **Client:** ${project.client_name}
- **Status:** ${project.status}
- **Description:** ${project.description || 'N/A'}
- **Created:** ${new Date(project.created_at * 1000).toLocaleDateString()}
- **Last Updated:** ${new Date(project.updated_at * 1000).toLocaleDateString()}

---

## Executive Summary

- **Total Scope Items:** ${scopeItems.length}
- **Total Requests Logged:** ${requestStats.total}
- **In-Scope Requests:** ${requestStats.in_scope}
- **Out-of-Scope Requests:** ${requestStats.out_of_scope} ${requestStats.total > 0 ? `(${Math.round(requestStats.out_of_scope / requestStats.total * 100)}%)` : ''}
- **Change Orders Generated:** ${coStats.total}
- **Approved Revenue from Overages:** $${(coStats.approved_revenue || 0).toFixed(2)}
- **Potential Revenue:** $${(coStats.total_potential_revenue || 0).toFixed(2)}

---

## Scope Items

${scopeItems.map((item, i) => {
  const status = item.is_exceeded ? '🔴 EXCEEDED' : item.is_warning ? '🟡 WARNING' : '🟢 OK';
  return `
### ${i + 1}. ${item.description}

- **Limit:** ${item.limit_value || 'Unlimited'} ${item.limit_type || ''}
- **Used:** ${item.used_count}
- **Remaining:** ${item.remaining !== null ? item.remaining : 'N/A'}
- **Usage:** ${item.percentage !== null ? item.percentage + '%' : 'N/A'}
- **Status:** ${status}
`;
}).join('\n')}

---

## Requests Log

${requests.length > 0 ? requests.map((req, i) => {
  const statusIcon = req.status === 'in-scope' ? '✅' : req.status === 'out-of-scope' ? '❌' : '⏳';
  return `
### ${i + 1}. ${req.description}

- **Status:** ${statusIcon} ${req.status}
- **Source:** ${req.source || 'N/A'}
- **Requested:** ${new Date(req.requested_at * 1000).toLocaleDateString()}
${req.scope_item_description ? `- **Linked to:** ${req.scope_item_description}` : ''}
${req.notes ? `- **Notes:** ${req.notes}` : ''}
`;
}).join('\n') : '*(No requests logged yet)*'}

---

## Change Orders

${changeOrders.length > 0 ? changeOrders.map((co, i) => {
  const statusIcon = co.status === 'approved' ? '✅' : co.status === 'rejected' ? '❌' : '⏳';
  return `
### ${i + 1}. ${co.title}

- **Status:** ${statusIcon} ${co.status}
- **Price:** $${co.price.toFixed(2)}
- **Created:** ${new Date(co.created_at * 1000).toLocaleDateString()}
${co.approved_at ? `- **Approved:** ${new Date(co.approved_at * 1000).toLocaleDateString()}` : ''}
${co.description ? `\n**Description:**\n${co.description}` : ''}
${co.requests && co.requests.length > 0 ? `\n**Linked Requests:** ${co.requests.length}` : ''}
`;
}).join('\n') : '*(No change orders yet)*'}

---

## Scope Health Analysis

**Overall Assessment:** ${scopeItems.some(i => i.is_exceeded) ? '⚠️ CRITICAL - Scope exceeded' : scopeItems.some(i => i.is_warning) ? '⚠️ WARNING - Approaching limits' : '✅ HEALTHY - Within scope'}

**Exceeded Items:** ${scopeItems.filter(i => i.is_exceeded).length}  
**At-Risk Items (>80%):** ${scopeItems.filter(i => i.is_warning && !i.is_exceeded).length}  
**Safe Items:** ${scopeItems.filter(i => !i.is_warning && !i.is_exceeded).length}

---

## Revenue Impact

- **Change Orders Submitted:** ${coStats.total || 0}
- **Approved Orders:** ${coStats.approved || 0}
- **Pending Approval:** ${coStats.pending || 0}
- **Rejected:** ${coStats.rejected || 0}
- **Revenue Captured:** $${(coStats.approved_revenue || 0).toFixed(2)}
- **Potential Additional Revenue:** $${((coStats.total_potential_revenue || 0) - (coStats.approved_revenue || 0)).toFixed(2)}

---

*Report generated by ScopeGuard on ${new Date().toLocaleString()}*  
*Project ID: ${project.id}*
`;

    // Set headers for download
    res.setHeader('Content-Type', 'text/markdown');
    res.setHeader('Content-Disposition', `attachment; filename="${project.project_name.replace(/\s+/g, '_')}_report.md"`);
    
    res.send(report);
  } catch (err) {
    console.error('Export markdown error:', err);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

// GET /api/projects/:projectId/export/csv - Export requests as CSV
router.get('/csv', (req, res) => {
  try {
    const projectId = req.params.projectId;
    const requests = Request.findByProjectId(projectId);

    // Generate CSV
    const csv = [
      // Header
      'Date,Description,Source,Status,Scope Item,Notes',
      // Rows
      ...requests.map(req => {
        const date = new Date(req.requested_at * 1000).toLocaleDateString();
        const desc = `"${req.description.replace(/"/g, '""')}"`;
        const source = req.source || '';
        const status = req.status;
        const scopeItem = req.scope_item_description ? `"${req.scope_item_description.replace(/"/g, '""')}"` : '';
        const notes = req.notes ? `"${req.notes.replace(/"/g, '""')}"` : '';
        
        return `${date},${desc},${source},${status},${scopeItem},${notes}`;
      })
    ].join('\n');

    const project = Project.findById(projectId);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${project.project_name.replace(/\s+/g, '_')}_requests.csv"`);
    
    res.send(csv);
  } catch (err) {
    console.error('Export CSV error:', err);
    res.status(500).json({ error: 'Failed to generate CSV' });
  }
});

module.exports = router;
