const { app, BrowserWindow, Menu, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const Database = require('./database/db');
const PDFGenerator = require('./src/export/pdf-generator');

class PenalCodeApp {
    constructor() {
        this.mainWindow = null;
        this.database = null;
        this.pdfGenerator = null;
    }

    async init() {
        // Initialize database
        this.database = new Database();
        await this.database.init();

        // Initialize PDF generator
        this.pdfGenerator = new PDFGenerator();

        // Set up IPC handlers
        this.setupIPC();

        // Create main window
        this.createMainWindow();

        // Set up menu
        this.createMenu();
    }

    createMainWindow() {
        this.mainWindow = new BrowserWindow({
            width: 1400,
            height: 900,
            minWidth: 1000,
            minHeight: 700,
            icon: path.join(__dirname, 'assets/icon.ico'),
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                preload: path.join(__dirname, 'preload.js'),
                webSecurity: true
            },
            show: false,
            titleBarStyle: 'default'
        });

        this.mainWindow.loadFile('index.html');

        this.mainWindow.once('ready-to-show', () => {
            this.mainWindow.show();
        });

        this.mainWindow.on('closed', () => {
            this.mainWindow = null;
        });

        // Handle external links
        this.mainWindow.webContents.setWindowOpenHandler(({ url }) => {
            shell.openExternal(url);
            return { action: 'deny' };
        });
    }

    createMenu() {
        const template = [
            {
                label: 'File',
                submenu: [
                    {
                        label: 'New Calculator',
                        accelerator: 'CmdOrCtrl+N',
                        click: () => {
                            this.mainWindow.webContents.send('new-calculator');
                        }
                    },
                    {
                        label: 'Export PDF',
                        accelerator: 'CmdOrCtrl+E',
                        click: () => {
                            this.mainWindow.webContents.send('export-pdf');
                        }
                    },
                    { type: 'separator' },
                    {
                        label: 'Print',
                        accelerator: 'CmdOrCtrl+P',
                        click: () => {
                            this.mainWindow.webContents.print();
                        }
                    },
                    { type: 'separator' },
                    {
                        label: 'Exit',
                        accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
                        click: () => {
                            app.quit();
                        }
                    }
                ]
            },
            {
                label: 'Edit',
                submenu: [
                    { role: 'undo' },
                    { role: 'redo' },
                    { type: 'separator' },
                    { role: 'cut' },
                    { role: 'copy' },
                    { role: 'paste' },
                    { role: 'selectall' }
                ]
            },
            {
                label: 'View',
                submenu: [
                    { role: 'reload' },
                    { role: 'forceReload' },
                    { role: 'toggleDevTools' },
                    { type: 'separator' },
                    { role: 'resetZoom' },
                    { role: 'zoomIn' },
                    { role: 'zoomOut' },
                    { type: 'separator' },
                    { role: 'togglefullscreen' }
                ]
            },
            {
                label: 'Calculator',
                submenu: [
                    {
                        label: 'Open Calculator',
                        accelerator: 'CmdOrCtrl+K',
                        click: () => {
                            this.mainWindow.webContents.send('open-calculator');
                        }
                    },
                    {
                        label: 'Clear Calculator',
                        click: () => {
                            this.mainWindow.webContents.send('clear-calculator');
                        }
                    },
                    {
                        label: 'Copy Results',
                        accelerator: 'CmdOrCtrl+Shift+C',
                        click: () => {
                            this.mainWindow.webContents.send('copy-calculator-results');
                        }
                    }
                ]
            },
            {
                label: 'Bookmarks',
                submenu: [
                    {
                        label: 'Manage Bookmarks',
                        accelerator: 'CmdOrCtrl+B',
                        click: () => {
                            this.mainWindow.webContents.send('manage-bookmarks');
                        }
                    }
                ]
            },
            {
                label: 'Help',
                submenu: [
                    {
                        label: 'About',
                        click: () => {
                            dialog.showMessageBox(this.mainWindow, {
                                type: 'info',
                                title: 'About Los Santos Penal Code',
                                message: 'Los Santos Penal Code v1.0.0',
                                detail: 'Desktop application with Fine & Jail Calculator\nBuilt with Electron'
                            });
                        }
                    }
                ]
            }
        ];

        const menu = Menu.buildFromTemplate(template);
        Menu.setApplicationMenu(menu);
    }

    setupIPC() {
        // Database operations
        ipcMain.handle('db-get-articles', async (event, lang = 'en') => {
            return await this.database.getArticles(lang);
        });

        ipcMain.handle('db-search-articles', async (event, query, lang = 'en') => {
            return await this.database.searchArticles(query, lang);
        });

        // Bookmarks
        ipcMain.handle('db-get-bookmarks', async () => {
            return await this.database.getBookmarks();
        });

        ipcMain.handle('db-add-bookmark', async (event, articleId, title, notes = '') => {
            return await this.database.addBookmark(articleId, title, notes);
        });

        ipcMain.handle('db-remove-bookmark', async (event, articleId) => {
            return await this.database.removeBookmark(articleId);
        });

        // Calculator history
        ipcMain.handle('db-save-calculation', async (event, calculationData) => {
            return await this.database.saveCalculation(calculationData);
        });

        ipcMain.handle('db-get-calculations', async () => {
            return await this.database.getCalculations();
        });

        ipcMain.handle('db-delete-calculation', async (event, calculationId) => {
            return await this.database.deleteCalculation(calculationId);
        });

        // PDF Export
        ipcMain.handle('export-pdf', async (event, data, options) => {
            try {
                const result = await dialog.showSaveDialog(this.mainWindow, {
                    defaultPath: `penal-code-${Date.now()}.pdf`,
                    filters: [
                        { name: 'PDF Files', extensions: ['pdf'] }
                    ]
                });

                if (!result.canceled) {
                    await this.pdfGenerator.generatePDF(data, result.filePath, options);
                    return { success: true, path: result.filePath };
                }
                return { success: false, canceled: true };
            } catch (error) {
                console.error('PDF Export Error:', error);
                return { success: false, error: error.message };
            }
        });

        // File operations
        ipcMain.handle('show-save-dialog', async (event, options) => {
            return await dialog.showSaveDialog(this.mainWindow, options);
        });

        ipcMain.handle('show-open-dialog', async (event, options) => {
            return await dialog.showOpenDialog(this.mainWindow, options);
        });

        // Clipboard operations
        ipcMain.handle('copy-to-clipboard', async (event, text) => {
            const { clipboard } = require('electron');
            clipboard.writeText(text);
            return true;
        });

        // Window operations
        ipcMain.handle('minimize-window', () => {
            if (this.mainWindow) this.mainWindow.minimize();
        });

        ipcMain.handle('maximize-window', () => {
            if (this.mainWindow) {
                if (this.mainWindow.isMaximized()) {
                    this.mainWindow.unmaximize();
                } else {
                    this.mainWindow.maximize();
                }
            }
        });

        ipcMain.handle('close-window', () => {
            if (this.mainWindow) this.mainWindow.close();
        });
    }
}

// App event handlers
app.whenReady().then(async () => {
    const penalCodeApp = new PenalCodeApp();
    await penalCodeApp.init();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            penalCodeApp.createMainWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
    contents.on('new-window', (event, navigationUrl) => {
        event.preventDefault();
        shell.openExternal(navigationUrl);
    });
});
