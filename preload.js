const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
    // Database operations
    getArticles: (lang) => ipcRenderer.invoke('db-get-articles', lang),
    searchArticles: (query, lang) => ipcRenderer.invoke('db-search-articles', query, lang),
    
    // Bookmarks
    getBookmarks: () => ipcRenderer.invoke('db-get-bookmarks'),
    addBookmark: (articleId, title, notes) => ipcRenderer.invoke('db-add-bookmark', articleId, title, notes),
    removeBookmark: (articleId) => ipcRenderer.invoke('db-remove-bookmark', articleId),
    
    // Calculator history
    saveCalculation: (data) => ipcRenderer.invoke('db-save-calculation', data),
    getCalculations: () => ipcRenderer.invoke('db-get-calculations'),
    deleteCalculation: (id) => ipcRenderer.invoke('db-delete-calculation', id),
    
    // Export operations
    exportPDF: (data, options) => ipcRenderer.invoke('export-pdf', data, options),
    showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
    showOpenDialog: (options) => ipcRenderer.invoke('show-open-dialog', options),
    
    // Clipboard
    copyToClipboard: (text) => ipcRenderer.invoke('copy-to-clipboard', text),
    
    // Window operations
    minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
    maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
    closeWindow: () => ipcRenderer.invoke('close-window'),
    
    // Event listeners
    onNewCalculator: (callback) => ipcRenderer.on('new-calculator', callback),
    onExportPDF: (callback) => ipcRenderer.on('export-pdf', callback),
    onOpenCalculator: (callback) => ipcRenderer.on('open-calculator', callback),
    onClearCalculator: (callback) => ipcRenderer.on('clear-calculator', callback),
    onCopyResults: (callback) => ipcRenderer.on('copy-calculator-results', callback),
    onManageBookmarks: (callback) => ipcRenderer.on('manage-bookmarks', callback),
    
    // Remove listeners
    removeListener: (channel) => ipcRenderer.removeAllListeners(channel)
});

// Expose platform information
contextBridge.exposeInMainWorld('platform', {
    isElectron: true,
    platform: process.platform,
    arch: process.arch,
    versions: process.versions
});
