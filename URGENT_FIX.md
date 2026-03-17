# 🚨 URGENT FIX: "Failed to Fetch" Error

## The Problem
Your frontend can't connect to your backend because `API_BASE_URL` is not set correctly.

## ⚡ IMMEDIATE FIX (Do This Now)

### Option 1: Set Environment Variables in Vercel (Recommended)

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Click your project**: `gossip-girls-omega`
3. **Go to Settings** → **Environment Variables**
4. **Add these two variables**:

   ```
   Name: API_BASE_URL
   Value: https://YOUR-BACKEND-URL.onrender.com
   ```
   
   ```
   Name: SOCKET_URL  
   Value: https://YOUR-BACKEND-URL.onrender.com
   ```

   **⚠️ IMPORTANT:** Replace `YOUR-BACKEND-URL` with your actual Render backend URL!

5. **Select all environments**: Production, Preview, Development
6. **Click Save**
7. **Redeploy**: Go to Deployments → Click ⋯ → Redeploy

### Option 2: Quick Manual Fix (If Option 1 Doesn't Work)

1. **Find your backend URL** from Render dashboard
2. **Edit `client/config.js`** in your GitHub repository
3. **Replace this line**:
   ```javascript
   window.API_BASE_URL = window.API_BASE_URL || '%VITE_API_BASE_URL%' || 'https://your-backend-url.onrender.com';
   ```
   
   **With your actual backend URL**:
   ```javascript
   window.API_BASE_URL = 'https://your-actual-backend-url.onrender.com';
   ```

4. **Commit and push** - Vercel will auto-deploy

### Option 3: Temporary Browser Fix (For Testing)

1. Open your website: https://gossip-girls-omega.vercel.app
2. Press **F12** to open console
3. Paste this (replace with your backend URL):
   ```javascript
   window.API_BASE_URL = 'https://your-backend-url.onrender.com';
   window.SOCKET_URL = 'https://your-backend-url.onrender.com';
   location.reload();
   ```
4. Try submitting a post

## 🔍 How to Find Your Backend URL

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click on your backend service
3. Copy the URL shown at the top (e.g., `https://gossip-girl-backend-xxxx.onrender.com`)

## ✅ Verify It's Fixed

1. Open browser console (F12)
2. Type: `window.API_BASE_URL`
3. Should show your backend URL (not the placeholder)
4. Try submitting a post - should work now!

## 🆘 Still Not Working?

1. **Check backend is running**: Visit your backend URL directly
   - Should show: `{"message":"Gossip Girl API is running...","status":"ok"}`

2. **Check CORS**: In Render, make sure `CLIENT_URL` is set to:
   ```
   https://gossip-girls-omega.vercel.app
   ```

3. **Check browser console** for specific error messages

4. **Check Network tab** in DevTools to see what URL it's trying to connect to

---

**The root cause**: The environment variables weren't injected during build, so the frontend is trying to connect to `https://your-backend-url.onrender.com` (placeholder) instead of your actual backend.

**The solution**: Set the environment variables in Vercel and redeploy, or manually update `client/config.js` with your backend URL.
