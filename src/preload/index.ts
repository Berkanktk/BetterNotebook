import { contextBridge, ipcRenderer  } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('electronAPI', {
      saveFile: () => ipcRenderer.send('request-save-file'),
      openFile: () => ipcRenderer.send('request-open-file'),
      onFileOpened: (callback) => ipcRenderer.on('file-opened', callback),
      sendContent: (content) => ipcRenderer.send('send-content', content),
    });
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
