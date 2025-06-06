import React from 'react';

interface CashTrackerProps {
  gameState: any;
  gameMode: string | null;
  onCashOut?: () => void;
}

const CashTracker: React.FC<CashTrackerProps> = ({ gameState, gameMode, onCashOut }) => {
  // Calculate if cashout is available (player has gained cash beyond initial wager)
  const initialWager = 50; // Default wager amount
  const currentCash = gameState.cashBalance || gameState.score || 0;
  const canCashOut = currentCash > initialWager;
  const profit = currentCash - initialWager;

  return (
    <div className="cash-tracker">
      <div className="cash-tracker-header">
        <span className="cash-tracker-title neon-text neon-green">💰 Cash Tracker</span>
      </div>

      <div className="cash-stats">
        {gameMode === 'classic' && (
          <div className="cash-stat-item">
            <span className="cash-stat-label">Score:</span>
            <span className="cash-stat-value neon-text neon-yellow">
              {(gameState.score || 0).toLocaleString()}
            </span>
          </div>
        )}
        
        <div className="cash-stat-item">
          <span className="cash-stat-label">Cash:</span>
          <span className="cash-stat-value neon-text neon-green">
            ${currentCash.toLocaleString()}
          </span>
        </div>

        <div className="cash-stat-item">
          <span className="cash-stat-label">Length:</span>
          <span className="cash-stat-value neon-text neon-cyan">
            {gameState.length || 0}
          </span>
        </div>

        <div className="cash-stat-item">
          <span className="cash-stat-label">Boost:</span>
          <span className="cash-stat-value neon-text neon-orange">
            {Math.round(gameState.boost || 0)}%
          </span>
        </div>

        {/* King Status Indicator */}
        {gameState.isKing && (
          <div className="cash-stat-item king-status">
            <span className="cash-stat-label">Status:</span>
            <span className="cash-stat-value neon-text neon-yellow">
              👑 King of the Pit!
            </span>
          </div>
        )}
      </div>

      {/* Cashout Button */}
      <div className="cashout-container">
        <button
          className={`cashout-button neon-button ${canCashOut && onCashOut ? 'neon-green' : 'neon-disabled'}`}
          onClick={canCashOut && onCashOut ? onCashOut : undefined}
          disabled={!canCashOut || !onCashOut}
          title={canCashOut && onCashOut
            ? `Cash out and secure your profit of $${profit.toLocaleString()}! (Hotkey: C)`
            : `Gain cash beyond your $${initialWager} wager to cash out`
          }
        >
          💰 {canCashOut ? `CASH OUT (+$${profit.toLocaleString()})` : 'CASH OUT (No Profit)'}
        </button>
        <div className="cashout-hint neon-text neon-dim">
          {canCashOut ? "Press 'C' to cash out" : `Need profit > $${initialWager} to cash out`}
        </div>
      </div>
    </div>
  );
};

export default CashTracker;
