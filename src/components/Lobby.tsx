import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { CharacterDef, GameMode, OutfitBundle } from '../types/game';
import { createCharacterMesh, createWeaponMesh } from '../game/models';
import {
  Trophy,
  Users,
  Shield,
  Crosshair,
  Volume2,
  VolumeX,
  Play,
  HelpCircle,
  Sparkles,
  Zap,
  Shirt,
  Smartphone,
  Flame,
  Target,
} from 'lucide-react';
import { sounds } from '../game/audio';

interface LobbyProps {
  selectedCharacter: CharacterDef;
  selectedOutfit: OutfitBundle;
  onStartMatch: (mode: GameMode) => void;
  onOpenCharacterSelect: () => void;
  onOpenVault: () => void;
  onOpenArmory: () => void;
  onOpenEmoteWheel: () => void;
  onOpenAndroidInstall: () => void;
}

export const Lobby: React.FC<LobbyProps> = ({
  selectedCharacter,
  selectedOutfit,
  onStartMatch,
  onOpenCharacterSelect,
  onOpenVault,
  onOpenArmory,
  onOpenEmoteWheel,
  onOpenAndroidInstall,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedMode, setSelectedMode] = useState<GameMode>('bermuda');
  const [showControlsModal, setShowControlsModal] = useState(false);
  const [isMuted, setIsMuted] = useState(sounds.getIsMuted());

  // 3D Character Preview in Lobby with Equipped Outfit
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const w = container.clientWidth;
    const h = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    camera.position.set(0, 1.4, 4.2);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // Studio lighting for lobby podium
    const light1 = new THREE.DirectionalLight(0xfff7ed, 1.8);
    light1.position.set(4, 8, 4);
    scene.add(light1);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
    rimLight.position.set(-4, 3, -4);
    scene.add(rimLight);

    const ambLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambLight);

    // Character podium pedestal
    const pedestalGeo = new THREE.CylinderGeometry(1.5, 1.7, 0.3, 32);
    const pedMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.8,
      roughness: 0.2,
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedMat);
    pedestal.position.y = -0.15;
    scene.add(pedestal);

    // Character Model with Outfit
    const charMesh = createCharacterMesh(selectedCharacter, selectedOutfit);
    charMesh.position.y = 0;
    scene.add(charMesh);

    // Attach MP40 to character in lobby
    const anchor = charMesh.getObjectByName('weaponAnchor');
    if (anchor) {
      const wep = createWeaponMesh('mp40');
      anchor.add(wep);
    }

    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      // Gentle idle turntable rotation
      charMesh.rotation.y += delta * 0.4;
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const nw = container.clientWidth;
      const nh = container.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [selectedCharacter, selectedOutfit]);

  const toggleSound = () => {
    const next = !isMuted;
    sounds.setMuted(next);
    setIsMuted(next);
  };

  return (
    <div className="relative w-full h-screen bg-slate-950 overflow-hidden flex flex-col justify-between text-white select-none">
      {/* Background Graphic Streaks & Glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-black via-slate-950 to-amber-950/40 pointer-events-none" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-yellow-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-red-600/15 blur-[140px] rounded-full pointer-events-none" />

      {/* 3D Character Preview Canvas */}
      <div ref={mountRef} className="absolute inset-0 z-0 flex items-center justify-center" />

      {/* ========================================================
          TOP BAR: Free Fire MAX Branding, Rank, Android APK & Audio
          ======================================================== */}
      <div className="relative z-10 w-full p-4 sm:p-6 flex items-center justify-between">
        {/* Logo & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-600 to-yellow-400 flex items-center justify-center border-2 border-yellow-300 shadow-[0_0_20px_rgba(234,179,8,0.5)]">
            <Trophy className="w-7 h-7 text-black fill-black" />
          </div>
          <div className="text-left">
            <h1 className="font-blackops text-3xl sm:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 tracking-wider leading-none">
              FREE FIRE <span className="text-red-500">MAX</span>
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs font-teko text-yellow-400 tracking-widest uppercase">
                BERMUDA BATTLE ROYALE
              </span>
              <span className="text-[10px] bg-emerald-950 text-emerald-400 px-1.5 py-0.2 rounded border border-emerald-500 font-mono">
                100% OFFLINE
              </span>
            </div>
          </div>
        </div>

        {/* Top Right Controls & Android APK Download */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Android Play Store / APK Download Button */}
          <button
            onClick={() => {
              sounds.playClick();
              onOpenAndroidInstall();
            }}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 hover:from-emerald-400 text-black font-teko text-xl font-bold tracking-wider active:scale-95 transition shadow-[0_0_15px_rgba(16,185,129,0.5)] border border-emerald-300"
          >
            <Smartphone className="w-5 h-5 text-black stroke-[2.5]" />
            <span className="hidden sm:inline">INSTALL FOR ANDROID</span>
            <span className="sm:hidden">APP 📲</span>
          </button>

          {/* Heroic Rank Badge */}
          <div className="hidden md:flex items-center gap-2 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-yellow-500/40 shadow-lg">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-yellow-500 to-amber-600 flex items-center justify-center text-black font-black text-xs shadow">
              ★4
            </div>
            <div className="text-left">
              <div className="font-teko text-lg text-yellow-400 leading-none">HEROIC TIER</div>
              <div className="text-[10px] text-slate-400 font-rajdhani">Grandmaster Track</div>
            </div>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="p-2.5 rounded-xl bg-black/60 hover:bg-black/80 text-yellow-400 border border-yellow-500/40 transition active:scale-95"
            title="Toggle Sound"
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5" />}
          </button>

          {/* Controls Modal */}
          <button
            onClick={() => {
              sounds.playClick();
              setShowControlsModal(true);
            }}
            className="p-2.5 rounded-xl bg-black/60 hover:bg-black/80 text-white border border-slate-700 transition active:scale-95"
            title="Controls & How to Play"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ========================================================
          LEFT FLANK: Character Info & Outfit Badge
          ======================================================== */}
      <div className="relative z-10 p-4 sm:p-6 max-w-sm text-left">
        <div className="bg-black/60 backdrop-blur-md rounded-2xl p-5 border border-yellow-500/30 shadow-2xl">
          <div className="flex items-center justify-between mb-1">
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
              style={{
                backgroundColor: `${selectedCharacter.themeColor}33`,
                color: selectedCharacter.accentColor,
                border: `1px solid ${selectedCharacter.accentColor}66`,
              }}
            >
              {selectedCharacter.skillType} SKILL
            </span>
            <button
              onClick={() => {
                sounds.playClick();
                onOpenCharacterSelect();
              }}
              className="text-xs text-yellow-400 hover:text-yellow-300 underline font-rajdhani font-semibold"
            >
              CHANGE HERO
            </button>
          </div>

          <h2 className="font-teko text-4xl text-white font-bold tracking-wider leading-none">
            {selectedCharacter.name}
          </h2>

          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-yellow-400/90 font-rajdhani font-semibold">
              {selectedCharacter.title}
            </span>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
              Outfit: {selectedOutfit.name}
            </span>
          </div>

          <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800 flex items-start gap-2.5">
            <div className="p-2 rounded-lg bg-yellow-500/20 text-yellow-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="font-teko text-lg text-yellow-300 leading-none">
                {selectedCharacter.skillName}
              </div>
              <p className="text-xs text-slate-300 font-rajdhani mt-0.5 line-clamp-2">
                {selectedCharacter.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          BOTTOM DOCK: Modes, Vault, Characters, Emotes & START
          ======================================================== */}
      <div className="relative z-10 w-full p-4 sm:p-6 flex flex-col lg:flex-row items-center justify-between gap-4 bg-gradient-to-t from-black via-black/80 to-transparent">
        {/* Navigation Tabs (Characters, Vault, Emotes, Armory) */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
          <button
            onClick={() => {
              sounds.playClick();
              onOpenCharacterSelect();
            }}
            className="px-4 sm:px-5 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-white font-teko text-xl sm:text-2xl tracking-wider border border-slate-700 hover:border-yellow-500/50 flex items-center gap-2 active:scale-95 transition shadow-lg"
          >
            <Users className="w-5 h-5 text-yellow-400" />
            CHARACTERS
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              onOpenVault();
            }}
            className="px-4 sm:px-5 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-white font-teko text-xl sm:text-2xl tracking-wider border border-slate-700 hover:border-yellow-500/50 flex items-center gap-2 active:scale-95 transition shadow-lg"
          >
            <Shirt className="w-5 h-5 text-yellow-400" />
            VAULT
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              onOpenEmoteWheel();
            }}
            className="px-4 sm:px-5 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-white font-teko text-xl sm:text-2xl tracking-wider border border-slate-700 hover:border-yellow-500/50 flex items-center gap-2 active:scale-95 transition shadow-lg"
          >
            <Sparkles className="w-5 h-5 text-yellow-400" />
            EMOTES [B]
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              onOpenArmory();
            }}
            className="px-4 sm:px-5 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-white font-teko text-xl sm:text-2xl tracking-wider border border-slate-700 hover:border-yellow-500/50 flex items-center gap-2 active:scale-95 transition shadow-lg"
          >
            <Crosshair className="w-5 h-5 text-yellow-400" />
            ARMORY
          </button>
        </div>

        {/* Mode Selector & Giant START Button */}
        <div className="flex items-center gap-3 flex-wrap justify-center">
          {/* 4 Mode Selector Tabs */}
          <div className="flex items-center bg-slate-900/90 rounded-xl p-1 border border-slate-700 overflow-x-auto max-w-full">
            <button
              onClick={() => {
                sounds.playClick();
                setSelectedMode('bermuda');
              }}
              className={`px-3 py-1.5 rounded-lg font-teko text-lg tracking-wider whitespace-nowrap transition ${
                selectedMode === 'bermuda'
                  ? 'bg-yellow-500 text-black font-bold shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              BERMUDA BR
            </button>

            <button
              onClick={() => {
                sounds.playClick();
                setSelectedMode('clash_squad');
              }}
              className={`px-3 py-1.5 rounded-lg font-teko text-lg tracking-wider whitespace-nowrap transition ${
                selectedMode === 'clash_squad'
                  ? 'bg-yellow-500 text-black font-bold shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              CLASH SQUAD (4v4)
            </button>

            <button
              onClick={() => {
                sounds.playClick();
                setSelectedMode('lone_wolf');
              }}
              className={`px-3 py-1.5 rounded-lg font-teko text-lg tracking-wider whitespace-nowrap transition ${
                selectedMode === 'lone_wolf'
                  ? 'bg-yellow-500 text-black font-bold shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              LONE WOLF (1v1)
            </button>

            <button
              onClick={() => {
                sounds.playClick();
                setSelectedMode('training');
              }}
              className={`px-3 py-1.5 rounded-lg font-teko text-lg tracking-wider whitespace-nowrap transition ${
                selectedMode === 'training'
                  ? 'bg-yellow-500 text-black font-bold shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              TRAINING RANGE
            </button>
          </div>

          {/* Giant Free Fire Yellow START Button */}
          <button
            onClick={() => {
              sounds.playClick();
              sounds.playGunshot('awm');
              onStartMatch(selectedMode);
            }}
            className="relative px-8 sm:px-12 py-3.5 rounded-xl bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 hover:from-yellow-400 hover:to-amber-400 text-black font-blackops text-2xl sm:text-3xl tracking-widest border-2 border-yellow-300 shadow-[0_0_35px_rgba(234,179,8,0.6)] flex items-center gap-3 active:scale-95 transition ff-glow-yellow"
          >
            <Play className="w-7 h-7 fill-black" />
            START
          </button>
        </div>
      </div>

      {/* ========================================================
          CONTROLS MODAL
          ======================================================== */}
      {showControlsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
          <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 to-black border-2 border-yellow-500/70 rounded-2xl p-6 shadow-2xl text-left">
            <div className="flex items-center justify-between border-b border-yellow-500/30 pb-3 mb-4">
              <h3 className="font-blackops text-2xl text-yellow-400 tracking-wider">
                HOW TO PLAY & CONTROLS
              </h3>
              <button
                onClick={() => setShowControlsModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 font-rajdhani text-sm text-slate-300 max-h-[60vh] overflow-y-auto">
              <div className="flex items-center justify-between bg-black/50 p-2 rounded border border-slate-800">
                <span>Move (Forward / Back / Strafe)</span>
                <kbd className="bg-slate-800 px-2 py-0.5 rounded text-yellow-400 font-mono">W A S D / Touch Stick</kbd>
              </div>

              <div className="flex items-center justify-between bg-black/50 p-2 rounded border border-slate-800">
                <span>Aim & Camera Look</span>
                <kbd className="bg-slate-800 px-2 py-0.5 rounded text-yellow-400 font-mono">Mouse Move / Swipe</kbd>
              </div>

              <div className="flex items-center justify-between bg-black/50 p-2 rounded border border-slate-800">
                <span>Shoot / Primary Fire</span>
                <kbd className="bg-slate-800 px-2 py-0.5 rounded text-yellow-400 font-mono">Left Click / FIRE Button</kbd>
              </div>

              <div className="flex items-center justify-between bg-black/50 p-2 rounded border border-slate-800">
                <span>Scope ADS Zoom (AWM / AR)</span>
                <kbd className="bg-slate-800 px-2 py-0.5 rounded text-yellow-400 font-mono">Right Click / SCOPE Button</kbd>
              </div>

              <div className="flex items-center justify-between bg-black/50 p-2 rounded border border-slate-800">
                <span>Deploy Gloo Wall Barrier</span>
                <kbd className="bg-slate-800 px-2 py-0.5 rounded text-cyan-300 font-mono">G Key / GLOO WALL Button</kbd>
              </div>

              <div className="flex items-center justify-between bg-black/50 p-2 rounded border border-slate-800">
                <span>Character Skill (Alok / Chrono)</span>
                <kbd className="bg-slate-800 px-2 py-0.5 rounded text-yellow-400 font-mono">E Key / Skill Button</kbd>
              </div>

              <div className="flex items-center justify-between bg-black/50 p-2 rounded border border-slate-800">
                <span>Emote Wheel (LOL, Tea, Pushup)</span>
                <kbd className="bg-slate-800 px-2 py-0.5 rounded text-yellow-400 font-mono">B Key / EMOTE Button</kbd>
              </div>

              <div className="flex items-center justify-between bg-black/50 p-2 rounded border border-slate-800">
                <span>Use Medkit (Heals 75 HP)</span>
                <kbd className="bg-slate-800 px-2 py-0.5 rounded text-emerald-400 font-mono">H Key / MEDKIT Button</kbd>
              </div>

              <div className="flex items-center justify-between bg-black/50 p-2 rounded border border-slate-800">
                <span>Reload Weapon</span>
                <kbd className="bg-slate-800 px-2 py-0.5 rounded text-yellow-400 font-mono">R Key / RELOAD Button</kbd>
              </div>

              <div className="flex items-center justify-between bg-black/50 p-2 rounded border border-slate-800">
                <span>Switch Weapons (MP40, M1887, AK47, AWM, Deagle)</span>
                <kbd className="bg-slate-800 px-2 py-0.5 rounded text-yellow-400 font-mono">1, 2, 3, 4, 5 / Weapon Cards</kbd>
              </div>
            </div>

            <button
              onClick={() => setShowControlsModal(false)}
              className="w-full mt-5 py-2.5 rounded-xl bg-yellow-500 text-black font-teko text-2xl font-bold tracking-wider hover:bg-yellow-400 transition"
            >
              GOT IT!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
