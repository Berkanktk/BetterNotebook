import { app, shell, BrowserWindow, Menu, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { basename } from 'path'
import path from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import fs from 'fs'

let isWindows = process.platform === 'win32'
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
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
    // mainWindow.webContents.openDevTools()

    if (process.argv.length >= 2) {
      filePathToOpen = process.argv[1];
    } else {
      filePathToOpen = null;
    }

    if (filePathToOpen) {
      fs.readFile(filePathToOpen, 'utf8', (err, content) => {
        if (err) {
          console.error('Failed to read file:', err);
          return;
        }
        mainWindow.webContents.send('file-opened', content);
        const filename = path.basename(filePathToOpen);
        mainWindow.setTitle(`${filename} - BetterNotebook`);
        filePathToOpen = null;
      });
    }
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  const menu = Menu.buildFromTemplate([
    {
      label: 'File',
      submenu: [
        {
          label: 'Save',
          accelerator: 'Ctrl+S',
          click: () => {
            mainWindow.webContents.send('save-file');
          }
        },
        {
          label: 'Open',
          accelerator: 'Ctrl+O',
          click: () => {
            mainWindow.webContents.send('open-file');
          }
        },
        {
          label: isWindows ? 'Exit' : 'Quit',
          accelerator: isWindows ? 'Alt+F4' : 'CmdOrCtrl+Q',
          click: () => app.quit()
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
        { role: 'delete' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        { role: 'close' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Learn More',
          click: async () => {
            const { response } = await dialog.showMessageBox({
              type: 'info',
              buttons: ['OK', 'Learn More'],
              title: 'Learn More',
              message: 'See features and more on the GitHub page.'
            })
            if (response === 1) {
              await shell.openExternal('https://github.com/Berkanktk/BetterNotebook')
            }
          }
        },
        {
          label: 'About',
          click: async () => {
            await dialog.showMessageBox({
              type: 'info',
              buttons: ['OK'],
              title: 'About',
              message: 'An improved notebook experience made using Electron, Svelte and TypeScript.\n\nApp Version: ' + app.getVersion() + '\nElectron Version: ' + process.versions.electron + '\nNode.js Version: ' + process.versions.node + '\nChrome Version: ' + process.versions.chrome
            })
          }
        },
        {
          label: 'Report Issue',
          click: async () => {
            await shell.openExternal('https://github.com/Berkanktk/BetterNotebook/issues')
          }
        }
      ]
    }
  ])

  Menu.setApplicationMenu(menu)

}

ipcMain.on('find', (_event, searchTerm) => {
  mainWindow.webContents.findInPage(searchTerm, { matchCase: true}); 
});

ipcMain.on('clear-find', () => {
  mainWindow.webContents.stopFindInPage('clearSelection');
});

// When opening a file, store its path
ipcMain.on('open-dialog', (_event) => {
  dialog.showOpenDialog(mainWindow, {
    title: 'Open text file',
    properties: ['openFile'],
    filters: [{ name: 'Text Files', extensions: ['txt'] }]
  }).then(result => {
    if (!result.canceled) {
      const content = fs.readFileSync(result.filePaths[0], 'utf8');
      mainWindow.webContents.send('file-opened', content);
      lastOpenedFilePath = result.filePaths[0];
      const filename = basename(lastOpenedFilePath);
      mainWindow.setTitle(filename + " - BetterNotebook");
    }
  }).catch(err => {
    console.log(err);
  });
});

// Modify the save-dialog handler
ipcMain.on('save-dialog', (_event, content) => {
  if (lastOpenedFilePath) {
    fs.writeFileSync(lastOpenedFilePath, content);
  } else {
    // Show save dialog if there is no file path
    dialog.showSaveDialog(mainWindow, {
      title: 'Save text file',
      defaultPath: path.join(app.getPath('desktop'), 'untitled.txt'),
      filters: [{ name: 'Text Files', extensions: ['txt'] }]
    }).then(result => {
      if (!result.canceled && result.filePath) {
        fs.writeFileSync(result.filePath, content);
        lastOpenedFilePath = result.filePath;
        const filename = basename(lastOpenedFilePath);
        mainWindow.setTitle(filename + " - BetterNotebook");
      }
    }).catch(err => {
      console.log(err);
    });
  }
});


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })  
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
