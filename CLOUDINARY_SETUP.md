# ☁️ Cloudinary Setup Guide

## ✅ Implementation Complete

All code changes have been made to use Cloudinary instead of local uploads.

---

## 📦 Dependencies Installed

The following packages have been added to `package.json`:
- `cloudinary` - Cloudinary SDK
- `multer-storage-cloudinary` - Multer storage adapter for Cloudinary

**To install locally:**
```bash
npm install
```

---

## 🔧 Configuration Required

### Step 1: Create Cloudinary Account

1. Go to https://cloudinary.com/
2. Sign up for a free account
3. Go to Dashboard → Settings

### Step 2: Get Your Credentials

From Cloudinary Dashboard, you'll need:
- **Cloud Name** (e.g., `dxyz123abc`)
- **API Key** (e.g., `123456789012345`)
- **API Secret** (e.g., `abcdefghijklmnopqrstuvwxyz123456`)

### Step 3: Add Environment Variables

Add these to your `.env` file (or Render environment variables):

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Step 4: Render Environment Variables

1. Go to Render Dashboard
2. Select your backend service
3. Go to "Environment" tab
4. Add these three variables:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`

---

## 📁 Files Changed

### ✅ `package.json`
- Added `cloudinary` dependency
- Added `multer-storage-cloudinary` dependency

### ✅ `server/config/cloudinary.js` (NEW)
- Cloudinary configuration file
- Reads credentials from environment variables

### ✅ `server/routes/posts.js`
- Replaced `multer.diskStorage` with `CloudinaryStorage`
- Updated POST route to use `req.file.path` (Cloudinary URL)
- Images now upload to Cloudinary folder: `gossip-posts/`

---

## 🎯 How It Works

1. **Upload**: User uploads image via POST `/api/posts`
2. **Multer**: Intercepts file using `upload.single("image")`
3. **Cloudinary**: Automatically uploads to Cloudinary
4. **Response**: `req.file.path` contains Cloudinary URL (e.g., `https://res.cloudinary.com/...`)
5. **Database**: Cloudinary URL stored in MongoDB
6. **Frontend**: Displays image using Cloudinary URL

---

## ✅ Frontend Compatibility

The frontend already handles Cloudinary URLs correctly:

```javascript
// In client/app.js
<img src="${p.image.startsWith('http') ? p.image : BASE_URL + p.image}">
```

Since Cloudinary URLs start with `https://`, they work automatically!

---

## 🧪 Testing

1. **Start server**:
   ```bash
   npm start
   ```

2. **Test POST with image**:
   - Use Postman or frontend
   - POST to `/api/posts` with FormData
   - Include `image` field with file
   - Check response - should contain Cloudinary URL

3. **Verify in Cloudinary**:
   - Go to Cloudinary Dashboard → Media Library
   - Check `gossip-posts/` folder
   - Your uploaded images should appear there

---

## 🚀 Deployment

1. **Install dependencies on Render**:
   - Render will automatically run `npm install`
   - New dependencies will be installed

2. **Add environment variables**:
   - Add Cloudinary credentials to Render environment

3. **Deploy**:
   - Push to GitHub
   - Render will auto-deploy
   - Images will now upload to Cloudinary!

---

## 📝 Notes

- **Free Tier**: Cloudinary free tier includes:
  - 25 GB storage
  - 25 GB bandwidth/month
  - Perfect for development and small apps

- **Image Formats**: Configured to accept:
  - JPG, PNG, JPEG, GIF, WEBP

- **Folder Structure**: All images stored in `gossip-posts/` folder on Cloudinary

- **No Local Storage**: No need for `uploads/` folder anymore!

---

## ❓ Troubleshooting

### Error: "Invalid API credentials"
- Check that all three environment variables are set correctly
- Verify credentials in Cloudinary Dashboard

### Error: "Upload failed"
- Check file size (Cloudinary free tier: 10 MB max)
- Verify file format is allowed (jpg, png, jpeg, gif, webp)

### Images not displaying
- Check that `req.file.path` is being saved correctly
- Verify Cloudinary URL in database
- Check browser console for image loading errors

---

## ✅ Ready to Deploy!

All code changes are complete. Just add your Cloudinary credentials to Render and you're good to go! 🚀
