# Contributing to ScopeGuard

Thank you for your interest in contributing to ScopeGuard! This project was built in 7 hours by an autonomous AI agent as a proof-of-concept, and we welcome contributions to make it even better.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Project Structure](#project-structure)

---

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on what's best for the community
- Show empathy towards other community members

---

## Getting Started

### Prerequisites

- Node.js 18+ (22+ recommended)
- npm or yarn
- Git
- Basic understanding of Node.js/Express
- Familiarity with REST APIs

### First-time Contributors

Great first issues:
- Add more project templates
- Improve error messages
- Write additional tests
- Fix typos in documentation
- Add examples to README

Look for issues labeled `good first issue` or `help wanted`.

---

## Development Setup

```bash
# 1. Fork the repository on GitHub

# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/scopeguard.git
cd scopeguard

# 3. Add upstream remote
git remote add upstream https://github.com/zeelib1/scopeguard.git

# 4. Install dependencies
npm install

# 5. Set up environment
cp .env.example .env
# Edit .env with your configuration

# 6. Initialize database
npm run db:init

# 7. Start development server
npm run dev

# Server runs on http://localhost:3000
```

---

## How to Contribute

### Reporting Bugs

**Before submitting a bug report:**
- Check existing issues
- Test with latest version
- Verify it's reproducible

**Bug report should include:**
- Clear, descriptive title
- Steps to reproduce
- Expected vs actual behavior
- Environment (OS, Node version, etc.)
- Error messages/logs
- Screenshots if applicable

**Example:**
```markdown
**Bug:** Change order generation fails with multiple requests

**Steps:**
1. Create project
2. Add 3 out-of-scope requests
3. Call POST /api/projects/1/change-orders/generate with all 3 IDs

**Expected:** Change order created
**Actual:** 500 error: "Cannot read property..."

**Environment:** Node 22.0.0, macOS 14.2
```

### Suggesting Features

**Feature requests should include:**
- Use case (why is this needed?)
- Proposed solution
- Alternative approaches considered
- Mockups/examples if applicable

**Example:**
```markdown
**Feature:** Email notifications when scope exceeds

**Use Case:** Freelancers want immediate alerts, not just dashboard warnings

**Solution:** Add email service integration, send when scope_item.used > limit

**Alternatives:**
- SMS notifications (more complex)
- Webhook to Slack (partial solution)

**Mockup:** [screenshot of email template]
```

### Making Changes

1. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow coding standards
   - Write/update tests
   - Update documentation

3. **Test your changes**
   ```bash
   # Run linter (if configured)
   npm run lint
   
   # Test manually
   npm run dev
   # Use API_TESTING.md examples
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add email notifications for scope warnings"
   ```

   **Commit message format:**
   - `feat:` New feature
   - `fix:` Bug fix
   - `docs:` Documentation changes
   - `refactor:` Code refactoring
   - `test:` Adding tests
   - `chore:` Maintenance tasks

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Open Pull Request**
   - Go to GitHub
   - Click "New Pull Request"
   - Fill in PR template
   - Link related issues

---

## Pull Request Process

### Before Submitting

- [ ] Code follows project style
- [ ] Self-reviewed changes
- [ ] Commented complex code
- [ ] Updated documentation
- [ ] No new warnings/errors
- [ ] Tested manually

### PR Template

```markdown
## Description
Brief summary of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues
Closes #123

## Testing
How did you test this?

## Screenshots (if applicable)

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed
- [ ] Commented code
- [ ] Updated docs
- [ ] No new warnings
- [ ] Tested
```

### Review Process

1. Maintainer reviews within 1-3 days
2. Feedback/change requests
3. You update based on feedback
4. Approval + merge

---

## Coding Standards

### JavaScript Style

```javascript
// Use const/let, not var
const user = User.findById(id);

// Arrow functions for callbacks
items.map(item => item.value);

// Async/await over callbacks
const result = await fetchData();

// Destructuring
const { email, password } = req.body;

// Template literals
const message = `User ${user.name} logged in`;
```

### Error Handling

```javascript
// Always use try-catch for async operations
try {
  const project = Project.findById(id);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  res.json({ project });
} catch (err) {
  console.error('Get project error:', err);
  res.status(500).json({ error: 'Failed to fetch project' });
}
```

### API Design

```javascript
// RESTful endpoints
GET    /api/projects          // List
POST   /api/projects          // Create
GET    /api/projects/:id      // Get one
PUT    /api/projects/:id      // Update
DELETE /api/projects/:id      // Delete

// Nested resources
POST /api/projects/:projectId/requests

// Consistent responses
res.json({ project })           // Single item
res.json({ projects })          // Array
res.json({ error: 'message' }) // Error
```

### Database Queries

```javascript
// Use query helper
const user = query.get('SELECT * FROM users WHERE id = ?', [userId]);

// Parameterized queries (prevent SQL injection)
query.run('INSERT INTO users (email) VALUES (?)', [email]);

// Never concatenate user input
// ❌ BAD: `SELECT * FROM users WHERE email = '${email}'`
// ✅ GOOD: query.get('SELECT * FROM users WHERE email = ?', [email])
```

---

## Testing Guidelines

### Manual Testing

Use `API_TESTING.md` examples:

```bash
# 1. Start server
npm run dev

# 2. Run test script
bash test-api.sh

# 3. Test your new endpoint
curl -X POST $API_URL/api/your-new-endpoint \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

### Test Checklist

- [ ] Happy path works
- [ ] Invalid input rejected (400)
- [ ] Unauthorized access blocked (401)
- [ ] Missing resources return 404
- [ ] Server errors handled (500)
- [ ] Edge cases covered

---

## Project Structure

```
scopeguard/
├── src/
│   ├── server/
│   │   ├── routes/         # API endpoints
│   │   │   ├── auth.js
│   │   │   ├── projects.js
│   │   │   └── ...
│   │   ├── models/         # Database models
│   │   │   ├── User.js
│   │   │   ├── Project.js
│   │   │   └── ...
│   │   ├── middleware/     # Express middleware
│   │   │   └── auth.js
│   │   ├── services/       # Business logic
│   │   ├── templates/      # Project templates
│   │   └── server.js       # Express app
│   ├── database/
│   │   ├── db.js           # SQLite connection
│   │   └── init.js         # Seed data
│   └── client/             # (Future: React frontend)
├── public/                 # Static files
│   └── index.html          # Landing page
├── data/                   # SQLite database
├── schema.sql              # Database schema
├── package.json
├── .env.example
├── README.md
├── FEATURES.md
├── API_TESTING.md
└── CONTRIBUTING.md
```

### Adding a New Feature

**Example: Add Request Comments**

1. **Update schema** (`schema.sql`):
   ```sql
   CREATE TABLE request_comments (
     id INTEGER PRIMARY KEY,
     request_id INTEGER,
     user_id INTEGER,
     comment TEXT,
     created_at INTEGER
   );
   ```

2. **Create model** (`src/server/models/Comment.js`):
   ```javascript
   class Comment {
     static create({ request_id, user_id, comment }) { ... }
     static findByRequestId(requestId) { ... }
   }
   ```

3. **Create route** (`src/server/routes/comments.js`):
   ```javascript
   router.post('/projects/:projectId/requests/:requestId/comments', ...)
   router.get('/projects/:projectId/requests/:requestId/comments', ...)
   ```

4. **Integrate** (`src/server/server.js`):
   ```javascript
   const commentRoutes = require('./routes/comments');
   app.use('/api', commentRoutes);
   ```

5. **Test** (add to `API_TESTING.md`)

6. **Document** (update `README.md`, `FEATURES.md`)

---

## Priority Areas

### High Priority

- **React Frontend** - Build web UI
- **Mobile Apps** - React Native or native
- **Email Notifications** - SendGrid integration
- **Testing Suite** - Automated tests

### Medium Priority

- **Email Parsing** - Auto-detect requests from inbox
- **Slack Integration** - Webhooks for notifications
- **Dark Mode** - UI theming
- **Keyboard Shortcuts** - Power user features

### Low Priority (Polish)

- Request attachments
- Time tracking
- Custom reports
- Multi-language support

---

## Getting Help

- **Documentation:** Read README, FEATURES, API_TESTING
- **Issues:** Search existing issues
- **Discussions:** Start a discussion for questions
- **Discord:** (Coming soon)

---

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Credited in project documentation

Thank you for making ScopeGuard better! 🛡️
