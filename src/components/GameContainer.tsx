import React, { useRef, useState } from 'react';
import { GameMode } from '../App';
import GameUI from './GameUI';
import GameCanvas from './GameCanvas';
import Minimap from './Minimap';
import Instructions from './Instructions';
import GameOver from './GameOver';

interface GameContainerProps {
  gameMode: GameMode;
  onBackToMenu: () => void;
}

export interface GameState {
  score: number;
  length: number;
  boost: number;
  weapon: string;
  cooldown: string;
  isGameOver: boolean;
  finalScore: number;
  finalLength: number;
}

const GameContainer: React.FC<GameContainerProps> = ({ gameMode, onBackToMenu }) => {
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

  const handleRestart = () => {
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

  return (
    <div className="game-container scanlines">
      <div className="game-canvas">
        <GameCanvas 
          gameMode={gameMode}
          gameInstanceRef={gameInstanceRef}
          onGameStateUpdate={setGameState}
        />
        
        {/* Overlay UI elements on top of the game canvas */}
        <GameUI 
          gameState={gameState}
          gameMode={gameMode}
        />
        
        <Minimap gameInstanceRef={gameInstanceRef} />
        
        <Instructions gameMode={gameMode} />
      </div>
      
      {gameState.isGameOver && (
        <GameOver 
          finalScore={gameState.finalScore}
          finalLength={gameState.finalLength}
          onRestart={handleRestart}
          onBackToMenu={onBackToMenu}
        />
      )}
    </div>
  );
};

export default GameContainer;