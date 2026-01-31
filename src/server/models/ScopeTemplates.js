// Pre-built scope item templates for common project types

const SCOPE_TEMPLATES = {
  website_basic: {
    name: "Basic Website",
    description: "Standard small business website",
    items: [
      { description: "Homepage design & development", limit_value: 1, limit_type: "count" },
      { description: "Interior pages", limit_value: 5, limit_type: "count" },
      { description: "Contact form integration", limit_value: 1, limit_type: "count" },
      { description: "Revision rounds", limit_value: 2, limit_type: "count" },
      { description: "Stock images included", limit_value: 10, limit_type: "count" }
    ]
  },
  
  website_ecommerce: {
    name: "E-Commerce Website",
    description: "Online store with shopping cart",
    items: [
      { description: "Homepage & category pages", limit_value: 3, limit_type: "count" },
      { description: "Product pages", limit_value: 50, limit_type: "count" },
      { description: "Shopping cart integration", limit_value: 1, limit_type: "count" },
      { description: "Payment gateway setup", limit_value: 2, limit_type: "count" },
      { description: "Product uploads", limit_value: 100, limit_type: "count" },
      { description: "Revision rounds", limit_value: 3, limit_type: "count" }
    ]
  },

  logo_design: {
    name: "Logo Design",
    description: "Professional logo creation",
    items: [
      { description: "Initial concept presentations", limit_value: 3, limit_type: "count" },
      { description: "Revision rounds", limit_value: 2, limit_type: "count" },
      { description: "Final file formats delivered", limit_value: 5, limit_type: "count" },
      { description: "Color variations", limit_value: 3, limit_type: "count" }
    ]
  },

  branding_package: {
    name: "Complete Branding Package",
    description: "Logo, colors, fonts, brand guidelines",
    items: [
      { description: "Logo concepts", limit_value: 3, limit_type: "count" },
      { description: "Business card designs", limit_value: 2, limit_type: "count" },
      { description: "Letterhead design", limit_value: 1, limit_type: "count" },
      { description: "Social media templates", limit_value: 5, limit_type: "count" },
      { description: "Brand guideline pages", limit_value: 10, limit_type: "count" },
      { description: "Revision rounds", limit_value: 3, limit_type: "count" }
    ]
  },

  blog_writing: {
    name: "Blog Content Creation",
    description: "Regular blog post writing",
    items: [
      { description: "Blog posts per month", limit_value: 4, limit_type: "count" },
      { description: "Words per post", limit_value: 1000, limit_type: "count" },
      { description: "Topic research hours", limit_value: 4, limit_type: "hours" },
      { description: "Revisions per post", limit_value: 1, limit_type: "count" },
      { description: "SEO keyword research", limit_value: 5, limit_type: "count" }
    ]
  },

  social_media_mgmt: {
    name: "Social Media Management",
    description: "Monthly social media content & posting",
    items: [
      { description: "Posts per week", limit_value: 5, limit_type: "count" },
      { description: "Platforms managed", limit_value: 3, limit_type: "count" },
      { description: "Custom graphics per month", limit_value: 10, limit_type: "count" },
      { description: "Story posts per week", limit_value: 7, limit_type: "count" },
      { description: "Monthly strategy calls", limit_value: 2, limit_type: "count" }
    ]
  },

  mobile_app: {
    name: "Mobile App Development",
    description: "iOS/Android app development",
    items: [
      { description: "App screens", limit_value: 15, limit_type: "count" },
      { description: "API integrations", limit_value: 5, limit_type: "count" },
      { description: "Push notification setup", limit_value: 1, limit_type: "count" },
      { description: "Development sprints", limit_value: 8, limit_type: "count" },
      { description: "Bug fixes post-launch", limit_value: 20, limit_type: "count" },
      { description: "Revision rounds", limit_value: 3, limit_type: "count" }
    ]
  },

  web_app: {
    name: "Web Application",
    description: "Custom web application development",
    items: [
      { description: "User dashboard pages", limit_value: 10, limit_type: "count" },
      { description: "Database tables", limit_value: 15, limit_type: "count" },
      { description: "API endpoints", limit_value: 30, limit_type: "count" },
      { description: "Third-party integrations", limit_value: 3, limit_type: "count" },
      { description: "Development hours", limit_value: 120, limit_type: "hours" },
      { description: "Testing & QA hours", limit_value: 20, limit_type: "hours" }
    ]
  },

  seo_package: {
    name: "SEO Optimization Package",
    description: "Search engine optimization services",
    items: [
      { description: "Pages optimized", limit_value: 10, limit_type: "count" },
      { description: "Keyword research hours", limit_value: 8, limit_type: "hours" },
      { description: "Meta descriptions written", limit_value: 25, limit_type: "count" },
      { description: "Backlink outreach emails", limit_value: 50, limit_type: "count" },
      { description: "Monthly progress reports", limit_value: 1, limit_type: "count" }
    ]
  },

  video_editing: {
    name: "Video Editing",
    description: "Professional video editing services",
    items: [
      { description: "Videos edited per month", limit_value: 4, limit_type: "count" },
      { description: "Minutes of final footage", limit_value: 15, limit_type: "count" },
      { description: "Color grading", limit_value: 1, limit_type: "count" },
      { description: "Custom transitions", limit_value: 10, limit_type: "count" },
      { description: "Revision rounds", limit_value: 2, limit_type: "count" }
    ]
  },

  consulting_retainer: {
    name: "Consulting Retainer",
    description: "Monthly consulting hours",
    items: [
      { description: "Consulting hours per month", limit_value: 10, limit_type: "hours" },
      { description: "Strategy documents", limit_value: 2, limit_type: "count" },
      { description: "Video calls", limit_value: 4, limit_type: "count" },
      { description: "Email support responses", limit_value: 20, limit_type: "count" }
    ]
  },

  maintenance_package: {
    name: "Website Maintenance",
    description: "Ongoing website updates & maintenance",
    items: [
      { description: "Maintenance hours per month", limit_value: 5, limit_type: "hours" },
      { description: "Content updates", limit_value: 10, limit_type: "count" },
      { description: "Plugin/theme updates", limit_value: 999, limit_type: "count" },
      { description: "Emergency fixes", limit_value: 2, limit_type: "count" },
      { description: "Performance monitoring", limit_value: 1, limit_type: "count" }
    ]
  }
};

class ScopeTemplates {
  // Get all available templates
  static getAll() {
    return Object.keys(SCOPE_TEMPLATES).map(key => ({
      id: key,
      name: SCOPE_TEMPLATES[key].name,
      description: SCOPE_TEMPLATES[key].description,
      itemCount: SCOPE_TEMPLATES[key].items.length
    }));
  }

  // Get a specific template by ID
  static getById(templateId) {
    if (!SCOPE_TEMPLATES[templateId]) {
      throw new Error('Template not found');
    }
    
    return {
      id: templateId,
      ...SCOPE_TEMPLATES[templateId]
    };
  }

  // Apply template to a project
  static applyToProject(templateId, projectId) {
    const template = this.getById(templateId);
    const ScopeItem = require('./ScopeItem');
    
    const createdItems = [];
    
    for (const item of template.items) {
      const scopeItem = ScopeItem.create({
        project_id: projectId,
        description: item.description,
        limit_value: item.limit_value,
        limit_type: item.limit_type
      });
      createdItems.push(scopeItem);
    }
    
    return createdItems;
  }

  // Search templates by keyword
  static search(query) {
    const lowerQuery = query.toLowerCase();
    
    return Object.keys(SCOPE_TEMPLATES)
      .filter(key => {
        const template = SCOPE_TEMPLATES[key];
        return template.name.toLowerCase().includes(lowerQuery) ||
               template.description.toLowerCase().includes(lowerQuery);
      })
      .map(key => ({
        id: key,
        name: SCOPE_TEMPLATES[key].name,
        description: SCOPE_TEMPLATES[key].description,
        itemCount: SCOPE_TEMPLATES[key].items.length
      }));
  }
}

module.exports = ScopeTemplates;
