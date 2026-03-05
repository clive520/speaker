import { GoogleGenAI, Modality } from "@google/genai";
import { VoiceName } from "../types";
import { decodeBase64, pcmToWav, arrayBufferToBase64 } from "../utils";

const API_KEY = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey: API_KEY });

/**
 * Detects the language of the provided text.
 */
export const detectLanguage = async (text: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `辨識以下文字的語言。請僅回傳繁體中文的語言名稱，並在括號中附上 BCP-47 代碼（例如：「英文 (en-US)」、「國語 (zh-TW)」）。\n\n文字內容：「${text.substring(0, 500)}」`,
    });
    return response.text?.trim() || '未知';
  } catch (error) {
    console.error("Language detection failed:", error);
    return "未知";
  }
};

/**
 * Generates speech from text using Gemini TTS.
 * Returns the processed audio blob, url, and base64 string (WAV formatted).
 */
export const generateSpeech = async (text: string, voice: VoiceName) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      throw new Error("No audio data received from Gemini API.");
    }

    // Convert Base64 (Raw PCM) -> Uint8Array -> WAV ArrayBuffer -> Blob
    const pcmData = decodeBase64(base64Audio);
    const wavBuffer = pcmToWav(pcmData, 24000); // 24kHz is standard for Gemini TTS
    const wavBlob = new Blob([wavBuffer], { type: 'audio/wav' });
    const wavUrl = URL.createObjectURL(wavBlob);
    
    // We also need the base64 of the WAV file (not PCM) for the HTML export
    const wavBase64 = arrayBufferToBase64(wavBuffer);

    return {
      blob: wavBlob,
      url: wavUrl,
      base64Wav: wavBase64
    };

  } catch (error) {
    console.error("TTS generation failed:", error);
    throw error;
  }
};