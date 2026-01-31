import express, { Request, Response, NextFunction } from 'express';
import Webhook from '../models/Webhook';
import Project from '../models/Project';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/webhooks - Get all webhooks for user
router.get('/', (req: AuthRequest, res: Response): void => {
  try {
    const { project_id } = req.query;
    
    const webhooks = Webhook.findByUserId(
      req.user.id, 
      project_id ? parseInt(project_id) : null
    );
    
    res.json({ webhooks });
  } catch (err) {
    console.error('Get webhooks error:', err);
    res.status(500).json({ error: 'Failed to fetch webhooks' });
  }
});

// GET /api/webhooks/events - Get supported events
router.get('/events', (req: AuthRequest, res: Response): void => {
  try {
    const events = Webhook.getSupportedEvents();
    
    res.json({ 
      events: events.map(e => ({
        name: e,
        description: getEventDescription(e)
      }))
    });
  } catch (err) {
    console.error('Get events error:', err);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// POST /api/webhooks - Create new webhook
router.post('/', (req: AuthRequest, res: Response): void => {
  try {
    const { project_id, url, secret, events } = req.body;

    if (!url) {
      res.status(400).json({ error: 'URL required' });
    }

    if (!events || !Array.isArray(events) || events.length === 0) {
      res.status(400).json({ error: 'Events array required' });
    }

    // Verify project ownership if project_id provided
    if (project_id && !Project.belongsToUser(project_id, req.user.id)) {
      res.status(403).json({ error: 'Access denied' });
    }

    const webhook = Webhook.create({
      user_id: req.user.id,
      project_id: project_id || null,
      url,
      secret,
      events
    });

    res.status(201).json({ webhook });
  } catch (err) {
    console.error('Create webhook error:', err);
    res.status(400).json({ error: err.message || 'Failed to create webhook' });
  }
});

// GET /api/webhooks/:id - Get single webhook
router.get('/:id', (req: AuthRequest, res: Response): void => {
  try {
    const webhook = Webhook.findById(req.params.id);
    
    if (!webhook) {
      res.status(404).json({ error: 'Webhook not found' });
    }

    // Verify ownership
    if (webhook.user_id !== req.user.id) {
      res.status(403).json({ error: 'Access denied' });
    }

    res.json({ webhook });
  } catch (err) {
    console.error('Get webhook error:', err);
    res.status(500).json({ error: 'Failed to fetch webhook' });
  }
});

// PUT /api/webhooks/:id - Update webhook
router.put('/:id', (req: AuthRequest, res: Response): void => {
  try {
    const webhook = Webhook.findById(req.params.id);
    
    if (!webhook) {
      res.status(404).json({ error: 'Webhook not found' });
    }

    // Verify ownership
    if (webhook.user_id !== req.user.id) {
      res.status(403).json({ error: 'Access denied' });
    }

    const { url, secret, events, status } = req.body;

    const updated = Webhook.update(req.params.id, {
      url,
      secret,
      events,
      status
    });

    res.json({ webhook: updated });
  } catch (err) {
    console.error('Update webhook error:', err);
    res.status(400).json({ error: err.message || 'Failed to update webhook' });
  }
});

// DELETE /api/webhooks/:id - Delete webhook
router.delete('/:id', (req: AuthRequest, res: Response): void => {
  try {
    const webhook = Webhook.findById(req.params.id);
    
    if (!webhook) {
      res.status(404).json({ error: 'Webhook not found' });
    }

    // Verify ownership
    if (webhook.user_id !== req.user.id) {
      res.status(403).json({ error: 'Access denied' });
    }

    Webhook.delete(req.params.id);
    
    res.json({ message: 'Webhook deleted successfully' });
  } catch (err) {
    console.error('Delete webhook error:', err);
    res.status(500).json({ error: 'Failed to delete webhook' });
  }
});

// GET /api/webhooks/:id/deliveries - Get delivery history
router.get('/:id/deliveries', (req: AuthRequest, res: Response): void => {
  try {
    const webhook = Webhook.findById(req.params.id);
    
    if (!webhook) {
      res.status(404).json({ error: 'Webhook not found' });
    }

    // Verify ownership
    if (webhook.user_id !== req.user.id) {
      res.status(403).json({ error: 'Access denied' });
    }

    const limit = parseInt(req.query.limit) || 50;
    const deliveries = Webhook.getDeliveries(req.params.id, limit);

    res.json({ deliveries });
  } catch (err) {
    console.error('Get deliveries error:', err);
    res.status(500).json({ error: 'Failed to fetch deliveries' });
  }
});

// POST /api/webhooks/:id/test - Test webhook
router.post('/:id/test', async (req: AuthRequest, res: Response): void => {
  try {
    const webhook = Webhook.findById(req.params.id);
    
    if (!webhook) {
      res.status(404).json({ error: 'Webhook not found' });
    }

    // Verify ownership
    if (webhook.user_id !== req.user.id) {
      res.status(403).json({ error: 'Access denied' });
    }

    const testPayload = {
      message: 'This is a test webhook from ScopeGuard',
      webhook_id: webhook.id,
      timestamp: new Date().toISOString()
    };

    const result = await Webhook.deliver(webhook.id, 'webhook.test', testPayload);

    res.json({ 
      message: 'Test webhook delivered',
      result 
    });
  } catch (err) {
    console.error('Test webhook error:', err);
    res.status(500).json({ 
      error: 'Webhook delivery failed',
      details: err.message 
    });
  }
});

// Helper function to get event descriptions
function getEventDescription(eventName) {
  const descriptions = {
    'request.created': 'Triggered when a new request is created',
    'request.categorized': 'Triggered when a request is categorized as in-scope or out-of-scope',
    'request.status_changed': 'Triggered when a request status changes',
    'scope_item.warning': 'Triggered when a scope item reaches 80% usage',
    'scope_item.exceeded': 'Triggered when a scope item exceeds its limit',
    'change_order.created': 'Triggered when a change order is created',
    'change_order.approved': 'Triggered when a change order is approved',
    'change_order.rejected': 'Triggered when a change order is rejected',
    'project.created': 'Triggered when a new project is created',
    'project.updated': 'Triggered when a project is updated',
    'budget.warning': 'Triggered when budget reaches 80% of allocated amount',
    'budget.exceeded': 'Triggered when budget exceeds allocated amount'
  };
  
  return descriptions[eventName] || 'No description available';
}

export default router;
