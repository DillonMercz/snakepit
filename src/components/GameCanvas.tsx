import React, { useEffect, useRef } from 'react';
import { GameMode } from '../App';
import { GameState } from './GameContainer';

// Module-level flag to prevent double initialization in React Strict Mode
let gameInitialized = false;

interface GameCanvasProps {
  gameMode: GameMode;
  gameInstanceRef: React.MutableRefObject<any>;
  onGameStateUpdate: (state: GameState) => void;
  networkManager?: any; // Added networkManager prop
}

const GameCanvas: React.FC<GameCanvasProps> = ({
  gameMode,
  gameInstanceRef,
  onGameStateUpdate,
  networkManager // Destructure networkManager
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const initializingRef = useRef<boolean>(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    if (gameInitialized || gameInstanceRef.current || initializingRef.current) {
      console.log('Game already initialized or initializing, skipping initialization');
      return;
    }
    
    console.log('GameCanvas: Initializing game effect triggered.');
    gameInitialized = true;
    initializingRef.current = true;

    const initializeGame = async () => {
      try {
        const { Game } = await import('../gameLogic.js');
        
        const isMultiplayer = gameMode === 'classic_pvp' || gameMode === 'warfare_pvp';
        let localPlayerId = null;
        if (isMultiplayer && networkManager) {
          localPlayerId = networkManager.playerId; // Assuming playerId is available on networkManager
          if (!localPlayerId) {
            console.warn("NetworkManager Player ID not available for multiplayer game initialization.");
            // Potentially wait or handle error - for now, Game constructor handles null localPlayerId
          }
        }

        console.log(`GameCanvas: Creating Game instance. Mode: ${gameMode}, MP: ${isMultiplayer}, PlayerID: ${localPlayerId}`);
        const gameInstance = new Game(canvasRef.current, gameMode || 'classic', localPlayerId);
        gameInstanceRef.current = gameInstance;

        if (isMultiplayer && networkManager) {
          gameInstance.networkManager = networkManager;
          console.log("GameCanvas: NetworkManager assigned to game instance.");
        }

        gameInstance.onStateUpdate = (state: GameState) => {
          onGameStateUpdate(state);
        };

        gameInstance.onGameOver = (gameOverState: any) => {
          onGameStateUpdate(gameOverState);
        };

        gameInstance.start();
        console.log("GameCanvas: Game instance started.");
      } catch (error) {
        console.error('GameCanvas: Failed to initialize game:', error);
      } finally {
        initializingRef.current = false; 
      }
    };

    initializeGame();

    return () => {
      console.log("GameCanvas: Cleanup effect. Destroying game instance.");
      if (gameInstanceRef.current && gameInstanceRef.current.destroy) {
        gameInstanceRef.current.destroy();
      }
      gameInstanceRef.current = null;
      gameInitialized = false;
      initializingRef.current = false; 
    };
  }, [gameMode, networkManager, gameInstanceRef, onGameStateUpdate]);


  // Effect for handling NetworkManager game state updates
  useEffect(() => {
    if (networkManager && gameInstanceRef.current?.isMultiplayer) {
      console.log("GameCanvas: Setting up NetworkManager.onGameStateUpdate callback.");
      networkManager.onGameStateUpdate = (gameStateFromServer: any) => {
        if (gameInstanceRef.current && gameInstanceRef.current.isMultiplayer) {
          gameInstanceRef.current.processGameState(gameStateFromServer);
        }
      };

      return () => {
        if (networkManager) {
          console.log("GameCanvas: Clearing NetworkManager.onGameStateUpdate callback.");
          networkManager.onGameStateUpdate = null;
        }
      };
    }
  }, [networkManager, gameInstanceRef]);

  // Effect for sending player input to the server
  useEffect(() => {
    let inputInterval: NodeJS.Timeout | null = null;

    if (gameInstanceRef.current?.isMultiplayer && networkManager?.isConnected()) {
      console.log("GameCanvas: Setting up input sending interval.");
      inputInterval = setInterval(() => {
        const game = gameInstanceRef.current;
        if (game && game.player && game.player.alive) {
          // Calculate targetAngle based on current mouse relative to player head on screen
          // This logic is usually within Game.updatePlayer or similar
          // For simplicity, if Game.player.targetAngle is updated by mouse events, use that.
          // Otherwise, recalculate here if mouse state is available to GameCanvas.
          // Assuming game.player.targetAngle is correctly maintained by existing mousemove listeners in Game class
          const targetAngle = game.player.targetAngle; 
          
          const inputData = {
            targetAngle: targetAngle,
            boosting: game.boosting || false, // game.boosting is updated by Game's event listeners
            shooting: game.mouseHeld || false, // game.mouseHeld for shooting in warfare
            // Potentially add other inputs like weapon switching commands if handled here
          };
          networkManager.sendPlayerInput(inputData);
        }
      }, 50); // Send input ~20 times per second
    }

    return () => {
      if (inputInterval) {
        console.log("GameCanvas: Clearing input sending interval.");
        clearInterval(inputInterval);
      }
    };
  }, [networkManager, gameInstanceRef]);


  return <canvas ref={canvasRef} className="main-canvas pixelated" />;
};

export default GameCanvas;