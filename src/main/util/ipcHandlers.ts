import { app, ipcMain, dialog } from 'electron'
import path, { basename } from 'path';
import fs from 'fs'


function setupEventHandlers(mainWindow, lastOpenedFilePath) {
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

    mainWindow.on('close', (e) => {
      if (mainWindow.getTitle().startsWith('*')) {
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

          dialog.showMessageBox(mainWindow, options).then((response) => {
              if (response.response === 0) {
                  // Save file
                  mainWindow.webContents.send('save-file');
                } else if (response.response === 1) {
                  // Don't save
                  mainWindow.destroy();
              }

              // Cancel
          });
      }
  });
    
    ipcMain.on('ping', () => console.log('pong'))

  }

export default setupEventHandlers;