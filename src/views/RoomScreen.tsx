/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { RoomState, Player } from '../types/multiplayer';
import { GameSettings } from '../types/game';
import { socketService } from '../services/socket';
import { playClickSound, playCardFlipSound } from '../utils/audio';
import {
  Users,
  Crown,
  CheckCircle2,
  Clock,
  Copy,
  Check,
  LogOut,
  Swords,
  Shield,
  Sparkles,
  Wifi,
  WifiOff,
  UserPlus,
  Play,
  RotateCcw,
} from 'lucide-react';

interface RoomScreenProps {
  room: RoomState;
  settings: GameSettings;
  onLeaveRoom: () => void;
}

export const RoomScreen: React.FC<RoomScreenProps> = ({
  room: initialRoom,
  settings,
  onLeaveRoom,
}) => {
  const [room, setRoom] = useState<RoomState>(initialRoom);
  const [copiedCode, setCopiedCode] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [activityLogs, setActivityLogs] = useState<string[]>([
    `Sala [${initialRoom.code}] criada. Aguardando participantes...`,
  ]);

  const currentPlayerId = socketService.getPlayerId();
  const currentPlayer = room.players.find((p) => p.id === currentPlayerId);
  const isHost = currentPlayer?.isHost ?? false;

  // Real-time synchronization
  useEffect(() => {
    const unsubRoomUpdate = socketService.on('room:updated', (updatedRoom: RoomState) => {
      setRoom(updatedRoom);
      setActivityLogs((prev) => [
        `[${new Date().toLocaleTimeString()}] Estado da mesa sincronizado (${updatedRoom.players.length}/${updatedRoom.maxPlayers} jogadores).`,
        ...prev.slice(0, 15),
      ]);
    });

    const unsubError = socketService.on('room:error', (msg: string) => {
      setActionError(msg);
    });

    return () => {
      unsubRoomUpdate();
      unsubError();
    };
  }, []);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(room.code);
    setCopiedCode(true);
    playClickSound(settings.audioMuted);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleToggleReady = async () => {
    playClickSound(settings.audioMuted);
    try {
      const res = await socketService.toggleReady();
      if (!res.success && res.error) {
        setActionError(res.error);
      }
    } catch {
      setActionError('Falha ao atualizar estado de pronto.');
    }
  };

  const handleSwitchSlot = async (slotIdx: number) => {
    if (currentPlayer?.slotIndex === slotIdx) return;
    playCardFlipSound(settings.audioMuted);
    try {
      const res = await socketService.switchSlot(slotIdx);
      if (!res.success && res.error) {
        setActionError(res.error);
      }
    } catch {
      setActionError('Não foi possível mudar de assento.');
    }
  };

  const handleLeave = async () => {
    playClickSound(settings.audioMuted);
    await socketService.leaveRoom();
    onLeaveRoom();
  };

  // Check if all players are ready and table is full
  const isTableFull = room.players.length === room.maxPlayers;
  const allPlayersReady = isTableFull && room.players.every((p) => p.isReady);

  // Seat slots mapping
  const slotLabels =
    room.gameMode === '2v2'
      ? [
          { index: 0, position: 'Norte', team: 1, teamLabel: 'Dupla 1' },
          { index: 1, position: 'Leste', team: 2, teamLabel: 'Dupla 2' },
          { index: 2, position: 'Sul', team: 1, teamLabel: 'Dupla 1 (Parceiro)' },
          { index: 3, position: 'Oeste', team: 2, teamLabel: 'Dupla 2 (Adversário)' },
        ]
      : [
          { index: 0, position: 'Jogador 1', team: 1, teamLabel: 'Desafiante 1' },
          { index: 1, position: 'Jogador 2', team: 2, teamLabel: 'Desafiante 2' },
        ];

  return (
    <main className="relative flex-1 flex flex-col px-4 py-6 sm:px-8 max-w-7xl mx-auto w-full">
      {/* Header and Room Identification Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-purple-900/50 pb-5">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleLeave}
            className="flex items-center gap-1.5 rounded-xl border border-rose-800/60 bg-rose-950/40 px-3.5 py-2 text-xs font-mono font-bold text-rose-300 transition-all hover:bg-rose-900/60 hover:text-white cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>ABANDONAR MESA</span>
          </button>

          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-purple-400">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
              <span>SALA ATIVA // TRUCO PAULISTA</span>
              <span className="text-purple-600">•</span>
              <span className="text-purple-300 font-bold uppercase">{room.gameMode}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-black text-white tracking-wide">
              {room.name}
            </h1>
          </div>
        </div>

        {/* Room Code Share Container */}
        <div className="flex items-center gap-3">
          <div className="rounded-xl border-2 border-purple-500 bg-purple-950/60 px-4 py-2 text-center shadow-[0_0_20px_rgba(168,85,247,0.4)]">
            <span className="block text-[10px] font-mono text-purple-300 uppercase tracking-widest">
              Código de Acesso
            </span>
            <span className="text-xl sm:text-2xl font-mono font-black text-white tracking-widest">
              {room.code}
            </span>
          </div>

          <button
            type="button"
            onClick={handleCopyCode}
            className="flex items-center gap-2 rounded-xl border border-purple-400 bg-purple-600 px-4 py-3 text-xs font-mono font-bold text-white transition-all hover:bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.4)] cursor-pointer"
          >
            {copiedCode ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>CÓDIGO COPIADO!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>COPIAR CÓDIGO</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {actionError && (
        <div className="mt-4 flex items-center justify-between rounded-xl border border-rose-500/60 bg-rose-950/60 p-3 text-xs font-mono text-rose-200">
          <span>{actionError}</span>
          <button
            type="button"
            onClick={() => setActionError(null)}
            className="text-rose-400 underline text-xs"
          >
            Dispensar
          </button>
        </div>
      )}

      {/* Main Table Arena and Seats */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        {/* Table Arena & Seat Layout (Left / Center Column) */}
        <div className="lg:col-span-8 flex flex-col justify-between rounded-2xl border border-purple-800/60 bg-[#0a0214] p-5 sm:p-7 shadow-[0_0_40px_rgba(168,85,247,0.25)] relative overflow-hidden">
          {/* Felt / Wood Arena Center Aura */}
          <div className="absolute inset-12 rounded-3xl bg-radial from-purple-900/20 via-purple-950/10 to-transparent pointer-events-none" />

          {/* Top Status Bar */}
          <div className="relative z-10 flex items-center justify-between border-b border-purple-900/40 pb-3 font-mono text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Users className="w-4 h-4 text-purple-400" />
              <span>
                Jogadores Conectados: <strong className="text-purple-300">{room.players.length}/{room.maxPlayers}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2 text-purple-300">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>
                {allPlayersReady
                  ? 'TODOS OS JOGADORES PRONTOS PARA INICIAR!'
                  : 'AGUARDANDO JOGADORES CONFIRMAREM "PRONTO"'}
              </span>
            </div>
          </div>

          {/* Virtual Truco Table Stage */}
          <div className="relative z-10 my-6 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {slotLabels.map((slot) => {
                const player = room.players.find((p) => p.slotIndex === slot.index);
                const isMe = player?.id === currentPlayerId;
                const isAvailable = !player;

                return (
                  <div
                    key={slot.index}
                    className={`rounded-2xl border p-4 transition-all ${
                      player
                        ? isMe
                          ? 'border-purple-400 bg-purple-950/70 shadow-[0_0_20px_rgba(168,85,247,0.4)]'
                          : 'border-purple-900/60 bg-black/60'
                        : 'border-dashed border-purple-900/40 bg-black/30 hover:border-purple-700/60'
                    }`}
                  >
                    {/* Seat Header */}
                    <div className="flex items-center justify-between text-[11px] font-mono text-purple-400 mb-2">
                      <div className="flex items-center gap-1.5 font-bold">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-purple-500" />
                        <span>ASSENTO {slot.position.toUpperCase()}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-purple-950/80 border border-purple-900 text-purple-300">
                        {slot.teamLabel}
                      </span>
                    </div>

                    {/* Occupant or Empty Seat */}
                    {player ? (
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-3">
                          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-purple-400/60 bg-purple-900/50 text-purple-200">
                            <span className="font-mono font-bold text-sm">
                              {player.name.substring(0, 2).toUpperCase()}
                            </span>
                            {player.isHost && (
                              <Crown className="absolute -top-2 -right-2 h-4 w-4 text-amber-400 fill-amber-400" />
                            )}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm font-bold text-white">
                                {player.name}
                              </span>
                              {isMe && (
                                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-600 text-white font-bold">
                                  VOCÊ
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 mt-0.5">
                              {player.connected ? (
                                <span className="text-emerald-400 flex items-center gap-1">
                                  <Wifi className="w-3 h-3" /> Conectado
                                </span>
                              ) : (
                                <span className="text-rose-400 flex items-center gap-1 animate-pulse">
                                  <WifiOff className="w-3 h-3" /> Reconectando...
                                </span>
                              )}
                              {player.isHost && <span className="text-amber-400 font-bold">• Anfitrião</span>}
                            </div>
                          </div>
                        </div>

                        {/* Ready Status Badge */}
                        <div>
                          {player.isReady ? (
                            <div className="flex items-center gap-1 rounded-full border border-emerald-500/70 bg-emerald-950/60 px-2.5 py-1 text-xs font-mono font-bold text-emerald-300">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>PRONTO</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 rounded-full border border-amber-600/60 bg-amber-950/40 px-2.5 py-1 text-xs font-mono text-amber-300">
                              <Clock className="w-3.5 h-3.5 text-amber-400" />
                              <span>PREPARANDO</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between py-2 text-slate-500 text-xs font-mono">
                        <span>Assento vazio disponível</span>
                        <button
                          type="button"
                          onClick={() => handleSwitchSlot(slot.index)}
                          className="px-3 py-1 rounded-lg border border-purple-800 bg-purple-950/40 hover:bg-purple-900/60 text-purple-300 text-xs font-mono transition-colors cursor-pointer"
                        >
                          Sentar Aqui
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Action Controls */}
          <div className="relative z-10 pt-4 border-t border-purple-900/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Toggle Ready Button */}
            <button
              type="button"
              onClick={handleToggleReady}
              className={`w-full sm:w-auto px-6 py-3 rounded-xl font-mono font-bold text-sm tracking-wider transition-all cursor-pointer ${
                currentPlayer?.isReady
                  ? 'border border-emerald-400 bg-emerald-900/60 text-emerald-200 shadow-[0_0_20px_rgba(52,211,153,0.4)]'
                  : 'border border-purple-500 bg-purple-700 hover:bg-purple-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.5)]'
              }`}
            >
              {currentPlayer?.isReady ? '✓ VOCÊ ESTÁ PRONTO (CANCELAR)' : '⚡ CONFIRMAR ESTOU PRONTO!'}
            </button>

            {/* Host Start Game Action */}
            {isHost ? (
              <button
                type="button"
                disabled={!allPlayersReady}
                onClick={() => {
                  playClickSound(settings.audioMuted);
                  alert('Todos os jogadores estão conectados e sincronizados! A estrutura de rede online está ativa e pronta para a Fase de Regras e Cartas de Truco.');
                }}
                className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-mono font-bold text-sm tracking-wider transition-all ${
                  allPlayersReady
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-[0_0_25px_rgba(245,158,11,0.6)] cursor-pointer'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                }`}
              >
                <Play className="w-4 h-4 fill-current" />
                <span>INICIAR PARTIDA DE TRUCO</span>
              </button>
            ) : (
              <div className="text-xs font-mono text-slate-400">
                Aguardando o anfitrião iniciar a rodada...
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: Room Info & Live Activity Feed */}
        <div className="lg:col-span-4 flex flex-col justify-between rounded-2xl border border-purple-800/60 bg-[#0c041a] p-5 shadow-[0_0_30px_rgba(168,85,247,0.2)]">
          <div>
            <h3 className="flex items-center gap-2 text-xs font-mono font-bold text-purple-300 uppercase tracking-widest border-b border-purple-900/40 pb-2 mb-3">
              <Shield className="w-4 h-4 text-purple-400" />
              <span>Diretrizes da Mesa Online</span>
            </h3>

            <div className="space-y-2.5 text-xs font-mono text-slate-300">
              <div className="p-2.5 rounded-lg bg-black/40 border border-purple-950">
                <span className="text-purple-400 font-bold block mb-0.5">Sincronização Server-Side:</span>
                <p className="text-[11px] text-slate-400">
                  O servidor é a fonte única de verdade. Eventos de entrada, saída e assentos são refletidos instantaneamente via Socket.IO.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-black/40 border border-purple-950">
                <span className="text-purple-400 font-bold block mb-0.5">Isolamento de Partidas:</span>
                <p className="text-[11px] text-slate-400">
                  Cada sala possui código privativo. Jogadores de outras mesas não recebem nem interferem nos seus eventos.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-black/40 border border-purple-950">
                <span className="text-purple-400 font-bold block mb-0.5">Reconexão Suportada:</span>
                <p className="text-[11px] text-slate-400">
                  Se a conexão oscilar, seu token de sessão mantém seu assento reservado na mesa.
                </p>
              </div>
            </div>

            {/* Live Room Activity Feed */}
            <h3 className="flex items-center gap-2 text-xs font-mono font-bold text-purple-300 uppercase tracking-widest border-b border-purple-900/40 pb-2 mt-5 mb-2">
              <RotateCcw className="w-3.5 h-3.5 text-purple-400" />
              <span>Registro de Atividade da Sala</span>
            </h3>

            <div className="h-44 overflow-y-auto space-y-1 rounded-xl bg-black/50 p-2.5 border border-purple-900/40 font-mono text-[10px] text-purple-300/80">
              {activityLogs.map((log, i) => (
                <div key={i} className="leading-tight py-0.5">
                  {log}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-purple-900/40 text-center">
            <span className="text-[10px] font-mono text-slate-500">
              Sessão ID: {currentPlayerId.substring(0, 10)}... • Truco Paulista
            </span>
          </div>
        </div>
      </div>
    </main>
  );
};
