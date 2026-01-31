const { query } = require('../../database/db');
const Project = require('./Project');
const TimeEntry = require('./TimeEntry');

class Budget {
  // Get budget overview for a project
  static getProjectBudget(projectId) {
    const project = Project.findById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    // Get total estimated costs from requests
    const requestCosts = query.get(
      `SELECT 
        SUM(estimated_cost) as total_estimated,
        SUM(actual_cost) as total_actual
       FROM requests 
       WHERE project_id = ?`,
      [projectId]
    );

    // Get total change order amounts
    const changeOrderCosts = query.get(
      `SELECT SUM(price) as total_change_orders
       FROM change_orders 
       WHERE project_id = ? AND status = 'approved'`,
      [projectId]
    );

    // Get total time tracked
    const totalTimeSeconds = TimeEntry.getProjectTotalTime(projectId);
    const totalTimeHours = totalTimeSeconds / 3600;

    // Calculate cost from time if hourly rate is set
    let timeCost = 0;
    if (project.hourly_rate) {
      timeCost = totalTimeHours * project.hourly_rate;
    }

    // Calculate totals
    const estimatedCost = (requestCosts.total_estimated || 0);
    const actualCost = (requestCosts.total_actual || 0) + timeCost;
    const changeOrderRevenue = changeOrderCosts.total_change_orders || 0;
    const totalRevenue = (project.budget_amount || 0) + changeOrderRevenue;
    
    // Calculate budget health
    let budgetHealth = 'healthy';
    let budgetPercent = 0;
    
    if (project.budget_amount) {
      budgetPercent = (actualCost / project.budget_amount) * 100;
      
      if (budgetPercent >= 100) {
        budgetHealth = 'exceeded';
      } else if (budgetPercent >= 90) {
        budgetHealth = 'critical';
      } else if (budgetPercent >= 75) {
        budgetHealth = 'warning';
      }
    }

    return {
      project: {
        id: project.id,
        name: project.project_name,
        budgetAmount: project.budget_amount,
        budgetCurrency: project.budget_currency || 'USD',
        hourlyRate: project.hourly_rate
      },
      costs: {
        estimated: Math.round(estimatedCost * 100) / 100,
        actual: Math.round(actualCost * 100) / 100,
        fromTime: Math.round(timeCost * 100) / 100,
        fromRequests: Math.round((requestCosts.total_actual || 0) * 100) / 100
      },
      revenue: {
        baseContract: project.budget_amount || 0,
        changeOrders: Math.round(changeOrderRevenue * 100) / 100,
        total: Math.round(totalRevenue * 100) / 100
      },
      profit: {
        estimated: Math.round((totalRevenue - estimatedCost) * 100) / 100,
        actual: Math.round((totalRevenue - actualCost) * 100) / 100
      },
      time: {
        totalHours: Math.round(totalTimeHours * 10) / 10,
        costPerHour: project.hourly_rate || 0
      },
      health: {
        status: budgetHealth,
        percentUsed: Math.round(budgetPercent * 10) / 10,
        remaining: project.budget_amount ? Math.round((project.budget_amount - actualCost) * 100) / 100 : null
      }
    };
  }

  // Get budget summary for all user projects
  static getUserBudgetSummary(userId) {
    const projects = query.all(
      `SELECT * FROM projects WHERE user_id = ? AND status = 'active'`,
      [userId]
    );

    const summaries = projects.map(project => {
      try {
        const budget = this.getProjectBudget(project.id);
        return {
          projectId: project.id,
          projectName: project.project_name,
          clientName: project.client_name,
          budgetAmount: project.budget_amount,
          actualCost: budget.costs.actual,
          revenue: budget.revenue.total,
          profit: budget.profit.actual,
          health: budget.health.status
        };
      } catch (err) {
        console.error(`Error getting budget for project ${project.id}:`, err);
        return null;
      }
    }).filter(Boolean);

    // Calculate totals
    const totals = {
      totalBudget: summaries.reduce((sum, p) => sum + (p.budgetAmount || 0), 0),
      totalActualCost: summaries.reduce((sum, p) => sum + (p.actualCost || 0), 0),
      totalRevenue: summaries.reduce((sum, p) => sum + (p.revenue || 0), 0),
      totalProfit: summaries.reduce((sum, p) => sum + (p.profit || 0), 0)
    };

    return {
      projects: summaries,
      totals: {
        budget: Math.round(totals.totalBudget * 100) / 100,
        actualCost: Math.round(totals.totalActualCost * 100) / 100,
        revenue: Math.round(totals.totalRevenue * 100) / 100,
        profit: Math.round(totals.totalProfit * 100) / 100
      }
    };
  }

  // Update project budget settings
  static updateProjectBudget(projectId, { budget_amount, budget_currency, hourly_rate }) {
    const updates = [];
    const values = [];

    if (budget_amount !== undefined) {
      updates.push('budget_amount = ?');
      values.push(budget_amount);
    }
    if (budget_currency !== undefined) {
      updates.push('budget_currency = ?');
      values.push(budget_currency);
    }
    if (hourly_rate !== undefined) {
      updates.push('hourly_rate = ?');
      values.push(hourly_rate);
    }

    if (updates.length === 0) {
      return Project.findById(projectId);
    }

    values.push(projectId);

    query.run(
      `UPDATE projects SET ${updates.join(', ')}, updated_at = ? WHERE id = ?`,
      [...values.slice(0, -1), Math.floor(Date.now() / 1000), values[values.length - 1]]
    );

    return Project.findById(projectId);
  }
}

module.exports = Budget;
