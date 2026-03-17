const jwt = require("jsonwebtoken")
const Admin = require("../models/Admin")

const verifyAdminToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1] || req.headers["x-auth-token"]
    
    if (!token) {
      return res.status(401).json({ error: "No token provided" })
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "gossip-girl-secret-key")
    
    const admin = await Admin.findById(decoded.id).select("-password")
    
    if (!admin) {
      return res.status(401).json({ error: "Invalid token" })
    }
    
    req.admin = admin
    next()
  } catch (error) {
    res.status(401).json({ error: "Invalid or expired token" })
  }
}

module.exports = verifyAdminToken
