import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SAMPLE_RATE = 44100;
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'sounds');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function createWavBuffer(leftChannel, rightChannel) {
  const numSamples = leftChannel.length;
  const dataSize = numSamples * 4; // 2 channels * 2 bytes (16-bit)
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF identifier
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // fmt sub-chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // SubChunk1Size (16 for PCM)
  buffer.writeUInt16LE(1, 20); // AudioFormat (1 = PCM)
  buffer.writeUInt16LE(2, 22); // NumChannels (2 = Stereo)
  buffer.writeUInt32LE(SAMPLE_RATE, 24); // SampleRate
  buffer.writeUInt32LE(SAMPLE_RATE * 4, 28); // ByteRate (SampleRate * NumChannels * BitsPerSample/8)
  buffer.writeUInt16LE(4, 32); // BlockAlign (NumChannels * BitsPerSample/8)
  buffer.writeUInt16LE(16, 34); // BitsPerSample (16 bits)

  // data sub-chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  // Write PCM audio data
  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    const l = Math.max(-1, Math.min(1, leftChannel[i]));
    const r = Math.max(-1, Math.min(1, rightChannel[i]));
    buffer.writeInt16LE(Math.floor(l < 0 ? l * 32768 : l * 32767), offset);
    offset += 2;
    buffer.writeInt16LE(Math.floor(r < 0 ? r * 32768 : r * 32767), offset);
    offset += 2;
  }

  return buffer;
}

// 1. CLICK SOUND (Crisp modern wooden tactile click)
function generateClick() {
  const duration = 0.06;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const left = new Float32Array(numSamples);
  const right = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    // Rapid pitch drop from 1200Hz to 160Hz
    const freq = 1200 * Math.exp(-t * 80) + 160;
    const phase = 2 * Math.PI * freq * t;
    // Exponential transient envelope
    const env = Math.exp(-t * 65);
    const wave = (Math.sin(phase) + 0.3 * Math.sin(phase * 2.1)) * env * 0.7;

    left[i] = wave;
    right[i] = wave * 0.95;
  }
  return createWavBuffer(left, right);
}

// 2. HOVER SOUND (Delicate ethereal bubble blip)
function generateHover() {
  const duration = 0.045;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const left = new Float32Array(numSamples);
  const right = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const freq = 1450 + 200 * Math.sin(2 * Math.PI * 18 * t);
    const env = Math.sin((t / duration) * Math.PI) * Math.exp(-t * 30);
    const wave = Math.sin(2 * Math.PI * freq * t) * env * 0.35;

    left[i] = wave * 0.9;
    right[i] = wave * 1.1;
  }
  return createWavBuffer(left, right);
}

// 3. SUCCESS SOUND (Lush, uplifting polyphonic celebration chime with acoustic harmonics)
function generateSuccess() {
  const duration = 1.6;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const left = new Float32Array(numSamples);
  const right = new Float32Array(numSamples);

  // Chord notes: C5, E5, G5, B5, C6 with start offsets
  const notes = [
    { freq: 523.25, start: 0.0, dur: 1.2, pan: -0.3, gain: 0.35 },
    { freq: 659.25, start: 0.1, dur: 1.2, pan: 0.2, gain: 0.38 },
    { freq: 783.99, start: 0.2, dur: 1.3, pan: -0.15, gain: 0.4 },
    { freq: 987.77, start: 0.32, dur: 1.2, pan: 0.25, gain: 0.35 },
    { freq: 1046.50, start: 0.44, dur: 1.1, pan: 0.0, gain: 0.45 },
  ];

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    let lSample = 0;
    let rSample = 0;

    for (const n of notes) {
      if (t >= n.start && t < n.start + n.dur) {
        const nt = t - n.start;
        // Bell-like strike envelope
        const env = Math.exp(-nt * 3.5);
        // Rich harmonics (fundamental + 2nd + 3rd harmonic bell overtone)
        const fundamental = Math.sin(2 * Math.PI * n.freq * nt);
        const h2 = 0.35 * Math.sin(2 * Math.PI * n.freq * 2.01 * nt) * Math.exp(-nt * 5.0);
        const h3 = 0.15 * Math.sin(2 * Math.PI * n.freq * 3.0 * nt) * Math.exp(-nt * 7.0);
        const voice = (fundamental + h2 + h3) * env * n.gain;

        // Stereo panning
        const leftGain = 0.5 * (1 - n.pan);
        const rightGain = 0.5 * (1 + n.pan);

        lSample += voice * leftGain;
        rSample += voice * rightGain;
      }
    }

    left[i] = lSample * 0.7;
    right[i] = rSample * 0.7;
  }
  return createWavBuffer(left, right);
}

// 4. NOTIFICATION / CHATBOT SOUND (Gentle modern 2-tone melodic chime)
function generateNotification() {
  const duration = 0.65;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const left = new Float32Array(numSamples);
  const right = new Float32Array(numSamples);

  const notes = [
    { freq: 739.99, start: 0.0, dur: 0.45, gain: 0.4 }, // F#5
    { freq: 987.77, start: 0.12, dur: 0.5, gain: 0.45 }, // B5
  ];

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    let lSample = 0;
    let rSample = 0;

    for (const n of notes) {
      if (t >= n.start && t < n.start + n.dur) {
        const nt = t - n.start;
        const env = Math.exp(-nt * 5.5);
        const voice = (Math.sin(2 * Math.PI * n.freq * nt) + 0.25 * Math.sin(2 * Math.PI * n.freq * 2 * nt)) * env * n.gain;
        lSample += voice * 0.85;
        rSample += voice * 1.0;
      }
    }
    left[i] = lSample * 0.7;
    right[i] = rSample * 0.7;
  }
  return createWavBuffer(left, right);
}

// 5. AMBIENT BACKGROUND CIVIC MUSIC TRACK (Loopable, soothing 16-second calm acoustic/warm pad progression)
function generateAmbientTheme() {
  const duration = 16.0; // 16 second seamless calming loop
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const left = new Float32Array(numSamples);
  const right = new Float32Array(numSamples);

  // 4 calming civic chords (4 seconds each):
  // 1. C Major 9: C4 (261.63), E4 (329.63), G4 (392.00), B4 (493.88), D5 (587.33)
  // 2. A minor 7: A3 (220.00), C4 (261.63), E4 (329.63), G4 (392.00)
  // 3. F Major 7: F3 (174.61), A3 (220.00), C4 (261.63), E4 (329.63)
  // 4. G suspended: G3 (196.00), C4 (261.63), D4 (293.66), G4 (392.00)
  const chordProgression = [
    { start: 0, freqs: [261.63, 329.63, 392.00, 493.88, 587.33] },
    { start: 4, freqs: [220.00, 261.63, 329.63, 392.00, 523.25] },
    { start: 8, freqs: [174.61, 220.00, 261.63, 329.63, 440.00] },
    { start: 12, freqs: [196.00, 261.63, 293.66, 392.00, 493.88] },
  ];

  // Gentle melody notes (music box / marimba chime)
  const melodyNotes = [
    { time: 0.5, freq: 587.33, dur: 1.8, pan: -0.2 },
    { time: 1.8, freq: 659.25, dur: 1.6, pan: 0.2 },
    { time: 3.0, freq: 783.99, dur: 1.8, pan: 0.0 },
    { time: 4.5, freq: 659.25, dur: 1.8, pan: -0.25 },
    { time: 6.0, freq: 523.25, dur: 1.8, pan: 0.2 },
    { time: 8.5, freq: 440.00, dur: 2.0, pan: -0.15 },
    { time: 10.0, freq: 523.25, dur: 1.8, pan: 0.25 },
    { time: 12.5, freq: 587.33, dur: 1.8, pan: 0.1 },
    { time: 14.0, freq: 493.88, dur: 2.0, pan: -0.1 },
  ];

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    let lSample = 0;
    let rSample = 0;

    // 1. Warm lush background pad
    for (const chord of chordProgression) {
      const ct = t - chord.start;
      if (ct >= -0.5 && ct < 4.8) {
        // Soft envelope with gentle cross-fade
        let env = 0;
        if (ct >= 0 && ct <= 0.8) env = ct / 0.8;
        else if (ct > 0.8 && ct <= 3.4) env = 1.0;
        else if (ct > 3.4 && ct <= 4.2) env = 1.0 - (ct - 3.4) / 0.8;

        for (let fi = 0; fi < chord.freqs.length; fi++) {
          const f = chord.freqs[fi];
          // Gentle chorus detune
          const waveL = Math.sin(2 * Math.PI * f * t) + 0.4 * Math.sin(2 * Math.PI * (f * 1.002) * t);
          const waveR = Math.sin(2 * Math.PI * (f * 0.998) * t) + 0.4 * Math.sin(2 * Math.PI * (f * 1.001) * t);
          const voiceL = waveL * env * 0.045;
          const voiceR = waveR * env * 0.045;

          lSample += voiceL;
          rSample += voiceR;
        }
      }
    }

    // 2. Sparkling melody notes
    for (const m of melodyNotes) {
      if (t >= m.time && t < m.time + m.dur) {
        const mt = t - m.time;
        const env = Math.exp(-mt * 2.8);
        const bell = (Math.sin(2 * Math.PI * m.freq * mt) + 0.25 * Math.sin(2 * Math.PI * m.freq * 2.01 * mt) * Math.exp(-mt * 4.5)) * env * 0.14;

        const leftGain = 0.5 * (1 - m.pan);
        const rightGain = 0.5 * (1 + m.pan);
        lSample += bell * leftGain;
        rSample += bell * rightGain;
      }
    }

    left[i] = Math.max(-0.95, Math.min(0.95, lSample));
    right[i] = Math.max(-0.95, Math.min(0.95, rSample));
  }

  return createWavBuffer(left, right);
}

// Generate all audio assets
console.log('Generating audio assets in', OUTPUT_DIR);

fs.writeFileSync(path.join(OUTPUT_DIR, 'click.wav'), generateClick());
console.log('✓ Created click.wav');

fs.writeFileSync(path.join(OUTPUT_DIR, 'hover.wav'), generateHover());
console.log('✓ Created hover.wav');

fs.writeFileSync(path.join(OUTPUT_DIR, 'success.wav'), generateSuccess());
console.log('✓ Created success.wav');

fs.writeFileSync(path.join(OUTPUT_DIR, 'notification.wav'), generateNotification());
console.log('✓ Created notification.wav');

fs.writeFileSync(path.join(OUTPUT_DIR, 'ambient.wav'), generateAmbientTheme());
console.log('✓ Created ambient.wav');

console.log('All audio assets successfully generated!');
