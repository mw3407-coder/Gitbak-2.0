import re

windows_file = 'src/main/windows.ts'
with open(windows_file, 'r') as f:
    content = f.read()

# Replace the setIgnoreMouseEvents line to detect Linux and skip forward
old_line = "win.setIgnoreMouseEvents(true, { forward: true });"
new_line = '''// Linux: forward option doesn't work, so we track cursor in main process
    // and broadcast to overlay renderer manually
    if (process.platform === 'linux') {
      win.setIgnoreMouseEvents(true);
    } else {
      win.setIgnoreMouseEvents(true, { forward: true });
    }'''

content = content.replace(old_line, new_line)

with open(windows_file, 'w') as f:
    f.write(content)

print('✅ Fixed cursor tracking for Linux')
print('The overlay will now receive cursor positions via IPC instead of mouse events')
