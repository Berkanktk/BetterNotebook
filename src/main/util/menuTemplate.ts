import { app, shell, Menu, dialog } from 'electron'

let isWindows = process.platform === 'win32'

function setApplicationMenu(mainWindow) {
    const menuTemplate: any = [
        {
          label: 'File',
          submenu: [
            // {
            //     label: 'New',
            //     accelerator: 'Ctrl+N',
            //     click: () => {
            //         mainWindow.webContents.send('new-file');
            //     }
            // },
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
          label: 'View',
          submenu: [
            { role: 'resetZoom' },
            { role: 'zoomIn' },
            { role: 'zoomOut' },
            { type: 'separator' },
            { role: 'togglefullscreen' }
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
      ]

      Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate))
}

export default setApplicationMenu
