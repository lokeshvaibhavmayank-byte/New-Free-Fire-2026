/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { CHARACTERS } from './game/characters';
import { OUTFIT_BUNDLES } from './game/outfits';
import {
  CharacterDef,
  DamageNumber,
  GameMode,
  KillFeedItem,
  MatchStats,
  OutfitBundle,
  PlayerState,
  SafeZoneState,
} from './types/game';
import { GameEngine } from './game/engine';
import { Lobby } from './components/Lobby';
import { GameHUD } from './components/GameHUD';
import { BooyahModal } from './components/BooyahModal';
import { CharacterSelect } from './components/CharacterSelect';
import { Armory } from './components/Armory';
import { Vault } from './components/Vault';
import { EmoteWheel } from './components/EmoteWheel';
import { AndroidDownloadModal } from './components/AndroidDownloadModal';
import { sounds } from './game/audio';

export default function App() {
  const [gameState, setGameState] = useState<'LOBBY' | 'PLAYING' | 'MATCH_OVER'>('LOBBY');
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterDef>(CHARACTERS[0]); // DJ Alok
  const [selectedOutfit, setSelectedOutfit] = useState<OutfitBundle>(OUTFIT_BUNDLES[0]); // Hip Hop Bundle
  const [selectedMode, setSelectedMode] = useState<GameMode>('bermuda');

  // Modals State
  const [showCharacterSelect, setShowCharacterSelect] = useState(false);
  const [showArmory, setShowArmory] = useState(false);
  const [showVault, setShowVault] = useState(false);
  const [showEmoteWheel, setShowEmoteWheel] = useState(false);
  const [showAndroidInstall, setShowAndroidInstall] = useState(false);

  // In-Game Live State
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [playerState, setPlayerState] = useState<PlayerState | null>(null);
  const [aliveCount, setAliveCount] = useState<number>(25);
  const [safeZoneState, setSafeZoneState] = useState<SafeZoneState | null>(null);
  const [killFeed, setKillFeed] = useState<KillFeedItem[]>([]);
  const [damageNumbers, setDamageNumbers] = useState<DamageNumber[]>([]);
  const [isTargetingEnemy, setIsTargetingEnemy] = useState<boolean>(false);
  const [finalStats, setFinalStats] = useState<MatchStats | null>(null);

  // Initialize Game Engine when entering PLAYING state
  useEffect(() => {
    if (gameState === 'PLAYING' && gameContainerRef.current) {
      setKillFeed([]);
      setDamageNumbers([]);

      const engine = new GameEngine(
        gameContainerRef.current,
        selectedCharacter.id,
        selectedOutfit.id,
        selectedMode,
        {
          onStateUpdate: (player, alive, safeZone) => {
            setPlayerState({ ...player });
            setAliveCount(alive);
            setSafeZoneState({ ...safeZone });
          },
          onKillFeed: item => {
            setKillFeed(prev => [...prev.slice(-4), item]);
          },
          onDamageNumber: num => {
            setDamageNumbers(prev => [...prev.slice(-5), num]);
            setTimeout(() => {
              setDamageNumbers(prev => prev.filter(d => d.id !== num.id));
            }, 1000);
          },
          onCrosshairTarget: isTargeting => {
            setIsTargetingEnemy(isTargeting);
          },
          onToggleEmoteWheel: () => {
            setShowEmoteWheel(prev => !prev);
          },
          onGameOver: stats => {
            setFinalStats(stats);
            setGameState('MATCH_OVER');
          },
        }
      );

      engineRef.current = engine;
      engine.start();

      return () => {
        engine.dispose();
        engineRef.current = null;
      };
    }
  }, [gameState, selectedCharacter, selectedOutfit, selectedMode]);

  const handleStartMatch = (mode: GameMode) => {
    setSelectedMode(mode);
    setGameState('PLAYING');
  };

  const handleExitMatch = () => {
    if (engineRef.current) {
      engineRef.current.dispose();
      engineRef.current = null;
    }
    setGameState('LOBBY');
  };

  const handlePlayAgain = () => {
    setGameState('PLAYING');
  };

  const handleReturnLobby = () => {
    setGameState('LOBBY');
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black font-rajdhani select-none">
      {/* 1. LOBBY VIEW */}
      {gameState === 'LOBBY' && (
        <Lobby
          selectedCharacter={selectedCharacter}
          selectedOutfit={selectedOutfit}
          onStartMatch={handleStartMatch}
          onOpenCharacterSelect={() => setShowCharacterSelect(true)}
          onOpenVault={() => setShowVault(true)}
          onOpenArmory={() => setShowArmory(true)}
          onOpenEmoteWheel={() => setShowEmoteWheel(true)}
          onOpenAndroidInstall={() => setShowAndroidInstall(true)}
        />
      )}

      {/* 2. ACTIVE 3D MATCH VIEW */}
      {gameState === 'PLAYING' && (
        <div className="relative w-full h-full">
          {/* 3D WebGL Canvas */}
          <div ref={gameContainerRef} className="absolute inset-0 w-full h-full cursor-crosshair" />

          {/* HUD Overlay */}
          {playerState && safeZoneState && (
            <GameHUD
              player={playerState}
              character={selectedCharacter}
              aliveCount={aliveCount}
              safeZone={safeZoneState}
              killFeed={killFeed}
              damageNumbers={damageNumbers}
              isTargetingEnemy={isTargetingEnemy}
              onFire={() => engineRef.current?.fireWeapon()}
              onJump={() => engineRef.current?.jump()}
              onCrouch={() => {
                if (engineRef.current) {
                  engineRef.current.player.isCrouching = !engineRef.current.player.isCrouching;
                }
              }}
              onReload={() => engineRef.current?.reload()}
              onDeployGlooWall={() => engineRef.current?.deployGlooWall()}
              onTriggerSkill={() => engineRef.current?.triggerCharacterSkill()}
              onUseMedkit={() => engineRef.current?.useMedkit()}
              onSelectWeapon={idx => engineRef.current?.selectWeapon(idx)}
              onToggleAim={() => {
                if (engineRef.current) {
                  engineRef.current.player.isAiming = !engineRef.current.player.isAiming;
                }
              }}
              onVirtualStickMove={(x, y) => {
                if (engineRef.current) {
                  engineRef.current.virtualStick = { x, y };
                }
              }}
              onVirtualLookMove={(yawDelta, pitchDelta) => {
                if (engineRef.current) {
                  engineRef.current.mouseLook.yaw -= yawDelta;
                  engineRef.current.mouseLook.pitch -= pitchDelta;
                  engineRef.current.mouseLook.pitch = Math.max(
                    -0.6,
                    Math.min(0.8, engineRef.current.mouseLook.pitch)
                  );
                }
              }}
              onRequestPointerLock={() => {
                engineRef.current?.requestPointerLock();
              }}
              onExitMatch={handleExitMatch}
              onOpenEmoteWheel={() => setShowEmoteWheel(true)}
            />
          )}
        </div>
      )}

      {/* 3. EMOTE WHEEL MODAL */}
      {showEmoteWheel && (
        <EmoteWheel
          onSelectEmote={emote => {
            if (engineRef.current) {
              engineRef.current.playEmote(emote.id);
            } else {
              sounds.playEmoteSound(emote.sound);
            }
            setShowEmoteWheel(false);
          }}
          onClose={() => setShowEmoteWheel(false)}
        />
      )}

      {/* 4. MATCH OVER / BOOYAH MODAL */}
      {gameState === 'MATCH_OVER' && finalStats && (
        <BooyahModal
          stats={finalStats}
          onPlayAgain={handlePlayAgain}
          onLobby={handleReturnLobby}
        />
      )}

      {/* 5. CHARACTER SELECT MODAL */}
      {showCharacterSelect && (
        <CharacterSelect
          selectedCharacterId={selectedCharacter.id}
          onSelectCharacter={char => {
            setSelectedCharacter(char);
            setShowCharacterSelect(false);
          }}
          onClose={() => setShowCharacterSelect(false)}
        />
      )}

      {/* 6. WEAPON ARMORY MODAL */}
      {showArmory && (
        <Armory onClose={() => setShowArmory(false)} />
      )}

      {/* 7. VAULT / OUTFIT COLLECTION MODAL */}
      {showVault && (
        <Vault
          currentOutfitId={selectedOutfit.id}
          onSelectOutfit={outfit => {
            setSelectedOutfit(outfit);
            setShowVault(false);
          }}
          onClose={() => setShowVault(false)}
        />
      )}

      {/* 8. ANDROID & PLAY STORE DOWNLOAD GUIDE MODAL */}
      {showAndroidInstall && (
        <AndroidDownloadModal onClose={() => setShowAndroidInstall(false)} />
      )}
    </div>
  );
}
