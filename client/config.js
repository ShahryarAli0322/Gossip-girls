// Backend API Configuration
// CRITICAL: This file sets the backend URL for all API calls
// Force correct URL - no placeholders allowed

// Single source of truth for backend URL
const CORRECT_BACKEND_URL = 'https://gossip-girls.onrender.com';

// Export to window for global access
window.CORRECT_BACKEND_URL = CORRECT_BACKEND_URL;

// Force set correct URL, overriding any placeholder
window.API_BASE_URL = CORRECT_BACKEND_URL;
window.SOCKET_URL = CORRECT_BACKEND_URL;

// Double-check and fix if placeholder somehow exists
if (window.API_BASE_URL.includes('your-backend-url') || 
    window.API_BASE_URL === 'undefined' ||
    !window.API_BASE_URL) {
  window.API_BASE_URL = CORRECT_BACKEND_URL;
  window.SOCKET_URL = CORRECT_BACKEND_URL;
  console.warn('⚠️ Fixed placeholder URL in config.js');
}

console.log('📡 Config.js loaded - API Configuration:', {
  API_BASE_URL: window.API_BASE_URL,
  SOCKET_URL: window.SOCKET_URL,
  CORRECT_BACKEND_URL: window.CORRECT_BACKEND_URL
});
