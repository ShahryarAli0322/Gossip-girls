#!/usr/bin/env node

/**
 * Script to inject environment variables into client files
 * This is used during Vercel build process
 */

const fs = require('fs');
const path = require('path');

// Get environment variables
const API_BASE_URL = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'https://your-backend-url.onrender.com';
const SOCKET_URL = process.env.SOCKET_URL || process.env.NEXT_PUBLIC_SOCKET_URL || API_BASE_URL;

// Files to process
const filesToProcess = [
  'client/index.html',
  'client/admin.html',
  'client/app.js',
  'client/admin.js'
];

console.log('Injecting environment variables...');
console.log('API_BASE_URL:', API_BASE_URL);
console.log('SOCKET_URL:', SOCKET_URL);

filesToProcess.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  
  if (!fs.existsSync(filePath)) {
    console.warn(`File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace placeholders
  content = content.replace(/%VITE_API_BASE_URL%/g, API_BASE_URL);
  content = content.replace(/%VITE_SOCKET_URL%/g, SOCKET_URL);
  content = content.replace(/https:\/\/your-backend-url\.onrender\.com/g, API_BASE_URL);
  
  // For JS files, inject window variables
  if (file.endsWith('.js')) {
    // Add at the beginning if not already present
    if (!content.includes('window.API_BASE_URL')) {
      const injectCode = `\n// Injected at build time\nwindow.API_BASE_URL = window.API_BASE_URL || '${API_BASE_URL}';\nwindow.SOCKET_URL = window.SOCKET_URL || '${SOCKET_URL}';\n`;
      content = injectCode + content;
    }
  }
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✓ Processed: ${file}`);
});

console.log('Environment variables injected successfully!');
