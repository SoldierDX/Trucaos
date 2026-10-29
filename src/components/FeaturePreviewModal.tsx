/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Sparkles, Swords, Flame, ArrowRight, BookOpen } from 'lucide-react';

interface FeaturePreviewModalProps {
  isOpen: boolean;
  title: string;
  subtitle: string;
  onNavigateToDeck: () => void;
  onClose: () => void;
}

export const FeaturePreviewModal: React.FC<FeaturePreviewModalProps> = ({
  isOpen,
  title,
  subtitle,
  onNavigateToDeck,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="preview-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative z-10 w-full max-w-lg rounded-2xl border-2 border-purple-500/70 bg-[#0c041a] p-6 sm:p-7 shadow-[0_0_60px_rgba(168,85,247,0.55)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-purple-900/60 pb-3">
          <div className="flex items-center gap-2">
            <Swords className="w-5 h-5 text-purple-400" />
            <span className="text-xs font-mono font-bold tracking-widest text-purple-300">
              FASE 1 // INTERFACE VISUAL & NAVEGAÇÃO
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar prévia"
            className="rounded-lg border border-purple-800 bg-purple-950/60 p-1.5 text-slate-400 transition-colors hover:border-purple-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="mt-4 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-purple-400/50 bg-purple-950/70 shadow-[0_0_20px_rgba(168,85,247,0.5)]">
            <Flame className="h-7 w-7 text-purple-300 animate-pulse" />
          </div>

          <h3
            id="preview-modal-title"
            className="mt-3 text-xl font-serif font-black text-white tracking-wide"
          >
            {title}
          </h3>
          <p className="mt-1 text-xs font-mono text-purple-300/80">
            {subtitle}
          </p>

          <div className="mt-5 rounded-xl border border-purple-900/40 bg-purple-950/30 p-4 text-left font-mono text-xs text-slate-300 space-y-2.5">
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <span>
                <strong>Escopo Atual (Fase 1):</strong> Menu principal, identidade visual roxa/arcana completa, galeria das 56 cartas e inspeção de detalhes.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Swords className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>Próxima Fase (Fase 2):</strong> Motor de partidas de Truco Paulista, IA dos oponentes, gritos de Truco/Seis/Doze e mecânica roguelike!
              </span>
            </div>
          </div>
        </div>

        {/* Footer buttons */}
        <div className="mt-6 pt-4 border-t border-purple-900/40 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded-lg border border-purple-800 bg-purple-950/40 hover:bg-purple-900/60 text-slate-300 text-xs font-mono font-medium transition-colors"
          >
            CONTINUAR NO MENU
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onNavigateToDeck();
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono font-bold tracking-wider transition-colors shadow-[0_0_15px_rgba(168,85,247,0.4)]"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>EXPLORAR BARALHO</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
