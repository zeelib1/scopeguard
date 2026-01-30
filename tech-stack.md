# Tech Stack - ScopeGuard

## Backend

**Runtime:** Node.js v22+  
**Framework:** Express.js  
**Why:** Fast development, proven stack, excellent ecosystem

## Database

**Engine:** SQLite via better-sqlite3  
**Why:**
- Zero configuration
- Perfect for MVP (no external dependencies)
- Fast for <100k records
- Easy migration to PostgreSQL later if needed

## Frontend

**Framework:** React 18+  
**Build Tool:** Vite  
**Styling:** Tailwind CSS  
**Why:**
- Component reusability
- Fast development with Vite
- Tailwind = rapid UI prototyping

## Authentication

**Strategy:** JWT (JSON Web Tokens)  
**Storage:** HTTP-only cookies  
**Password Hashing:** bcrypt  

## Payment Processing

**Provider:** Stripe  
**Integration:** Stripe Checkout (hosted)  
**Webhooks:** Stripe webhook handling for subscription events  

## Development Tools

- **Version Control:** Git + GitHub
- **Package Manager:** npm
- **Linter:** ESLint
- **Code Formatter:** Prettier (optional)

## Project Structure

```
/
├── src/
│   ├── server/
│   │   ├── routes/        # API endpoints
│   │   ├── models/        # Database models
│   │   ├── middleware/    # Auth, validation, etc.
│   │   ├── services/      # Business logic
│   │   └── server.js      # Express app
│   ├── client/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page-level components
│   │   ├── hooks/         # Custom React hooks
│   │   └── App.jsx        # Root component
│   └── database/
│       ├── schema.sql     # Database schema
│       └── db.js          # SQLite connection
├── public/                # Static assets
├── package.json
└── README.md
```

## Dependencies

### Backend
- `express` - Web framework
- `better-sqlite3` - SQLite driver
- `bcrypt` - Password hashing
- `jsonwebtoken` - JWT auth
- `dotenv` - Environment variables
- `stripe` - Payment processing
- `cors` - CORS handling

### Frontend
- `react` - UI library
- `react-router-dom` - Routing
- `axios` - HTTP client
- `tailwindcss` - CSS framework

## Environment Variables

```bash
# Server
PORT=3000
JWT_SECRET=your-secret-key
NODE_ENV=development

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Database
DATABASE_PATH=./data/scopeguard.db
```

## Development Workflow

1. Install dependencies: `npm install`
2. Set up `.env` file
3. Initialize database: `node src/database/init.js`
4. Start dev server: `npm run dev`
5. Frontend: `npm run dev:client` (parallel)

## Build & Deployment

**For MVP:** Local deployment only  
**Future:** Vercel (frontend) + Railway/Render (backend)

## Performance Targets

- API response time: <100ms (avg)
- Page load time: <2s
- Database queries: <50ms

## Security Considerations

- ✅ Password hashing with bcrypt
- ✅ JWT with HTTP-only cookies
- ✅ Input validation on all endpoints
- ✅ CORS configuration
- ✅ SQL injection prevention (parameterized queries)
- ✅ Rate limiting (future enhancement)

---

**Last Updated:** Phase 2 - Implementation Planning  
**Status:** Architecture defined, ready for implementation
