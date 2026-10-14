import React, { useEffect, useState, useRef } from 'react';
import {
  CharacterDef,
  DamageNumber,
  KillFeedItem,
  PlayerState,
  SafeZoneState,
} from '../types/game';
import {
  Shield,
  Crosshair,
  Zap,
  Volume2,
  VolumeX,
  Target,
  Plus,
  Flame,
  Skull,
  Radio,
  Eye,
  ChevronsUp,
} from 'lucide-react';
import { sounds } from '../game/audio';

interface GameHUDProps {
  player: PlayerState;
  character: CharacterDef;
  aliveCount: number;
  safeZone: SafeZoneState;
  killFeed: KillFeedItem[];
  damageNumbers: DamageNumber[];
  isTargetingEnemy: boolean;
  onFire: () => void;
  onJump: () => void;
  onCrouch: () => void;
  onReload: () => void;
  onDeployGlooWall: () => void;
  onTriggerSkill: () => void;
  onUseMedkit: () => void;
  onSelectWeapon: (idx: number) => void;
  onToggleAim: () => void;
  onVirtualStickMove: (x: number, y: number) => void;
  onVirtualLookMove: (yawDelta: number, pitchDelta: number) => void;
  onRequestPointerLock: () => void;
  onExitMatch: () => void;
  onOpenEmoteWheel: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  player,
  character,
  aliveCount,
  safeZone,
  killFeed,
  damageNumbers,
  isTargetingEnemy,
  onFire,
  onJump,
  onCrouch,
  onReload,
  onDeployGlooWall,
  onTriggerSkill,
  onUseMedkit,
  onSelectWeapon,
  onToggleAim,
  onVirtualStickMove,
  onVirtualLookMove,
  onRequestPointerLock,
  onExitMatch,
  onOpenEmoteWheel,
}) => {
  const [isMuted, setIsMuted] = useState(sounds.getIsMuted());
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const lookTouchStartRef = useRef<{ x: number; y: number } | null>(null);

  const curWeapon = player.weapons[player.selectedWeaponIndex];

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleSound = () => {
    const next = !isMuted;
    sounds.setMuted(next);
    setIsMuted(next);
  };

  // Virtual Joystick Touch Handlers (Mobile Left Side)
  const handleJoystickTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleJoystickTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const touch = e.touches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const maxDist = 45;
    const normX = Math.max(-1, Math.min(1, dx / maxDist));
    const normY = Math.max(-1, Math.min(1, -dy / maxDist));
    onVirtualStickMove(normX, normY);
  };

  const handleJoystickTouchEnd = () => {
    touchStartRef.current = null;
    onVirtualStickMove(0, 0);
  };

  // Virtual Look Swipe Handlers (Mobile Right Side)
  const handleLookTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    lookTouchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleLookTouchMove = (e: React.TouchEvent) => {
    if (!lookTouchStartRef.current) return;
    const touch = e.touches[0];
    const dx = touch.clientX - lookTouchStartRef.current.x;
    const dy = touch.clientY - lookTouchStartRef.current.y;
    lookTouchStartRef.current = { x: touch.clientX, y: touch.clientY };
    onVirtualLookMove(dx * 0.005, -dy * 0.005);
  };

  const handleLookTouchEnd = () => {
    lookTouchStartRef.current = null;
  };

  return (
    <div
      className="absolute inset-0 pointer-events-none select-none overflow-hidden z-20 flex flex-col justify-between"
      onClick={onRequestPointerLock}
    >
      {/* ========================================================
          TOP HEADER: Match Info, Kill Feed, Safe Zone Banner, Minimap
          ======================================================== */}
      <div className="w-full p-3 sm:p-5 flex items-start justify-between">
        {/* Top-Left: Player Alive & Kills Badge */}
        <div className="flex flex-col gap-2 pointer-events-auto">
          <div className="flex items-center gap-2 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded border border-yellow-500/50 shadow-lg">
            <div className="flex items-center gap-1.5 text-yellow-400 font-teko text-2xl tracking-wide">
              <Skull className="w-5 h-5 text-red-500 animate-pulse" />
              <span>ALIVE: <strong className="text-white text-3xl">{aliveCount}</strong></span>
            </div>
            <div className="w-[1px] h-6 bg-white/20 mx-1" />
            <div className="flex items-center gap-1 text-red-400 font-teko text-2xl">
              <span>KILLS: <strong className="text-white text-3xl">{player.weapons[0] ? player.glooWallCount >= 0 ? Math.max(0, 25 - aliveCount) : 0 : 0}</strong></span>
            </div>
          </div>

          {/* Kill Feed Items */}
          <div className="flex flex-col gap-1 max-w-xs">
            {killFeed.slice(-3).map(k => (
              <div
                key={k.id}
                className="bg-black/80 px-2.5 py-1 rounded text-xs sm:text-sm font-rajdhani font-semibold border-l-2 border-red-500 flex items-center gap-1.5 shadow"
              >
                <span className={k.killer === 'YOU' ? 'text-yellow-400 font-bold' : 'text-slate-200'}>
                  {k.killer}
                </span>
                {k.isHeadshot ? (
                  <span className="text-red-500 font-black flex items-center gap-0.5 text-xs bg-red-950/80 px-1 rounded">
                    <Target className="w-3 h-3" /> HEADSHOT
                  </span>
                ) : (
                  <span className="text-yellow-500">[{k.weapon}]</span>
                )}
                <span className={k.victim === 'YOU' ? 'text-red-400 font-bold' : 'text-slate-400'}>
                  {k.victim}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top-Center: Safe Zone Warning Countdown */}
        <div className="flex flex-col items-center">
          <div className={`px-4 py-1.5 rounded-full backdrop-blur-md border font-teko text-xl tracking-wider flex items-center gap-2 shadow-xl ${
            safeZone.isShrinking
              ? 'bg-red-900/80 border-red-500 text-white animate-pulse'
              : 'bg-black/75 border-cyan-500/60 text-cyan-300'
          }`}>
            <Radio className="w-4 h-4 text-cyan-400 animate-spin" />
            <span>
              {safeZone.isShrinking ? 'SAFE ZONE IS SHRINKING!' : `SAFE ZONE SHRINKS IN: ${formatTimer(safeZone.shrinkTimer)}`}
            </span>
          </div>
          <span className="text-[10px] sm:text-xs text-slate-300 font-rajdhani mt-0.5 drop-shadow">
            BERMUDA BATTLE ROYALE (OFFLINE)
          </span>
        </div>

        {/* Top-Right: Minimap & Sound / Exit Controls */}
        <div className="flex items-start gap-3 pointer-events-auto">
          {/* Sound & Exit Buttons */}
          <div className="flex flex-col gap-1.5">
            <button
              onClick={toggleSound}
              className="p-2 rounded bg-black/70 hover:bg-black/90 text-yellow-400 border border-yellow-500/40 hover:scale-105 active:scale-95 transition"
              title="Toggle Audio"
            >
              {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <button
              onClick={onExitMatch}
              className="px-2 py-1 rounded bg-red-900/80 hover:bg-red-800 text-white text-xs font-teko tracking-wider border border-red-500 active:scale-95 transition"
            >
              QUIT
            </button>
          </div>

          {/* Bermuda Circular Radar Minimap */}
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-yellow-500/80 bg-slate-900/90 relative overflow-hidden shadow-2xl flex items-center justify-center">
            {/* Radar scan grid line */}
            <div className="absolute inset-0 border border-emerald-500/20 rounded-full" />
            <div className="absolute inset-3 border border-emerald-500/20 rounded-full" />
            <div className="absolute w-full h-[1px] bg-emerald-500/20" />
            <div className="absolute h-full w-[1px] bg-emerald-500/20" />

            {/* Radar Sweep Effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 to-transparent animate-spin origin-center" />

            {/* Landmark Labels on Radar */}
            <span className="absolute top-1 text-[8px] text-slate-400 font-mono">PEAK</span>
            <span className="absolute left-1 text-[8px] text-slate-400 font-mono">CLOCK</span>
            <span className="absolute right-1 text-[8px] text-slate-400 font-mono">FACTORY</span>

            {/* Center Player Marker Arrow */}
            <div
              className="w-3.5 h-3.5 text-yellow-400 flex items-center justify-center transform -rotate-45"
              style={{ transform: `rotate(${-player.rotationY * (180 / Math.PI)}deg)` }}
            >
              <ChevronsUp className="w-4 h-4 stroke-[3]" />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          CENTER: Crosshair, Scope ADS Overlay, Damage Floating Numbers
          ======================================================== */}
      <div className="relative flex-1 flex items-center justify-center">
        {/* Floating Combat Damage Numbers */}
        {damageNumbers.map(d => (
          <div
            key={d.id}
            className={`absolute pointer-events-none font-blackops text-2xl sm:text-3xl font-extrabold animate-bounce ${
              d.isHeadshot
                ? 'text-red-500 drop-shadow-[0_0_12px_rgba(239,68,68,1)] scale-125'
                : 'text-yellow-400 drop-shadow-[0_0_8px_rgba(234,179,8,0.8)]'
            }`}
            style={{ transform: `translateY(-${(1 - d.lifetime) * 60}px)` }}
          >
            {d.isHeadshot && '☠️ '}{d.amount}
          </div>
        ))}

        {/* Dynamic Free Fire Crosshair */}
        {!player.isAiming ? (
          <div className="relative flex items-center justify-center">
            {/* Auto-Aim Assist Center Indicator */}
            <div
              className={`w-2.5 h-2.5 rounded-full transition-all duration-75 ${
                isTargetingEnemy
                  ? 'bg-red-500 scale-150 shadow-[0_0_10px_#ef4444]'
                  : 'bg-white/80'
              }`}
            />
            {/* Four Tactical Brackets */}
            <div
              className={`absolute w-9 h-9 border-t-2 border-l-2 transition-colors duration-75 ${
                isTargetingEnemy ? 'border-red-500' : 'border-white/80'
              } -top-3 -left-3`}
            />
            <div
              className={`absolute w-9 h-9 border-t-2 border-r-2 transition-colors duration-75 ${
                isTargetingEnemy ? 'border-red-500' : 'border-white/80'
              } -top-3 -right-3`}
            />
            <div
              className={`absolute w-9 h-9 border-b-2 border-l-2 transition-colors duration-75 ${
                isTargetingEnemy ? 'border-red-500' : 'border-white/80'
              } -bottom-3 -left-3`}
            />
            <div
              className={`absolute w-9 h-9 border-b-2 border-r-2 transition-colors duration-75 ${
                isTargetingEnemy ? 'border-red-500' : 'border-white/80'
              } -bottom-3 -right-3`}
            />
          </div>
        ) : (
          /* AWM 8x Scope Overlay */
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none">
            <div className="w-[85vmin] h-[85vmin] rounded-full border-4 border-black/80 relative overflow-hidden shadow-[0_0_0_100vmax_rgba(0,0,0,0.88)] flex items-center justify-center">
              {/* Reticle Crosshairs */}
              <div className="absolute w-full h-[1.5px] bg-red-600/90" />
              <div className="absolute h-full w-[1.5px] bg-red-600/90" />
              <div className="absolute w-2 h-2 rounded-full border border-red-500 bg-red-500/30" />
              {/* Rangefinder ticks */}
              <div className="absolute bottom-16 text-yellow-400 font-teko text-xl tracking-widest">
                8X HIGH POWER OPTIC • BERMUDA
              </div>
            </div>
          </div>
        )}

        {/* Medkit Healing Progress Overlay */}
        {player.isHealing && (
          <div className="absolute bottom-24 flex flex-col items-center gap-1 bg-black/80 px-6 py-2 rounded-lg border border-emerald-500 animate-pulse">
            <span className="text-emerald-400 font-teko text-2xl tracking-wider flex items-center gap-1.5">
              <Plus className="w-5 h-5 text-emerald-400" /> APPLYING MEDKIT...
            </span>
            <div className="w-48 h-2 bg-slate-800 rounded-full overflow-hidden border border-emerald-500/40">
              <div
                className="h-full bg-emerald-500 transition-all"
                style={{ width: `${player.healProgress * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ========================================================
          BOTTOM: Dual EP/HP Bar, Weapon Slots, Skills & Touch Buttons
          ======================================================== */}
      <div className="w-full p-3 sm:p-5 flex flex-col sm:flex-row items-end justify-between gap-3">
        {/* Bottom-Left: Character Health & EP Bars (Signature Free Fire Double Bar) */}
        <div className="flex flex-col gap-1.5 w-full sm:w-80 pointer-events-auto">
          {/* Armor Durability badges */}
          <div className="flex items-center gap-3 text-xs font-rajdhani font-bold text-slate-300">
            <span className="flex items-center gap-1 bg-black/70 px-2 py-0.5 rounded border border-slate-700">
              <Shield className="w-3.5 h-3.5 text-blue-400" /> VEST LV3: {Math.round(player.armor)}/100
            </span>
            <span className="flex items-center gap-1 bg-black/70 px-2 py-0.5 rounded border border-slate-700">
              <Shield className="w-3.5 h-3.5 text-yellow-400" /> HELMET LV3: {Math.round(player.helmet)}/100
            </span>
          </div>

          {/* Yellow EP Bar */}
          <div className="relative w-full h-3 bg-black/80 rounded-full overflow-hidden border border-yellow-500/40">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-150"
              style={{ width: `${(player.ep / player.maxEp) * 100}%` }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-black drop-shadow">
              EP {Math.round(player.ep)}/{player.maxEp}
            </span>
          </div>

          {/* White/Green HP Bar */}
          <div className="relative w-full h-5 bg-black/80 rounded-md overflow-hidden border-2 border-white/80 shadow-lg">
            <div
              className={`h-full transition-all duration-100 ${
                player.hp < 60
                  ? 'bg-gradient-to-r from-red-600 to-rose-500 animate-pulse'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-400'
              }`}
              style={{ width: `${(player.hp / player.maxHp) * 100}%` }}
            />
            <span className="absolute inset-0 flex items-center justify-between px-2 text-xs font-blackops text-white drop-shadow-[0_1px_2px_rgba(0,0,0,1)]">
              <span>HP</span>
              <span>{Math.round(player.hp)} / {player.maxHp}</span>
            </span>
          </div>

          {/* Medkit Quick Use Button */}
          <div className="flex items-center gap-2 mt-1">
            <button
              onClick={onUseMedkit}
              disabled={player.medkitCount <= 0 || player.isHealing}
              className="flex items-center gap-2 px-3 py-1.5 rounded bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/80 text-white font-teko text-xl tracking-wider disabled:opacity-50 active:scale-95 transition shadow-lg"
            >
              <Plus className="w-5 h-5 text-emerald-400 fill-emerald-400" />
              <span>MEDKIT [{player.medkitCount}]</span>
              <kbd className="text-xs bg-black/60 px-1 py-0.5 rounded text-emerald-300 ml-1">H</kbd>
            </button>

            {/* Gloo Wall Quick Deploy Button */}
            <button
              onClick={onDeployGlooWall}
              disabled={player.glooWallCount <= 0}
              className="flex items-center gap-2 px-3 py-1.5 rounded bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-400 text-white font-teko text-xl tracking-wider disabled:opacity-50 active:scale-95 transition shadow-lg ff-glow-cyan"
            >
              <Shield className="w-5 h-5 text-cyan-400 fill-cyan-400" />
              <span>GLOO WALL [{player.glooWallCount}]</span>
              <kbd className="text-xs bg-black/60 px-1 py-0.5 rounded text-cyan-300 ml-1">G</kbd>
            </button>
          </div>
        </div>

        {/* Bottom-Center: Active Skill (Alok / Chrono / Wukong) */}
        <div className="flex items-center gap-3 pointer-events-auto">
          {character.skillType === 'ACTIVE' && (
            <button
              onClick={onTriggerSkill}
              disabled={player.activeSkillCooldown > 0}
              className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 flex flex-col items-center justify-center transition shadow-2xl active:scale-95 ${
                player.activeSkillTimer > 0
                  ? 'border-emerald-400 bg-emerald-500/30 animate-pulse shadow-[0_0_20px_#10b981]'
                  : player.activeSkillCooldown > 0
                  ? 'border-slate-700 bg-black/80 opacity-60'
                  : 'border-yellow-400 bg-black/80 hover:bg-black ff-glow-yellow'
              }`}
            >
              <Zap className={`w-6 h-6 sm:w-8 sm:h-8 ${player.activeSkillTimer > 0 ? 'text-emerald-300' : 'text-yellow-400'}`} />
              <span className="font-teko text-xs sm:text-sm tracking-wider text-white">
                {player.activeSkillTimer > 0
                  ? `${Math.ceil(player.activeSkillTimer)}s`
                  : player.activeSkillCooldown > 0
                  ? `${Math.ceil(player.activeSkillCooldown)}s`
                  : character.name.split(' ')[0]}
              </span>
              <kbd className="absolute -bottom-2 bg-yellow-500 text-black font-black text-[10px] px-1 rounded shadow">
                E
              </kbd>
            </button>
          )}

          {/* Scope ADS Toggle Button */}
          <button
            onClick={onToggleAim}
            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full border flex flex-col items-center justify-center active:scale-95 transition shadow-lg ${
              player.isAiming
                ? 'border-red-500 bg-red-600/40 text-red-300'
                : 'border-slate-600 bg-black/70 hover:bg-black/90 text-white'
            }`}
          >
            <Eye className="w-6 h-6" />
            <span className="text-[10px] font-teko">SCOPE</span>
          </button>

          {/* Emote Wheel Button */}
          <button
            onClick={onOpenEmoteWheel}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border border-yellow-500/70 bg-black/80 hover:bg-black text-yellow-400 flex flex-col items-center justify-center active:scale-95 transition shadow-lg relative"
            title="Emote Wheel (B)"
          >
            <span className="text-xl leading-none">😂</span>
            <span className="text-[10px] font-teko text-white mt-0.5">EMOTE</span>
            <kbd className="absolute -bottom-1 bg-yellow-500 text-black text-[9px] font-bold px-1 rounded shadow">
              B
            </kbd>
          </button>
        </div>

        {/* Bottom-Right: Weapon Cards & Ammo & Fire/Jump/Crouch Buttons */}
        <div className="flex flex-col items-end gap-2 pointer-events-auto">
          {/* Weapon Cards Row */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto max-w-full">
            {player.weapons.map((slot, idx) => {
              const isSelected = player.selectedWeaponIndex === idx;
              return (
                <button
                  key={slot.weapon.id}
                  onClick={() => onSelectWeapon(idx)}
                  className={`px-3 py-2 rounded-lg border flex flex-col items-start transition-all active:scale-95 ${
                    isSelected
                      ? 'bg-gradient-to-r from-amber-600/40 to-yellow-600/30 border-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.5)] scale-105'
                      : 'bg-black/75 border-slate-700 hover:border-slate-500 opacity-70'
                  }`}
                >
                  <div className="flex items-center justify-between w-full gap-2">
                    <span className="font-teko text-lg text-white font-bold tracking-wider">
                      {slot.weapon.name}
                    </span>
                    <span className="text-[10px] px-1 rounded bg-black/60 text-yellow-400 font-mono">
                      {idx + 1}
                    </span>
                  </div>
                  <span className="text-[10px] text-yellow-300/80 italic font-rajdhani">
                    {slot.weapon.skinName}
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="font-teko text-2xl text-white font-bold leading-none">
                      {slot.currentAmmo}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      /{slot.reserveAmmo}
                    </span>
                  </div>
                </button>
              );
            })}

            {/* Reload Button */}
            <button
              onClick={onReload}
              className="px-3 py-3 rounded-lg bg-black/80 hover:bg-black border border-slate-600 text-yellow-400 flex flex-col items-center justify-center active:scale-95 transition"
              title="Reload (R)"
            >
              <Flame className="w-5 h-5 text-yellow-400" />
              <span className="text-[10px] font-teko">RELOAD [R]</span>
            </button>
          </div>

          {/* Quick Action Buttons (Jump, Crouch, Primary Fire) */}
          <div className="flex items-center gap-2 mt-1">
            <button
              onClick={onCrouch}
              className={`px-4 py-2 rounded-lg font-teko text-xl tracking-wider border active:scale-95 transition ${
                player.isCrouching
                  ? 'bg-yellow-500 text-black border-yellow-400'
                  : 'bg-black/80 text-white border-slate-700'
              }`}
            >
              CROUCH [C]
            </button>

            <button
              onClick={onJump}
              className="px-4 py-2 rounded-lg bg-black/80 hover:bg-black text-white font-teko text-xl tracking-wider border border-slate-700 active:scale-95 transition"
            >
              JUMP [SPACE]
            </button>

            {/* Big Fire Trigger Button (especially intuitive on touch/mouse) */}
            <button
              onClick={onFire}
              className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-red-600 to-amber-600 text-white font-teko text-2xl tracking-widest border-2 border-yellow-400 active:scale-90 transition shadow-2xl ff-glow-red"
            >
              FIRE
            </button>
          </div>
        </div>
      </div>

      {/* On-Screen Touch Joystick & Look Swipe Area (for Touch Devices) */}
      <div className="absolute inset-0 pointer-events-none flex sm:hidden">
        {/* Left Side: Joystick area */}
        <div
          className="w-1/2 h-full pointer-events-auto"
          onTouchStart={handleJoystickTouchStart}
          onTouchMove={handleJoystickTouchMove}
          onTouchEnd={handleJoystickTouchEnd}
        />
        {/* Right Side: Camera Look swipe area */}
        <div
          className="w-1/2 h-full pointer-events-auto"
          onTouchStart={handleLookTouchStart}
          onTouchMove={handleLookTouchMove}
          onTouchEnd={handleLookTouchEnd}
        />
      </div>
    </div>
  );
};
