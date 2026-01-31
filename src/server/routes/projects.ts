import express, { Response } from 'express';
import Project from '../models/Project';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/projects - Get all projects for current user
router.get('/', (req: AuthRequest, res: Response): void => {
  try {
    const { status } = req.query;
    const projects = Project.findByUserId(req.user!.id, status as string | null);
    res.json({ projects });
  } catch (err) {
    console.error('Get projects error:', err);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// POST /api/projects - Create new project
router.post('/', (req: AuthRequest, res: Response): void => {
  try {
    const { client_name, project_name, description } = req.body;

    // Validation
    if (!client_name || !project_name) {
      res.status(400).json({ error: 'Client name and project name required' });
      return;
    }

    const project = Project.create({
      user_id: req.user!.id,
      client_name,
      project_name,
      description
    });

    res.status(201).json({ project });
  } catch (err) {
    console.error('Create project error:', err);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// GET /api/projects/:id - Get single project
router.get('/:id', (req: AuthRequest, res: Response): void => {
  try {
    const project = Project.findById(Number(req.params.id));

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    // Check ownership
    if (!Project.belongsToUser(project.id, req.user!.id)) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    // Get overview stats
    const overview = Project.getOverview(project.id);

    res.json({ project, overview });
  } catch (err) {
    console.error('Get project error:', err);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// PUT /api/projects/:id - Update project
router.put('/:id', (req: AuthRequest, res: Response): void => {
  try {
    const project = Project.findById(Number(req.params.id));

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    // Check ownership
    if (!Project.belongsToUser(project.id, req.user!.id)) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const { client_name, project_name, description, status } = req.body;

    const updated = Project.update(Number(req.params.id), {
      client_name,
      project_name,
      description,
      status
    });

    res.json({ project: updated });
  } catch (err) {
    console.error('Update project error:', err);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// DELETE /api/projects/:id - Delete project
router.delete('/:id', (req: AuthRequest, res: Response): void => {
  try {
    const project = Project.findById(Number(req.params.id));

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    // Check ownership
    if (!Project.belongsToUser(project.id, req.user!.id)) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    Project.delete(Number(req.params.id));

    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    console.error('Delete project error:', err);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

export default router;
