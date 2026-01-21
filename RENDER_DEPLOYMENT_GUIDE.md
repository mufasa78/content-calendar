# 🚀 Render Deployment Guide for Malaica Calendar

## Prerequisites

1. **GitHub Repository**: Your code must be pushed to GitHub
2. **Render Account**: Sign up at [render.com](https://render.com)
3. **Environment Variables**: Prepare your production secrets

## 📋 Step-by-Step Deployment

### 1. Connect Repository to Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Blueprint"**
3. Connect your GitHub repository: `mufasa78/content-calendar`
4. Render will automatically detect the `render.yaml` file

### 2. Configure Environment Variables

In the Render dashboard, set these environment variables:

#### 🔐 Clerk Authentication
```
CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
CLERK_SECRET_KEY=sk_live_xxxxx  
VITE_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
```

#### 🗓️ Google Calendar API
```
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=https://your-app.onrender.com/api/google/callback
```

#### 🔑 Optional API Key
```
API_KEY=your_api_key_if_needed
```

### 3. Database Setup

The `render.yaml` automatically provisions:
- **PostgreSQL database** (Starter plan)
- **Automatic connection** via `DATABASE_URL`
- **Database migrations** run on deployment

### 4. Deploy

1. Click **"Apply"** in Render dashboard
2. Render will:
   - Create PostgreSQL database
   - Build your application (`npm ci && npm run build`)
   - Start the service (`npm start`)
   - Run health checks

## 🔍 Verification

### Automatic Health Checks
- **Health endpoint**: `/api/health`
- **Startup checks**: Database connection, cache warming
- **Monitoring**: Response times, error rates

### Manual Verification
Run the verification script:
```bash
node scripts/verify-deployment.js
```

## 🌐 Production URLs

After deployment, your app will be available at:
- **Main App**: `https://your-app-name.onrender.com`
- **Health Check**: `https://your-app-name.onrender.com/api/health`
- **API Endpoints**: `https://your-app-name.onrender.com/api/*`

## ⚡ Performance Optimizations Included

### Server-Side
- **Gzip compression** (60-80% size reduction)
- **Advanced connection pooling** (30 connections)
- **Multi-layer caching** (LRU with smart invalidation)
- **Security headers** (Helmet.js)
- **High-resolution monitoring**

### Database
- **Strategic indexes** for fast queries
- **Connection pooling** with keep-alive
- **Health monitoring**

### Expected Performance
- **First load**: 200-500ms
- **Cached requests**: 10-50ms
- **Database queries**: <100ms
- **Cache hit rate**: 90%+

## 🔧 Configuration Files

### `render.yaml`
- **Web service** configuration
- **Database** provisioning
- **Environment variables** mapping
- **Health checks** setup

### `Dockerfile` (Optional)
- **Multi-stage build** for optimization
- **Security** (non-root user)
- **Health checks** built-in

### `.env.production`
- **Template** for environment variables
- **Documentation** for required secrets

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version (18.x required)
   - Verify all dependencies in `package.json`
   - Check build logs in Render dashboard

2. **Database Connection Issues**
   - Verify `DATABASE_URL` is set automatically
   - Check database service status
   - Review connection pool settings

3. **Environment Variables**
   - Ensure all required variables are set
   - Check Clerk keys are for production
   - Verify Google OAuth redirect URI

4. **Health Check Failures**
   - Check `/api/health` endpoint
   - Verify database connectivity
   - Review application logs

### Debug Commands
```bash
# Check health
curl https://your-app.onrender.com/api/health

# Check auth endpoint
curl https://your-app.onrender.com/api/auth/user

# Run verification
node scripts/verify-deployment.js
```

## 📊 Monitoring

### Built-in Monitoring
- **Response times** logged with ⚡/⚠️ indicators
- **Cache statistics** every 30 minutes
- **Database health** checks
- **Error tracking** with stack traces

### Render Dashboard
- **Metrics**: CPU, memory, response times
- **Logs**: Real-time application logs
- **Alerts**: Automatic notifications for issues

## 🔄 Updates & Maintenance

### Automatic Deployments
- **Push to main branch** → Automatic deployment
- **Database migrations** run automatically
- **Zero-downtime** deployments

### Manual Operations
```bash
# Database migrations
npm run db:push

# Cache cleanup (automatic every 30min)
# Health checks (automatic)
```

## 🎯 Production Checklist

- [ ] Repository connected to Render
- [ ] All environment variables configured
- [ ] Database provisioned and connected
- [ ] Health checks passing
- [ ] SSL certificate active (automatic)
- [ ] Custom domain configured (optional)
- [ ] Monitoring alerts set up
- [ ] Backup strategy in place

## 🚀 Go Live!

Once deployed, your ultra-fast Malaica Calendar will be live with:
- **Lightning-fast performance** (sub-second response times)
- **Enterprise-grade security** (Helmet.js, HTTPS)
- **Automatic scaling** (Render handles traffic spikes)
- **99.9% uptime** (Render SLA)
- **Global CDN** (Fast worldwide access)

Your users will experience **instant UI responses** and **seamless interactions**! 🎉