import React from 'react';
import { GameMode } from '../App';

interface GameModeSelectProps {
  onModeSelect: (mode: GameMode) => void;
}

const GameModeSelect: React.FC<GameModeSelectProps> = ({ onModeSelect }) => {
  return (
    <div className="game-mode-select">
      <h2 className="mode-selection-title">Choose Your Pit</h2>
      
      <div className="mode-buttons">
        <button
          className="mode-button"
          onClick={() => onModeSelect('classic')}
        >
          <h3 className="cash-icon">Classic Pit</h3>
          <p>Traditional snake gameplay with cash rewards and golden orbs</p>
        </button>

        <button
          className="mode-button"
          onClick={() => onModeSelect('warfare')}
        >
          <h3 className="coin-icon">Combat Pit</h3>
          <p>High-stakes combat mode with weapons and explosive payouts</p>
        </button>
      </div>
    </div>
  );
};

export default GameModeSelect;