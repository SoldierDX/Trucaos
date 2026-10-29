/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { X, Flame, ShieldAlert, Award, Swords } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        onClose();
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="rules-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border-2 border-purple-500/60 bg-[#0c041a] p-6 sm:p-8 shadow-[0_0_60px_rgba(168,85,247,0.5)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-purple-900/60 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-purple-400">
              <Swords className="w-4 h-4 text-purple-400" />
              <span>GRIMÓRIO DE REGRAS // COMPÊNDIO OFICIAL</span>
            </div>
            <h2
              id="rules-modal-title"
              className="text-2xl sm:text-3xl font-serif font-black text-white tracking-wide mt-1"
            >
              Regras do Truco Paulista
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar regras"
            className="rounded-lg border border-purple-800 bg-purple-950/60 p-2 text-slate-400 transition-colors hover:border-purple-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body content */}
        <div className="mt-6 space-y-6 text-sm text-slate-300">
          {/* Manilhas Fixas */}
          <section className="rounded-xl border border-purple-800/50 bg-purple-950/30 p-4">
            <h3 className="flex items-center gap-2 text-base font-mono font-bold text-purple-200 mb-2">
              <Flame className="w-5 h-5 text-amber-400" />
              1. As Quatro Manilhas Fixas (Imutáveis)
            </h3>
            <p className="text-xs text-slate-300 mb-3">
              No Truco Paulista, as manilhas são eternamente fixas e representam o cume do poder da mesa:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-xs">
              <div className="p-2.5 rounded bg-black/40 border border-purple-600/40 flex items-center justify-between">
                <div>
                  <span className="font-bold text-purple-300">1º ZAP ♣ (4 de Paus)</span>
                  <p className="text-[11px] text-slate-400">A Manilha Suprema. Nenhuma carta o derrota.</p>
                </div>
                <span className="text-xl text-purple-400">♣</span>
              </div>
              <div className="p-2.5 rounded bg-black/40 border border-rose-600/40 flex items-center justify-between">
                <div>
                  <span className="font-bold text-rose-300">2º 7 DE COPAS ♥</span>
                  <p className="text-[11px] text-slate-400">O Altar Rubro. Vence todas menos o Zap.</p>
                </div>
                <span className="text-xl text-rose-400">♥</span>
              </div>
              <div className="p-2.5 rounded bg-black/40 border border-blue-600/40 flex items-center justify-between">
                <div>
                  <span className="font-bold text-blue-300">3º ESPADILHA ♠ (Ás de Espadas)</span>
                  <p className="text-[11px] text-slate-400">A lâmina etérea que rasga o feltro.</p>
                </div>
                <span className="text-xl text-blue-400">♠</span>
              </div>
              <div className="p-2.5 rounded bg-black/40 border border-amber-600/40 flex items-center justify-between">
                <div>
                  <span className="font-bold text-amber-300">4º PICA-FUMO ♦ (7 de Ouros)</span>
                  <p className="text-[11px] text-slate-400">O diamante místico. Vence todos os 3s.</p>
                </div>
                <span className="text-xl text-amber-400">♦</span>
              </div>
            </div>
          </section>

          {/* Hierarquia Comum */}
          <section className="rounded-xl border border-purple-900/40 bg-black/30 p-4">
            <h3 className="flex items-center gap-2 text-base font-mono font-bold text-purple-200 mb-2">
              <Award className="w-5 h-5 text-purple-400" />
              2. Hierarquia das Cartas Naturais (Comuns)
            </h3>
            <p className="text-xs text-slate-300 mb-2">
              Quando não houver manilha na jogada, a ordem decrescente de poder absoluto é:
            </p>
            <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs font-bold text-slate-200 bg-purple-950/40 p-3 rounded-lg border border-purple-800/30">
              <span className="text-purple-300 text-sm">3 (Maior)</span>
              <span className="text-purple-500">&gt;</span>
              <span>2</span>
              <span className="text-purple-500">&gt;</span>
              <span>Ás</span>
              <span className="text-purple-500">&gt;</span>
              <span>Rei (K)</span>
              <span className="text-purple-500">&gt;</span>
              <span>Valete (J)</span>
              <span className="text-purple-500">&gt;</span>
              <span>Dama (Q)</span>
              <span className="text-purple-500">&gt;</span>
              <span>7</span>
              <span className="text-purple-500">&gt;</span>
              <span>6</span>
              <span className="text-purple-500">&gt;</span>
              <span>5</span>
              <span className="text-purple-500">&gt;</span>
              <span className="text-slate-500">4 (Menor)</span>
            </div>
          </section>

          {/* Dinâmica de Pontos e Truco */}
          <section className="rounded-xl border border-purple-900/40 bg-black/30 p-4">
            <h3 className="flex items-center gap-2 text-base font-mono font-bold text-purple-200 mb-2">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              3. O Grito de Truco & Tentos
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs text-center">
              <div className="p-2 rounded bg-purple-950/50 border border-purple-800/40">
                <span className="block text-slate-400">RODADA BASE</span>
                <span className="text-lg font-bold text-white">1 PONTO</span>
              </div>
              <div className="p-2 rounded bg-purple-950/50 border border-purple-800/40">
                <span className="block text-purple-300 font-bold">TRUCO!</span>
                <span className="text-lg font-bold text-purple-300">3 PONTOS</span>
              </div>
              <div className="p-2 rounded bg-purple-950/50 border border-purple-800/40">
                <span className="block text-rose-300 font-bold">SEIS!</span>
                <span className="text-lg font-bold text-rose-300">6 PONTOS</span>
              </div>
              <div className="p-2 rounded bg-purple-950/50 border border-purple-800/40">
                <span className="block text-amber-300 font-bold">DOZE!</span>
                <span className="text-lg font-bold text-amber-300">12 PONTOS</span>
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-400 leading-relaxed">
              Vence a partida a dupla que somar primeiro <strong>12 tentos</strong>. Na lendária <em>Mão de Onze (11x11)</em>, os jogadores podem espiar as cartas do parceiro antes de decidir se aceitam a queda!
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-purple-900/40 flex items-center justify-between">
          <span className="text-xs font-mono text-purple-400">
            Pressione [TAB] ou [ESC] para retornar
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono font-bold tracking-wider transition-colors"
          >
            ENTENDI AS REGRAS
          </button>
        </div>
      </div>
    </div>
  );
};
