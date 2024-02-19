import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: unknown
    electronAPI: {
      send: (channel: string, data?: any) => void;
      receive: (channel: string, func: (...args: any[]) => void) => void;
      requestContent: () => Promise<any>;
      saveFile: () => void;
      openFile: () => void;
      onFileOpened: (callback: (event: any, content: string) => void) => void;
      sendContent: (content: string) => void;
    };
  }
}
