/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Card, GameSettings, Suit } from '../types/game';
import { CARDS_DATA, filterCards, SUIT_INFO } from '../data/cards';
import { CardView } from '../components/CardView';
import { ArrowLeft, Search, Filter, Sparkles, Crown, Layers, RefreshCw } from 'lucide-react';
import { playClickSound, playHoverSound } from '../utils/audio';

interface DeckScreenProps {
  settings: GameSettings;
  onNavigateHome: () => void;
  onSelectCard: (card: Card) => void;
}

export const DeckScreen: React.FC<DeckScreenProps> = ({
  settings,
  onNavigateHome,
  onSelectCard,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSuit, setSelectedSuit] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Filtered cards list
  const filteredCards = useMemo(() => {
    return filterCards(CARDS_DATA, searchQuery, selectedSuit, selectedCategory);
  }, [searchQuery, selectedSuit, selectedCategory]);

  const suitOptions: { id: string; label: string; symbol?: string; color?: string }[] = [
    { id: 'ALL', label: 'Todos os Naipes' },
    { id: 'PAUS', label: 'Paus', symbol: '♣', color: '#c084fc' },
    { id: 'COPAS', label: 'Copas', symbol: '♥', color: '#f43f5e' },
    { id: 'ESPADAS', label: 'Espadas', symbol: '♠', color: '#60a5fa' },
    { id: 'OUROS', label: 'Ouros', symbol: '♦', color: '#fbbf24' },
  ];

  const categoryOptions = [
    { id: 'ALL', label: 'Todas as Cartas' },
    { id: 'MANILHA', label: '✦ Manilhas Sagradas (4)' },
    { id: 'FIGURA', label: 'Figuras Nobres (J, Q, K)' },
    { id: 'NUMERICA', label: 'Cartas Numéricas' },
    { id: 'ARCANO', label: 'Arcanos das Sombras' },
  ];

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedSuit('ALL');
    setSelectedCategory('ALL');
    playClickSound(settings.audioMuted);
  };

  return (
    <main className="relative flex-1 flex flex-col px-4 py-6 sm:px-8 max-w-7xl mx-auto w-full">
      {/* Top Navigation & Title Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-purple-900/50 pb-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              playClickSound(settings.audioMuted);
              onNavigateHome();
            }}
            className="flex items-center gap-2 rounded-xl border border-purple-700/60 bg-purple-950/60 px-3.5 py-2 text-xs font-mono font-bold text-purple-200 transition-all hover:border-purple-400 hover:bg-purple-900/80 hover:text-white shadow-[0_0_15px_rgba(168,85,247,0.3)] cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>MENU PRINCIPAL</span>
          </button>

          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-purple-400">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>GALERIA DE CARTAS ARCANAS</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-serif font-black text-white tracking-wide">
              Baralho Cursed Deck
            </h1>
          </div>
        </div>

        {/* Card Count & Info */}
        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="rounded-lg border border-purple-900/50 bg-black/40 px-3 py-1.5 text-slate-300">
            Exibindo <span className="font-bold text-purple-300">{filteredCards.length}</span> de <span className="font-bold text-purple-300">56</span> cartas
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mt-5 rounded-2xl border border-purple-900/40 bg-purple-950/20 p-4 backdrop-blur-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search Input */}
          <div className="md:col-span-5 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por carta, valor ou manilha (ex: Zap, 7, Paus)..."
              className="w-full rounded-xl border border-purple-800/60 bg-black/50 pl-9 pr-4 py-2 text-xs font-mono text-slate-100 placeholder:text-purple-400/50 focus:border-purple-400 focus:outline-hidden focus:ring-1 focus:ring-purple-400 transition-colors"
            />
          </div>

          {/* Suit Filter Buttons */}
          <div className="md:col-span-7 flex flex-wrap items-center gap-1.5">
            {suitOptions.map((suit) => (
              <button
                key={suit.id}
                type="button"
                onClick={() => {
                  setSelectedSuit(suit.id);
                  playClickSound(settings.audioMuted);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                  selectedSuit === suit.id
                    ? 'bg-purple-600 text-white font-bold shadow-[0_0_12px_#a855f7]'
                    : 'bg-black/40 border border-purple-900/60 text-slate-400 hover:text-white hover:border-purple-700'
                }`}
              >
                {suit.symbol && (
                  <span style={{ color: suit.color }} className="font-bold">
                    {suit.symbol}
                  </span>
                )}
                <span>{suit.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-purple-900/30">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-mono text-purple-400 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Categoria:
            </span>
            {categoryOptions.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat.id);
                  playClickSound(settings.audioMuted);
                }}
                className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-purple-900/80 border border-purple-400 text-purple-200 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-purple-950/40'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Reset Filters */}
          {(searchQuery || selectedSuit !== 'ALL' || selectedCategory !== 'ALL') && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="flex items-center gap-1 text-[11px] font-mono text-purple-400 hover:text-purple-200 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Limpar Filtros</span>
            </button>
          )}
        </div>
      </div>

      {/* Informative Guidance Banner */}
      <div className="mt-4 flex items-center justify-between px-2 text-[11px] font-mono text-purple-400/80">
        <span>✦ Dica: Clique em qualquer carta para examinar sua arte ampliada e posição no Truco.</span>
        <span className="hidden sm:inline">⬥ Grade 8x7 do Baralho Cursed Deck</span>
      </div>

      {/* Main Cards Grid */}
      <div className="mt-4 flex-1">
        {filteredCards.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-4 sm:gap-5 justify-items-center">
            {filteredCards.map((card) => (
              <CardView
                key={card.id}
                card={card}
                onClick={() => {
                  playClickSound(settings.audioMuted);
                  onSelectCard(card);
                }}
                onHover={() => playHoverSound(settings.audioMuted)}
                size="md"
              />
            ))}
          </div>
        ) : (
          <div className="my-16 flex flex-col items-center justify-center text-center p-8 rounded-2xl border border-purple-900/40 bg-purple-950/20">
            <Layers className="w-12 h-12 text-purple-500/60 mb-3 animate-pulse" />
            <h3 className="text-lg font-mono font-bold text-slate-200">
              Nenhuma carta encontrada
            </h3>
            <p className="text-xs font-mono text-slate-400 mt-1 max-w-sm">
              Nenhuma carta corresponde aos filtros ou termo de busca selecionados.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-4 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono font-bold transition-colors"
            >
              Restaurar Todas as 56 Cartas
            </button>
          </div>
        )}
      </div>
    </main>
  );
};
