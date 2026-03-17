const express = require("express")
const router = express.Router()
const reportController = require("../controllers/reportController")
const verifyAdminToken = require("../middleware/verifyAdminToken")

// Public route - anyone can report
router.post("/:postId", reportController.createReport)

// Admin routes - view reports
router.get("/", verifyAdminToken, reportController.getReports)
router.get("/posts", verifyAdminToken, reportController.getReportedPosts)

module.exports = router
