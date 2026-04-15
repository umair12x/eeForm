# Setup & Installation Guide

Complete guide for setting up the E-Enrollment system locally or for deployment.

---

## 📋 Prerequisites

### Required Software
- **Node.js**: v18.0.0 or higher ([Download](https://nodejs.org/))
- **npm** or **pnpm**: Latest version (pnpm recommended for faster installs)
- **Git**: For version control
- **MongoDB**: Local instance or Atlas connection string

### Services & Accounts
- **MongoDB Atlas Account** (or local MongoDB server)
- **Cloudinary Account** (for file/image storage)
- **Vercel Account** (optional, for deployment)

### System Requirements
- **RAM**: Minimum 2GB (development), 4GB+ (production)
- **Disk Space**: 1-2GB for node_modules
- **OS**: Windows, macOS, or Linux

---

## ⚙️ Installation Steps

### 1. Clone Repository

```bash
git clone https://github.com/your-repo/eeform.git
cd eeForm
```

### 2. Install Dependencies

Using **pnpm** (recommended):
```bash
pnpm install
```

Or using **npm**:
```bash
npm install
```

### 3. Create Environment File

Create `.env.local` in the project root directory:

```bash
# .env.local

# ==================== CRITICAL ====================
# Change these in production!

# Authentication & Security
JWT_SECRET=your-complex-secret-key-change-in-production-12345

# Database Configuration
mongodb_url=mongodb+srv://<username>:<password>@cluster.mongodb.net/eeformDB?retryWrites=true&w=majority
# OR for local:
# mongodb_url=mongodb://localhost:27017/eeformDB

# Cloudinary (File Storage)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=123456789
CLOUDINARY_API_SECRET=your-api-secret

# Application URL (for email links, etc.)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Environment Mode
NODE_ENV=development
```

### Environment Variables Explained

| Variable | Purpose | Example |
|----------|---------|---------|
| `JWT_SECRET` | Secret for signing JWT tokens | `your-secret-key` |
| `mongodb_url` | MongoDB connection string | `mongodb://...` |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud identifier | `yourcloud` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `123456789` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `abc123xyz` |
| `NEXT_PUBLIC_APP_URL` | Application base URL | `http://localhost:3000` |
| `NODE_ENV` | Environment mode | `development` \| `production` |

### 4. Verify MongoDB Connection

**Option A: MongoDB Atlas (Cloud)**

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a cluster (free tier available)
3. Create a database user
4. Click "Connect" → copy connection string
5. Add to `.env.local` as `mongodb_url`

**Option B: Local MongoDB**

```bash
# Windows (with MongoDB installed)
mongod

# macOS (with Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

Verify connection:
```bash
mongosh "mongodb://localhost:27017"
```

### 5. Setup Cloudinary

1. Go to [Cloudinary Console](https://cloudinary.com/console)
2. Copy your **Cloud Name**, **API Key**, and **API Secret**
3. Add to `.env.local`

---

## 🚀 Running the Application

### Development Server

```bash
pnpm dev
```

Server starts at `http://localhost:3000`

Terminal output:
```
▲ Next.js 15.5.6 with Turbopack
✓ Ready in 1.2s
```

**Features in dev mode:**
- Hot module reloading
- Source maps for debugging
- Detailed error messages

### Production Build

```bash
# Build the application
pnpm build

# Start production server
pnpm start
```

---

## ✓ Verify Installation

Run these checks to ensure proper setup:

### 1. Check Dependencies
```bash
pnpm list
```

### 2. Test Database Connection

Create a test file:
```bash
# Create test.js
node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.mongodb_url)
  .then(() => console.log('✓ MongoDB connected'))
  .catch(e => console.log('✗ Connection failed:', e.message))
"
```

### 3. Test the Server

Navigate to `http://localhost:3000`:
- [ ] Public pages load (Home, About, Contact)
- [ ] Login page accessible at `/login`
- [ ] Can access database via console logs

### 4. Lint Check

```bash
pnpm lint
```

Should show no critical errors.

---

## 📋 Common Issues & Solutions

### Issue 1: "MongoDB connection failed"

**Symptoms**: Error during `pnpm dev`

**Solutions**:
```bash
# 1. Verify connection string format
# Should be: mongodb+srv://user:pass@cluster.mongodb.net/dbname

# 2. Check if local MongoDB is running
mongosh "mongodb://localhost:27017"

# 3. Verify credentials (especially special characters - they must be URL encoded)
# Use: https://www.mongodb.com/docs/manual/reference/connection-string-uri-format/

# 4. Add retryWrites parameter:
mongodb_url=mongodb+srv://user:pass@cluster.mongodb.net/eeformDB?retryWrites=true&w=majority
```

### Issue 2: "Module not found" or "Cannot find package"

**Solutions**:
```bash
# 1. Clear cache and reinstall
pnpm store prune
pnpm install

# 2. Or use npm
rm -rf node_modules package-lock.json
npm install
```

### Issue 3: Port 3000 Already in Use

**Solutions**:
```bash
# Run on different port
pnpm dev -- -p 3001

# Or kill process using port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -i :3000
kill -9 <PID>
```

### Issue 4: "CLOUDINARY_API_SECRET is not defined"

**Solutions**:
```bash
# 1. Verify it's in .env.local (not .env)
cat .env.local | grep CLOUDINARY

# 2. Restart dev server after adding variables
# Ctrl+C to stop, then pnpm dev again

# 3. For Next.js server-side only variables, don't use NEXT_PUBLIC_ prefix
# CORRECT: CLOUDINARY_API_SECRET=...
# WRONG:   NEXT_PUBLIC_CLOUDINARY_API_SECRET=...
```

### Issue 5: "Turbopack compiler error"

**Solutions**:
```bash
# Disable Turbopack temporarily
# Edit package.json:
"dev": "next dev"  # Remove --turbopack flag

# Or clear Next.js cache:
rm -rf .next
pnpm dev --turbopack
```

---

## 🔧 Environment-Specific Setup

### Development Environment

```bash
NODE_ENV=development
JWT_SECRET=dev-secret-key-not-for-production
mongodb_url=mongodb://localhost:27017/eeformDB
```

**Features enabled:**
- Hot-reload
- Detailed error pages
- Debug logging
- CORS relaxed

### Staging Environment

```bash
NODE_ENV=production
JWT_SECRET=your-real-secret-key
mongodb_url=mongodb+srv://staging-user:pass@cluster.mongodb.net/eeformDB
NEXT_PUBLIC_APP_URL=https://staging.eeform.com
```

### Production Environment

```bash
NODE_ENV=production
JWT_SECRET=your-production-secret-key
mongodb_url=mongodb+srv://prod-user:pass@cluster-prod.mongodb.net/eeformDB
NEXT_PUBLIC_APP_URL=https://eeform.university.edu.pk
```

⚠️ **IMPORTANT**: In production, ensure:
- `JWT_SECRET` is a minimum 32 characters
- `mongodb_url` uses strong credentials
- `.env.local` is in `.gitignore`
- Set `NODE_ENV=production`

---

## 📦 Deployment to Vercel

### Option 1: Using Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel
```

### Option 2: Using GitHub Integration

1. Push code to GitHub repository
2. Connect repository to Vercel dashboard
3. Add environment variables in Vercel settings
4. Vercel auto-deploys on push to main branch

### Environment Variables in Vercel

1. Go to **Settings** → **Environment Variables**
2. Add each variable from `.env.local`:
   - `JWT_SECRET`
   - `mongodb_url`
   - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`

3. Select environments: Production, Preview, Development

### Vercel Deployment Checklist

- [ ] `.env.local` added to `.gitignore`
- [ ] All environment variables configured in Vercel dashboard
- [ ] Database connection tested with production credentials
- [ ] Cloudinary API keys verified
- [ ] Build completes without errors: `pnpm build`
- [ ] No console errors in production build

---

## 🔍 Troubleshooting Deployment

### Build Fails on Vercel

```bash
# Test build locally first
pnpm build

# Check for:
# - TypeScript errors
# - Missing dependencies
# - Hard-coded absolute paths
```

### Database Connection Fails in Production

```bash
# Verify:
# 1. MongoDB connection string is correct in Vercel env vars
# 2. IP whitelist includes Vercel IPs
#    See: https://vercel.com/docs/concepts/deployments/environment-variables#ip-address

# 3. Database credentials haven't changed
# 4. Connection string includes database name:
#    mongodb+srv://user:pass@cluster.mongodb.net/eeformDB
```

### Cloudinary Images Not Loading

```bash
# Check:
# 1. Cloud name is correct (public, no dashes, lowercase)
# 2. API key is valid
# 3. Images uploaded to Cloudinary account
# 4. CORS settings allow Vercel domain
```

---

## 📚 Next Steps

After setup completes:

1. **Review Architecture**: See [workflow.md](./workflow.md)
2. **Explore API**: Check [api.md](./api.md)
3. **Understand Roles**: Read [roles.md](./roles.md)
4. **Create Admin User**: Run setup script or use admin API endpoint

---

## 🆘 Getting Help

**Setup stuck?** Try these:

1. Check `.env.local` exists and has all required variables
2. Run `pnpm install` again
3. Clear cache: `rm -rf .next node_modules`
4. Ensure MongoDB is running and accessible
5. Check that ports 3000 (Next.js) and 27017 (MongoDB) are available

**For more info**: See [README.md](../README.md) or [workflow.md](./workflow.md)

---

**Last Updated**: April 2024  
**Supported Node**: v18.0.0+  
**Package Manager**: pnpm (recommended)
