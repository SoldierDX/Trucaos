/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { Server as SocketIOServer } from 'socket.io';
import { RoomManager } from './src/server/roomManager.js';
import { GameMode } from './src/types/multiplayer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;

const app = express();
const httpServer = http.createServer(app);

// Socket.IO with CORS enabled for flexible environments
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  pingTimeout: 30000,
  pingInterval: 10000,
});

const roomManager = new RoomManager();

app.use(express.json());

// API health endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    roomsCount: roomManager.getRoomsCount(),
    timestamp: Date.now(),
  });
});

// API public rooms listing
app.get('/api/rooms', (_req: Request, res: Response) => {
  res.json({
    rooms: roomManager.getPublicRooms(),
  });
});

// Broadcast public rooms update to all lobby sockets
function broadcastPublicRooms() {
  io.emit('lobby:publicRooms', roomManager.getPublicRooms());
}

// Socket.IO event handling
io.on('connection', (socket) => {
  let currentPlayerId: string = socket.handshake.auth?.playerId || `p_${socket.id.substring(0, 8)}`;
  let currentPlayerName: string = socket.handshake.auth?.playerName || 'Jogador';

  roomManager.registerSocket(socket.id, currentPlayerId);

  // Send current rooms list on connect
  socket.emit('lobby:publicRooms', roomManager.getPublicRooms());

  // Player identify / initialization
  socket.on(
    'player:init',
    (
      data: { playerName: string; sessionToken?: string },
      callback?: (res: { playerId: string; name: string }) => void
    ) => {
      if (data?.playerName?.trim()) {
        currentPlayerName = data.playerName.trim();
      }
      if (data?.sessionToken?.trim()) {
        currentPlayerId = data.sessionToken.trim();
      }
      roomManager.registerSocket(socket.id, currentPlayerId);

      // Check if player was in an active room to support graceful reconnection
      const existingRoom = roomManager.getPlayerRoom(currentPlayerId);
      if (existingRoom) {
        socket.join(existingRoom.code);
        const playerInRoom = existingRoom.players.find((p) => p.id === currentPlayerId);
        if (playerInRoom) {
          playerInRoom.connected = true;
          playerInRoom.name = currentPlayerName;
        }
        io.to(existingRoom.code).emit('room:updated', existingRoom);
      }

      if (typeof callback === 'function') {
        callback({ playerId: currentPlayerId, name: currentPlayerName });
      }
    }
  );

  // Create room
  socket.on(
    'room:create',
    (
      data: { roomName?: string; gameMode?: GameMode },
      callback?: (res: { success: boolean; room?: any; error?: string }) => void
    ) => {
      const mode: GameMode = data?.gameMode === '1v1' ? '1v1' : '2v2';
      const result = roomManager.createRoom(
        currentPlayerId,
        currentPlayerName,
        mode,
        data?.roomName
      );

      if (result.success && result.room) {
        socket.join(result.room.code);
        io.to(result.room.code).emit('room:updated', result.room);
        broadcastPublicRooms();
      }

      if (typeof callback === 'function') {
        callback(result);
      }
    }
  );

  // Join room
  socket.on(
    'room:join',
    (
      data: { code: string },
      callback?: (res: { success: boolean; room?: any; error?: string }) => void
    ) => {
      if (!data?.code) {
        if (typeof callback === 'function') {
          callback({ success: false, error: 'Código de sala não informado.' });
        }
        return;
      }

      const result = roomManager.joinRoom(data.code, currentPlayerId, currentPlayerName);

      if (result.success && result.room) {
        socket.join(result.room.code);
        io.to(result.room.code).emit('room:updated', result.room);
        broadcastPublicRooms();
      }

      if (typeof callback === 'function') {
        callback(result);
      }
    }
  );

  // Leave room
  socket.on('room:leave', (callback?: (res: { success: boolean }) => void) => {
    const prevRoom = roomManager.getPlayerRoom(currentPlayerId);
    const result = roomManager.leaveRoom(currentPlayerId);

    if (prevRoom) {
      socket.leave(prevRoom.code);
      if (result.roomClosed) {
        io.to(prevRoom.code).emit('room:error', { message: 'A sala foi encerrada pois todos os jogadores saíram.' });
      } else if (result.room) {
        io.to(prevRoom.code).emit('room:updated', result.room);
      }
      broadcastPublicRooms();
    }

    if (typeof callback === 'function') {
      callback({ success: true });
    }
  });

  // Toggle ready status
  socket.on('room:toggleReady', (callback?: (res: { success: boolean; isReady?: boolean; error?: string }) => void) => {
    const result = roomManager.toggleReady(currentPlayerId);
    if (result.success && result.room) {
      io.to(result.room.code).emit('room:updated', result.room);
    }
    if (typeof callback === 'function') {
      callback(result);
    }
  });

  // Switch seat/slot
  socket.on(
    'room:changeSlot',
    (
      data: { targetSlot: number },
      callback?: (res: { success: boolean; error?: string }) => void
    ) => {
      const result = roomManager.switchSlot(currentPlayerId, data.targetSlot);
      if (result.success && result.room) {
        io.to(result.room.code).emit('room:updated', result.room);
      }
      if (typeof callback === 'function') {
        callback(result);
      }
    }
  );

  // Disconnect handler
  socket.on('disconnect', () => {
    roomManager.removeSocket(socket.id);
    const disc = roomManager.handleDisconnect(currentPlayerId);
    if (disc.code) {
      if (disc.roomClosed) {
        broadcastPublicRooms();
      } else if (disc.room) {
        io.to(disc.code).emit('room:updated', disc.room);
        broadcastPublicRooms();
      }
    }
  });
});

// Configure Vite middleware in dev or static files in production
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.use('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`[TRUCAOS Server] Rodando na porta ${PORT} (Prod: ${isProduction})`);
  });
}

startServer().catch((err) => {
  console.error('[TRUCAOS Server Error]', err);
  process.exit(1);
});
