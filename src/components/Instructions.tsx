import React from 'react';
import { GameMode } from '../App';

interface InstructionsProps {
  gameMode: GameMode;
}

const Instructions: React.FC<InstructionsProps> = ({ gameMode }) => {
  return (
    <div className="instructions">
      <h3>🎮 Pit Rules:</h3>
      <p>🖱️ Mouse: Navigate your snake</p>
      <p>⚡ Left Click / Space: Turbo boost</p>
      <p>💰 Collect cash to grow your empire!</p>
      <p>✨ Grab golden orbs for mega payouts!</p>
      <p>☠️ Don't crash into other snakes!</p>
      {gameMode === 'warfare' && (
        <>
          <p>🔫 Right Click: Fire weapons</p>
          <p>🎯 Collect weapon drops to arm up!</p>
          <p>💀 Headshots = instant elimination</p>
          <p>🩸 Body shots = snake damage</p>
        </>
      )}
    </div>
  );
};

export default Instructions;