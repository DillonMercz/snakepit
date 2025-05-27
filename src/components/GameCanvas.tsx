import React, { useEffect, useRef } from 'react';
import { GameMode } from '../App';
import { GameState } from './GameContainer';

interface GameCanvasProps {
  gameMode: GameMode;
  gameInstanceRef: React.MutableRefObject<any>;
  onGameStateUpdate: (state: GameState) => void;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ 
  gameMode, 
  gameInstanceRef, 
  onGameStateUpdate 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Import and initialize the game logic
    const initializeGame = async () => {
      try {
        // Import the game logic
        const { Game } = await import('../gameLogic.js');
        
        // Initialize the game with the canvas and mode
        const gameInstance = new Game(canvasRef.current, gameMode || 'classic');
        gameInstanceRef.current = gameInstance;

        // Set up game state update callback
        gameInstance.onStateUpdate = (state: GameState) => {
          onGameStateUpdate(state);
        };

        // Start the game
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
      }
    };
  }, [gameMode, gameInstanceRef, onGameStateUpdate]);

  return <canvas ref={canvasRef} className="main-canvas pixelated" />;
};

export default GameCanvas;