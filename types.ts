export enum VoiceName {
  Puck = 'Puck',
  Charon = 'Charon',
  Kore = 'Kore',
  Fenrir = 'Fenrir',
  Zephyr = 'Zephyr',
}

export interface VoiceOption {
  id: VoiceName;
  name: string;
  gender: string;
  description: string;
  avatarUrl: string;
}

export const VOICE_OPTIONS: VoiceOption[] = [
  { 
    id: VoiceName.Puck, 
    name: 'Puck', 
    gender: '男聲', 
    description: '深沉渾厚',
    // Jude seed usually generates a distinctive male avatar suitable for a deep voice
    avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Jude&backgroundColor=b6e3f4'
  },
  { 
    id: VoiceName.Charon, 
    name: 'Charon', 
    gender: '男聲', 
    description: '權威清晰',
    // Sawyer seed provides a sharp, professional look
    avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Sawyer&backgroundColor=c0aede'
  },
  { 
    id: VoiceName.Kore, 
    name: 'Kore', 
    gender: '女聲', 
    description: '平靜舒緩',
    // Mila seed provides a gentle, calm female appearance
    avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Mila&backgroundColor=ffdfbf'
  },
  { 
    id: VoiceName.Fenrir, 
    name: 'Fenrir', 
    gender: '男聲', 
    description: '充滿活力',
    // Ryker seed creates a more energetic/younger male look
    avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Ryker&backgroundColor=d1d4f9'
  },
  { 
    id: VoiceName.Zephyr, 
    name: 'Zephyr', 
    gender: '女聲', 
    description: '溫柔輕聲',
    // Valentina seed creates a soft, friendly female look
    avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Valentina&backgroundColor=ffd5dc'
  },
];

export interface ProcessedAudio {
  blob: Blob;
  url: string;
  base64Wav: string; // WAV formatted base64 for embedding
  detectedLanguage: string;
}