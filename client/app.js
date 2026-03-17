// API Configuration - Injected at build time via Vercel environment variables
// Set API_BASE_URL and SOCKET_URL in Vercel dashboard
// Fallback to placeholder if not set (will be replaced during build)
const API_BASE_URL = window.API_BASE_URL || "%VITE_API_BASE_URL%" || "https://your-backend-url.onrender.com"
const SOCKET_URL = window.SOCKET_URL || "%VITE_SOCKET_URL%" || API_BASE_URL

// Initialize Socket.IO connection
const socket = typeof io !== "undefined" ? io(SOCKET_URL, {
transports:["websocket","polling"]
}) : null

let posts = []
let currentFilter = "all"

/* USER IDENTITY */

let initial = localStorage.getItem("initial")
const modal = document.getElementById("nameModal")

if(!initial){
modal.style.display="flex"
}

/* IMAGE UPLOAD HANDLER WITH PREVIEW */

// Wait for DOM to be ready, then set up image upload handler
function initImageUpload(){
// Try multiple ways to find the image input
let imageInput=document.getElementById("gossipImage")
if(!imageInput){
imageInput=document.querySelector("#gossipImage")
}
if(!imageInput){
const label=document.querySelector(".image-upload-btn")
if(label){
imageInput=label.querySelector("input[type='file']")
}
}

const uploadBtn=document.querySelector(".image-upload-btn")
const imagePreview=document.getElementById("imagePreview")
const previewContainer=document.getElementById("imagePreviewContainer")

console.log("🔧 initImageUpload - Image input found:", !!imageInput)

if(imageInput && uploadBtn){
imageInput.addEventListener("change",function(e){
const file=this.files[0]

if(file){
// Update button text
uploadBtn.classList.add("has-file")
uploadBtn.innerHTML=`📎 ${file.name}`

// Show image preview
if(imagePreview && previewContainer){
const reader=new FileReader()

reader.onload=function(e){
imagePreview.src=e.target.result
imagePreview.style.display="block"
previewContainer.style.display="block"
}

reader.readAsDataURL(file)
}
}else{
// Clear preview
if(imagePreview && previewContainer){
imagePreview.style.display="none"
imagePreview.src=""
previewContainer.style.display="none"
}
uploadBtn.classList.remove("has-file")
uploadBtn.innerHTML='📎'
}
})
}
}

// Store image input reference globally for submitPost to access
let globalImageInput = null

// Initialize when DOM is ready
if(document.readyState==="loading"){
document.addEventListener("DOMContentLoaded",()=>{
initImageUpload()
// Store reference after initialization
globalImageInput = document.getElementById("gossipImage") || 
                   document.querySelector("#gossipImage") ||
                   document.querySelector(".image-upload-btn input[type='file']")
})
}else{
initImageUpload()
// Store reference after initialization
globalImageInput = document.getElementById("gossipImage") || 
                   document.querySelector("#gossipImage") ||
                   document.querySelector(".image-upload-btn input[type='file']")
}

function saveName(){

let name=document.getElementById("nameInput").value.trim()

if(!name) name="Anonymous"

initial=name.charAt(0).toUpperCase()

localStorage.setItem("initial",initial)

modal.style.display="none"

}

/* FIREWORKS */

function fireworks(){

const container=document.getElementById("fireworks")

if(!container){
console.error("Fireworks container not found")
return
}

const emojis=["💋"]

let duration=5000
let interval=250

const fireworkInterval=setInterval(()=>{

for(let i=0;i<8;i++){

const fw=document.createElement("div")

fw.className="firework"
fw.innerText=emojis[Math.floor(Math.random()*emojis.length)]

fw.style.left=Math.random()*window.innerWidth+"px"
fw.style.top=Math.random()*window.innerHeight+"px"

container.appendChild(fw)

setTimeout(()=>{
if(fw.parentNode){
fw.remove()
}
},1200)

}

},interval)

setTimeout(()=>clearInterval(fireworkInterval),duration)

}

// Make function globally accessible
window.fireworks=fireworks

/* SERVICE WORKER REGISTRATION */

if("serviceWorker" in navigator){
navigator.serviceWorker.register("/service-worker.js")
.then(reg=>{
console.log("Service Worker registered:",reg)
})
.catch(err=>{
console.error("Service Worker registration failed:",err)
})
}

/* FOLLOW NOTIFICATIONS */

async function followGossipGirl(){

try{

// Request notification permission
const permission=await Notification.requestPermission()

if(permission==="granted"){

// Wait for service worker to be ready
const reg=await navigator.serviceWorker.ready

// Check if already subscribed
let subscription=await reg.pushManager.getSubscription()

if(!subscription){

// Try to get VAPID key from server
let subscriptionCreated=false
try{
const response=await fetch(`${API_BASE_URL}/api/push/vapid-key`)
if(response.ok){
const data=await response.json()
const vapidPublicKey=data.publicKey

// Create push subscription
subscription=await reg.pushManager.subscribe({
userVisibleOnly:true,
applicationServerKey:urlBase64ToUint8Array(vapidPublicKey)
})

// Store subscription locally
localStorage.setItem("pushSubscription",JSON.stringify(subscription))

// Send subscription to server
try{
await fetch(`${API_BASE_URL}/api/push/subscribe`,{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify(subscription)
})
}catch(e){
console.log("Could not send subscription to server, stored locally")
}

subscriptionCreated=true
}
}catch(e){
console.log("Push subscription not available:",e)
}

// Mark user as wanting notifications
localStorage.setItem("wantsNotifications","true")

// Show confirmation notification
reg.showNotification("Gossip Girl 💋",{
body:subscriptionCreated ? "You will now receive E-Blasts even when offline!" : "Notifications enabled! You'll receive updates.",
icon:"/icon.png",
badge:"/icon.png",
tag:"follow-confirmation"
})

alert(subscriptionCreated ? "Successfully subscribed! You'll receive notifications even when not on the site." : "Notifications enabled! You'll receive updates when on the site.")

}else{

// Already subscribed
reg.showNotification("Gossip Girl 💋",{
body:"You're already subscribed to E-Blasts!",
icon:"/icon.png",
badge:"/icon.png",
tag:"follow-confirmation"
})

alert("You're already subscribed to notifications!")

}

}else{

alert("Notification permission denied. Please enable notifications in your browser settings.")

}

}catch(error){

console.error("Error subscribing to notifications:",error)
alert("Failed to enable notifications. Please try again.")

}

}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String){
const padding="=".repeat((4-base64String.length%4)%4)
const base64=(base64String+padding).replace(/\-/g,"+").replace(/_/g,"/")
const rawData=window.atob(base64)
const outputArray=new Uint8Array(rawData.length)
for(let i=0;i<rawData.length;++i){
outputArray[i]=rawData.charCodeAt(i)
}
return outputArray
}

/* LOAD POSTS */

async function loadPosts(filter = "all"){

try{

let url = `${API_BASE_URL}/api/posts`
if(filter === "hot"){
url = `${API_BASE_URL}/api/posts/hot`
}else if(filter !== "all"){
url = `${API_BASE_URL}/api/posts/campus/${filter}`
}

const res = await fetch(url)

posts = await res.json()

// Sort: admin blasts first, then pinned, then by hotScore or createdAt
posts.sort((a, b) => {
// Admin blasts always first
if(a.isAdminBlast && !b.isAdminBlast) return -1
if(!a.isAdminBlast && b.isAdminBlast) return 1
// Then pinned posts
if(a.pinned && !b.pinned) return -1
if(!a.pinned && b.pinned) return 1
// Then by hot score
if(a.hotScore && b.hotScore) return b.hotScore - a.hotScore
// Finally by date
return new Date(b.createdAt) - new Date(a.createdAt)
})

render()

}catch(err){

console.error("Failed loading posts",err)

}

}

/* FILTER CAMPUS */

function filterCampus(campus){

currentFilter = campus

// Update dropdown value
const dropdown = document.getElementById("campusFilter")
if(dropdown){
dropdown.value = campus
}

loadPosts(campus)

}

/* CREATE POST */

async function submitPost(event){

// Prevent default form submission
if(event){
event.preventDefault()
}

try{

const campusEl=document.getElementById("campus")
const textEl=document.getElementById("gossipText")
const categoryEl=document.getElementById("category")

// Try multiple ways to find the image input
let imageEl = globalImageInput || document.getElementById("gossipImage")

// If not found, try querySelector
if(!imageEl){
imageEl=document.querySelector("#gossipImage")
}

// If still not found, try finding it inside the label
if(!imageEl){
const label=document.querySelector(".image-upload-btn")
if(label){
imageEl=label.querySelector("input[type='file']")
}
}

// Last resort: try to find any file input in the post box
if(!imageEl){
const postBox=document.querySelector(".post-box")
if(postBox){
imageEl=postBox.querySelector("input[type='file']")
}
}

if(!campusEl || !textEl || !categoryEl){
alert("Error: Form elements not found. Please refresh the page.")
return
}

// Log image element status
console.log("🔍 Image element search:")
console.log("  getElementById result:", document.getElementById("gossipImage"))
console.log("  querySelector result:", document.querySelector("#gossipImage"))
console.log("  Found via label:", imageEl)

const campus=campusEl.value
const text=textEl.value.trim()
const category=categoryEl.value

// Get image file from input
let imageFile = null
if(imageEl){
console.log("✅ Image element found:", imageEl.id || "no id", imageEl.type)
if(imageEl.files && imageEl.files.length > 0){
imageFile = imageEl.files[0]
console.log("✅ Image file selected:")
console.log("  Name:", imageFile.name)
console.log("  Size:", (imageFile.size/1024).toFixed(2) + "KB")
console.log("  Type:", imageFile.type)
}else{
console.log("ℹ️ No image file selected (files array is empty or doesn't exist)")
console.log("  Files length:", imageEl.files ? imageEl.files.length : "files property doesn't exist")
}
}else{
console.log("⚠️ Image input element not found!")
console.log("  Attempted to find element with ID 'gossipImage'")
}

// Validate text input
if(!text){
alert("Please write some gossip before submitting!")
return
}

if(!initial){
alert("Please enter your name first!")
document.getElementById("nameModal").style.display="flex"
return
}

// Create FormData - do NOT set Content-Type header
const formData=new FormData()

formData.append("campus",campus)
formData.append("text",text)
formData.append("category",category)
formData.append("author",initial)

// Append image to FormData if present
if(imageFile){
formData.append("image", imageFile)
console.log("✅ Image appended to FormData with key 'image'")
}else{
console.log("ℹ️ No image file to append to FormData")
}

// Log all FormData entries for debugging
console.log("📦 FormData contents:")
for(let pair of formData.entries()){
if(pair[1] instanceof File){
console.log(`  ${pair[0]}: [File] ${pair[1].name} (${(pair[1].size/1024).toFixed(2)}KB, ${pair[1].type})`)
}else{
console.log(`  ${pair[0]}: "${pair[1]}"`)
}
}

// Submit post
console.log("📤 Submitting POST request to /api/posts...")
const response=await fetch(`${API_BASE_URL}/api/posts`,{
method:"POST",
body:formData
// Do NOT set Content-Type header - browser sets it automatically with boundary for FormData
})

console.log("📥 Response received - Status:", response.status, response.statusText)

if(!response.ok){
const errorData=await response.json().catch(()=>({}))
console.error("❌ Server error:", errorData)
throw new Error(errorData.error || `Failed to submit post: ${response.status} ${response.statusText}`)
}

const responseData=await response.json()
console.log("✅ Post submitted successfully!")
console.log("📝 Response data:", responseData)
console.log("🖼️ Image path:", responseData.image || "null (no image uploaded)")

// Clear form
textEl.value=""
if(imageEl){
imageEl.value=""
}

// Clear image preview
const imagePreview=document.getElementById("imagePreview")
const previewContainer=document.getElementById("imagePreviewContainer")
if(imagePreview){
imagePreview.style.display="none"
imagePreview.src=""
}
if(previewContainer){
previewContainer.style.display="none"
}

// Update button text
const uploadBtn=document.querySelector(".image-upload-btn")
if(uploadBtn){
uploadBtn.classList.remove("has-file")
uploadBtn.innerHTML='📎'
}

// Reload posts to show the new one
await loadPosts(currentFilter)

// Show notification and trigger fireworks animation
blast(text)
fireworks()

}catch(err){

console.error("Post failed",err)
alert("Failed to submit post: " + err.message)

}

}

// Make functions globally accessible - ensure they're available when DOM is ready
if(document.readyState==="loading"){
document.addEventListener("DOMContentLoaded",()=>{
window.submitPost=submitPost
window.followGossipGirl=followGossipGirl
})
}else{
window.submitPost=submitPost
window.followGossipGirl=followGossipGirl
}

/* DELETE POST */

async function deletePost(id){

try{

await fetch(`${API_BASE_URL}/api/posts/`+id,{
method:"DELETE"
})

}catch(err){

console.error("Delete failed",err)

}

}

/* REACT (SAVED IN DATABASE) */

async function react(id,type){

try{

await fetch(`${API_BASE_URL}/api/react/`+id,{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({type})
})

}catch(err){

console.error("Reaction failed",err)

}

}

/* TOGGLE REACTION PICKER */

function toggleReact(id){

const picker=document.getElementById("react-"+id)

if(!picker) return

picker.style.display =
picker.style.display==="flex" ? "none" : "flex"

}


/* BLAST ALERT */

function blast(text){

const box=document.getElementById("blast")

if(!box){
console.error("Blast element not found")
return
}

box.innerText="🚨 NEW BLAST: "+text

box.style.display="block"

setTimeout(()=>{

box.style.display="none"

},3000)

}

// Make function globally accessible
window.blast=blast

/* SOCKET REALTIME */

if(socket){

socket.on("newPost",(post)=>{

// Log post data to debug image
console.log("New post received:",post)
console.log("Post image:",post.image)

// If it's an admin blast, add to top and re-sort
if(post.isAdminBlast){
posts.unshift(post)
// Re-sort to ensure admin blasts stay at top
posts.sort((a, b) => {
if(a.isAdminBlast && !b.isAdminBlast) return -1
if(!a.isAdminBlast && b.isAdminBlast) return 1
if(a.pinned && !b.pinned) return -1
if(!a.pinned && b.pinned) return 1
if(a.hotScore && b.hotScore) return b.hotScore - a.hotScore
return new Date(b.createdAt) - new Date(a.createdAt)
})
}else{
posts.unshift(post)
}
render()

})

socket.on("deletePost",(id)=>{

posts = posts.filter(p=>p._id !== id)
render()

})

socket.on("updatePost",(updatedPost)=>{

posts = posts.map(p=>{

if(p._id === updatedPost._id){
return updatedPost
}

return p

})

// Re-sort after update
posts.sort((a, b) => {
// Admin blasts always first
if(a.isAdminBlast && !b.isAdminBlast) return -1
if(!a.isAdminBlast && b.isAdminBlast) return 1
// Then pinned posts
if(a.pinned && !b.pinned) return -1
if(!a.pinned && b.pinned) return 1
// Then by hot score
if(a.hotScore && b.hotScore) return b.hotScore - a.hotScore
// Finally by date
return new Date(b.createdAt) - new Date(a.createdAt)
})

render()

})

socket.on("adminBlast",(message)=>{

blast("Official Blast from Gossip Girl: " + message)

})

}

/* RENDER */

function render(){

const list=document.getElementById("gossipList")
const trending=document.getElementById("trendingList")

list.innerHTML=""
trending.innerHTML=""

/* TRENDING TAGS */

const tags={}

posts.forEach(p=>{

const found=p.text.match(/#\w+/g)

if(found){

found.forEach(t=>{
tags[t]=(tags[t]||0)+1
})

}

})

Object.entries(tags)
.sort((a,b)=>b[1]-a[1])
.slice(0,5)
.forEach(t=>{

const div=document.createElement("div")
div.className="trend"
div.innerText=t[0]+" ("+t[1]+")"

trending.appendChild(div)

})

/* POSTS */

posts.forEach(p=>{

const div=document.createElement("div")
const hasImage = p.image && p.image !== null && p.image !== "null" && p.image.trim() !== ""
div.className="post" + (p.pinned ? " pinned" : "") + (p.isAdminBlast ? " admin-blast" : "") + (hasImage ? " has-image" : " no-image")

// Debug: log image data
if(p.image){
console.log("Rendering post with image:",p._id,p.image)
}

// Structure: Image first (if exists), then content below
div.innerHTML=`

${p.image && p.image !== null && p.image !== "null" && p.image.trim() !== "" ? `<div class="post-image"><img src="${p.image.startsWith('http') ? p.image : API_BASE_URL + p.image}" alt="gossip image" onerror="console.error('Image failed to load:', '${p.image}'); this.parentElement.style.display='none';" onload="console.log('Image loaded:', '${p.image}')"></div>` : ""}

<div class="post-content">

<div>

${p.isAdminBlast ? 
  `<div class="blast-header">
    <span class="admin-tag">admin</span>
     <span class="verified-icon">
       <img src="verified-badge.png" alt="verified" class="verified-badge-img">
     </span>
    <span class="blast-tag">Official Blast</span>
  </div>` :
  `<span class="avatar">${p.author}</span>${p.verified ? '<span class="verified-tick"><img src="verified-badge.png" alt="verified" class="verified-badge-img"></span>' : ''}${p.campus && p.campus !== "ALL" ? `<span class="campus">${p.campus}</span>` : ''}<span class="badge">${p.category}</span>`
}

</div>

<div>${p.text}</div>

<div class="post-actions">
<div class="post-actions-left">
<button class="react-toggle" onclick="toggleReact('${p._id}')">
React 💬
</button>
</div>
<div class="post-actions-center">
${p.author===initial ? `<div class="delete" onclick="deletePost('${p._id}')">delete</div>` : ""}
</div>
<div class="post-actions-right">
<div class="report-btn" onclick="reportPost('${p._id}')">Report</div>
</div>
</div>

<div id="react-${p._id}" class="reaction-picker">

<span onclick="react('${p._id}','likes')">❤️</span>
<span onclick="react('${p._id}','fires')">🔥</span>
<span onclick="react('${p._id}','laughs')">😂</span>

</div>

<div class="reaction-counts">
<span>❤️ ${p.likes||0}</span>
<span>🔥 ${p.fires||0}</span>
<span>😂 ${p.laughs||0}</span>
</div>

</div>
`

list.appendChild(div)

})

}

/* REPORT POST */

async function reportPost(id){

const reason = prompt("Why are you reporting this post?")
if(!reason) return

try{

await fetch(`${API_BASE_URL}/api/report/`+id,{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
reason:reason,
reportedBy:initial || "Anonymous"
})
})

alert("Post reported. Thank you for keeping the community safe!")

}catch(err){

console.error("Report failed",err)
alert("Failed to report post")

}

}

/* EMBER BACKGROUND ANIMATION */

function initEmberBackground(){
const container=document.getElementById("ember-background")
if(!container) return

const maxParticles=100
let particleCount=0

function createEmber(){
if(particleCount>=maxParticles) return

const ember=document.createElement("div")
ember.className="ember"

// Random size between 3px and 7px
const size=Math.random()*4+3
ember.style.width=size+"px"
ember.style.height=size+"px"

// Random horizontal position
ember.style.left=Math.random()*window.innerWidth+"px"

// Random animation duration between 4s and 6s
const duration=Math.random()*2+4
ember.style.animation=`emberFloat ${duration}s linear forwards`

// Random horizontal drift
const drift=(Math.random()*100-50)+"px"
ember.style.setProperty("--drift",drift)

// Random opacity
ember.style.opacity=(Math.random()*0.3+0.5).toString()

container.appendChild(ember)
particleCount++

// Remove particle after animation completes
setTimeout(()=>{
ember.remove()
particleCount--
},duration*1000)
}

// Create initial particles
for(let i=0;i<40;i++){
setTimeout(()=>createEmber(),i*100)
}

// Continuously create new particles every 50-150ms for more flashes
setInterval(()=>{
if(particleCount<maxParticles){
// Sometimes create 2-3 particles at once for bursts
const burst=Math.random()<0.3?Math.floor(Math.random()*2)+2:1
for(let i=0;i<burst && particleCount<maxParticles;i++){
createEmber()
}
}
},Math.random()*100+50)
}

/* KISS ANIMATION IN WRITING BOX */

function initKissAnimation(){
const container=document.querySelector(".kiss-animation")
if(!container) return

function createKiss(){
const kiss=document.createElement("div")
kiss.className="kiss-particle"
kiss.innerText="💋"

kiss.style.left=Math.random()*85+7.5+"%"
kiss.style.animationDuration=(Math.random()*1.5+2.5)+"s"
kiss.style.animationDelay=Math.random()*0.5+"s"
kiss.style.setProperty("--kiss-drift",(Math.random()*30-15)+"px")

container.appendChild(kiss)

setTimeout(()=>{
if(kiss.parentNode){
kiss.remove()
}
},4000)
}

// Create kisses periodically
setInterval(()=>{
if(container && container.children.length<4){
createKiss()
}
},2500)
}

/* IMAGE UPLOAD BUTTON HANDLER - REMOVED DUPLICATE */
/* This is now handled by initImageUpload() function above */

/* INITIAL LOAD */

initEmberBackground()
initKissAnimation()
loadPosts()

// Setup dropdown filter
if(document.readyState==="loading"){
document.addEventListener("DOMContentLoaded",()=>{
setupCampusFilter()
})
}else{
setupCampusFilter()
}

function setupCampusFilter(){
const dropdown=document.getElementById("campusFilter")
if(dropdown){
// Set initial value
dropdown.value=currentFilter

// Add change event listener
dropdown.addEventListener("change",function(){
filterCampus(this.value)
})
}
}