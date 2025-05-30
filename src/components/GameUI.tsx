import React from 'react';
import { GameMode } from '../App';
import { GameState } from './GameContainer';
import Scoreboard, { PlayerData } from './Scoreboard'; // Import Scoreboard and PlayerData

interface GameUIProps {
  gameState: GameState & { players?: PlayerData[] }; // Ensure players array is part of gameState type
  gameMode: GameMode;
  onCashOut?: () => void;
  localPlayerId?: string | null; // Add localPlayerId
}

// Helper function to get ammo type icons
const getAmmoIcon = (ammoType: string): string => {
  switch (ammoType) {
    case 'light_energy': return '🔋';
    case 'heavy_energy': return '⚡';
    case 'plasma_cells': return '🟢';
    case 'heavy_plasma': return '💚';
    case 'rockets': return '🚀';
    case 'rail_slugs': return '🔵';
    default: return '📦';
  }
};

const GameUI: React.FC<GameUIProps> = ({ gameState, gameMode, onCashOut }) => {
  // Calculate if cashout is available (player has gained cash beyond initial wager)
  const initialWager = 50; // Default wager amount
  const currentCash = gameState.cashBalance || gameState.score || 0;
  const canCashOut = currentCash > initialWager;
  const profit = currentCash - initialWager;
  return (
    <>
      {/* Main UI Stats - Top Left */}
      <div className="game-ui">
        <div className="ui-stats">
          {gameMode === 'classic' && (
            <div className="stat-item stat-score neon-text neon-yellow">
              🏆 Score: {(gameState.score || 0).toLocaleString()}
            </div>
          )}
          <div className="stat-item stat-cash neon-text neon-green">
            💰 Cash: ${(gameState.cashBalance || gameState.score || 0).toLocaleString()}
          </div>
          <div className="stat-item stat-length neon-text neon-cyan">
            🐍 Length: {gameState.length || 0}
          </div>
          <div className="stat-item stat-boost neon-text neon-orange">
            ⚡ Boost: {Math.round(gameState.boost || 0)}%
          </div>

          {/* Cashout Button */}
          <div className="cashout-container">
            <button
              className={`cashout-button neon-button ${canCashOut ? 'neon-green' : 'neon-disabled'}`}
              onClick={canCashOut ? onCashOut : undefined}
              disabled={!canCashOut}
              title={canCashOut
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

          {gameMode === 'warfare' && (
            <>
              <div className="stat-item stat-weapon neon-text neon-pink">
                🔫 {gameState.weapon} {gameState.weaponAmmo}
              </div>
              <div className="stat-item stat-cooldown neon-text neon-purple">
                ⏱️ {gameState.cooldown}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Weapon Inventory - Bottom Right */}
      {gameMode === 'warfare' && gameState.weaponSlots && (
        <div className="weapon-inventory">
          <div className="inventory-header">
            <span className="inventory-title neon-text neon-purple">🎯 Arsenal</span>
          </div>

          {/* Horizontal Weapon Slots */}
          <div className="inventory-slots-horizontal">
            <div className={`inventory-slot-horizontal ${gameState.currentSlot === 'primaryWeapon' ? 'active' : ''}`}>
              <div className="slot-key">1</div>
              <div className="slot-content-horizontal">
                <div className="slot-name">Primary</div>
                <div className="slot-weapon">{gameState.weaponSlots.primary}</div>
                {gameState.currentSlot === 'primaryWeapon' && gameState.cooldownProgress !== undefined && (
                  <div className="cooldown-bar">
                    <div
                      className="cooldown-fill"
                      style={{ width: `${gameState.cooldownProgress}%` }}
                    ></div>
                  </div>
                )}
              </div>
            </div>

            <div className={`inventory-slot-horizontal ${gameState.currentSlot === 'secondaryWeapon' ? 'active' : ''}`}>
              <div className="slot-key">2</div>
              <div className="slot-content-horizontal">
                <div className="slot-name">Secondary</div>
                <div className="slot-weapon">{gameState.weaponSlots.secondary}</div>
                {gameState.currentSlot === 'secondaryWeapon' && gameState.cooldownProgress !== undefined && (
                  <div className="cooldown-bar">
                    <div
                      className="cooldown-fill"
                      style={{ width: `${gameState.cooldownProgress}%` }}
                    ></div>
                  </div>
                )}
              </div>
            </div>

            <div className={`inventory-slot-horizontal ${gameState.currentSlot === 'sidearm' ? 'active' : ''}`}>
              <div className="slot-key">3</div>
              <div className="slot-content-horizontal">
                <div className="slot-name">Sidearm</div>
                <div className="slot-weapon">{gameState.weaponSlots.sidearm}</div>
                {gameState.currentSlot === 'sidearm' && gameState.cooldownProgress !== undefined && (
                  <div className="cooldown-bar">
                    <div
                      className="cooldown-fill"
                      style={{ width: `${gameState.cooldownProgress}%` }}
                    ></div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Ammo Inventory */}
          {gameState.ammoInventory && (
            <div className="ammo-inventory">
              <div className="ammo-header">Ammunition</div>
              <div className="ammo-types">
                {Object.entries(gameState.ammoInventory).map(([ammoType, amount]) => (
                  <div key={ammoType} className="ammo-type">
                    <div className="ammo-icon">{getAmmoIcon(ammoType)}</div>
                    <div className="ammo-count">{amount}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="inventory-controls">
            <span className="control-hint neon-text neon-cyan">1-3: Switch | Q: Quick Switch</span>
          </div>
        </div>
      )}

      {/* Display Current Weapon for warfare_pvp */}
      {gameMode === 'warfare_pvp' && gameState.currentWeaponInfo && (
          <div className="weapon-display" style={{ position: 'absolute', bottom: '10px', right: '10px', color: 'white', backgroundColor: 'rgba(0,0,0,0.5)', padding: '5px', borderRadius: '5px', fontFamily: 'monospace', fontSize: '14px' }}>
              <p style={{margin: '2px 0'}}>Weapon: {gameState.currentWeaponInfo.type}</p>
              <p style={{margin: '2px 0'}}>Ammo: {String(gameState.currentWeaponInfo.ammo)}</p>
          </div>
      )}

      {/* Scoreboard Integration */}
      {gameState.players && (
        <Scoreboard
          players={gameState.players}
          localPlayerId={localPlayerId}
          gameMode={gameMode}
        />
      )}
    </>
  );
};

export default GameUI;