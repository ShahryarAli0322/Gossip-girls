# Vercel + Render Deployment Guide

Complete step-by-step guide to deploy Gossip Girl on Vercel (frontend) and Render (backend).

## 🎯 Architecture

- **Frontend**: Vercel (Static hosting)
- **Backend**: Render (Node.js service)
- **Database**: MongoDB Atlas
- **File Storage**: Render filesystem (ephemeral on free tier)

---

## 📋 Prerequisites

1. **GitHub Account** - For repository hosting
2. **Vercel Account** - [Sign up here](https://vercel.com/signup)
3. **Render Account** - [Sign up here](https://render.com)
4. **MongoDB Atlas Account** - [Sign up here](https://www.mongodb.com/cloud/atlas)

---

## 🚀 Step 1: Prepare Your Code

### 1.1 Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: Ready for deployment"
git branch -M main
git remote add origin https://github.com/yourusername/gossip-girl.git
git push -u origin main
```

### 1.2 Verify Files

Ensure these files exist:
- ✅ `vercel.json` - Vercel configuration
- ✅ `render.yaml` - Render configuration
- ✅ `.env.example` - Environment variables template
- ✅ `package.json` - With build script

---

## 🗄️ Step 2: MongoDB Atlas Setup

1. **Create Cluster**
   - Go to [MongoDB Atlas](https://cloud.mongodb.com/)
   - Click "Create" → "Cluster"
   - Choose free tier (M0)
   - Select region closest to your users

2. **Create Database User**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Username: `gossip-girl-admin`
   - Password: Generate secure password (save it!)
   - Database User Privileges: "Read and write to any database"

3. **Network Access**
   - Go to "Network Access"
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - This allows Render to connect

4. **Get Connection String**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Example: `mongodb+srv://gossip-girl-admin:yourpassword@cluster0.xxxxx.mongodb.net/gossip-girl?retryWrites=true&w=majority`

---

## ⚙️ Step 3: Deploy Backend to Render

### 3.1 Create Web Service

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select the repository

### 3.2 Configure Service

**Basic Settings:**
- **Name**: `gossip-girl-backend`
- **Region**: Choose closest to your users
- **Branch**: `main`
- **Root Directory**: (leave empty - root)
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `node server/server.js`
- **Plan**: Free (or paid for persistent storage)

### 3.3 Environment Variables

Click "Environment" tab and add:

```env
NODE_ENV=production
PORT=10000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/gossip-girl?retryWrites=true&w=majority
CLIENT_URL=https://your-vercel-app.vercel.app
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
EMAIL_PASS=your-gmail-app-password
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
VAPID_EMAIL=mailto:your-email@example.com
```

**Important:**
- Replace `MONGO_URI` with your actual connection string
- Replace `CLIENT_URL` with your Vercel URL (you'll update this after frontend deployment)
- Generate `JWT_SECRET`: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- Generate VAPID keys: `node -e "const webpush = require('web-push'); const keys = webpush.generateVAPIDKeys(); console.log('Public:', keys.publicKey); console.log('Private:', keys.privateKey);"`

### 3.4 Deploy

1. Click "Create Web Service"
2. Wait for deployment (5-10 minutes)
3. Copy your backend URL: `https://gossip-girl-backend.onrender.com`

---

## 🎨 Step 4: Deploy Frontend to Vercel

### 4.1 Import Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Select the repository

### 4.2 Configure Project

**Project Settings:**
- **Framework Preset**: Other
- **Root Directory**: `./` (root)
- **Build Command**: `npm run build:client`
- **Output Directory**: `client`
- **Install Command**: `npm install`

### 4.3 Environment Variables

Go to "Environment Variables" and add:

```env
API_BASE_URL=https://gossip-girl-backend.onrender.com
SOCKET_URL=https://gossip-girl-backend.onrender.com
```

**Important:**
- Replace with your actual Render backend URL
- These will be injected into your client files during build

### 4.4 Deploy

1. Click "Deploy"
2. Wait for build (2-3 minutes)
3. Copy your frontend URL: `https://gossip-girl.vercel.app`

---

## 🔄 Step 5: Update Backend with Frontend URL

1. Go back to Render dashboard
2. Edit your web service
3. Go to "Environment" tab
4. Update `CLIENT_URL`:
   ```env
   CLIENT_URL=https://gossip-girl.vercel.app
   ```
5. Save changes (will trigger redeploy)

---

## ✅ Step 6: Verify Deployment

### 6.1 Test Backend

Visit: `https://your-backend-url.onrender.com/`

Should see:
```json
{
  "message": "Gossip Girl API is running...",
  "status": "ok"
}
```

### 6.2 Test Frontend

1. Visit your Vercel URL
2. Try creating a post
3. Check browser console for errors
4. Verify Socket.IO connection

### 6.3 Test Admin Panel

1. Visit: `https://your-vercel-url.vercel.app/admin`
2. Create admin account
3. Test admin features

---

## 🔧 Troubleshooting

### CORS Errors

**Problem**: Frontend can't connect to backend

**Solution**:
1. Verify `CLIENT_URL` in Render matches your Vercel URL exactly
2. Check for trailing slashes
3. Ensure both use HTTPS

### Socket.IO Connection Failed

**Problem**: Real-time updates not working

**Solution**:
1. Check `SOCKET_URL` in Vercel environment variables
2. Verify Socket.IO script loads in browser console
3. Check Render logs for Socket.IO errors

### Images Not Loading

**Problem**: Uploaded images don't display

**Solution**:
1. On Render free tier, images are ephemeral (lost on restart)
2. Consider using cloud storage (S3, Cloudinary) for production
3. For now, images will work but may be lost on restart

### Environment Variables Not Working

**Problem**: API calls fail or use wrong URL

**Solution**:
1. Verify environment variables are set in Vercel
2. Check build logs to see if variables were injected
3. Redeploy after adding/changing variables

### MongoDB Connection Failed

**Problem**: Backend can't connect to database

**Solution**:
1. Verify connection string is correct
2. Check IP whitelist in MongoDB Atlas (should include 0.0.0.0/0)
3. Ensure password is URL-encoded if it contains special characters
4. Check Render logs for connection errors

---

## 📊 Monitoring

### Render Logs

1. Go to Render dashboard
2. Click on your service
3. Click "Logs" tab
4. Monitor for errors

### Vercel Analytics

1. Go to Vercel dashboard
2. Click on your project
3. View "Analytics" for traffic data

---

## 🔐 Security Checklist

- [ ] JWT_SECRET is strong and unique
- [ ] MongoDB password is secure
- [ ] CORS is properly configured
- [ ] Environment variables are not exposed in client code
- [ ] Admin routes are protected
- [ ] File uploads are validated

---

## 🚀 Next Steps

1. **Custom Domain** (Optional)
   - Add custom domain in Vercel
   - Update `CLIENT_URL` in Render

2. **Cloud Storage** (Recommended)
   - Set up AWS S3 or Cloudinary
   - Update image upload logic

3. **Monitoring** (Optional)
   - Set up error tracking (Sentry)
   - Add analytics (Google Analytics)

4. **CI/CD** (Optional)
   - Automatic deployments on git push
   - Already configured with Vercel and Render

---

## 📝 Quick Reference

### Backend URL
```
https://your-backend-name.onrender.com
```

### Frontend URL
```
https://your-project-name.vercel.app
```

### Environment Variables Needed

**Render (Backend):**
- `MONGO_URI`
- `CLIENT_URL`
- `JWT_SECRET`
- `EMAIL_PASS`
- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_EMAIL`

**Vercel (Frontend):**
- `API_BASE_URL`
- `SOCKET_URL`

---

## 🎉 Success!

Your Gossip Girl app is now live! 

- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-backend.onrender.com`
- Admin: `https://your-app.vercel.app/admin`

Enjoy your deployed application! 🚀
