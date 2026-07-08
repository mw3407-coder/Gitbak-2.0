import { screen } from 'electron';

let followInterval: NodeJS.Timeout | null = null;

export function startCursorTracking(callback: (pos: { x: number; y: number }) => void): void {
  if (followInterval) {
    clearInterval(followInterval);
  }

  followInterval = setInterval(() => {
    const pos = screen.getCursorScreenPoint();
    callback({ x: pos.x, y: pos.y });
  }, 16); // ~60fps
}

export function stopCursorTracking(): void {
  if (followInterval) {
    clearInterval(followInterval);
    followInterval = null;
  }
}
