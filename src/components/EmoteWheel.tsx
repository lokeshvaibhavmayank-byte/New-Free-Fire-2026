import React from 'react';
import { EMOTES } from '../game/emotes';
import { EmoteDef } from '../types/game';
import { X, Sparkles } from 'lucide-react';
import { sounds } from '../game/audio';

interface EmoteWheelProps {
  onSelectEmote: (emote: EmoteDef) => void;
  onClose: () => void;
}

export const EmoteWheel: React.FC<EmoteWheelProps> = ({ onSelectEmote, onClose }) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-80 h-80 sm:w-96 sm:h-96 rounded-full bg-slate-950/95 border-2 border-yellow-500/80 shadow-[0_0_50px_rgba(234,179,8,0.4)] flex items-center justify-center pointer-events-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Center Close / Icon Badge */}
        <button
          onClick={onClose}
          className="absolute z-20 w-16 h-16 rounded-full bg-black border-2 border-yellow-400 flex flex-col items-center justify-center hover:bg-slate-900 active:scale-95 transition shadow-xl"
        >
          <X className="w-5 h-5 text-yellow-400" />
          <span className="text-[9px] font-teko text-slate-300">CLOSE [B]</span>
        </button>

        {/* Circular Emote Slots */}
        {EMOTES.map((emote, index) => {
          const total = EMOTES.length;
          const angle = (index * 2 * Math.PI) / total - Math.PI / 2;
          const radius = 125; // px from center
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;

          return (
            <button
              key={emote.id}
              onClick={() => {
                sounds.playClick();
                onSelectEmote(emote);
                onClose();
              }}
              style={{
                transform: `translate(${x}px, ${y}px)`,
              }}
              className="absolute w-20 h-20 rounded-2xl bg-slate-900/90 hover:bg-yellow-500/20 border border-slate-700 hover:border-yellow-400 flex flex-col items-center justify-center p-1.5 transition-all hover:scale-110 active:scale-95 shadow-lg group"
              title={emote.description}
            >
              <span className="text-2xl group-hover:scale-125 transition-transform duration-150">
                {emote.icon}
              </span>
              <span className="font-teko text-xs text-white group-hover:text-yellow-400 font-bold tracking-wide mt-0.5 truncate max-w-full">
                {emote.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
