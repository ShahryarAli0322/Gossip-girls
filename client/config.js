// Backend API Configuration
// This file sets the backend URL for all API calls
// If this file loads, it will set the URL (but index.html already sets it first)

if (!window.API_BASE_URL) {
  window.API_BASE_URL = 'https://gossip-girls.onrender.com';
}
if (!window.SOCKET_URL) {
  window.SOCKET_URL = 'https://gossip-girls.onrender.com';
}

console.log('📡 Config.js loaded - API Configuration:', {
  API_BASE_URL: window.API_BASE_URL,
  SOCKET_URL: window.SOCKET_URL
});
