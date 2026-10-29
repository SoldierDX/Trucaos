/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { CARDS_DATA, getManilhas, getFeaturedCard, getCardById, filterCards } from './cards';

test('dataset contains 56 unique cards matching the 8x7 sprite sheet', () => {
  assert.equal(CARDS_DATA.length, 56);
  const ids = new Set(CARDS_DATA.map((c) => c.id));
  assert.equal(ids.size, 56, 'All card IDs must be unique');
});

test('all cards have valid sprite row (0-7) and col (0-6) within bounds', () => {
  for (const card of CARDS_DATA) {
    assert.ok(
      card.spriteRow >= 0 && card.spriteRow <= 7,
      `Invalid row ${card.spriteRow} for card ${card.id}`
    );
    assert.ok(
      card.spriteCol >= 0 && card.spriteCol <= 6,
      `Invalid col ${card.spriteCol} for card ${card.id}`
    );
  }
});

test('the 4 legendary manilhas of Truco Paulista exist and are correctly ordered', () => {
  const manilhas = getManilhas();
  assert.equal(manilhas.length, 4, 'Must have exactly 4 legendary manilhas');

  // 1: Zap (4 de Paus)
  assert.equal(manilhas[0].id, 'paus-4-zap');
  assert.equal(manilhas[0].manilhaRank, 1);
  assert.equal(manilhas[0].suit, 'PAUS');

  // 2: 7 de Copas
  assert.equal(manilhas[1].id, 'copas-7-manilha');
  assert.equal(manilhas[1].manilhaRank, 2);
  assert.equal(manilhas[1].suit, 'COPAS');

  // 3: Espadilha (Ás de Espadas)
  assert.equal(manilhas[2].id, 'espadas-a-espadilha');
  assert.equal(manilhas[2].manilhaRank, 3);
  assert.equal(manilhas[2].suit, 'ESPADAS');

  // 4: Pica-Fumo (7 de Ouros)
  assert.equal(manilhas[3].id, 'ouros-7-manilha');
  assert.equal(manilhas[3].manilhaRank, 4);
  assert.equal(manilhas[3].suit, 'OUROS');
});

test('getFeaturedCard returns O Zap as the primary visual anchor', () => {
  const featured = getFeaturedCard();
  assert.equal(featured.id, 'paus-4-zap');
  assert.equal(featured.isManilha, true);
  assert.equal(featured.manilhaRank, 1);
});

test('card lookup by ID returns correct card or undefined', () => {
  const zap = getCardById('paus-4-zap');
  assert.ok(zap);
  assert.equal(zap?.name, 'O ZAP (4 de Paus)');

  const missing = getCardById('unknown-card');
  assert.equal(missing, undefined);
});

test('filterCards accurately filters by suit, category, and search text', () => {
  // Suit filter
  const pausCards = filterCards(CARDS_DATA, '', 'PAUS', 'ALL');
  assert.equal(pausCards.length, 14);

  // Category filter
  const manilhasOnly = filterCards(CARDS_DATA, '', 'ALL', 'MANILHA');
  assert.equal(manilhasOnly.length, 4);

  // Search query
  const searchResults = filterCards(CARDS_DATA, 'Zap', 'ALL', 'ALL');
  assert.ok(searchResults.length >= 1);
  assert.equal(searchResults[0].id, 'paus-4-zap');
});
