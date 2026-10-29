/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Card, GameSettings } from '../types/game';
import { HeroCardPreview } from '../components/HeroCardPreview';
import { Swords, Layers, Trophy, Settings, HelpCircle, LogOut, Sparkles, CornerDownLeft } from 'lucide-react';
import { playHoverSound, playClickSound } from '../utils/audio';

interface HomeScreenProps {
  settings: GameSettings;
  onNavigateToDeck: () => void;
  onNavigateToLobby: () => void;
  onOpenSettings: () => void;
  onOpenRules: () => void;
  onOpenChallengesPreview: () => void;
  onSelectCard: (card: Card) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  settings,
  onNavigateToDeck,
  onNavigateToLobby,
  onOpenSettings,
  onOpenRules,
  onOpenChallengesPreview,
  onSelectCard,
}) => {
  const [activeMenuIdx, setActiveMenuIdx] = useState<number>(0);

  const menuItems = [
    {
      id: 'play',
      label: 'JOGAR ONLINE',
      sub: 'ARENA MULTIPLAYER EM TEMPO REAL (1v1 / 2v2)',
      tag: 'ONLINE ⚡',
      icon: Swords,
      primary: true,
      action: onNavigateToLobby,
    },
    {
      id: 'deck',
      label: 'COLEÇÃO DE CARTAS',
      sub: 'COMPÊNDIO DE MANILHAS e ARCANOS',
      tag: '56 CARTAS',
      icon: Layers,
      primary: false,
      action: onNavigateToDeck,
    },
    {
      id: 'challenges',
      label: 'DESAFIOS',
      sub: 'MESA SINISTRA & MÃO DE ONZE',
      tag: 'NOVO!',
      icon: Trophy,
      primary: false,
      action: onOpenChallengesPreview,
    },
    {
      id: 'options',
      label: 'OPÇÕES',
      sub: 'ÁUDIO CRT, SHADER SPEED & IDIOMA',
      tag: 'PT-BR',
      icon: Settings,
      primary: false,
      action: onOpenSettings,
    },
  ];

  // Keyboard navigation for W/S or Up/Down and Enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key.toLowerCase() === 's') {
        e.preventDefault();
        playHoverSound(settings.audioMuted);
        setActiveMenuIdx((prev) => (prev + 1) % menuItems.length);
      } else if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') {
        e.preventDefault();
        playHoverSound(settings.audioMuted);
        setActiveMenuIdx((prev) => (prev - 1 + menuItems.length) % menuItems.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        playClickSound(settings.audioMuted);
        menuItems[activeMenuIdx]?.action();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeMenuIdx, menuItems, settings.audioMuted]);

  const handleItemHover = (idx: number) => {
    if (activeMenuIdx !== idx) {
      setActiveMenuIdx(idx);
      playHoverSound(settings.audioMuted);
    }
  };

  return (
    <main className="relative flex-1 flex items-center justify-center px-4 py-6 sm:px-8 sm:py-10 overflow-hidden">
      {/* Background Ambience & Flare */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-700/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-700/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column: Game Title Branding & Navigation Buttons */}
        <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left">
          {/* Arcane Tagline */}
          <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-purple-400 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-spin" />
            <span>ROGUELIKE DECKBUILDER ARCANO</span>
            <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-spin" />
          </div>

          {/* Main Title TRUCAOS */}
          <h1 className="text-5xl sm:text-7xl font-serif font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-white via-purple-100 to-purple-400 drop-shadow-[0_0_35px_rgba(168,85,247,0.7)]">
            TRUCAOS
          </h1>

          {/* Subtitle MANILHA ZERO */}
          <div className="flex items-center gap-3 my-1">
            <span className="h-px w-8 bg-gradient-to-r from-transparent to-purple-500" />
            <span className="text-sm sm:text-base font-serif font-bold tracking-[0.25em] text-purple-200">
              ✦ MANILHA ZERO ✦
            </span>
            <span className="h-px w-8 bg-gradient-to-l from-transparent to-purple-500" />
          </div>

          <p className="text-[11px] sm:text-xs font-mono tracking-widest text-purple-400/90 mb-6 sm:mb-8">
            A MALDIÇÃO DOS QUATRO NAIPES • GRIMÓRIO DAS SOMBRAS
          </p>

          {/* Main Action Menu Buttons */}
          <div className="w-full max-w-md space-y-3">
            {menuItems.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = activeMenuIdx === idx;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    playClickSound(settings.audioMuted);
                    item.action();
                  }}
                  onMouseEnter={() => handleItemHover(idx)}
                  className={`w-full group relative flex items-center justify-between p-3.5 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                    item.primary
                      ? isSelected
                        ? 'border-purple-300 bg-gradient-to-r from-purple-800 via-purple-700 to-purple-900 text-white shadow-[0_0_30px_rgba(192,132,252,0.8)] scale-[1.02]'
                        : 'border-purple-500/80 bg-purple-900/60 text-purple-100 hover:border-purple-300 hover:bg-purple-800/80 shadow-[0_0_20px_rgba(168,85,247,0.4)]'
                      : isSelected
                      ? 'border-purple-400 bg-purple-950/90 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)] translate-x-1'
                      : 'border-purple-900/60 bg-black/40 text-slate-300 hover:border-purple-700 hover:bg-purple-950/40'
                  }`}
                >
                  {/* Left: Icon & Labels */}
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        item.primary
                          ? 'bg-purple-950/80 text-purple-200'
                          : 'bg-purple-950/40 text-purple-400 group-hover:text-purple-200'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm sm:text-base font-bold tracking-wider">
                          {item.label}
                        </span>
                      </div>
                      <span className="block text-[11px] font-mono text-purple-300/80">
                        {item.sub}
                      </span>
                    </div>
                  </div>

                  {/* Right: Tag badge */}
                  <div className="flex items-center gap-1">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                        item.tag === 'NOVO!'
                          ? 'border-amber-500/80 bg-amber-950/60 text-amber-300 font-bold animate-pulse'
                          : item.primary
                          ? 'border-purple-300/60 bg-purple-950/70 text-purple-200'
                          : 'border-purple-800/50 bg-black/50 text-purple-400'
                      }`}
                    >
                      {item.tag}
                    </span>
                  </div>
                </button>
              );
            })}

            {/* Bottom Row: Créditos & Sair */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  playClickSound(settings.audioMuted);
                  onOpenRules();
                }}
                className="py-2 px-3 rounded-lg border border-purple-900/50 bg-black/40 hover:bg-purple-950/50 text-slate-400 hover:text-slate-200 text-xs font-mono tracking-wider transition-colors"
              >
                CRÉDITOS & LORE
              </button>
              <button
                type="button"
                onClick={() => {
                  playClickSound(settings.audioMuted);
                  onOpenPlayPreview();
                }}
                className="py-2 px-3 rounded-lg border border-purple-900/50 bg-black/40 hover:bg-rose-950/40 hover:border-rose-900/60 text-slate-400 hover:text-rose-300 text-xs font-mono tracking-wider transition-colors"
              >
                SAIR DO JOGO
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Hero Showcase Card matching reference */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center">
          <HeroCardPreview
            onCardClick={onSelectCard}
            onHoverSound={() => playHoverSound(settings.audioMuted)}
          />
        </div>
      </div>
    </main>
  );
};
