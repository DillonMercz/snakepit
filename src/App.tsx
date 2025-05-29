import React, { useState, useEffect } from 'react';
import './snakepit-theme.css';
import LegalOverlay from './components/LegalOverlay';
import GameModeSelect from './components/GameModeSelect';
import GameContainer from './components/GameContainer';
import AudioManager from './utils/AudioManager';
import { AuthProvider } from './contexts/AuthContext';

export type GameMode = 'classic' | 'warfare' | null;

interface UserData {
  username: string;
  wager: number;
  xrpBalance: number;
}

function App() {
  const [legalAccepted, setLegalAccepted] = useState(false);
  const [gameMode, setGameMode] = useState<GameMode>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);

  const handleLegalComplete = () => {
    setLegalAccepted(true);
  };

  const handleModeSelect = (mode: GameMode, userData: UserData, isMultiplayer?: boolean, roomId?: string) => {
    setGameMode(mode);
    setUserData(userData);
    if (roomId) {
      setRoomId(roomId);
    }
    setGameStarted(true);
  };

  const handleBackToMenu = async () => {
    try {
      // Transition back to menu music
      const audioManager = AudioManager.getInstance();
      await audioManager.playTrack('menu', {
        volume: 0.6,
        loop: true,
        fadeInDuration: 1500,
        fadeOutDuration: 1000
      });
      console.log('Transitioned back to menu music');
    } catch (error) {
      console.error('Failed to transition audio back to menu:', error);
    }

    setGameMode(null);
    setUserData(null);
    setGameStarted(false);
    setRoomId(null);
  };

  // Manage body class for overflow control
  useEffect(() => {
    if (gameStarted) {
      document.body.classList.add('game-active');
    } else {
      document.body.classList.remove('game-active');
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove('game-active');
    };
  }, [gameStarted]);

  return (
    <AuthProvider>
      <div className="snakepit-app">
        {!legalAccepted ? (
          <LegalOverlay onComplete={handleLegalComplete} />
        ) : !gameStarted ? (
          <GameModeSelect
            onModeSelect={handleModeSelect}
          />
        ) : (
          <GameContainer
            gameMode={gameMode}
            onBackToMenu={handleBackToMenu}
            roomId={roomId}
          />
        )}
      </div>
    </AuthProvider>
  );
}

export default App;
