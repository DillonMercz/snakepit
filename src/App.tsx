import React, { useState, useEffect } from 'react';
import './snakepit-theme.css';
import LegalOverlay from './components/LegalOverlay';
import GameModeSelect from './components/GameModeSelect';
import GameContainer from './components/GameContainer';
import AudioManager from './utils/AudioManager';
import { AuthProvider } from './contexts/AuthContext';
// Assuming NetworkManager is a singleton instance exported from this path
import networkManagerInstance from './utils/NetworkManager'; 
import AuthTest from './components/AuthTest';

export type GameMode = 'classic' | 'warfare' | 'classic_pvp' | 'warfare_pvp' | null;

interface UserData {
  username: string;
  wager: number;
  xrpBalance: number;
}

function App() {
  const [legalAccepted, setLegalAccepted] = useState(false);
  const [gameMode, setGameMode] = useState<GameMode>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);

  // Network state
  const [networkManager] = useState<any>(networkManagerInstance); // Hold the instance
  const [isConnected, setIsConnected] = useState(false);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const handleLegalComplete = () => {
    setLegalAccepted(true);
  };

  const handleModeSelect = (mode: GameMode, selectedUserData: UserData) => {
    setUserData(selectedUserData); // Set userData first

    if (mode === 'classic_pvp' || mode === 'warfare_pvp') {
      if (networkManager) {
        setConnectionError(null); // Clear previous errors
        // Show "Connecting..." or similar in UI based on isConnected and connectionError states
        
        networkManager.onGameJoined = (data: { playerId: string; roomId: string; gameMode: GameMode; players: any[] }) => {
          console.log('App: GameJoined!', data);
          setPlayerId(data.playerId);
          setRoomId(data.roomId);
          setIsConnected(true);
          setConnectionError(null);
          setGameMode(mode); // Set gameMode after successful join confirmation
          setGameStarted(true);
        };
        networkManager.onConnectionError = (error: string) => {
          console.error('App: Connection Error:', error);
          setConnectionError(error || 'Failed to connect to the server.');
          setIsConnected(false);
          setGameMode(null); // Reset game mode on error
          setGameStarted(false); 
        };
        networkManager.onDisconnected = (reason: string) => {
          console.log('App: Disconnected:', reason);
          setIsConnected(false);
          setPlayerId(null);
          setRoomId(null);
          setConnectionError(`Disconnected: ${reason}`);
          setGameMode(null); // Reset game mode
          setGameStarted(false); // Ensure game stops
          // Optionally, navigate back to a main menu or show a disconnected message
        };

        // Initiate connection
        console.log("App: Attempting to connect NetworkManager...");
        networkManager.connect()
          .then(() => {
            console.log("App: NetworkManager connected. Attempting to join game...");
            if (selectedUserData) { // Ensure userData is available
                 networkManager.joinGame({ 
                    gameMode: mode, 
                    username: selectedUserData.username, 
                    wager: selectedUserData.wager, 
                    color: '#'+Math.floor(Math.random()*16777215).toString(16) // Random color for now
                });
            } else {
                console.error("App: UserData not available for joinGame call.");
                setConnectionError("User data not found, cannot join game.");
            }
          })
          .catch((err: any) => {
            console.error("App: NetworkManager connection failed:", err);
            // The onConnectionError callback should handle state updates.
            // Calling it directly if the promise rejects early.
            networkManager.onConnectionError(err.message || 'Connection failed.');
          });
      } else {
        console.error("App: NetworkManager instance not available.");
        setConnectionError("NetworkManager not initialized.");
      }
    } else {
      // Handle non-PvP modes
      if (networkManager && networkManager.isConnected()) {
        networkManager.disconnect();
      }
      setIsConnected(false);
      setPlayerId(null);
      setRoomId(null);
      setConnectionError(null);
      setGameMode(mode);
      setGameStarted(true);
    }
  };

  const handleBackToMenu = async () => {
    if (networkManager && isConnected) {
      networkManager.disconnect(); // Disconnect if in a multiplayer game
    }
    setIsConnected(false);
    setPlayerId(null);
    setRoomId(null);
    setConnectionError(null);
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
    setUserData(null); // Also clear userData
    setGameStarted(false);
  };
  
  // App unmount cleanup
  useEffect(() => {
    return () => {
      if (networkManager && networkManager.isConnected()) {
        networkManager.disconnect();
      }
    };
  }, [networkManager]);

  // Manage body class for overflow control
  useEffect(() => {
    if (gameStarted) {
      document.body.classList.add('game-active');
    } else {
      document.body.classList.remove('game-active');
    }

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
            isConnecting={gameMode && (gameMode === 'classic_pvp' || gameMode === 'warfare_pvp') && !isConnected && !connectionError}
            connectionError={connectionError}
          />
        ) : (
          <GameContainer
            gameMode={gameMode}
            onBackToMenu={handleBackToMenu}
            // Network props for GameContainer
            networkManager={networkManager}
            isConnected={isConnected}
            playerId={playerId}
            roomId={roomId}
            connectionError={connectionError}
          />
        )}
      </div>
    </AuthProvider>
  );
}

export default App;
