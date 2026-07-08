import { BrowserWindow, screen } from 'electron';
import * as path from 'path';


let cursorWindow: BrowserWindow | null = null;


export function createCursorOverlayWindow(): BrowserWindow {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  cursorWindow = new BrowserWindow({
    width, height, x: 0, y: 0,
    frame: false, transparent: true, alwaysOnTop: true,
    skipTaskbar: true, resizable: false, movable: false,
    focusable: false, hasShadow: false,
    webPreferences: { nodeIntegration: true, contextIsolation: false },
  });
  cursorWindow.setIgnoreMouseEvents(true, { forward: true });
  cursorWindow.loadFile(path.join(__dirname, '../renderer/cursor-overlay.html'));
  return cursorWindow;
}


export function updateCursorState(state: 'idle' | 'pointing', target?: { x: number; y: number }): void {
  cursorWindow?.webContents.send('cursor-state', { state, target });
}


export function destroyCursorWindow(): void {
  cursorWindow?.destroy();
  cursorWindow = null;
}