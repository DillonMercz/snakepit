// Weapon configuration data (copied from src/gameLogic.js)
const WEAPON_CONFIGS = {
    sidearm: {
        name: 'Snake Fang', tier: 0, damage: 1, maxAmmo: Infinity, fireRate: 300, projectileSpeed: 12, accuracy: 90, rarity: 'default', color: '#888888', secondaryColor: '#AAAAAA', glowColor: '#CCCCCC', accentColor: '#EEEEEE', ammoTypes: [], description: 'Basic sidearm with unlimited ammo'
    },
    laser_pistol: {
        name: 'Laser Pistol', tier: 1, damage: 2, maxAmmo: 24, fireRate: 400, projectileSpeed: 18, accuracy: 95, rarity: 'common', color: '#FF4444', secondaryColor: '#FF7777', glowColor: '#FFAAAA', accentColor: '#FFCCCC', ammoTypes: ['light_energy'], description: 'Fast-firing energy sidearm'
    },
    plasma_smg: {
        name: 'Plasma SMG', tier: 1, damage: 1.5, maxAmmo: 30, fireRate: 200, projectileSpeed: 15, accuracy: 85, rarity: 'common', color: '#44FF44', secondaryColor: '#77FF77', glowColor: '#AAFFAA', accentColor: '#CCFFCC', ammoTypes: ['plasma_cells'], description: 'Rapid-fire plasma weapon', firingMode: 'full_auto'
    },
    laser_rifle: {
        name: 'Laser Rifle', tier: 2, damage: 3, maxAmmo: 30, fireRate: 600, projectileSpeed: 20, accuracy: 98, rarity: 'uncommon', color: '#FF2222', secondaryColor: '#FF6666', glowColor: '#FF9999', accentColor: '#FFCCCC', ammoTypes: ['light_energy', 'heavy_energy'], description: 'Accurate long-range laser', firingMode: 'tri_burst_sequential', burstCount: 3, burstDelay: 100, burstCooldown: 800
    },
    plasma_cannon: {
        name: 'Plasma Cannon', tier: 2, damage: 5, maxAmmo: 15, fireRate: 1000, projectileSpeed: 16, accuracy: 90, rarity: 'uncommon', color: '#22FF22', secondaryColor: '#66FF66', glowColor: '#99FF99', accentColor: '#CCFFCC', ammoTypes: ['plasma_cells', 'heavy_plasma'], description: 'Heavy plasma artillery', firingMode: 'tri_burst_spread', burstCount: 3, spreadAngle: 0.3
    },
    rocket_launcher: {
        name: 'Rocket Launcher', tier: 3, damage: 8, maxAmmo: 8, fireRate: 2000, projectileSpeed: 14, accuracy: 85, rarity: 'rare', color: '#FF6622', secondaryColor: '#FF9966', glowColor: '#FFCC99', accentColor: '#FFDDCC', ammoTypes: ['rockets'], description: 'Explosive rocket weapon'
    },
    rail_gun: {
        name: 'Rail Gun', tier: 3, damage: 12, maxAmmo: 5, fireRate: 3000, projectileSpeed: 25, accuracy: 100, rarity: 'rare', color: '#4444FF', secondaryColor: '#7777FF', glowColor: '#AAAAFF', accentColor: '#CCCCFF', ammoTypes: ['rail_slugs'], description: 'Piercing electromagnetic weapon'
    },
    minigun: {
        name: 'Minigun', tier: 4, damage: 2, maxAmmo: 500, fireRate: 60, projectileSpeed: 12, accuracy: 75, rarity: 'legendary', color: '#FF0000', secondaryColor: '#FF4444', glowColor: '#FF8888', accentColor: '#FFCCCC', ammoTypes: ['heavy_energy', 'heavy_plasma'], description: 'Rapid-fire heavy weapon with massive ammo capacity', spinUp: true, spinUpTime: 1000, maxSpinLevel: 10, firingMode: 'full_auto', tracerRounds: true
    }
};

// Ammo configuration (copied from src/gameLogic.js)
const AMMO_CONFIGS = {
    light_energy: { name: 'Energy Cells', color: '#FFFF44', minAmount: 15, maxAmount: 30, rarity: 'common' },
    heavy_energy: { name: 'Heavy Energy', color: '#FFAA44', minAmount: 8, maxAmount: 15, rarity: 'uncommon' },
    plasma_cells: { name: 'Plasma Cells', color: '#44FFAA', minAmount: 10, maxAmount: 20, rarity: 'common' },
    heavy_plasma: { name: 'Heavy Plasma', color: '#44FF44', minAmount: 5, maxAmount: 10, rarity: 'uncommon' },
    rockets: { name: 'Rockets', color: '#FF8844', minAmount: 2, maxAmount: 6, rarity: 'rare' },
    rail_slugs: { name: 'Rail Slugs', color: '#8844FF', minAmount: 1, maxAmount: 3, rarity: 'rare' }
};

module.exports = { WEAPON_CONFIGS, AMMO_CONFIGS };
