import { BrowserWindow, Display } from 'electron';
import * as path from 'path';

let cursorWindow: BrowserWindow | null = null;

function getPreloadPath(): string {
  return path.join(__dirname, '../preload/index.js');
}

export function createCursorOverlayWindow(display: Display): BrowserWindow {
  const { x, y, width, height } = display.bounds;

  cursorWindow = new BrowserWindow({
    x, y, width, height,
    frame: false, transparent: true, alwaysOnTop: true,
    skipTaskbar: true, resizable: false, movable: false,
    focusable: false, hasShadow: false,
    type: process.platform === 'linux' ? 'dock' : undefined,
    webPreferences: {
      preload: getPreloadPath(),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  cursorWindow.setIgnoreMouseEvents(true, { forward: true });
  cursorWindow.setAlwaysOnTop(true, 'screen-saver');
  cursorWindow.setFullScreenable(false);

  if (process.platform === 'linux') {
    cursorWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    cursorWindow.setSkipTaskbar(true);
  }

  const isDev = process.env.VITE_DEV_SERVER === '1';
  if (isDev) {
    cursorWindow.loadURL('http://localhost:5173/overlay.html');
  } else {
    cursorWindow.loadFile(path.join(__dirname, '../../renderer/overlay.html'));
  }

  return cursorWindow;
}

export function updateCursorState(state: 'idle' | 'pointing', target?: { x: number; y: number }): void {
  cursorWindow?.webContents.send('cursor-state', { state, target });
}

export function destroyCursorWindow(): void {
  cursorWindow?.destroy();
  cursorWindow = null;
}
