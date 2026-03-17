require("dotenv").config()

const express = require("express")
const http = require("http")
const mongoose = require("mongoose")
const cors = require("cors")
const multer = require("multer")
const path = require("path")
const { Server } = require("socket.io")

// Import models and routes
const Post = require("./models/Post")
const postsRoutes = require("./routes/posts")
const adminRoutes = require("./routes/admin")
const reportRoutes = require("./routes/reports")

/* INIT */

const app = express()
const server = http.createServer(app)

// Get environment variables
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000"
const PORT = process.env.PORT || 5000

// Validate required environment variables
if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI missing - Cannot start server without database")
  process.exit(1)
}

// CORS configuration - allow Vercel deployments
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://gossip-girls-omega.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}

const io = new Server(server,{
  cors: {
    origin: "https://gossip-girls-omega.vercel.app",
    methods: ["GET", "POST"]
  }
})

/* MIDDLEWARE */

app.use(cors(corsOptions))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

/* ROOT ROUTE - Must be before static file serving */
app.get("/",(req,res)=>{
res.json({message:"Gossip Girl API is running...",status:"ok"})
})

/* SERVE UPLOADS */

app.use("/uploads",express.static(path.join(__dirname,"../uploads")))

/* MULTER CONFIG */

const storage = multer.diskStorage({

destination:(req,file,cb)=>{
cb(null,"uploads/")
},

filename:(req,file,cb)=>{
cb(null,Date.now()+"-"+file.originalname)
}

})

const upload = multer({storage})

/* MONGODB CONNECTION */

// Connection event handlers
mongoose.connection.on("connected", () => {
  console.log("📡 Mongoose connected to DB")
})

mongoose.connection.on("error", (err) => {
  console.error("❌ Mongoose error:", err)
})

mongoose.connection.on("disconnected", () => {
  console.log("⚠️ Mongoose disconnected from DB")
})

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000
})
.then(() => {
  console.log("✅ MongoDB Atlas Connected")
  
  // Start server ONLY after DB connects
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`)
    console.log(`🌐 CORS enabled for: ${CLIENT_URL}`)
  })
})
.catch(err => {
  console.error("❌ MongoDB Connection Error:", err.message)
  console.error("Full error:", err)
  process.exit(1) // Exit if DB connection fails
})

// Make io available to routes
app.set("io", io)

/* ===================== */
/* API ROUTES */
/* ===================== */

// Use modular routes
app.use("/api/posts", postsRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/report", reportRoutes)
app.use("/api/push", require("./routes/push"))

// Keep existing routes for backward compatibility
// These will be handled by the routes above, but keeping for safety

/* ===================== */
/* REACTION API */
/* ===================== */

app.post("/api/react/:id",async(req,res)=>{

try{

const {type} = req.body

const update={}
update[type]=1

const post = await Post.findByIdAndUpdate(

req.params.id,
{$inc:update},
{new:true}

)

// Recalculate hot score
if (post) {
  const ageInHours = (Date.now() - new Date(post.createdAt).getTime()) / (1000 * 60 * 60)
  const ageFactor = Math.max(0.1, 1 / (1 + ageInHours / 24))
  post.hotScore = ((post.likes * 2) + (post.fires * 3) + (post.laughs * 1.5) + (post.comments.length * 2) - (post.reports * 4)) * ageFactor
  await post.save()
}

io.emit("updatePost",post)

res.json(post)

}catch(err){

res.status(500).json({error:"Reaction failed"})

}

})

/* ===================== */
/* COMMENT API */
/* ===================== */

app.post("/api/comment/:id",async(req,res)=>{

try{

const {comment} = req.body

const post = await Post.findByIdAndUpdate(

req.params.id,
{$push:{comments:comment}},
{new:true}

)

// Recalculate hot score
if (post) {
  const ageInHours = (Date.now() - new Date(post.createdAt).getTime()) / (1000 * 60 * 60)
  const ageFactor = Math.max(0.1, 1 / (1 + ageInHours / 24))
  post.hotScore = ((post.likes * 2) + (post.fires * 3) + (post.laughs * 1.5) + (post.comments.length * 2) - (post.reports * 4)) * ageFactor
  await post.save()
}

io.emit("updatePost",post)

res.json(post)

}catch(err){

res.status(500).json({error:"Comment failed"})

}

})

/* ===================== */
/* SOCKET CONNECTION */
/* ===================== */

io.on("connection",(socket)=>{

console.log("User connected:",socket.id)

socket.on("disconnect",()=>{
console.log("User disconnected:",socket.id)
})

})

/* START SERVER */
// Server now starts inside mongoose.connect().then() above
// This ensures DB is connected before accepting requests