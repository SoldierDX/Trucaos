/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { GameMode, RoomState, PublicRoomSummary } from '../types/multiplayer';
import { GameSettings } from '../types/game';
import { socketService } from '../services/socket';
import { playClickSound } from '../utils/audio';
import {
  ArrowLeft,
  Users,
  User,
  PlusCircle,
  LogIn,
  Sparkles,
  Wifi,
  WifiOff,
  Flame,
  Swords,
  Shield,
  Layers,
  Check,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

interface LobbyScreenProps {
  settings: GameSettings;
  onNavigateHome: () => void;
  onRoomJoined: (room: RoomState) => void;
}

export const LobbyScreen: React.FC<LobbyScreenProps> = ({
  settings,
  onNavigateHome,
  onRoomJoined,
}) => {
  const [playerName, setPlayerName] = useState(socketService.getPlayerName());
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(playerName);
  const [isConnected, setIsConnected] = useState(socketService.isConnected());

  // Room Creation state
  const [createMode, setCreateMode] = useState<GameMode>('2v2');
  const [roomNameInput, setRoomNameInput] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Room Join state
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  // Error and feedback toast
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  // Public rooms list
  const [publicRooms, setPublicRooms] = useState<PublicRoomSummary[]>([]);

  useEffect(() => {
    socketService.connect();
    setIsConnected(socketService.isConnected());

    const unsubConnection = socketService.on('connectionChange', (status: boolean) => {
      setIsConnected(status);
    });

    const unsubRooms = socketService.on('lobby:publicRooms', (rooms: PublicRoomSummary[]) => {
      setPublicRooms(rooms);
    });

    const unsubError = socketService.on('room:error', (msg: string) => {
      setFeedbackError(msg);
    });

    return () => {
      unsubConnection();
      unsubRooms();
      unsubError();
    };
  }, []);

  const handleSaveName = () => {
    const clean = nameInput.trim();
    if (clean) {
      setPlayerName(clean);
      socketService.setPlayerName(clean);
      setIsEditingName(false);
      playClickSound(settings.audioMuted);
    }
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackError(null);
    setIsCreating(true);
    playClickSound(settings.audioMuted);

    // Save name first if changed
    if (nameInput.trim() !== playerName) {
      handleSaveName();
    }

    try {
      const res = await socketService.createRoom(
        createMode,
        roomNameInput.trim() || undefined
      );
      if (res.success && res.room) {
        onRoomJoined(res.room);
      } else {
        setFeedbackError(res.error || 'Erro ao criar a sala.');
      }
    } catch {
      setFeedbackError('Falha na comunicação com o servidor.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinWithCode = async (codeToJoin?: string) => {
    const targetCode = (codeToJoin || joinCodeInput).trim().toUpperCase();
    if (!targetCode) {
      setFeedbackError('Por favor, digite o código da sala.');
      return;
    }

    setFeedbackError(null);
    setIsJoining(true);
    playClickSound(settings.audioMuted);

    if (nameInput.trim() !== playerName) {
      handleSaveName();
    }

    try {
      const res = await socketService.joinRoom(targetCode);
      if (res.success && res.room) {
        onRoomJoined(res.room);
      } else {
        setFeedbackError(res.error || 'Não foi possível entrar na sala.');
      }
    } catch {
      setFeedbackError('Falha ao conectar com a sala.');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <main className="relative flex-1 flex flex-col px-4 py-6 sm:px-8 max-w-7xl mx-auto w-full">
      {/* Top Bar with Navigation */}
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
              <Swords className="w-3.5 h-3.5 text-purple-400" />
              <span>ARENA MULTIPLAYER ONLINE // TEMPO REAL</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-serif font-black text-white tracking-wide">
              Lobby de Salas Arcanas
            </h1>
          </div>
        </div>

        {/* Server Connection Status Indicator */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${
              isConnected
                ? 'border-emerald-600/60 bg-emerald-950/40 text-emerald-300'
                : 'border-rose-600/60 bg-rose-950/40 text-rose-300 animate-pulse'
            }`}
          >
            {isConnected ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span>ONLINE // SERVIDOR CONECTADO</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-rose-400" />
                <span>RECONECTANDO...</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Error / Alert banner */}
      {feedbackError && (
        <div className="mt-4 flex items-center justify-between rounded-xl border border-rose-500/60 bg-rose-950/60 p-3 text-xs font-mono text-rose-200 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{feedbackError}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackError(null)}
            className="text-rose-400 hover:text-rose-200 text-xs ml-2 underline"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Section 1: Player Identity Setup Card */}
      <div className="mt-5 rounded-2xl border border-purple-800/50 bg-purple-950/30 p-4 sm:p-5 backdrop-blur-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl border-2 border-purple-400 bg-black/60 flex items-center justify-center text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
            <User className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-mono text-purple-400 uppercase tracking-widest block">
              Identificação na Sessão
            </span>
            {isEditingName ? (
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  maxLength={18}
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                  placeholder="Seu nome ou apelido"
                  className="rounded-lg border border-purple-500 bg-black/70 px-2.5 py-1 text-sm font-mono text-white focus:outline-hidden focus:ring-1 focus:ring-purple-400"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleSaveName}
                  className="px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono font-bold transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-lg font-bold text-white font-mono">{playerName}</span>
                <button
                  type="button"
                  onClick={() => setIsEditingName(true)}
                  className="text-[11px] font-mono text-purple-400 hover:text-purple-200 underline decoration-purple-600 cursor-pointer"
                >
                  [Alterar Nome]
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="text-right text-[11px] font-mono text-slate-400">
          <span>Sem cadastro ou senhas • Identificação instantânea por sessão</span>
        </div>
      </div>

      {/* Section 2: Create Room & Join Room Split Grid */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Create Room */}
        <div className="lg:col-span-7 rounded-2xl border border-purple-700/60 bg-[#0c041a] p-6 shadow-[0_0_30px_rgba(168,85,247,0.2)]">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-purple-300 mb-2">
            <PlusCircle className="w-4 h-4 text-purple-400" />
            <span>CRIAR NOVA SALA PRIVADA</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-black text-white">
            Fundar Mesa de Truco
          </h2>
          <p className="text-xs font-mono text-slate-400 mt-1 mb-5">
            Gera um código exclusivo de acesso para compartilhar com amigos.
          </p>

          <form onSubmit={handleCreateRoom} className="space-y-4">
            {/* Game Mode Selector */}
            <div>
              <label className="block text-xs font-mono text-purple-300 font-bold mb-2">
                MODALIDADE DE JOGO:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setCreateMode('2v2');
                    playClickSound(settings.audioMuted);
                  }}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    createMode === '2v2'
                      ? 'border-purple-400 bg-purple-900/60 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]'
                      : 'border-purple-900/40 bg-black/40 text-slate-400 hover:border-purple-700 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-sm">TRUCO EM DUPLAS (2v2)</span>
                    <Users className="w-4 h-4 text-purple-400" />
                  </div>
                  <span className="text-[11px] font-mono text-purple-300/80 block">
                    4 Jogadores • Mesa Tradicional Paulista
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCreateMode('1v1');
                    playClickSound(settings.audioMuted);
                  }}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    createMode === '1v1'
                      ? 'border-purple-400 bg-purple-900/60 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]'
                      : 'border-purple-900/40 bg-black/40 text-slate-400 hover:border-purple-700 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-sm">DUELO INDIVIDUAL (1v1)</span>
                    <Swords className="w-4 h-4 text-purple-400" />
                  </div>
                  <span className="text-[11px] font-mono text-purple-300/80 block">
                    2 Jogadores • Confronto Direto
                  </span>
                </button>
              </div>
            </div>

            {/* Custom Room Name */}
            <div>
              <label htmlFor="room-name-input" className="block text-xs font-mono text-purple-300 font-bold mb-1">
                TÍTULO DA MESA (OPCIONAL):
              </label>
              <input
                id="room-name-input"
                type="text"
                maxLength={30}
                value={roomNameInput}
                onChange={(e) => setRoomNameInput(e.target.value)}
                placeholder="Ex: Toca do Zap, Mesa dos Mestres..."
                className="w-full rounded-xl border border-purple-800/60 bg-black/60 px-3.5 py-2.5 text-xs font-mono text-white placeholder:text-purple-400/40 focus:border-purple-400 focus:outline-hidden focus:ring-1 focus:ring-purple-400"
              />
            </div>

            <button
              type="submit"
              disabled={isCreating}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-700 via-purple-600 to-fuchsia-600 hover:from-purple-600 hover:to-fuchsia-500 text-white font-mono font-bold text-sm tracking-wider transition-all shadow-[0_0_25px_rgba(168,85,247,0.5)] cursor-pointer disabled:opacity-50"
            >
              {isCreating ? 'CRIANDO MESA...' : '⚡ CRIAR SALA E AGUARDAR JOGADORES'}
            </button>
          </form>
        </div>

        {/* Right Column: Join with Code */}
        <div className="lg:col-span-5 rounded-2xl border border-purple-700/60 bg-[#0c041a] p-6 shadow-[0_0_30px_rgba(168,85,247,0.2)] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-purple-300 mb-2">
              <LogIn className="w-4 h-4 text-purple-400" />
              <span>ENTRAR COM CÓDIGO</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-black text-white">
              Entrar em Mesa Privada
            </h2>
            <p className="text-xs font-mono text-slate-400 mt-1 mb-5">
              Recebeu o código de um anfitrião? Digite abaixo para sentar à mesa.
            </p>

            <div className="space-y-4">
              <div>
                <label htmlFor="room-code-input" className="block text-xs font-mono text-purple-300 font-bold mb-1">
                  CÓDIGO DA SALA:
                </label>
                <div className="relative">
                  <input
                    id="room-code-input"
                    type="text"
                    maxLength={12}
                    value={joinCodeInput}
                    onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === 'Enter' && handleJoinWithCode()}
                    placeholder="EX: ZAP-492"
                    className="w-full rounded-xl border border-purple-800/80 bg-black/70 px-4 py-3 text-center text-lg font-mono font-bold tracking-widest text-purple-200 placeholder:text-purple-500/40 focus:border-purple-400 focus:outline-hidden focus:ring-2 focus:ring-purple-400"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleJoinWithCode()}
                disabled={isJoining || !joinCodeInput.trim()}
                className="w-full py-3 px-4 rounded-xl border border-purple-400 bg-purple-900/50 hover:bg-purple-800 text-purple-100 font-mono font-bold text-xs tracking-wider transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] cursor-pointer disabled:opacity-40"
              >
                {isJoining ? 'CONECTANDO À MESA...' : 'CONECTAR À SALA'}
              </button>
            </div>
          </div>

          {/* Quick instructions box */}
          <div className="mt-6 p-3 rounded-xl border border-purple-900/40 bg-purple-950/30 text-[11px] font-mono text-slate-400 space-y-1">
            <div className="text-purple-300 font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>DICA DE CONEXÃO:</span>
            </div>
            <p>
              O anfitrião da sala pode copiar o código da sala e enviar para você. Assim que entrar, você pode escolher seu assento na mesa.
            </p>
          </div>
        </div>
      </div>

      {/* Section 3: Live Public Rooms List */}
      <div className="mt-8 rounded-2xl border border-purple-900/40 bg-purple-950/20 p-5 backdrop-blur-xs">
        <div className="flex items-center justify-between mb-4 border-b border-purple-900/40 pb-3">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-mono font-bold text-purple-200 tracking-wider">
              MESAS ABERTAS NO SERVIDOR ({publicRooms.length})
            </h3>
          </div>
          <span className="text-[11px] font-mono text-purple-400">
            Atualização em tempo real via WebSocket
          </span>
        </div>

        {publicRooms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {publicRooms.map((r) => {
              const isFull = r.playersCount >= r.maxPlayers;
              return (
                <div
                  key={r.code}
                  className="rounded-xl border border-purple-900/60 bg-black/50 p-3.5 flex flex-col justify-between hover:border-purple-500/70 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono font-bold text-white truncate max-w-[160px]">
                        {r.name}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/80 border border-purple-800 text-purple-300">
                        {r.gameMode}
                      </span>
                    </div>

                    <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between mt-2">
                      <span>Anfitrião: <strong className="text-purple-300">{r.hostName}</strong></span>
                      <span className={isFull ? 'text-rose-400' : 'text-emerald-400'}>
                        {r.playersCount}/{r.maxPlayers} Jogadores
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-purple-900/40 flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-purple-200 tracking-widest">
                      {r.code}
                    </span>
                    <button
                      type="button"
                      disabled={isFull}
                      onClick={() => handleJoinWithCode(r.code)}
                      className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                        isFull
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          : 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_10px_rgba(168,85,247,0.4)] cursor-pointer'
                      }`}
                    >
                      {isFull ? 'MESA CHEIA' : 'ENTRAR NA MESA'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center text-xs font-mono text-slate-500">
            Nenhuma mesa pública aberta no momento. Crie a primeira sala acima e chame seus amigos!
          </div>
        )}
      </div>
    </main>
  );
};
