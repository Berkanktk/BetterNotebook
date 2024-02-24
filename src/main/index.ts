import { app, shell, BrowserWindow, dialog  } from 'electron'
import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import setupEventHandlers from './util/ipcHandlers'
import setApplicationMenu from './util/menuTemplate'
import handleFileOpenArgument from './util/fileHandlers'

let window: BrowserWindow;
let filePathToOpen: any = null;
const windowFilePaths = new Map<number, string>();
export const unsavedChanges = new Map<number, boolean>();

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

  setApplicationMenu(window);
  loadWindowContents(window);

  window.on('ready-to-show', () => {
    window.show()
    // mainWindow.webContents.openDevTools()

    handleFileOpenArgument(window, filePathToOpen);
  })

  window.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  unsavedChanges.set(window.id, false);
    
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

  // temporary fix for ipchandling
  newWindow.on('close', (e) => {
    if (newWindow.isDestroyed()) {
      return;
    }

    if (unsavedChanges.get(newWindow.id)) {
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

      dialog.showMessageBox(newWindow, options).then((response) => {
        if (response.response === 0) {
          // save file
          newWindow.webContents.send('save-file');
        } else if (response.response === 1) {
          // don't save
          newWindow.destroy(); 
        }
        // Cancel
      });
    }
  });

  windowFilePaths.set(newWindow.id, '');
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // Create the main window
  setupEventHandlers(windowFilePaths);
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
