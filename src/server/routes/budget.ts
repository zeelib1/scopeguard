import express, { Request, Response, NextFunction } from 'express';
import Budget from '../models/Budget';
import Project from '../models/Project';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/budget/summary - Get budget summary for all user projects
router.get('/summary', (req: AuthRequest, res: Response): void => {
  try {
    const summary = Budget.getUserBudgetSummary(req.user.id);
    res.json(summary);
  } catch (err) {
    console.error('Get budget summary error:', err);
    res.status(500).json({ error: 'Failed to get budget summary' });
  }
});

// GET /api/budget/project/:projectId - Get budget for specific project
router.get('/project/:projectId', (req: AuthRequest, res: Response): void => {
  try {
    const projectId = req.params.projectId;
    
    // Verify project ownership
    if (!Project.belongsToUser(projectId, req.user.id)) {
      res.status(403).json({ error: 'Access denied' });
    }

    const budget = Budget.getProjectBudget(projectId);
    res.json(budget);
  } catch (err) {
    console.error('Get project budget error:', err);
    res.status(500).json({ error: err.message || 'Failed to get project budget' });
  }
});

// PUT /api/budget/project/:projectId - Update project budget settings
router.put('/project/:projectId', (req: AuthRequest, res: Response): void => {
  try {
    const projectId = req.params.projectId;
    
    // Verify project ownership
    if (!Project.belongsToUser(projectId, req.user.id)) {
      res.status(403).json({ error: 'Access denied' });
    }

    const { budget_amount, budget_currency, hourly_rate } = req.body;

    const updated = Budget.updateProjectBudget(projectId, {
      budget_amount,
      budget_currency,
      hourly_rate
    });

    res.json({ project: updated });
  } catch (err) {
    console.error('Update project budget error:', err);
    res.status(500).json({ error: 'Failed to update project budget' });
  }
});

export default router;
