import os

# 1. Add SEND_TEXT_MESSAGE to IPC types
types_file = 'src/shared/types.ts'
with open(types_file, 'r') as f:
    content = f.read()

# Find the IPC enum and add SEND_TEXT_MESSAGE
if 'SEND_TEXT_MESSAGE' not in content:
    content = content.replace(
        'export enum IPC {',
        'export enum IPC {\n  SEND_TEXT_MESSAGE = \'send-text-message\','
    )
    with open(types_file, 'w') as f:
        f.write(content)
    print('✅ Added SEND_TEXT_MESSAGE to IPC enum')
else:
    print('ℹ️ SEND_TEXT_MESSAGE already exists')

# 2. Add sendTextMessage to preload API
preload_file = 'src/preload/index.ts'
with open(preload_file, 'r') as f:
    content = f.read()

if 'sendTextMessage' not in content:
    # Add after getApiKeyStatus
    content = content.replace(
        'getApiKeyStatus: (): Promise<Record<ApiKeyName, boolean>> =>\n    ipcRenderer.invoke(IPC.GET_API_KEY_STATUS),',
        'getApiKeyStatus: (): Promise<Record<ApiKeyName, boolean>> =>\n    ipcRenderer.invoke(IPC.GET_API_KEY_STATUS),\n\n  sendTextMessage: (text: string): void => ipcRenderer.send(IPC.SEND_TEXT_MESSAGE, text),'
    )
    with open(preload_file, 'w') as f:
        f.write(content)
    print('✅ Added sendTextMessage to preload API')
else:
    print('ℹ️ sendTextMessage already exists')

print('\\nDone. Now you need to:')
print('1. Add handler in src/main/index.ts for IPC.SEND_TEXT_MESSAGE')
print('2. Add handleTextMessage method in CompanionManager')
print('3. Add text input to ChatsTab.tsx')
