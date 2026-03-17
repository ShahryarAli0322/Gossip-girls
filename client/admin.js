// Admin Panel Frontend Logic

// API Configuration - Backend URL
// Use global CORRECT_BACKEND_URL from config.js (loaded before this file)
// DO NOT redeclare const - use window.CORRECT_BACKEND_URL directly
let API_BASE_URL = window.API_BASE_URL || window.CORRECT_BACKEND_URL || 'https://gossip-girls.onrender.com';

// Force fix if placeholder detected
if (API_BASE_URL.includes('your-backend-url') || !API_BASE_URL || API_BASE_URL === 'undefined') {
  const correctUrl = window.CORRECT_BACKEND_URL || 'https://gossip-girls.onrender.com';
  API_BASE_URL = correctUrl;
  window.API_BASE_URL = correctUrl;
  window.SOCKET_URL = correctUrl;
  console.warn('⚠️ Fixed placeholder URL in admin.js');
}

const API_BASE = `${API_BASE_URL}/api/admin`
let authToken = localStorage.getItem("adminToken")
let currentSection = "analytics"

// Check for verification token in URL
const urlParams = new URLSearchParams(window.location.search)
const verificationToken = urlParams.get("token")
if (verificationToken) {
  verifyEmail(verificationToken)
}

// Check for reset token in URL
const pathParts = window.location.pathname.split("/")
if (pathParts.includes("reset-password") && pathParts[pathParts.length - 1]) {
  const resetToken = pathParts[pathParts.length - 1]
  showResetPassword(resetToken)
}

// Initialize
if (authToken) {
  showDashboard()
} else {
  showLogin()
}

// Show sections
function showSection(sectionId) {
  document.querySelectorAll(".section").forEach(s => s.classList.remove("active"))
  const section = document.getElementById(sectionId)
  if (section) section.classList.add("active")
}

function showLogin() {
  showSection("loginSection")
}

function showSignup() {
  showSection("signupSection")
}

function showForgotPassword() {
  showSection("forgotPasswordSection")
}

function showVerification(email) {
  showSection("verificationSection")
  document.getElementById("verificationEmail").textContent = `Verification email sent to: ${email}`
}

function showResetPassword(token) {
  showSection("resetPasswordSection")
  document.getElementById("resetPasswordForm").dataset.token = token
}

function showDashboard() {
  showSection("dashboardSection")
  loadDashboardData()
}

function showDashboardSection(section) {
  currentSection = section
  document.querySelectorAll(".nav-btn").forEach(btn => btn.classList.remove("active"))
  event.target.classList.add("active")
  
  document.querySelectorAll(".dashboard-content").forEach(content => {
    content.style.display = "none"
  })
  
  const contentId = section + "Content"
  const content = document.getElementById(contentId)
  if (content) {
    content.style.display = "block"
    loadDashboardData()
  }
}

// Alert system
function showAlert(message, type = "success") {
  const alert = document.getElementById("alert")
  alert.textContent = message
  alert.className = `alert ${type} show`
  setTimeout(() => {
    alert.classList.remove("show")
  }, 5000)
}

// API call helper
async function apiCall(endpoint, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers
  }
  
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`
  }
  
  try {
    const url = `${API_BASE}${endpoint}`
    console.log(`📡 API Call: ${url}`, { 
      method: options.method || "GET", 
      headers,
      body: options.body ? JSON.parse(options.body) : undefined
    })
    
    const response = await fetch(url, {
      ...options,
      headers
    })
    
    console.log(`📥 Response status: ${response.status} ${response.statusText}`)
    
    const data = await response.json()
    console.log("📥 Response data:", data)
    
    if (!response.ok) {
      const errorMsg = data.error || data.message || "Request failed"
      const errorDetails = data.details ? ` - ${data.details}` : ""
      throw new Error(`${errorMsg}${errorDetails}`)
    }
    
    return data
  } catch (error) {
    console.error("❌ API Call error:", error)
    throw error
  }
}

// Login
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault()
  
  const email = document.getElementById("loginEmail").value
  const password = document.getElementById("loginPassword").value
  
  if (!email || !password) {
    showAlert("Please fill in all fields", "error")
    return
  }
  
  try {
    const data = await apiCall("/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    })
    
    authToken = data.token
    localStorage.setItem("adminToken", authToken)
    showAlert("Login successful!")
    showDashboard()
  } catch (error) {
    showAlert(error.message || "Login failed", "error")
  }
})

// Signup
document.getElementById("signupForm").addEventListener("submit", async (e) => {
  e.preventDefault()
  
  const name = document.getElementById("signupName").value
  const email = document.getElementById("signupEmail").value
  const phone = document.getElementById("signupPhone").value
  const password = document.getElementById("signupPassword").value
  
  if (!name || !email || !phone || !password) {
    showAlert("Please fill in all fields", "error")
    return
  }
  
  if (password.length < 6) {
    showAlert("Password must be at least 6 characters", "error")
    return
  }
  
  try {
    console.log("📤 Sending signup request:", { name, email, phone, passwordLength: password.length })
    const data = await apiCall("/signup", {
      method: "POST",
      body: JSON.stringify({ name, email, phone, password })
    })
    
    console.log("✅ Signup response:", data)
    
    if (data.requiresVerification) {
      showAlert("Verification email sent! Please check your email.", "success")
      showVerification(data.email || email)
    } else {
      showAlert("Signup successful!")
      showLogin()
    }
  } catch (error) {
    console.error("❌ Signup error:", error)
    const errorMessage = error.message || "Signup failed"
    showAlert(errorMessage, "error")
  }
})

// Verify Email
async function verifyEmail(token) {
  try {
    const data = await apiCall(`/verify-email/${token}`, {
      method: "GET"
    })
    
    authToken = data.token
    localStorage.setItem("adminToken", authToken)
    showAlert("Email verified! You are now logged in.", "success")
    showDashboard()
  } catch (error) {
    showAlert(error.message || "Verification failed", "error")
    showLogin()
  }
}

// Resend Verification Email
async function resendVerificationEmail() {
  const email = document.getElementById("verificationEmail").textContent.replace("Verification email sent to: ", "")
  
  if (!email) {
    showAlert("Email not found", "error")
    return
  }
  
  try {
    await apiCall("/resend-verification", {
      method: "POST",
      body: JSON.stringify({ email })
    })
    showAlert("Verification email resent!", "success")
  } catch (error) {
    showAlert(error.message || "Failed to resend email", "error")
  }
}

// Forgot Password
document.getElementById("forgotPasswordForm").addEventListener("submit", async (e) => {
  e.preventDefault()
  
  const email = document.getElementById("forgotEmail").value
  
  if (!email) {
    showAlert("Please enter your email", "error")
    return
  }
  
  try {
    await apiCall("/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email })
    })
    showAlert("If email exists, reset link has been sent. Please check your email.", "success")
    document.getElementById("forgotPasswordForm").innerHTML += `
      <button type="button" class="resend-btn" onclick="resendResetPassword('${email}')">Resend Reset Link</button>
    `
  } catch (error) {
    showAlert(error.message || "Failed to send reset link", "error")
  }
})

// Resend Reset Password
async function resendResetPassword(email) {
  try {
    await apiCall("/resend-reset-password", {
      method: "POST",
      body: JSON.stringify({ email })
    })
    showAlert("Reset link resent!", "success")
  } catch (error) {
    showAlert(error.message || "Failed to resend reset link", "error")
  }
}

// Reset Password
document.getElementById("resetPasswordForm").addEventListener("submit", async (e) => {
  e.preventDefault()
  
  const token = document.getElementById("resetPasswordForm").dataset.token || window.location.pathname.split("/").pop()
  const password = document.getElementById("resetPassword").value
  const confirmPassword = document.getElementById("resetPasswordConfirm").value
  
  if (!password || !confirmPassword) {
    showAlert("Please fill in all fields", "error")
    return
  }
  
  if (password.length < 6) {
    showAlert("Password must be at least 6 characters", "error")
    return
  }
  
  if (password !== confirmPassword) {
    showAlert("Passwords do not match", "error")
    return
  }
  
  try {
    await apiCall(`/reset-password/${token}`, {
      method: "POST",
      body: JSON.stringify({ password })
    })
    showAlert("Password reset successful! You can now login.", "success")
    setTimeout(() => {
      showLogin()
    }, 2000)
  } catch (error) {
    showAlert(error.message || "Password reset failed", "error")
  }
})

// Logout
function logout() {
  authToken = null
  localStorage.removeItem("adminToken")
  showLogin()
  showAlert("Logged out successfully")
}

// Load Dashboard Data
async function loadDashboardData() {
  if (!authToken) return
  
  try {
    switch (currentSection) {
      case "analytics":
        await loadAnalytics()
        break
      case "moderation":
        await loadModeration()
        break
      case "reports":
        await loadReports()
        break
      case "pinned":
        await loadPinned()
        break
      case "profile":
        await loadProfile()
        break
    }
  } catch (error) {
    if (error.message.includes("token") || error.message.includes("401")) {
      logout()
      showAlert("Session expired. Please login again.", "error")
    }
  }
}

// Load Analytics
async function loadAnalytics() {
  try {
    const data = await apiCall("/activity", { method: "GET" })
    
    const ctx = document.getElementById("analyticsChart")
    if (ctx) {
      new Chart(ctx, {
        type: "pie",
        data: {
          labels: ["BMI", "LGS", "ROOTS"],
          datasets: [{
            data: [data.BMI || 0, data.LGS || 0, data.ROOTS || 0],
            backgroundColor: ["#ff2d87", "#ff6b9d", "#ffa0c2"]
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              labels: { color: "#fff" }
            }
          }
        }
      })
    }
  } catch (error) {
    showAlert(error.message || "Failed to load analytics", "error")
  }
}

// Helper function to create download card HTML
function createDownloadCard(post) {
  const hasImage = post.image && post.image !== null && post.image !== "null" && post.image.trim() !== ""
  const imageUrl = hasImage ? (post.image.startsWith("http") ? post.image : `${window.location.origin}${post.image}`) : ""
  const authorInitial = (post.author || "A").charAt(0).toUpperCase()
  
  return `
    <div class="download-card ${hasImage ? 'has-image' : 'no-image'}" id="download-${post._id}">
      ${hasImage ? `<img src="${imageUrl}" class="card-image" crossorigin="anonymous">` : ""}
      <div class="card-content">
        <div class="card-meta">
          <span class="avatar">${authorInitial}</span>
          <span class="campus">${post.campus || "N/A"}</span>
          <span class="category">${post.category || "Spotted 👀"}</span>
        </div>
        <p class="card-text">${post.text || ""}</p>
      </div>
      <div class="watermark">Gossip Girl</div>
    </div>
  `
}

// Load Moderation
async function loadModeration() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/posts`)
    const posts = await response.json()
    
    const list = document.getElementById("moderationList")
    list.innerHTML = ""
    
    // Create a container for download cards (hidden)
    let downloadCardsContainer = document.getElementById("downloadCardsContainer")
    if (!downloadCardsContainer) {
      downloadCardsContainer = document.createElement("div")
      downloadCardsContainer.id = "downloadCardsContainer"
      downloadCardsContainer.style.position = "absolute"
      downloadCardsContainer.style.left = "-9999px"
      downloadCardsContainer.style.visibility = "hidden"
      document.body.appendChild(downloadCardsContainer)
    }
    downloadCardsContainer.innerHTML = ""
    
    posts.forEach(post => {
      // Create download card
      const cardDiv = document.createElement("div")
      cardDiv.innerHTML = createDownloadCard(post)
      downloadCardsContainer.appendChild(cardDiv.firstElementChild)
      
      // Create post item
      const div = document.createElement("div")
      div.className = "post-item"
      div.innerHTML = `
        <div class="post-item-header">
          <strong>${post.author || "Anonymous"}</strong>
          <span class="post-item-meta">${post.campus || "N/A"} • ${new Date(post.createdAt).toLocaleDateString()}</span>
        </div>
        <div class="post-item-text">${post.text || ""}</div>
        <div class="post-item-meta">
          ❤️ ${post.likes || 0} • 🔥 ${post.fires || 0} • 😂 ${post.laughs || 0} • 💬 ${post.comments?.length || 0}
        </div>
        <div class="actions">
          <button class="btn-danger" onclick="deletePost('${post._id}')">Delete</button>
          <button class="btn-secondary" onclick="togglePin('${post._id}')">${post.pinned ? "Unpin" : "Pin"}</button>
          <button onclick="downloadPost('${post._id}')">Download Post</button>
        </div>
      `
      list.appendChild(div)
    })
  } catch (error) {
    showAlert(error.message || "Failed to load posts", "error")
  }
}

// Load Reports
async function loadReports() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/report/posts`, {
      headers: {
        "Authorization": `Bearer ${authToken}`
      }
    })
    const posts = await response.json()
    
    const list = document.getElementById("reportsList")
    list.innerHTML = ""
    
    if (posts.length === 0) {
      list.innerHTML = "<p style='color: #aaa;'>No reported posts</p>"
      return
    }
    
    // Create a container for download cards (hidden)
    let downloadCardsContainer = document.getElementById("downloadCardsContainer")
    if (!downloadCardsContainer) {
      downloadCardsContainer = document.createElement("div")
      downloadCardsContainer.id = "downloadCardsContainer"
      downloadCardsContainer.style.position = "absolute"
      downloadCardsContainer.style.left = "-9999px"
      downloadCardsContainer.style.visibility = "hidden"
      document.body.appendChild(downloadCardsContainer)
    }
    
    posts.forEach(post => {
      // Create download card
      const cardDiv = document.createElement("div")
      cardDiv.innerHTML = createDownloadCard(post)
      downloadCardsContainer.appendChild(cardDiv.firstElementChild)
      
      const div = document.createElement("div")
      div.className = "report-item"
      div.innerHTML = `
        <div class="post-item-header">
          <strong>${post.author || "Anonymous"}</strong>
          <span class="post-item-meta">Reports: ${post.reports || 0}</span>
        </div>
        <div class="post-item-text">${post.text || ""}</div>
        <div class="actions">
          <button class="btn-danger" onclick="deletePost('${post._id}')">Delete</button>
          <button onclick="downloadPost('${post._id}')">Download Post</button>
        </div>
      `
      list.appendChild(div)
    })
  } catch (error) {
    showAlert(error.message || "Failed to load reports", "error")
  }
}

// Load Pinned
async function loadPinned() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/posts`)
    const posts = await response.json()
    const pinnedPosts = posts.filter(p => p.pinned)
    
    const list = document.getElementById("pinnedList")
    list.innerHTML = ""
    
    if (pinnedPosts.length === 0) {
      list.innerHTML = "<p style='color: #aaa;'>No pinned posts</p>"
      return
    }
    
    // Create a container for download cards (hidden)
    let downloadCardsContainer = document.getElementById("downloadCardsContainer")
    if (!downloadCardsContainer) {
      downloadCardsContainer = document.createElement("div")
      downloadCardsContainer.id = "downloadCardsContainer"
      downloadCardsContainer.style.position = "absolute"
      downloadCardsContainer.style.left = "-9999px"
      downloadCardsContainer.style.visibility = "hidden"
      document.body.appendChild(downloadCardsContainer)
    }
    
    pinnedPosts.forEach(post => {
      // Create download card
      const cardDiv = document.createElement("div")
      cardDiv.innerHTML = createDownloadCard(post)
      downloadCardsContainer.appendChild(cardDiv.firstElementChild)
      
      const div = document.createElement("div")
      div.className = "post-item"
      div.innerHTML = `
        <div class="post-item-header">
          <strong>${post.author || "Anonymous"}</strong>
          <span class="post-item-meta">${post.campus || "N/A"}</span>
        </div>
        <div class="post-item-text">${post.text || ""}</div>
        <div class="actions">
          <button class="btn-secondary" onclick="togglePin('${post._id}')">Unpin</button>
          <button onclick="downloadPost('${post._id}')">Download Post</button>
        </div>
      `
      list.appendChild(div)
    })
  } catch (error) {
    showAlert(error.message || "Failed to load pinned posts", "error")
  }
}

// Load Profile
async function loadProfile() {
  try {
    const data = await apiCall("/profile", { method: "GET" })
    
    document.getElementById("profileName").value = data.name || ""
    document.getElementById("profileEmail").value = data.email || ""
    document.getElementById("profilePhone").value = data.phone || ""
  } catch (error) {
    showAlert(error.message || "Failed to load profile", "error")
  }
}

// Delete Post
async function deletePost(postId) {
  if (!confirm("Are you sure you want to delete this post?")) return
  
  try {
    await apiCall(`/post/${postId}`, { method: "DELETE" })
    showAlert("Post deleted successfully")
    loadModeration()
    loadReports()
  } catch (error) {
    showAlert(error.message || "Failed to delete post", "error")
  }
}

// Toggle Pin
async function togglePin(postId) {
  try {
    await apiCall(`/pin/${postId}`, { method: "POST" })
    showAlert("Post pin status updated")
    loadModeration()
    loadPinned()
  } catch (error) {
    showAlert(error.message || "Failed to update pin status", "error")
  }
}

// Send Blast
document.getElementById("blastForm").addEventListener("submit", async (e) => {
  e.preventDefault()
  
  const message = document.getElementById("blastMessage").value
  const imageFile = document.getElementById("blastImage").files[0]
  
  if (!message) {
    showAlert("Please enter a message", "error")
    return
  }
  
  try {
    const formData = new FormData()
    formData.append("message", message)
    if (imageFile) {
      formData.append("image", imageFile)
    }
    
    const response = await fetch(`${API_BASE}/blast`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${authToken}`
      },
      body: formData
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || "Failed to send blast")
    }
    
    showAlert("Blast sent successfully!")
    document.getElementById("blastForm").reset()
  } catch (error) {
    showAlert(error.message || "Failed to send blast", "error")
  }
})

// Update Profile
document.getElementById("profileForm").addEventListener("submit", async (e) => {
  e.preventDefault()
  
  const name = document.getElementById("profileName").value
  const email = document.getElementById("profileEmail").value
  const phone = document.getElementById("profilePhone").value
  const password = document.getElementById("profilePassword").value
  
  const updateData = { name, email, phone }
  if (password) {
    updateData.password = password
  }
  
  try {
    await apiCall("/profile", {
      method: "PUT",
      body: JSON.stringify(updateData)
    })
    showAlert("Profile updated successfully")
  } catch (error) {
    showAlert(error.message || "Failed to update profile", "error")
  }
})

// Download Post as PNG
async function downloadPost(postId) {
  try {
    const element = document.getElementById("download-" + postId)
    if (!element) {
      showAlert("Download card not found. Please refresh the page.", "error")
      return
    }

    // Temporarily make element visible for html2canvas
    const originalStyle = {
      position: element.style.position,
      left: element.style.left,
      top: element.style.top,
      visibility: element.style.visibility
    }
    
    element.style.position = "fixed"
    element.style.left = "0"
    element.style.top = "0"
    element.style.visibility = "visible"
    element.style.zIndex = "10000"

    // Wait for images to load
    const images = element.querySelectorAll("img")
    await Promise.all(Array.from(images).map(img => {
      return new Promise((resolve) => {
        if (img.complete) {
          resolve()
        } else {
          img.onload = resolve
          img.onerror = resolve
          // Timeout after 5 seconds
          setTimeout(resolve, 5000)
        }
      })
    }))

    // Determine dimensions based on whether image exists
    const hasImage = element.classList.contains('has-image')
    const cardWidth = hasImage ? 300 : 200
    const cardHeight = hasImage ? 400 : 100

    // Use html2canvas to capture the element
    const canvas = await html2canvas(element, {
      backgroundColor: "#fff",
      scale: 2,
      useCORS: true,
      logging: false,
      width: cardWidth,
      height: cardHeight
    })

    // Restore original styles
    element.style.position = originalStyle.position
    element.style.left = originalStyle.left
    element.style.top = originalStyle.top
    element.style.visibility = originalStyle.visibility
    element.style.zIndex = ""

    // Create download link
    const link = document.createElement("a")
    link.download = `gossip-post-${postId}.png`
    link.href = canvas.toDataURL("image/png")
    link.click()

    showAlert("Post downloaded successfully!", "success")
  } catch (error) {
    console.error("Download error:", error)
    showAlert("Failed to download post. Please try again.", "error")
  }
}

/* EMBER BACKGROUND ANIMATION */

function initEmberBackground() {
  const container = document.getElementById("ember-background")
  if (!container) return

  const maxParticles = 100
  let particleCount = 0

  function createEmber() {
    if (particleCount >= maxParticles) return

    const ember = document.createElement("div")
    ember.className = "ember"

    // Random size between 3px and 7px
    const size = Math.random() * 4 + 3
    ember.style.width = size + "px"
    ember.style.height = size + "px"

    // Random horizontal position
    ember.style.left = Math.random() * window.innerWidth + "px"

    // Random animation duration between 4s and 6s
    const duration = Math.random() * 2 + 4
    ember.style.animation = `emberFloat ${duration}s linear forwards`

    // Random horizontal drift
    const drift = (Math.random() * 100 - 50) + "px"
    ember.style.setProperty("--drift", drift)

    // Random opacity
    ember.style.opacity = (Math.random() * 0.3 + 0.5).toString()

    container.appendChild(ember)
    particleCount++

    // Remove particle after animation completes
    setTimeout(() => {
      ember.remove()
      particleCount--
    }, duration * 1000)
  }

  // Create initial particles
  for (let i = 0; i < 40; i++) {
    setTimeout(() => createEmber(), i * 100)
  }

  // Continuously create new particles every 50-150ms for more flashes
  setInterval(() => {
    if (particleCount < maxParticles) {
      // Sometimes create 2-3 particles at once for bursts
      const burst = Math.random() < 0.3 ? Math.floor(Math.random() * 2) + 2 : 1
      for (let i = 0; i < burst && particleCount < maxParticles; i++) {
        createEmber()
      }
    }
  }, Math.random() * 100 + 50)
}

// Initialize ember background when page loads
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initEmberBackground)
} else {
  initEmberBackground()
}

// Make functions globally available
window.showSignup = showSignup
window.showLogin = showLogin
window.showForgotPassword = showForgotPassword
window.resendVerificationEmail = resendVerificationEmail
window.resendResetPassword = resendResetPassword
window.logout = logout
window.showDashboardSection = showDashboardSection
window.deletePost = deletePost
window.togglePin = togglePin
window.downloadPost = downloadPost