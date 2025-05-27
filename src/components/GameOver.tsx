import React from 'react';

interface GameOverProps {
  finalScore: number;
  finalLength: number;
  onRestart: () => void;
  onBackToMenu: () => void;
}

const GameOver: React.FC<GameOverProps> = ({ 
  finalScore, 
  finalLength, 
  onRestart, 
  onBackToMenu 
}) => {
  return (
    <div className="game-over">
      <div className="game-over-content">
        <h2>💀 WASTED! 💀</h2>
        <div className="final-stats">
          <div className="final-stat">
            💰 Final Cash: ${finalScore.toLocaleString()}
          </div>
          <div className="final-stat">
            🐍 Final Length: {finalLength}
          </div>
        </div>
        <div className="game-over-buttons">
          <button className="retro-button" onClick={onRestart}>
            🔄 Try Again
          </button>
          <button className="retro-button secondary" onClick={onBackToMenu}>
            🏠 Exit Pit
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameOver;