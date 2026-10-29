/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Settings, Tv, Volume2, VolumeX, BookOpen } from 'lucide-react';
import { GameSettings } from '../types/game';

interface HeaderBarProps {
  settings: GameSettings;
  onToggleCrt: () => void;
  onToggleAudio: () => void;
  onOpenSettings: () => void;
  onOpenRules: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  settings,
  onToggleCrt,
  onToggleAudio,
  onOpenSettings,
  onOpenRules,
}) => {
  return (
    <header className="relative z-30 w-full border-b border-purple-900/40 bg-[#07010f]/90 backdrop-blur-md px-4 py-2 sm:px-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 text-xs font-mono tracking-wider">
        {/* Left Zone: Build ID and Mode Tag */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1 text-purple-400">
            <span className="inline-block h-2 w-2 rounded-xs bg-purple-500 shadow-[0_0_8px_#a855f7]" />
            <span className="font-semibold text-slate-300">BUILD v0.8.4</span>
            <span className="text-purple-600">//</span>
            <span className="hidden text-purple-300 md:inline">DECK-BUILDER DEMO</span>
          </div>

          <div className="rounded border border-purple-600/50 bg-purple-950/40 px-2 py-0.5 text-[11px] font-bold text-purple-200">
            TRUCAOS: BARALHO PAULISTA
          </div>
        </div>

        {/* Right Zone: Edition, CRT Status, Settings */}
        <div className="flex items-center gap-2 sm:gap-4 text-slate-400">
          <span className="hidden text-purple-300 lg:inline">EDIÇÃO MÍSTICA</span>
          <span className="hidden text-purple-600 lg:inline">•</span>
          <span className="hidden text-cyan-400 sm:inline text-[11px] font-medium tracking-widest">DEMO EXPERIMENTAL</span>
          <span className="hidden text-purple-600 sm:inline">•</span>

          {/* Rules Button */}
          <button
            onClick={onOpenRules}
            className="flex items-center gap-1.5 rounded border border-purple-800/60 bg-purple-950/30 px-2 py-1 text-purple-300 transition-colors hover:border-purple-400 hover:text-white"
            title="Ver Regras do Truco Paulista (TAB)"
            aria-label="Regras do Truco Paulista"
          >
            <BookOpen className="h-3.5 w-3.5 text-purple-400" />
            <span className="hidden sm:inline">REGRAS [TAB]</span>
          </button>

          {/* CRT Toggle Button */}
          <button
            onClick={onToggleCrt}
            className={`flex items-center gap-1 rounded border px-2 py-1 transition-colors ${
              settings.crtEnabled
                ? 'border-purple-500 bg-purple-900/40 text-purple-200 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                : 'border-slate-800 bg-black/40 text-slate-500 hover:text-slate-300'
            }`}
            title="Alternar Efeito CRT Scanlines"
            aria-label="Alternar Efeito CRT Scanlines"
          >
            <Tv className="h-3.5 w-3.5" />
            <span className="text-[11px]">CRT: {settings.crtEnabled ? 'ON' : 'OFF'}</span>
          </button>

          {/* Audio Quick Mute Toggle */}
          <button
            onClick={onToggleAudio}
            className="rounded border border-purple-900/50 p-1.5 text-slate-400 transition-colors hover:border-purple-400 hover:text-purple-200"
            title={settings.audioMuted ? 'Ativar Efeitos Sonoros' : 'Silenciar Áudio'}
            aria-label={settings.audioMuted ? 'Ativar Efeitos Sonoros' : 'Silenciar Áudio'}
          >
            {settings.audioMuted ? (
              <VolumeX className="h-3.5 w-3.5 text-rose-400" />
            ) : (
              <Volume2 className="h-3.5 w-3.5 text-purple-300" />
            )}
          </button>

          {/* Settings Modal Button */}
          <button
            onClick={onOpenSettings}
            className="rounded border border-purple-900/50 p-1.5 text-slate-400 transition-colors hover:border-purple-400 hover:text-purple-200"
            title="Abrir Opções"
            aria-label="Abrir Configurações"
          >
            <Settings className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
