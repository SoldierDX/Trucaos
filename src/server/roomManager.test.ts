/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { RoomManager } from './roomManager';

test('RoomManager creates room, assigns unique code and sets host', () => {
  const manager = new RoomManager();
  const res = manager.createRoom('p1', 'Gabriel Host', '1v1', 'Mesa do Zap');

  assert.equal(res.success, true);
  assert.ok(res.room);
  assert.ok(res.room.code.length >= 6);
  assert.equal(res.room.name, 'Mesa do Zap');
  assert.equal(res.room.hostId, 'p1');
  assert.equal(res.room.gameMode, '1v1');
  assert.equal(res.room.maxPlayers, 2);
  assert.equal(res.room.players.length, 1);

  const hostPlayer = res.room.players[0];
  assert.equal(hostPlayer.name, 'Gabriel Host');
  assert.equal(hostPlayer.isHost, true);
  assert.equal(hostPlayer.slotIndex, 0);
  assert.equal(hostPlayer.team, 1);
});

test('Another player joins with code and gets next available slot', () => {
  const manager = new RoomManager();
  const created = manager.createRoom('host-1', 'Host', '2v2');
  const code = created.room!.code;

  const joined = manager.joinRoom(code, 'player-2', 'Jogador 2');
  assert.equal(joined.success, true);
  assert.ok(joined.room);
  assert.equal(joined.room.players.length, 2);

  const p2 = joined.room.players[1];
  assert.equal(p2.id, 'player-2');
  assert.equal(p2.name, 'Jogador 2');
  assert.equal(p2.isHost, false);
  assert.equal(p2.slotIndex, 1);
  assert.equal(p2.team, 2);
});

test('Room capacity is strictly enforced based on game mode', () => {
  const manager = new RoomManager();
  const created = manager.createRoom('p1', 'Player 1', '1v1'); // Max 2
  const code = created.room!.code;

  const res2 = manager.joinRoom(code, 'p2', 'Player 2');
  assert.equal(res2.success, true);

  // 3rd player in 1v1 must be rejected
  const res3 = manager.joinRoom(code, 'p3', 'Player 3');
  assert.equal(res3.success, false);
  assert.match(res3.error || '', /está cheia/i);
});

test('Joining non-existent room returns helpful error', () => {
  const manager = new RoomManager();
  const res = manager.joinRoom('SALA-INEXISTENTE', 'p1', 'Tester');
  assert.equal(res.success, false);
  assert.match(res.error || '', /não foi encontrada/i);
});

test('Host delegation occurs when current host leaves', () => {
  const manager = new RoomManager();
  const created = manager.createRoom('host', 'Old Host', '2v2');
  const code = created.room!.code;

  manager.joinRoom(code, 'guest', 'New Host Candidate');

  const leaveRes = manager.leaveRoom('host');
  assert.equal(leaveRes.success, true);
  assert.equal(leaveRes.roomClosed, false);
  assert.ok(leaveRes.room);
  assert.equal(leaveRes.room.players.length, 1);
  assert.equal(leaveRes.room.hostId, 'guest');
  assert.equal(leaveRes.room.players[0].isHost, true);
});

test('Room is deleted when all players leave', () => {
  const manager = new RoomManager();
  const created = manager.createRoom('p1', 'Solo Player', '1v1');
  const code = created.room!.code;

  const leaveRes = manager.leaveRoom('p1');
  assert.equal(leaveRes.success, true);
  assert.equal(leaveRes.roomClosed, true);
  assert.equal(manager.getRoom(code), undefined);
});

test('Slot switching updates slotIndex and team assignment', () => {
  const manager = new RoomManager();
  const created = manager.createRoom('p1', 'Player 1', '2v2');
  const code = created.room!.code;

  // Player 1 starts at slot 0 (Team 1). Switch to slot 2 (Partner in Team 1)
  const switchRes = manager.switchSlot('p1', 2);
  assert.equal(switchRes.success, true);
  assert.equal(switchRes.room!.players[0].slotIndex, 2);
  assert.equal(switchRes.room!.players[0].team, 1);

  // Switch to slot 1 (Team 2)
  const switchTeam = manager.switchSlot('p1', 1);
  assert.equal(switchTeam.success, true);
  assert.equal(switchTeam.room!.players[0].slotIndex, 1);
  assert.equal(switchTeam.room!.players[0].team, 2);
});

test('Rooms are isolated from each other', () => {
  const manager = new RoomManager();
  const roomA = manager.createRoom('pa1', 'Alice', '1v1');
  const roomB = manager.createRoom('pb1', 'Bob', '1v1');

  assert.notEqual(roomA.room!.code, roomB.room!.code);
  assert.equal(manager.getRoomsCount(), 2);

  manager.joinRoom(roomA.room!.code, 'pa2', 'Alice Friend');
  assert.equal(manager.getRoom(roomA.room!.code)!.players.length, 2);
  assert.equal(manager.getRoom(roomB.room!.code)!.players.length, 1);
});
