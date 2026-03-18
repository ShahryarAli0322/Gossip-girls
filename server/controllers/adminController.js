const Admin = require("../models/Admin")
const Post = require("../models/Post")
const jwt = require("jsonwebtoken")
const crypto = require("crypto")
const { Resend } = require("resend")

const JWT_SECRET = process.env.JWT_SECRET || "gossip-girl-secret-key"
const JWT_EXPIRY = "7d"

// Email configuration - Using Resend (more reliable than Gmail SMTP)
const RESEND_API_KEY = process.env.RESEND_API_KEY
const SENDER_EMAIL = process.env.EMAIL_USER || "zaraconnecthere@gmail.com"
const SENDER_NAME = "Gossip Girl Admin"

// Log email configuration
console.log("📧 Email Configuration (Resend):")
console.log("  RESEND_API_KEY:", RESEND_API_KEY ? "✅ Set" : "❌ Not set")
console.log("  SENDER_EMAIL:", SENDER_EMAIL)
console.log("  SENDER_NAME:", SENDER_NAME)
console.log("  📤 Sender Email (FROM):", SENDER_EMAIL)
console.log("  📥 Recipient Email (TO): User's email from signup form")

// Initialize Resend
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null

// Verify Resend configuration
if (!RESEND_API_KEY) {
  console.warn("⚠️  WARNING: RESEND_API_KEY not set in environment variables!")
  console.warn("⚠️  To fix: Add RESEND_API_KEY=re_xxxxx to your Render environment variables")
  console.warn("⚠️  Get your API key from: https://resend.com/api-keys")
} else {
  console.log("✅ Resend email service configured")
}

// Admin Signup (max 2 admins)
const signup = async (req, res) => {
  try {
    console.log("Signup request:", req.body)
    console.log("Request headers:", req.headers)
    console.log("Content-Type:", req.headers['content-type'])
    
    // Check if body is empty
    if (!req.body || Object.keys(req.body).length === 0) {
      console.error("❌ Empty request body received")
      return res.status(400).json({
        error: "Request body is empty",
        details: "Please ensure Content-Type is application/json"
      })
    }
    
    const { name, email, phone, password } = req.body
    
    // Validate input
    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        error: "All fields are required"
      })
    }
    
    // Check admin limit
    const count = await Admin.countDocuments()
    if (count >= 2) {
      return res.status(400).json({
        error: "Admin limit reached (max 2)"
      })
    }
    
    // Check duplicate email
    const existing = await Admin.findOne({ email })
    if (existing) {
      if (!existing.isVerified) {
        return res.status(400).json({
          error: "Email already exists but not verified",
          emailExists: true,
          isVerified: false,
          message: "This email is already registered but not verified. Please check your email for the verification link or use the resend option."
        })
      } else {
        return res.status(400).json({
          error: "Email already exists",
          emailExists: true,
          isVerified: true,
          message: "This email is already registered. Please login instead."
        })
      }
    }
    
    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex")
    const verificationTokenExpiry = Date.now() + 10 * 60 * 1000 // 10 minutes
    
    const admin = new Admin({ 
      name, 
      email, 
      phone, 
      password,
      isVerified: false,
      verificationToken,
      verificationTokenExpiry
    })
    await admin.save()
    
    // Send verification email
    const frontendUrl = process.env.CLIENT_URL || process.env.FRONTEND_URL || "https://gossip-girls-omega.vercel.app"
    const verificationUrl = `${frontendUrl}/admin.html?token=${verificationToken}`
    
    // Send verification email (non-blocking - always attempt, catch errors)
    try {
      console.log("📧 Attempting to send verification email to:", email)
      console.log("📧 From:", SENDER_EMAIL)
      
      if (!resend) {
        console.error("❌ RESEND_API_KEY is not set! Emails will fail to send.")
        throw new Error("RESEND_API_KEY not configured")
      }
      
      const { data, error } = await resend.emails.send({
        from: `${SENDER_NAME} <${RESEND_FROM_EMAIL}>`,
        reply_to: REPLY_TO_EMAIL,
        to: email,
        subject: "Gossip Girl Admin - Verify Your Email",
        html: `
          <h2>Gossip Girl 💋</h2>
          <p>Hi, ${name},</p>
          <p>Please verify your email by clicking the link below:</p>
          <p><a href="${verificationUrl}" style="display:inline-block;background:#ff2d87;color:white;padding:12px 24px;text-decoration:none;border-radius:8px;margin:20px 0;">Verify Email</a></p>
          <p>Or copy and paste this link in your browser:</p>
          <p style="color:#888;font-size:12px;word-break:break-all;">${verificationUrl}</p>
          <p>Thank you!</p>
        `
      })
      
      if (error) {
        throw error
      }
      
      console.log("✅ Verification email sent successfully")
      console.log("✅ Message ID:", data?.id)
    } catch (err) {
      console.error("❌ Email sending failed!")
      console.error("❌ Error message:", err.message)
      console.error("❌ Full error:", JSON.stringify(err, null, 2))
      
      // DO NOT block signup if email fails - admin can still verify via direct link
    }
    
    // Return success message with admin (without password)
    const adminResponse = {
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      phone: admin.phone,
      isVerified: admin.isVerified,
      createdAt: admin.createdAt
    }
    
    res.json({
      message: "Admin created successfully",
      admin: adminResponse,
      requiresVerification: true,
      email: email
    })
  } catch (err) {
    console.error("Signup error:", err)
    
    // Return more specific error messages
    if (err.code === 11000) {
      return res.status(400).json({ 
        error: "Email already exists",
        details: err.message
      })
    }
    if (err.name === "ValidationError") {
      return res.status(400).json({ 
        error: Object.values(err.errors).map(e => e.message).join(", "),
        details: err.message
      })
    }
    
    res.status(500).json({
      error: "Signup failed",
      details: err.message
    })
  }
}

// Admin Login
const login = async (req, res) => {
  try {
    console.log("Login attempt:", req.body.email)
    const { email, password } = req.body
    
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" })
    }
    
    const admin = await Admin.findOne({ email })
    if (!admin) {
      return res.status(401).json({ error: "Invalid credentials" })
    }
    
    // Check if email is verified
    if (!admin.isVerified) {
      return res.status(401).json({ 
        error: "Please verify your email before logging in",
        requiresVerification: true,
        email: admin.email
      })
    }
    
    const isMatch = await admin.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" })
    }
    
    const token = jwt.sign({ id: admin._id }, JWT_SECRET, { expiresIn: JWT_EXPIRY })
    
    res.json({
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        phone: admin.phone
      }
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ error: error.message || "Login failed" })
  }
}

// Verify Email
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params
    
    if (!token) {
      return res.status(400).json({ error: "Verification token is required" })
    }
    
    // Find admin by verification token (check expiry)
    const admin = await Admin.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: Date.now() }
    })
    
    if (!admin) {
      // Check if token exists but expired
      const expiredAdmin = await Admin.findOne({ verificationToken: token })
      if (expiredAdmin) {
        return res.status(400).json({ 
          error: "Verification token has expired",
          details: "Please request a new verification email"
        })
      }
      return res.status(400).json({ 
        error: "Invalid verification token",
        details: "The verification link is invalid or has already been used"
      })
    }
    
    // Check if already verified
    if (admin.isVerified) {
      // Still generate token for auto-login
      const jwtToken = jwt.sign({ id: admin._id }, JWT_SECRET, { expiresIn: JWT_EXPIRY })
      return res.json({
        success: true,
        message: "Email already verified. You are now logged in.",
        token: jwtToken,
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          phone: admin.phone
        }
      })
    }
    
    // Mark as verified and clear verification token
    admin.isVerified = true
    admin.verificationToken = null
    admin.verificationTokenExpiry = null
    await admin.save()
    
    // Generate JWT token for auto-login
    const jwtToken = jwt.sign({ id: admin._id }, JWT_SECRET, { expiresIn: JWT_EXPIRY })
    
    console.log("✅ Email verified successfully for:", admin.email)
    
    res.json({
      success: true,
      message: "Email verified successfully!",
      token: jwtToken,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        phone: admin.phone
      }
    })
  } catch (error) {
    console.error("Verify email error:", error)
    res.status(500).json({ 
      error: "Failed to verify email",
      details: error.message
    })
  }
}

// Resend Verification Email
const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body
    
    const admin = await Admin.findOne({ email })
    if (!admin) {
      return res.json({ message: "If email exists, verification email has been sent" })
    }
    
    if (admin.isVerified) {
      return res.status(400).json({ error: "Email is already verified" })
    }
    
    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString("hex")
    const verificationTokenExpiry = Date.now() + 10 * 60 * 1000 // 10 minutes
    
    admin.verificationToken = verificationToken
    admin.verificationTokenExpiry = verificationTokenExpiry
    await admin.save()
    
    // Send verification email
    const frontendUrl = process.env.CLIENT_URL || process.env.FRONTEND_URL || "https://gossip-girls-omega.vercel.app"
    const verificationUrl = `${frontendUrl}/admin.html?token=${verificationToken}`
    
    // Send verification email (non-blocking - always attempt, catch errors)
    try {
      console.log("📧 Attempting to resend verification email to:", email)
      console.log("📧 From:", SENDER_EMAIL)
      
      if (!resend) {
        console.error("❌ RESEND_API_KEY is not set! Emails will fail to send.")
        throw new Error("RESEND_API_KEY not configured")
      }
      
      const { data, error } = await resend.emails.send({
        from: `${SENDER_NAME} <${RESEND_FROM_EMAIL}>`,
        reply_to: REPLY_TO_EMAIL,
        to: email,
        subject: "Gossip Girl Admin - Verify Your Email",
        html: `
          <h2>Gossip Girl 💋</h2>
          <p>Hi, ${admin.name},</p>
          <p>Please verify your email by clicking the link below:</p>
          <p><a href="${verificationUrl}" style="display:inline-block;background:#ff2d87;color:white;padding:12px 24px;text-decoration:none;border-radius:8px;margin:20px 0;">Verify Email</a></p>
          <p>Or copy and paste this link in your browser:</p>
          <p style="color:#888;font-size:12px;word-break:break-all;">${verificationUrl}</p>
          <p>Thank you!</p>
        `
      })
      
      if (error) {
        throw error
      }
      
      console.log("✅ Verification email resent successfully")
      console.log("✅ Message ID:", data?.id)
      
      return res.json({ 
        success: true,
        message: "Verification email sent successfully",
        messageId: data?.id
      })
    } catch (err) {
      console.error("❌ Email sending failed!")
      console.error("❌ Error message:", err.message)
      console.error("❌ Full error:", JSON.stringify(err, null, 2))
      
      let errorMessage = "Failed to send verification email"
      let errorDetails = err.message
      
      if (!RESEND_API_KEY) {
        errorMessage = "Email API key not configured"
        errorDetails = "RESEND_API_KEY is not set in Render environment variables. Get your API key from https://resend.com/api-keys"
      }
      
      // Return error to frontend so user knows what went wrong
      return res.status(500).json({
        success: false,
        error: errorMessage,
        details: errorDetails
      })
    }
  } catch (error) {
    console.error("Resend verification error:", error)
    res.status(500).json({ error: "Failed to resend verification email" })
  }
}

// Forgot Password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body
    
    const admin = await Admin.findOne({ email })
    if (!admin) {
      return res.json({ message: "If email exists, reset link has been sent" })
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex")
    const resetTokenExpiry = Date.now() + 10 * 60 * 1000 // 10 minutes
    
    admin.resetToken = resetToken
    admin.resetTokenExpiry = resetTokenExpiry
    await admin.save()
    
    // Send email
    const frontendUrl = process.env.CLIENT_URL || process.env.FRONTEND_URL || "https://gossip-girls-omega.vercel.app"
    const resetUrl = `${frontendUrl}/admin/reset-password/${resetToken}`
    
    // Send reset email (non-blocking - always attempt, catch errors)
    try {
      console.log("📧 Attempting to send reset password email to:", email)
      console.log("📧 From:", SENDER_EMAIL)
      
      if (!resend) {
        console.error("❌ RESEND_API_KEY is not set! Emails will fail to send.")
        throw new Error("RESEND_API_KEY not configured")
      }
      
      const { data, error } = await resend.emails.send({
        from: `${SENDER_NAME} <${RESEND_FROM_EMAIL}>`,
        reply_to: REPLY_TO_EMAIL,
        to: email,
        subject: "Gossip Girl Admin - Reset Your Password",
        html: `
          <h2>Gossip Girl 💋</h2>
          <p>Hi, ${admin.name},</p>
          <p>Click below to reset your password:</p>
          <p><a href="${resetUrl}" style="display:inline-block;background:#ff2d87;color:white;padding:12px 24px;text-decoration:none;border-radius:8px;margin:20px 0;">Reset Password</a></p>
          <p>Or copy and paste this link in your browser:</p>
          <p style="color:#888;font-size:12px;word-break:break-all;">${resetUrl}</p>
          <p>This link expires in 10 minutes.</p>
          <p>Thank you!</p>
        `
      })
      
      if (error) {
        throw error
      }
      
      console.log("✅ Reset password email sent successfully")
      console.log("✅ Message ID:", data?.id)
    } catch (err) {
      console.error("❌ Email sending failed!")
      console.error("❌ Error message:", err.message)
      console.error("❌ Error code:", err.code)
      if (err.code === "EAUTH") {
        console.error("❌ AUTHENTICATION FAILED: Gmail App Password may have expired")
      }
      // DO NOT block forgot password if email fails
    }
    
    res.json({ message: "If email exists, reset link has been sent" })
  } catch (error) {
    console.error("Forgot password error:", error)
    res.status(500).json({ error: "Failed to process request" })
  }
}

// Resend Password Reset Email
const resendResetPassword = async (req, res) => {
  try {
    const { email } = req.body
    
    const admin = await Admin.findOne({ email })
    if (!admin) {
      return res.json({ message: "If email exists, reset link has been sent" })
    }
    
    // Generate new reset token
    const resetToken = crypto.randomBytes(32).toString("hex")
    const resetTokenExpiry = Date.now() + 10 * 60 * 1000 // 10 minutes
    
    admin.resetToken = resetToken
    admin.resetTokenExpiry = resetTokenExpiry
    await admin.save()
    
    // Send email
    const frontendUrl = process.env.CLIENT_URL || process.env.FRONTEND_URL || "https://gossip-girls-omega.vercel.app"
    const resetUrl = `${frontendUrl}/admin/reset-password/${resetToken}`
    
    // Send reset email (non-blocking - always attempt, catch errors)
    try {
      console.log("📧 Attempting to resend reset password email to:", email)
      console.log("📧 From:", SENDER_EMAIL)
      
      if (!resend) {
        console.error("❌ RESEND_API_KEY is not set! Emails will fail to send.")
        throw new Error("RESEND_API_KEY not configured")
      }
      
      const { data, error } = await resend.emails.send({
        from: `${SENDER_NAME} <${RESEND_FROM_EMAIL}>`,
        reply_to: REPLY_TO_EMAIL,
        to: email,
        subject: "Gossip Girl Admin - Reset Your Password",
        html: `
          <h2>Gossip Girl 💋</h2>
          <p>Hi, ${admin.name},</p>
          <p>Click below to reset your password:</p>
          <p><a href="${resetUrl}" style="display:inline-block;background:#ff2d87;color:white;padding:12px 24px;text-decoration:none;border-radius:8px;margin:20px 0;">Reset Password</a></p>
          <p>Or copy and paste this link in your browser:</p>
          <p style="color:#888;font-size:12px;word-break:break-all;">${resetUrl}</p>
          <p>This link expires in 10 minutes.</p>
          <p>Thank you!</p>
        `
      })
      
      if (error) {
        throw error
      }
      
      console.log("✅ Reset password email resent successfully")
      console.log("✅ Message ID:", data?.id)
    } catch (err) {
      console.error("❌ Email sending failed!")
      console.error("❌ Error message:", err.message)
      console.error("❌ Full error:", JSON.stringify(err, null, 2))
      // DO NOT block resend if email fails
    }
    
    res.json({ message: "If email exists, reset link has been sent" })
  } catch (error) {
    console.error("Resend reset password error:", error)
    res.status(500).json({ error: "Failed to resend reset email" })
  }
}

// Reset Password
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params
    const { password } = req.body
    
    const admin = await Admin.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    })
    
    if (!admin) {
      return res.status(400).json({ error: "Invalid or expired token" })
    }
    
    admin.password = password
    admin.resetToken = undefined
    admin.resetTokenExpiry = undefined
    await admin.save()
    
    res.json({ message: "Password reset successful" })
  } catch (error) {
    console.error("Reset password error:", error)
    res.status(500).json({ error: "Failed to reset password" })
  }
}

// Delete any post
const deletePost = async (req, res) => {
  try {
    const { id } = req.params
    
    await Post.findByIdAndDelete(id)
    
    // Emit socket event
    if (req.io) {
      req.io.emit("deletePost", id)
    }
    
    res.json({ success: true })
  } catch (error) {
    console.error("Delete post error:", error)
    res.status(500).json({ error: "Failed to delete post" })
  }
}

// Delete comment
const deleteComment = async (req, res) => {
  try {
    const { postId, index } = req.params
    
    const post = await Post.findById(postId)
    if (!post) {
      return res.status(404).json({ error: "Post not found" })
    }
    
    if (index >= 0 && index < post.comments.length) {
      post.comments.splice(parseInt(index), 1)
      await post.save()
      
      // Emit socket event
      if (req.io) {
        req.io.emit("updatePost", post)
      }
    }
    
    res.json(post)
  } catch (error) {
    console.error("Delete comment error:", error)
    res.status(500).json({ error: "Failed to delete comment" })
  }
}

// Pin post
const pinPost = async (req, res) => {
  try {
    const { postId } = req.params
    
    const post = await Post.findById(postId)
    if (!post) {
      return res.status(404).json({ error: "Post not found" })
    }
    
    post.pinned = !post.pinned
    await post.save()
    
    // Emit socket event
    if (req.io) {
      req.io.emit("updatePost", post)
    }
    
    res.json(post)
  } catch (error) {
    console.error("Pin post error:", error)
    res.status(500).json({ error: "Failed to pin post" })
  }
}

// Send official blast
const sendBlast = async (req, res) => {
  try {
    const { message } = req.body
    
    if (!message) {
      return res.status(400).json({ error: "Message required" })
    }
    
    // Create a post for the admin blast
    const adminBlast = new Post({
      campus: "ALL",
      text: message,
      category: "Official Blast",
      author: "admin",
      image: req.file ? "/uploads/" + req.file.filename : null,
      isAdminBlast: true,
      verified: true,
      pinned: true // Always pin admin blasts
    })
    
    await adminBlast.save()
    
    // Emit socket event for real-time update
    if (req.io) {
      req.io.emit("newPost", adminBlast)
      req.io.emit("adminBlast", message) // Keep for notification
    }
    
    // Send push notifications to all subscribers
    try {
      const { getSubscriptions } = require("../routes/push")
      const webpush = require("web-push")
      const subscriptions = getSubscriptions()
      
      if (subscriptions.length > 0) {
        const payload = JSON.stringify({
          title: "Gossip Girl 💋",
          body: message,
          url: "/"
        })
        
        const promises = subscriptions.map(subscription => {
          return webpush.sendNotification(subscription, payload).catch(err => {
            console.error("Push notification error:", err)
            return null
          })
        })
        
        await Promise.all(promises)
        console.log(`Push notifications sent to ${subscriptions.length} subscribers`)
      }
    } catch (error) {
      console.error("Error sending push notifications:", error)
    }
    
    res.json({ success: true, message, post: adminBlast })
  } catch (error) {
    console.error("Send blast error:", error)
    res.status(500).json({ error: "Failed to send blast" })
  }
}

// Get activity analytics
const getActivity = async (req, res) => {
  try {
    const posts = await Post.aggregate([
      {
        $group: {
          _id: "$campus",
          count: { $sum: 1 }
        }
      }
    ])
    
    const total = await Post.countDocuments()
    
    const analytics = {
      BMI: 0,
      LGS: 0,
      ROOTS: 0
    }
    
    posts.forEach(item => {
      if (analytics.hasOwnProperty(item._id)) {
        analytics[item._id] = total > 0 ? Math.round((item.count / total) * 100) : 0
      }
    })
    
    res.json(analytics)
  } catch (error) {
    console.error("Activity analytics error:", error)
    res.status(500).json({ error: "Failed to get analytics" })
  }
}

// Get admin profile
const getProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select("-password -resetToken -resetTokenExpiry")
    res.json(admin)
  } catch (error) {
    console.error("Get profile error:", error)
    res.status(500).json({ error: "Failed to get profile" })
  }
}

// Update admin profile
const updateProfile = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body
    
    const admin = await Admin.findById(req.admin.id)
    
    if (name) admin.name = name
    if (email) admin.email = email
    if (phone) admin.phone = phone
    if (password) admin.password = password
    
    await admin.save()
    
    res.json({
      id: admin._id,
      name: admin.name,
      email: admin.email,
      phone: admin.phone
    })
  } catch (error) {
    console.error("Update profile error:", error)
    res.status(500).json({ error: "Failed to update profile" })
  }
}

// Check Environment Variables (for debugging - doesn't expose sensitive values)
const checkEnvVars = async (req, res) => {
  try {
    const envCheck = {
      EMAIL_USER: {
        set: !!process.env.EMAIL_USER,
        value: process.env.EMAIL_USER ? `${process.env.EMAIL_USER.substring(0, 3)}***` : "Not set",
        usingDefault: !process.env.EMAIL_USER,
        actualValue: EMAIL_USER
      },
      EMAIL_PASS: {
        set: !!process.env.EMAIL_PASS,
        length: process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0,
        firstChar: process.env.EMAIL_PASS ? process.env.EMAIL_PASS.substring(0, 1) + "***" : "Not set"
      },
      CLIENT_URL: {
        set: !!process.env.CLIENT_URL,
        value: process.env.CLIENT_URL || "Not set"
      },
      FRONTEND_URL: {
        set: !!process.env.FRONTEND_URL,
        value: process.env.FRONTEND_URL || "Not set"
      },
      MONGO_URI: {
        set: !!process.env.MONGO_URI,
        value: process.env.MONGO_URI ? "Set (hidden)" : "Not set"
      },
      JWT_SECRET: {
        set: !!process.env.JWT_SECRET,
        value: process.env.JWT_SECRET ? "Set (hidden)" : "Not set (using default)"
      },
      PORT: {
        set: !!process.env.PORT,
        value: process.env.PORT || "Not set (using default 5000)"
      }
    }
    
    // Email configuration status
    const emailStatus = {
      configured: !!(EMAIL_PASS && EMAIL_USER),
      transporterReady: false,
      canSend: false
    }
    
    // Test transporter if EMAIL_PASS is set
    if (EMAIL_PASS) {
      try {
        await transporter.verify()
        emailStatus.transporterReady = true
        emailStatus.canSend = true
      } catch (err) {
        emailStatus.transporterReady = false
        emailStatus.canSend = false
        emailStatus.error = err.message
        emailStatus.errorCode = err.code
      }
    }
    
    res.json({
      success: true,
      environmentVariables: envCheck,
      emailConfiguration: emailStatus,
      recommendations: getRecommendations(envCheck, emailStatus)
    })
  } catch (error) {
    console.error("❌ Environment check failed:", error)
    res.status(500).json({
      error: "Failed to check environment",
      message: error.message
    })
  }
}

function getRecommendations(envCheck, emailStatus) {
  const recommendations = []
  
  if (!envCheck.EMAIL_PASS.set) {
    recommendations.push({
      priority: "HIGH",
      issue: "EMAIL_PASS is not set",
      fix: "Add EMAIL_PASS environment variable in Render with your Gmail App Password"
    })
  }
  
  if (envCheck.EMAIL_USER.usingDefault) {
    recommendations.push({
      priority: "MEDIUM",
      issue: "EMAIL_USER is using default value",
      fix: "Set EMAIL_USER in Render environment variables (currently using: zaraconnecthere@gmail.com)"
    })
  }
  
  if (envCheck.EMAIL_PASS.set && envCheck.EMAIL_PASS.length !== 16) {
    recommendations.push({
      priority: "HIGH",
      issue: `EMAIL_PASS length is ${envCheck.EMAIL_PASS.length} (should be 16 characters)`,
      fix: "Gmail App Password should be exactly 16 characters. Generate a new one if needed."
    })
  }
  
  if (!emailStatus.canSend && envCheck.EMAIL_PASS.set) {
    recommendations.push({
      priority: "HIGH",
      issue: "Email transporter verification failed",
      fix: "Check if Gmail App Password is correct and not expired. Generate a new App Password if needed."
    })
  }
  
  if (!envCheck.CLIENT_URL.set && !envCheck.FRONTEND_URL.set) {
    recommendations.push({
      priority: "MEDIUM",
      issue: "CLIENT_URL and FRONTEND_URL not set",
      fix: "Set CLIENT_URL in Render with your Vercel frontend URL for email links"
    })
  }
  
  return recommendations
}

// Test Email (for debugging)
const testEmail = async (req, res) => {
  try {
    const { email } = req.body
    
    if (!email) {
      return res.status(400).json({ error: "Email is required" })
    }
    
    console.log("🧪 Testing email sending to:", email)
    console.log("🧪 SENDER_EMAIL:", SENDER_EMAIL)
    console.log("🧪 RESEND_API_KEY set:", RESEND_API_KEY ? "Yes" : "No")
    
    if (!resend) {
      return res.status(500).json({ 
        error: "RESEND_API_KEY not configured",
        message: "Please set RESEND_API_KEY in environment variables. Get your API key from https://resend.com/api-keys"
      })
    }
    
    const { data, error } = await resend.emails.send({
      from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
      to: email,
      subject: "Gossip Girl - Test Email",
      html: `
        <h2>Gossip Girl 💋</h2>
        <p>This is a test email from Gossip Girl Admin system.</p>
        <p>If you received this, your email configuration is working correctly!</p>
        <p>Sent at: ${new Date().toLocaleString()}</p>
      `
    })
    
    if (error) {
      throw error
    }
    
    res.json({
      success: true,
      message: "Test email sent successfully",
      messageId: data?.id
    })
  } catch (error) {
    console.error("❌ Test email failed:", error)
    res.status(500).json({
      error: "Failed to send test email",
      message: error.message,
      code: error.code,
      details: error.response
    })
  }
}

module.exports = {
  signup,
  login,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resendResetPassword,
  resetPassword,
  deletePost,
  deleteComment,
  pinPost,
  sendBlast,
  getActivity,
  getProfile,
  updateProfile,
  checkEnvVars,
  testEmail
}
