import React from 'react';
import CrownIcon from './CrownIcon';
import { GameMode } from '../App';
import { GameState } from './GameContainer';

interface GameUIProps {
  gameState: GameState;
  gameMode: GameMode;
  onCashOut?: () => void;
}

// Icon mapping for UI components
const getIconPath = (type: string, category: 'ammo' | 'powerup' | 'weapon'): string => {
  const iconMappings: Record<string, Record<string, string>> = {
    ammo: {
      'light_energy': 'Energy Cells Ammo Icon.png',
      'heavy_energy': 'Heavy Energy Ammo Icon.png',
      'plasma_cells': 'Plasma Cells Ammo Icon.png',
      'heavy_plasma': 'Heavy Plasma Ammo Icon.png',
      'rockets': 'Rockets Ammo Icon.png',
      'rail_slugs': 'Rail Slugs Ammo Icon.png'
    },
    powerup: {
      'helmet': 'Combat Helmet Powerup Icon.png',
      'armor_plating': 'Armor Plating Powerup Icon.png',
      'shield_generator': 'Shield Generator Powerup Icon.png',
      'forcefield': 'Force Field Powerup Icon.png',
      'speed_boost': 'Speed Boost Powerup Icon.png',
      'damage_amplifier': 'Damage Amplifier Powerup Icon.png',
      'battering_ram': 'Battering Ram Powerup Icon.png'
    },
    weapon: {
      'sidearm': 'Snake Fang Weapon Icon.png',
      'laser_pistol': 'Laser Pistol Weapon Icon.png',
      'laser_rifle': 'Laser Rifle Weapon Icon.png',
      'plasma_smg': 'Plasma SMG Weapon Icon.png',
      'plasma_cannon': 'Plasma Cannon Weapon Icon.png',
      'rocket_launcher': 'Rocket Launcher Weapon Icon.png',
      'rail_gun': 'Rail Gun Weapon Icon.png',
      'minigun': 'Minigun Weapon Icon.png'
    }
  };

  const fileName = iconMappings[category]?.[type];
  return fileName ? `/assets/${encodeURIComponent(fileName)}` : '';
};

// Helper function to get ammo type icons
const getAmmoIcon = (ammoType: string): React.ReactNode => {
  const iconPath = getIconPath(ammoType, 'ammo');
  if (iconPath) {
    return <img src={iconPath} alt={ammoType} style={{ width: '16px', height: '16px' }} />;
  }

  // Fallback to emoji
  const fallbackIcons: { [key: string]: string } = {
    'light_energy': '🔋',
    'heavy_energy': '⚡',
    'plasma_cells': '🟢',
    'heavy_plasma': '💚',
    'rockets': '🚀',
    'rail_slugs': '🔵'
  };
  return fallbackIcons[ammoType] || '📦';
};

// Helper function to get powerup type icons
const getPowerupIcon = (powerupType: string): React.ReactNode => {
  const iconPath = getIconPath(powerupType, 'powerup');
  if (iconPath) {
    return <img src={iconPath} alt={powerupType} style={{ width: '16px', height: '16px' }} />;
  }

  // Fallback to emoji
  const fallbackIcons: { [key: string]: string } = {
    'helmet': '⛑️',
    'armor_plating': '🛡️',
    'shield_generator': '🔰',
    'forcefield': '🔵',
    'battering_ram': '🔨',
    'speed_boost': '💨',
    'damage_amplifier': '💥'
  };
  return fallbackIcons[powerupType] || '⚡';
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

          {/* King Status Indicator */}
          {gameState.isKing && (
            <div className="stat-item stat-king neon-text neon-yellow">
              <CrownIcon size={16} animated={true} /> King of the Pit!
            </div>
          )}

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
      {gameMode === 'warfare' && (
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
                <div className="slot-weapon">{gameState.weaponSlots?.primary || 'Empty'}</div>
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
                <div className="slot-weapon">{gameState.weaponSlots?.secondary || 'Empty'}</div>
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
                <div className="slot-weapon">{gameState.weaponSlots?.sidearm || 'Snake Fang (∞)'}</div>
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
          <div className="ammo-inventory">
            <div className="ammo-header">Ammunition</div>
            <div className="ammo-types">
              {gameState.ammoInventory && Object.keys(gameState.ammoInventory).length > 0 ? (
                Object.entries(gameState.ammoInventory).map(([ammoType, amount]) => (
                  <div key={ammoType} className="ammo-type">
                    <div className="ammo-icon">{getAmmoIcon(ammoType)}</div>
                    <div className="ammo-count">{Math.floor(amount)}</div>
                  </div>
                ))
              ) : (
                <div className="ammo-empty">No ammo collected</div>
              )}
            </div>
          </div>

          {/* Powerup Inventory */}
          {gameState.powerupInventory && gameState.powerupInventory.length > 0 && (
            <div className="powerup-inventory">
              <div className="powerup-header">Powerups</div>
              <div className="powerup-types">
                {gameState.powerupInventory.map((powerup, index) => (
                  <div key={index} className="powerup-type">
                    <div className="powerup-icon">{getPowerupIcon(powerup.type)}</div>
                    <div className="powerup-name">{powerup.name}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active Powerups */}
          {gameState.activePowerups && gameState.activePowerups.length > 0 && (
            <div className="active-powerups">
              <div className="active-powerups-header">Active</div>
              <div className="active-powerup-list">
                {gameState.activePowerups.map((powerup, index) => {
                  const timeRemaining = powerup.expirationTime - Date.now();
                  const totalDuration = powerup.duration || 30000;
                  const timeRatio = Math.max(0, timeRemaining / totalDuration);

                  return (
                    <div key={index} className="active-powerup">
                      <div className="active-powerup-icon">{getPowerupIcon(powerup.type)}</div>
                      <div className="active-powerup-timer">
                        <div
                          className="timer-bar"
                          style={{ width: `${timeRatio * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="inventory-controls">
            <span className="control-hint neon-text neon-cyan">1-3: Switch | Q: Quick Switch</span>
          </div>
        </div>
      )}
    </>
  );
};

export default GameUI;