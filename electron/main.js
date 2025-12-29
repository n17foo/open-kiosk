// This file will only be run by Electron, not by Metro bundler
// When EXE_ENV=electron is set
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const url = require('url');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Always assume development mode when running with 'electron:dev' script
  // But don't assign directly as it causes bundling errors
  const isDev = true; // Force development mode in this context
  
  // Development URL (Expo web server)
  const devUrl = 'http://localhost:8081';
  
  // Production URL (built files)
  const prodUrl = url.format({
    pathname: path.join(__dirname, '../web-build/index.html'),
    protocol: 'file:',
    slashes: true
  });

  // Use development URL when in development mode, otherwise use production URL
  const startUrl = isDev ? devUrl : prodUrl;
  
  console.log(`Electron loading URL: ${startUrl} (Development mode: ${isDev})`);
  
  mainWindow.loadURL(startUrl);

  // Open DevTools in development mode
  if (isDev) {
    mainWindow.webContents.openDevTools();
    
    // Log for debugging purposes
    console.log('DevTools opened in development mode');
  }

  mainWindow.on('closed', function() {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', function() {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function() {
  if (mainWindow === null) {
    createWindow();
  }
});

// IPC Communication handlers
ipcMain.on('toMain', (event, args) => {
  console.log('Received from renderer:', args);
  
  // Send a response back to the renderer
  if (mainWindow) {
    mainWindow.webContents.send('fromMain', {
      response: `Received message: ${JSON.stringify(args)}`,
      timestamp: new Date().toString()
    });
  }
});

// Handle requests for system information
ipcMain.handle('getSystemInfo', async () => {
  return {
    platform: process.platform,
    arch: process.arch,
    nodeVersion: process.versions.node,
    electronVersion: process.versions.electron,
    chromeVersion: process.versions.chrome,
    v8Version: process.versions.v8,
    appVersion: app.getVersion()
  };
});
