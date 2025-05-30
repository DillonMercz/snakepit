import React, { useRef, useState, useEffect } from 'react';
import { GameMode } from '../App';
import GameUI from './GameUI';
import GameCanvas from './GameCanvas';
import Minimap from './Minimap';
import Instructions from './Instructions';
import GameOver from './GameOver';
import CashoutSuccess from './CashoutSuccess';
import ControllerStatus from './ControllerStatus';
import { useAuth } from '../contexts/AuthContext';
import { GameStatsService } from '../services/GameStatsService';

interface GameContainerProps {
  gameMode: GameMode;
  onBackToMenu: () => void;
  // Network related props
  networkManager?: any;
  isConnected?: boolean;
  playerId?: string | null;
  roomId?: string | null;
  connectionError?: string | null;
}

export interface GameState {
  score: number;
  cashBalance?: number; // Cash balance for gambling mechanics
  length: number;
  boost: number;
  weapon: string;
  weaponAmmo?: string;
  weaponTier?: string;
  weaponSlots?: {
    primary: string;
    secondary: string;
    sidearm: string;
  };
  currentSlot?: string;
  cooldown: string;
  cooldownProgress?: number; // 0-100 percentage for progress bar
  ammoInventory?: Record<string, number>; // ammo type -> amount
  isGameOver: boolean;
  finalScore: number;
  finalLength: number;
  cashedOut?: boolean;
  cashoutAmount?: number;
}

const GameContainer: React.FC<GameContainerProps> = ({ 
  gameMode, 
  onBackToMenu,
  networkManager,
  isConnected,
  playerId,
  roomId,
  connectionError
}) => {
  const { user, userProfile } = useAuth();

  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    length: 3,
    boost: 100,
    weapon: 'None',
    cooldown: 'Ready',
    isGameOver: false,
    finalScore: 0,
    finalLength: 0
  });

  const gameInstanceRef = useRef<any>(null);
  const gameStartTimeRef = useRef<number>(Date.now());
  const gameResultSavedRef = useRef<boolean>(false);

  // Reset game start time when component mounts
  useEffect(() => {
    gameStartTimeRef.current = Date.now();
    gameResultSavedRef.current = false;
  }, []);

  // Save game result when game ends
  useEffect(() => {
    if (gameState.isGameOver && !gameResultSavedRef.current && user && userProfile && gameMode) {
      saveGameResult();
    }
  }, [gameState.isGameOver, user, userProfile, gameMode]);

  const saveGameResult = async () => {
    if (!user || !userProfile || !gameMode || gameResultSavedRef.current) return;

    gameResultSavedRef.current = true;

    const durationSeconds = GameStatsService.calculateGameDuration(gameStartTimeRef.current);
    const wagerAmount = 50; // Default wager - this should come from game setup

    const result = {
      userId: user.id,
      username: userProfile.username,
      gameMode: gameMode as 'classic' | 'warfare',
      wagerAmount,
      finalScore: gameState.finalScore,
      finalLength: gameState.finalLength,
      finalCash: gameState.cashBalance || gameState.finalScore,
      durationSeconds,
      cashedOut: gameState.cashedOut || false
    };

    const success = await GameStatsService.saveGameResult(result);
    if (!success) {
      console.error('Failed to save game result');
    }
  };

  const handleRestart = () => {
    console.log('🔄🔄🔄 HANDLE RESTART CALLED 🔄🔄🔄');

    // Reset tracking state
    gameStartTimeRef.current = Date.now();
    gameResultSavedRef.current = false;

    setGameState({
      score: 0,
      length: 3,
      boost: 100,
      weapon: 'None',
      cooldown: 'Ready',
      isGameOver: false,
      finalScore: 0,
      finalLength: 0
    });

    // Restart the game instance
    if (gameInstanceRef.current && gameInstanceRef.current.restart) {
      gameInstanceRef.current.restart();
    }
  };

  const handleCashOut = async () => {
    if (gameInstanceRef.current && gameInstanceRef.current.cashOut) {
      gameInstanceRef.current.cashOut();

      // Record the cashout if user is authenticated
      if (user && userProfile && gameMode) {
        const cashoutAmount = gameState.cashBalance || gameState.score;
        await GameStatsService.recordCashout(
          user.id,
          userProfile.username,
          gameMode as 'classic' | 'warfare',
          cashoutAmount
        );
      }
    }
  };

  return (
    <div className="game-container scanlines">
      <div className="game-canvas">
        {/* Conditional rendering for PvP modes based on network state */}
        {(gameMode === 'classic_pvp' || gameMode === 'warfare_pvp') ? (
          <>
            {connectionError && (
              <div className="connection-status error-message">
                <p>Connection Error: {connectionError}</p>
                <button onClick={onBackToMenu} className="menu-button">Back to Menu</button>
              </div>
            )}
            {!isConnected && !connectionError && (
              <div className="connection-status">
                <p>Connecting to server...</p>
                {/* <button onClick={onBackToMenu} className="menu-button">Cancel</button> */}
              </div>
            )}
            {isConnected && !connectionError && (
              <GameCanvas
                gameMode={gameMode}
                gameInstanceRef={gameInstanceRef}
                onGameStateUpdate={setGameState}
                networkManager={networkManager} 
                localPlayerId={playerId}      
              />
            )}
          </>
        ) : (
          // Original rendering for non-PvP modes
          <GameCanvas
            gameMode={gameMode}
            gameInstanceRef={gameInstanceRef}
            onGameStateUpdate={setGameState}
          />
        )}

        {/* Overlay UI elements, rendered if GameCanvas is supposed to be active */}
        {((gameMode === 'classic_pvp' || gameMode === 'warfare_pvp') ? (isConnected && !connectionError) : true) && (
          <>
            <GameUI
              gameState={gameState}
              gameMode={gameMode}
              onCashOut={handleCashOut}
            />
            <Minimap gameInstanceRef={gameInstanceRef} />
            <Instructions gameMode={gameMode} />
            <ControllerStatus gameInstanceRef={gameInstanceRef} />
          </>
        )}
      </div>

      {/* Game Over / Cashout Success Modals, also conditional on game being active */}
      {((gameMode === 'classic_pvp' || gameMode === 'warfare_pvp') ? (isConnected && !connectionError) : true) && (
        <>
          {gameState.isGameOver && !gameState.cashedOut && (
            <GameOver
              finalScore={gameState.finalScore}
              finalLength={gameState.finalLength}
              onRestart={handleRestart}
              onBackToMenu={onBackToMenu}
            />
          )}
          {gameState.cashedOut && (
            <CashoutSuccess
              cashoutAmount={gameState.cashoutAmount || 0}
              onRestart={handleRestart}
              onBackToMenu={onBackToMenu}
            />
          )}
        </>
      )}
    </div>
  );
};

export default GameContainer;
        <GameOver
          finalScore={gameState.finalScore}
          finalLength={gameState.finalLength}
          onRestart={handleRestart}
          onBackToMenu={onBackToMenu}
        />
      )}

      {gameState.cashedOut && (
        <CashoutSuccess
          cashoutAmount={gameState.cashoutAmount || 0}
          onRestart={handleRestart}
          onBackToMenu={onBackToMenu}
        />
      )}
    </div>
  );
};

export default GameContainer;