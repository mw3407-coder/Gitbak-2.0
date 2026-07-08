import { app, BrowserWindow, Display, screen } from 'electron';
import path from 'path';
import type { StreamWindowBounds } from '../shared/types';

const isDev = !app.isPackaged && process.env.VITE_DEV_SERVER === '1';

function getPreloadPath(): string {
  return path.join(__dirname, '../preload/index.js');
}

function loadPage(win: BrowserWindow, page: string): void {
  if (isDev) {
    const url = `http://localhost:5173/${page}.html`;
    console.log(`[Flicky] Loading ${page} from dev server: ${url}`);
    win.loadURL(url);
  } else {
    const filePath = path.join(__dirname, '../../renderer', `${page}.html`);
    console.log(`[Flicky] Loading ${page} from file: ${filePath}`);
    win.loadFile(filePath);
  }
}

export function createMainWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: getPreloadPath(),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });
  loadPage(win, 'panel');
  return win;
}

export function createStreamWindow(bounds: StreamWindowBounds): BrowserWindow {
  const win = new BrowserWindow({
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    movable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    hasShadow: false,
    focusable: false,
    type: process.platform === 'linux' ? 'dock' : undefined,
    webPreferences: {
      preload: getPreloadPath(),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });
  loadPage(win, 'stream');
  return win;
}

export function createOverlayWindow(display: Display): BrowserWindow {
  const { x, y, width, height } = display.bounds;

  const win = new BrowserWindow({
    x,
    y,
    width,
    height,
    show: true,
    frame: false,
    resizable: false,
    movable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    skipTaskbar: true,
    transparent: true,
    alwaysOnTop: true,
    hasShadow: false,
    focusable: false,
    type: process.platform === 'linux' ? 'dock' : undefined,
    webPreferences: {
      preload: getPreloadPath(),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  // Click-through: let mouse events pass to windows underneath
  // BUT forward mouse move events so cursor can still track
  win.setIgnoreMouseEvents(true, { forward: true });

  // Keep overlay above everything
  win.setAlwaysOnTop(true, 'screen-saver');
  win.setFullScreenable(false);

  // Linux: ensure overlay stays above all windows including fullscreen apps
  if (process.platform === 'linux') {
    win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    win.setSkipTaskbar(true);
  }

  loadPage(win, 'overlay');

  win.webContents.once('dom-ready', () => {
    win.webContents.send('display-bounds', { x, y, width, height });
  });

  return win;
}
