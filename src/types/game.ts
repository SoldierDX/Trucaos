/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Suit = 'PAUS' | 'COPAS' | 'ESPADAS' | 'OUROS';

export type CardCategory = 'MANILHA' | 'NUMERICA' | 'FIGURA' | 'ARCANO';

export interface Card {
  id: string;
  name: string;
  suit: Suit;
  suitSymbol: string;
  value: string; // "A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"
  numericValue: number; // Truco natural ranking: 3=10, 2=9, A=8, K=7, J=6, Q=5, 7=4, 6=3, 5=2, 4=1
  category: CardCategory;
  isManilha: boolean;
  manilhaRank?: number; // 1 = Zap, 2 = 7 Copas, 3 = Espadilha, 4 = Pica-Fumo
  manilhaTitle?: string; // "O Soberano", "O Altar Rubro", "A Lâmina Etérea", "O Pica-Fumo"
  spriteRow: number; // 0 to 7
  spriteCol: number; // 0 to 6
  trucoPower: string;
  lore: string;
  tags: string[];
}

export type ScreenState = 'HOME' | 'BARALHO' | 'LOBBY' | 'ROOM';

export interface GameSettings {
  crtEnabled: boolean;
  audioMuted: boolean;
  soundVolume: number;
  shaderSpeed: 'LENTO' | 'NORMAL' | 'RÁPIDO';
  language: 'PT-BR' | 'EN';
}
