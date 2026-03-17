const CACHE_NAME = "gossip-girl-cache-v1"

const urlsToCache = [
  "/",
  "/index.html",
  "/app.js"
]


/* INSTALL */

self.addEventListener("install", event => {

event.waitUntil(

caches.open(CACHE_NAME)
.then(cache => {
return cache.addAll(urlsToCache)
})

)

})


/* ACTIVATE */

self.addEventListener("activate", event => {

event.waitUntil(
caches.keys().then(keys => {

return Promise.all(

keys.map(key => {

if(key !== CACHE_NAME){
return caches.delete(key)
}

})

)

})

)

})


/* FETCH (OFFLINE SUPPORT) */

self.addEventListener("fetch", event => {

event.respondWith(

caches.match(event.request)
.then(response => {

return response || fetch(event.request)

})

)

})


/* PUSH NOTIFICATION */

self.addEventListener("push", event => {

let data = {}

if(event.data){
data = event.data.json()
}

const title = data.title || "Gossip Girl 💋"

const options = {

body: data.body || "New gossip blast just dropped",

icon: "/icon.png",

badge: "/icon.png",

data: {
url: "/"
}

}

event.waitUntil(

self.registration.showNotification(title, options)

)

})


/* CLICK NOTIFICATION */

self.addEventListener("notificationclick", event => {

event.notification.close()

event.waitUntil(

clients.openWindow(event.notification.data.url)

)

})