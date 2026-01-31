const { query } = require('../../database/db');
const ScopeItem = require('./ScopeItem');
const Request = require('./Request');
const TimeEntry = require('./TimeEntry');
const CommunicationLog = require('./CommunicationLog');
const Project = require('./Project');

class Report {
  // Generate comprehensive project report
  static generateProjectReport(projectId) {
    const project = Project.findById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    // Get scope items with usage
    const scopeItems = ScopeItem.findByProjectId(projectId);
    
    // Get request statistics
    const requestStats = Request.getProjectStats(projectId);
    
    // Get time tracking totals
    const totalTimeSeconds = TimeEntry.getProjectTotalTime(projectId);
    
    // Get communication statistics
    const communicationStats = CommunicationLog.getProjectStats(projectId);

    // Calculate scope health metrics
    const scopeHealth = this.calculateScopeHealth(scopeItems);
    
    // Get at-risk items (>80% usage)
    const atRiskItems = scopeItems.filter(item => {
      if (!item.limit_value) return false;
      const usagePercent = (item.used_count / item.limit_value) * 100;
      return usagePercent >= 80 && usagePercent < 100;
    });

    // Get exceeded items
    const exceededItems = scopeItems.filter(item => {
      if (!item.limit_value) return false;
      return item.used_count >= item.limit_value;
    });

    // Get recent out-of-scope requests
    const outOfScopeRequests = query.all(
      `SELECT * FROM requests 
       WHERE project_id = ? AND status = 'out-of-scope'
       ORDER BY requested_at DESC
       LIMIT 10`,
      [projectId]
    );

    return {
      project: {
        id: project.id,
        name: project.project_name,
        client: project.client_name,
        status: project.status
      },
      summary: {
        totalScopeItems: scopeItems.length,
        atRiskItems: atRiskItems.length,
        exceededItems: exceededItems.length,
        totalRequests: requestStats.total,
        inScopeRequests: requestStats.in_scope,
        outOfScopeRequests: requestStats.out_of_scope,
        pendingRequests: requestStats.pending,
        totalTimeHours: Math.round((totalTimeSeconds / 3600) * 10) / 10,
        totalCommunications: communicationStats.total
      },
      scopeHealth,
      atRiskItems,
      exceededItems,
      outOfScopeRequests,
      requestStats,
      communicationStats,
      generatedAt: Math.floor(Date.now() / 1000)
    };
  }

  // Calculate overall scope health score
  static calculateScopeHealth(scopeItems) {
    if (scopeItems.length === 0) {
      return {
        score: 100,
        status: 'healthy',
        message: 'No scope items defined'
      };
    }

    let totalScore = 0;
    let itemsWithLimits = 0;

    for (const item of scopeItems) {
      if (!item.limit_value) continue;
      
      itemsWithLimits++;
      const usagePercent = (item.used_count / item.limit_value) * 100;
      
      // Score calculation: 100 for 0% usage, decreasing as usage increases
      let itemScore = 100;
      if (usagePercent >= 100) {
        itemScore = 0; // Exceeded
      } else if (usagePercent >= 80) {
        itemScore = 30; // At risk
      } else if (usagePercent >= 60) {
        itemScore = 60; // Warning
      } else {
        itemScore = 100; // Healthy
      }
      
      totalScore += itemScore;
    }

    if (itemsWithLimits === 0) {
      return {
        score: 100,
        status: 'healthy',
        message: 'No limited scope items'
      };
    }

    const avgScore = Math.round(totalScore / itemsWithLimits);
    
    let status, message;
    if (avgScore >= 80) {
      status = 'healthy';
      message = 'Project scope is well managed';
    } else if (avgScore >= 60) {
      status = 'warning';
      message = 'Some scope items need attention';
    } else if (avgScore >= 30) {
      status = 'at-risk';
      message = 'Multiple scope items approaching limits';
    } else {
      status = 'critical';
      message = 'Scope limits exceeded - action required';
    }

    return { score: avgScore, status, message };
  }

  // Generate weekly digest report
  static generateWeeklyDigest(userId) {
    const oneWeekAgo = Math.floor(Date.now() / 1000) - (7 * 24 * 60 * 60);
    
    // Get all active projects for user
    const projects = query.all(
      `SELECT * FROM projects WHERE user_id = ? AND status = 'active'`,
      [userId]
    );

    const digest = {
      period: {
        start: oneWeekAgo,
        end: Math.floor(Date.now() / 1000)
      },
      projects: [],
      totals: {
        newRequests: 0,
        outOfScopeRequests: 0,
        changeOrders: 0,
        totalTimeHours: 0
      }
    };

    for (const project of projects) {
      // Get new requests this week
      const newRequests = query.all(
        `SELECT COUNT(*) as count FROM requests 
         WHERE project_id = ? AND requested_at >= ?`,
        [project.id, oneWeekAgo]
      )[0].count;

      // Get out-of-scope requests this week
      const outOfScope = query.all(
        `SELECT COUNT(*) as count FROM requests 
         WHERE project_id = ? AND status = 'out-of-scope' AND requested_at >= ?`,
        [project.id, oneWeekAgo]
      )[0].count;

      // Get change orders created this week
      const changeOrders = query.all(
        `SELECT COUNT(*) as count FROM change_orders 
         WHERE project_id = ? AND created_at >= ?`,
        [project.id, oneWeekAgo]
      )[0].count;

      // Get time tracked this week
      const timeResult = query.get(
        `SELECT SUM(te.duration_seconds) as total_seconds
         FROM time_entries te
         JOIN requests r ON te.request_id = r.id
         WHERE r.project_id = ? AND te.started_at >= ?`,
        [project.id, oneWeekAgo]
      );
      const timeHours = Math.round(((timeResult.total_seconds || 0) / 3600) * 10) / 10;

      digest.projects.push({
        name: project.project_name,
        client: project.client_name,
        newRequests,
        outOfScope,
        changeOrders,
        timeHours
      });

      digest.totals.newRequests += newRequests;
      digest.totals.outOfScopeRequests += outOfScope;
      digest.totals.changeOrders += changeOrders;
      digest.totals.totalTimeHours += timeHours;
    }

    digest.generatedAt = Math.floor(Date.now() / 1000);

    return digest;
  }

  // Format report as plain text
  static formatReportAsText(report) {
    let text = `SCOPEGUARD PROJECT REPORT\n`;
    text += `═══════════════════════════════════════\n\n`;
    text += `Project: ${report.project.name}\n`;
    text += `Client: ${report.project.client}\n`;
    text += `Generated: ${new Date(report.generatedAt * 1000).toLocaleString()}\n\n`;

    text += `SUMMARY\n`;
    text += `───────────────────────────────────────\n`;
    text += `Scope Health: ${report.scopeHealth.score}/100 (${report.scopeHealth.status.toUpperCase()})\n`;
    text += `${report.scopeHealth.message}\n\n`;
    text += `Total Scope Items: ${report.summary.totalScopeItems}\n`;
    text += `  • At Risk (>80%): ${report.summary.atRiskItems}\n`;
    text += `  • Exceeded: ${report.summary.exceededItems}\n\n`;
    text += `Requests: ${report.summary.totalRequests} total\n`;
    text += `  • In Scope: ${report.summary.inScopeRequests}\n`;
    text += `  • Out of Scope: ${report.summary.outOfScopeRequests}\n`;
    text += `  • Pending Review: ${report.summary.pendingRequests}\n\n`;
    text += `Time Tracked: ${report.summary.totalTimeHours} hours\n`;
    text += `Communications: ${report.summary.totalCommunications}\n\n`;

    if (report.exceededItems.length > 0) {
      text += `⚠️  EXCEEDED SCOPE ITEMS\n`;
      text += `───────────────────────────────────────\n`;
      report.exceededItems.forEach(item => {
        text += `• ${item.description}: ${item.used_count}/${item.limit_value} ${item.limit_type}\n`;
      });
      text += `\n`;
    }

    if (report.atRiskItems.length > 0) {
      text += `⚡ AT-RISK ITEMS (>80% used)\n`;
      text += `───────────────────────────────────────\n`;
      report.atRiskItems.forEach(item => {
        const percent = Math.round((item.used_count / item.limit_value) * 100);
        text += `• ${item.description}: ${item.used_count}/${item.limit_value} (${percent}%)\n`;
      });
      text += `\n`;
    }

    if (report.outOfScopeRequests.length > 0) {
      text += `💰 OUT-OF-SCOPE REQUESTS (Change Order Opportunities)\n`;
      text += `───────────────────────────────────────\n`;
      report.outOfScopeRequests.slice(0, 5).forEach(req => {
        const date = new Date(req.requested_at * 1000).toLocaleDateString();
        text += `• ${date}: ${req.description}\n`;
      });
      if (report.outOfScopeRequests.length > 5) {
        text += `... and ${report.outOfScopeRequests.length - 5} more\n`;
      }
      text += `\n`;
    }

    return text;
  }
}

module.exports = Report;
