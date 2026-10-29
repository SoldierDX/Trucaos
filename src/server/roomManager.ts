/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GameMode, Player, RoomState, PublicRoomSummary } from '../types/multiplayer';

export class RoomManager {
  private rooms: Map<string, RoomState> = new Map();
  // Map of playerId -> roomCode
  private playerToRoom: Map<string, string> = new Map();
  // Map of socketId -> playerId
  private socketToPlayer: Map<string, string> = new Map();

  private generateCode(): string {
    const prefixes = ['ZAP', 'SETE', 'AS', 'OURO', 'COPA', 'ESP', 'PAUS', 'TRU'];
    let attempts = 0;
    while (attempts < 50) {
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      const num = Math.floor(100 + Math.random() * 900); // 3 digits
      const code = `${prefix}-${num}`;
      if (!this.rooms.has(code)) {
        return code;
      }
      attempts++;
    }
    // Fallback alphanumeric
    return `TC-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  }

  public registerSocket(socketId: string, playerId: string): void {
    this.socketToPlayer.set(socketId, playerId);
  }

  public getPlayerIdBySocket(socketId: string): string | undefined {
    return this.socketToPlayer.get(socketId);
  }

  public removeSocket(socketId: string): string | undefined {
    const playerId = this.socketToPlayer.get(socketId);
    this.socketToPlayer.delete(socketId);
    return playerId;
  }

  public createRoom(
    hostId: string,
    hostName: string,
    gameMode: GameMode,
    customName?: string
  ): { success: boolean; room?: RoomState; error?: string } {
    const cleanName = hostName.trim();
    if (!cleanName) {
      return { success: false, error: 'Nome de jogador inválido.' };
    }

    // If player is already in a room, leave it first
    this.leaveRoom(hostId);

    const maxPlayers = gameMode === '1v1' ? 2 : 4;
    const code = this.generateCode();

    const hostPlayer: Player = {
      id: hostId,
      name: cleanName,
      isHost: true,
      connected: true,
      joinedAt: Date.now(),
      slotIndex: 0,
      team: 1,
      isReady: true, // Host is ready by default
    };

    const room: RoomState = {
      code,
      name: customName?.trim() || `Mesa de Truco (${code})`,
      hostId,
      gameMode,
      maxPlayers,
      status: 'LOBBY',
      players: [hostPlayer],
      createdAt: Date.now(),
    };

    this.rooms.set(code, room);
    this.playerToRoom.set(hostId, code);

    return { success: true, room };
  }

  public joinRoom(
    rawCode: string,
    playerId: string,
    playerName: string
  ): { success: boolean; room?: RoomState; error?: string } {
    const cleanName = playerName.trim();
    if (!cleanName) {
      return { success: false, error: 'Por favor, informe um nome de jogador válido.' };
    }

    const code = rawCode.trim().toUpperCase();
    const room = this.rooms.get(code);

    if (!room) {
      return { success: false, error: `A sala "${code}" não foi encontrada. Verifique o código digitado.` };
    }

    // Check if player is already in this room (reconnection or duplicate join)
    const existingPlayerIndex = room.players.findIndex((p) => p.id === playerId);
    if (existingPlayerIndex !== -1) {
      room.players[existingPlayerIndex].connected = true;
      room.players[existingPlayerIndex].name = cleanName;
      this.playerToRoom.set(playerId, code);
      return { success: true, room };
    }

    // If player is in another room, leave it
    this.leaveRoom(playerId);

    // Check room capacity
    if (room.players.length >= room.maxPlayers) {
      return { success: false, error: `A sala "${code}" está cheia (${room.players.length}/${room.maxPlayers} jogadores).` };
    }

    // Find first available slot (0..maxPlayers - 1)
    const occupiedSlots = new Set(room.players.map((p) => p.slotIndex));
    let nextSlot = 0;
    for (let s = 0; s < room.maxPlayers; s++) {
      if (!occupiedSlots.has(s)) {
        nextSlot = s;
        break;
      }
    }

    // Team 1 = Slots 0, 2 | Team 2 = Slots 1, 3
    const team: 1 | 2 = nextSlot % 2 === 0 ? 1 : 2;

    const newPlayer: Player = {
      id: playerId,
      name: cleanName,
      isHost: false,
      connected: true,
      joinedAt: Date.now(),
      slotIndex: nextSlot,
      team,
      isReady: false,
    };

    room.players.push(newPlayer);
    this.playerToRoom.set(playerId, code);

    return { success: true, room };
  }

  public leaveRoom(playerId: string): {
    success: boolean;
    room?: RoomState;
    roomClosed?: boolean;
    leftCode?: string;
  } {
    const code = this.playerToRoom.get(playerId);
    if (!code) {
      return { success: false };
    }

    const room = this.rooms.get(code);
    this.playerToRoom.delete(playerId);

    if (!room) {
      return { success: true, leftCode: code };
    }

    const playerIndex = room.players.findIndex((p) => p.id === playerId);
    if (playerIndex === -1) {
      return { success: true, leftCode: code };
    }

    const wasHost = room.players[playerIndex].isHost;
    room.players.splice(playerIndex, 1);

    // If room is now empty, delete room
    if (room.players.length === 0) {
      this.rooms.delete(code);
      return { success: true, roomClosed: true, leftCode: code };
    }

    // If host left, appoint new host (oldest joined active player)
    if (wasHost) {
      const nextHost = room.players.find((p) => p.connected) || room.players[0];
      if (nextHost) {
        nextHost.isHost = true;
        room.hostId = nextHost.id;
      }
    }

    return { success: true, room, roomClosed: false, leftCode: code };
  }

  public toggleReady(playerId: string): {
    success: boolean;
    room?: RoomState;
    isReady?: boolean;
    error?: string;
  } {
    const code = this.playerToRoom.get(playerId);
    if (!code) {
      return { success: false, error: 'Jogador não está em uma sala.' };
    }

    const room = this.rooms.get(code);
    if (!room) {
      return { success: false, error: 'Sala não encontrada.' };
    }

    const player = room.players.find((p) => p.id === playerId);
    if (!player) {
      return { success: false, error: 'Jogador não encontrado na sala.' };
    }

    player.isReady = !player.isReady;
    return { success: true, room, isReady: player.isReady };
  }

  public switchSlot(
    playerId: string,
    targetSlot: number
  ): { success: boolean; room?: RoomState; error?: string } {
    const code = this.playerToRoom.get(playerId);
    if (!code) {
      return { success: false, error: 'Jogador não está em uma sala.' };
    }

    const room = this.rooms.get(code);
    if (!room) {
      return { success: false, error: 'Sala não encontrada.' };
    }

    if (targetSlot < 0 || targetSlot >= room.maxPlayers) {
      return { success: false, error: 'Assento inválido.' };
    }

    const isOccupied = room.players.some((p) => p.slotIndex === targetSlot && p.id !== playerId);
    if (isOccupied) {
      return { success: false, error: 'Este assento já está ocupado por outro jogador.' };
    }

    const player = room.players.find((p) => p.id === playerId);
    if (!player) {
      return { success: false, error: 'Jogador não encontrado.' };
    }

    player.slotIndex = targetSlot;
    player.team = targetSlot % 2 === 0 ? 1 : 2;

    return { success: true, room };
  }

  public handleDisconnect(playerId: string): {
    room?: RoomState;
    player?: Player;
    roomClosed?: boolean;
    code?: string;
  } {
    const code = this.playerToRoom.get(playerId);
    if (!code) {
      return {};
    }

    const room = this.rooms.get(code);
    if (!room) {
      this.playerToRoom.delete(playerId);
      return { code };
    }

    const player = room.players.find((p) => p.id === playerId);
    if (!player) {
      this.playerToRoom.delete(playerId);
      return { room, code };
    }

    player.connected = false;

    // Check if ALL players are disconnected
    const hasAnyConnected = room.players.some((p) => p.connected);
    if (!hasAnyConnected) {
      // Room can be cleaned up
      this.rooms.delete(code);
      this.playerToRoom.delete(playerId);
      return { roomClosed: true, code };
    }

    // If disconnected player was host, transfer host to an active player
    if (player.isHost) {
      const activePlayer = room.players.find((p) => p.connected);
      if (activePlayer) {
        player.isHost = false;
        activePlayer.isHost = true;
        room.hostId = activePlayer.id;
      }
    }

    return { room, player, roomClosed: false, code };
  }

  public getRoom(code: string): RoomState | undefined {
    return this.rooms.get(code.trim().toUpperCase());
  }

  public getPlayerRoom(playerId: string): RoomState | undefined {
    const code = this.playerToRoom.get(playerId);
    return code ? this.rooms.get(code) : undefined;
  }

  public getPublicRooms(): PublicRoomSummary[] {
    const summaries: PublicRoomSummary[] = [];
    for (const room of this.rooms.values()) {
      const host = room.players.find((p) => p.id === room.hostId);
      summaries.push({
        code: room.code,
        name: room.name,
        hostName: host ? host.name : 'Desconhecido',
        playersCount: room.players.length,
        maxPlayers: room.maxPlayers,
        gameMode: room.gameMode,
        status: room.status,
      });
    }
    // Return newest first
    return summaries.sort((a, b) => b.code.localeCompare(a.code));
  }

  public getRoomsCount(): number {
    return this.rooms.size;
  }
}
