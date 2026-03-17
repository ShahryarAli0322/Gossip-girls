# Deployment Changes Summary

This document summarizes all changes made to prepare the Gossip Girl project for production deployment.

## Files Modified

### 1. `server/server.js`
**Changes:**
- Added environment variable support for `PORT` (defaults to 5000)
- Updated CORS to use `CLIENT_URL` environment variable
- Updated Socket.IO CORS to use `CLIENT_URL` environment variable
- Added root route (`/`) that returns API status
- Improved server startup logging

**Key Updates:**
```javascript
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000"
const PORT = process.env.PORT || 5000

app.use(cors({
  origin: CLIENT_URL,
  credentials: true
}))

const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ["GET", "POST"],
    credentials: true
  }
})
```

### 2. `client/app.js`
**Changes:**
- Added `API_BASE_URL` configuration at the top
- Updated all `fetch()` calls to use `${API_BASE_URL}/api/...`
- Updated Socket.IO connection to use backend URL
- Fixed image URLs to include backend URL when needed
- Updated push notification API calls

**Updated API Calls:**
- `loadPosts()` - `/api/posts` → `${API_BASE_URL}/api/posts`
- `submitPost()` - `/api/posts` → `${API_BASE_URL}/api/posts`
- `deletePost()` - `/api/posts/:id` → `${API_BASE_URL}/api/posts/:id`
- `react()` - `/api/react/:id` → `${API_BASE_URL}/api/react/:id`
- `reportPost()` - `/api/report/:id` → `${API_BASE_URL}/api/report/:id`
- `followGossipGirl()` - `/api/push/vapid-key` → `${API_BASE_URL}/api/push/vapid-key`
- `followGossipGirl()` - `/api/push/subscribe` → `${API_BASE_URL}/api/push/subscribe`

**Image URL Fix:**
```javascript
// Before: src="${p.image}"
// After: src="${p.image.startsWith('http') ? p.image : API_BASE_URL + p.image}"
```

### 3. `client/admin.js`
**Changes:**
- Added `API_BASE_URL` configuration
- Updated `API_BASE` to use `${API_BASE_URL}/api/admin`
- Updated all fetch calls to use full URLs

**Updated API Calls:**
- All admin API calls now use `${API_BASE}/...`
- Post fetching: `/api/posts` → `${API_BASE_URL}/api/posts`
- Report fetching: `/api/report/posts` → `${API_BASE_URL}/api/report/posts`

### 4. `client/index.html`
**Changes:**
- Replaced hardcoded Socket.IO script with dynamic loading
- Added fallback to CDN if backend fails
- Improved error handling

**Before:**
```html
<script src="http://localhost:5000/socket.io/socket.io.js"></script>
```

**After:**
```javascript
// Dynamically loads Socket.IO from backend URL
// Falls back to CDN if backend is unavailable
```

### 5. `.gitignore` (New File)
**Created to exclude:**
- `node_modules/`
- `.env` files
- `uploads/` folder
- OS and IDE files
- Build and temporary files

### 6. `DEPLOYMENT.md` (New File)
**Comprehensive deployment guide including:**
- Step-by-step instructions for MongoDB Atlas
- Render/Railway backend deployment
- Vercel frontend deployment
- Environment variable configuration
- Troubleshooting guide
- Production checklist

## Environment Variables Required

### Backend (Render/Railway)
```
PORT=10000
MONGO_URI=mongodb+srv://...
CLIENT_URL=https://your-vercel-domain.vercel.app
JWT_SECRET=your-secret-key
EMAIL_PASS=your-gmail-app-password
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
VAPID_EMAIL=mailto:your-email@example.com
```

### Frontend (Vercel) - Optional
```
API_BASE_URL=https://your-backend-url.onrender.com
SOCKET_URL=https://your-backend-url.onrender.com
```

## Configuration Steps After Deployment

1. **Update Backend URL in Frontend:**
   - Option A: Update hardcoded URLs in `client/app.js` and `client/admin.js`
   - Option B: Set environment variables in Vercel and use `window.API_BASE_URL`

2. **Update Frontend URL in Backend:**
   - Set `CLIENT_URL` environment variable in Render/Railway

3. **Test Connections:**
   - Verify API endpoints work
   - Check Socket.IO connection
   - Test image uploads
   - Verify push notifications

## Important Notes

1. **File Uploads on Render Free Tier:**
   - Files are stored in `uploads/` folder
   - On Render free tier, files are **ephemeral** (deleted on restart)
   - Consider using cloud storage (S3, Cloudinary) for production

2. **Socket.IO:**
   - Now connects to backend URL instead of localhost
   - Includes fallback to CDN if backend is unavailable

3. **CORS:**
   - Configured to only allow requests from `CLIENT_URL`
   - Update `CLIENT_URL` in backend after Vercel deployment

4. **Image URLs:**
   - Automatically prepends backend URL if image path doesn't start with `http`
   - Handles both relative and absolute URLs

## Testing Checklist

- [ ] Backend API responds at root route
- [ ] Frontend loads correctly
- [ ] API calls work (create post, delete, react, comment)
- [ ] Socket.IO connects successfully
- [ ] Images load correctly
- [ ] Admin panel works
- [ ] Push notifications work
- [ ] No CORS errors in console
- [ ] No 404 errors for API calls

## Next Steps

1. Deploy backend to Render/Railway
2. Deploy frontend to Vercel
3. Update URLs in code or environment variables
4. Test all functionality
5. Monitor logs for errors
6. Consider adding cloud storage for images

---

**All existing functionality has been preserved. Only API URLs and configuration have been updated for production deployment.**
