# 🔧 Fix "Failed to Fetch" Error

## Problem
Your frontend on Vercel is showing "Failed to fetch" when submitting posts. This means the frontend can't connect to your backend.

## Quick Fix (3 Steps)

### Step 1: Get Your Backend URL
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click on your backend service
3. Copy the URL (e.g., `https://gossip-girl-backend.onrender.com`)

### Step 2: Set Environment Variables in Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your project
3. Go to **Settings** → **Environment Variables**
4. Add these variables:

```
API_BASE_URL = https://your-backend-url.onrender.com
SOCKET_URL = https://your-backend-url.onrender.com
```

**Important:** Replace `your-backend-url.onrender.com` with your actual Render backend URL!

5. Make sure to select **Production**, **Preview**, and **Development** environments
6. Click **Save**

### Step 3: Redeploy
1. In Vercel dashboard, go to **Deployments**
2. Click the **⋯** menu on the latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete

## Alternative: Manual Fix (If Above Doesn't Work)

If the environment variables aren't being injected, you can manually update the files:

### Option A: Update config.js directly
1. Go to your Vercel project
2. Go to **Settings** → **Git**
3. Edit `client/config.js` in your repository
4. Replace:
   ```javascript
   window.API_BASE_URL = window.API_BASE_URL || '%VITE_API_BASE_URL%' || 'https://your-backend-url.onrender.com';
   ```
   With:
   ```javascript
   window.API_BASE_URL = 'https://your-actual-backend-url.onrender.com';
   ```
5. Commit and push - Vercel will auto-deploy

### Option B: Use Browser Console (Temporary Fix)
1. Open your website
2. Open browser console (F12)
3. Run:
   ```javascript
   window.API_BASE_URL = 'https://your-backend-url.onrender.com';
   window.SOCKET_URL = 'https://your-backend-url.onrender.com';
   location.reload();
   ```
4. This is temporary - will reset on page refresh

## Verify Backend is Running

1. Visit your backend URL directly: `https://your-backend.onrender.com/`
2. You should see:
   ```json
   {
     "message": "Gossip Girl API is running...",
     "status": "ok"
   }
   ```
3. If you see an error, your backend isn't running properly

## Check CORS Settings

Make sure in your Render backend, the `CLIENT_URL` environment variable is set to:
```
CLIENT_URL=https://gossip-girls-omega.vercel.app
```

(Replace with your actual Vercel URL)

## Debug Steps

1. **Check Browser Console**
   - Open DevTools (F12)
   - Look for errors
   - Check what `API_BASE_URL` is set to
   - Look for CORS errors

2. **Check Network Tab**
   - Open DevTools → Network
   - Try submitting a post
   - See what URL it's trying to connect to
   - Check the error message

3. **Check Vercel Build Logs**
   - Go to Vercel → Your Project → Deployments
   - Click on latest deployment
   - Check build logs for errors
   - Verify environment variables are being used

4. **Test Backend Directly**
   - Try: `https://your-backend.onrender.com/api/posts`
   - Should return JSON (even if empty array)

## Common Issues

### Issue 1: Environment Variables Not Set
**Solution:** Set them in Vercel dashboard and redeploy

### Issue 2: Wrong Backend URL
**Solution:** Double-check the URL in Render dashboard

### Issue 3: CORS Error
**Solution:** Update `CLIENT_URL` in Render to match your Vercel URL

### Issue 4: Backend Not Running
**Solution:** Check Render dashboard for service status

### Issue 5: Build Script Not Running
**Solution:** The new `config.js` approach should work even if build script fails

## After Fixing

1. Clear browser cache
2. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
3. Try submitting a post again
4. Check browser console for any remaining errors

---

**Need Help?** Check the browser console for specific error messages and share them for more targeted help.
