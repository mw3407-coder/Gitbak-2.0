import re

with open('src/main/companion-manager.ts', 'r') as f:
    content = f.read()

old_block = '''        if (settings.speakReplies && keyStore.getKeyStatus().elevenlabs) {
          try {
            const audioBuffer = await this.tts.synthesize(cleanText, {
              voiceId: settings.voiceId,
              speed: settings.voiceSpeed,
              stability: settings.voiceStability,
            });
            // User may have started a new turn while TTS was synthesizing;
            // don't play an answer they no longer want to hear.
            if (!isCurrent()) return;
            this.setVoiceState('responding');
            this.callbacks.onPlayAudio(audioBuffer);
          } catch (err) {
            console.error('TTS error:', err);
            analytics.trackTtsError(String(err));
          }
        }'''

new_block = '''        if (settings.speakReplies) {
          try {
            let audioBuffer: Buffer;
            const hasElevenLabs = keyStore.getKeyStatus().elevenlabs;

            if (hasElevenLabs && settings.voiceId) {
              // Use ElevenLabs if configured
              audioBuffer = await this.tts.synthesize(cleanText, 'elevenlabs', {
                voiceId: settings.voiceId,
                speed: settings.voiceSpeed,
                stability: settings.voiceStability,
              });
            } else {
              // Use Aria (free, no API key)
              audioBuffer = await this.tts.synthesize(cleanText, 'aria');
            }

            // User may have started a new turn while TTS was synthesizing;
            // don't play an answer they no longer want to hear.
            if (!isCurrent()) return;
            this.setVoiceState('responding');
            this.callbacks.onPlayAudio(audioBuffer);
          } catch (err) {
            console.error('TTS error:', err);
            analytics.trackTtsError(String(err));
          }
        }'''

if old_block in content:
    content = content.replace(old_block, new_block)
    with open('src/main/companion-manager.ts', 'w') as f:
        f.write(content)
    print('✅ Successfully patched companion-manager.ts')
else:
    print('❌ Could not find the old block. File may already be patched or modified.')
