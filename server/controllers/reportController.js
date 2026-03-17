const Report = require("../models/Report")
const Post = require("../models/Post")

// Create report
const createReport = async (req, res) => {
  try {
    const { postId } = req.params
    const { reason, reportedBy } = req.body
    
    // Check if post exists
    const post = await Post.findById(postId)
    if (!post) {
      return res.status(404).json({ error: "Post not found" })
    }
    
    // Create report
    const report = new Report({
      postId,
      reason,
      reportedBy: reportedBy || "Anonymous"
    })
    
    await report.save()
    
    // Increment post reports count
    post.reports = (post.reports || 0) + 1
    await post.save()
    
    res.json({ success: true, report })
  } catch (error) {
    console.error("Create report error:", error)
    res.status(500).json({ error: "Failed to create report" })
  }
}

// Get all reports
const getReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate("postId")
      .sort({ createdAt: -1 })
    
    res.json(reports)
  } catch (error) {
    console.error("Get reports error:", error)
    res.status(500).json({ error: "Failed to get reports" })
  }
}

// Get reported posts
const getReportedPosts = async (req, res) => {
  try {
    const posts = await Post.find({ reports: { $gt: 0 } })
      .sort({ reports: -1, createdAt: -1 })
    
    res.json(posts)
  } catch (error) {
    console.error("Get reported posts error:", error)
    res.status(500).json({ error: "Failed to get reported posts" })
  }
}

module.exports = {
  createReport,
  getReports,
  getReportedPosts
}
