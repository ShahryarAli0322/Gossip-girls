const Post = require("../models/Post")

// Banned keywords list
const bannedKeywords = [
  "spam",
  "scam",
  "fake",
  "click here",
  "free money"
]

const spamFilter = async (req, res, next) => {
  try {
    const { text, author } = req.body
    
    // Check for banned keywords
    const textLower = text.toLowerCase()
    for (const keyword of bannedKeywords) {
      if (textLower.includes(keyword)) {
        return res.status(400).json({ error: "Spam detected" })
      }
    }
    
    // Check for repeated identical posts from same author
    const recentPosts = await Post.find({
      author: author,
      text: text,
      createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) } // Last hour
    })
    
    if (recentPosts.length > 0) {
      return res.status(400).json({ error: "Spam detected" })
    }
    
    // Check for too many posts from same user in short time
    const userRecentPosts = await Post.find({
      author: author,
      createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) } // Last 5 minutes
    })
    
    if (userRecentPosts.length >= 5) {
      return res.status(400).json({ error: "Spam detected" })
    }
    
    next()
  } catch (error) {
    console.error("Spam filter error:", error)
    next() // Continue on error to avoid blocking legitimate posts
  }
}

module.exports = spamFilter
