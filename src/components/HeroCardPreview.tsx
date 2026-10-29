/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Card } from '../types/game';
import { getManilhas, getCardViewBox } from '../data/cards';
import { Eye, Flame } from 'lucide-react';

interface HeroCardPreviewProps {
  onCardClick: (card: Card) => void;
  onHoverSound?: () => void;
}

export const HeroCardPreview: React.FC<HeroCardPreviewProps> = ({
  onCardClick,
  onHoverSound,
}) => {
  const manilhas = getManilhas(); // Zap (0), 7 Copas (1), Espadilha (2), Pica-Fumo (3)
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const activeCard = manilhas[selectedIdx] || manilhas[0];

  const activeViewBox = getCardViewBox(activeCard.spriteRow, activeCard.spriteCol);

  // Background card peek (Espadilha or 7 Copas)
  const peekCard = manilhas[(selectedIdx + 1) % manilhas.length];
  const peekViewBox = getCardViewBox(peekCard.spriteRow, peekCard.spriteCol);

  return (
    <div className="relative flex flex-col items-center justify-center p-2 sm:p-4">
      {/* Mystical Background Aura */}
      <div className="absolute -inset-4 bg-radial from-purple-600/30 via-purple-900/10 to-transparent blur-3xl pointer-events-none" />

      {/* Interactive Card Stage with 3D feel */}
      <div className="relative w-64 h-96 sm:w-72 sm:h-108 flex items-center justify-center group perspective-1000">
        {/* Background tilted card peeking out */}
        <div
          aria-hidden="true"
          className="absolute -left-4 -top-2 w-56 h-84 sm:w-64 sm:h-96 rounded-2xl overflow-hidden border border-purple-900/50 bg-[#0d021c] opacity-45 transform -rotate-12 scale-90 transition-transform duration-500 pointer-events-none shadow-2xl"
        >
          <svg viewBox={peekViewBox} className="w-full h-full" preserveAspectRatio="none">
            <image href="/assets/aistudio/Creating_card_deck_on_white_ac77fcc1_c933e546.jpg" width="768" height="1376" />
          </svg>
        </div>

        {/* Main Hero Card */}
        <button
          type="button"
          onClick={() => onCardClick(activeCard)}
          onMouseEnter={onHoverSound}
          aria-label={`Inspecionar ${activeCard.name}`}
          className="relative z-10 w-56 h-86 sm:w-64 sm:h-98 rounded-2xl overflow-hidden border-2 border-purple-400 bg-[#090117] shadow-[0_0_40px_rgba(168,85,247,0.7),inset_0_0_20px_rgba(168,85,247,0.3)] transition-all duration-300 transform group-hover:scale-102 group-hover:-translate-y-2 cursor-pointer focus:outline-hidden focus:ring-4 focus:ring-purple-400/80"
        >
          {/* Card Sprite SVG */}
          <svg viewBox={activeViewBox} className="w-full h-full block bg-[#0a0214]" preserveAspectRatio="none">
            <image href="/assets/aistudio/Creating_card_deck_on_white_ac77fcc1_c933e546.jpg" width="768" height="1376" />
          </svg>

          {/* Vignette and Inner Glow */}
          <div className="absolute inset-0 bg-radial from-transparent via-transparent to-black/40 pointer-events-none" />

          {/* Top Badge: Rank & Flame */}
          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-1 rounded-full bg-black/75 border border-purple-400/70 px-2.5 py-0.5 text-[10px] font-mono font-bold text-purple-200 backdrop-blur-xs">
              <Flame className="w-3 h-3 text-purple-400 fill-purple-400 animate-pulse" />
              <span>MANILHA #{activeCard.manilhaRank}</span>
            </div>
            <div className="flex items-center gap-1 rounded-full bg-purple-950/80 border border-purple-500/50 px-2 py-0.5 text-[10px] font-mono text-purple-300">
              <Eye className="w-3 h-3" />
              <span>DETALHES</span>
            </div>
          </div>

          {/* Bottom Card Title Banner matching reference image */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-purple-950/95 to-transparent p-3 pt-6 text-center border-t border-purple-500/30">
            <div className="flex items-center justify-center gap-1.5 text-xs font-mono font-bold text-purple-200 tracking-wider">
              <span className="inline-block w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_8px_#a855f7]" />
              <span>{activeCard.name.toUpperCase()}</span>
            </div>
            <div className="text-[11px] font-mono text-purple-300/80 tracking-widest mt-0.5">
              {activeCard.manilhaTitle} • {activeCard.value} DE {activeCard.suit}
            </div>
          </div>

          {/* Hover sweep */}
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 via-transparent to-purple-400/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </button>
      </div>

      {/* Manilhas Order Ribbon matching reference */}
      <div className="mt-4 w-full max-w-sm rounded-lg border border-purple-800/40 bg-purple-950/40 p-2 backdrop-blur-xs text-center">
        <div className="text-[10px] font-mono tracking-widest text-purple-400 mb-1 flex items-center justify-center gap-1">
          <span className="text-purple-400">⬥ ⬥ ⬥ ⬥</span>
          <span className="font-bold text-slate-200">ORDEM DAS MANILHAS FIXAS</span>
          <span className="text-purple-400">⬥ ⬥ ⬥ ⬥</span>
        </div>

        {/* Clickable selector between the 4 Manilhas */}
        <div className="flex items-center justify-center gap-1 text-[11px] font-mono">
          {manilhas.map((m, idx) => (
            <React.Fragment key={m.id}>
              <button
                type="button"
                onClick={() => setSelectedIdx(idx)}
                className={`px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                  selectedIdx === idx
                    ? 'bg-purple-600 text-white font-bold shadow-[0_0_10px_#a855f7]'
                    : 'text-purple-300 hover:text-white hover:bg-purple-900/50'
                }`}
                title={`Visualizar ${m.name}`}
              >
                {idx === 0 && 'ZAP ♣'}
                {idx === 1 && '7 COPAS ♥'}
                {idx === 2 && 'ESPADILHA ♠'}
                {idx === 3 && 'PICA-FUMO ♦'}
              </button>
              {idx < manilhas.length - 1 && (
                <span className="text-purple-500 font-bold">&gt;</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};
