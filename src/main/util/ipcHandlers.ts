import { app, ipcMain, dialog } from 'electron'
import path, { basename } from 'path';
import fs from 'fs'
import { BrowserWindow } from 'electron/main';


export default function setupEventHandlers(windowFilePaths) {
    ipcMain.on('find', (event, searchTerm) => {
      const currentWindow = BrowserWindow.fromWebContents(event.sender);
      currentWindow?.webContents.findInPage(searchTerm, { matchCase: true });
    });
    
    ipcMain.on('clear-find', (event) => {
      const currentWindow = BrowserWindow.fromWebContents(event.sender);
      currentWindow?.webContents.stopFindInPage('clearSelection');
    });
    
    ipcMain.on('unsaved-changes', (event) => {
      const currentWindow = BrowserWindow.fromWebContents(event.sender);
      if (currentWindow && !currentWindow.getTitle().startsWith('*')) {
        currentWindow.setTitle(`*${currentWindow.getTitle()}`);
      }
    });
    
    ipcMain.on('open-dialog', (event) => {
      const currentWindow = BrowserWindow.fromWebContents(event.sender);
      if (!currentWindow) return;
  
      dialog.showOpenDialog(currentWindow, {
        title: 'Open text file',
        properties: ['openFile'],
        filters: [{ name: 'Text Files', extensions: ['txt'] }]
      }).then(result => {
        if (!result.canceled) {
          const content = fs.readFileSync(result.filePaths[0], 'utf8');
          currentWindow.webContents.send('file-opened', content);
          windowFilePaths.set(currentWindow.id, result.filePaths[0]);
          const filename = basename(result.filePaths[0]);
          currentWindow.setTitle(filename + " - BetterNotebook");
        }
      }).catch(err => {
        console.error(err);
      });
    });
    
    ipcMain.on('save-dialog', (event, content) => {
      const currentWindow = BrowserWindow.fromWebContents(event.sender);
      if (!currentWindow) return;
  
      const currentTitle = currentWindow.getTitle();
      const lastOpenedFilePath = windowFilePaths.get(currentWindow.id);
  
      if (lastOpenedFilePath) {
        fs.writeFileSync(lastOpenedFilePath, content);
        currentWindow.setTitle(currentTitle.replace(/^\*/, ''));
      } else {
        dialog.showSaveDialog(currentWindow, {
          title: 'Save text file',
          defaultPath: path.join(app.getPath('desktop'), 'untitled.txt'),
          filters: [{ name: 'Text Files', extensions: ['txt'] }]
        }).then(result => {
          if (!result.canceled && result.filePath) {
            fs.writeFileSync(result.filePath, content);
            windowFilePaths.set(currentWindow.id, result.filePath);
            const filename = basename(result.filePath);
            currentWindow.setTitle(filename + " - BetterNotebook");
          }
        }).catch(err => {
          console.error(err);
        });
      }
    });

    // ipcMain.on('close-window', (event) => {
    //   const currentWindow = BrowserWindow.fromWebContents(event.sender);

    //   if (!currentWindow) return;
  
    //   const options: any = {
    //     type: 'question',
    //     buttons: ['Save', 'Don\'t Save', 'Cancel'],
    //     defaultId: 0,
    //     cancelId: 2,
    //     title: 'Confirm',
    //     message: 'You have unsaved changes. Do you want to save them before closing?',
    //     noLink: true,
    //   };

    //   dialog.showMessageBox(currentWindow, options).then((response) => {
    //     if (response.response === 0) {
    //       // Save file
    //       currentWindow.webContents.send('save-file');
    //     } else if (response.response === 1) {
    //       // Don't save
    //       currentWindow.destroy();
    //     }
    //     // If the user selects 'Cancel', do nothing
    //   }).catch(err => {
    //     console.error('Error displaying message box:', err);
    //   });
    // });
    
    ipcMain.on('ping', () => console.log('pong'))

  }
