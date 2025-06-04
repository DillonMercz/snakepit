import React, { useRef, useState, useEffect } from 'react';
import { GameMode } from '../App';
import GameUI from './GameUI';
import GameCanvas from './GameCanvas';
import Minimap from './Minimap';
import Instructions from './Instructions';
import GameOver from './GameOver';
import CashoutSuccess from './CashoutSuccess';
import ControllerStatus from './ControllerStatus';
import EliminationBanner from './EliminationBanner';
import { useAuth } from '../contexts/AuthContext';
import { GameStatsService } from '../services/GameStatsService';

interface GameContainerProps {
  gameMode: GameMode;
  onBackToMenu: () => void;
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
  powerupInventory?: Array<{
    type: string;
    name: string;
    duration?: number;
    damageReduction?: number;
    headProtection?: number;
    boostDamage?: number;
    speedBoost?: number;
    helmetHealth?: number;
    description?: string;
  }>; // powerup inventory
  activePowerups?: Array<{
    type: string;
    name: string;
    duration?: number;
    expirationTime: number;
    damageReduction?: number;
    headProtection?: number;
    boostDamage?: number;
    speedBoost?: number;
    helmetHealth?: number;
    description?: string;
  }>; // active powerups
  isGameOver: boolean;
  finalScore: number;
  finalLength: number;
  cashedOut?: boolean;
  cashoutAmount?: number;
  isKing?: boolean; // Whether this player is currently the king (highest cash)
}

const GameContainer: React.FC<GameContainerProps> = ({ gameMode, onBackToMenu }) => {
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

  // Elimination banner state
  const [eliminations, setEliminations] = useState<Array<{
    id: string;
    killerName: string;
    victimName: string;
    weapon: string;
    method: 'headshot' | 'bodyshot' | 'collision' | 'segments';
    timestamp: number;
  }>>([]);

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

    // Debug logging to identify the issue
    console.log('🔍 Debug saveGameResult parameters:', {
      userId: result.userId,
      username: result.username,
      gameMode: result.gameMode,
      wagerAmount: result.wagerAmount,
      finalScore: result.finalScore,
      finalLength: result.finalLength,
      finalCash: result.finalCash,
      durationSeconds: result.durationSeconds,
      cashedOut: result.cashedOut,
      gameStartTime: gameStartTimeRef.current,
      currentTime: Date.now()
    });

    // Validate parameters before sending to server
    if (!result.userId || !result.username || !result.gameMode) {
      console.error('❌ Missing required user/game parameters');
      return;
    }

    if (isNaN(result.wagerAmount) || result.wagerAmount <= 0) {
      console.error('❌ Invalid wager amount:', result.wagerAmount);
      return;
    }

    if (isNaN(result.finalScore) || result.finalScore < 0) {
      console.error('❌ Invalid final score:', result.finalScore);
      return;
    }

    if (isNaN(result.finalLength) || result.finalLength < 0) {
      console.error('❌ Invalid final length:', result.finalLength);
      return;
    }

    if (isNaN(result.finalCash) || result.finalCash < 0) {
      console.error('❌ Invalid final cash:', result.finalCash);
      return;
    }

    if (isNaN(result.durationSeconds) || result.durationSeconds <= 0) {
      console.error('❌ Invalid duration seconds:', result.durationSeconds);
      return;
    }

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

  const handleElimination = (eliminationData: any) => {
    setEliminations(prev => [...prev, eliminationData]);
  };

  const handleEliminationExpire = (eliminationId: string) => {
    setEliminations(prev => prev.filter(e => e.id !== eliminationId));
  };

  return (
    <div className="game-container scanlines">
      <div className="game-canvas">
        <GameCanvas
          gameMode={gameMode}
          gameInstanceRef={gameInstanceRef}
          onGameStateUpdate={setGameState}
          onElimination={handleElimination}
        />

        {/* Overlay UI elements on top of the game canvas */}
        <GameUI
          gameState={gameState}
          gameMode={gameMode}
          onCashOut={handleCashOut}
        />

        <Minimap gameInstanceRef={gameInstanceRef} />

        <Instructions gameMode={gameMode} />

        <ControllerStatus gameInstanceRef={gameInstanceRef} />

        {/* Elimination Banner */}
        <EliminationBanner
          eliminations={eliminations}
          onEliminationExpire={handleEliminationExpire}
        />
      </div>

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
    </div>
  );
};

export default GameContainer;