# Deployment Guide

## Production Deployment Options

### Option 1: Traditional VPS (DigitalOcean, AWS EC2, etc.)

#### Prerequisites
- Ubuntu 20.04+ server
- Domain name (optional)
- SSL certificate (Let's Encrypt)

#### Steps

1. **Install Node.js**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

2. **Install PM2**
```bash
sudo npm install -g pm2
```

3. **Clone and Setup**
```bash
git clone <your-repo>
cd vaisu
npm install
```

4. **Configure Environment**
```bash
cp backend/.env.example backend/.env
nano backend/.env
# Add your production API key and settings
```

5. **Build Frontend**
```bash
cd frontend
npm run build
```

6. **Start Backend with PM2**
```bash
cd backend
pm2 start npm --name "vaisu-backend" -- start
pm2 save
pm2 startup
```

7. **Serve Frontend with Nginx**
```bash
sudo apt install nginx

# Create nginx config
sudo nano /etc/nginx/sites-available/vaisu
```

Nginx config:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /path/to/vaisu/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/vaisu /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

8. **SSL with Let's Encrypt**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### Option 2: Docker Deployment

#### Prerequisites
- Docker and Docker Compose installed

#### Steps

1. **Create Production .env**
```bash
cp backend/.env.example backend/.env
# Edit with production values
```

2. **Build and Run**
```bash
docker-compose up -d
```

3. **Check Status**
```bash
docker-compose ps
docker-compose logs -f
```

4. **Update**
```bash
git pull
docker-compose down
docker-compose up -d --build
```

### Option 3: Vercel (Frontend) + Railway (Backend)

#### Frontend on Vercel

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Deploy Frontend**
```bash
cd frontend
vercel --prod
```

3. **Configure**
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

#### Backend on Railway

1. Go to https://railway.app
2. Create new project
3. Connect GitHub repo
4. Select `backend` directory
5. Add environment variables:
   - `OPENROUTER_API_KEY`
   - `PORT=3001`
   - `NODE_ENV=production`
6. Deploy

7. **Update Frontend API URL**
```bash
# In frontend/.env.production
VITE_API_URL=https://your-backend.railway.app
```

### Option 4: AWS (Full Stack)

#### Frontend on S3 + CloudFront

1. **Build Frontend**
```bash
cd frontend
npm run build
```

2. **Create S3 Bucket**
```bash
aws s3 mb s3://vaisu-frontend
aws s3 sync dist/ s3://vaisu-frontend
```

3. **Configure S3 for Static Hosting**
```bash
aws s3 website s3://vaisu-frontend --index-document index.html
```

4. **Create CloudFront Distribution**
- Origin: S3 bucket
- Default Root Object: index.html
- Enable HTTPS

#### Backend on Elastic Beanstalk

1. **Install EB CLI**
```bash
pip install awsebcli
```

2. **Initialize**
```bash
cd backend
eb init
```

3. **Create Environment**
```bash
eb create vaisu-backend-prod
```

4. **Set Environment Variables**
```bash
eb setenv OPENROUTER_API_KEY=your-key
```

5. **Deploy**
```bash
eb deploy
```

## Environment Variables

### Backend (.env)

```env
# Server
PORT=3001
NODE_ENV=production

# OpenRouter
OPENROUTER_API_KEY=sk-or-v1-your-key
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1

# Frontend URL (for CORS)
APP_URL=https://your-domain.com

# Optional: Redis
REDIS_URL=redis://localhost:6379

# Optional: Database
DATABASE_URL=postgresql://user:pass@host:5432/db
```

### Frontend (.env.production)

```env
VITE_API_URL=https://api.your-domain.com
```

## Performance Optimization

### 1. Enable Caching

Add Redis for caching analysis results:

```typescript
// backend/src/services/cache/redisClient.ts
import { createClient } from 'redis';

const client = createClient({
  url: process.env.REDIS_URL
});

await client.connect();
```

### 2. CDN for Static Assets

Use CloudFlare or AWS CloudFront for:
- Frontend static files
- Exported visualizations
- Document uploads

### 3. Database for Persistence

Add PostgreSQL for:
- User accounts
- Document storage
- Analysis history

### 4. Load Balancing

For high traffic:
- Multiple backend instances
- Nginx load balancer
- Auto-scaling

## Monitoring

### 1. Application Monitoring

```bash
# Install Sentry
npm install @sentry/node @sentry/react
```

Configure in backend:
```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV
});
```

### 2. Server Monitoring

```bash
# Install monitoring tools
pm2 install pm2-logrotate
pm2 install pm2-server-monit
```

### 3. Uptime Monitoring

Use services like:
- UptimeRobot
- Pingdom
- StatusCake

## Backup Strategy

### 1. Database Backups

```bash
# Daily PostgreSQL backup
pg_dump vaisu > backup-$(date +%Y%m%d).sql
```

### 2. Document Storage

```bash
# Sync to S3
aws s3 sync /path/to/documents s3://vaisu-backups/documents
```

### 3. Configuration Backups

```bash
# Backup .env files (encrypted)
tar -czf config-backup.tar.gz backend/.env
gpg -c config-backup.tar.gz
```

## Security Checklist

- [ ] HTTPS enabled
- [ ] API keys in environment variables
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] File upload size limits
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] Security headers (helmet.js)
- [ ] Regular dependency updates
- [ ] Firewall configured
- [ ] SSH key authentication only
- [ ] Fail2ban installed
- [ ] Regular backups
- [ ] Monitoring and alerts

## Scaling Strategy

### Horizontal Scaling

1. **Multiple Backend Instances**
```bash
pm2 start backend/dist/server.js -i max
```

2. **Load Balancer**
```nginx
upstream backend {
    server localhost:3001;
    server localhost:3002;
    server localhost:3003;
}
```

### Vertical Scaling

- Increase server resources (CPU, RAM)
- Optimize database queries
- Add caching layer
- Use CDN for static assets

### Database Scaling

- Read replicas
- Connection pooling
- Query optimization
- Indexing

## Rollback Procedure

1. **Keep Previous Version**
```bash
pm2 save
cp -r vaisu vaisu-backup
```

2. **Quick Rollback**
```bash
cd vaisu-backup
pm2 delete all
pm2 start ecosystem.config.js
```

3. **Database Rollback**
```bash
psql vaisu < backup-previous.sql
```

## Health Checks

### Backend Health Endpoint

```typescript
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});
```

### Monitoring Script

```bash
#!/bin/bash
# health-check.sh

BACKEND_URL="https://api.your-domain.com/api/health"

response=$(curl -s -o /dev/null -w "%{http_code}" $BACKEND_URL)

if [ $response -eq 200 ]; then
    echo "✓ Backend is healthy"
else
    echo "✗ Backend is down (HTTP $response)"
    # Send alert
    curl -X POST https://hooks.slack.com/... \
      -d '{"text":"Vaisu backend is down!"}'
fi
```

## Troubleshooting Production Issues

### High Memory Usage

```bash
# Check memory
pm2 monit

# Restart if needed
pm2 restart vaisu-backend
```

### Slow Response Times

```bash
# Check logs
pm2 logs vaisu-backend

# Check database
psql -c "SELECT * FROM pg_stat_activity;"
```

### API Rate Limits

```bash
# Check OpenRouter usage
curl https://openrouter.ai/api/v1/auth/key \
  -H "Authorization: Bearer $OPENROUTER_API_KEY"
```

## Cost Optimization

### 1. OpenRouter Costs

- Cache analysis results (24h TTL)
- Use cheaper models for simple tasks
- Batch requests when possible
- Monitor token usage

### 2. Infrastructure Costs

- Use spot instances (AWS)
- Auto-scaling based on traffic
- CDN for static assets
- Optimize database queries

### 3. Monitoring Costs

- Free tier services first
- Essential metrics only
- Log rotation and cleanup

## Maintenance Schedule

### Daily
- Check error logs
- Monitor API usage
- Verify backups

### Weekly
- Review performance metrics
- Update dependencies (security)
- Check disk space

### Monthly
- Full system backup
- Security audit
- Cost review
- Performance optimization

## Support and Monitoring

### Logging

```typescript
// Use structured logging
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### Alerts

Set up alerts for:
- Server down
- High error rate
- High memory usage
- API rate limits
- SSL expiration
- Disk space low

## Post-Deployment Checklist

- [ ] Application accessible
- [ ] HTTPS working
- [ ] API endpoints responding
- [ ] File upload working
- [ ] Analysis completing
- [ ] Visualizations rendering
- [ ] Error handling working
- [ ] Monitoring active
- [ ] Backups configured
- [ ] Alerts set up
- [ ] Documentation updated
- [ ] Team notified

## Getting Help

- Check logs: `pm2 logs`
- Monitor: `pm2 monit`
- Status: `pm2 status`
- Restart: `pm2 restart all`
- Documentation: See README.md
- Issues: GitHub Issues
