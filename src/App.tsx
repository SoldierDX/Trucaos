/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Card, GameSettings, ScreenState } from './types/game';
import { RoomState } from './types/multiplayer';
import { HeaderBar } from './components/HeaderBar';
import { FooterBar } from './components/FooterBar';
import { HomeScreen } from './views/HomeScreen';
import { DeckScreen } from './views/DeckScreen';
import { LobbyScreen } from './views/LobbyScreen';
import { RoomScreen } from './views/RoomScreen';
import { CardDetailModal } from './components/CardDetailModal';
import { RulesModal } from './components/RulesModal';
import { SettingsModal } from './components/SettingsModal';
import { FeaturePreviewModal } from './components/FeaturePreviewModal';
import { socketService } from './services/socket';
import { playCardFlipSound, playClickSound } from './utils/audio';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenState>('HOME');
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [activeRoom, setActiveRoom] = useState<RoomState | null>(null);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [previewModal, setPreviewModal] = useState<{
    isOpen: boolean;
    title: string;
    subtitle: string;
  }>({
    isOpen: false,
    title: '',
    subtitle: '',
  });

  const [settings, setSettings] = useState<GameSettings>({
    crtEnabled: true,
    audioMuted: false,
    soundVolume: 0.8,
    shaderSpeed: 'NORMAL',
    language: 'PT-BR',
  });

  // Listen for socket connection and room updates
  useEffect(() => {
    socketService.connect();

    const unsubRoom = socketService.on('room:updated', (updatedRoom: RoomState) => {
      setActiveRoom(updatedRoom);
      if (currentScreen !== 'ROOM') {
        setCurrentScreen('ROOM');
      }
    });

    return () => {
      unsubRoom();
    };
  }, [currentScreen]);

  // Global TAB listener for quick access to rules
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        setIsRulesOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const handleUpdateSettings = (newSettings: Partial<GameSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const handleSelectCard = (card: Card) => {
    playCardFlipSound(settings.audioMuted);
    setSelectedCard(card);
  };

  const handleOpenChallengesPreview = () => {
    setPreviewModal({
      isOpen: true,
      title: 'Modo Desafios & Mesa Sinistra',
      subtitle: 'Mão de Onze Suprema e Batalhas com Modificadores Arcanos',
    });
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-[#07010f] text-slate-100 overflow-x-hidden select-none">
      {/* CRT Scanline Overlay Effect */}
      {settings.crtEnabled && (
        <>
          <div className="fixed inset-0 z-40 crt-overlay pointer-events-none" />
          <div className="fixed inset-0 z-40 crt-vignette pointer-events-none" />
        </>
      )}

      {/* Atmospheric Background Ambient Grid */}
      <div
        className="fixed inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `linear-gradient(to right, #4c1d95 1px, transparent 1px), linear-gradient(to bottom, #4c1d95 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />

      {/* Top Header Bar */}
      <HeaderBar
        settings={settings}
        onToggleCrt={() => {
          playClickSound(settings.audioMuted);
          setSettings((prev) => ({ ...prev, crtEnabled: !prev.crtEnabled }));
        }}
        onToggleAudio={() => {
          setSettings((prev) => ({ ...prev, audioMuted: !prev.audioMuted }));
        }}
        onOpenSettings={() => {
          playClickSound(settings.audioMuted);
          setIsSettingsOpen(true);
        }}
        onOpenRules={() => {
          playClickSound(settings.audioMuted);
          setIsRulesOpen(true);
        }}
      />

      {/* Active Screen View */}
      {currentScreen === 'HOME' && (
        <HomeScreen
          settings={settings}
          onNavigateToDeck={() => setCurrentScreen('BARALHO')}
          onNavigateToLobby={() => setCurrentScreen('LOBBY')}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenRules={() => setIsRulesOpen(true)}
          onOpenChallengesPreview={handleOpenChallengesPreview}
          onSelectCard={handleSelectCard}
        />
      )}

      {currentScreen === 'BARALHO' && (
        <DeckScreen
          settings={settings}
          onNavigateHome={() => setCurrentScreen('HOME')}
          onSelectCard={handleSelectCard}
        />
      )}

      {currentScreen === 'LOBBY' && (
        <LobbyScreen
          settings={settings}
          onNavigateHome={() => setCurrentScreen('HOME')}
          onRoomJoined={(room) => {
            setActiveRoom(room);
            setCurrentScreen('ROOM');
          }}
        />
      )}

      {currentScreen === 'ROOM' && activeRoom && (
        <RoomScreen
          room={activeRoom}
          settings={settings}
          onLeaveRoom={() => {
            setActiveRoom(null);
            setCurrentScreen('LOBBY');
          }}
        />
      )}

      {/* Footer Bar */}
      <FooterBar
        settings={settings}
        onOpenRules={() => setIsRulesOpen(true)}
        onToggleAudio={() => {
          setSettings((prev) => ({ ...prev, audioMuted: !prev.audioMuted }));
        }}
      />

      {/* Modals */}
      <CardDetailModal
        card={selectedCard}
        onClose={() => setSelectedCard(null)}
      />

      <RulesModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onClose={() => setIsSettingsOpen(false)}
      />

      <FeaturePreviewModal
        isOpen={previewModal.isOpen}
        title={previewModal.title}
        subtitle={previewModal.subtitle}
        onNavigateToDeck={() => setCurrentScreen('BARALHO')}
        onClose={() => setPreviewModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
