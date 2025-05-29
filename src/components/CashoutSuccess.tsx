import React from 'react';

interface CashoutSuccessProps {
  cashoutAmount: number;
  onRestart: () => void;
  onBackToMenu: () => void;
}

const CashoutSuccess: React.FC<CashoutSuccessProps> = ({ 
  cashoutAmount, 
  onRestart, 
  onBackToMenu 
}) => {
  return (
    <div className="cashout-success">
      <div className="cashout-success-content">
        <h2 className="cashout-title">💰 CASH OUT SUCCESS! 💰</h2>
        
        <div className="cashout-amount">
          <div className="amount-label">You secured:</div>
          <div className="amount-value">${cashoutAmount.toLocaleString()}</div>
        </div>
        
        <div className="success-message">
          <p>🎉 Congratulations! You successfully cashed out your winnings!</p>
          <p>💡 Smart move securing your profits before risking them in combat!</p>
        </div>
        
        <div className="spectate-info">
          <p>🔍 You can now spectate other players:</p>
          <p>• Press <strong>TAB</strong> to cycle through snakes</p>
          <p>• Watch the action unfold safely</p>
        </div>
        
        <div className="cashout-buttons">
          <button 
            className="retro-button"
            onClick={onRestart}
          >
            🎮 Play Again
          </button>
          <button 
            className="retro-button secondary"
            onClick={onBackToMenu}
          >
            🏠 Main Menu
          </button>
        </div>
      </div>
    </div>
  );
};

export default CashoutSuccess;
