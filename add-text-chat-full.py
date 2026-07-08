import re

# 1. Add IPC handler in main/index.ts
main_file = 'src/main/index.ts'
with open(main_file, 'r') as f:
    content = f.read()

if 'SEND_TEXT_MESSAGE' not in content:
    # Add handler after CLEAR_CHAT_HISTORY handler
    content = content.replace(
        "ipcMain.on(IPC.CLEAR_CHAT_HISTORY, () => companion.clearChatHistory());",
        "ipcMain.on(IPC.CLEAR_CHAT_HISTORY, () => companion.clearChatHistory());\n  ipcMain.on(IPC.SEND_TEXT_MESSAGE, (_e, text: string) => { void companion.handleTextMessage(text); });"
    )
    with open(main_file, 'w') as f:
        f.write(content)
    print('✅ Added SEND_TEXT_MESSAGE handler in main/index.ts')
else:
    print('ℹ️ Handler already exists')

# 2. Add handleTextMessage method to companion-manager.ts
# This is the hard part - we need to extract the AI processing logic from stopRecordingAndProcess

companion_file = 'src/main/companion-manager.ts'
with open(companion_file, 'r') as f:
    content = f.read()

if 'handleTextMessage' not in content:
    # Find the end of stopRecordingAndProcess and add handleTextMessage after it
    # Look for the closing brace of stopRecordingAndProcess followed by handleAudioChunk
    
    # Actually, let's add it before handleAudioChunk
    content = content.replace(
        'handleAudioChunk(buffer: Buffer): void {',
        '''handleTextMessage(text: string): Promise<void> {
    // Bypass voice/STT - go straight to AI processing
    this.turnId += 1;
    if (this.currentAbort) {
      this.currentAbort.abort();
      this.currentAbort = null;
    }

    const myTurnId = this.turnId;
    const abort = new AbortController();
    this.currentAbort = abort;
    const isCurrent = () => this.turnId === myTurnId;

    this.setVoiceState('processing');
    
    try {
      this.lastScreenshots = await captureAllDisplays();
    } catch (err) {
      console.error('Screen capture failed:', err);
      this.lastScreenshots = [];
    }

    const result = { text: text.trim(), isFinal: true };
    this.callbacks.onTranscriptUpdate(result);
    
    const settings = settingsStore.getAll();
    
    const mindCallbacks = {
      onChunk: (chunk: string) => {
        if (!isCurrent()) return;
        this.callbacks.onAiResponseChunk(chunk);
      },
      onComplete: async (
        fullText: string,
        usage?: { inputTokens: number; outputTokens: number },
      ) => {
        if (!isCurrent()) return;
        
        const cleanText = fullText.replace(/\\[POINT:[^\\]]+\\]/g, '').trim();
        this.callbacks.onAiResponseComplete(cleanText);

        await this.context.recordExchange(result.text, cleanText, {
          inputTokens: usage?.inputTokens,
          outputTokens: usage?.outputTokens,
        });
        if (!isCurrent()) return;
        this.emitMemoryStats();

        const entry = chatHistory.append({
          userText: result.text,
          assistantText: cleanText,
        });
        this.callbacks.onChatEntryAdded(entry);

        const element = parsePointTags(fullText, this.lastScreenshots);
        if (element) {
          this.callbacks.onElementDetected(element);
          analytics.trackElementPointed(element.label);
        }

        if (settings.speakReplies) {
          try {
            let audioBuffer: Buffer;
            const hasElevenLabs = keyStore.getKeyStatus().elevenlabs;
            
            if (hasElevenLabs && settings.voiceId) {
              audioBuffer = await this.tts.synthesize(cleanText, 'elevenlabs', {
                voiceId: settings.voiceId,
                speed: settings.voiceSpeed,
                stability: settings.voiceStability,
              });
            } else {
              audioBuffer = await this.tts.synthesize(cleanText, 'aria');
            }
            
            if (!isCurrent()) return;
            this.setVoiceState('responding');
            this.callbacks.onPlayAudio(audioBuffer);
          } catch (err) {
            console.error('TTS error:', err);
            analytics.trackTtsError(String(err));
          }
        }

        if (!isCurrent()) return;
        this.setVoiceState('idle');
        setTimeout(() => {
          if (isCurrent()) this.callbacks.onElementDetected(null);
        }, 6000);
      },
      onError: (err: Error) => {
        if (!isCurrent()) return;
        console.error('Mind provider error:', err);
        analytics.trackResponseError(err.message);
        this.setVoiceState('idle');
      },
    };

    const mindOptions = {
      reasoningDepth: settings.reasoningDepth,
      replyTone: settings.replyTone,
      signal: abort.signal,
    };

    if (settings.mindProvider === 'openai') {
      await this.openai.streamChat(
        result.text,
        this.lastScreenshots,
        this.context.getMessagesForSend(),
        settings.selectedOpenAIModel,
        mindOptions,
        mindCallbacks,
      );
    } else if (settings.mindProvider === 'ollama') {
      const connections = (settings.localConnections ?? []).filter((c) => c.enabled);
      const conn = connections[0];
      if (!conn) {
        mindCallbacks.onError(new Error('No enabled local connection. Add one in Mind → Local.'));
        return;
      }
      const bearerToken = keyStore.getApiKey(`local_${conn.id}`) ?? undefined;
      let model: string;
      if (conn.activeModelId) {
        model = conn.activeModelId;
      } else if (conn.modelIds.length > 0) {
        model = conn.modelIds[0];
      } else {
        const discovered = await this.ollama.getModels(conn.url, bearerToken);
        model = discovered[0] ?? 'llama3';
      }
      const fullModelId = conn.prefixId ? `${conn.prefixId}${model}` : model;
      await this.ollama.streamChat(
        result.text,
        this.lastScreenshots,
        this.context.getMessagesForSend(),
        fullModelId,
        { replyTone: mindOptions.replyTone, signal: mindOptions.signal },
        mindCallbacks,
        conn.url,
        bearerToken,
      );
    } else {
      await this.claude.streamChat(
        result.text,
        this.lastScreenshots,
        this.context.getMessagesForSend(),
        settings.selectedModel,
        mindOptions,
        mindCallbacks,
      );
    }

    if (this.currentAbort === abort) this.currentAbort = null;
  }

  handleAudioChunk(buffer: Buffer): void {'''
    )
    with open(companion_file, 'w') as f:
        f.write(content)
    print('✅ Added handleTextMessage to companion-manager.ts')
else:
    print('ℹ️ handleTextMessage already exists')

# 3. Add text input to ChatsTab.tsx
chats_file = 'src/renderer/components/panel/ChatsTab.tsx'
with open(chats_file, 'r') as f:
    content = f.read()

if 'textInput' not in content and 'sendTextMessage' not in content:
    # Add state for text input
    content = content.replace(
        'const [streamingAssistant, setStreamingAssistant] = useState(\'\');',
        'const [streamingAssistant, setStreamingAssistant] = useState(\'\');\n  const [textInput, setTextInput] = useState(\'\');'
    )
    
    # Add send handler
    content = content.replace(
        'const clearAll = () => {',
        '''const handleSend = () => {
    if (!textInput.trim()) return;
    window.flicky.sendTextMessage(textInput.trim());
    setTextInput('');
  };

  const clearAll = () => {'''
    )
    
    # Add text input bar at the end of chat-log, before closing </>
    content = content.replace(
        '      </div>\n    </>\n  );\n}',
        '''      </div>

      <div className="chat-input-bar">
        <input
          type="text"
          className="chat-text-input"
          placeholder="Type your message..."
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button className="chat-send-btn" onClick={handleSend}>
          Send
        </button>
      </div>
    </>\n  );\n}'''
    )
    with open(chats_file, 'w') as f:
        f.write(content)
    print('✅ Added text input to ChatsTab.tsx')
else:
    print('ℹ️ Text input already exists')

print('\\n🎉 Done! Now rebuild with: bun run dev (then bun run start in another terminal)')
