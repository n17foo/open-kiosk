// This is the entry point for Electron
// It's separate from the React Native entry point to prevent Metro bundling issues

// Only run this file when launched by Electron
if (process.env.EXE_ENV === 'electron') {
  console.log('Starting Electron application...');
  // Import the actual electron main file
  require('./electron/main');
} else {
  console.error('This file should only be run by Electron.');
  process.exit(1);
}
