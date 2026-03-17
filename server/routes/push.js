const express = require("express")
const router = express.Router()
const webpush = require("web-push")

// VAPID keys (store these in .env in production for security)
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || "BIHe_BaIusrvCOnmEVncLNW_zkuq8l57lcJ1mVJQk9rU5LrR2iHsxVrdIOLoiQsode-5oT6d4VDUyu20ChW2rsI"
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || "ndnUCorChRl7K11rRVCys-2KSPxE6rEDMBP35z7DtZg"
const VAPID_EMAIL = process.env.VAPID_EMAIL || "mailto:gossipgirl@example.com"

// Configure web-push
webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)

// Store subscriptions in memory (in production, use database)
let subscriptions = []

// Export function to get subscriptions
const getSubscriptions = () => subscriptions

// Get VAPID public key
router.get("/vapid-key", (req, res) => {
  res.json({ publicKey: VAPID_PUBLIC_KEY })
})

// Subscribe to push notifications
router.post("/subscribe", (req, res) => {
  const subscription = req.body
  
  if (!subscription) {
    return res.status(400).json({ error: "Subscription required" })
  }
  
  // Check if subscription already exists
  const exists = subscriptions.some(sub => 
    sub.endpoint === subscription.endpoint
  )
  
  if (!exists) {
    subscriptions.push(subscription)
  }
  
  res.json({ success: true, message: "Subscription saved" })
})

// Unsubscribe from push notifications
router.post("/unsubscribe", (req, res) => {
  const { endpoint } = req.body
  
  subscriptions = subscriptions.filter(sub => sub.endpoint !== endpoint)
  
  res.json({ success: true, message: "Unsubscribed" })
})

// Get all subscriptions (for admin use)
router.get("/subscriptions", (req, res) => {
  res.json({ count: subscriptions.length, subscriptions })
})

// Send push notification to all subscribers
router.post("/send", async (req, res) => {
  const { title, body, data } = req.body
  
  if (!title || !body) {
    return res.status(400).json({ error: "Title and body required" })
  }
  
  const payload = JSON.stringify({
    title,
    body,
    ...data
  })
  
  const promises = subscriptions.map(subscription => {
    return webpush.sendNotification(subscription, payload)
      .catch(err => {
        console.error("Error sending notification:", err)
        // Remove invalid subscriptions
        if (err.statusCode === 410 || err.statusCode === 404) {
          subscriptions = subscriptions.filter(sub => sub.endpoint !== subscription.endpoint)
        }
      })
  })
  
  await Promise.all(promises)
  
  res.json({ success: true, sent: subscriptions.length })
})

module.exports = router
module.exports.getSubscriptions = getSubscriptions
