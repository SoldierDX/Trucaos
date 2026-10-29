/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { Card } from '../types/game';
import { SUIT_INFO, getCardViewBox } from '../data/cards';
import { X, Crown, Shield, Sparkles, BookOpen } from 'lucide-react';

interface CardDetailModalProps {
  card: Card | null;
  onClose: () => void;
}

export const CardDetailModal: React.FC<CardDetailModalProps> = ({
  card,
  onClose,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!card) return null;

  const viewBox = getCardViewBox(card.spriteRow, card.spriteCol);
  const suitDetails = SUIT_INFO[card.suit];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="card-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      {/* Click outside to close */}
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card Surface */}
      <div className="relative z-10 w-full max-w-2xl rounded-2xl border-2 border-purple-500/60 bg-[#0c041a] p-6 shadow-[0_0_50px_rgba(168,85,247,0.5)]">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar visualização da carta"
          className="absolute top-4 right-4 rounded-lg border border-purple-800/80 bg-purple-950/60 p-2 text-slate-400 transition-colors hover:border-purple-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content Split: Card on Left, Details on Right */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Zoomed Card Visual Container */}
          <div className="shrink-0 flex flex-col items-center">
            <div
              className={`relative w-48 h-72 sm:w-56 sm:h-84 rounded-2xl overflow-hidden border-2 ${
                card.isManilha
                  ? 'border-purple-400 shadow-[0_0_35px_rgba(192,132,252,0.85)]'
                  : 'border-purple-700/60 shadow-[0_0_20px_rgba(0,0,0,0.8)]'
              }`}
            >
              <svg viewBox={viewBox} className="w-full h-full block bg-[#0a0214]" preserveAspectRatio="none">
                <image href="/assets/aistudio/Creating_card_deck_on_white_ac77fcc1_c933e546.jpg" width="768" height="1376" />
              </svg>
              <div className="absolute inset-0 bg-radial from-transparent via-transparent to-black/35 pointer-events-none" />

              {card.isManilha && (
                <div className="absolute top-2 right-2 rounded-full bg-purple-950/90 border border-purple-400 px-2 py-0.5 text-xs font-mono font-bold text-purple-200 pointer-events-none">
                  <Crown className="inline-block w-3 h-3 text-amber-300 mr-1" />
                  MANILHA #{card.manilhaRank}
                </div>
              )}
            </div>

            <span className="mt-2 text-[11px] font-mono text-purple-400/80">
              Coordenadas Sprite: R{card.spriteRow} : C{card.spriteCol}
            </span>
          </div>

          {/* Card Lore & Truco Stats */}
          <div className="flex-1 flex flex-col justify-between text-left">
            <div>
              {/* Badge & Suit */}
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl font-bold" style={{ color: suitDetails.color }}>
                  {card.suitSymbol}
                </span>
                <span className="text-xs font-mono tracking-widest text-purple-400 uppercase">
                  {suitDetails.label}
                </span>
              </div>

              {/* Title */}
              <h2
                id="card-modal-title"
                className="text-2xl sm:text-3xl font-serif font-black tracking-wide text-white drop-shadow-[0_0_12px_rgba(168,85,247,0.6)]"
              >
                {card.name}
              </h2>

              {/* Sub-Title for Manilha */}
              {card.isManilha && (
                <div className="inline-flex items-center gap-1.5 mt-1 rounded bg-purple-950/80 border border-purple-500/70 px-2.5 py-1 text-xs font-mono font-bold text-purple-200">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                  <span>{card.manilhaTitle}</span>
                </div>
              )}

              {/* Truco Strength */}
              <div className="mt-4 p-3 rounded-xl border border-purple-800/40 bg-purple-950/30">
                <div className="flex items-center justify-between text-xs font-mono text-slate-300 mb-1">
                  <span className="flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-purple-400" />
                    Hierarquia no Truco Paulista:
                  </span>
                  <span className="font-bold text-purple-300">
                    {card.trucoPower}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {card.isManilha
                    ? 'Esta carta pertence ao quarteto sagrado das manilhas fixas do Truco Paulista. Supera qualquer Três ou carta comum do baralho.'
                    : card.category === 'FIGURA'
                    ? 'Figura nobre tradicional do baralho (Valete, Dama ou Rei), respeitando a hierarquia K > J > Q.'
                    : 'Carta numérica comum de rodada, essencial na disputa das primeiras quedas e no blefe estratégico.'}
                </p>
              </div>

              {/* Lore Description */}
              <div className="mt-4">
                <h4 className="flex items-center gap-1.5 text-xs font-mono text-purple-400 uppercase tracking-wider mb-1">
                  <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                  Grimório das Sombras (Lore)
                </h4>
                <p className="text-sm text-slate-300 italic leading-relaxed bg-black/40 p-3 rounded-lg border border-purple-900/30">
                  "{card.lore}"
                </p>
              </div>

              {/* Tags */}
              <div className="mt-4 flex flex-wrap gap-1.5">
                {card.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded bg-purple-950/60 border border-purple-800/50 px-2 py-0.5 text-[11px] font-mono text-purple-300"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-6 pt-4 border-t border-purple-900/40 flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-500">
                Pressione [ESC] para retornar
              </span>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono font-bold tracking-wider transition-colors shadow-[0_0_15px_rgba(168,85,247,0.4)]"
              >
                FECHAR VISUALIZAÇÃO
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
