import React, { useState } from 'react';
import { WEAPONS } from '../game/weapons';
import { WeaponDef } from '../types/game';
import { Flame, Shield, Target, Crosshair, X, Check } from 'lucide-react';
import { sounds } from '../game/audio';

interface ArmoryProps {
  onClose: () => void;
}

export const Armory: React.FC<ArmoryProps> = ({ onClose }) => {
  const weaponList = Object.values(WEAPONS);
  const [selectedWeapon, setSelectedWeapon] = useState<WeaponDef>(weaponList[0]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
      <div className="relative w-full max-w-5xl bg-gradient-to-b from-slate-900 via-slate-950 to-black border-2 border-yellow-500/70 rounded-2xl p-6 sm:p-8 shadow-[0_0_40px_rgba(234,179,8,0.25)] flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-yellow-500/30 pb-4 mb-6">
          <div className="text-left">
            <h2 className="font-blackops text-3xl sm:text-4xl text-yellow-400 tracking-wider">
              WEAPON ARMORY & SKINS
            </h2>
            <p className="font-rajdhani text-sm text-slate-400">
              Inspect iconic Free Fire MAX firearms, evolutionary weapon attributes, and stats
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

        {/* Content Body: Left Weapons List & Right Inspection Panel */}
        <div className="flex flex-col md:flex-row gap-6 flex-1 overflow-y-auto">
          {/* Left: Weapons Selector */}
          <div className="w-full md:w-1/3 flex flex-col gap-2.5">
            {weaponList.map(w => {
              const isSelected = w.id === selectedWeapon.id;
              return (
                <div
                  key={w.id}
                  onClick={() => {
                    sounds.playClick();
                    setSelectedWeapon(w);
                  }}
                  className={`p-3.5 rounded-xl border-2 cursor-pointer transition flex items-center justify-between text-left ${
                    isSelected
                      ? 'bg-yellow-500/20 border-yellow-400 shadow-md scale-[1.02]'
                      : 'bg-slate-900/80 border-slate-700 hover:border-slate-500'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-teko text-2xl text-white font-bold leading-none">
                        {w.name}
                      </span>
                      <span className="text-[10px] bg-yellow-950 text-yellow-400 px-1.5 py-0.5 rounded border border-yellow-600 font-mono">
                        {w.category}
                      </span>
                    </div>
                    <span className="text-xs text-yellow-300/80 italic font-rajdhani">
                      {w.skinName}
                    </span>
                  </div>

                  <span className="text-xs font-teko text-slate-400">
                    DMG: {w.damage}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Right: Weapon Deep Inspection & Attributes */}
          <div className="flex-1 bg-black/60 rounded-xl border border-yellow-500/40 p-6 flex flex-col justify-between text-left">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-mono uppercase px-2.5 py-0.5 rounded bg-yellow-500/20 text-yellow-400 border border-yellow-500/50">
                  {selectedWeapon.rarity} Skin
                </span>
                <span className="text-sm font-rajdhani text-slate-400">
                  Category: <strong className="text-white">{selectedWeapon.category}</strong>
                </span>
              </div>

              <h3 className="font-blackops text-4xl text-white tracking-wider">
                {selectedWeapon.name}
              </h3>
              <div className="font-teko text-2xl text-yellow-400 tracking-wider mb-4">
                SKIN: {selectedWeapon.skinName}
              </div>

              <p className="text-sm text-slate-300 font-rajdhani mb-6 leading-relaxed">
                {selectedWeapon.description}
              </p>

              {/* Stat Meters */}
              <div className="space-y-3.5 max-w-lg">
                {/* Damage */}
                <div>
                  <div className="flex justify-between text-xs font-rajdhani font-bold mb-1">
                    <span className="text-slate-300">DAMAGE:</span>
                    <span className="text-yellow-400">{selectedWeapon.damage}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full"
                      style={{ width: `${Math.min(100, (selectedWeapon.damage / 160) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Rate of Fire */}
                <div>
                  <div className="flex justify-between text-xs font-rajdhani font-bold mb-1">
                    <span className="text-slate-300">RATE OF FIRE:</span>
                    <span className="text-yellow-400">
                      {selectedWeapon.fireRate > 0 ? `${Math.round(60 / selectedWeapon.fireRate)} RPM` : 'Single'}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-red-500 to-orange-400 rounded-full"
                      style={{
                        width: `${
                          selectedWeapon.fireRate > 0
                            ? Math.min(100, (0.4 / Math.max(0.07, selectedWeapon.fireRate)) * 100)
                            : 10
                        }%`,
                      }}
                    />
                  </div>
                </div>

                {/* Range */}
                <div>
                  <div className="flex justify-between text-xs font-rajdhani font-bold mb-1">
                    <span className="text-slate-300">RANGE:</span>
                    <span className="text-yellow-400">{selectedWeapon.range}m</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                      style={{ width: `${Math.min(100, (selectedWeapon.range / 200) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Magazine */}
                <div>
                  <div className="flex justify-between text-xs font-rajdhani font-bold mb-1">
                    <span className="text-slate-300">MAGAZINE CAPACITY:</span>
                    <span className="text-yellow-400">{selectedWeapon.magazineSize} Rounds</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                      style={{ width: `${Math.min(100, (selectedWeapon.magazineSize / 40) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between mt-4">
              <span className="text-xs text-slate-400 font-rajdhani">
                Pre-equipped in your match inventory loadout
              </span>
              <button
                onClick={() => {
                  sounds.playGunshot(selectedWeapon.id as any);
                }}
                className="px-4 py-1.5 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-black font-teko text-xl font-bold tracking-wider active:scale-95 transition"
              >
                TEST FIRE AUDIO
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
