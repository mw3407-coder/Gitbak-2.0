const { EdgeTTS } = require('edge-tts-universal');
const fs = require('fs');

async function test() {
    console.log('Generating Aria voice...');
    const tts = new EdgeTTS('Hello, I am Aria. Welcome to DAP.', 'en-US-AriaNeural');
    const result = await tts.synthesize();
    
    // Convert Blob to Buffer
    const arrayBuffer = await result.audio.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    fs.writeFileSync('aria-test.mp3', buffer);
    console.log('Saved to aria-test.mp3');
}

test().catch(console.error);
