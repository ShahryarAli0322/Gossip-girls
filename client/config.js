// Runtime configuration - This file gets generated during build
// For Vercel: Set API_BASE_URL and SOCKET_URL as environment variables
// They will be injected here during build process

// Backend API URL - Update this if your backend URL changes
window.API_BASE_URL = window.API_BASE_URL || '%VITE_API_BASE_URL%' || 'https://gossip-girls.onrender.com';
window.SOCKET_URL = window.SOCKET_URL || '%VITE_SOCKET_URL%' || window.API_BASE_URL;

console.log('📡 API Configuration loaded:', {
  API_BASE_URL: window.API_BASE_URL,
  SOCKET_URL: window.SOCKET_URL
});
