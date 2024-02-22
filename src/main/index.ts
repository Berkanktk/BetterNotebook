import { app, shell, BrowserWindow, Menu, ipcMain, dialog } from 'electron'
import path, { join, basename } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
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
      fs.lstat(filePathToOpen, (err, stats) => {
        if (err) {
          console.error('Failed to stat file:', err);
          return;
        }
    
        if (stats.isDirectory() !== true) {
          const content = fs.readFileSync
          (filePathToOpen, 'utf8');
          mainWindow.webContents.send('file-opened', content);
          lastOpenedFilePath = filePathToOpen;
          const filename = basename(lastOpenedFilePath);
          mainWindow.setTitle(filename + " - BetterNotebook");
        }
      });
    }
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
        // { role: 'zoom' },
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

ipcMain.on('unsaved-changes', () => {
  if (!mainWindow.getTitle().startsWith('*')) {
    mainWindow.setTitle(`*${mainWindow.getTitle()}`);
  }
});

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

ipcMain.on('save-dialog', (_event, content) => {
  const currentTitle = mainWindow.getTitle();

  if (lastOpenedFilePath) {
    fs.writeFileSync(lastOpenedFilePath, content);
    mainWindow.setTitle(currentTitle.replace(/^\*/, ''));
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

ipcMain.on('ping', () => console.log('pong'))

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })  
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
