import React from 'react';
import CrownIcon from './CrownIcon';
import CashTracker from './CashTracker';
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

// Helper function to format display names from internal names
const formatDisplayName = (internalName: string, category: 'weapon' | 'powerup' | 'ammo'): string => {
  const displayNames: Record<string, Record<string, string>> = {
    weapon: {
      'sidearm': 'Snake Fang',
      'laser_pistol': 'Laser Pistol',
      'laser_rifle': 'Laser Rifle',
      'plasma_smg': 'Plasma SMG',
      'plasma_cannon': 'Plasma Cannon',
      'rocket_launcher': 'Rocket Launcher',
      'rail_gun': 'Rail Gun',
      'minigun': 'Minigun'
    },
    powerup: {
      'helmet': 'Combat Helmet',
      'armor_plating': 'Armor Plating',
      'shield_generator': 'Shield Generator',
      'forcefield': 'Force Field',
      'speed_boost': 'Speed Boost',
      'damage_amplifier': 'Damage Amplifier',
      'battering_ram': 'Battering Ram'
    },
    ammo: {
      'light_energy': 'Energy Cells',
      'heavy_energy': 'Heavy Energy',
      'plasma_cells': 'Plasma Cells',
      'heavy_plasma': 'Heavy Plasma',
      'rockets': 'Rockets',
      'rail_slugs': 'Rail Slugs'
    }
  };

  return displayNames[category]?.[internalName] ||
         internalName.split('_').map(word =>
           word.charAt(0).toUpperCase() + word.slice(1)
         ).join(' ');
};

// Helper functions for weapon slot parsing
const getWeaponName = (weaponSlot: string | undefined): string => {
  if (!weaponSlot) return '';
  return weaponSlot.split(' (')[0];
};

const getWeaponAmmo = (weaponSlot: string | undefined): string => {
  if (!weaponSlot) return '';
  const match = weaponSlot.match(/\(([^)]+)\)/);
  return match ? match[1] : '';
};

// Helper function to get weapon thumbnails using actual images
const getWeaponThumbnail = (weaponSlot: string | undefined): React.ReactNode => {
  if (!weaponSlot) {
    return <span style={{ fontSize: '1rem', opacity: 0.5 }}>❌</span>;
  }

  const weaponName = getWeaponName(weaponSlot).toLowerCase();
  console.log('Weapon name for thumbnail:', weaponName); // Debug log

  // Map weapon names to actual image files in public/assets (using correct file names)
  const weaponImages: { [key: string]: string } = {
    'laser pistol': '/assets/Laser Pistol Weapon Icon.png',
    'laser rifle': '/assets/Laser Rifle Weapon Icon.png',
    'plasma cannon': '/assets/Plasma Cannon Weapon Icon.png',
    'plasma smg': '/assets/Plasma SMG Weapon Icon.png',
    'rail gun': '/assets/Rail Gun Weapon Icon.png',
    'rocket launcher': '/assets/Rocket Launcher Weapon Icon.png',
    'minigun': '/assets/Minigun Weapon Icon.png',
    // Add more variations
    'pistol': '/assets/Laser Pistol Weapon Icon.png',
    'rifle': '/assets/Laser Rifle Weapon Icon.png',
    'cannon': '/assets/Plasma Cannon Weapon Icon.png',
    'smg': '/assets/Plasma SMG Weapon Icon.png',
    'rail': '/assets/Rail Gun Weapon Icon.png',
    'rocket': '/assets/Rocket Launcher Weapon Icon.png',
    'launcher': '/assets/Rocket Launcher Weapon Icon.png',
    'gun': '/assets/Rail Gun Weapon Icon.png'
  };

  // Try to find image by exact weapon name match first
  if (weaponImages[weaponName]) {
    return <img src={weaponImages[weaponName]} alt={weaponName} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />;
  }

  // Try to find image by partial name match
  for (const [name, imagePath] of Object.entries(weaponImages)) {
    if (weaponName.includes(name) || name.includes(weaponName)) {
      return <img src={imagePath} alt={name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />;
    }
  }

  // Default weapon icon if no image found - show weapon name for debugging
  return <span style={{ fontSize: '0.6rem', opacity: 0.7 }} title={weaponName}>🔫</span>;
};

const GameUI: React.FC<GameUIProps> = ({ gameState, gameMode, onCashOut }) => {
  // Calculate if cashout is available (player has gained cash beyond initial wager)
  const initialWager = 50; // Default wager amount
  const currentCash = gameState.cashBalance || gameState.score || 0;
  const canCashOut = currentCash > initialWager;
  const profit = currentCash - initialWager;

  // Inventory collapse state
  const [inventoryExpanded, setInventoryExpanded] = React.useState(false);

  const toggleInventory = () => {
    setInventoryExpanded(!inventoryExpanded);
  };

  // Keyboard support for 'I' key
  React.useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'i' && gameMode === 'warfare') {
        event.preventDefault();
        toggleInventory();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameMode, inventoryExpanded]);
  return (
    <>
      {/* Cash Tracker - Under Status Bar */}
      <CashTracker
        gameState={gameState}
        gameMode={gameMode}
        onCashOut={onCashOut}
      />

      {/* Weapon Inventory - Bottom Left */}
      {gameMode === 'warfare' && (
        <div className={`weapon-inventory ${inventoryExpanded ? 'expanded' : 'collapsed'}`}>
          {/* Compact Weapon Slots - Thumbnail Layout */}
          <div
            className="inventory-slots-compact"
            onClick={!inventoryExpanded ? toggleInventory : undefined}
            style={{ cursor: !inventoryExpanded ? 'pointer' : 'default' }}
            title={!inventoryExpanded ? 'Click to expand inventory (I)' : ''}
          >
            <div className={`inventory-slot-compact ${gameState.currentSlot === 'primaryWeapon' ? 'active' : ''}`}>
              <div className="slot-key">1</div>
              <div className="weapon-thumbnail">
                {getWeaponThumbnail(gameState.weaponSlots?.primary)}
              </div>
              <div className="slot-info">
                <div className="slot-weapon-name">{getWeaponName(gameState.weaponSlots?.primary) || 'Empty'}</div>
                <div className="slot-ammo">{getWeaponAmmo(gameState.weaponSlots?.primary) || ''}</div>
              </div>
            </div>

            <div className={`inventory-slot-compact ${gameState.currentSlot === 'secondaryWeapon' ? 'active' : ''}`}>
              <div className="slot-key">2</div>
              <div className="weapon-thumbnail">
                {getWeaponThumbnail(gameState.weaponSlots?.secondary)}
              </div>
              <div className="slot-info">
                <div className="slot-weapon-name">{getWeaponName(gameState.weaponSlots?.secondary) || 'Empty'}</div>
                <div className="slot-ammo">{getWeaponAmmo(gameState.weaponSlots?.secondary) || ''}</div>
              </div>
            </div>

            <div className={`inventory-slot-compact ${gameState.currentSlot === 'sidearm' ? 'active' : ''}`}>
              <div className="slot-key">3</div>
              <div className="weapon-thumbnail">
                <img src="/assets/Snake Fang Weapon Icon.png" alt="Snake Fang" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              <div className="slot-info">
                <div className="slot-weapon-name">Snake Fang</div>
                <div className="slot-ammo">∞</div>
              </div>
            </div>
          </div>

          {/* Expanded Content */}
          {inventoryExpanded && (
            <div className="inventory-expanded-content">
              {/* Expanded Header with Close Button */}
              <div className="inventory-header">
                <span className="inventory-title neon-text neon-purple">🎯 Arsenal</span>
                <button
                  className="inventory-toggle neon-button neon-purple"
                  onClick={toggleInventory}
                  title="Collapse Inventory (I)"
                >
                  ×
                </button>
              </div>

              {/* Full Weapon Slots */}
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
                    <div className="ammo-name">{formatDisplayName(ammoType, 'ammo')}</div>
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
                    <div className="powerup-name">{powerup.name || formatDisplayName(powerup.type, 'powerup')}</div>
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
        </div>
      )}
    </>
  );
};

export default GameUI;