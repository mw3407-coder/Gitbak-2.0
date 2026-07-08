import re

# 1. Fix openai-api.ts
openai_file = 'src/main/services/openai-api.ts'
with open(openai_file, 'r') as f:
    content = f.read()

# Replace the hardcoded URL with a constructor parameter
if 'private baseUrl' not in content:
    content = content.replace(
        'const OPENAI_API_URL = \'https://api.openai.com/v1/chat/completions\';',
        'const OPENAI_API_URL = \'https://api.openai.com/v1/chat/completions\';\nconst NVIDIA_NIM_URL = \'https://integrate.api.nvidia.com/v1/chat/completions\';'
    )
    
    # Add constructor to class
    content = content.replace(
        'export class OpenAIAPI {',
        '''export class OpenAIAPI {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || OPENAI_API_URL;
  }'''
    )
    
    # Replace fetch URL
    content = content.replace(
        'const response = await fetch(OPENAI_API_URL, {',
        'const response = await fetch(this.baseUrl, {'
    )
    
    with open(openai_file, 'w') as f:
        f.write(content)
    print('✅ Fixed openai-api.ts')

# 2. Update companion-manager.ts to use NVIDIA URL
companion_file = 'src/main/companion-manager.ts'
with open(companion_file, 'r') as f:
    content = f.read()

if 'NVIDIA_NIM_URL' not in content:
    # Add import
    content = content.replace(
        "import { OpenAIAPI } from './services/openai-api';",
        "import { OpenAIAPI } from './services/openai-api';\nconst NVIDIA_NIM_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';"
    )
    
    # Replace instantiation
    content = content.replace(
        'this.openai = new OpenAIAPI();',
        'this.openai = new OpenAIAPI(NVIDIA_NIM_URL);'
    )
    
    with open(companion_file, 'w') as f:
        f.write(content)
    print('✅ Updated companion-manager.ts for NVIDIA NIM')
else:
    print('ℹ️ Already updated')

print('\\nDone. Now rebuild with: bun run dev')
