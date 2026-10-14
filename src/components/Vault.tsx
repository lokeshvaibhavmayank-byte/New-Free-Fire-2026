import React, { useState } from 'react';
import { OUTFIT_BUNDLES } from '../game/outfits';
import { WEAPONS } from '../game/weapons';
import { EMOTES } from '../game/emotes';
import { OutfitBundle, WeaponDef, EmoteDef } from '../types/game';
import {
  Sparkles,
  Shield,
  Zap,
  Flame,
  Check,
  X,
  Crosshair,
  Volume2,
  Shirt,
  Award,
} from 'lucide-react';
import { sounds } from '../game/audio';

interface VaultProps {
  currentOutfitId: string;
  onSelectOutfit: (outfit: OutfitBundle) => void;
  onClose: () => void;
}

export const Vault: React.FC<VaultProps> = ({ currentOutfitId, onSelectOutfit, onClose }) => {
  const [activeTab, setActiveTab] = useState<'outfits' | 'weapons' | 'emotes'>('outfits');
  const [selectedOutfit, setSelectedOutfit] = useState<OutfitBundle>(
    OUTFIT_BUNDLES.find(o => o.id === currentOutfitId) || OUTFIT_BUNDLES[0]
  );
  const [selectedWeapon, setSelectedWeapon] = useState<WeaponDef>(Object.values(WEAPONS)[0]);
  const [selectedEmote, setSelectedEmote] = useState<EmoteDef>(EMOTES[0]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
      <div className="relative w-full max-w-5xl bg-gradient-to-b from-slate-900 via-slate-950 to-black border-2 border-yellow-500/70 rounded-2xl p-6 sm:p-8 shadow-[0_0_50px_rgba(234,179,8,0.3)] flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-yellow-500/30 pb-4 mb-4">
          <div className="text-left">
            <h2 className="font-blackops text-3xl sm:text-4xl text-yellow-400 tracking-wider">
              VAULT & COLLECTION
            </h2>
            <p className="font-rajdhani text-sm text-slate-400">
              Legendary Bundles, Evo Gun Skins, and Battle Emotes
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

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-3">
          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('outfits');
            }}
            className={`px-5 py-2 rounded-xl font-teko text-2xl tracking-wider flex items-center gap-2 transition ${
              activeTab === 'outfits'
                ? 'bg-yellow-500 text-black font-bold shadow-lg'
                : 'bg-slate-900 text-slate-300 hover:text-white'
            }`}
          >
            <Shirt className="w-5 h-5" />
            OUTFIT BUNDLES
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('weapons');
            }}
            className={`px-5 py-2 rounded-xl font-teko text-2xl tracking-wider flex items-center gap-2 transition ${
              activeTab === 'weapons'
                ? 'bg-yellow-500 text-black font-bold shadow-lg'
                : 'bg-slate-900 text-slate-300 hover:text-white'
            }`}
          >
            <Flame className="w-5 h-5" />
            WEAPON SKINS & EVOS
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('emotes');
            }}
            className={`px-5 py-2 rounded-xl font-teko text-2xl tracking-wider flex items-center gap-2 transition ${
              activeTab === 'emotes'
                ? 'bg-yellow-500 text-black font-bold shadow-lg'
                : 'bg-slate-900 text-slate-300 hover:text-white'
            }`}
          >
            <Sparkles className="w-5 h-5" />
            EMOTES
          </button>
        </div>

        {/* ========================================================
            TAB 1: OUTFIT BUNDLES
            ======================================================== */}
        {activeTab === 'outfits' && (
          <div className="flex flex-col md:flex-row gap-6 flex-1 overflow-y-auto">
            {/* Outfits List */}
            <div className="w-full md:w-1/2 grid grid-cols-2 gap-3">
              {OUTFIT_BUNDLES.map(outfit => {
                const isSelected = outfit.id === selectedOutfit.id;
                const isEquipped = outfit.id === currentOutfitId;
                return (
                  <div
                    key={outfit.id}
                    onClick={() => {
                      sounds.playClick();
                      setSelectedOutfit(outfit);
                    }}
                    className={`relative p-3.5 rounded-xl border-2 cursor-pointer transition text-left flex flex-col justify-between ${
                      isSelected
                        ? 'bg-yellow-500/20 border-yellow-400 shadow-md scale-[1.02]'
                        : 'bg-slate-900/80 border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-2xl">{outfit.icon}</span>
                        {isEquipped && (
                          <span className="text-[10px] bg-yellow-950 text-yellow-400 px-1.5 py-0.5 rounded border border-yellow-500 font-teko">
                            EQUIPPED
                          </span>
                        )}
                      </div>
                      <h4 className="font-teko text-xl text-white font-bold leading-tight">
                        {outfit.name}
                      </h4>
                      <span className="text-[10px] text-yellow-400 font-rajdhani font-semibold">
                        {outfit.tag}
                      </span>
                    </div>

                    <span className="text-[10px] text-slate-400 font-mono mt-2 uppercase">
                      {outfit.rarity} Tier
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Outfit Preview & Equip Box */}
            <div className="flex-1 bg-black/60 rounded-xl border border-yellow-500/40 p-6 flex flex-col justify-between text-left">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-3xl">{selectedOutfit.icon}</span>
                  <div>
                    <span className="text-xs uppercase px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 font-mono">
                      {selectedOutfit.rarity}
                    </span>
                    <h3 className="font-blackops text-3xl text-white tracking-wider">
                      {selectedOutfit.name}
                    </h3>
                  </div>
                </div>

                <div className="text-xs text-yellow-500 font-rajdhani font-semibold mb-4">
                  {selectedOutfit.tag}
                </div>

                <p className="text-sm text-slate-300 font-rajdhani leading-relaxed mb-6">
                  {selectedOutfit.description}
                </p>

                {/* Outfit Highlights */}
                <div className="bg-slate-900/90 rounded-lg p-3.5 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-rajdhani">
                    <span className="text-slate-400">Custom Headgear/Accessory:</span>
                    <span className="text-yellow-400 capitalize">{selectedOutfit.accessory}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-rajdhani">
                    <span className="text-slate-400">Battle Aura:</span>
                    <span className="text-yellow-400">{selectedOutfit.glowColor ? 'Active Neon Glow' : 'Standard'}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  sounds.playClick();
                  onSelectOutfit(selectedOutfit);
                }}
                className={`w-full py-3 rounded-xl font-teko text-2xl tracking-wider transition active:scale-95 mt-6 ${
                  selectedOutfit.id === currentOutfitId
                    ? 'bg-yellow-500 text-black font-bold cursor-default shadow'
                    : 'bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 text-black font-bold shadow-xl'
                }`}
              >
                {selectedOutfit.id === currentOutfitId ? 'ALREADY EQUIPPED' : 'EQUIP BUNDLE'}
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 2: WEAPON SKINS & EVOS
            ======================================================== */}
        {activeTab === 'weapons' && (
          <div className="flex flex-col md:flex-row gap-6 flex-1 overflow-y-auto">
            <div className="w-full md:w-1/3 flex flex-col gap-2">
              {Object.values(WEAPONS).map(w => (
                <div
                  key={w.id}
                  onClick={() => {
                    sounds.playClick();
                    setSelectedWeapon(w);
                  }}
                  className={`p-3 rounded-xl border-2 cursor-pointer transition text-left ${
                    selectedWeapon.id === w.id
                      ? 'bg-yellow-500/20 border-yellow-400 shadow-md scale-[1.02]'
                      : 'bg-slate-900/80 border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-teko text-2xl text-white font-bold">{w.name}</span>
                    <span className="text-[10px] bg-yellow-950 text-yellow-400 px-1.5 py-0.5 rounded border border-yellow-600 font-mono">
                      {w.category}
                    </span>
                  </div>
                  <span className="text-xs text-yellow-300/80 italic font-rajdhani">{w.skinName}</span>
                </div>
              ))}
            </div>

            <div className="flex-1 bg-black/60 rounded-xl border border-yellow-500/40 p-6 flex flex-col justify-between text-left">
              <div>
                <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400 border border-yellow-500/50">
                  {selectedWeapon.rarity} Evolution Skin
                </span>
                <h3 className="font-blackops text-3xl text-white tracking-wider mt-2">
                  {selectedWeapon.name} - {selectedWeapon.skinName}
                </h3>
                <p className="text-sm text-slate-300 font-rajdhani my-3 leading-relaxed">
                  {selectedWeapon.description}
                </p>

                {/* Gun Attributes */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 font-mono">DAMAGE</span>
                    <div className="font-teko text-2xl text-yellow-400">{selectedWeapon.damage}</div>
                  </div>
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 font-mono">RATE OF FIRE</span>
                    <div className="font-teko text-2xl text-yellow-400">
                      {selectedWeapon.fireRate > 0 ? `${Math.round(60 / selectedWeapon.fireRate)} RPM` : 'N/A'}
                    </div>
                  </div>
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 font-mono">RANGE</span>
                    <div className="font-teko text-2xl text-yellow-400">{selectedWeapon.range}m</div>
                  </div>
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 font-mono">MAGAZINE</span>
                    <div className="font-teko text-2xl text-yellow-400">{selectedWeapon.magazineSize} Rounds</div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => sounds.playGunshot(selectedWeapon.id as any)}
                className="w-full py-2.5 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-teko text-2xl font-bold tracking-wider active:scale-95 transition"
              >
                TEST FIRE AUDIO
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 3: EMOTES
            ======================================================== */}
        {activeTab === 'emotes' && (
          <div className="flex flex-col md:flex-row gap-6 flex-1 overflow-y-auto">
            <div className="w-full md:w-1/2 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {EMOTES.map(e => (
                <div
                  key={e.id}
                  onClick={() => {
                    sounds.playClick();
                    setSelectedEmote(e);
                    sounds.playEmoteSound(e.sound);
                  }}
                  className={`p-3 rounded-xl border-2 cursor-pointer transition text-center flex flex-col items-center justify-center ${
                    selectedEmote.id === e.id
                      ? 'bg-yellow-500/20 border-yellow-400 shadow-md scale-105'
                      : 'bg-slate-900/80 border-slate-700 hover:border-slate-500'
                  }`}
                >
                  <span className="text-3xl mb-1">{e.icon}</span>
                  <span className="font-teko text-lg text-white font-bold leading-none">{e.name}</span>
                </div>
              ))}
            </div>

            <div className="flex-1 bg-black/60 rounded-xl border border-yellow-500/40 p-6 flex flex-col justify-between text-left">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-4xl">{selectedEmote.icon}</span>
                  <div>
                    <h3 className="font-blackops text-3xl text-white tracking-wider">
                      {selectedEmote.name}
                    </h3>
                    <span className="text-xs text-yellow-400 font-mono">
                      Duration: {selectedEmote.duration}s
                    </span>
                  </div>
                </div>

                <p className="text-sm text-slate-300 font-rajdhani my-4 leading-relaxed">
                  {selectedEmote.description}
                </p>

                <div className="bg-slate-900/80 p-3.5 rounded-lg border border-slate-800 text-xs text-slate-300 font-rajdhani">
                  💡 In match, press <kbd className="bg-black px-1.5 py-0.5 rounded text-yellow-400 font-mono">B</kbd> or the Emote button on HUD to open the radial wheel and perform this emote!
                </div>
              </div>

              <button
                onClick={() => sounds.playEmoteSound(selectedEmote.sound)}
                className="w-full py-2.5 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-teko text-2xl font-bold tracking-wider active:scale-95 transition"
              >
                PLAY EMOTE AUDIO
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
