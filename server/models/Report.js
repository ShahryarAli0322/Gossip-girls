const mongoose = require("mongoose")

const reportSchema = new mongoose.Schema({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  reportedBy: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model("Report", reportSchema)
