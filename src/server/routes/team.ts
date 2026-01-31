import express, { Request, Response, NextFunction } from 'express';
import ProjectMember from '../models/ProjectMember';
import Project from '../models/Project';
import User from '../models/User';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = express.Router({ mergeParams: true });

// All routes require authentication
router.use(authMiddleware);

// Middleware to verify project access
const verifyProjectAccess = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const projectId = req.params.projectId;
  
  if (!ProjectMember.isMember(projectId, req.user.id)) {
    res.status(403).json({ error: 'Access denied' });
  }
  
  next();
};

// Middleware to verify admin permission
const verifyAdminPermission = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const projectId = req.params.projectId;
  
  if (!ProjectMember.hasAdminPermission(projectId, req.user.id)) {
    res.status(403).json({ error: 'Admin permission required' });
  }
  
  next();
};

router.use(verifyProjectAccess);

// GET /api/projects/:projectId/team - Get all team members
router.get('/', (req: AuthRequest, res: Response): void => {
  try {
    const members = ProjectMember.findByProjectId(req.params.projectId);
    const stats = ProjectMember.getProjectStats(req.params.projectId);
    
    res.json({ members, stats });
  } catch (err) {
    console.error('Get team members error:', err);
    res.status(500).json({ error: 'Failed to fetch team members' });
  }
});

// POST /api/projects/:projectId/team - Add team member
router.post('/', verifyAdminPermission, (req: AuthRequest, res: Response): void => {
  try {
    const { email, role } = req.body;

    if (!email) {
      res.status(400).json({ error: 'Email required' });
    }

    // Find user by email
    const user = User.findByEmail(email);
    if (!user) {
      res.status(404).json({ error: 'User not found. They need to create an account first.' });
    }

    // Check if already a member
    if (ProjectMember.isMember(req.params.projectId, user.id)) {
      res.status(400).json({ error: 'User is already a member of this project' });
    }

    const member = ProjectMember.add({
      project_id: req.params.projectId,
      user_id: user.id,
      role: role || 'member',
      invited_by: req.user.id
    });

    res.status(201).json({ member });
  } catch (err) {
    console.error('Add team member error:', err);
    res.status(400).json({ error: err.message || 'Failed to add team member' });
  }
});

// PUT /api/projects/:projectId/team/:memberId - Update member role
router.put('/:memberId', verifyAdminPermission, (req: AuthRequest, res: Response): void => {
  try {
    const { role } = req.body;

    if (!role) {
      res.status(400).json({ error: 'Role required' });
    }

    const member = ProjectMember.findById(req.params.memberId);
    if (!member) {
      res.status(404).json({ error: 'Team member not found' });
    }

    // Prevent removing the last owner
    if (member.role === 'owner' && role !== 'owner') {
      const stats = ProjectMember.getProjectStats(req.params.projectId);
      if (stats.owners <= 1) {
        res.status(400).json({ error: 'Cannot change role of the last owner' });
      }
    }

    const updated = ProjectMember.updateRole(req.params.memberId, role);

    res.json({ member: updated });
  } catch (err) {
    console.error('Update member role error:', err);
    res.status(400).json({ error: err.message || 'Failed to update member role' });
  }
});

// DELETE /api/projects/:projectId/team/:memberId - Remove team member
router.delete('/:memberId', verifyAdminPermission, (req: AuthRequest, res: Response): void => {
  try {
    const member = ProjectMember.findById(req.params.memberId);
    
    if (!member) {
      res.status(404).json({ error: 'Team member not found' });
    }

    // Prevent removing the last owner
    if (member.role === 'owner') {
      const stats = ProjectMember.getProjectStats(req.params.projectId);
      if (stats.owners <= 1) {
        res.status(400).json({ error: 'Cannot remove the last owner' });
      }
    }

    ProjectMember.remove(req.params.memberId);
    
    res.json({ message: 'Team member removed successfully' });
  } catch (err) {
    console.error('Remove team member error:', err);
    res.status(500).json({ error: 'Failed to remove team member' });
  }
});

// GET /api/team/my-projects - Get all projects user is member of
router.get('/my-projects', (req: AuthRequest, res: Response): void => {
  try {
    const projects = ProjectMember.findByUserId(req.user.id);
    
    res.json({ projects });
  } catch (err) {
    console.error('Get my projects error:', err);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

export default router;
