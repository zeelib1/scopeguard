// Pre-built project templates for common freelance scopes

const templates = {
  'website-redesign-5-pages': {
    name: 'Website Redesign (5 Pages)',
    description: 'Complete website redesign with 5 pages and 3 revision rounds',
    scope_items: [
      { description: 'Homepage design', limit_value: 1, limit_type: 'count' },
      { description: 'Internal pages', limit_value: 4, limit_type: 'count' },
      { description: 'Revision rounds', limit_value: 3, limit_type: 'count' },
      { description: 'Responsive design (mobile + tablet)', limit_value: 1, limit_type: 'count' }
    ]
  },

  'logo-design-package': {
    name: 'Logo Design Package',
    description: 'Professional logo design with variations and source files',
    scope_items: [
      { description: 'Initial concepts', limit_value: 3, limit_type: 'count' },
      { description: 'Revision rounds', limit_value: 2, limit_type: 'count' },
      { description: 'Color variations', limit_value: 3, limit_type: 'count' },
      { description: 'File formats (PNG, SVG, PDF)', limit_value: 1, limit_type: 'count' }
    ]
  },

  'content-writing-blog-posts': {
    name: 'Blog Writing (10 Posts)',
    description: 'SEO-optimized blog posts with images and meta descriptions',
    scope_items: [
      { description: 'Blog posts (800-1000 words)', limit_value: 10, limit_type: 'count' },
      { description: 'Revisions per post', limit_value: 1, limit_type: 'count' },
      { description: 'Featured images sourced', limit_value: 10, limit_type: 'count' }
    ]
  },

  'app-development-mvp': {
    name: 'Mobile App MVP',
    description: 'Minimum viable product for iOS/Android',
    scope_items: [
      { description: 'Core features implemented', limit_value: 5, limit_type: 'count' },
      { description: 'UI/UX screens designed', limit_value: 8, limit_type: 'count' },
      { description: 'Development sprints', limit_value: 4, limit_type: 'count' },
      { description: 'Bug fix iterations', limit_value: 3, limit_type: 'count' }
    ]
  },

  'social-media-management': {
    name: 'Social Media Management (Monthly)',
    description: 'Monthly social media content creation and posting',
    scope_items: [
      { description: 'Posts per month (Instagram)', limit_value: 12, limit_type: 'count' },
      { description: 'Posts per month (Facebook)', limit_value: 8, limit_type: 'count' },
      { description: 'Stories per week', limit_value: 3, limit_type: 'count' },
      { description: 'Content revisions', limit_value: 5, limit_type: 'count' }
    ]
  },

  'video-editing-project': {
    name: 'Video Editing Project',
    description: 'Professional video editing with multiple revisions',
    scope_items: [
      { description: 'Video length (minutes)', limit_value: 10, limit_type: 'count' },
      { description: 'Revision rounds', limit_value: 2, limit_type: 'count' },
      { description: 'Custom graphics/animations', limit_value: 5, limit_type: 'count' },
      { description: 'Audio mixing/cleanup', limit_value: 1, limit_type: 'count' }
    ]
  },

  'consulting-hours-package': {
    name: 'Consulting Hours Package',
    description: 'Monthly consulting retainer with defined hours',
    scope_items: [
      { description: 'Consulting hours per month', limit_value: 10, limit_type: 'hours' },
      { description: 'Strategy documents delivered', limit_value: 2, limit_type: 'count' },
      { description: 'Meeting sessions', limit_value: 4, limit_type: 'count' }
    ]
  },

  'ecommerce-setup': {
    name: 'E-commerce Store Setup',
    description: 'Complete online store setup with products and payments',
    scope_items: [
      { description: 'Product pages', limit_value: 20, limit_type: 'count' },
      { description: 'Product categories', limit_value: 5, limit_type: 'count' },
      { description: 'Payment gateway integrations', limit_value: 2, limit_type: 'count' },
      { description: 'Design revisions', limit_value: 3, limit_type: 'count' }
    ]
  }
};

// Get all template IDs and names
const getTemplateList = () => {
  return Object.keys(templates).map(id => ({
    id,
    name: templates[id].name,
    description: templates[id].description
  }));
};

// Get specific template by ID
const getTemplate = (templateId) => {
  return templates[templateId] || null;
};

module.exports = {
  templates,
  getTemplateList,
  getTemplate
};
