# Deployment Guide - Gossip Girl

This guide will help you deploy the Gossip Girl application to production.

## Architecture

- **Frontend**: Vercel
- **Backend**: Render (or Railway)
- **Database**: MongoDB Atlas
- **File Storage**: Local (uploads folder on backend)

---

## Prerequisites

1. MongoDB Atlas account: https://www.mongodb.com/cloud/atlas
2. Vercel account: https://vercel.com
3. Render account: https://render.com (or Railway: https://railway.app)
4. GitHub repository (optional but recommended)

---

## Step 1: MongoDB Atlas Setup

1. Go to https://cloud.mongodb.com/
2. Create a new cluster (free tier is fine)
3. Create a database user (Database Access)
4. Whitelist IP addresses (Network Access) - Add `0.0.0.0/0` for Render
5. Get connection string:
   - Click "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Example: `mongodb+srv://username:password@cluster.mongodb.net/gossip-girl?retryWrites=true&w=majority`

---

## Step 2: Backend Deployment (Render)

### Option A: Render

1. Go to https://render.com and sign up/login
2. Click "New +" → "Web Service"
3. Connect your GitHub repository (or deploy manually)
4. Configure:
   - **Name**: `gossip-girl-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server/server.js`
   - **Plan**: Free tier is fine

5. Add Environment Variables:
   ```
   PORT=10000
   MONGO_URI=your_mongodb_atlas_connection_string
   CLIENT_URL=https://your-vercel-domain.vercel.app
   JWT_SECRET=your-random-secret-key
   EMAIL_PASS=your_gmail_app_password
   VAPID_PUBLIC_KEY=your_vapid_public_key
   VAPID_PRIVATE_KEY=your_vapid_private_key
   VAPID_EMAIL=mailto:your-email@example.com
   ```

6. Click "Create Web Service"
7. Wait for deployment (5-10 minutes)
8. Copy your backend URL (e.g., `https://gossip-girl-backend.onrender.com`)

### Option B: Railway

1. Go to https://railway.app and sign up/login
2. Click "New Project" → "Deploy from GitHub"
3. Select your repository
4. Add environment variables (same as Render)
5. Deploy and copy the backend URL

---

## Step 3: Frontend Deployment (Vercel)

1. Go to https://vercel.com and sign up/login
2. Click "Add New" → "Project"
3. Import your GitHub repository (or upload manually)
4. Configure:
   - **Framework Preset**: Other
   - **Root Directory**: `client`
   - **Build Command**: (leave empty - static files)
   - **Output Directory**: `.` (current directory)

5. Add Environment Variables:
   ```
   API_BASE_URL=https://your-backend-url.onrender.com
   SOCKET_URL=https://your-backend-url.onrender.com
   ```

6. Click "Deploy"
7. Wait for deployment (2-3 minutes)
8. Copy your frontend URL (e.g., `https://gossip-girl.vercel.app`)

---

## Step 4: Update Configuration

### Update Backend Environment Variables

Go back to Render/Railway and update:
```
CLIENT_URL=https://your-vercel-domain.vercel.app
```

### Update Frontend Code

1. In `client/app.js`, update line 2:
   ```javascript
   const API_BASE_URL = "https://your-backend-url.onrender.com"
   ```

2. In `client/admin.js`, update line 4:
   ```javascript
   const API_BASE_URL = "https://your-backend-url.onrender.com"
   ```

3. In `client/index.html`, update the Socket.IO script (around line 1470):
   ```javascript
   const API_BASE_URL = "https://your-backend-url.onrender.com"
   ```

### Alternative: Use Environment Variables in Vercel

Instead of hardcoding, you can use Vercel's environment variables:

1. In Vercel dashboard → Settings → Environment Variables
2. Add:
   - `API_BASE_URL` = `https://your-backend-url.onrender.com`
   - `SOCKET_URL` = `https://your-backend-url.onrender.com`

3. Update `client/app.js`:
   ```javascript
   const API_BASE_URL = window.API_BASE_URL || "https://your-backend-url.onrender.com"
   ```

---

## Step 5: File Uploads Setup

### Important: Render Free Tier Limitation

Render's free tier has **ephemeral storage** - files are deleted when the service restarts.

**Solutions:**

1. **Use Cloud Storage** (Recommended):
   - AWS S3
   - Cloudinary
   - Uploadcare

2. **Use Persistent Disk** (Render paid plan):
   - Upgrade to paid plan
   - Mount persistent disk

3. **Use Railway** (Better for file storage):
   - Railway has persistent storage on free tier
   - Files persist across restarts

### For Now (Testing):

The current setup will work, but uploaded images will be lost on restart. This is fine for testing.

---

## Step 6: Generate VAPID Keys (Push Notifications)

Run this command locally:

```bash
npm install web-push
node -e "const webpush = require('web-push'); const keys = webpush.generateVAPIDKeys(); console.log('Public:', keys.publicKey); console.log('Private:', keys.privateKey);"
```

Copy the keys to your backend environment variables.

---

## Step 7: Verify Deployment

1. **Test Frontend**: Visit your Vercel URL
2. **Test API**: Visit `https://your-backend-url.onrender.com/` - should show "API is running..."
3. **Test Socket.IO**: Open browser console, check for Socket.IO connection
4. **Test Image Upload**: Try uploading an image (may not persist on Render free tier)

---

## Troubleshooting

### CORS Errors

- Make sure `CLIENT_URL` in backend matches your Vercel URL exactly
- Check for trailing slashes
- Ensure both URLs use HTTPS

### Socket.IO Connection Failed

- Check that Socket.IO URL matches backend URL
- Verify CORS settings in `server.js`
- Check browser console for errors

### Images Not Loading

- Verify image URLs include full backend URL
- Check that uploads folder is accessible
- On Render free tier, images may be lost on restart

### MongoDB Connection Failed

- Verify connection string is correct
- Check IP whitelist in MongoDB Atlas
- Ensure password is URL-encoded if it contains special characters

### Environment Variables Not Working

- Restart the service after adding variables
- Check variable names match exactly (case-sensitive)
- Verify no extra spaces or quotes

---

## Production Checklist

- [ ] MongoDB Atlas cluster created and configured
- [ ] Backend deployed to Render/Railway
- [ ] Frontend deployed to Vercel
- [ ] Environment variables set in both services
- [ ] CORS configured correctly
- [ ] Socket.IO connection working
- [ ] Image uploads working (or cloud storage configured)
- [ ] Push notifications configured (VAPID keys)
- [ ] Admin panel accessible
- [ ] All API endpoints tested

---

## Next Steps (Optional Improvements)

1. **Add Cloud Storage** for persistent image uploads
2. **Set up CI/CD** with GitHub Actions
3. **Add monitoring** (Sentry, LogRocket)
4. **Configure custom domains**
5. **Set up SSL certificates** (usually automatic)
6. **Add rate limiting** for API endpoints
7. **Implement caching** for better performance

---

## Support

If you encounter issues:
1. Check backend logs in Render/Railway dashboard
2. Check frontend logs in Vercel dashboard
3. Check browser console for errors
4. Verify all environment variables are set correctly

Good luck with your deployment! 🚀
