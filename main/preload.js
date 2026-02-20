const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // If we need native OS features later (file system, notifications, etc.), we add them here.
});
