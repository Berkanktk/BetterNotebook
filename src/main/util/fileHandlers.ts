import path from 'path';
import fs from 'fs'

function handleFileOpenArgument(mainWindow, filePathToOpen) {
    if (process.argv.length >= 2) {
        filePathToOpen = process.argv[1];
        fs.lstat(filePathToOpen, (err, stats) => {
            if (!err && !stats.isDirectory()) {
                fs.readFile(filePathToOpen, 'utf8', (readErr, content) => {
                    if (!readErr) {
                        mainWindow.webContents.send('file-opened', content);
                        mainWindow.setTitle(`${path.basename(filePathToOpen)} - BetterNotebook`);
                    }
                });
            }
        });
    }
}

export default handleFileOpenArgument;