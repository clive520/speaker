import React, { useState, useRef, useEffect } from 'react';
import { VoiceName, ProcessedAudio, VOICE_OPTIONS } from './types';
import { detectLanguage, generateSpeech } from './services/geminiService';
import { generateExportHtml } from './utils';
import VoiceSelector from './components/VoiceSelector';

const MAX_CHARACTERS = 1500;

const App: React.FC = () => {
  const [text, setText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState<VoiceName>(VoiceName.Kore);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [detectedLang, setDetectedLang] = useState<string>('');
  const [audioResult, setAudioResult] = useState<ProcessedAudio | null>(null);

  const audioRef = useRef<HTMLAudioElement>(null);

  // Clean up Object URL on unmount to avoid memory leaks
  useEffect(() => {
    return () => {
      if (audioResult?.url) {
        URL.revokeObjectURL(audioResult.url);
      }
    };
  }, [audioResult]);

  const handleGenerate = async () => {
    if (!text.trim()) return;
    
    setIsLoading(true);
    setAudioResult(null);
    setDetectedLang('');
    setStatus('正在分析文字語言...');

    try {
      // Step 1: Detect Language
      const lang = await detectLanguage(text);
      setDetectedLang(lang);
      setStatus(`偵測語言：${lang}。正在生成語音...`);

      // Step 2: Generate Speech
      const result = await generateSpeech(text, selectedVoice);
      
      setStatus('語音生成成功。');
      setAudioResult({
        ...result,
        detectedLanguage: lang
      });

    } catch (error) {
      console.error(error);
      setStatus('錯誤：處理請求失敗。請檢查您的 API 金鑰並重試。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!audioResult) return;

    const htmlContent = generateExportHtml(
      text,
      detectedLang || '未知',
      VOICE_OPTIONS.find(v => v.id === selectedVoice)?.name || 'AI',
      audioResult.base64Wav
    );

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `polyglot-speech-${Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Calculate percentage for progress bar
  const charCount = text.length;
  const percentage = Math.min((charCount / MAX_CHARACTERS) * 100, 100);
  
  // Determine color based on usage
  let progressColor = 'bg-indigo-500';
  let textColor = 'text-gray-500';
  
  if (percentage >= 100) {
    progressColor = 'bg-red-500';
    textColor = 'text-red-400';
  } else if (percentage > 90) {
    progressColor = 'bg-yellow-500';
    textColor = 'text-yellow-400';
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center py-10 px-4 sm:px-6">
      <div className="w-full max-w-3xl space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-500/10 rounded-full mb-4">
             <svg className="w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
             </svg>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Polyglot <span className="text-indigo-400">Voice AI</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-xl mx-auto">
            利用 Gemini AI 自動偵測語言，將文字轉換為栩栩如生的語音。
            <br className="hidden sm:block" />
            （單次輸入上限 {MAX_CHARACTERS} 字）
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-3xl border border-gray-700 shadow-2xl p-6 sm:p-8 space-y-8">
          
          {/* Input Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label htmlFor="text-input" className="block text-sm font-medium text-gray-300">
                輸入文字
              </label>
              
              {/* Character Counter & Progress Bar */}
              <div className="flex items-center gap-3">
                <div className="w-24 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${progressColor}`} 
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className={`text-xs font-mono font-medium transition-colors duration-200 ${textColor}`}>
                  {charCount} / {MAX_CHARACTERS}
                </span>
              </div>
            </div>
            
            <div className="relative">
              <textarea
                id="text-input"
                rows={5}
                maxLength={MAX_CHARACTERS}
                className="block w-full rounded-2xl bg-gray-900 border-gray-600 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-4 resize-none transition-shadow duration-200"
                placeholder="在此輸入任何內容... (英文、中文、日文、西班牙文等)"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              {text && (
                <button 
                  onClick={() => setText('')}
                  className="absolute top-3 right-3 text-gray-500 hover:text-white transition-colors"
                  title="清除文字"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Voice Selection */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-300">
              選擇語音角色
            </label>
            <VoiceSelector 
              selectedVoice={selectedVoice} 
              onSelect={setSelectedVoice} 
              disabled={isLoading}
            />
          </div>

          {/* Status & Language Display */}
          {(status || detectedLang) && (
            <div className={`rounded-xl p-4 flex items-center justify-between border ${detectedLang ? 'bg-indigo-900/20 border-indigo-500/30' : 'bg-gray-900 border-gray-700'}`}>
               <div className="flex items-center space-x-3">
                 {isLoading && (
                   <div className="animate-spin rounded-full h-4 w-4 border-2 border-indigo-500 border-t-transparent"></div>
                 )}
                 <span className="text-sm font-medium text-gray-200">{status}</span>
               </div>
               {detectedLang && !isLoading && (
                 <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/50 text-green-400 border border-green-500/20">
                   {detectedLang}
                 </span>
               )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <button
              onClick={handleGenerate}
              disabled={isLoading || !text.trim()}
              className={`flex-1 flex justify-center items-center px-6 py-4 border border-transparent text-base font-medium rounded-2xl text-white shadow-lg transition-all duration-200
                ${isLoading || !text.trim()
                  ? 'bg-gray-700 cursor-not-allowed opacity-60'
                  : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-500/25 active:transform active:scale-[0.98]'
                }
              `}
            >
              {isLoading ? '處理中...' : '生成語音'}
            </button>
          </div>

          {/* Result Section */}
          {audioResult && (
            <div className="mt-8 pt-8 border-t border-gray-700 space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-white">結果</h3>
              </div>

              {/* Audio Player */}
              <div className="bg-gray-900 rounded-2xl p-4 border border-gray-700">
                <audio 
                  ref={audioRef}
                  controls 
                  src={audioResult.url} 
                  className="w-full h-10 outline-none filter invert contrast-75 opacity-90"
                  autoPlay
                />
              </div>

              {/* Download Button */}
              <button
                onClick={handleDownload}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3 border border-gray-600 rounded-xl text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white hover:border-gray-500 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>下載 HTML (文字 + 語音)</span>
              </button>
            </div>
          )}

        </div>
        
        <p className="text-center text-xs text-gray-500">
          由 Gemini 2.5 Flash & TTS 技術支援。需要在環境變數中設定 API 金鑰。
        </p>

      </div>
    </div>
  );
};

export default App;