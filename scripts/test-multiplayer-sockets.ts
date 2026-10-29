/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { io } from 'socket.io-client';
import assert from 'node:assert/strict';

async function testRealMultiplayerSockets() {
  console.log('--- Testando Sockets Multiplayer em Tempo Real no Servidor ---');
  const SERVER_URL = 'http://localhost:3000';

  // 1. Conectar Cliente 1 (Mestre Zap)
  const client1 = io(SERVER_URL, {
    transports: ['websocket'],
    auth: { playerId: 'player_host_01', playerName: 'Mestre Zap' },
  });

  await new Promise<void>((resolve, reject) => {
    client1.on('connect', () => {
      console.log('Cliente 1 (Host) conectado ao servidor via WebSocket.');
      resolve();
    });
    client1.on('connect_error', reject);
  });

  // 2. Cliente 1 cria uma sala 2v2
  const createRes: any = await new Promise((resolve) => {
    client1.emit('room:create', { gameMode: '2v2', roomName: 'Mesa do Zap Real' }, resolve);
  });

  assert.equal(createRes.success, true, 'Sala deve ser criada com sucesso');
  const roomCode = createRes.room.code;
  console.log(`Sala criada com sucesso pelo Cliente 1. Código: ${roomCode}`);
  assert.equal(createRes.room.players.length, 1);
  assert.equal(createRes.room.players[0].name, 'Mestre Zap');
  assert.equal(createRes.room.players[0].isHost, true);

  // 3. Conectar Cliente 2 (Rei de Ouros)
  const client2 = io(SERVER_URL, {
    transports: ['websocket'],
    auth: { playerId: 'player_guest_02', playerName: 'Rei de Ouros' },
  });

  await new Promise<void>((resolve, reject) => {
    client2.on('connect', () => {
      console.log('Cliente 2 (Guest) conectado ao servidor via WebSocket.');
      resolve();
    });
    client2.on('connect_error', reject);
  });

  // 4. Preparar escuta de evento room:updated no Cliente 1 para verificar tempo real
  const client1ReceivedUpdate = new Promise<any>((resolve) => {
    client1.on('room:updated', (updatedRoom: any) => {
      if (updatedRoom.players.length === 2) {
        console.log('Cliente 1 recebeu room:updated em tempo real com 2 jogadores!');
        resolve(updatedRoom);
      }
    });
  });

  // 5. Cliente 2 entra na sala usando o código
  const joinRes: any = await new Promise((resolve) => {
    client2.emit('room:join', { code: roomCode }, resolve);
  });

  assert.equal(joinRes.success, true, 'Cliente 2 deve entrar com sucesso na sala');
  assert.equal(joinRes.room.players.length, 2);
  console.log('Cliente 2 entrou na sala com sucesso!');

  // Aguardar confirmação de sincronização em tempo real no Cliente 1
  const syncedRoom = await client1ReceivedUpdate;
  assert.equal(syncedRoom.players[1].name, 'Rei de Ouros');
  assert.equal(syncedRoom.players[1].isHost, false);
  console.log('✓ Sincronização em tempo real entre Cliente 1 e Cliente 2 confirmada!');

  // 6. Cliente 2 alterna status de "Pronto"
  const client1SawReady = new Promise<any>((resolve) => {
    client1.on('room:updated', (updatedRoom: any) => {
      const p2 = updatedRoom.players.find((p: any) => p.name === 'Rei de Ouros');
      if (p2 && p2.isReady) {
        console.log('Cliente 1 viu Cliente 2 mudar para PRONTO em tempo real!');
        resolve(updatedRoom);
      }
    });
  });

  client2.emit('room:toggleReady');
  await client1SawReady;
  console.log('✓ Estado de Pronto sincronizado em tempo real!');

  // 7. Cliente 2 troca de assento
  const client1SawSeatChange = new Promise<any>((resolve) => {
    client1.on('room:updated', (updatedRoom: any) => {
      const p2 = updatedRoom.players.find((p: any) => p.name === 'Rei de Ouros');
      if (p2 && p2.slotIndex === 2) {
        console.log('Cliente 1 viu Cliente 2 mudar para o Assento 2 (Parceiro)!');
        resolve(updatedRoom);
      }
    });
  });

  client2.emit('room:changeSlot', { targetSlot: 2 });
  await client1SawSeatChange;
  console.log('✓ Mudança de assento sincronizada em tempo real!');

  // 8. Cliente 2 abandona a mesa
  const client1SawLeave = new Promise<any>((resolve) => {
    client1.on('room:updated', (updatedRoom: any) => {
      if (updatedRoom.players.length === 1) {
        console.log('Cliente 1 viu Cliente 2 sair da mesa em tempo real!');
        resolve(updatedRoom);
      }
    });
  });

  client2.emit('room:leave');
  await client1SawLeave;
  console.log('✓ Saída de jogador sincronizada em tempo real!');

  // Desconectar clientes
  client1.disconnect();
  client2.disconnect();

  console.log('=== TODOS OS TESTES DE WEBSOCKET MULTIPLAYER PASSARAM COM 100% DE SUCESSO! ===');
}

testRealMultiplayerSockets().catch((err) => {
  console.error('Erro nos testes de sockets:', err);
  process.exit(1);
});
