import { ElevenLabsTTS, TtsOptions } from './elevenlabs-tts';
import { AriaTTS } from './aria-tts';

export type TtsProvider = 'aria' | 'elevenlabs';

export class TTSManager {
  private aria = new AriaTTS();
  private elevenlabs = new ElevenLabsTTS();

  async synthesize(text: string, provider: TtsProvider = 'aria', options?: TtsOptions): Promise<Buffer> {
    if (provider === 'elevenlabs') {
      if (!options?.voiceId) {
        throw new Error('ElevenLabs requires a voiceId');
      }
      return this.elevenlabs.synthesize(text, options);
    }
    return this.aria.synthesize(text);
  }
}
