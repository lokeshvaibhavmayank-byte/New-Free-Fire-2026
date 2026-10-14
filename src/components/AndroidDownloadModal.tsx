import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import {
  Smartphone,
  Download,
  CheckCircle2,
  ExternalLink,
  X,
  Play,
  Layers,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { sounds } from '../game/audio';

interface AndroidDownloadModalProps {
  onClose: () => void;
}

export const AndroidDownloadModal: React.FC<AndroidDownloadModalProps> = ({ onClose }) => {
  const { isInstallable, isInstalled, install, isAndroid } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'direct_install' | 'playstore_guide'>('direct_install');

  const handleInstallClick = async () => {
    sounds.playClick();
    if (isInstallable) {
      await install();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-black border-2 border-yellow-500/80 rounded-2xl p-6 sm:p-8 shadow-[0_0_50px_rgba(234,179,8,0.35)] flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-yellow-500/30 pb-4 mb-5">
          <div className="flex items-center gap-3 text-left">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-400 flex items-center justify-center shadow-lg">
              <Smartphone className="w-7 h-7 text-black stroke-[2.5]" />
            </div>
            <div>
              <h2 className="font-blackops text-2xl sm:text-3xl text-white tracking-wider">
                ANDROID & PLAY STORE DOWNLOAD
              </h2>
              <span className="text-xs text-yellow-400 font-rajdhani font-semibold">
                100% Offline Mobile Battle Royale • Full-Screen Native Experience
              </span>
            </div>
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

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 mb-6 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('direct_install');
            }}
            className={`flex-1 py-2 rounded-lg font-teko text-xl tracking-wider transition ${
              activeTab === 'direct_install'
                ? 'bg-yellow-500 text-black font-bold shadow'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            📲 DIRECT ANDROID INSTALL
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('playstore_guide');
            }}
            className={`flex-1 py-2 rounded-lg font-teko text-xl tracking-wider transition ${
              activeTab === 'playstore_guide'
                ? 'bg-yellow-500 text-black font-bold shadow'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            🛒 GOOGLE PLAY STORE PACKAGING
          </button>
        </div>

        {/* TAB 1: DIRECT ANDROID PHONE INSTALL */}
        {activeTab === 'direct_install' && (
          <div className="flex-1 overflow-y-auto space-y-4 text-left font-rajdhani">
            <div className="bg-black/60 border border-emerald-500/40 rounded-xl p-4 flex items-center justify-between">
              <div>
                <div className="font-teko text-2xl text-emerald-400 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  ANDROID PWA NATIVE APP READY
                </div>
                <p className="text-xs text-slate-300">
                  Yeh game bina browser URL bar ke direct aapke Android phone ke Home Screen par app ban kar install ho jata hai aur offline chalta hai!
                </p>
              </div>

              {isInstalled ? (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-500 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4" /> INSTALLED
                </span>
              ) : (
                <button
                  onClick={handleInstallClick}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 text-black font-teko text-2xl font-bold tracking-wider active:scale-95 transition shadow-lg flex items-center gap-2"
                >
                  <Download className="w-5 h-5 stroke-[2.5]" />
                  INSTALL NOW
                </button>
              )}
            </div>

            {/* How to Install on Chrome / Samsung Internet Step-by-Step */}
            <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-800 space-y-3">
              <h3 className="font-teko text-xl text-yellow-400 uppercase tracking-wide">
                Agar "Install" button na dikhe toh phone pe kaise lagayein:
              </h3>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-yellow-500 text-black font-bold text-xs flex items-center justify-center shrink-0">
                  1
                </span>
                <p className="text-sm text-slate-200">
                  Android phone me Google Chrome ya Samsung Internet browser me is page ko open karein.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-yellow-500 text-black font-bold text-xs flex items-center justify-center shrink-0">
                  2
                </span>
                <p className="text-sm text-slate-200">
                  Top-right corner me <strong>3 dots (⋮)</strong> menu par tap karein.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-yellow-500 text-black font-bold text-xs flex items-center justify-center shrink-0">
                  3
                </span>
                <p className="text-sm text-slate-200">
                  <strong>"Install App"</strong> ya <strong>"Add to Home Screen"</strong> par tap karein.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-yellow-500 text-black font-bold text-xs flex items-center justify-center shrink-0">
                  4
                </span>
                <p className="text-sm text-slate-200">
                  Free Fire MAX app icon aapke phone ke app drawer me install ho jayega, jise aap bina internet ke full-screen offline khel sakte hain!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: GOOGLE PLAY STORE / APK GUIDE */}
        {activeTab === 'playstore_guide' && (
          <div className="flex-1 overflow-y-auto space-y-4 text-left font-rajdhani">
            <div className="bg-black/60 border border-yellow-500/40 rounded-xl p-4">
              <div className="font-teko text-2xl text-yellow-400 mb-1">
                GOOGLE PLAY STORE PAR APK / AAB PUBLISH KARNE KA TARIKA:
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Google ka official <strong>TWA (Trusted Web Activity)</strong> standard is PWA ko direct ek official <strong>Google Play Store .AAB / .APK</strong> package me convert karta hai.
              </p>
            </div>

            <div className="space-y-3">
              <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-teko text-lg text-white">STEP 1: PWABuilder (Official Microsoft / Google Tool)</span>
                  <a
                    href="https://www.pwabuilder.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-yellow-400 hover:underline flex items-center gap-1 font-mono"
                  >
                    pwabuilder.com <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <p className="text-xs text-slate-400">
                  PWABuilder par is game ka URL paste karein. Yeh manifest aur service worker verify karke "Package for Android" option dega.
                </p>
              </div>

              <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
                <div className="font-teko text-lg text-white mb-1">STEP 2: Download Signed Android App Bundle (.aab / .apk)</div>
                <p className="text-xs text-slate-400">
                  "Generate APK / AAB" par click karein. Aapko ready-to-publish Google Play App Bundle file mil jayegi.
                </p>
              </div>

              <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
                <div className="font-teko text-lg text-white mb-1">STEP 3: Upload to Google Play Console</div>
                <p className="text-xs text-slate-400">
                  Google Play Console me jakar "Create App" karein aur yeh `.aab` file upload kar dein. Kuch ghante me aapka Free Fire MAX game Play Store par live ho jayega aur koi bhi wahan se download kar payega!
                </p>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          className="w-full mt-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-teko text-2xl tracking-wider transition active:scale-95 border border-slate-700"
        >
          CLOSE
        </button>
      </div>
    </div>
  );
};
