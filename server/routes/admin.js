const express = require("express")
const router = express.Router()
const multer = require("multer")
const path = require("path")
const adminController = require("../controllers/adminController")
const verifyAdminToken = require("../middleware/verifyAdminToken")

// Multer configuration for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/")
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname)
  }
})

const upload = multer({ storage })

// Public routes
router.post("/signup", adminController.signup)
router.post("/login", adminController.login)
router.get("/verify-email/:token", adminController.verifyEmail)
router.post("/resend-verification", adminController.resendVerificationEmail)
router.post("/forgot-password", adminController.forgotPassword)
router.post("/resend-reset-password", adminController.resendResetPassword)
router.post("/reset-password/:token", adminController.resetPassword)

// Protected routes (require admin token)
router.use(verifyAdminToken)

// Middleware to inject io
const injectIO = (req, res, next) => {
  req.io = req.app.get("io")
  next()
}

// Moderation routes
router.delete("/post/:id", injectIO, adminController.deletePost)
router.delete("/comment/:postId/:index", injectIO, adminController.deleteComment)
router.post("/pin/:postId", injectIO, adminController.pinPost)
router.post("/blast", injectIO, upload.single("image"), adminController.sendBlast)

// Analytics
router.get("/activity", adminController.getActivity)

// Profile
router.get("/profile", adminController.getProfile)
router.put("/profile", adminController.updateProfile)

module.exports = router
