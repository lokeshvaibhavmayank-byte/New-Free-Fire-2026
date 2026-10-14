import React from 'react';
import { CHARACTERS } from '../game/characters';
import { CharacterDef } from '../types/game';
import { Zap, Shield, Heart, Activity, Check, X } from 'lucide-react';
import { sounds } from '../game/audio';

interface CharacterSelectProps {
  selectedCharacterId: string;
  onSelectCharacter: (char: CharacterDef) => void;
  onClose: () => void;
}

export const CharacterSelect: React.FC<CharacterSelectProps> = ({
  selectedCharacterId,
  onSelectCharacter,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
      <div className="relative w-full max-w-4xl bg-gradient-to-b from-slate-900 via-slate-950 to-black border-2 border-yellow-500/70 rounded-2xl p-6 sm:p-8 shadow-[0_0_40px_rgba(234,179,8,0.25)] flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-yellow-500/30 pb-4 mb-6">
          <div className="text-left">
            <h2 className="font-blackops text-3xl sm:text-4xl text-yellow-400 tracking-wider">
              CHARACTER ROSTER
            </h2>
            <p className="font-rajdhani text-sm text-slate-400">
              Select your legendary Free Fire combatant and unleash signature active skills
            </p>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Character Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pr-1">
          {CHARACTERS.map(char => {
            const isEquipped = char.id === selectedCharacterId;
            return (
              <div
                key={char.id}
                onClick={() => {
                  sounds.playClick();
                  onSelectCharacter(char);
                }}
                className={`relative rounded-xl p-5 border-2 cursor-pointer transition-all flex flex-col justify-between ${
                  isEquipped
                    ? 'bg-gradient-to-b from-yellow-500/20 to-slate-900 border-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.4)] scale-[1.02]'
                    : 'bg-slate-900/80 border-slate-700 hover:border-slate-500 hover:bg-slate-800/80'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider"
                      style={{
                        backgroundColor: `${char.themeColor}33`,
                        color: char.accentColor,
                        border: `1px solid ${char.accentColor}66`,
                      }}
                    >
                      {char.skillType} SKILL
                    </span>
                    {isEquipped && (
                      <span className="flex items-center gap-1 text-xs font-teko text-yellow-400 bg-yellow-950/80 px-2 py-0.5 rounded border border-yellow-500">
                        <Check className="w-3.5 h-3.5 stroke-[3]" /> EQUIPPED
                      </span>
                    )}
                  </div>

                  <h3 className="font-teko text-3xl text-white font-bold tracking-wider leading-none">
                    {char.name}
                  </h3>
                  <div className="text-xs text-yellow-500/90 font-rajdhani font-semibold mb-3">
                    {char.title}
                  </div>

                  {/* Skill Card Box */}
                  <div className="bg-black/60 rounded-lg p-3 border border-slate-800 mb-3 text-left">
                    <div className="flex items-center gap-1.5 font-teko text-xl text-yellow-400">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      <span>{char.skillName}</span>
                    </div>
                    <p className="text-xs text-slate-300 font-rajdhani leading-relaxed mt-1">
                      {char.description}
                    </p>
                  </div>
                </div>

                {/* Equip Button */}
                <button
                  onClick={e => {
                    e.stopPropagation();
                    sounds.playClick();
                    onSelectCharacter(char);
                  }}
                  className={`w-full py-2 rounded-lg font-teko text-xl tracking-wider transition ${
                    isEquipped
                      ? 'bg-yellow-500 text-black font-bold cursor-default'
                      : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-600'
                  }`}
                >
                  {isEquipped ? 'EQUIPPED' : 'EQUIP CHARACTER'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
