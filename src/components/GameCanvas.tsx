import React, { useEffect, useRef } from 'react';
import { GameMode } from '../App';
import { GameState } from './GameContainer';

// Module-level flag to prevent double initialization in React Strict Mode
let gameInitialized = false;

interface GameCanvasProps {
  gameMode: GameMode;
  gameInstanceRef: React.MutableRefObject<any>;
  onGameStateUpdate: (state: GameState) => void;
  onElimination?: (eliminationData: any) => void;
}

const GameCanvas: React.FC<GameCanvasProps> = ({
  gameMode,
  gameInstanceRef,
  onGameStateUpdate,
  onElimination
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
        // Import the new ClientGame class (fixed import syntax)
        const ClientGame = (await import('../ClientGame.js')).default;

        // Set the canvas ID so ClientGame can find it
        if (canvasRef.current) {
          canvasRef.current.id = 'gameCanvas';
        }

        // Initialize the game with canvas and game mode
        const gameInstance = new ClientGame(canvasRef.current, gameMode || 'classic');
        gameInstanceRef.current = gameInstance;

        // Set up callbacks for React state updates
        gameInstance.onStateUpdate = (state: any) => {
          onGameStateUpdate(state);
        };

        gameInstance.onGameOver = (gameOverState: any) => {
          onGameStateUpdate(gameOverState);
        };

        // Set up elimination handler
        if (onElimination) {
          gameInstance.onElimination = onElimination;
        }

        // Start the game with multiplayer server connection
        await gameInstance.start();
      } catch (error) {
        console.error('Failed to initialize game:', error);

        // Fallback to original game logic if multiplayer fails
        console.log('Falling back to single-player mode...');
        try {
          const { Game } = await import('../gameLogic.js');
          const gameInstance = new Game(canvasRef.current, gameMode || 'classic');
          gameInstanceRef.current = gameInstance;

          gameInstance.onStateUpdate = (state: GameState) => {
            onGameStateUpdate(state);
          };

          gameInstance.onGameOver = (gameOverState: any) => {
            onGameStateUpdate(gameOverState);
          };

          gameInstance.start();
        } catch (fallbackError) {
          console.error('Failed to initialize fallback game:', fallbackError);
        }
      }
    };

    initializeGame();

    // Cleanup on unmount
    return () => {
      if (gameInstanceRef.current) {
        // Use the destroy method for proper cleanup
        if (gameInstanceRef.current.destroy) {
          gameInstanceRef.current.destroy();
        }
        gameInstanceRef.current = null; // Clear the reference
      }
      gameInitialized = false; // Reset the module flag
      initializingRef.current = false; // Reset the component flag
    };
  }, [gameMode]); // FIXED: Remove onGameStateUpdate from dependencies to prevent recreation on state updates

  return <canvas ref={canvasRef} className="main-canvas pixelated" />;
};

export default GameCanvas;