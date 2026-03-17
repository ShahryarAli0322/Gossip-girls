# 🔑 Environment Variables Setup Guide

## Quick Reference

### ✅ **REQUIRED** Variables (Must Have)

These are **essential** for the app to work:

```env
# Database
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/gossip-girl?retryWrites=true&w=majority

# Frontend URL (for CORS)
CLIENT_URL=https://gossip-girls-omega.vercel.app

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### ⚙️ **OPTIONAL** Variables (Have Defaults)

These have default values but you can customize:

```env
# Server
PORT=5000  # Render sets this automatically

# Admin Auth
JWT_SECRET=your-random-secret-key

# Email (for admin features)
EMAIL_PASS=your_gmail_app_password
FRONTEND_URL=https://your-vercel-app.vercel.app

# Push Notifications
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_EMAIL=mailto:your-email@example.com
```

---

## 📝 Step-by-Step Setup

### 1. Create `.env` File

```bash
# Copy the template
cp .env.template .env

# Or create manually
touch .env
```

### 2. Add Required Variables

#### **MONGO_URI** (MongoDB Atlas)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster (free tier available)
3. Create database user (save password!)
4. Network Access → Add IP: `0.0.0.0/0` (allow all)
5. Get connection string:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/gossip-girl?retryWrites=true&w=majority
   ```
6. Replace `<password>` with your actual password

#### **CLIENT_URL** (Your Vercel Frontend)

```
CLIENT_URL=https://gossip-girls-omega.vercel.app
```

#### **CLOUDINARY** (Image Storage)

1. Go to [Cloudinary](https://cloudinary.com/)
2. Sign up (free tier available)
3. Go to Dashboard → Settings
4. Copy:
   - **Cloud Name** → `CLOUDINARY_CLOUD_NAME`
   - **API Key** → `CLOUDINARY_API_KEY`
   - **API Secret** → `CLOUDINARY_API_SECRET`

### 3. Add Optional Variables (If Needed)

#### **JWT_SECRET** (Admin Authentication)

Generate a random string:
```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or use online generator
# https://randomkeygen.com/
```

#### **EMAIL_PASS** (Gmail App Password)

1. Enable 2FA on your Gmail account
2. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
3. Generate password for "Mail"
4. Copy the 16-character password

---

## 🚀 For Render Deployment

Add these in **Render Dashboard** → **Environment** tab:

### Required:
- ✅ `MONGO_URI`
- ✅ `CLIENT_URL`
- ✅ `CLOUDINARY_CLOUD_NAME`
- ✅ `CLOUDINARY_API_KEY`
- ✅ `CLOUDINARY_API_SECRET`

### Optional:
- `JWT_SECRET` (recommended for production)
- `EMAIL_PASS` (if using admin email features)
- `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_EMAIL` (if using push notifications)

**Note**: Render automatically sets `PORT`, so you don't need to add it.

---

## 🧪 Testing Your .env

After creating `.env`, test locally:

```bash
# Start server
npm start

# Check console for:
# ✅ MongoDB Atlas Connected
# ✅ Server running on port 5000
# ✅ CORS enabled for: https://your-app.vercel.app
```

If you see errors about missing variables, check your `.env` file.

---

## ⚠️ Important Notes

1. **Never commit `.env` to Git!**
   - It's already in `.gitignore`
   - Contains sensitive credentials

2. **Use different values for production**
   - Don't use localhost URLs in production
   - Use strong JWT_SECRET in production

3. **Render Environment Variables**
   - Add all variables in Render Dashboard
   - Don't rely on `.env` file in production
   - Render doesn't use `.env` file

---

## 📋 Complete .env Example

```env
# Server
PORT=5000

# Database
MONGO_URI=mongodb+srv://admin:MyPassword123@cluster0.abc123.mongodb.net/gossip-girl?retryWrites=true&w=majority

# Frontend
CLIENT_URL=https://gossip-girls-omega.vercel.app

# Cloudinary
CLOUDINARY_CLOUD_NAME=dxyz123abc
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz123456

# Admin
JWT_SECRET=my-super-secret-jwt-key-32-chars-minimum
EMAIL_PASS=abcd efgh ijkl mnop
FRONTEND_URL=https://gossip-girls-omega.vercel.app

# Push Notifications
VAPID_PUBLIC_KEY=BIHe_BaIusrvCOnmEVncLNW_zkuq8l57lcJ1mVJQk9rU5LrR2iHsxVrdIOLoiQsode-5oT6d4VDUyu20ChW2rsI
VAPID_PRIVATE_KEY=ndnUCorChRl7K11rRVCys-2KSPxE6rEDMBP35z7DtZg
VAPID_EMAIL=mailto:admin@gossipgirl.com
```

---

## ✅ Checklist

Before deploying, make sure you have:

- [ ] `MONGO_URI` - MongoDB connection string
- [ ] `CLIENT_URL` - Your Vercel frontend URL
- [ ] `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- [ ] `CLOUDINARY_API_KEY` - Cloudinary API key
- [ ] `CLOUDINARY_API_SECRET` - Cloudinary API secret
- [ ] `JWT_SECRET` - Random secret key (recommended)
- [ ] All variables added to Render Dashboard

---

**Need help?** Check `CLOUDINARY_SETUP.md` for Cloudinary-specific setup.
