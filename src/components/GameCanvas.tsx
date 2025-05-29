import React, { useEffect, useRef } from 'react';
import { GameMode } from '../App';
import { GameState } from './GameContainer';

// Module-level flag to prevent double initialization in React Strict Mode
let gameInitialized = false;

interface GameCanvasProps {
  gameMode: GameMode;
  gameInstanceRef: React.MutableRefObject<any>;
  onGameStateUpdate: (state: GameState) => void;
  roomId?: string | null; // For multiplayer mode
}

const GameCanvas: React.FC<GameCanvasProps> = ({
  gameMode,
  gameInstanceRef,
  onGameStateUpdate,
  roomId
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const initializingRef = useRef<boolean>(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Prevent double initialization (React Strict Mode protection)
    if (gameInitialized || gameInstanceRef.current || initializingRef.current) {
      console.log('Game already initialized, skipping initialization');
      return;
    }

    gameInitialized = true;
    initializingRef.current = true;

    // Import and initialize the game logic
    const initializeGame = async () => {
      try {
        // Import the game logic
        const { Game } = await import('../gameLogic.js');

        // Initialize the game with the canvas and mode
        const gameInstance = new Game(canvasRef.current, gameMode || 'classic');
        gameInstanceRef.current = gameInstance;

        // Initialize multiplayer if roomId is provided
        if (roomId) {
          console.log('🌐 Connecting game instance to multiplayer room:', roomId);

          // Import and get multiplayer service
          const { default: MultiplayerService } = await import('../services/MultiplayerService');
          const multiplayerService = MultiplayerService.getInstance();

          // Connect the game instance to the multiplayer service
          multiplayerService.setGameInstance(gameInstance);
          gameInstance.roomId = roomId;
          gameInstance.multiplayerService = multiplayerService;

          console.log('✅ Game instance connected to multiplayer service');
        }

        // CRITICAL: Set up callbacks BEFORE starting the game to prevent race condition
        // Set up game state update callback
        gameInstance.onStateUpdate = (state: GameState) => {
          onGameStateUpdate(state);
        };

        // Set up game over callback
        gameInstance.onGameOver = (gameOverState: any) => {
          onGameStateUpdate(gameOverState);
        };

        // Start the game AFTER callbacks are set up
        gameInstance.start();
      } catch (error) {
        console.error('Failed to initialize game:', error);
      }
    };

    initializeGame();

    // Cleanup on unmount
    return () => {
      if (gameInstanceRef.current && gameInstanceRef.current.destroy) {
        gameInstanceRef.current.destroy();
        gameInstanceRef.current = null; // Clear the reference
      }
      gameInitialized = false; // Reset the module flag
      initializingRef.current = false; // Reset the component flag
    };
  }, [gameMode]); // FIXED: Remove onGameStateUpdate from dependencies to prevent recreation on state updates

  return <canvas ref={canvasRef} className="main-canvas pixelated" />;
};

export default GameCanvas;