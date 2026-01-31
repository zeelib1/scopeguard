# 🛡️ ScopeGuard

**Stop scope creep before it costs you thousands.**

ScopeGuard is a professional scope management tool for freelancers and agencies. Track client requests, define clear boundaries, and automatically generate change orders for out-of-scope work.

---

## 🚀 Tech Stack

### Backend
- **Node.js** + **Express** - REST API
- **SQLite** (via better-sqlite3) - Database
- **TypeScript** - Full TypeScript implementation
- **JWT** - Authentication
- **Stripe** - Payments integration (configured)

### Frontend
- **Nuxt 3** - Vue.js framework
- **TypeScript** - Full type safety
- **TailwindCSS** - Styling
- **Pinia** - State management
- **Auto-imports** - Composables & components

---

## ✨ Features

### Core Features
- ✅ **User Authentication** (JWT)
- ✅ **Project Management** (CRUD operations)
- ✅ **Scope Item Tracking** (define limits, track usage)
- ✅ **Client Request Classification** (in-scope / out-of-scope)
- ✅ **Change Order Generation** (automatic pricing)
- ✅ **Budget Tracking** (real-time calculations)
- ✅ **Time Tracking** (start/stop timers)
- ✅ **Team Collaboration** (role-based access)
- ✅ **Communication Logs** (email, Slack, meetings)
- ✅ **Activity Logging** (audit trail)
- ✅ **Reports & Analytics** (weekly digests)
- ✅ **Webhook Integrations** (Slack, Discord, custom)
- ✅ **Client Portal** (public scope viewer)
- ✅ **File Attachments** (request documentation)
- ✅ **Bulk Operations** (process multiple requests)
- ✅ **Project Templates** (quick setup)
- ✅ **Export Tools** (Markdown, JSON)

### Frontend Features
- ✅ **Dashboard** (real stats from API, quick actions)
- ✅ **Projects List & Detail** (full project view with tabs)
- ✅ **Request Management** (approve/reject workflow, bulk operations)
- ✅ **Change Order Creation** (from approved requests)
- ✅ **Budget Visualization** (gauges, health indicators)
- ✅ **Time Tracking** (start/stop timer, recent entries)
- ✅ **File Upload** (drag-and-drop, multiple files)
- ✅ **Project Forms** (create/edit with validation)
- ✅ **Responsive Design** (mobile-friendly with hamburger menu)
- ✅ **Professional UI** (modern SaaS design with TailwindCSS)

---

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- SQLite3

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/zeelib1/scopeguard.git
   cd scopeguard
   ```

2. **Install dependencies:**
   ```bash
   npm install
   cd frontend && npm install && cd ..
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

4. **Initialize database:**
   ```bash
   npm run db:init
   ```

5. **Start development servers:**
   ```bash
   npm run dev
   ```

   This starts:
   - **Backend API** at `http://localhost:3001`
   - **Frontend** at `http://localhost:3000`

### First Time Setup
Register a new account through the frontend at `http://localhost:3000/register`

---

## 📁 Project Structure

```
scopeguard/
├── src/
│   ├── database/
│   │   ├── db.js/.ts           # Database connection
│   │   └── init.js/.ts         # Database initialization
│   ├── server/
│   │   ├── middleware/
│   │   │   └── auth.js/.ts     # JWT authentication
│   │   ├── models/             # 17 database models
│   │   │   ├── User.js/.ts
│   │   │   ├── Project.js/.ts
│   │   │   ├── Request.js/.ts
│   │   │   ├── ChangeOrder.js/.ts
│   │   │   └── ...
│   │   ├── routes/             # 18 API route files
│   │   │   ├── auth.js/.ts
│   │   │   ├── projects.js/.ts
│   │   │   ├── requests.js/.ts
│   │   │   └── ...
│   │   └── server.js/.ts       # Express app
│   └── types/                  # TypeScript definitions
│       └── index.ts
├── frontend/                   # Nuxt 3 application
│   ├── assets/
│   │   └── css/                # TailwindCSS
│   ├── components/             # Vue components
│   │   ├── ProjectCard.vue
│   │   ├── StatusBadge.vue
│   │   ├── RequestItem.vue
│   │   ├── ChangeOrderCard.vue
│   │   └── BudgetGauge.vue
│   ├── composables/            # Composables
│   │   └── useApi.ts           # API client
│   ├── layouts/
│   │   └── default.vue         # Main layout
│   ├── middleware/
│   │   └── auth.ts             # Auth guard
│   ├── pages/                  # Routes
│   │   ├── index.vue           # Dashboard
│   │   ├── login.vue
│   │   ├── register.vue
│   │   ├── projects/
│   │   │   ├── index.vue       # Projects list
│   │   │   └── [id].vue        # Project detail
│   │   ├── team.vue
│   │   ├── settings.vue
│   │   └── reports.vue
│   ├── stores/
│   │   └── auth.ts             # Pinia auth store
│   └── nuxt.config.ts
├── data/                       # SQLite database
├── schema.sql                  # Database schema
└── package.json
```

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Projects
- `GET /api/projects` - List projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Requests
- `GET /api/projects/:id/requests` - List requests
- `POST /api/projects/:id/requests` - Create request
- `PUT /api/projects/:id/requests/:id` - Update request

### Change Orders
- `GET /api/projects/:id/change-orders` - List change orders
- `POST /api/projects/:id/change-orders` - Create change order
- `POST /api/projects/:id/change-orders/:id/approve` - Approve

### Dashboard
- `GET /api/projects/:id/status` - Project overview

### Budget
- `GET /api/budget/project/:id` - Budget details

[See API_TESTING.md for complete API documentation]

---

## 🧪 Development Workflow

### Running Backend Only
```bash
npm run dev:backend
```

### Running Frontend Only
```bash
npm run dev:frontend
```

### Running Both (Recommended)
```bash
npm run dev
```

### Building for Production
```bash
npm run build:backend   # TypeScript -> JavaScript (dist/)
npm run build:frontend  # Nuxt build (frontend/.output/)
npm run build           # Build both
```

### Database Management
```bash
npm run db:init         # Initialize/reset database
```

---

## 🎨 Frontend Development

The Nuxt frontend is fully TypeScript with:
- **Auto-imports** for composables and components
- **File-based routing** (`pages/` directory)
- **Layouts** (default layout with sidebar)
- **Middleware** (auth protection)
- **Pinia stores** (auth state)
- **TailwindCSS utility classes**

### Key Composables
- `useApi()` - API client with auth headers
- `useAuthStore()` - Authentication state

### Creating New Pages
1. Add file to `frontend/pages/`
2. Add `definePageMeta({ layout: 'default', middleware: 'auth' })`
3. Component auto-imported

---

## 🔒 Environment Variables

```env
# Backend
PORT=3001
JWT_SECRET=your-secret-key-here
FRONTEND_URL=http://localhost:3000
DATABASE_PATH=./data/scopeguard.db

# Stripe (optional)
STRIPE_SECRET_KEY=sk_test_...

# Frontend
NUXT_PUBLIC_API_BASE=http://localhost:3001/api
```

---

## 📊 Database Schema

17 tables including:
- `users` - User accounts
- `projects` - Client projects
- `scope_items` - Defined scope limits
- `requests` - Client requests
- `change_orders` - Pricing for out-of-scope work
- `budgets` - Budget tracking
- `time_entries` - Time tracking
- `communication_logs` - Communication history
- `activity_log` - Audit trail
- `webhooks` - Integrations
- [See schema.sql for complete schema]

---

## 🚢 Deployment

### Backend
```bash
npm start  # Runs on PORT 3001
```

### Frontend
```bash
cd frontend
npm run build
npm run preview
```

For production, use:
- **Backend:** PM2, Docker, or Node.js hosting
- **Frontend:** Vercel, Netlify, or static hosting

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📝 License

MIT License - see LICENSE file

---

## 🙏 Acknowledgments

Built with ❤️ by AI
- Backend: Express + SQLite
- Frontend: Nuxt 3 + TailwindCSS
- Full-stack TypeScript

---

## 📧 Support

For questions or issues, please open an issue on GitHub.

**Project Repository:** https://github.com/zeelib1/scopeguard
