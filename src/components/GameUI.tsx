import React from 'react';
import { GameMode } from '../App';
import { GameState } from './GameContainer';

interface GameUIProps {
  gameState: GameState;
  gameMode: GameMode;
}

const GameUI: React.FC<GameUIProps> = ({ gameState, gameMode }) => {
  return (
    <div className="game-ui">
      <div className="ui-stats">
        <div className="stat-item stat-score neon-text neon-green">
          💰 Cash: ${gameState.score.toLocaleString()}
        </div>
        <div className="stat-item stat-length neon-text neon-cyan">
          🐍 Length: {gameState.length}
        </div>
        <div className="stat-item stat-boost neon-text neon-orange">
          ⚡ Boost: {Math.round(gameState.boost)}%
        </div>
        {gameMode === 'warfare' && (
          <>
            <div className="stat-item stat-weapon neon-text neon-pink">
              🔫 Weapon: {gameState.weapon}
            </div>
            <div className="stat-item stat-cooldown neon-text neon-purple">
              ⏱️ Cooldown: {gameState.cooldown}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GameUI;