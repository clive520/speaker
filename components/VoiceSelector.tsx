import React from 'react';
import { VoiceName, VOICE_OPTIONS } from '../types';

interface VoiceSelectorProps {
  selectedVoice: VoiceName;
  onSelect: (voice: VoiceName) => void;
  disabled?: boolean;
}

const VoiceSelector: React.FC<VoiceSelectorProps> = ({ selectedVoice, onSelect, disabled }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {VOICE_OPTIONS.map((option) => (
        <button
          key={option.id}
          onClick={() => onSelect(option.id)}
          disabled={disabled}
          className={`
            relative p-3 rounded-xl border transition-all duration-200
            hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500
            flex flex-col items-center text-center group
            ${selectedVoice === option.id
              ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/30'
              : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-750 hover:border-gray-600'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <div className={`
            w-16 h-16 rounded-full overflow-hidden mb-3 border-2 transition-colors
            ${selectedVoice === option.id ? 'border-indigo-300' : 'border-gray-600 group-hover:border-gray-500'}
            bg-gray-700
          `}>
            <img 
              src={option.avatarUrl} 
              alt={option.name} 
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>

          <div className="flex items-center justify-center gap-1.5 w-full">
            <span className="font-semibold text-sm truncate">{option.name}</span>
            {selectedVoice === option.id && (
              <svg className="w-4 h-4 text-white flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          
          <div className="text-xs opacity-80 mt-1">{option.gender} • {option.description}</div>
        </button>
      ))}
    </div>
  );
};

export default VoiceSelector;