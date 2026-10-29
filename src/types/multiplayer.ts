/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type GameMode = '1v1' | '2v2';

export type RoomStatus = 'LOBBY' | 'STARTING' | 'IN_GAME';

export interface Player {
  id: string; // Internal session ID
  name: string;
  isHost: boolean;
  connected: boolean;
  joinedAt: number;
  slotIndex: number; // 0..1 (1v1) or 0..3 (2v2)
  team: 1 | 2; // Team 1 (Slots 0 & 2) vs Team 2 (Slots 1 & 3)
  isReady: boolean;
}

export interface RoomState {
  code: string;
  name: string;
  hostId: string;
  gameMode: GameMode;
  maxPlayers: number; // 2 or 4
  status: RoomStatus;
  players: Player[];
  createdAt: number;
}

export interface PublicRoomSummary {
  code: string;
  name: string;
  hostName: string;
  playersCount: number;
  maxPlayers: number;
  gameMode: GameMode;
  status: RoomStatus;
}
