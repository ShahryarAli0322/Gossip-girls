# 🚨 URGENT: Fix CORS Error

## The Problem
Your backend is allowing the wrong origin. The `CLIENT_URL` in Render is set incorrectly.

## ✅ Quick Fix (2 Minutes)

### Step 1: Go to Render Dashboard
1. Visit: https://dashboard.render.com/
2. Click on your backend service: `gossip-girls`

### Step 2: Update CLIENT_URL
1. Click **"Environment"** tab
2. Find the `CLIENT_URL` variable
3. **Delete the current value** (it's wrong)
4. **Set it to your actual Vercel URL**:
   ```
   https://gossip-girls-git-master-muhammad-shahryar-alis-projects.vercel.app
   ```
5. **IMPORTANT**: 
   - No trailing slash
   - Exact URL as shown above
   - Must use HTTPS
6. Click **"Save Changes"**

### Step 3: Wait for Redeploy
- Render will automatically redeploy (2-3 minutes)
- Watch the "Events" tab to see deployment progress

### Step 4: Test
- Go to your Vercel site
- Try submitting a post
- Should work now! ✅

## Current vs Correct

**❌ WRONG (Current):**
```
CLIENT_URL=https://vercel.com/muhammad-shahryar-alis-projects/gossip-girls/7UB7FuLUGbCEDcA7JcP6tALx5MYF
```

**✅ CORRECT (Should be):**
```
CLIENT_URL=https://gossip-girls-git-master-muhammad-shahryar-alis-projects.vercel.app
```

## Alternative: Use Wildcard (Not Recommended for Production)

If you want to allow all Vercel preview deployments, you can use:
```
CLIENT_URL=https://*.vercel.app
```

But this is less secure. Better to use the exact production URL.

---

**After updating, wait 2-3 minutes for redeploy, then test again!**
