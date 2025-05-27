import React, { useState } from 'react';
import './snakepit-theme.css';
import GameModeSelect from './components/GameModeSelect';
import GameContainer from './components/GameContainer';

export type GameMode = 'classic' | 'warfare' | null;

function App() {
  const [gameMode, setGameMode] = useState<GameMode>(null);
  const [gameStarted, setGameStarted] = useState(false);

  const handleModeSelect = (mode: GameMode) => {
    setGameMode(mode);
    setGameStarted(true);
  };

  const handleBackToMenu = () => {
    setGameMode(null);
    setGameStarted(false);
  };

  return (
    <div className="snakepit-app">
      {!gameStarted ? (
        <>
          <h1 className="snakepit-title">SNAKEPIT</h1>
          <GameModeSelect onModeSelect={handleModeSelect} />
        </>
      ) : (
        <GameContainer 
          gameMode={gameMode} 
          onBackToMenu={handleBackToMenu}
        />
      )}
    </div>
  );
}

export default App;
