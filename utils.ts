/**
 * Decodes a base64 string into a Uint8Array.
 */
export const decodeBase64 = (base64: string): Uint8Array => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

/**
 * Wraps raw PCM data with a WAV header to make it playable by standard players.
 * Gemini TTS output is typically 24kHz, 16-bit, Mono.
 */
export const pcmToWav = (pcmData: Uint8Array, sampleRate: number = 24000): ArrayBuffer => {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = pcmData.length;
  const headerSize = 44;
  const totalSize = headerSize + dataSize;

  const buffer = new ArrayBuffer(totalSize);
  const view = new DataView(buffer);

  // RIFF chunk descriptor
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true); // ChunkSize
  writeString(view, 8, 'WAVE');

  // fmt sub-chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
  view.setUint16(22, numChannels, true); // NumChannels
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, byteRate, true); // ByteRate
  view.setUint16(32, blockAlign, true); // BlockAlign
  view.setUint16(34, bitsPerSample, true); // BitsPerSample

  // data sub-chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true); // Subchunk2Size

  // Write PCM data
  const pcmBytes = new Uint8Array(buffer, 44);
  pcmBytes.set(pcmData);

  return buffer;
};

const writeString = (view: DataView, offset: number, string: string) => {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
};

export const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

export const generateExportHtml = (text: string, language: string, voice: string, audioBase64: string): string => {
  return `
<!DOCTYPE html>
<html lang="zh-Hant">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Polyglot 語音匯出</title>
    <style>
        body { font-family: system-ui, -apple-system, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.6; color: #333; background: #f9fafb; }
        .card { background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        h1 { margin-top: 0; color: #111827; }
        .meta { display: flex; gap: 16px; margin-bottom: 24px; font-size: 0.875rem; color: #6b7280; }
        .pill { background: #e5e7eb; padding: 4px 12px; border-radius: 9999px; font-weight: 500; }
        .content { font-size: 1.125rem; margin-bottom: 32px; white-space: pre-wrap; padding: 20px; background: #f3f4f6; border-radius: 8px; border-left: 4px solid #4f46e5; }
        audio { width: 100%; margin-top: 10px; }
        footer { margin-top: 40px; text-align: center; font-size: 0.8rem; color: #9ca3af; }
    </style>
</head>
<body>
    <div class="card">
        <h1>文字轉語音匯出</h1>
        <div class="meta">
            <span class="pill">語言: ${language}</span>
            <span class="pill">語音: ${voice}</span>
        </div>
        <div class="content">${text}</div>
        <audio controls src="data:audio/wav;base64,${audioBase64}"></audio>
    </div>
    <footer>由 Polyglot Voice AI 生成</footer>
</body>
</html>
  `;
};