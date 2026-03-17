# 🔧 Troubleshooting "Failed to Fetch" Error

## Current Status
- ✅ Environment variables set in Vercel: `API_BASE_URL` and `SOCKET_URL`
- ✅ Backend URL: `https://gossip-girls.onrender.com`
- ❌ Still getting "Failed to fetch" error

## Most Likely Issue: CORS Configuration

The backend on Render needs to have `CLIENT_URL` set to your Vercel frontend URL.

### Fix CORS in Render:

1. **Go to Render Dashboard**: https://dashboard.render.com/
2. **Click on your backend service** (`gossip-girls`)
3. **Go to Environment tab**
4. **Check/Update `CLIENT_URL`**:
   ```
   CLIENT_URL=https://gossip-girls-omega.vercel.app
   ```
   (Replace with your actual Vercel URL)
5. **Save** - This will trigger a redeploy

## Step-by-Step Debugging

### 1. Check Backend is Running
Visit: `https://gossip-girls.onrender.com/`

Should see:
```json
{
  "message": "Gossip Girl API is running...",
  "status": "ok"
}
```

If you see an error, your backend isn't running properly.

### 2. Check Browser Console
1. Open your Vercel site
2. Press F12 → Console tab
3. Look for:
   - `API_BASE_URL` value
   - Any CORS errors
   - Network errors

### 3. Check Network Tab
1. Press F12 → Network tab
2. Try submitting a post
3. Look for the request to `/api/posts`
4. Check:
   - Request URL (should be `https://gossip-girls.onrender.com/api/posts`)
   - Status code
   - Error message

### 4. Test Backend Directly
Open browser console and run:
```javascript
fetch('https://gossip-girls.onrender.com/')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

Should return: `{message: "Gossip Girl API is running...", status: "ok"}`

### 5. Test CORS
Open browser console and run:
```javascript
fetch('https://gossip-girls.onrender.com/api/posts', {
  method: 'GET',
  headers: {'Content-Type': 'application/json'}
})
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

If you see a CORS error, the `CLIENT_URL` in Render is wrong.

## Common Issues & Solutions

### Issue 1: CORS Error
**Error**: `Access to fetch at '...' from origin '...' has been blocked by CORS policy`

**Solution**: 
- Update `CLIENT_URL` in Render to match your Vercel URL exactly
- Make sure there's no trailing slash
- Both should use HTTPS

### Issue 2: Backend Not Running
**Error**: `Failed to fetch` or `Network error`

**Solution**:
- Check Render dashboard - is service running?
- Check Render logs for errors
- Verify MongoDB connection is working

### Issue 3: Wrong API_BASE_URL
**Error**: Console shows `window.API_BASE_URL` is still placeholder

**Solution**:
1. The files are updated locally but not deployed
2. Commit and push changes:
   ```bash
   git add .
   git commit -m "Fix API_BASE_URL"
   git push
   ```
3. Wait for Vercel to redeploy

### Issue 4: Environment Variables Not Working
**Error**: Build script didn't inject variables

**Solution**:
- The files are now hardcoded, so this shouldn't be an issue
- But if needed, check Vercel build logs to see if build script ran

## Quick Test Commands

### In Browser Console:
```javascript
// Check current API_BASE_URL
console.log('API_BASE_URL:', window.API_BASE_URL)

// Test backend connection
fetch('https://gossip-girls.onrender.com/')
  .then(r => r.text())
  .then(console.log)

// Test API endpoint
fetch('https://gossip-girls.onrender.com/api/posts')
  .then(r => r.json())
  .then(console.log)
```

## Next Steps

1. **Verify CORS** - Most important! Check `CLIENT_URL` in Render
2. **Check Backend Logs** - Look for errors in Render dashboard
3. **Test Backend Directly** - Visit backend URL in browser
4. **Check Browser Console** - Look for specific error messages
5. **Redeploy** - After fixing CORS, redeploy both frontend and backend

---

**Most likely fix**: Update `CLIENT_URL` in Render to match your Vercel URL!
