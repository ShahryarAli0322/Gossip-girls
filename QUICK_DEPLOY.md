# 🚀 Quick Deployment Guide - Vercel + Render

## Prerequisites Checklist

- [ ] GitHub repository created
- [ ] Code pushed to GitHub
- [ ] MongoDB Atlas account
- [ ] Vercel account
- [ ] Render account

---

## ⚡ Quick Start (5 Steps)

### 1️⃣ MongoDB Atlas Setup (5 minutes)

1. Create cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create database user (save password!)
3. Network Access → Add IP: `0.0.0.0/0`
4. Get connection string → Replace `<password>` with your password

### 2️⃣ Deploy Backend to Render (10 minutes)

1. Go to [render.com](https://render.com) → New Web Service
2. Connect GitHub repo
3. Settings:
   - **Name**: `gossip-girl-backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node server/server.js`
4. Add Environment Variables:
   ```
   MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/gossip-girl?retryWrites=true&w=majority
   CLIENT_URL=https://your-vercel-app.vercel.app (update after step 3)
   JWT_SECRET=generate-random-32-char-string
   EMAIL_PASS=your-gmail-app-password
   VAPID_PUBLIC_KEY=your-vapid-public-key
   VAPID_PRIVATE_KEY=your-vapid-private-key
   VAPID_EMAIL=mailto:your-email@example.com
   ```
5. Deploy → Copy backend URL

### 3️⃣ Deploy Frontend to Vercel (5 minutes)

1. Go to [vercel.com](https://vercel.com) → Add New Project
2. Import GitHub repo
3. Settings:
   - **Framework**: Other
   - **Root Directory**: `./` (root)
   - **Build Command**: `npm run build:client`
   - **Output Directory**: `client`
4. Add Environment Variables:
   ```
   API_BASE_URL=https://your-backend.onrender.com
   SOCKET_URL=https://your-backend.onrender.com
   ```
5. Deploy → Copy frontend URL

### 4️⃣ Update Backend CLIENT_URL

1. Go back to Render
2. Update `CLIENT_URL` with your Vercel URL
3. Save (auto-redeploys)

### 5️⃣ Test!

- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-backend.onrender.com`
- Admin: `https://your-app.vercel.app/admin`

---

## 🔑 Generate Required Keys

### JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### VAPID Keys
```bash
npm install web-push
node -e "const webpush = require('web-push'); const keys = webpush.generateVAPIDKeys(); console.log('Public:', keys.publicKey); console.log('Private:', keys.privateKey);"
```

---

## ✅ Verification Checklist

- [ ] Backend responds at root URL
- [ ] Frontend loads correctly
- [ ] Can create posts
- [ ] Images upload (may be ephemeral on free tier)
- [ ] Socket.IO connects (check browser console)
- [ ] Admin panel works
- [ ] No CORS errors

---

## 🆘 Common Issues

**CORS Error?**
→ Check `CLIENT_URL` in Render matches Vercel URL exactly

**Socket.IO Failed?**
→ Check `SOCKET_URL` in Vercel matches backend URL

**Images Not Loading?**
→ Normal on Render free tier (ephemeral storage)

**Environment Variables Not Working?**
→ Redeploy after adding/changing variables

---

## 📚 Full Guide

See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for detailed instructions.

---

**That's it! Your app is live! 🎉**
