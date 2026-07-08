import { exec } from 'child_process';
import * as path from 'path';

let originalCursorSet = false;

export function setBlueCursor(): void {
  // Do NOT change the system cursor — it blocks clicks on other apps
  // The overlay window renders the custom cursor instead
  console.log('[Cursor] Using overlay-only cursor (system cursor unchanged)');
}

export function resetCursor(): void {
  // Do NOT reset the system cursor — we never changed it
  console.log('[Cursor] Cursor reset (no system cursor change to revert)');
}
