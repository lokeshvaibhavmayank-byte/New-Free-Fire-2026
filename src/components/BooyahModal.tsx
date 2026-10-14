import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { MatchStats } from '../types/game';
import { Trophy, Skull, Crosshair, Clock, Award, RotateCcw, Home } from 'lucide-react';
import { sounds } from '../game/audio';

interface BooyahModalProps {
  stats: MatchStats;
  onPlayAgain: () => void;
  onLobby: () => void;
}

export const BooyahModal: React.FC<BooyahModalProps> = ({ stats, onPlayAgain, onLobby }) => {
  useEffect(() => {
    if (stats.booyah) {
      // Fire Free Fire golden victory confetti bursts
      const duration = 3000;
      const animationEnd = Date.now() + duration;

      const interval: any = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) {
          return clearInterval(interval);
        }
        confetti({
          particleCount: 50,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#eab308', '#f59e0b', '#ef4444', '#10b981', '#3b82f6'],
        });
      }, 350);

      return () => clearInterval(interval);
    }
  }, [stats.booyah]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}m ${s}s`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 via-slate-950 to-black border-2 border-yellow-500/70 rounded-2xl p-6 sm:p-8 shadow-[0_0_50px_rgba(234,179,8,0.35)] flex flex-col items-center text-center overflow-hidden">
        {/* Background glow streaks */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-32 bg-yellow-500/20 blur-3xl pointer-events-none" />

        {/* Header Title (BOOYAH or DEFEAT) */}
        {stats.booyah ? (
          <div className="flex flex-col items-center mb-6">
            <div className="flex items-center gap-2 text-yellow-400 animate-bounce">
              <Trophy className="w-10 h-10 text-yellow-400 fill-yellow-400" />
            </div>
            <h1 className="font-blackops text-6xl sm:text-7xl tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-amber-400 to-yellow-600 drop-shadow-[0_4px_10px_rgba(234,179,8,0.8)]">
              BOOYAH!
            </h1>
            <span className="font-teko text-2xl text-yellow-300 tracking-wider -mt-2">
              #1 / {stats.totalPlayers} • BERMUDA CHAMPION
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center mb-6">
            <h1 className="font-blackops text-5xl sm:text-6xl tracking-wider text-rose-500 drop-shadow-[0_4px_10px_rgba(239,68,68,0.6)]">
              DEFEAT
            </h1>
            <span className="font-teko text-2xl text-slate-300 tracking-wider">
              RANK #{stats.position} / {stats.totalPlayers}
            </span>
          </div>
        )}

        {/* Rank Points Earned Card */}
        <div className="w-full bg-slate-900/90 border border-yellow-500/40 rounded-xl p-3.5 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-tr from-amber-600 to-yellow-400 flex items-center justify-center shadow-lg">
              <Award className="w-7 h-7 text-black stroke-[2.5]" />
            </div>
            <div className="text-left">
              <div className="font-teko text-xl text-yellow-400 leading-none">HEROIC TIER ★★★★</div>
              <div className="text-xs text-slate-400 font-rajdhani">Rank Score Rating</div>
            </div>
          </div>
          <div className="font-blackops text-2xl text-emerald-400">
            +{stats.rankPointsGained} PTS
          </div>
        </div>

        {/* Combat Stats Grid */}
        <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
          <div className="bg-black/60 border border-slate-800 rounded-lg p-2.5 flex flex-col items-center">
            <Skull className="w-5 h-5 text-red-400 mb-1" />
            <span className="text-xs text-slate-400 font-rajdhani">KILLS</span>
            <span className="font-teko text-3xl text-white font-bold">{stats.kills}</span>
          </div>

          <div className="bg-black/60 border border-slate-800 rounded-lg p-2.5 flex flex-col items-center">
            <Crosshair className="w-5 h-5 text-yellow-400 mb-1" />
            <span className="text-xs text-slate-400 font-rajdhani">HEADSHOTS</span>
            <span className="font-teko text-3xl text-white font-bold">{stats.headshots}</span>
          </div>

          <div className="bg-black/60 border border-slate-800 rounded-lg p-2.5 flex flex-col items-center">
            <Trophy className="w-5 h-5 text-amber-400 mb-1" />
            <span className="text-xs text-slate-400 font-rajdhani">DAMAGE</span>
            <span className="font-teko text-3xl text-white font-bold">{stats.damageDealt}</span>
          </div>

          <div className="bg-black/60 border border-slate-800 rounded-lg p-2.5 flex flex-col items-center">
            <Clock className="w-5 h-5 text-cyan-400 mb-1" />
            <span className="text-xs text-slate-400 font-rajdhani">SURVIVED</span>
            <span className="font-teko text-3xl text-white font-bold">{formatTime(stats.survivalTimeSeconds)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex items-center gap-3">
          <button
            onClick={() => {
              sounds.playClick();
              onLobby();
            }}
            className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-teko text-2xl tracking-wider border border-slate-600 flex items-center justify-center gap-2 active:scale-95 transition"
          >
            <Home className="w-5 h-5" />
            LOBBY
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              onPlayAgain();
            }}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 hover:from-yellow-400 hover:to-amber-500 text-black font-teko text-2xl font-bold tracking-wider border-2 border-yellow-300 shadow-xl flex items-center justify-center gap-2 active:scale-95 transition ff-glow-yellow"
          >
            <RotateCcw className="w-5 h-5 stroke-[2.5]" />
            PLAY AGAIN
          </button>
        </div>
      </div>
    </div>
  );
};
