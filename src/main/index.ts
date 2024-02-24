import { app, shell, BrowserWindow } from 'electron'
import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import setupEventHandlers from './util/ipcHandlers'
import setApplicationMenu from './util/menuTemplate'
import handleFileOpenArgument from './util/fileHandlers'

let mainWindow: BrowserWindow;
let lastOpenedFilePath = '';
let filePathToOpen: any = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    title: 'BetterNotebook',
    width: 1055,
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

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
    // mainWindow.webContents.openDevTools()

    handleFileOpenArgument(mainWindow, filePathToOpen, lastOpenedFilePath)
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })


  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()
  setupEventHandlers(mainWindow, lastOpenedFilePath)
  setApplicationMenu(mainWindow)

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })  
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
