/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Music } from 'lucide-react';
import { GameSettings } from '../types/game';

interface FooterBarProps {
  settings: GameSettings;
  onOpenRules: () => void;
  onToggleAudio: () => void;
}

export const FooterBar: React.FC<FooterBarProps> = ({
  settings,
  onOpenRules,
  onToggleAudio,
}) => {
  return (
    <footer className="relative z-30 w-full border-t border-purple-950/60 bg-[#07010f]/95 px-4 py-2.5 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 text-[11px] font-mono tracking-wider sm:flex-row">
        {/* Left: BGM track indicator */}
        <button
          onClick={onToggleAudio}
          className="flex items-center gap-2 text-purple-400/90 transition-colors hover:text-purple-200"
          title="Alternar Áudio"
        >
          <Music className="h-3.5 w-3.5 text-purple-400 animate-pulse" />
          <span>BGM: SYNTH-SAMBA DO VALE</span>
          <span className="text-[10px] text-purple-600">[{settings.audioMuted ? 'MUTADO' : 'ATIVO'}]</span>
        </button>

        {/* Center: Interactive Shortcut Hint */}
        <button
          onClick={onOpenRules}
          className="text-purple-300/80 underline decoration-purple-600/40 decoration-dotted underline-offset-4 transition-colors hover:text-purple-100 hover:decoration-purple-400"
        >
          PRESSIONE <kbd className="rounded border border-purple-700 bg-purple-950/60 px-1 py-0.5 text-[10px] text-purple-200">[TAB]</kbd> PARA VISUALIZAR REGRAS DO TRUCO PAULISTA
        </button>

        {/* Right: Controls & Studio */}
        <div className="flex items-center gap-3 text-slate-400">
          <div className="hidden items-center gap-2 md:flex">
            <span className="text-purple-400 font-semibold">[ENTER]</span>
            <span className="text-slate-400">Selecionar</span>
            <span className="text-purple-400 font-semibold">[W/S]</span>
            <span className="text-slate-400">Navegar</span>
          </div>
          <span className="text-slate-600 hidden md:inline">|</span>
          <span className="text-slate-400">© 2026 ESTÚDIO ARCANO GAMES</span>
        </div>
      </div>
    </footer>
  );
};
