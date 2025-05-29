import React, { useState } from 'react';
import { GameMode } from '../App';

interface InstructionsProps {
  gameMode: GameMode;
}

const Instructions: React.FC<InstructionsProps> = ({ gameMode }) => {
  const [isCollapsed, setIsCollapsed] = useState(true); // Collapsed by default

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`instructions ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="instructions-header" onClick={toggleCollapse}>
        <h3>🎮 Pit Rules:</h3>
        <button className="collapse-button">
          {isCollapsed ? '▲' : '▼'}
        </button>
      </div>

      <div className="instructions-content">
        <p>🖱️ Mouse: Navigate your snake</p>
        <p>⚡ Right Click: Turbo boost</p>
        <p>💰 Collect cash to grow your empire!</p>
        <p>✨ Grab golden orbs for mega payouts!</p>
        <p>☠️ Don't crash into other snakes!</p>
        {gameMode === 'warfare' && (
          <>
            <p>🔫 Left Click / Space: Fire weapons</p>
            <p>🎯 Collect weapon drops to arm up!</p>
            <p>💀 Headshots = instant elimination</p>
            <p>🩸 Body shots = snake damage</p>
            <p>🔢 1-3: Switch weapons</p>
          </>
        )}

        <div className="controller-section">
          <p>🎮 <strong>Controller Support:</strong></p>
          <p>📍 Left Stick: Move snake</p>
          <p>⚡ A/Cross: Boost</p>
          <p>💰 X/Square: Cash out</p>
          <p>👁️ Y/Triangle: Spectate next</p>
          {gameMode === 'warfare' && (
            <>
              <p>🔫 RT/R2: Shoot</p>
              <p>🔄 LB/L1, RB/R1, LT/L2: Switch weapons</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Instructions;