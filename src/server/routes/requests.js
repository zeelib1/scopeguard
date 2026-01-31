const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Request = require('../models/Request');
const Attachment = require('../models/Attachment');
const TimeEntry = require('../models/TimeEntry');
const Project = require('../models/Project');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../../uploads/attachments');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common file types
    const allowedMimes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed: images, PDFs, Word, Excel, text files'));
    }
  }
});

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

// GET /api/projects/:projectId/requests - Get all requests for project
router.get('/', (req, res) => {
  try {
    const { status } = req.query;
    const requests = Request.findByProjectId(req.params.projectId, status);
    const stats = Request.getProjectStats(req.params.projectId);
    
    res.json({ requests, stats });
  } catch (err) {
    console.error('Get requests error:', err);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

// POST /api/projects/:projectId/requests - Create new request
router.post('/', upload.array('attachments', 5), (req, res) => {
  try {
    const { description, source, status, priority, scope_item_id, notes } = req.body;

    if (!description) {
      return res.status(400).json({ error: 'Description required' });
    }

    const request = Request.create({
      project_id: req.params.projectId,
      description,
      source,
      status: status || 'pending',
      priority: priority || 'medium',
      scope_item_id,
      notes
    });

    // Handle file attachments if present
    const attachments = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const attachment = Attachment.create({
          request_id: request.id,
          filename: file.filename,
          original_filename: file.originalname,
          mime_type: file.mimetype,
          file_size: file.size,
          file_path: file.path
        });
        attachments.push(attachment);
      }
    }

    res.status(201).json({ request, attachments });
  } catch (err) {
    console.error('Create request error:', err);
    res.status(500).json({ error: err.message || 'Failed to create request' });
  }
});

// GET /api/projects/:projectId/requests/:id - Get single request
router.get('/:id', (req, res) => {
  try {
    const request = Request.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Include attachments and time tracking
    const attachments = Attachment.findByRequestId(req.params.id);
    const timeEntries = TimeEntry.findByRequestId(req.params.id);
    const totalTimeSeconds = TimeEntry.getTotalTime(req.params.id);

    res.json({ request, attachments, timeEntries, totalTimeSeconds });
  } catch (err) {
    console.error('Get request error:', err);
    res.status(500).json({ error: 'Failed to fetch request' });
  }
});

// PUT /api/projects/:projectId/requests/:id - Update request
router.put('/:id', (req, res) => {
  try {
    const request = Request.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    const { description, source, status, priority, scope_item_id, notes } = req.body;

    const updated = Request.update(req.params.id, {
      description,
      source,
      status,
      priority,
      scope_item_id,
      notes
    });

    res.json({ request: updated });
  } catch (err) {
    console.error('Update request error:', err);
    res.status(500).json({ error: 'Failed to update request' });
  }
});

// POST /api/projects/:projectId/requests/:id/categorize - Categorize request
router.post('/:id/categorize', (req, res) => {
  try {
    const request = Request.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    const { status, scope_item_id } = req.body;

    if (!status || !['in-scope', 'out-of-scope'].includes(status)) {
      return res.status(400).json({ error: 'Status must be in-scope or out-of-scope' });
    }

    const updated = Request.categorize(req.params.id, status, scope_item_id);

    res.json({ request: updated });
  } catch (err) {
    console.error('Categorize request error:', err);
    res.status(500).json({ error: 'Failed to categorize request' });
  }
});

// DELETE /api/projects/:projectId/requests/:id - Delete request
router.delete('/:id', (req, res) => {
  try {
    const request = Request.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Delete attachments from filesystem
    const attachments = Attachment.findByRequestId(req.params.id);
    for (const attachment of attachments) {
      try {
        if (fs.existsSync(attachment.file_path)) {
          fs.unlinkSync(attachment.file_path);
        }
      } catch (fileErr) {
        console.error('Failed to delete file:', fileErr);
      }
    }

    Request.delete(req.params.id);
    res.json({ message: 'Request deleted successfully' });
  } catch (err) {
    console.error('Delete request error:', err);
    res.status(500).json({ error: 'Failed to delete request' });
  }
});

// GET /api/projects/:projectId/requests/:id/attachments - Get all attachments for request
router.get('/:id/attachments', (req, res) => {
  try {
    const request = Request.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    const attachments = Attachment.findByRequestId(req.params.id);
    res.json({ attachments });
  } catch (err) {
    console.error('Get attachments error:', err);
    res.status(500).json({ error: 'Failed to fetch attachments' });
  }
});

// POST /api/projects/:projectId/requests/:id/attachments - Add attachments to existing request
router.post('/:id/attachments', upload.array('attachments', 5), (req, res) => {
  try {
    const request = Request.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    const attachments = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const attachment = Attachment.create({
          request_id: request.id,
          filename: file.filename,
          original_filename: file.originalname,
          mime_type: file.mimetype,
          file_size: file.size,
          file_path: file.path
        });
        attachments.push(attachment);
      }
    }

    res.status(201).json({ attachments });
  } catch (err) {
    console.error('Upload attachments error:', err);
    res.status(500).json({ error: err.message || 'Failed to upload attachments' });
  }
});

// GET /api/projects/:projectId/requests/:id/attachments/:attachmentId/download - Download attachment
router.get('/:id/attachments/:attachmentId/download', (req, res) => {
  try {
    const attachment = Attachment.findById(req.params.attachmentId);
    
    if (!attachment) {
      return res.status(404).json({ error: 'Attachment not found' });
    }

    // Verify attachment belongs to the request
    if (attachment.request_id !== parseInt(req.params.id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!fs.existsSync(attachment.file_path)) {
      return res.status(404).json({ error: 'File not found on server' });
    }

    res.download(attachment.file_path, attachment.original_filename);
  } catch (err) {
    console.error('Download attachment error:', err);
    res.status(500).json({ error: 'Failed to download attachment' });
  }
});

// DELETE /api/projects/:projectId/requests/:id/attachments/:attachmentId - Delete attachment
router.delete('/:id/attachments/:attachmentId', (req, res) => {
  try {
    const attachment = Attachment.findById(req.params.attachmentId);
    
    if (!attachment) {
      return res.status(404).json({ error: 'Attachment not found' });
    }

    // Verify attachment belongs to the request
    if (attachment.request_id !== parseInt(req.params.id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Delete file from filesystem
    if (fs.existsSync(attachment.file_path)) {
      fs.unlinkSync(attachment.file_path);
    }

    Attachment.delete(req.params.attachmentId);
    res.json({ message: 'Attachment deleted successfully' });
  } catch (err) {
    console.error('Delete attachment error:', err);
    res.status(500).json({ error: 'Failed to delete attachment' });
  }
});

// TIME TRACKING ENDPOINTS

// GET /api/projects/:projectId/requests/:id/time - Get all time entries for request
router.get('/:id/time', (req, res) => {
  try {
    const request = Request.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    const timeEntries = TimeEntry.findByRequestId(req.params.id);
    const totalSeconds = TimeEntry.getTotalTime(req.params.id);
    const activeTimer = TimeEntry.getActiveTimer(req.user.id);

    res.json({ 
      timeEntries, 
      totalSeconds,
      activeTimer: activeTimer && activeTimer.request_id === parseInt(req.params.id) ? activeTimer : null
    });
  } catch (err) {
    console.error('Get time entries error:', err);
    res.status(500).json({ error: 'Failed to fetch time entries' });
  }
});

// POST /api/projects/:projectId/requests/:id/time/start - Start timer
router.post('/:id/time/start', (req, res) => {
  try {
    const request = Request.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    const { description } = req.body;

    const timeEntry = TimeEntry.start({
      request_id: req.params.id,
      user_id: req.user.id,
      description
    });

    res.status(201).json({ timeEntry });
  } catch (err) {
    console.error('Start timer error:', err);
    res.status(400).json({ error: err.message || 'Failed to start timer' });
  }
});

// POST /api/projects/:projectId/requests/:id/time/stop - Stop active timer
router.post('/:id/time/stop', (req, res) => {
  try {
    const activeTimer = TimeEntry.getActiveTimer(req.user.id);

    if (!activeTimer) {
      return res.status(400).json({ error: 'No active timer found' });
    }

    if (activeTimer.request_id !== parseInt(req.params.id)) {
      return res.status(400).json({ error: 'Active timer is for a different request' });
    }

    const timeEntry = TimeEntry.stop(activeTimer.id, req.user.id);

    res.json({ timeEntry });
  } catch (err) {
    console.error('Stop timer error:', err);
    res.status(400).json({ error: err.message || 'Failed to stop timer' });
  }
});

// PUT /api/projects/:projectId/requests/:id/time/:timeId - Update time entry
router.put('/:id/time/:timeId', (req, res) => {
  try {
    const timeEntry = TimeEntry.findById(req.params.timeId);
    
    if (!timeEntry) {
      return res.status(404).json({ error: 'Time entry not found' });
    }

    if (timeEntry.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { description, started_at, ended_at } = req.body;

    const updated = TimeEntry.update(req.params.timeId, {
      description,
      started_at,
      ended_at
    });

    res.json({ timeEntry: updated });
  } catch (err) {
    console.error('Update time entry error:', err);
    res.status(500).json({ error: 'Failed to update time entry' });
  }
});

// DELETE /api/projects/:projectId/requests/:id/time/:timeId - Delete time entry
router.delete('/:id/time/:timeId', (req, res) => {
  try {
    const timeEntry = TimeEntry.findById(req.params.timeId);
    
    if (!timeEntry) {
      return res.status(404).json({ error: 'Time entry not found' });
    }

    if (timeEntry.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    TimeEntry.delete(req.params.timeId);
    res.json({ message: 'Time entry deleted successfully' });
  } catch (err) {
    console.error('Delete time entry error:', err);
    res.status(500).json({ error: 'Failed to delete time entry' });
  }
});

module.exports = router;
