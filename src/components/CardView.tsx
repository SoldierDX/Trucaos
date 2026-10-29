/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Card } from '../types/game';
import { getCardViewBox } from '../data/cards';
import { Crown } from 'lucide-react';

interface CardViewProps {
  card: Card;
  onClick?: () => void;
  onHover?: () => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
  interactive?: boolean;
}

export const CardView: React.FC<CardViewProps> = ({
  card,
  onClick,
  onHover,
  size = 'md',
  showLabel = true,
  interactive = true,
}) => {
  const viewBox = getCardViewBox(card.spriteRow, card.spriteCol);

  // Card dimensions matching ~101:154 aspect ratio
  const sizeClasses = {
    sm: 'w-24 h-36',
    md: 'w-32 h-48 sm:w-36 sm:h-54',
    lg: 'w-44 h-66 sm:w-48 sm:h-72',
    xl: 'w-56 h-84 sm:w-64 sm:h-96',
  }[size];

  const suitColor = {
    PAUS: 'text-purple-400',
    COPAS: 'text-rose-400',
    ESPADAS: 'text-blue-400',
    OUROS: 'text-amber-400',
  }[card.suit];

  const suitBorder = {
    PAUS: 'border-purple-600/60',
    COPAS: 'border-rose-600/60',
    ESPADAS: 'border-blue-600/60',
    OUROS: 'border-amber-600/60',
  }[card.suit];

  return (
    <div className="flex flex-col items-center gap-1.5 group">
      <button
        type="button"
        onClick={onClick}
        onMouseEnter={onHover}
        disabled={!interactive}
        aria-label={`${card.name} - ${card.isManilha ? card.manilhaTitle : card.trucoPower}`}
        className={`relative ${sizeClasses} rounded-xl overflow-hidden transition-all duration-300 transform select-none ${
          interactive
            ? 'cursor-pointer hover:scale-105 hover:-translate-y-1.5 focus:outline-hidden focus:ring-2 focus:ring-purple-400'
            : 'cursor-default'
        } ${
          card.isManilha
            ? 'border-2 border-purple-400 shadow-[0_0_22px_rgba(168,85,247,0.7)] hover:shadow-[0_0_35px_rgba(192,132,252,0.95)]'
            : `border ${suitBorder} shadow-[0_4px_16px_rgba(0,0,0,0.7)] hover:border-purple-400/80`
        }`}
      >
        {/* Crisp vector-clipped Card Sprite */}
        <svg
          viewBox={viewBox}
          className="w-full h-full block bg-[#0a0214]"
          preserveAspectRatio="none"
        >
          <image
            href="/assets/aistudio/Creating_card_deck_on_white_ac77fcc1_c933e546.jpg"
            width="768"
            height="1376"
          />
        </svg>

        {/* Subtle Ambient Vignette & Inner Edge Shade */}
        <div className="absolute inset-0 bg-radial from-transparent via-transparent to-black/35 pointer-events-none" />

        {/* Top-Right Badge for Manilhas */}
        {card.isManilha && (
          <div className="absolute top-1.5 right-1.5 flex items-center gap-0.5 rounded-full bg-purple-950/90 border border-purple-400/80 px-1.5 py-0.5 text-[9px] font-mono font-bold text-purple-200 shadow-md backdrop-blur-xs pointer-events-none">
            <Crown className="w-2.5 h-2.5 text-amber-300" />
            <span>M#{card.manilhaRank}</span>
          </div>
        )}

        {/* Bottom Banner for Manilhas */}
        {card.isManilha && (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-purple-950/95 via-purple-900/60 to-transparent p-1.5 pt-4 text-center pointer-events-none">
            <span className="block text-[10px] font-mono font-black tracking-widest text-purple-200 uppercase drop-shadow-[0_0_6px_#a855f7]">
              {card.manilhaRank === 1 ? '⚡ O ZAP' : card.name}
            </span>
          </div>
        )}

        {/* Interactive hover sweep */}
        {interactive && (
          <div className="absolute inset-0 bg-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        )}
      </button>

      {/* Label under card */}
      {showLabel && (
        <div className="w-full text-center px-1">
          <div className="flex items-center justify-center gap-1">
            <span className={`text-xs font-bold ${suitColor}`}>{card.suitSymbol}</span>
            <span className="text-xs font-semibold text-slate-200 truncate max-w-[110px]">
              {card.name}
            </span>
          </div>
          <span className="block text-[10px] font-mono text-purple-400/80 truncate">
            {card.isManilha ? (
              <span className="text-purple-300 font-bold">MANILHA SUPREMA</span>
            ) : (
              card.trucoPower
            )}
          </span>
        </div>
      )}
    </div>
  );
};
