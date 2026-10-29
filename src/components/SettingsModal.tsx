/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GameSettings } from '../types/game';
import { X, Tv, Volume2, Sliders, Globe } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  settings,
  onUpdateSettings,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative z-10 w-full max-w-md rounded-2xl border-2 border-purple-500/60 bg-[#0c041a] p-6 shadow-[0_0_50px_rgba(168,85,247,0.5)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-purple-900/60 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-purple-400" />
            <h2
              id="settings-modal-title"
              className="text-xl font-mono font-bold text-white tracking-wider"
            >
              OPÇÕES DO SISTEMA
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar opções"
            className="rounded-lg border border-purple-800 bg-purple-950/60 p-1.5 text-slate-400 transition-colors hover:border-purple-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Options controls */}
        <div className="mt-5 space-y-4 font-mono text-xs text-slate-200">
          {/* CRT Scanline Filter */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-purple-900/40 bg-purple-950/30">
            <div className="flex items-center gap-2.5">
              <Tv className="w-4 h-4 text-purple-400" />
              <div>
                <span className="font-bold block">Filtro Retrô CRT Scanlines</span>
                <span className="text-[11px] text-slate-400">Emula linhas de varredura arcade</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onUpdateSettings({ crtEnabled: !settings.crtEnabled })}
              className={`px-3 py-1.5 rounded font-bold transition-all ${
                settings.crtEnabled
                  ? 'bg-purple-600 text-white shadow-[0_0_12px_#a855f7]'
                  : 'bg-black/60 text-slate-400 border border-purple-900'
              }`}
            >
              {settings.crtEnabled ? 'LIGADO' : 'DESLIGADO'}
            </button>
          </div>

          {/* Sound FX */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-purple-900/40 bg-purple-950/30">
            <div className="flex items-center gap-2.5">
              <Volume2 className="w-4 h-4 text-purple-400" />
              <div>
                <span className="font-bold block">Efeitos Sonoros & BGM</span>
                <span className="text-[11px] text-slate-400">Síntese de áudio Web Audio</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onUpdateSettings({ audioMuted: !settings.audioMuted })}
              className={`px-3 py-1.5 rounded font-bold transition-all ${
                !settings.audioMuted
                  ? 'bg-purple-600 text-white shadow-[0_0_12px_#a855f7]'
                  : 'bg-black/60 text-slate-400 border border-purple-900'
              }`}
            >
              {!settings.audioMuted ? 'ATIVO' : 'MUTADO'}
            </button>
          </div>

          {/* Shader Speed */}
          <div className="p-3 rounded-lg border border-purple-900/40 bg-purple-950/30">
            <span className="font-bold block mb-2">Velocidade dos Shaders de Aura</span>
            <div className="grid grid-cols-3 gap-2">
              {(['LENTO', 'NORMAL', 'RÁPIDO'] as const).map((spd) => (
                <button
                  key={spd}
                  type="button"
                  onClick={() => onUpdateSettings({ shaderSpeed: spd })}
                  className={`py-1.5 rounded text-center font-bold text-[11px] transition-all ${
                    settings.shaderSpeed === spd
                      ? 'bg-purple-600 text-white shadow-[0_0_10px_#a855f7]'
                      : 'bg-black/40 text-slate-400 border border-purple-900/60 hover:text-white'
                  }`}
                >
                  {spd}
                </button>
              ))}
            </div>
          </div>

          {/* Language */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-purple-900/40 bg-purple-950/30">
            <div className="flex items-center gap-2.5">
              <Globe className="w-4 h-4 text-purple-400" />
              <div>
                <span className="font-bold block">Idioma do Baralho</span>
                <span className="text-[11px] text-slate-400">Terminologia e gírias de truco</span>
              </div>
            </div>
            <span className="font-bold text-purple-300">Português (Brasil)</span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-purple-900/40 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono font-bold tracking-wider transition-colors shadow-[0_0_15px_rgba(168,85,247,0.4)]"
          >
            CONFIRMAR
          </button>
        </div>
      </div>
    </div>
  );
};
