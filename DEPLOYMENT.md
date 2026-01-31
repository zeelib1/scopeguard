# 🚀 Deployment Guide

This guide covers deploying ScopeGuard to production.

---

## Environment Variables

### Backend (.env)

Required variables:

```env
# Server Configuration
PORT=3001
NODE_ENV=production

# Database
DATABASE_PATH=./data/scopeguard.db

# Authentication
JWT_SECRET=<generate-a-secure-random-string>

# Frontend URL (for CORS)
FRONTEND_URL=https://your-frontend-domain.com

# Optional: Stripe Integration
STRIPE_SECRET_KEY=sk_live_...

# Optional: Email Configuration
EMAIL_FROM=noreply@yourdomain.com
SMTP_HOST=smtp.yourprovider.com
SMTP_PORT=587
SMTP_USER=your-email@yourdomain.com
SMTP_PASSWORD=your-email-password
```

### Frontend (.env)

```env
NUXT_PUBLIC_API_BASE=https://your-api-domain.com/api
```

---

## Production Build

### 1. Build Backend

```bash
# Install dependencies
npm install --production

# Build TypeScript to JavaScript
npm run build:backend

# Output: dist/ directory
```

### 2. Build Frontend

```bash
cd frontend

# Install dependencies
npm install --production

# Build for production
npm run build

# Output: .output/ directory
```

---

## Deployment Options

### Option 1: Traditional VPS (DigitalOcean, Linode, AWS EC2)

#### Backend

```bash
# Using PM2 for process management
npm install -g pm2

# Start backend
cd /path/to/scopeguard
PORT=3001 pm2 start dist/server/server.js --name scopeguard-api

# Save PM2 config
pm2 save

# Auto-start on reboot
pm2 startup
```

#### Frontend

```bash
cd frontend

# Option A: Use Nuxt's built-in server
PORT=3000 pm2 start .output/server/index.mjs --name scopeguard-frontend

# Option B: Use a static file server (if using static generation)
pm2 serve .output/public 3000 --name scopeguard-frontend --spa
```

#### Nginx Reverse Proxy

```nginx
# /etc/nginx/sites-available/scopeguard

server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable site and restart nginx:

```bash
sudo ln -s /etc/nginx/sites-available/scopeguard /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### SSL with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

### Option 2: Docker

#### Dockerfile (Backend)

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY dist ./dist
COPY data ./data

ENV PORT=3001
ENV NODE_ENV=production

EXPOSE 3001

CMD ["node", "dist/server/server.js"]
```

#### Dockerfile (Frontend)

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY frontend/package*.json ./
RUN npm ci --production

COPY frontend/.output ./.output

ENV PORT=3000

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
```

#### docker-compose.yml

```yaml
version: '3.8'

services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    ports:
      - "3001:3001"
    environment:
      - DATABASE_PATH=/data/scopeguard.db
      - JWT_SECRET=${JWT_SECRET}
      - FRONTEND_URL=http://localhost:3000
    volumes:
      - ./data:/data

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "3000:3000"
    environment:
      - NUXT_PUBLIC_API_BASE=http://localhost:3001/api
    depends_on:
      - backend
```

Run with:

```bash
docker-compose up -d
```

---

### Option 3: Platform-as-a-Service

#### Backend (Railway, Render, Fly.io)

1. Connect GitHub repository
2. Set environment variables
3. Set build command: `npm run build:backend`
4. Set start command: `npm start`
5. Deploy!

#### Frontend (Vercel, Netlify)

1. Connect GitHub repository
2. Set framework: Nuxt.js
3. Set build command: `npm run build`
4. Set output directory: `.output/public`
5. Add environment variable: `NUXT_PUBLIC_API_BASE`
6. Deploy!

---

## Database Management

### Backup

```bash
# SQLite is a file, so backing up is simple:
cp data/scopeguard.db data/scopeguard.backup-$(date +%Y%m%d).db

# Or use sqlite3:
sqlite3 data/scopeguard.db ".backup data/scopeguard.backup.db"
```

### Restore

```bash
cp data/scopeguard.backup.db data/scopeguard.db
```

### Initialize Fresh Database

```bash
npm run db:init
```

---

## Performance Optimization

### Backend

1. **Enable compression:**
   ```bash
   npm install compression
   ```
   
   In `server.ts`:
   ```typescript
   import compression from 'compression'
   app.use(compression())
   ```

2. **Add rate limiting:**
   ```bash
   npm install express-rate-limit
   ```

### Frontend

1. **Enable CDN for static assets**
2. **Use image optimization**
3. **Enable gzip/brotli compression**

---

## Monitoring

### Health Checks

Backend health endpoint:
```
GET /api/health
```

Response:
```json
{
  "status": "ok",
  "service": "ScopeGuard API",
  "timestamp": "2024-01-31T10:00:00.000Z"
}
```

### Logging

PM2 logs:
```bash
pm2 logs scopeguard-api
pm2 logs scopeguard-frontend
```

---

## Troubleshooting

### Backend won't start

1. Check environment variables: `printenv | grep JWT_SECRET`
2. Check database path exists: `ls -la data/`
3. Check port isn't in use: `lsof -i :3001`

### Frontend can't connect to API

1. Check CORS settings in backend
2. Verify `NUXT_PUBLIC_API_BASE` is correct
3. Check network/firewall rules

### Database locked errors

SQLite only supports one writer at a time. Consider:
1. Using WAL mode (Write-Ahead Logging)
2. Upgrading to PostgreSQL for high-concurrency scenarios

---

## Security Checklist

- [ ] Change `JWT_SECRET` to a strong random value
- [ ] Enable HTTPS (SSL certificates)
- [ ] Set `NODE_ENV=production`
- [ ] Disable debug logs in production
- [ ] Set secure CORS origins (not `*`)
- [ ] Enable rate limiting
- [ ] Regular database backups
- [ ] Update dependencies regularly
- [ ] Use environment variables (never commit secrets)
- [ ] Enable firewall rules
- [ ] Monitor logs for suspicious activity

---

## Support

For deployment issues, check:
- Server logs (`pm2 logs`)
- Browser console for frontend errors
- Network tab for API call failures

---

**Production Ready!** 🎉
