const mongoose = require("mongoose")

const postSchema = new mongoose.Schema({
  campus: String,
  text: String,
  category: String,
  author: String,
  likes: { type: Number, default: 0 },
  fires: { type: Number, default: 0 },
  laughs: { type: Number, default: 0 },
  comments: [String],
  image: String,
  pinned: { type: Boolean, default: false },
  reports: { type: Number, default: 0 },
  hotScore: { type: Number, default: 0 },
  isAdminBlast: { type: Boolean, default: false },
  verified: { type: Boolean, default: false },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model("Post", postSchema)
