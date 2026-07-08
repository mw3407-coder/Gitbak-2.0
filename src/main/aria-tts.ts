import { EdgeTTS } from 'edge-tts-universal';

const ARIA_VOICE = 'en-US-AriaNeural';

export async function speakWithAria(text: string): Promise<Buffer> {
    const tts = new EdgeTTS(text, ARIA_VOICE);
    const result = await tts.synthesize();
    const arrayBuffer = await result.audio.arrayBuffer();
    return Buffer.from(arrayBuffer);
}
