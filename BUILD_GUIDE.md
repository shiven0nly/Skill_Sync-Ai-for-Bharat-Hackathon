# Build & Deployment Guide

## ✅ Build Status
Both backend and frontend build successfully!

## 🚀 Quick Build Commands

### Build Everything
```bash
npm run build:all
```

### Install All Dependencies
```bash
npm run install:all
```

### Build Backend Only
```bash
npm run build
```

### Build Frontend Only
```bash
cd frontend
npm run build
```

## 📦 Build Output

- **Backend**: `dist/` directory (TypeScript compiled to JavaScript)
- **Frontend**: `frontend/.next/` directory (Next.js optimized build)

## 🌐 Deployment Options

### Option 1: Vercel (Recommended for Next.js)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy frontend:
```bash
cd frontend
vercel --prod
```

### Option 2: Netlify

1. Install Netlify CLI:
```bash
npm i -g netlify-cli
```

2. Deploy frontend:
```bash
cd frontend
netlify deploy --prod --dir=.next
```

### Option 3: Docker

Create a `Dockerfile` in the root:
```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY frontend/package*.json ./frontend/

# Install dependencies
RUN npm install
RUN cd frontend && npm install

# Copy source
COPY . .

# Build
RUN npm run build:all

EXPOSE 3000

CMD ["npm", "run", "server"]
```

Build and run:
```bash
docker build -t skill-sync .
docker run -p 3000:3000 skill-sync
```

## 🔧 Common Deployment Issues & Fixes

### Issue: "Module not found" errors
**Fix**: Run `npm run install:all` to ensure all dependencies are installed

### Issue: TypeScript compilation errors
**Fix**: Check `tsconfig.json` and ensure all source files are included

### Issue: Next.js build fails
**Fix**: 
- Clear cache: `cd frontend && rm -rf .next node_modules && npm install`
- Rebuild: `npm run build`

### Issue: Port already in use
**Fix**: Change port in deployment config or kill existing process

## 📝 Pre-Deployment Checklist

- [ ] Run `npm run install:all`
- [ ] Run `npm run build:all` 
- [ ] Test backend: `npm run server`
- [ ] Test frontend: `cd frontend && npm run start`
- [ ] Check environment variables
- [ ] Update API endpoints in frontend if needed

## 🎯 Production Environment Variables

Create `.env.production` in frontend:
```env
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

## 📊 Build Verification

Both builds completed successfully:
- ✅ Backend: TypeScript compiled without errors
- ✅ Frontend: Next.js build optimized and ready
- ✅ Static pages generated
- ✅ Type checking passed
