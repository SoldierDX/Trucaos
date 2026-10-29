/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { io, Socket } from 'socket.io-client';
import { GameMode, RoomState, PublicRoomSummary } from '../types/multiplayer';

class SocketService {
  private socket: Socket | null = null;
  private playerId: string = '';
  private playerName: string = '';
  private connected: boolean = false;
  private listeners: Map<string, Set<Function>> = new Map();

  constructor() {
    this.initSession();
  }

  private initSession() {
    if (typeof window === 'undefined') return;

    // Retrieve or generate player session ID
    let storedId = localStorage.getItem('trucaos_session_id');
    if (!storedId) {
      storedId = 'p_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36).substring(4);
      localStorage.setItem('trucaos_session_id', storedId);
    }
    this.playerId = storedId;

    // Retrieve or generate player name
    let storedName = localStorage.getItem('trucaos_player_name');
    if (!storedName) {
      storedName = `Mestre_${Math.floor(100 + Math.random() * 900)}`;
      localStorage.setItem('trucaos_player_name', storedName);
    }
    this.playerName = storedName;
  }

  public getPlayerId(): string {
    return this.playerId;
  }

  public getPlayerName(): string {
    return this.playerName;
  }

  public setPlayerName(name: string): void {
    const clean = name.trim();
    if (clean) {
      this.playerName = clean;
      if (typeof window !== 'undefined') {
        localStorage.setItem('trucaos_player_name', clean);
      }
      if (this.socket && this.connected) {
        this.socket.emit('player:init', { playerName: clean, sessionToken: this.playerId });
      }
    }
  }

  public connect(): Socket {
    if (this.socket) {
      return this.socket;
    }

    const host = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

    this.socket = io(host, {
      transports: ['websocket', 'polling'],
      auth: {
        playerId: this.playerId,
        playerName: this.playerName,
      },
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      this.connected = true;
      this.emitInternal('connectionChange', true);
      // Re-identify
      this.socket?.emit('player:init', {
        playerName: this.playerName,
        sessionToken: this.playerId,
      });
    });

    this.socket.on('disconnect', () => {
      this.connected = false;
      this.emitInternal('connectionChange', false);
    });

    this.socket.on('room:updated', (room: RoomState) => {
      this.emitInternal('room:updated', room);
    });

    this.socket.on('lobby:publicRooms', (rooms: PublicRoomSummary[]) => {
      this.emitInternal('lobby:publicRooms', rooms);
    });

    this.socket.on('room:error', (data: { message: string }) => {
      this.emitInternal('room:error', data.message);
    });

    return this.socket;
  }

  public isConnected(): boolean {
    return this.connected;
  }

  // Event subscription helper
  public on(event: string, callback: Function): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  private emitInternal(event: string, data: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((cb) => {
        try {
          cb(data);
        } catch (err) {
          console.error(`Error in socket listener for ${event}:`, err);
        }
      });
    }
  }

  // Multiplayer Actions
  public createRoom(
    gameMode: GameMode,
    roomName?: string
  ): Promise<{ success: boolean; room?: RoomState; error?: string }> {
    return new Promise((resolve) => {
      const s = this.connect();
      s.emit(
        'room:create',
        { gameMode, roomName },
        (res: { success: boolean; room?: RoomState; error?: string }) => {
          resolve(res);
        }
      );
    });
  }

  public joinRoom(code: string): Promise<{ success: boolean; room?: RoomState; error?: string }> {
    return new Promise((resolve) => {
      const s = this.connect();
      s.emit(
        'room:join',
        { code },
        (res: { success: boolean; room?: RoomState; error?: string }) => {
          resolve(res);
        }
      );
    });
  }

  public leaveRoom(): Promise<{ success: boolean }> {
    return new Promise((resolve) => {
      if (!this.socket) {
        resolve({ success: true });
        return;
      }
      this.socket.emit('room:leave', (res: { success: boolean }) => {
        resolve(res);
      });
    });
  }

  public toggleReady(): Promise<{ success: boolean; isReady?: boolean; error?: string }> {
    return new Promise((resolve) => {
      if (!this.socket) {
        resolve({ success: false, error: 'Não conectado' });
        return;
      }
      this.socket.emit(
        'room:toggleReady',
        (res: { success: boolean; isReady?: boolean; error?: string }) => {
          resolve(res);
        }
      );
    });
  }

  public switchSlot(targetSlot: number): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      if (!this.socket) {
        resolve({ success: false, error: 'Não conectado' });
        return;
      }
      this.socket.emit(
        'room:changeSlot',
        { targetSlot },
        (res: { success: boolean; error?: string }) => {
          resolve(res);
        }
      );
    });
  }
}

export const socketService = new SocketService();
