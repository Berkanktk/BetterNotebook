import { app, shell, BrowserWindow, dialog  } from 'electron'
import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import setupEventHandlers from './util/ipcHandlers'
import setApplicationMenu from './util/menuTemplate'
import handleFileOpenArgument from './util/fileHandlers'

let window: BrowserWindow;
let filePathToOpen: any = null;
const windowFilePaths = new Map<number, string>();

function createWindow(): BrowserWindow {
  window = new BrowserWindow({
    title: 'BetterNotebook',
    width: 1100,
    height: 670,
    minWidth: 400,
    minHeight: 400,
    show: false,
    autoHideMenuBar: false,
    icon: 'icon.ico',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  setupEventHandlers(windowFilePaths);
  setApplicationMenu(window);

  window.on('ready-to-show', () => {
    window.show()
    // mainWindow.webContents.openDevTools()

    handleFileOpenArgument(window, filePathToOpen);
  })

  window.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  loadWindowContents(window);

  // temporary fix for ipchandling
  window.on('close', (e) => {
    if (window.isDestroyed()) {
      return;
    }

    if (window.getTitle().startsWith('*')) {
      e.preventDefault(); 

      const options: Electron.MessageBoxOptions = {
        type: 'question',
        buttons: ['Save', 'Don\'t Save', 'Cancel'],
        defaultId: 0,
        cancelId: 2,
        title: 'Confirm',
        message: 'You have unsaved changes. Do you want to save them before closing?',
        noLink: true,
    };

      dialog.showMessageBox(window, options).then((response) => {
        if (response.response === 0) {
          // save file
          window.webContents.send('save-file');
        } else if (response.response === 1) {
          // don't save
          window.destroy(); 
        }
        // Cancel
      });
    }
  });
    
  return window;
}

function loadWindowContents(window: BrowserWindow) {
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    window.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    window.loadFile(join(__dirname, '../renderer/index.html'));
  }
}

export function createNewNoteWindow(): void {
  const newWindow = createWindow();

  windowFilePaths.set(newWindow.id, '');
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // Create the main window
  createNewNoteWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createNewNoteWindow()
  })  
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
