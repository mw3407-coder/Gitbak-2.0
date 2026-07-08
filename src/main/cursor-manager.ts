import { exec } from 'child_process';


export function setBlueCursor(): void {
  // Do NOT change the system cursor — the overlay renders the custom cursor
  console.log('[Cursor] Overlay cursor active');
}


export function resetCursor(): void {
  // Do NOT reset the system cursor — we never changed it
  console.log('[Cursor] Overlay cursor reset');
}
