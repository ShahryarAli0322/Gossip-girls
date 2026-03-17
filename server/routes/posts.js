const express = require("express")
const router = express.Router()
const multer = require("multer")
const path = require("path")
const Post = require("../models/Post")
const spamFilter = require("../middleware/spamFilter")

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/")
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname)
  }
})

const upload = multer({ storage })

// Calculate hot score
const calculateHotScore = (post) => {
  const ageInHours = (Date.now() - new Date(post.createdAt).getTime()) / (1000 * 60 * 60)
  const ageFactor = Math.max(0.1, 1 / (1 + ageInHours / 24)) // Decay over 24 hours
  
  const score = (post.likes * 2) + 
                (post.fires * 3) + 
                (post.laughs * 1.5) + 
                (post.comments.length * 2) - 
                (post.reports * 4)
  
  return score * ageFactor
}

// GET all posts (sorted by admin blast, pinned, hot score, then date)
router.get("/", async (req, res) => {
  try {
    let posts = await Post.find()
    
    // Calculate and update hot scores
    for (let post of posts) {
      post.hotScore = calculateHotScore(post)
      await post.save()
    }
    
    // Sort: Admin blasts first, then pinned, then by hot score, then by date
    posts = posts.sort((a, b) => {
      if (a.isAdminBlast && !b.isAdminBlast) return -1
      if (!a.isAdminBlast && b.isAdminBlast) return 1
      if (a.pinned && !b.pinned) return -1
      if (!a.pinned && b.pinned) return 1
      if (b.hotScore !== a.hotScore) return b.hotScore - a.hotScore
      return new Date(b.createdAt) - new Date(a.createdAt)
    })
    
    res.json(posts)
  } catch (err) {
    res.status(500).json({ error: "Server error" })
  }
})

// GET posts by campus
router.get("/campus/:campus", async (req, res) => {
  try {
    const { campus } = req.params
    let posts = await Post.find({ campus })
    
    // Calculate hot scores
    for (let post of posts) {
      post.hotScore = calculateHotScore(post)
      await post.save()
    }
    
    // Sort
    posts = posts.sort((a, b) => {
      if (a.isAdminBlast && !b.isAdminBlast) return -1
      if (!a.isAdminBlast && b.isAdminBlast) return 1
      if (a.pinned && !b.pinned) return -1
      if (!a.pinned && b.pinned) return 1
      if (b.hotScore !== a.hotScore) return b.hotScore - a.hotScore
      return new Date(b.createdAt) - new Date(a.createdAt)
    })
    
    res.json(posts)
  } catch (err) {
    res.status(500).json({ error: "Server error" })
  }
})

// GET hot posts
router.get("/hot", async (req, res) => {
  try {
    let posts = await Post.find()
    
    // Calculate hot scores
    for (let post of posts) {
      post.hotScore = calculateHotScore(post)
      await post.save()
    }
    
    // Sort by hot score
    posts = posts.sort((a, b) => b.hotScore - a.hotScore)
    
    res.json(posts.slice(0, 20)) // Top 20
  } catch (err) {
    res.status(500).json({ error: "Server error" })
  }
})

// CREATE post (with spam filter)
router.post("/", spamFilter, upload.single("image"), async (req, res) => {
  try {
    console.log("📥 POST /api/posts - Request received")
    console.log("  Body:", req.body)
    console.log("  File:", req.file ? {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype
    } : "No file uploaded")
    
    const post = new Post({
      campus: req.body.campus,
      text: req.body.text,
      category: req.body.category,
      author: req.body.author,
      image: req.file ? "/uploads/" + req.file.filename : null
    })
    
    console.log("  Post image field:", post.image)
    
    await post.save()
    
    // Calculate hot score
    post.hotScore = calculateHotScore(post)
    await post.save()
    
    // Emit socket event
    if (req.app.get("io")) {
      req.app.get("io").emit("newPost", post)
    }
    
    res.json(post)
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: "Failed to create post" })
  }
})

// DELETE post
router.delete("/:id", async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id)
    
    if (req.app.get("io")) {
      req.app.get("io").emit("deletePost", req.params.id)
    }
    
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: "Delete failed" })
  }
})

module.exports = router
