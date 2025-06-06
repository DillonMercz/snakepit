const ServerSnake = require('./ServerSnake');
const { validateMovementInput, sanitizeMovementInput, checkRateLimit } = require('../utils/validation');

// Weapon configuration data - ORIGINAL SYSTEM
const WEAPON_CONFIGS = {
  // Default sidearm - always available
  sidearm: {
    name: 'Snake Fang',
    tier: 0,
    damage: 1,
    maxAmmo: Infinity,
    fireRate: 300,
    projectileSpeed: 15, // Original: 12
    accuracy: 90,
    rarity: 'default',
    color: '#888888',
    ammoTypes: [],
    description: 'Basic sidearm with unlimited ammo'
  },
  // Tier 1: Light Weapons
  laser_pistol: {
    name: 'Laser Pistol',
    tier: 1,
    damage: 2,
    maxAmmo: 24,
    fireRate: 400,
    projectileSpeed: 22, // Original: 18
    accuracy: 95,
    rarity: 'common',
    color: '#FF4444',
    ammoTypes: ['light_energy'],
    description: 'Fast-firing energy sidearm'
  },
  plasma_smg: {
    name: 'Plasma SMG',
    tier: 1,
    damage: 1.5,
    maxAmmo: 40,
    fireRate: 150,
    projectileSpeed: 19, // Original: 15
    accuracy: 85,
    rarity: 'common',
    color: '#44FF44',
    ammoTypes: ['plasma_cells'],
    firingMode: 'full_auto',
    description: 'High rate of fire plasma weapon'
  },
  // Tier 2: Medium Weapons
  laser_rifle: {
    name: 'Laser Rifle',
    tier: 2,
    damage: 4,
    maxAmmo: 20,
    fireRate: 600,
    projectileSpeed: 31, // Original: 25
    accuracy: 98,
    rarity: 'uncommon',
    color: '#FF8844',
    ammoTypes: ['heavy_energy'],
    description: 'High-precision energy rifle'
  },
  plasma_cannon: {
    name: 'Plasma Cannon',
    tier: 2,
    damage: 6,
    maxAmmo: 12,
    fireRate: 800,
    projectileSpeed: 25, // Original: 20
    accuracy: 90,
    rarity: 'uncommon',
    color: '#8844FF',
    ammoTypes: ['heavy_plasma'],
    description: 'Heavy plasma artillery'
  },
  // Tier 3: Heavy Weapons
  rocket_launcher: {
    name: 'Rocket Launcher',
    tier: 3,
    damage: 12,
    maxAmmo: 6,
    fireRate: 1200,
    projectileSpeed: 22, // Original: 18
    accuracy: 85,
    rarity: 'rare',
    color: '#FF4488',
    ammoTypes: ['rockets'],
    description: 'Explosive rocket weapon'
  },
  rail_gun: {
    name: 'Rail Gun',
    tier: 3,
    damage: 15,
    maxAmmo: 8,
    fireRate: 1500,
    projectileSpeed: 44, // Original: 35
    accuracy: 100,
    rarity: 'rare',
    color: '#44FFFF',
    ammoTypes: ['rail_slugs'],
    description: 'Ultra-high velocity kinetic weapon'
  },
  // Tier 4: Legendary Weapons
  minigun: {
    name: 'Minigun',
    tier: 4,
    damage: 2,
    maxAmmo: 200,
    fireRate: 80, // Reverted from 600 back to 80
    projectileSpeed: 28, // Original: 22
    accuracy: 75,
    rarity: 'legendary',
    color: '#FFFF44',
    ammoTypes: ['heavy_energy'],
    firingMode: 'full_auto',
    tracerRounds: true,
    description: 'Devastating rapid-fire weapon'
  }
};

// Powerup configuration data - ORIGINAL SYSTEM
const POWERUP_CONFIGS = {
  helmet: {
    name: 'Combat Helmet',
    type: 'defensive',
    duration: Infinity, // Permanent until destroyed
    damageReduction: 0.0, // No damage reduction, just head protection
    headProtection: 1.0, // 100% protection until destroyed
    helmetHealth: 500, // Takes 500 damage before breaking
    rarity: 'common',
    color: '#888888',
    secondaryColor: '#AAAAAA',
    glowColor: '#CCCCCC',
    description: 'Absorbs 500 damage to head before breaking'
  },
  armor_plating: {
    name: 'Armor Plating',
    type: 'defensive',
    duration: 30000, // 30 seconds
    damageReduction: 0.3, // 30% damage reduction
    headProtection: 0.0,
    rarity: 'uncommon',
    color: '#4A4A4A',
    secondaryColor: '#666666',
    glowColor: '#888888',
    description: 'Reduces all damage by 30% for 30 seconds'
  },
  shield_generator: {
    name: 'Shield Generator',
    type: 'defensive',
    duration: 20000, // 20 seconds
    damageReduction: 0.5, // 50% damage reduction
    headProtection: 0.2, // 20% head protection
    rarity: 'rare',
    color: '#0088FF',
    secondaryColor: '#00AAFF',
    glowColor: '#00CCFF',
    description: 'Generates energy shield reducing damage by 50%'
  },
  speed_boost: {
    name: 'Speed Boost',
    type: 'enhancement',
    duration: 15000, // 15 seconds
    speedBoost: 0.4, // 40% speed increase
    rarity: 'common',
    color: '#FFAA00',
    secondaryColor: '#FFCC00',
    glowColor: '#FFDD00',
    description: 'Increases movement speed by 40% for 15 seconds'
  },
  damage_amplifier: {
    name: 'Damage Amplifier',
    type: 'offensive',
    duration: 25000, // 25 seconds
    damageMultiplier: 2.0, // Double damage
    rarity: 'rare',
    color: '#FF4444',
    secondaryColor: '#FF6666',
    glowColor: '#FF8888',
    description: 'Doubles weapon damage for 25 seconds'
  },
  forcefield: {
    name: 'Force Field',
    type: 'defensive',
    duration: 15000, // 15 seconds
    damageReduction: 0.8, // 80% damage reduction
    headProtection: 0.9, // 90% head protection
    rarity: 'rare',
    color: '#00FFFF',
    secondaryColor: '#44FFFF',
    glowColor: '#88FFFF',
    description: 'Creates energy field reducing damage by 80%'
  },
  battering_ram: {
    name: 'Battering Ram',
    type: 'offensive',
    duration: 20000, // 20 seconds
    boostDamage: 3.0, // Triple boost damage
    speedBoost: 0.3, // 30% speed increase
    rarity: 'uncommon',
    color: '#FF6600',
    secondaryColor: '#FF8800',
    glowColor: '#FFAA00',
    description: 'Boost attacks deal triple damage and increases speed'
  }
};

// Add VACUUM_CONSTANTS at the class level or near the top
const VACUUM_SETTINGS = {
  RADIUS: 200, // Increased from 150
  STRENGTH: 0.25, // Increased from 0.15
  MAX_SPEED: 15, // Increased from 12
  DAMPING: 0.85 // Decreased from 0.92 for faster response
};

class ServerGame {
  constructor(gameMode, options = {}) {
    this.gameMode = gameMode;
    this.worldWidth = options.worldWidth || 6000;
    this.worldHeight = options.worldHeight || 6000;
    this.maxPlayers = options.maxPlayers || 100;
    this.enableAI = options.enableAI !== undefined ? options.enableAI : true; // AI enabled by default

    // Game state
    this.gameRunning = true;
    this.players = new Map(); // playerId -> ServerSnake
    this.food = [];
    this.glowOrbs = [];
    this.coins = [];
    this.aiSnakes = []; // AI snakes for enhanced gameplay
    this.currentKing = null; // Track the snake with highest balance

    // Warfare mode specific
    if (gameMode === 'warfare') {
      this.weapons = [];
      this.ammo = [];
      this.powerups = [];
      this.projectiles = [];
    }

    // Rate limiting for player actions
    this.inputRateLimit = new Map(); // playerId -> timestamps
    this.shootRateLimit = new Map(); // playerId -> timestamps

    // Performance tracking
    this.lastUpdateTime = Date.now();
    this.updateCount = 0;

    // Initialize game world
    this.initializeWorld();

    // Initialize collision effects system
    this.collisionEffects = [];

    // Create AI snakes for enhanced gameplay (if enabled)
    if (this.enableAI) {
      this.initializeAISnakes();
    } else {
      console.log(`🤖 AI disabled for ${gameMode} mode - purely multiplayer`);
    }

    console.log(`🎮 ServerGame initialized for ${gameMode} mode`);

    this.VACUUM_SETTINGS = { // Make settings accessible via this
      RADIUS: 200,
      STRENGTH: 0.25,
      MAX_SPEED: 15,
      DAMPING: 0.85
    };
  }

  /**
   * Initialize the game world with food, orbs, and items
   */
  initializeWorld() {
    // Generate initial food - reduced for better performance
    const initialFoodCount = this.gameMode === 'warfare' ? 1200 : 800; // Reduced for better performance
    for (let i = 0; i < initialFoodCount; i++) {
      this.food.push({
        id: `food_${i}`,
        x: Math.random() * this.worldWidth,
        y: Math.random() * this.worldHeight,
        color: `hsl(${Math.random() * 360}, 70%, 60%)`,
        size: 4 + Math.random() * 3,
        value: 1,
        vx: 0, // For vacuum
        vy: 0, // For vacuum
        attractedToPlayerId: null // For vacuum
      });
    }

    // Generate initial glow orbs - drastically reduced for warfare mode
    const orbCount = this.gameMode === 'warfare' ? 25 : 150; // Much fewer orbs in warfare mode
    for (let i = 0; i < orbCount; i++) {
      const hue = Math.random() * 360;
      this.glowOrbs.push({
        id: `orb_${i}`,
        x: Math.random() * this.worldWidth,
        y: Math.random() * this.worldHeight,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        hue: hue,
        size: 8 + Math.random() * 4,
        glow: 0,
        value: 5
      });
    }

    // Generate warfare mode items
    if (this.gameMode === 'warfare') {
      this.generateWarfareItems();
    }

    console.log(`🌍 World initialized with ${this.food.length} food and ${this.glowOrbs.length} orbs`);
  }

  /**
   * Initialize AI snakes for enhanced gameplay - ORIGINAL MECHANIC
   */
  initializeAISnakes() {
    // Create AI snakes - reduced for better performance
    const aiCount = this.gameMode === 'warfare' ? 20 : 25;
    console.log(`Creating ${aiCount} AI snakes for ${this.gameMode} mode`);

    const availableWagers = [10, 25, 50, 100, 250, 500, 1000];
    const aiColors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
      '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2',
      '#A3E4D7', '#F9E79F', '#FADBD8'
    ];

    for (let i = 0; i < aiCount; i++) {
      const aiSnake = new ServerSnake(
        Math.random() * this.worldWidth,
        Math.random() * this.worldHeight,
        aiColors[i % aiColors.length],
        false, // isPlayer = false
        this.gameMode,
        this // Pass game instance for world bounds
      );

      // Set AI properties
      aiSnake.isAI = true;
      aiSnake.username = `AI_${i + 1}`;

      // Set random wager for AI snakes in both modes (gambling mechanics in both)
      aiSnake.wager = availableWagers[Math.floor(Math.random() * availableWagers.length)];
      // Give AI starting cash equal to their wager
      aiSnake.collectedCash = aiSnake.wager;

      // Activate spawn invincibility for AI snake
      aiSnake.activateSpawnInvincibility(aiSnake.wager);

      // AI personality traits for warfare mode
      if (this.gameMode === 'warfare') {
        aiSnake.aggressiveness = 0.3 + Math.random() * 0.7; // 0.3-1.0
        aiSnake.accuracy = 0.4 + Math.random() * 0.6; // 0.4-1.0
        aiSnake.reactionTime = 100 + Math.random() * 200; // 100-300ms
        aiSnake.lastDecisionTime = 0;
        aiSnake.combatState = 'exploring'; // exploring, hunting, fleeing, engaging
        aiSnake.shouldBoost = false;
      }

      this.aiSnakes.push(aiSnake);
    }

    console.log(`Created ${this.aiSnakes.length} AI snakes`);
  }

  /**
   * Generate weapons, ammo, and powerups for warfare mode
   */
  generateWarfareItems() {
    // Generate weapons
    for (let i = 0; i < 30; i++) {
      this.weapons.push({
        id: `weapon_${i}`,
        x: Math.random() * this.worldWidth,
        y: Math.random() * this.worldHeight,
        type: this.getRandomWeaponType(),
        collected: false,
        vx: 0, vy: 0, attractedToPlayerId: null, // For vacuum
        animationOffset: Math.random() * Math.PI * 2,
        pulsePhase: Math.random() * Math.PI * 2,
        rotationSpeed: 0.5 + Math.random() * 1.0
      });
    }

    // Generate ammo
    for (let i = 0; i < 80; i++) {
      this.ammo.push({
        id: `ammo_${i}`,
        x: Math.random() * this.worldWidth,
        y: Math.random() * this.worldHeight,
        type: this.getRandomAmmoType(),
        amount: Math.floor(10 + Math.random() * 20),
        collected: false,
        vx: 0, vy: 0, attractedToPlayerId: null, // For vacuum
        bobPhase: Math.random() * Math.PI * 2,
        sparklePhase: Math.random() * Math.PI * 2,
        animationOffset: Math.random() * Math.PI * 2
      });
    }

    // Generate powerups
    for (let i = 0; i < 40; i++) {
      this.powerups.push({
        id: `powerup_${i}`,
        x: Math.random() * this.worldWidth,
        y: Math.random() * this.worldHeight,
        type: this.getRandomPowerupType(),
        collected: false,
        vx: 0, vy: 0, attractedToPlayerId: null, // For vacuum
        bobPhase: Math.random() * Math.PI * 2,
        animationOffset: Math.random() * Math.PI * 2,
        pulsePhase: Math.random() * Math.PI * 2
      });
    }
  }

  /**
   * Add a player to the game
   * @param {Object} playerData - Player data
   * @returns {boolean} - Success status
   */
  addPlayer(playerData) {
    try {
      if (this.players.size >= this.maxPlayers) {
        return false;
      }

      // Create server-side snake for player
      const snake = new ServerSnake(
        Math.random() * this.worldWidth,
        Math.random() * this.worldHeight,
        playerData.color,
        true, // isPlayer
        this.gameMode,
        this // Pass game instance for world bounds
      );

      // Set player properties
      snake.playerId = playerData.id;
      snake.username = playerData.username;
      snake.wager = playerData.wager;
      snake.collectedCash = playerData.wager;

      // Activate spawn invincibility
      snake.activateSpawnInvincibility(playerData.wager);

      // --- START TEST CODE: Give player a Minigun ---
      if (snake.isPlayer) { // Only give to human players for testing
        const minigunConfig = WEAPON_CONFIGS.minigun;
        if (minigunConfig) {
          const minigunInstance = {
            type: 'minigun',
            name: minigunConfig.name,
            damage: minigunConfig.damage,
            maxAmmo: minigunConfig.maxAmmo,
            currentAmmo: minigunConfig.maxAmmo, // Start with full ammo
            fireRate: minigunConfig.fireRate,
            projectileSpeed: minigunConfig.projectileSpeed,
            accuracy: minigunConfig.accuracy,
            lastShotTime: 0,
            canShoot: function() {
              return Date.now() - this.lastShotTime >= this.fireRate;
            },
            shoot: function() {
              if (this.canShoot()) {
                this.lastShotTime = Date.now();
                return true;
              }
              return false;
            }
          };
          // Add to inventory and equip
          snake.weaponInventory.primaryWeapon = minigunInstance;
          snake.switchToWeapon('primaryWeapon');
          console.log(`🔫 TEST: Player ${snake.username} spawned with a Minigun!`);
        }
      }
      // --- END TEST CODE ---

      this.players.set(playerData.id, snake);
      
      console.log(`👤 Player ${playerData.username} added to game (${this.players.size}/${this.maxPlayers})`);
      return true;
      
    } catch (error) {
      console.error('Error adding player to game:', error);
      return false;
    }
  }

  /**
   * Remove a player from the game
   * @param {string} playerId - Player ID to remove
   */
  removePlayer(playerId) {
    const player = this.players.get(playerId);
    if (player) {
      // Only create coins if player is alive (disconnecting while alive)
      // If player is dead, coins were already created when they died
      if (player.alive) {
        this.createCoinsFromSnake(player);
      }

      this.players.delete(playerId);

      // Clean up rate limiting
      this.inputRateLimit.delete(playerId);
      this.shootRateLimit.delete(playerId);

      console.log(`👋 Player ${player.username} removed from game`);
    }
  }

  /**
   * Handle player input
   * @param {string} playerId - Player ID
   * @param {Object} inputData - Input data
   */
  handlePlayerInput(playerId, inputData) {
    // Rate limiting check
    if (!checkRateLimit(this.inputRateLimit, playerId, 60, 1000)) {
      return; // Too many requests
    }

    // Validate input
    if (!validateMovementInput(inputData)) {
      return;
    }

    // Sanitize input
    const sanitizedInput = sanitizeMovementInput(inputData);

    const player = this.players.get(playerId);
    if (!player || !player.alive) {
      return;
    }

    // Apply input to player
    if (sanitizedInput.targetAngle !== undefined) {
      player.targetAngle = sanitizedInput.targetAngle;
    }

    // Store mouse target coordinates for original movement algorithm
    if (sanitizedInput.worldX !== undefined && sanitizedInput.worldY !== undefined) {
      player.targetX = sanitizedInput.worldX;
      player.targetY = sanitizedInput.worldY;
    }

    if (sanitizedInput.boosting !== undefined) {
      player.boosting = sanitizedInput.boosting;
    }

    // Track mouse state for full auto firing
    if (sanitizedInput.mouseHeld !== undefined) {
      player.mouseHeld = sanitizedInput.mouseHeld;
    }
  }

  /**
   * Handle player shooting (warfare mode)
   * @param {string} playerId - Player ID
   * @param {Object} shootData - Shooting data
   */
  handlePlayerShoot(playerId, shootData) {
    if (this.gameMode !== 'warfare') return;

    // Rate limiting for shooting
    if (!checkRateLimit(this.shootRateLimit, playerId, 30, 1000)) {
      return; // Too many shots
    }

    const player = this.players.get(playerId);
    if (!player || !player.alive || player.isInvincible()) {
      return;
    }

    // Store last shoot target for full auto firing
    player.lastShootTarget = shootData;

    // Process shooting logic
    this.processPlayerShoot(player, shootData);
  }

  /**
   * Handle weapon switching (warfare mode)
   * @param {string} playerId - Player ID
   * @param {Object} weaponData - Weapon data
   */
  handleWeaponSwitch(playerId, weaponData) {
    if (this.gameMode !== 'warfare') return;

    const player = this.players.get(playerId);
    if (!player || !player.alive) {
      return;
    }

    // Process weapon switch
    player.switchToWeapon(weaponData.slot);
  }

  /**
   * Handle player cashout - original mechanic from single player
   * @param {string} playerId - Player ID
   * @param {Object} cashoutData - Cashout data
   * @returns {Object} - Cashout result
   */
  handlePlayerCashout(playerId, cashoutData) {
    const player = this.players.get(playerId);
    if (!player || !player.alive) {
      return { success: false, reason: 'Player not found or dead' };
    }

    // Check if player can cash out (has profit)
    if (player.cashedOut) {
      return {
        success: false,
        reason: 'Player has already cashed out'
      };
    }

    if (player.collectedCash <= player.wager) {
      return {
        success: false,
        reason: `Cannot cash out - current balance $${player.collectedCash} is not greater than wager $${player.wager}`
      };
    }

    // Use the original cashout method from ServerSnake
    const cashoutResult = player.cashOut();

    // The cashOut method returns an object with success, profit, and totalCashed
    if (!cashoutResult || !cashoutResult.success) {
      return {
        success: false,
        reason: 'Cashout failed - unable to process'
      };
    }

    console.log(`💰 Player ${player.username} cashed out $${cashoutResult.profit} profit (total: $${cashoutResult.totalCashed})`);

    return {
      success: true,
      profit: cashoutResult.profit,
      totalCashed: cashoutResult.totalCashed,
      playerId: playerId,
      username: player.username,
      newBalance: player.collectedCash, // Current balance after cashout (should be original wager)
      cashedOut: true
    };
  }

  /**
   * Main game update loop - ORIGINAL ALGORITHM
   */
  update() {
    const now = Date.now();
    const deltaTime = now - this.lastUpdateTime;
    this.lastUpdateTime = now;
    this.updateCount++;

    if (!this.gameRunning) return;

    // Handle full auto firing for warfare mode
    if (this.gameMode === 'warfare') {
      this.handleFullAutoFiring();
    }

    // Update all players
    for (const player of this.players.values()) {
      if (player.alive) {
        // Pass mouse target coordinates for original movement algorithm with delta time
        player.update(player.boosting, player.targetX, player.targetY, deltaTime);
      }
    }

    // Update AI snakes - ORIGINAL MECHANIC (if enabled)
    if (this.enableAI) {
      this.aiSnakes.forEach(snake => this.updateAISnake(snake, deltaTime));
    }

    // Update glow orbs
    this.updateGlowOrbs();

    // Update food items
    this.updateFoodItems();

    // Update coins
    this.updateCoins();

    // Warfare mode updates
    if (this.gameMode === 'warfare') {
      this.updateWarfareMode();
    }

    // Check collisions with vacuum effect
    this.checkCollisions();

    // Update king status - ORIGINAL MECHANIC
    this.updateKing();

    // Maintain world items
    this.maintainWorldItems();
  }

  /**
   * Handle full auto firing for warfare mode - ORIGINAL MECHANIC
   */
  handleFullAutoFiring() {
    // Only handle full auto weapons for players with mouse held down
    for (const player of this.players.values()) {
      if (!player.alive || !player.mouseHeld || !player.currentWeapon) continue;

      // Get weapon configuration from WEAPON_CONFIGS
      const weaponConfig = WEAPON_CONFIGS[player.currentWeapon.type] || WEAPON_CONFIGS.sidearm;
      const firingMode = weaponConfig.firingMode || 'semi_auto';

      // Only handle full auto weapons here
      if (firingMode === 'full_auto' && player.currentWeapon.canShoot()) {
        // Auto-shoot at last target position
        if (player.lastShootTarget) {
          this.processPlayerShoot(player, player.lastShootTarget);
        }
      }
    }
  }

  /**
   * Update AI snake behavior - ORIGINAL ALGORITHM
   * @param {ServerSnake} snake - AI snake to update
   * @param {number} deltaTime - Time elapsed since last update
   */
  updateAISnake(snake, deltaTime = 8.33) {
    if (!snake.alive) return;

    if (this.gameMode === 'warfare') {
      this.updateWarfareAI(snake, deltaTime);
    } else {
      this.updateClassicAI(snake, deltaTime);
    }
  }

  /**
   * Update classic mode AI behavior - ORIGINAL ALGORITHM
   * @param {ServerSnake} snake - AI snake to update
   * @param {number} deltaTime - Time elapsed since last update
   */
  updateClassicAI(snake, deltaTime = 8.33) {
    // Simple AI: move towards nearest coins, food, or away from threats
    let targetX = snake.x;
    let targetY = snake.y;
    let minDist = Infinity;
    let targetType = 'none';

    // Find nearest coins (high priority for cash)
    if (this.coins) {
      this.coins.forEach(coin => {
        if (coin.collected) return;
        const dist = Math.hypot(coin.x - snake.x, coin.y - snake.y);
        if (dist < minDist && dist < 200) {
          minDist = dist;
          targetX = coin.x;
          targetY = coin.y;
          targetType = 'coin';
        }
      });
    }

    // Find nearest food if no coins nearby
    if (targetType === 'none') {
      this.food.forEach(food => {
        const dist = Math.hypot(food.x - snake.x, food.y - snake.y);
        if (dist < minDist && dist < 150) {
          minDist = dist;
          targetX = food.x;
          targetY = food.y;
          targetType = 'food';
        }
      });
    }

    // Find nearest glow orb if no food nearby
    if (targetType === 'none') {
      this.glowOrbs.forEach(orb => {
        const dist = Math.hypot(orb.x - snake.x, orb.y - snake.y);
        if (dist < minDist && dist < 300) {
          minDist = dist;
          targetX = orb.x;
          targetY = orb.y;
          targetType = 'orb';
        }
      });
    }

    // Avoid other snakes
    const allSnakes = [...this.players.values(), ...(this.enableAI ? this.aiSnakes : [])].filter(s => s.alive && s !== snake);
    for (const otherSnake of allSnakes) {
      const dist = Math.hypot(otherSnake.x - snake.x, otherSnake.y - snake.y);
      if (dist < 100) {
        // Move away from other snake
        const avoidX = snake.x - (otherSnake.x - snake.x);
        const avoidY = snake.y - (otherSnake.y - snake.y);
        targetX = avoidX;
        targetY = avoidY;
        break;
      }
    }

    // Update snake direction
    if (targetX !== snake.x || targetY !== snake.y) {
      const dx = targetX - snake.x;
      const dy = targetY - snake.y;
      snake.targetAngle = Math.atan2(dy, dx);
    }

    // Random boost decision
    const shouldBoost = Math.random() < 0.1 && snake.boost > 20;
    snake.update(shouldBoost, targetX, targetY, deltaTime);
  }

  /**
   * Update warfare mode AI behavior - ORIGINAL ALGORITHM
   * @param {ServerSnake} snake - AI snake to update
   * @param {number} deltaTime - Time elapsed since last update
   */
  updateWarfareAI(snake, deltaTime = 8.33) {
    const now = Date.now();

    // Decision making frequency (AI thinks every 100-300ms based on personality)
    if (now - snake.lastDecisionTime < snake.reactionTime) {
      snake.update(snake.shouldBoost, undefined, undefined, deltaTime);
      return;
    }
    snake.lastDecisionTime = now;

    // Assess situation
    const situation = this.assessSituation(snake);

    // State machine for AI behavior
    this.updateAICombatState(snake, situation);

    // Execute behavior based on current state
    const action = this.executeAIBehavior(snake, situation);

    // Apply movement and actions
    if (action.targetX !== undefined && action.targetY !== undefined) {
      const dx = action.targetX - snake.x;
      const dy = action.targetY - snake.y;
      if (Math.hypot(dx, dy) > 0) {
        snake.targetAngle = Math.atan2(dy, dx);
      }
    }

    // Handle shooting (only if not invincible)
    if (action.shoot && action.shootTarget && !snake.isInvincible()) {
      const projectile = snake.shoot(action.shootTarget.x, action.shootTarget.y);
      if (projectile) {
        // Set ownerRef for proper friendly fire prevention
        projectile.ownerRef = snake;

        // AI shot projectile - logging removed to reduce spam
        this.projectiles.push(projectile);
      } else {
        // AI failed to shoot - logging removed to reduce spam
      }
    }

    // Update snake with boost decision
    snake.shouldBoost = action.boost;
    snake.update(action.boost, action.targetX, action.targetY, deltaTime);
  }

  /**
   * Update king status - ORIGINAL MECHANIC
   */
  updateKing() {
    // Find the snake with the highest balance
    const allSnakes = [...this.players.values(), ...(this.enableAI ? this.aiSnakes : [])].filter(snake => snake.alive);

    if (allSnakes.length === 0) return;

    let newKing = allSnakes[0];
    let highestBalance = allSnakes[0].collectedCash || 0;

    allSnakes.forEach(snake => {
      const balance = snake.collectedCash || 0;
      if (balance > highestBalance) {
        highestBalance = balance;
        newKing = snake;
      }
    });

    // Only update if king changed or if there's no current king
    if (this.currentKing !== newKing) {
      this.currentKing = newKing;
      console.log(`New king: ${newKing.isPlayer ? newKing.username : 'AI'} with balance $${highestBalance}`);
    }
  }

  /**
   * Assess AI situation for warfare mode - ORIGINAL ALGORITHM
   * @param {ServerSnake} snake - AI snake
   * @returns {Object} - Situation assessment
   */
  assessSituation(snake) {
    const situation = {
      nearbyEnemies: [],
      nearbyWeapons: [],
      nearbyAmmo: [],
      nearbyFood: [],
      nearbyOrbs: [],
      nearbyCoins: [],
      incomingProjectiles: [],
      threatLevel: 0,
      opportunityLevel: 0
    };

    const detectionRange = 300;
    const allSnakes = [...this.players.values(), ...(this.enableAI ? this.aiSnakes : [])].filter(s => s.alive && s !== snake);

    // Find nearby enemies
    allSnakes.forEach(enemy => {
      const dist = Math.hypot(enemy.x - snake.x, enemy.y - snake.y);
      if (dist < detectionRange) {
        situation.nearbyEnemies.push({
          snake: enemy,
          distance: dist,
          threat: this.calculateThreatLevel(snake, enemy)
        });
      }
    });

    // Find nearby items
    if (this.weapons) {
      this.weapons.forEach(weapon => {
        if (!weapon.collected) {
          const dist = Math.hypot(weapon.x - snake.x, weapon.y - snake.y);
          if (dist < detectionRange) {
            situation.nearbyWeapons.push({ item: weapon, distance: dist });
          }
        }
      });
    }

    // Calculate threat and opportunity levels
    situation.threatLevel = situation.nearbyEnemies.reduce((total, enemy) =>
      total + (enemy.threat / enemy.distance), 0);
    situation.opportunityLevel = situation.nearbyWeapons.length +
      situation.nearbyCoins.length + situation.nearbyFood.length;

    return situation;
  }

  /**
   * Calculate threat level between two snakes - ORIGINAL ALGORITHM
   * @param {ServerSnake} snake - AI snake
   * @param {ServerSnake} enemy - Enemy snake
   * @returns {number} - Threat level
   */
  calculateThreatLevel(snake, enemy) {
    let threat = 1;

    // Size comparison
    if (enemy.segments.length > snake.segments.length) {
      threat += 0.5;
    }

    // Weapon comparison (warfare mode)
    if (this.gameMode === 'warfare' && enemy.currentWeapon) {
      threat += 0.3;
    }

    return threat;
  }

  /**
   * Update AI combat state - ORIGINAL ALGORITHM
   * @param {ServerSnake} snake - AI snake
   * @param {Object} situation - Situation assessment
   */
  updateAICombatState(snake, situation) {
    const currentState = snake.combatState || 'exploring';

    if (situation.threatLevel > 2) {
      snake.combatState = 'fleeing';
    } else if (situation.nearbyEnemies.length > 0 && snake.aggressiveness > 0.6) {
      snake.combatState = 'engaging';
    } else if (situation.opportunityLevel > 0) {
      snake.combatState = 'hunting';
    } else {
      snake.combatState = 'exploring';
    }
  }

  /**
   * Execute AI behavior based on state - ORIGINAL ALGORITHM
   * @param {ServerSnake} snake - AI snake
   * @param {Object} situation - Situation assessment
   * @returns {Object} - Action to take
   */
  executeAIBehavior(snake, situation) {
    const action = {
      targetX: snake.x,
      targetY: snake.y,
      boost: false,
      shoot: false,
      shootTarget: null,
      switchWeapon: false
    };

    switch (snake.combatState) {
      case 'fleeing':
        // Move away from nearest threat
        if (situation.nearbyEnemies.length > 0) {
          const nearestEnemy = situation.nearbyEnemies[0].snake;
          action.targetX = snake.x - (nearestEnemy.x - snake.x);
          action.targetY = snake.y - (nearestEnemy.y - snake.y);
          action.boost = snake.boost > 10;
        }
        break;

      case 'engaging':
        // Attack nearest enemy
        if (situation.nearbyEnemies.length > 0) {
          const target = situation.nearbyEnemies[0].snake;
          action.targetX = target.x;
          action.targetY = target.y;
          action.shoot = true;
          action.shootTarget = { x: target.x, y: target.y };
          action.boost = Math.random() < 0.3;
        }
        break;

      case 'hunting':
        // Go for nearest valuable item
        if (situation.nearbyWeapons.length > 0) {
          const target = situation.nearbyWeapons[0].item;
          action.targetX = target.x;
          action.targetY = target.y;
        }
        break;

      case 'exploring':
      default:
        // Random movement
        action.targetX = snake.x + (Math.random() - 0.5) * 200;
        action.targetY = snake.y + (Math.random() - 0.5) * 200;
        break;
    }

    return action;
  }

  /**
   * Get current game state for broadcasting - INCLUDES AI SNAKES
   * @returns {Object} - Game state
   */
  getGameState() {
    const players = [];

    // Add human players
    for (const [playerId, player] of this.players.entries()) {
      players.push({
        id: playerId,
        username: player.username,
        x: player.x,
        y: player.y,
        segments: this.serializeSegments(player.segments), // Serialize segments safely
        color: player.color,
        alive: player.alive,
        boost: player.boost,
        cash: player.collectedCash,
        invincible: player.isInvincible(),
        blinkPhase: player.blinkPhase || 0,
        size: player.size,
        angle: player.angle,
        cashedOut: player.cashedOut || false,
        cashoutBalance: player.cashoutBalance || 0,
        isAI: false
      });
    }

    // Add AI snakes - ORIGINAL MECHANIC (if enabled)
    if (this.enableAI) {
      this.aiSnakes.forEach((aiSnake, index) => {
        players.push({
          id: `ai_${index}`,
          username: aiSnake.username,
          x: aiSnake.x,
          y: aiSnake.y,
          segments: this.serializeSegments(aiSnake.segments), // Serialize segments safely
          color: aiSnake.color,
          alive: aiSnake.alive,
          boost: aiSnake.boost,
          cash: aiSnake.collectedCash,
          invincible: aiSnake.isInvincible(),
          blinkPhase: aiSnake.blinkPhase || 0,
          size: aiSnake.size,
          angle: aiSnake.angle,
          isAI: true
        });
      });
    }

    const gameState = {
      players: players,
      food: this.food.slice(0, 200),
      glowOrbs: this.glowOrbs,
      coins: this.coins,
      currentKing: this.currentKing ? {
        username: this.currentKing.username,
        cash: this.currentKing.collectedCash,
        isAI: this.currentKing.isAI || false
      } : null,
      timestamp: Date.now()
    };

    // Add warfare mode data with safe serialization
    if (this.gameMode === 'warfare') {
      gameState.weapons = this.weapons.filter(w => !w.collected).map(w => {
        const config = WEAPON_CONFIGS[w.type] || WEAPON_CONFIGS.sidearm;
        return {
          id: w.id,
          x: w.x,
          y: w.y,
          type: w.type,
          name: config.name,
          description: config.description,
          rarity: config.rarity,
          color: config.color,
          tier: config.tier,
          size: 25, // Add size property for rendering
          animationOffset: w.animationOffset || Math.random() * Math.PI * 2,
          pulsePhase: w.pulsePhase || Math.random() * Math.PI * 2,
          rotationSpeed: w.rotationSpeed || (0.5 + Math.random() * 1.0),
          secondaryColor: config.secondaryColor || config.color,
          glowColor: config.glowColor || config.color,
          accentColor: config.accentColor || config.color
        };
      });
      gameState.ammo = this.ammo.filter(a => !a.collected).map(a => {
        // Get ammo config for proper rendering
        const ammoConfig = {
          light_energy: { color: '#FFFF44', name: 'Energy Cells', size: 15 },
          heavy_energy: { color: '#FFAA44', name: 'Heavy Energy', size: 18 },
          plasma_cells: { color: '#44FFAA', name: 'Plasma Cells', size: 16 },
          heavy_plasma: { color: '#44FF44', name: 'Heavy Plasma', size: 20 },
          rockets: { color: '#FF8844', name: 'Rockets', size: 22 },
          rail_slugs: { color: '#8844FF', name: 'Rail Slugs', size: 17 }
        };
        const config = ammoConfig[a.type] || ammoConfig.light_energy;

        return {
          id: a.id,
          x: a.x,
          y: a.y,
          type: a.type,
          amount: a.amount,
          size: config.size,
          color: config.color,
          name: config.name,
          bobPhase: a.bobPhase || Math.random() * Math.PI * 2,
          sparklePhase: a.sparklePhase || Math.random() * Math.PI * 2,
          animationOffset: a.animationOffset || Math.random() * Math.PI * 2
        };
      });
      gameState.powerups = this.powerups.filter(p => !p.collected).map(p => {
        const config = POWERUP_CONFIGS[p.type] || POWERUP_CONFIGS.helmet;

        // Determine size based on powerup type
        const sizeMap = {
          helmet: 18,
          armor_plating: 22,
          shield_generator: 25,
          speed_boost: 20,
          damage_amplifier: 24,
          forcefield: 26,
          battering_ram: 23
        };

        return {
          id: p.id,
          x: p.x,
          y: p.y,
          type: p.type,
          name: config.name,
          description: config.description,
          rarity: config.rarity,
          color: config.color,
          size: sizeMap[p.type] || 20,
          bobPhase: p.bobPhase || Math.random() * Math.PI * 2,
          animationOffset: p.animationOffset || Math.random() * Math.PI * 2,
          glowColor: config.glowColor || config.color,
          secondaryColor: config.secondaryColor || config.color
        };
      });
      gameState.projectiles = this.serializeProjectiles(this.projectiles);
      gameState.collisionEffects = this.collisionEffects || [];
    }

    return gameState;
  }

  /**
   * Safely serialize segments to prevent circular references
   */
  serializeSegments(segments) {
    return segments.map(segment => ({
      x: segment.x,
      y: segment.y,
      size: segment.size || 20,
      health: segment.health || 100
    }));
  }

  /**
   * Safely serialize projectiles to prevent circular references
   */
  serializeProjectiles(projectiles) {
    return projectiles.map(projectile => ({
      id: projectile.id,
      x: projectile.x,
      y: projectile.y,
      vx: projectile.vx,
      vy: projectile.vy,
      damage: projectile.damage,
      size: projectile.size || 3,
      color: projectile.color || '#FFFF00',
      type: projectile.type,
      createdAt: projectile.createdAt,
      ownerId: projectile.ownerId, // Include ownerId but not ownerRef
      angle: projectile.angle,
      isTracer: projectile.isTracer || false,
      animationOffset: projectile.animationOffset || 0,
      trail: projectile.trail || [] // Include trail data for visual effects
    }));
  }

  /**
   * Get game state for a specific player (OPTIMIZED PERSISTENT WORLD)
   * @param {string} playerId - Player ID
   * @returns {Object} - Player-specific game state with optimized data
   */
  getGameStateForPlayer(playerId) {
    const player = this.players.get(playerId);
    if (!player) {
      return this.getGameState();
    }

    // DYNAMIC OPTIMIZATION: Adaptive view distance based on player count
    const baseViewDistance = 1200;
    const totalPlayers = this.players.size + (this.enableAI ? this.aiSnakes.length : 0);
    const viewDistance = totalPlayers > 20 ? baseViewDistance * 0.7 :
                        totalPlayers > 10 ? baseViewDistance * 0.85 : baseViewDistance;

    const playerX = player.x;
    const playerY = player.y;

    // Filter food by distance for performance with dynamic limits
    const maxFoodItems = totalPlayers > 20 ? 100 : totalPlayers > 10 ? 125 : 150;
    const nearbyFood = this.food.filter(food =>
      Math.hypot(food.x - playerX, food.y - playerY) < viewDistance
    ).slice(0, maxFoodItems);

    // Include all players but with distance-based detail levels
    const allPlayers = [];
    for (const [id, p] of this.players.entries()) {
      const distance = Math.hypot(p.x - playerX, p.y - playerY);
      const isNearby = distance < viewDistance;

      allPlayers.push({
        id: id,
        username: p.username,
        x: p.x,
        y: p.y,
        segments: isNearby ? this.serializeSegments(p.segments) : [{ x: p.x, y: p.y }], // Simplified for distant players
        color: p.color,
        alive: p.alive,
        boost: p.boost,
        cash: p.collectedCash,
        invincible: p.isInvincible(),
        blinkPhase: p.blinkPhase || 0,
        size: p.size,
        angle: p.angle,
        cashedOut: p.cashedOut || false,
        cashoutBalance: p.cashoutBalance || 0,
        activePowerups: p.activePowerups || [], // Include active powerups for visual effects
        isAI: false
      });
    }

    // Include AI snakes with distance-based optimization (if enabled)
    if (this.enableAI) {
      this.aiSnakes.forEach((aiSnake, index) => {
        const distance = Math.hypot(aiSnake.x - playerX, aiSnake.y - playerY);
        const isNearby = distance < viewDistance;

        allPlayers.push({
          id: `ai_${index}`,
          username: aiSnake.username,
          x: aiSnake.x,
          y: aiSnake.y,
          segments: isNearby ? this.serializeSegments(aiSnake.segments) : [{ x: aiSnake.x, y: aiSnake.y }],
          color: aiSnake.color,
          alive: aiSnake.alive,
          boost: aiSnake.boost,
          cash: aiSnake.collectedCash,
          invincible: aiSnake.isInvincible(),
          blinkPhase: aiSnake.blinkPhase || 0,
          size: aiSnake.size,
          angle: aiSnake.angle,
          activePowerups: aiSnake.activePowerups || [], // Include active powerups for visual effects
          isAI: true
        });
      });
    }

    // OPTIMIZED: Build game state with nearby items and global objects
    const gameStateData = {
      players: allPlayers, // ALL players and AI snakes
      food: nearbyFood, // Nearby food items
      glowOrbs: this.glowOrbs, // ALL glow orbs (small count, keep global)
      coins: this.coins, // ALL coins (important for gameplay)
      playerData: {
        id: playerId,
        x: player.x,
        y: player.y,
        cash: player.collectedCash,
        boost: player.boost,
        weapon: player.currentWeapon?.type || 'sidearm',
        // Current weapon - ORIGINAL SYSTEM
        currentWeapon: player.currentWeapon ? {
          type: player.currentWeapon.type,
          name: player.currentWeapon.name,
          currentAmmo: player.currentWeapon.currentAmmo,
          maxAmmo: player.currentWeapon.maxAmmo
        } : {
          type: 'sidearm',
          name: 'Snake Fang',
          currentAmmo: Infinity,
          maxAmmo: Infinity
        },
        // Weapon inventory - ORIGINAL SYSTEM
        weaponInventory: {
          primaryWeapon: player.weaponInventory?.primaryWeapon ? {
            type: player.weaponInventory.primaryWeapon.type,
            name: player.weaponInventory.primaryWeapon.name,
            currentAmmo: player.weaponInventory.primaryWeapon.currentAmmo,
            maxAmmo: player.weaponInventory.primaryWeapon.maxAmmo
          } : null,
          secondaryWeapon: player.weaponInventory?.secondaryWeapon ? {
            type: player.weaponInventory.secondaryWeapon.type,
            name: player.weaponInventory.secondaryWeapon.name,
            currentAmmo: player.weaponInventory.secondaryWeapon.currentAmmo,
            maxAmmo: player.weaponInventory.secondaryWeapon.maxAmmo
          } : null,
          sidearm: {
            type: 'sidearm',
            name: 'Snake Fang',
            currentAmmo: Infinity,
            maxAmmo: Infinity
          },
          currentSlot: player.weaponInventory?.currentSlot || 'sidearm'
        },
        // Ammo inventory - ORIGINAL SYSTEM
        ammoInventory: player.ammoInventory || {},
        // Active powerups - ORIGINAL SYSTEM
        activePowerups: player.activePowerups || [],
        // Powerup inventory - ORIGINAL SYSTEM
        powerupInventory: player.powerupInventory || []
      },
      timestamp: Date.now()
    };

    // OPTIMIZED: Add nearby warfare mode items if in warfare mode
    if (this.gameMode === 'warfare') {
      // Filter weapons by distance for performance - aggressive optimization
      const weaponDistance = viewDistance * 1.2; // Reduced from 1.5x to 1.2x
      const nearbyWeapons = this.weapons.filter(w =>
        !w.collected && Math.hypot(w.x - playerX, w.y - playerY) < weaponDistance
      ).slice(0, 20); // Limit to 20 weapons max

      gameStateData.weapons = nearbyWeapons.map(w => {
        const config = WEAPON_CONFIGS[w.type] || WEAPON_CONFIGS.sidearm;
        return {
          id: w.id,
          x: w.x,
          y: w.y,
          type: w.type,
          name: config.name,
          description: config.description,
          rarity: config.rarity,
          color: config.color,
          tier: config.tier,
          size: 25,
          collected: w.collected || false,
          animationOffset: w.animationOffset || Math.random() * Math.PI * 2,
          pulsePhase: w.pulsePhase || Math.random() * Math.PI * 2,
          rotationSpeed: w.rotationSpeed || (0.5 + Math.random() * 1.0),
          secondaryColor: config.secondaryColor || config.color,
          glowColor: config.glowColor || config.color,
          accentColor: config.accentColor || config.color
        };
      });

      // Filter ammo by distance for performance with limits
      const nearbyAmmo = this.ammo.filter(a =>
        !a.collected && Math.hypot(a.x - playerX, a.y - playerY) < weaponDistance
      ).slice(0, 30); // Limit to 30 ammo packs max

      gameStateData.ammo = nearbyAmmo.map(a => {
        const ammoConfig = {
          light_energy: { color: '#FFFF44', name: 'Energy Cells', size: 15 },
          heavy_energy: { color: '#FFAA44', name: 'Heavy Energy', size: 18 },
          plasma_cells: { color: '#44FFAA', name: 'Plasma Cells', size: 16 },
          heavy_plasma: { color: '#44FF44', name: 'Heavy Plasma', size: 20 },
          rockets: { color: '#FF8844', name: 'Rockets', size: 22 },
          rail_slugs: { color: '#8844FF', name: 'Rail Slugs', size: 17 }
        };
        const config = ammoConfig[a.type] || ammoConfig.light_energy;

        return {
          id: a.id,
          x: a.x,
          y: a.y,
          type: a.type,
          amount: a.amount,
          size: config.size,
          color: config.color,
          name: config.name,
          collected: a.collected || false,
          bobPhase: a.bobPhase || Math.random() * Math.PI * 2,
          sparklePhase: a.sparklePhase || Math.random() * Math.PI * 2,
          animationOffset: a.animationOffset || Math.random() * Math.PI * 2
        };
      });

      // Filter powerups by distance for performance with limits
      const nearbyPowerups = this.powerups.filter(p =>
        !p.collected && Math.hypot(p.x - playerX, p.y - playerY) < weaponDistance
      ).slice(0, 15); // Limit to 15 powerups max

      gameStateData.powerups = nearbyPowerups.map(p => {
        const config = POWERUP_CONFIGS[p.type] || POWERUP_CONFIGS.helmet;

        // Determine size based on powerup type
        const sizeMap = {
          helmet: 18,
          armor_plating: 22,
          shield_generator: 25,
          speed_boost: 20,
          damage_amplifier: 24,
          forcefield: 26,
          battering_ram: 23
        };

        return {
          id: p.id,
          x: p.x,
          y: p.y,
          type: p.type,
          name: config.name,
          description: config.description,
          rarity: config.rarity,
          color: config.color,
          size: sizeMap[p.type] || 20,
          collected: p.collected || false,
          bobPhase: p.bobPhase || Math.random() * Math.PI * 2,
          animationOffset: p.animationOffset || Math.random() * Math.PI * 2,
          glowColor: config.glowColor || config.color,
          secondaryColor: config.secondaryColor || config.color
        };
      });

      // ALL projectiles with full trail data
      gameStateData.projectiles = this.serializeProjectiles(this.projectiles || []);

      // ALL collision effects
      gameStateData.collisionEffects = this.collisionEffects || [];
    }



    return gameStateData;
  }

  /**
   * Update glow orbs movement and behavior
   */
  updateGlowOrbs() {
    this.glowOrbs.forEach(orb => {
      // Move orb
      orb.x += orb.vx;
      orb.y += orb.vy;

      // Bounce off walls
      if (orb.x <= 0 || orb.x >= this.worldWidth) {
        orb.vx *= -1;
        orb.x = Math.max(0, Math.min(this.worldWidth, orb.x));
      }
      if (orb.y <= 0 || orb.y >= this.worldHeight) {
        orb.vy *= -1;
        orb.y = Math.max(0, Math.min(this.worldHeight, orb.y));
      }

      // Update glow effect
      orb.glow = (orb.glow + 0.1) % (Math.PI * 2);
    });
  }

  /**
   * Update coins (remove old ones, apply vacuum effect with lock-on)
   */
  updateCoins() {
    const now = Date.now();
    const attractors = Array.from(this.players.values()); // Coins only attracted by human players for now
    this.coins = this.coins.filter(coin => {
      if (coin.collected || (now - coin.creationTime) > 30000) {
        return false;
      }
      this.applyVacuumToItem(coin, attractors, 'coin');
      return true;
    });
  }

  /**
   * Helper function to apply vacuum physics to an item.
   * @param {Object} item - The item to apply vacuum to (e.g., coin, food).
   * @param {Array<ServerSnake>} potentialAttractors - Array of snakes that can attract the item.
   * @param {string} itemType - Optional string for logging/debugging.
   */
  applyVacuumToItem(item, potentialAttractors, itemType = 'item') {
    // Skip if item is already collected or marked for deletion
    if (item.collected || item.markedForDeletion) {
      item.vx = 0;
      item.vy = 0;
      return;
    }

    let targetAttractor = null;
    let minDistance = Infinity;

    // Find the closest attractor
    for (const attractor of potentialAttractors) {
      if (!attractor.alive) continue;

      const distance = Math.hypot(attractor.x - item.x, attractor.y - item.y);
      const vacuumRadius = attractor.size * (attractor.boosting ? 6 : 4); // Increased from 5 and 3.5

      if (distance < vacuumRadius && distance < minDistance) {
        minDistance = distance;
        targetAttractor = attractor;
      }
    }

    if (!targetAttractor) return;

    // Calculate vacuum effect
    const vacuumRadius = targetAttractor.size * (targetAttractor.boosting ? 6 : 4);
    const distanceRatio = 1 - (minDistance / vacuumRadius);
    
    // Stronger pull when boosting
    const basePullStrength = targetAttractor.boosting ? 3.5 : 1.8; // Increased from 2.5 and 1.2
    const pullStrength = basePullStrength + distanceRatio * (targetAttractor.boosting ? 5.0 : 3.0); // Increased from 4.0 and 2.0

    // Calculate angle and movement
    const angle = Math.atan2(targetAttractor.y - item.y, targetAttractor.x - item.x);
    const dx = Math.cos(angle) * pullStrength;
    const dy = Math.sin(angle) * pullStrength;

    // Update velocities with momentum and damping
    const damping = targetAttractor.boosting ? 0.5 : 0.7; // Decreased from 0.6 and 0.8 for faster response
    const momentum = targetAttractor.boosting ? 0.6 : 0.3; // Increased from 0.4 and 0.2

    // Initialize velocities if they don't exist
    item.vx = item.vx || 0;
    item.vy = item.vy || 0;

    // Apply velocity changes
    item.vx = item.vx * damping + dx * momentum;
    item.vy = item.vy * damping + dy * momentum;

    // Update position
    item.x += item.vx;
    item.y += item.vy;

    // Add slight randomization to prevent items from stacking
    if (targetAttractor.boosting) {
      item.x += (Math.random() - 0.5) * 0.8; // Increased from 0.5
      item.y += (Math.random() - 0.5) * 0.8; // Increased from 0.5
    }
  }

  /**
   * Update warfare mode specific elements
   */
  updateWarfareMode() {
    this.updateProjectiles();
    this.updateCollisionEffects();
    this.updateWarfareCollectibles(); // New call for vacuum effect
    this.maintainWarfareItems();
  }

  /**
   * Update projectiles - ORIGINAL ALGORITHM FROM GAMELOGIC.JS
   */
  updateProjectiles() {
    if (!this.projectiles) return;

    this.projectiles = this.projectiles.filter(projectile => {
      // Initialize trail if it doesn't exist
      if (!projectile.trail) {
        projectile.trail = [];
      }

      // Update trail for visual effects
      projectile.trail.push({ x: projectile.x, y: projectile.y, time: Date.now() });

      // Keep trail length manageable
      if (projectile.trail.length > 10) {
        projectile.trail.shift();
      }

      // Update position - ORIGINAL MOVEMENT
      projectile.x += projectile.vx;
      projectile.y += projectile.vy;

      // Check if projectile is out of bounds
      if (projectile.x < 0 || projectile.x > this.worldWidth ||
          projectile.y < 0 || projectile.y > this.worldHeight) {
        return false;
      }

      // Check collisions with snakes - ORIGINAL COLLISION SYSTEM
      const allSnakes = [...this.players.values(), ...(this.enableAI ? this.aiSnakes : [])].filter(s => s.alive);
      for (const snake of allSnakes) {
        // Skip collision with projectile owner (no friendly fire) - DEBUG CHECK
        // Only prevent hitting the exact same snake that fired the projectile
        const isOwner = snake === projectile.ownerRef;

        if (isOwner) {
          continue;
        }

        // Check if snake is invincible
        if (snake.isInvincible()) {
          continue; // Skip damage for invincible snakes
        }

        // Check head collision (instant kill with protection check) - ORIGINAL MECHANIC
        const headDx = snake.segments[0].x - projectile.x;
        const headDy = snake.segments[0].y - projectile.y;
        const headDist = Math.sqrt(headDx * headDx + headDy * headDy);

        if (headDist < snake.size) {
          // Check for forcefield ricochet first
          if (snake.hasForcefield && snake.hasForcefield()) {
            // Create ricochet effect
            this.createRicochetEffect(projectile, snake.x, snake.y);

            // Calculate ricochet angle (reflect off snake's surface)
            const incidentAngle = Math.atan2(projectile.vy, projectile.vx);
            const surfaceNormal = Math.atan2(headDy, headDx); // Normal from projectile to snake center
            const reflectionAngle = 2 * surfaceNormal - incidentAngle;

            // Apply ricochet with slight randomization
            const randomVariation = (Math.random() - 0.5) * 0.3; // ±0.15 radians
            const finalAngle = reflectionAngle + randomVariation;

            // Update projectile velocity (maintain speed but change direction)
            const speed = Math.sqrt(projectile.vx * projectile.vx + projectile.vy * projectile.vy);
            projectile.vx = Math.cos(finalAngle) * speed * 0.9; // Slight speed reduction
            projectile.vy = Math.sin(finalAngle) * speed * 0.9;

            // Clear owner to prevent infinite bouncing
            projectile.ownerId = null;
            projectile.ownerRef = null;

            return true; // Keep projectile but ricochet it
          }

          // --- START HELMET LOGIC FOR HEADSHOTS ---
          const activeHelmet = snake.getHelmet(); // Method in ServerSnake.js
          let projectileAbsorbedByHelmet = false;
          let killSnake = true; // Assume snake will be killed unless helmet saves it

          if (activeHelmet && activeHelmet.currentHelmetHealth > 0) {
            const helmetInitialHealth = activeHelmet.currentHelmetHealth;
            const projectileDamage = projectile.damage || 1; // Ensure projectile has damage value

            // damageHelmet returns true if helmet was destroyed, false if it absorbed but survived, null if no helmet
            const helmetDestroyedByThisHit = snake.damageHelmet(projectileDamage);

            if (helmetInitialHealth >= projectileDamage) {
              // Helmet had enough health to absorb the entire projectile damage
              projectileAbsorbedByHelmet = true;
              killSnake = false; // Snake survives this hit
              if (helmetDestroyedByThisHit === true) {
                this.createHelmetBreakEffect(snake.x, snake.y);
              }
              this.createCollisionEffect(projectile, snake.x, snake.y, 'head_helmet_absorb', snake);
            } else {
              // Helmet had some health, absorbed part of it, but broke. Damage still passes.
              // killSnake remains true.
              if (helmetDestroyedByThisHit === true) { // Should be true if initial health < damage
                this.createHelmetBreakEffect(snake.x, snake.y);
              }
              // No separate collision effect here, will fall through to standard headshot if killSnake is true
            }
          }
          // --- END HELMET LOGIC FOR HEADSHOTS ---

          if (projectileAbsorbedByHelmet) {
            return false; // Projectile is consumed, snake survived
          }

          // If projectile was not absorbed by helmet (no helmet, 0 health, or broke and couldn't absorb full hit)
          // Create standard headshot collision effect
          this.createCollisionEffect(projectile, snake.x, snake.y, 'head', snake);
          
          if (killSnake) { // If helmet didn't save the snake
            // If you want to keep probabilistic protection for non-helmet scenarios or as a last resort:
            // if (this.checkHeadshotProtection(snake, projectile)) {
            //   return false; // Remove projectile but snake survives probabilistically
            // }
            const weapon = projectile.type || projectile.weaponType || 'unknown';
            this.handleSnakeDeath(snake, projectile.ownerId, weapon, 'headshot');
          }
          return false; // Remove projectile
        }

        // Check body collision (segment damage system) - ORIGINAL SEGMENT SYSTEM
        let hitSegment = false;
        for (let i = 1; i < snake.segments.length; i++) {
          const segment = snake.segments[i];
          const dx = segment.x - projectile.x;
          const dy = segment.y - projectile.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < snake.size) {
            // Check for forcefield ricochet on body hits too
            if (snake.hasForcefield && snake.hasForcefield()) {
              // Create ricochet effect
              this.createRicochetEffect(projectile, segment.x, segment.y);

              // Calculate ricochet angle (reflect off segment surface)
              const incidentAngle = Math.atan2(projectile.vy, projectile.vx);
              const surfaceNormal = Math.atan2(dy, dx); // Normal from projectile to segment center
              const reflectionAngle = 2 * surfaceNormal - incidentAngle;

              // Apply ricochet with slight randomization
              const randomVariation = (Math.random() - 0.5) * 0.3; // ±0.15 radians
              const finalAngle = reflectionAngle + randomVariation;

              // Update projectile velocity (maintain speed but change direction)
              const speed = Math.sqrt(projectile.vx * projectile.vx + projectile.vy * projectile.vy);
              projectile.vx = Math.cos(finalAngle) * speed * 0.9; // Slight speed reduction
              projectile.vy = Math.sin(finalAngle) * speed * 0.9;

              // Clear owner to prevent infinite bouncing
              projectile.ownerId = null;
              projectile.ownerRef = null;

              return true; // Keep projectile but ricochet it
            }

            // Create body hit collision effect
            this.createCollisionEffect(projectile, segment.x, segment.y, 'body', snake);

            // Apply damage reduction from defensive powerups
            const damageReduction = snake.getDamageReduction ? snake.getDamageReduction() : 0;
            const baseDamage = projectile.damage * 25; // Scale damage for health system
            const finalDamage = baseDamage * (1 - damageReduction);

            segment.health -= finalDamage;

            // If segment health reaches 0, break it off - ORIGINAL MECHANIC
            if (segment.health <= 0) {
              this.breakOffSegments(snake, i, projectile.ownerId);
            }

            hitSegment = true;
            break;
          }
        }
        if (hitSegment) return false;
      }

      return true; // Keep projectile
    });
  }

  /**
   * Update collision effects - remove expired effects and update particles
   */
  updateCollisionEffects() {
    if (!this.collisionEffects) return;

    const now = Date.now();

    this.collisionEffects = this.collisionEffects.filter(effect => {
      // Check if effect has expired
      if (now - effect.createdAt > effect.duration) {
        return false;
      }

      // Update particles
      if (effect.particles) {
        effect.particles = effect.particles.filter(particle => {
          // Update particle position
          particle.x += particle.vx;
          particle.y += particle.vy;

          // Apply friction
          particle.vx *= 0.98;
          particle.vy *= 0.98;

          // Decrease life
          particle.life -= 16; // Assuming 60 FPS, decrease by ~1 frame

          // Remove dead particles
          return particle.life > 0;
        });
      }

      return true;
    });
  }

  /**
   * Check headshot protection mechanics - ORIGINAL ALGORITHM
   * @param {ServerSnake} snake - Snake being shot
   * @param {Object} projectile - Projectile hitting the snake
   * @returns {boolean} - Whether snake survives the headshot
   */
  checkHeadshotProtection(snake, projectile) {
    // Protection based on cash balance and powerups
    let protectionChance = 0;

    // Cash-based protection (higher cash = better protection)
    const cashBalance = snake.collectedCash || 0;
    if (cashBalance >= 1000) {
      protectionChance += 0.3; // 30% chance for high cash
    } else if (cashBalance >= 500) {
      protectionChance += 0.2; // 20% chance for medium cash
    } else if (cashBalance >= 100) {
      protectionChance += 0.1; // 10% chance for low cash
    }

    // Powerup-based protection
    if (snake.activePowerups) {
      snake.activePowerups.forEach(powerup => {
        if (powerup.type === 'helmet' || powerup.type === 'forcefield') {
          protectionChance += 0.4; // 40% additional protection from powerups
        }
      });
    }

    // Random chance based on protection level
    return Math.random() < protectionChance;
  }

  /**
   * Break off segments from a snake - ORIGINAL MECHANIC FROM GAMELOGIC.JS
   * @param {ServerSnake} snake - Snake losing segments
   * @param {number} segmentIndex - Index where to break
   * @param {string} attackerId - ID of attacking player
   */
  breakOffSegments(snake, segmentIndex, attackerId) {
    // Calculate cash value of broken segments
    const brokenSegments = snake.segments.splice(segmentIndex);
    const segmentValue = this.calculateSegmentValue(snake);

    // Calculate total value lost
    const totalValueLost = segmentValue * brokenSegments.length;

    // Reduce snake's cash balance based on lost segments
    snake.collectedCash = Math.max(0, snake.collectedCash - totalValueLost);

    // Create coins from broken segments - ORIGINAL COIN SYSTEM
    const coinsToCreate = Math.min(brokenSegments.length * 2, 50); // Limit coins for performance
    const valuePerCoin = totalValueLost / coinsToCreate;

    for (let i = 0; i < coinsToCreate; i++) {
      const segment = brokenSegments[i % brokenSegments.length];
      const angle = Math.random() * Math.PI * 2;
      const distance = 20 + Math.random() * 30;

      this.coins.push({
        id: `coin_${Date.now()}_${Math.random()}`,
        x: segment.x + Math.cos(angle) * distance,
        y: segment.y + Math.sin(angle) * distance,
        value: valuePerCoin,
        size: 8 + Math.random() * 4,
        collected: false,
        creationTime: Date.now(),
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4
      });
    }

    // Removed spammy log

    // If snake has no segments left, kill it
    if (snake.segments.length <= 1) {
      this.handleSnakeDeath(snake, attackerId, 'projectile', 'segments');
    }
  }

  /**
   * Calculate the cash value per segment for a snake - ORIGINAL CALCULATION
   * @param {ServerSnake} snake - Snake to calculate for
   * @returns {number} - Value per segment
   */
  calculateSegmentValue(snake) {
    // Base value per segment scales with total cash
    const baseValue = Math.max(1, snake.collectedCash / snake.segments.length);
    return baseValue * 0.1; // 10% of average segment value
  }

  /**
   * Handle snake death - ORIGINAL MECHANIC
   * @param {ServerSnake} snake - Snake that died
   * @param {string} killerId - ID of the killer (optional)
   * @param {string} weapon - Weapon used for the kill (optional)
   * @param {string} method - Method of elimination (optional)
   */
  handleSnakeDeath(snake, killerId = null, weapon = null, method = 'unknown') {
    // Mark snake as dead
    snake.alive = false;

    // Reset inventory immediately upon death (warfare mode only)
    if (this.gameMode === 'warfare' && !snake.isAI) {
      snake.resetWeaponInventory();
      snake.resetAmmoInventory();
      snake.resetPowerupInventory();
    }

    // Create coins from the dead snake - ORIGINAL BEHAVIOR
    this.createCoinsFromSnake(snake);

    // Send elimination event to all players if there's a killer
    if (killerId && this.broadcastToRoom) {
      const killer = this.players.get(killerId) || this.aiSnakes.find(ai => ai.username === killerId);
      if (killer) {
        const eliminationData = {
          id: `elimination_${Date.now()}_${Math.random()}`,
          killerName: killer.username,
          victimName: snake.username,
          weapon: weapon || 'unknown',
          method: method,
          timestamp: Date.now()
        };

        // Send to killer (if human player)
        if (this.players.has(killerId) && this.sendToPlayer) {
          this.sendToPlayer(killerId, 'playerElimination', eliminationData);
        }

        console.log(`🎯 ${killer.username} eliminated ${snake.username} with ${weapon || 'unknown'} (${method})`);
      }
    }

    // Schedule respawn
    if (snake.isAI) {
      this.scheduleAIRespawn(snake);
    } else {
      this.schedulePlayerRespawn(snake);
    }

    console.log(`💀 ${snake.username} died${killerId ? ` (killed by ${killerId})` : ''}`);
  }

  /**
   * Handle projectile hitting a player
   * @param {Object} projectile - Projectile that hit
   * @param {ServerSnake} player - Player that was hit
   */
  handleProjectileHit(projectile, player) {
    // Apply damage
    const damage = projectile.damage || 1;

    // Debug logging for damage application - removed to reduce spam

    player.takeDamage(damage);

    // Create coins if player dies
    if (!player.alive) {
      this.createCoinsFromSnake(player);
      this.schedulePlayerRespawn(player);
    }
  }

  /**
   * Create ricochet effect when projectile bounces off forcefield
   * @param {Object} projectile - Projectile that ricocheted
   * @param {number} x - Ricochet location X
   * @param {number} y - Ricochet location Y
   */
  createRicochetEffect(projectile, x, y) {
    const effectId = `ricochet_${Date.now()}_${Math.random()}`;

    const effect = {
      id: effectId,
      x: x,
      y: y,
      type: 'ricochet',
      weaponType: projectile.type || 'sidearm',
      createdAt: Date.now(),
      duration: 800, // Longer duration for ricochet effect
      particles: this.generateRicochetParticles(x, y),
      color: '#00FFFF', // Cyan color for forcefield ricochet
      size: 25,
      intensity: 1.5
    };

    this.collisionEffects.push(effect);
  }

  /**
   * Generate particles for ricochet effect
   * @param {number} x - Effect center X
   * @param {number} y - Effect center Y
   * @returns {Array} - Array of particles
   */
  generateRicochetParticles(x, y) {
    const particles = [];
    const particleCount = 15;

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5;
      const speed = 3 + Math.random() * 5;
      const size = 3 + Math.random() * 4;
      const life = 600 + Math.random() * 400;

      particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: size,
        life: life,
        maxLife: life,
        color: '#00FFFF' // Cyan for forcefield effect
      });
    }

    return particles;
  }

  /**
   * Create collision effect when projectile hits a target
   * @param {Object} projectile - Projectile that hit
   * @param {number} x - Hit location X
   * @param {number} y - Hit location Y
   * @param {string} hitType - Type of hit ('head', 'body', 'miss')
   * @param {ServerSnake} target - Target that was hit (optional)
   */
  createCollisionEffect(projectile, x, y, hitType = 'body', target = null) {
    const weaponType = projectile.type || 'sidearm';
    const effectId = `effect_${Date.now()}_${Math.random()}`;

    // Get weapon-specific effect properties
    const effectConfig = this.getWeaponEffectConfig(weaponType, hitType);

    const effect = {
      id: effectId,
      x: x,
      y: y,
      type: 'projectile_hit',
      weaponType: weaponType,
      hitType: hitType,
      createdAt: Date.now(),
      duration: effectConfig.duration,
      particles: this.generateEffectParticles(x, y, effectConfig),
      color: effectConfig.color,
      size: effectConfig.size,
      intensity: effectConfig.intensity
    };

    this.collisionEffects.push(effect);
  }

  /**
   * Get weapon-specific effect configuration
   * @param {string} weaponType - Type of weapon
   * @param {string} hitType - Type of hit
   * @returns {Object} - Effect configuration
   */
  getWeaponEffectConfig(weaponType, hitType) {
    const configs = {
      sidearm: {
        color: '#FFFF00',
        size: 15,
        intensity: 1.0,
        duration: 500,
        particleCount: 8
      },
      laser_pistol: {
        color: '#FF4444',
        size: 20,
        intensity: 1.2,
        duration: 600,
        particleCount: 12
      },
      laser_rifle: {
        color: '#FF2222',
        size: 25,
        intensity: 1.5,
        duration: 700,
        particleCount: 15
      },
      plasma_smg: {
        color: '#44FFAA',
        size: 18,
        intensity: 1.3,
        duration: 650,
        particleCount: 10
      },
      plasma_cannon: {
        color: '#22FF88',
        size: 30,
        intensity: 1.8,
        duration: 800,
        particleCount: 20
      },
      rocket_launcher: {
        color: '#FF8844',
        size: 40,
        intensity: 2.5,
        duration: 1000,
        particleCount: 25
      },
      rail_gun: {
        color: '#8844FF',
        size: 35,
        intensity: 2.0,
        duration: 900,
        particleCount: 18
      }
    };

    const baseConfig = configs[weaponType] || configs.sidearm;

    // Modify based on hit type
    if (hitType === 'head') {
      return {
        ...baseConfig,
        size: baseConfig.size * 1.5,
        intensity: baseConfig.intensity * 1.5,
        duration: baseConfig.duration * 1.2,
        particleCount: baseConfig.particleCount * 1.5
      };
    }

    return baseConfig;
  }

  /**
   * Generate particles for collision effect
   * @param {number} x - Effect center X
   * @param {number} y - Effect center Y
   * @param {Object} config - Effect configuration
   * @returns {Array} - Array of particles
   */
  generateEffectParticles(x, y, config) {
    const particles = [];

    for (let i = 0; i < config.particleCount; i++) {
      const angle = (Math.PI * 2 * i) / config.particleCount + (Math.random() - 0.5) * 0.5;
      const speed = 2 + Math.random() * 4;
      const size = 2 + Math.random() * 3;
      const life = config.duration * (0.8 + Math.random() * 0.4);

      particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: size,
        life: life,
        maxLife: life,
        color: config.color
      });
    }

    return particles;
  }

  /**
   * Create coins from a dead snake's segments - MODIFIED FOR HEADSHOTS & VX/VY
   * @param {ServerSnake} snake - Snake to create coins from
   */
  createCoinsFromSnake(snake) {
    const totalCashValue = snake.collectedCash || snake.wager || 50;

    if (!snake.segments || snake.segments.length === 0) {
      // console.warn(`Snake ${snake.username} has no segments for coin creation.`);
      return;
    }

    const numSegments = snake.segments.length;
    // Determine number of coins: at least 3, or 2 per segment, max 30.
    let coinsToCreateCount = Math.max(3, numSegments * 2);
    coinsToCreateCount = Math.min(coinsToCreateCount, 30);

    let valuePerCoin = 0;
    if (coinsToCreateCount > 0) {
        valuePerCoin = Math.max(1, Math.floor(totalCashValue / coinsToCreateCount));
    }

    // If total value is low, ensure coins reflect that, or drop $1 coins.
    if (totalCashValue > 0 && valuePerCoin === 0) {
        valuePerCoin = 1;
        coinsToCreateCount = Math.min(Math.max(1, Math.floor(totalCashValue)), 30);
    }

    if (coinsToCreateCount === 0 && totalCashValue > 0) { // Still no coins but there was value?
        coinsToCreateCount = 1; // Drop at least one coin with the total value
        valuePerCoin = totalCashValue;
    }

    for (let i = 0; i < coinsToCreateCount; i++) {
      // Distribute coins based on existing segments, cycling through them
      const segmentToUse = snake.segments[i % numSegments];
      this.coins.push({
        id: `coin_${Date.now()}_${snake.playerId || 'ai'}_${i}`,
        x: segmentToUse.x + (Math.random() - 0.5) * 30,
        y: segmentToUse.y + (Math.random() - 0.5) * 30,
        value: valuePerCoin,
        size: 15 + Math.random() * 8,
        creationTime: Date.now(),
        collected: false,
        attractedToPlayerId: null, // For vacuum
        vx: (Math.random() - 0.5) * 4, // Initial scatter velocity X
        vy: (Math.random() - 0.5) * 4, // Initial scatter velocity Y
        bobPhase: Math.random() * Math.PI * 2,
        sparklePhase: Math.random() * Math.PI * 2
      });
    }
  }

  /**
   * Convert snake to food instead of coins - ORIGINAL MECHANIC for classic mode
   * @param {ServerSnake} snake - Snake to create food from
   */
  convertSnakeToFood(snake) {
    // Convert each segment of the dead snake into food
    snake.segments.forEach((segment, index) => {
      // Skip the head (index 0) to avoid too much food
      if (index > 0) {
        this.food.push({
          id: `food_${Date.now()}_${index}`,
          x: segment.x + (Math.random() - 0.5) * 20, // Add some spread
          y: segment.y + (Math.random() - 0.5) * 20,
          color: snake.isPlayer ? '#FFD700' : '#FF6B6B', // Gold for player, red for AI
          size: 8 + Math.random() * 4,
          value: 2 // Higher value than normal food
        });
      }
    });

    // Removed spammy log
  }

  /**
   * Schedule a player to respawn after death
   * @param {ServerSnake} player - Player to respawn
   */
  schedulePlayerRespawn(player) {
    if (!player.isPlayer) return; // Only respawn human players, not AI

    // ORIGINAL BEHAVIOR: Don't respawn players who cashed out
    if (player.cashedOut) {
      console.log(`💰 Player ${player.username} cashed out - no respawn scheduled`);
      return;
    }

    // ORIGINAL BEHAVIOR: Don't auto-respawn - wait for player choice
    console.log(`💀 Player ${player.username} died - waiting for respawn choice`);
    // No automatic respawn - player must manually choose to respawn
  }

  /**
   * Handle manual respawn request from client (ORIGINAL BEHAVIOR)
   * @param {string} playerId - Player requesting respawn
   */
  handlePlayerRespawnRequest(playerId) {
    const player = this.players.get(playerId);
    if (!player) return;

    // Only check if player is alive
    if (player.alive) {
      console.log(`❌ Respawn denied for ${player.username} - already alive`);
      return;
    }

    // Reset cashout state before respawning
    player.cashedOut = false;
    player.cashoutBalance = 0;
    
    console.log(`🔄 Processing respawn request for ${player.username}`);
    this.respawnPlayer(player);
  }

  /**
   * Respawn a dead player
   * @param {ServerSnake} player - Player to respawn
   */
  respawnPlayer(player) {
    // Reset position to random location
    player.x = Math.random() * this.worldWidth;
    player.y = Math.random() * this.worldHeight;

    // If player was cashed out, use special reset method
    if (player.cashedOut) {
      player.resetAfterCashout();
    } else {
      // Reset player to alive state
      player.alive = true;

      // Reset segments to just head
      player.segments = [{
        x: player.x,
        y: player.y,
        health: 100,
        maxHealth: 100
      }];

      // Reset cash to initial wager
      player.collectedCash = player.wager;

      // Reset boost
      player.boost = player.maxBoost;

      // Activate spawn invincibility
      player.activateSpawnInvincibility(player.wager);
    }

    // Reset all gameplay states
    player.wantsRespawn = false;

    // Reset weapon inventory to sidearm only (warfare mode)
    if (this.gameMode === 'warfare') {
      player.resetWeaponInventory();
      console.log(`🔫 Reset ${player.username}'s weapon inventory to sidearm only`);
    }

    // Reset ammo inventory (warfare mode)
    if (this.gameMode === 'warfare') {
      player.resetAmmoInventory();
      console.log(`🔋 Reset ${player.username}'s ammo inventory`);
    }

    // Reset powerup inventory (warfare mode)
    if (this.gameMode === 'warfare') {
      player.resetPowerupInventory();
      console.log(`⚡ Reset ${player.username}'s powerup inventory`);
    }

    console.log(`🔄 Player ${player.username} respawned at (${Math.round(player.x)}, ${Math.round(player.y)})`);
  }

  /**
   * Process player shooting - ORIGINAL ALGORITHM FROM GAMELOGIC.JS
   * @param {ServerSnake} player - Player shooting
   * @param {Object} shootData - Shooting data
   */
  processPlayerShoot(player, shootData) {
    if (!player.currentWeapon || !player.currentWeapon.canShoot()) {
      return;
    }

    // Store last shoot target for full auto weapons
    player.lastShootTarget = shootData;

    // Get weapon configuration
    const weaponConfig = WEAPON_CONFIGS[player.currentWeapon.type] || WEAPON_CONFIGS.sidearm;
    const firingMode = weaponConfig.firingMode || 'semi_auto';

    // Calculate projectile direction with accuracy
    const baseAngle = Math.atan2(shootData.targetY - player.y, shootData.targetX - player.x);
    const accuracy = weaponConfig.accuracy || 90;
    const spread = (100 - accuracy) / 100 * 0.2; // Convert accuracy to spread
    const finalAngle = baseAngle + (Math.random() - 0.5) * spread;

    // Handle different firing modes - ORIGINAL SYSTEM
    switch (firingMode) {
      case 'tri_burst_sequential':
        this.handleSequentialBurst(player, shootData);
        break;
      case 'tri_burst_spread':
        this.handleSpreadBurst(player, shootData);
        break;
      case 'full_auto':
      case 'semi_auto':
      default:
        this.createProjectile(player, shootData.targetX, shootData.targetY);
        break;
    }

    // Switch to sidearm if current weapon is out of ammo
    if (player.currentWeapon.currentAmmo <= 0 && player.currentWeapon.type !== 'sidearm') {
      player.switchToWeapon('sidearm');
    }
  }

  /**
   * Create a single projectile - ORIGINAL ALGORITHM
   * @param {ServerSnake} player - Player shooting
   * @param {number} targetX - Target X coordinate
   * @param {number} targetY - Target Y coordinate
   */
  createProjectile(player, targetX, targetY) {
    // Use the ServerSnake's shoot method which properly handles ammo consumption
    const projectile = player.shoot(targetX, targetY);

    if (!projectile) return; // Couldn't shoot (no ammo, cooldown, etc.)

    // Get weapon configuration for enhanced properties
    const weaponConfig = WEAPON_CONFIGS[player.currentWeapon.type] || WEAPON_CONFIGS.sidearm;

    // Enhance projectile with additional properties
    projectile.type = player.currentWeapon.type;
    projectile.ownerRef = player; // Keep reference for easier comparison
    projectile.trail = []; // For trail effects
    projectile.animationOffset = Math.random() * Math.PI * 2;
    projectile.isTracer = weaponConfig.tracerRounds || false;
    projectile.color = weaponConfig.color || '#FFFF00';

    // Removed spammy log

    // Add projectile to game
    this.projectiles.push(projectile);
  }

  /**
   * Handle sequential burst firing - ORIGINAL ALGORITHM
   * @param {ServerSnake} player - Player shooting
   * @param {Object} shootData - Shooting data with target coordinates
   */
  handleSequentialBurst(player, shootData) {
    const burstCount = 3;
    const burstDelay = 100; // ms between shots in burst

    for (let i = 0; i < burstCount; i++) {
      setTimeout(() => {
        if (player.alive && player.currentWeapon && player.currentWeapon.currentAmmo > 0) {
          this.createProjectile(player, shootData.targetX, shootData.targetY);
        }
      }, i * burstDelay);
    }
  }

  /**
   * Handle spread burst firing - ORIGINAL ALGORITHM
   * @param {ServerSnake} player - Player shooting
   * @param {Object} shootData - Shooting data with target coordinates
   */
  handleSpreadBurst(player, shootData) {
    const burstCount = 3;
    const spreadAngle = 0.3; // Spread between projectiles
    const baseAngle = Math.atan2(shootData.targetY - player.y, shootData.targetX - player.x);

    for (let i = 0; i < burstCount; i++) {
      const angle = baseAngle + (i - 1) * spreadAngle; // -1, 0, 1 pattern
      // Convert angle back to target coordinates for spread shots
      const distance = 1000; // Arbitrary distance for target calculation
      const targetX = player.x + Math.cos(angle) * distance;
      const targetY = player.y + Math.sin(angle) * distance;
      this.createProjectile(player, targetX, targetY);
    }
  }

  getRandomWeaponType() {
    const types = ['laser_pistol', 'plasma_smg', 'laser_rifle', 'plasma_cannon', 'rocket_launcher', 'rail_gun', 'minigun'];
    // Weight the selection based on rarity - ORIGINAL SYSTEM
    const weights = [30, 30, 20, 15, 5, 1, 0.5]; // Common weapons more likely, minigun extremely rare

    let totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    let random = Math.random() * totalWeight;

    for (let i = 0; i < types.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return types[i];
      }
    }

    return types[0]; // Fallback
  }

  getRandomAmmoType() {
    const types = ['light_energy', 'plasma_cells', 'heavy_energy', 'heavy_plasma', 'rockets', 'rail_slugs'];
    return types[Math.floor(Math.random() * types.length)];
  }

  getRandomPowerupType() {
    const types = ['helmet', 'armor_plating', 'shield_generator', 'speed_boost', 'damage_amplifier', 'forcefield', 'battering_ram'];
    // Weight the selection based on rarity - ORIGINAL SYSTEM
    const weights = [30, 20, 10, 25, 15, 8, 18]; // Common powerups more likely, rare ones less likely

    let totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    let random = Math.random() * totalWeight;

    for (let i = 0; i < types.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return types[i];
      }
    }

    return types[0]; // Fallback
  }

  /**
   * Check collisions between players, AI snakes, and world items - ORIGINAL ALGORITHM
   */
  checkCollisions() {
    // Check collisions for human players
    for (const player of this.players.values()) {
      if (!player.alive) continue;

      // Check food collisions (includes vacuum effect)
      this.checkFoodCollisions(player);

      // Check glow orb collisions
      this.checkGlowOrbCollisions(player);

      // Check coin collisions
      this.checkCoinCollisions(player);

      // Check warfare item collisions
      if (this.gameMode === 'warfare') {
        this.checkWarfareItemCollisions(player);
      }

      // Check player-to-player collisions
      this.checkPlayerCollisions(player);

      // Check player-to-AI collisions
      this.checkPlayerToAICollisions(player);
    }

    // Check collisions for AI snakes
    this.aiSnakes.forEach(aiSnake => {
      if (!aiSnake.alive) return;

      // Check glow orb collisions for AI
      this.checkGlowOrbCollisions(aiSnake);

      // Check coin collisions for AI
      this.checkCoinCollisions(aiSnake);

      // Check warfare item collisions for AI
      if (this.gameMode === 'warfare') {
        this.checkWarfareItemCollisions(aiSnake);
      }

      // Check AI-to-player collisions (missing collision check!)
      this.checkAIToPlayerCollisions(aiSnake);

      // Check AI-to-AI collisions
      this.checkAIToAICollisions(aiSnake);
    });
  }

  /**
   * Check food collisions for a player with vacuum effect - ORIGINAL MECHANICS
   * @param {ServerSnake} player - Player to check
   */
  checkFoodCollisions(player) {
    const vacuumRadius = player.size * 3.5; // Original vacuum radius
    const collectRadius = player.size + 5; // Slightly larger than snake size for better collection feel

    this.food = this.food.filter(food => {
      if (food.collected) return false; // Skip already collected food

      const distance = Math.hypot(food.x - player.x, food.y - player.y);

      // Vacuum effect - pull food toward snake (ORIGINAL MECHANIC)
      if (distance < vacuumRadius && distance > collectRadius && !food.collected) {
        // Calculate pull strength that increases as food gets closer
        const distanceRatio = 1 - (distance / vacuumRadius);
        const pullStrength = 1.2 + distanceRatio * 2.0; // Stronger pull when closer
        
        // Calculate angle and movement
        const angle = Math.atan2(player.y - food.y, player.x - food.x);
        const dx = Math.cos(angle) * pullStrength;
        const dy = Math.sin(angle) * pullStrength;
        
        // Update food position with velocity damping
        food.vx = (food.vx || 0) * 0.8 + dx * 0.2;
        food.vy = (food.vy || 0) * 0.8 + dy * 0.2;
        food.x += food.vx;
        food.y += food.vy;
      }

      // Collect food on contact
      if (distance < collectRadius) {
        // Mark as collected immediately
        food.collected = true;
        
        // Food gives ONLY SPEED BOOST and BOOST PERCENTAGE - NO GROWTH (original mechanics)
        player.addSpeedBoost(1);
        player.boostCapRemoved = true;
        player.boost += 5;
        
        return false; // Remove food
      }

      return true; // Keep food
    });

    // Apply vacuum effect to AI snakes with the same improvements
    this.aiSnakes.forEach(aiSnake => {
      if (!aiSnake.alive) return;

      const aiVacuumRadius = aiSnake.size * 3.5;
      const aiCollectRadius = aiSnake.size + 5;

      this.food.forEach(food => {
        if (food.collected) return; // Skip already collected food

        const distance = Math.hypot(food.x - aiSnake.x, food.y - aiSnake.y);

        // Vacuum effect for AI snakes
        if (distance < aiVacuumRadius && distance > aiCollectRadius) {
          const distanceRatio = 1 - (distance / aiVacuumRadius);
          const pullStrength = 1.2 + distanceRatio * 2.0;
          
          const angle = Math.atan2(aiSnake.y - food.y, aiSnake.x - food.x);
          const dx = Math.cos(angle) * pullStrength;
          const dy = Math.sin(angle) * pullStrength;
          
          food.vx = (food.vx || 0) * 0.8 + dx * 0.2;
          food.vy = (food.vy || 0) * 0.8 + dy * 0.2;
          food.x += food.vx;
          food.y += food.vy;
        }

        // AI food collection
        if (distance < aiCollectRadius) {
          food.collected = true;
          aiSnake.addSpeedBoost(1);
          aiSnake.boostCapRemoved = true;
          aiSnake.boost += 5;
        }
      });
    });

    // Clean up collected food
    this.food = this.food.filter(food => !food.collected);
  }

  /**
   * Check glow orb collisions for a player - ORIGINAL MECHANICS
   * @param {ServerSnake} player - Player to check
   */
  checkGlowOrbCollisions(player) {
    this.glowOrbs = this.glowOrbs.filter(orb => {
      const distance = Math.hypot(orb.x - player.x, orb.y - player.y);
      if (distance < player.size + orb.size) {
        // Golden orbs add ONLY 100% boost - NO GROWTH (original mechanic)
        player.boost = Math.min(player.boost + 100, player.maxBoost + 200); // Can exceed max boost

        // Orbs give ONLY boost, no growth in any mode

        return false; // Remove orb
      }
      return true; // Keep orb
    });
  }

  /**
   * Check coin collisions for a player
   * @param {ServerSnake} player - Player to check
   */
  checkCoinCollisions(player) {
    this.coins = this.coins.filter(coin => {
      if (coin.collected) return false;

      const distance = Math.hypot(coin.x - player.x, coin.y - player.y);
      if (distance < player.size + 10) {
        // Player collected coin
        player.addCash(coin.value);
        coin.collected = true;
        return false; // Remove coin
      }
      return true; // Keep coin
    });
  }

  /**
   * Check warfare item collisions for a player
   * @param {ServerSnake} player - Player to check
   */
  checkWarfareItemCollisions(player) {
    // Check weapon collisions
    this.weapons = this.weapons.filter(weapon => {
      if (weapon.collected) return false;

      const distance = Math.hypot(weapon.x - player.x, weapon.y - player.y);
      if (distance < player.size + 25) {
        player.addWeaponToInventory(weapon);
        weapon.collected = true;
        return false;
      }
      return true;
    });

    // Check ammo collisions
    this.ammo = this.ammo.filter(ammo => {
      if (ammo.collected) return false;

      const distance = Math.hypot(ammo.x - player.x, ammo.y - player.y);
      if (distance < player.size + 15) {
        player.addAmmo(ammo.type, ammo.amount);
        ammo.collected = true;
        return false;
      }
      return true;
    });

    // Check powerup collisions
    this.powerups = this.powerups.filter(powerup => {
      if (powerup.collected) return false;

      const distance = Math.hypot(powerup.x - player.x, powerup.y - player.y);
      if (distance < player.size + 20) {
        player.addPowerup(powerup);
        powerup.collected = true;
        return false;
      }
      return true;
    });
  }

  /**
   * Check player-to-player collisions
   * @param {ServerSnake} player - Player to check
   */
  checkPlayerCollisions(player) {
    // Skip collision checks if this player is invincible
    if (player.isInvincible()) return;

    for (const otherPlayer of this.players.values()) {
      if (otherPlayer === player || !otherPlayer.alive || otherPlayer.isInvincible()) {
        continue;
      }

      const playerIsRamming = player.hasActivePowerup('battering_ram') && player.boosting;
      const otherPlayerIsRamming = otherPlayer.hasActivePowerup('battering_ram') && otherPlayer.boosting;

      // --- BODY COLLISIONS ---
      // Check if player's head hits other player's body segments
      for (let i = 1; i < otherPlayer.segments.length; i++) {
        const segment = otherPlayer.segments[i];
        const distance = Math.hypot(segment.x - player.x, segment.y - player.y);

        if (distance < player.size + otherPlayer.size) {
          if (playerIsRamming) {
            this.createCollisionEffect({ type: 'battering_ram_impact', weaponType: 'battering_ram' }, segment.x, segment.y, 'battering_ram_body_hit', otherPlayer);
            this.breakOffSegments(otherPlayer, i, player.playerId);
            // Rammer (player) survives this body segment hit.
            // Victim (otherPlayer) might die if all segments are gone (handled in breakOffSegments).
            return; // Collision handled for this pair, player continues its update loop.
          } else {
            // Standard head-to-body collision: player (attacker) dies.
            this.handleSnakeDeath(player, otherPlayer.playerId, 'collision', 'body_hit');
            return; // Player died, exit checks for this player.
          }
        }
      }

      // Symmetrical check: otherPlayer's head hits player's body segments
      // Only if otherPlayer is NOT invincible (already checked for 'player')
      if (!otherPlayer.isInvincible()) { // Re-check for otherPlayer as attacker
          for (let i = 1; i < player.segments.length; i++) {
            const segment = player.segments[i];
            const distance = Math.hypot(segment.x - otherPlayer.x, segment.y - otherPlayer.y);

            if (distance < otherPlayer.size + player.size) {
              if (otherPlayerIsRamming) {
                this.createCollisionEffect({ type: 'battering_ram_impact', weaponType: 'battering_ram' }, segment.x, segment.y, 'battering_ram_body_hit', player);
                this.breakOffSegments(player, i, otherPlayer.playerId);
                // Rammer (otherPlayer) survives. Victim (player) might die.
                // Since 'player' is the one this function iteration is for, if it dies, we should return.
                if (!player.alive) return;
                // If player survived segment loss, otherPlayer handled, continue player's main loop.
                // This interaction with otherPlayer is done.
                // We must be careful not to immediately re-process a collision with this same otherPlayer in this loop.
                // However, the outer loop iterates otherPlayer, so it will check collisions for otherPlayer in its own main turn.
                // This logic here correctly handles otherPlayer ramming player's body.
                // To prevent player from continuing and possibly hitting otherPlayer again in the *same* checkPlayerCollisions(player) call:
                // We can `continue` the outer loop to move to the next `otherPlayer`.
                // This means `player` will not check head-to-head with this `otherPlayer` after its body was rammed.
                // This seems reasonable: if your body is rammed, the interaction is resolved for this tick from your perspective.
                continue; // Move to the next otherPlayer for 'player' to check against.
              } else {
                // Standard head-to-body: otherPlayer (attacker) dies.
                // This is otherPlayer's attack, so they die. Player (victim) survives.
                // This specific death (otherPlayer) will be handled when checkPlayerCollisions(otherPlayer) is called.
                // No action needed for 'player' here other than noting it was hit.
              }
            }
          }
      }

      // --- HEAD-TO-HEAD COLLISIONS ---
      // Only check once per pair to avoid double processing and ensure correct ramming priority.
      if (player.playerId < otherPlayer.playerId) { 
        const headDistance = Math.hypot(otherPlayer.x - player.x, otherPlayer.y - player.y);
        if (headDistance < player.size + otherPlayer.size) {
          if (playerIsRamming && !otherPlayerIsRamming) {
            this.handleBatteringRamHeadCollision(player, otherPlayer); // Rammer, Victim
          } else if (!playerIsRamming && otherPlayerIsRamming) {
            this.handleBatteringRamHeadCollision(otherPlayer, player); // Rammer, Victim
          } else if (playerIsRamming && otherPlayerIsRamming) {
            // Both ramming: a spectacular clash! Both should be annihilated.
            this.createCollisionEffect({ type: 'battering_ram_clash', weaponType: 'battering_ram' }, (player.x + otherPlayer.x) / 2, (player.y + otherPlayer.y) / 2, 'battering_ram_head_clash');
            // Helmets (if any) are obliterated instantly by such a force.
            if (player.hasHelmet()) player.damageHelmet(2000); // Ensure helmet breaks
            if (otherPlayer.hasHelmet()) otherPlayer.damageHelmet(2000); // Ensure helmet breaks
            this.createHelmetBreakEffect(player.x,player.y); // visual effect if helmet was there
            this.createHelmetBreakEffect(otherPlayer.x,otherPlayer.y); // visual effect if helmet was there

            this.handleSnakeDeath(player, otherPlayer.playerId, 'battering_ram_clash', 'head_on_ram_clash');
            this.handleSnakeDeath(otherPlayer, player.playerId, 'battering_ram_clash', 'head_on_ram_clash');
          } else {
            // Standard head-to-head (neither ramming)
            const playerHasHelmet = player.hasHelmet && player.hasHelmet();
            const otherHasHelmet = otherPlayer.hasHelmet && otherPlayer.hasHelmet();
            if (playerHasHelmet || otherHasHelmet) {
              this.handleHelmetHeadCollision(player, otherPlayer, playerHasHelmet, otherHasHelmet);
            } else {
              // No helmets, both die.
              this.handleSnakeDeath(player, otherPlayer.playerId, 'collision', 'head_on');
              this.handleSnakeDeath(otherPlayer, player.playerId, 'collision', 'head_on');
            }
          }
          return; // Head-to-head collision handled for this pair.
        }
      }
    }
  }

  /**
   * Handle helmet head collision with bounce mechanics
   * @param {ServerSnake} player1 - First player in collision
   * @param {ServerSnake} player2 - Second player in collision
   * @param {boolean} player1HasHelmet - Whether player1 has helmet
   * @param {boolean} player2HasHelmet - Whether player2 has helmet
   */
  handleHelmetHeadCollision(player1, player2, player1HasHelmet, player2HasHelmet) {
    // Calculate collision vector (from player1 to player2)
    const dx = player2.x - player1.x;
    const dy = player2.y - player1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) return; // Avoid division by zero

    // Normalize collision vector
    const nx = dx / distance;
    const ny = dy / distance;

    // Calculate bounce force and separation distance
    const bounceForce = 150; // How far apart they bounce
    const speedReduction = 0.7; // Speed reduction after bounce

    // Separate the players
    const separationDistance = (player1.size + player2.size) * 1.2;
    const overlap = separationDistance - distance;
    const separationForce = overlap * 0.5;

    player1.x -= nx * separationForce;
    player1.y -= ny * separationForce;
    player2.x += nx * separationForce;
    player2.y += ny * separationForce;

    // Apply bounce velocities (reverse their movement directions)
    const bounceAngle1 = Math.atan2(-ny, -nx) + (Math.random() - 0.5) * 0.3; // Add randomness
    const bounceAngle2 = Math.atan2(ny, nx) + (Math.random() - 0.5) * 0.3;

    // Update movement angles with bounce
    player1.angle = bounceAngle1;
    player2.angle = bounceAngle2;

    // Apply temporary speed boost for bounce effect
    const originalSpeed1 = player1.baseSpeed;
    const originalSpeed2 = player2.baseSpeed;

    // Temporarily increase speed for bounce effect
    player1.baseSpeed *= 1.5;
    player2.baseSpeed *= 1.5;

    // Reset speed after a short time
    setTimeout(() => {
      player1.baseSpeed = originalSpeed1;
      player2.baseSpeed = originalSpeed2;
    }, 500);

    // Handle helmet damage and destruction
    if (player1HasHelmet) {
      const helmetDestroyed = player1.damageHelmet(500); // Full helmet damage
      if (helmetDestroyed) {
        console.log(`🪖 ${player1.username}'s helmet was destroyed in head collision!`);
        this.createHelmetBreakEffect(player1.x, player1.y);
      }
    }

    if (player2HasHelmet) {
      const helmetDestroyed = player2.damageHelmet(500); // Full helmet damage
      if (helmetDestroyed) {
        console.log(`🪖 ${player2.username}'s helmet was destroyed in head collision!`);
        this.createHelmetBreakEffect(player2.x, player2.y);
      }
    }

    // Create bounce effect
    this.createBounceEffect((player1.x + player2.x) / 2, (player1.y + player2.y) / 2);

    console.log(`⚡ ${player1.username} and ${player2.username} bounced off each other (helmet protection)`);
  }

  /**
   * Create helmet break effect
   * @param {number} x - Effect location X
   * @param {number} y - Effect location Y
   */
  createHelmetBreakEffect(x, y) {
    const effectId = `helmet_break_${Date.now()}_${Math.random()}`;

    const effect = {
      id: effectId,
      x: x,
      y: y,
      type: 'helmet_break',
      createdAt: Date.now(),
      duration: 1000,
      particles: this.generateHelmetBreakParticles(x, y),
      color: '#888888',
      size: 30,
      intensity: 2.0
    };

    this.collisionEffects.push(effect);
  }

  /**
   * Generate particles for helmet break effect
   * @param {number} x - Effect center X
   * @param {number} y - Effect center Y
   * @returns {Array} - Array of particles
   */
  generateHelmetBreakParticles(x, y) {
    const particles = [];
    const particleCount = 20;

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5;
      const speed = 4 + Math.random() * 6;
      const size = 2 + Math.random() * 4;
      const life = 800 + Math.random() * 400;

      particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: size,
        life: life,
        maxLife: life,
        color: '#888888' // Gray for helmet fragments
      });
    }

    return particles;
  }

  /**
   * Create bounce effect for player collisions
   * @param {number} x - Effect location X
   * @param {number} y - Effect location Y
   */
  createBounceEffect(x, y) {
    const effectId = `bounce_${Date.now()}_${Math.random()}`;

    const effect = {
      id: effectId,
      x: x,
      y: y,
      type: 'bounce',
      createdAt: Date.now(),
      duration: 600,
      particles: this.generateBounceParticles(x, y),
      color: '#FFFF00',
      size: 20,
      intensity: 1.5
    };

    this.collisionEffects.push(effect);
  }

  /**
   * Generate particles for bounce effect
   * @param {number} x - Effect center X
   * @param {number} y - Effect center Y
   * @returns {Array} - Array of particles
   */
  generateBounceParticles(x, y) {
    const particles = [];
    const particleCount = 12;

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      const speed = 3 + Math.random() * 4;
      const size = 3 + Math.random() * 3;
      const life = 500 + Math.random() * 300;

      particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: size,
        life: life,
        maxLife: life,
        color: '#FFFF00' // Yellow for bounce effect
      });
    }

    return particles;
  }

  /**
   * Check player-to-AI collisions - ORIGINAL ALGORITHM
   * @param {ServerSnake} player - Player to check
   */
  checkPlayerToAICollisions(player) {
    if (player.isInvincible()) return;

    for (const aiSnake of this.aiSnakes) {
      if (!aiSnake.alive || aiSnake.isInvincible()) { // AI can also be invincible (e.g. spawn)
        continue;
      }

      const playerIsRamming = player.hasActivePowerup('battering_ram') && player.boosting;

      // --- BODY COLLISIONS ---
      // Check if player's head hits AI snake's body segments
      for (let i = 1; i < aiSnake.segments.length; i++) {
        const segment = aiSnake.segments[i];
        const distance = Math.hypot(segment.x - player.x, segment.y - player.y);

        if (distance < player.size + aiSnake.size) {
          if (playerIsRamming) {
            this.createCollisionEffect({ type: 'battering_ram_impact', weaponType: 'battering_ram' }, segment.x, segment.y, 'battering_ram_body_hit_ai', aiSnake);
            this.breakOffSegments(aiSnake, i, player.playerId);
            // Rammer (player) survives. AI (victim) might die if segments are gone.
            return; // Collision handled for this AI, player continues.
          } else {
            // Standard head-to-body: player (attacker) dies.
            this.handleSnakeDeath(player, aiSnake.username, 'collision', 'body_hit_ai');
            return; // Player died.
          }
        }
      }
      
      // --- HEAD-TO-HEAD COLLISIONS ---
      const headDistance = Math.hypot(aiSnake.x - player.x, aiSnake.y - player.y);
      if (headDistance < player.size + aiSnake.size) {
        if (playerIsRamming) { // Player ramming AI head
          this.handleBatteringRamHeadCollision(player, aiSnake); // Rammer (player), Victim (AI)
        } else {
          // Standard head-to-head: Player vs AI (player not ramming)
          const playerHasHelmet = player.hasHelmet && player.hasHelmet();
          // AI does not have helmets in current logic.
          if (playerHasHelmet) {
            // Player's helmet vs AI's head. AI dies, Player's helmet takes damage, players bounce.
            this.handleHelmetHeadCollisionWithAI(player, aiSnake, true);
          } else {
            // No helmet for player, AI also has no helmet. Both die.
            this.handleSnakeDeath(player, aiSnake.username, 'collision', 'head_on_ai');
            this.handleSnakeDeath(aiSnake, player.playerId, 'collision', 'head_on_player_victim_ai');
          }
        }
        return; // Head-to-head collision handled for this AI.
      }
    }
  }

  /**
   * Handle helmet head collision with AI (simplified version)
   * @param {ServerSnake} player - Player with helmet
   * @param {ServerSnake} aiSnake - AI snake in collision
   * @param {boolean} playerHasHelmet - Whether player has helmet
   */
  handleHelmetHeadCollisionWithAI(player, aiSnake, playerHasHelmet) {
    // Calculate collision vector (from player to AI)
    const dx = aiSnake.x - player.x;
    const dy = aiSnake.y - player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) return; // Avoid division by zero

    // Normalize collision vector
    const nx = dx / distance;
    const ny = dy / distance;

    // Separate the player and AI
    const separationDistance = (player.size + aiSnake.size) * 1.2;
    const overlap = separationDistance - distance;
    const separationForce = overlap * 0.5;

    player.x -= nx * separationForce;
    player.y -= ny * separationForce;
    aiSnake.x += nx * separationForce;
    aiSnake.y += ny * separationForce;

    // Apply bounce velocities
    const bounceAngle1 = Math.atan2(-ny, -nx) + (Math.random() - 0.5) * 0.3;
    const bounceAngle2 = Math.atan2(ny, nx) + (Math.random() - 0.5) * 0.3;

    // Update movement angles with bounce
    player.angle = bounceAngle1;
    aiSnake.angle = bounceAngle2;

    // Apply temporary speed boost for bounce effect
    const originalPlayerSpeed = player.baseSpeed;
    const originalAISpeed = aiSnake.baseSpeed;

    player.baseSpeed *= 1.5;
    aiSnake.baseSpeed *= 1.5;

    // Reset speed after a short time
    setTimeout(() => {
      player.baseSpeed = originalPlayerSpeed;
      aiSnake.baseSpeed = originalAISpeed;
    }, 500);

    // Handle helmet damage and destruction
    if (playerHasHelmet) {
      const helmetDestroyed = player.damageHelmet(500); // Full helmet damage
      if (helmetDestroyed) {
        console.log(`🪖 ${player.username}'s helmet was destroyed in AI collision!`);
        this.createHelmetBreakEffect(player.x, player.y);
      }
    }

    // Create bounce effect
    this.createBounceEffect((player.x + aiSnake.x) / 2, (player.y + aiSnake.y) / 2);

    console.log(`⚡ ${player.username} bounced off AI ${aiSnake.username} (helmet protection)`);
  }

  /**
   * Check AI-to-player collisions - MISSING COLLISION CHECK
   * @param {ServerSnake} aiSnake - AI snake to check
   */
  checkAIToPlayerCollisions(aiSnake) {
    if (aiSnake.isInvincible()) return;

    for (const player of this.players.values()) {
      if (!player.alive || player.isInvincible()) {
        continue;
      }
      
      // Assume AI can have and use Battering Ram offensively, if logic were implemented
      const aiIsRamming = aiSnake.hasActivePowerup('battering_ram') && aiSnake.boosting;

      // --- BODY COLLISIONS ---
      // Check if AI's head hits player's body segments
      for (let i = 1; i < player.segments.length; i++) {
        const segment = player.segments[i];
        const distance = Math.hypot(segment.x - aiSnake.x, segment.y - aiSnake.y);

        if (distance < aiSnake.size + player.size) {
          if (aiIsRamming) {
             this.createCollisionEffect({ type: 'battering_ram_impact', weaponType: 'battering_ram' }, segment.x, segment.y, 'battering_ram_body_hit_by_ai', player);
             this.breakOffSegments(player, i, aiSnake.username); // AI is the attacker
             // Rammer (AI) survives. Player (victim) might die.
             if (!player.alive) return; // Player died as a result of AI ramming its body.
             // If player survived, this interaction with this AI is resolved for the player in this tick.
             // However, this function is aiSnake's turn. AI continues its checks.
             return; // Collision handled for this player, AI continues its update loop.
          } else {
            // Standard head-to-body: AI (attacker) dies.
            this.handleSnakeDeath(aiSnake, player.playerId, 'collision', 'body_hit_player');
            return; // AI died.
          }
        }
      }
      
      // --- HEAD-TO-HEAD COLLISIONS ---
      const headDistance = Math.hypot(player.x - aiSnake.x, player.y - aiSnake.y);
      if (headDistance < aiSnake.size + player.size) {
        // Check if player is also ramming (for player-initiated ram, it's handled in checkPlayerToAICollisions)
        const playerIsRamming = player.hasActivePowerup('battering_ram') && player.boosting;

        if (aiIsRamming && !playerIsRamming && !player.isInvincible()) { // AI ramming non-ramming Player head
          this.handleBatteringRamHeadCollision(aiSnake, player); // Rammer (AI), Victim (player)
        } else if (playerIsRamming && !aiIsRamming && !aiSnake.isInvincible()) { // Player ramming non-ramming AI head (should be caught by checkPlayerToAICollisions ideally)
           this.handleBatteringRamHeadCollision(player, aiSnake); // Rammer (player), Victim (AI)
        } else if (aiIsRamming && playerIsRamming && !player.isInvincible() && !aiSnake.isInvincible()) { // Both Ramming
            this.createCollisionEffect({ type: 'battering_ram_clash', weaponType: 'battering_ram' }, (player.x + aiSnake.x) / 2, (player.y + aiSnake.y) / 2, 'battering_ram_head_clash_ai_player');
            if (player.hasHelmet()) player.damageHelmet(2000);
            // AI doesn't have helmet, but if it did: if (aiSnake.hasHelmet()) aiSnake.damageHelmet(2000);
            this.createHelmetBreakEffect(player.x,player.y);
            // this.createHelmetBreakEffect(aiSnake.x,aiSnake.y); // if AI had helmet
            this.handleSnakeDeath(player, aiSnake.username, 'battering_ram_clash', 'head_on_ram_clash_player_victim');
            this.handleSnakeDeath(aiSnake, player.playerId, 'battering_ram_clash', 'head_on_ram_clash_ai_victim');
        } else {
          // Standard head-to-head (neither ramming, or one is invincible and ram doesn't apply)
          // AI is attacker here. Player might have helmet.
          const playerHasHelmet = player.hasHelmet && player.hasHelmet();
          if (playerHasHelmet && !aiSnake.isInvincible()) { // AI hits Player's helmet
             // This is like handleHelmetHeadCollisionWithAI, but AI is attacker
             // AI dies, player helmet takes damage and bounces.
             this.handleSnakeDeath(aiSnake, player.playerId, 'collision', 'head_on_player_helmet');
             player.damageHelmet(500); // Player helmet takes damage
             this.createBounceEffect((player.x + aiSnake.x)/2, (player.y + aiSnake.y)/2); // Generic bounce
          } else if (!player.isInvincible() && !aiSnake.isInvincible()){ 
            // No player helmet, or AI is ramming a non-ramming player and no helmet involved
            // or standard head to head where neither is invincible and no helmets on player.
            this.handleSnakeDeath(aiSnake, player.playerId, 'collision', 'head_on_player');
            this.handleSnakeDeath(player, aiSnake.username, 'collision', 'head_on_ai_victim_player');
          }
        }
        return; // Head-to-head collision handled.
      }
    }
  }

  /**
   * Check AI-to-AI collisions - ORIGINAL ALGORITHM
   * @param {ServerSnake} aiSnake - AI snake to check
   */
  checkAIToAICollisions(aiSnake) {
    if (aiSnake.isInvincible()) return;

    for (const otherAI of this.aiSnakes) {
      if (otherAI === aiSnake || !otherAI.alive || otherAI.isInvincible()) {
        continue;
      }

      const aiIsRamming = aiSnake.hasActivePowerup('battering_ram') && aiSnake.boosting;
      const otherAIIsRamming = otherAI.hasActivePowerup('battering_ram') && otherAI.boosting;

      // --- BODY COLLISIONS ---
      // Check if aiSnake's head hits otherAI's body segments
      for (let i = 1; i < otherAI.segments.length; i++) {
        const segment = otherAI.segments[i];
        const distance = Math.hypot(segment.x - aiSnake.x, segment.y - aiSnake.y);

        if (distance < aiSnake.size + otherAI.size) {
          if (aiIsRamming) {
            this.createCollisionEffect({ type: 'battering_ram_impact', weaponType: 'battering_ram' }, segment.x, segment.y, 'battering_ram_body_hit_ai_vs_ai', otherAI);
            this.breakOffSegments(otherAI, i, aiSnake.username); // aiSnake is attacker
            // Rammer (aiSnake) survives. Victim (otherAI) might die.
            return; // Collision handled for this otherAI, aiSnake continues.
          } else {
            // Standard head-to-body: aiSnake (attacker) dies.
            this.handleSnakeDeath(aiSnake, otherAI.username, 'collision', 'body_hit_ai_on_ai');
            return; // aiSnake died.
          }
        }
      }
      
      // Symmetrical check: otherAI's head hits aiSnake's body segments
      if (otherAIIsRamming && !aiSnake.isInvincible()) { // aiSnake must not be invincible
          for (let i = 1; i < aiSnake.segments.length; i++) {
            const segment = aiSnake.segments[i];
            const distance = Math.hypot(segment.x - otherAI.x, segment.y - otherAI.y);
            if (distance < otherAI.size + aiSnake.size) {
                this.createCollisionEffect({ type: 'battering_ram_impact', weaponType: 'battering_ram' }, segment.x, segment.y, 'battering_ram_body_hit_by_ai_on_ai', aiSnake);
                this.breakOffSegments(aiSnake, i, otherAI.username);
                if (!aiSnake.alive) return; // aiSnake (victim) died.
                continue; // Move to next otherAI for aiSnake to check against.
            }
        }
      }

      // --- HEAD-TO-HEAD COLLISIONS ---
      // Only check once per pair to avoid double processing.
      if (aiSnake.username < otherAI.username) { // Use username for unique pairing for AI
        const headDistance = Math.hypot(otherAI.x - aiSnake.x, otherAI.y - aiSnake.y);
        if (headDistance < aiSnake.size + otherAI.size) {
          if (aiIsRamming && !otherAIIsRamming && !otherAI.isInvincible()) {
            this.handleBatteringRamHeadCollision(aiSnake, otherAI); // Rammer, Victim
          } else if (!aiIsRamming && otherAIIsRamming && !aiSnake.isInvincible()) {
            this.handleBatteringRamHeadCollision(otherAI, aiSnake); // Rammer, Victim
          } else if (aiIsRamming && otherAIIsRamming && !aiSnake.isInvincible() && !otherAI.isInvincible()) {
            // Both AI ramming: Clash!
            this.createCollisionEffect({ type: 'battering_ram_clash', weaponType: 'battering_ram' }, (aiSnake.x + otherAI.x) / 2, (aiSnake.y + otherAI.y) / 2, 'battering_ram_head_clash_ai_vs_ai');
            // AI don't have helmets currently, but if they did:
            // if (aiSnake.hasHelmet()) aiSnake.damageHelmet(2000);
            // if (otherAI.hasHelmet()) otherAI.damageHelmet(2000);
            this.handleSnakeDeath(aiSnake, otherAI.username, 'battering_ram_clash', 'head_on_ram_clash_ai_vs_ai');
            this.handleSnakeDeath(otherAI, aiSnake.username, 'battering_ram_clash', 'head_on_ram_clash_ai_vs_ai');
          } else if (!aiSnake.isInvincible() && !otherAI.isInvincible()){
            // Standard head-to-head (neither ramming, or one is invincible)
            // AI don't have helmets, so both die.
            this.handleSnakeDeath(aiSnake, otherAI.username, 'collision', 'head_on_ai_vs_ai');
            this.handleSnakeDeath(otherAI, aiSnake.username, 'collision', 'head_on_ai_vs_ai');
          }
          return; // Head-to-head collision handled for this pair.
        }
      }
    }
  }

  /**
   * Schedule an AI snake to respawn after death
   * @param {ServerSnake} aiSnake - AI snake to respawn
   */
  scheduleAIRespawn(aiSnake) {
    const respawnDelay = 5000; // 5 seconds for AI

    setTimeout(() => {
      // Check if AI is still in the game and still dead
      const currentAI = this.aiSnakes.find(ai => ai.username === aiSnake.username);
      if (currentAI && !currentAI.alive) {
        this.respawnAI(currentAI);
      }
    }, respawnDelay);
  }

  /**
   * Respawn a dead AI snake
   * @param {ServerSnake} aiSnake - AI snake to respawn
   */
  respawnAI(aiSnake) {
    // Reset AI to alive state
    aiSnake.alive = true;

    // Reset position to random location
    aiSnake.x = Math.random() * this.worldWidth;
    aiSnake.y = Math.random() * this.worldHeight;

    // Reset segments to just head
    aiSnake.segments = [{
      x: aiSnake.x,
      y: aiSnake.y,
      health: 100,
      maxHealth: 100
    }];

    // Reset cash to initial wager
    aiSnake.collectedCash = aiSnake.wager;

    // Reset boost
    aiSnake.boost = aiSnake.maxBoost;

    // Activate spawn invincibility
    aiSnake.activateSpawnInvincibility(aiSnake.wager);

    console.log(`🤖 AI ${aiSnake.username} respawned at (${Math.round(aiSnake.x)}, ${Math.round(aiSnake.y)})`);
  }

  /**
   * Maintain world items (respawn when needed) - Dynamic generation around players
   */
  maintainWorldItems() {
    // Dynamic food generation around active areas - balanced for 3x larger world (moderate scaling)
    const targetFoodCount = this.gameMode === 'warfare' ? 2000 : 1000; // Balanced for 6000x6000: warfare=2000, classic=1000

    // Generate food in batches to avoid performance spikes - moderate scaling
    const batchSize = this.gameMode === 'warfare' ? 200 : 100; // Balanced batch sizes: warfare=200, classic=100
    let foodToGenerate = Math.min(batchSize, targetFoodCount - this.food.length);

    for (let i = 0; i < foodToGenerate; i++) {
      // 70% chance to generate near players, 30% chance random
      let x, y;
      if (Math.random() < 0.7 && this.players.size > 0) {
        // Generate near a random player
        const players = Array.from(this.players.values());
        const randomPlayer = players[Math.floor(Math.random() * players.length)];
        const radius = 2000; // Generate within 2000 units of player
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * radius;
        x = randomPlayer.x + Math.cos(angle) * distance;
        y = randomPlayer.y + Math.sin(angle) * distance;

        // Keep within world bounds
        x = Math.max(0, Math.min(this.worldWidth, x));
        y = Math.max(0, Math.min(this.worldHeight, y));
      } else {
        // Random generation
        x = Math.random() * this.worldWidth;
        y = Math.random() * this.worldHeight;
      }

      this.food.push({
        id: `food_${Date.now()}_${Math.random()}`,
        x: x,
        y: y,
        color: `hsl(${Math.random() * 360}, 70%, 60%)`,
        size: 4 + Math.random() * 3,
        value: 1,
        vx: 0, // For vacuum
        vy: 0, // For vacuum
        attractedToPlayerId: null // For vacuum
      });
    }

    // Maintain glow orb count - drastically reduced for warfare mode
    const targetOrbCount = this.gameMode === 'warfare' ? 50 : 600;
    if (this.glowOrbs.length < targetOrbCount) {
      const hue = Math.random() * 360;
      this.glowOrbs.push({
        id: `orb_${Date.now()}_${Math.random()}`,
        x: Math.random() * this.worldWidth,
        y: Math.random() * this.worldHeight,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        hue: hue,
        size: 8 + Math.random() * 4,
        glow: 0,
        value: 5
      });
    }
  }

  /**
   * Maintain warfare items (respawn when needed)
   */
  maintainWarfareItems() {
    // Maintain weapon count - reduced for better performance
    while (this.weapons.filter(w => !w.collected).length < 10) {
      this.weapons.push({
        id: `weapon_${Date.now()}_${Math.random()}`,
        x: Math.random() * this.worldWidth,
        y: Math.random() * this.worldHeight,
        type: this.getRandomWeaponType(),
        collected: false,
        vx: 0, vy: 0, attractedToPlayerId: null, // For vacuum
        animationOffset: Math.random() * Math.PI * 2,
        pulsePhase: Math.random() * Math.PI * 2,
        rotationSpeed: 0.5 + Math.random() * 1.0
      });
    }

    // Maintain ammo count - reduced for better performance
    while (this.ammo.filter(a => !a.collected).length < 25) {
      this.ammo.push({
        id: `ammo_${Date.now()}_${Math.random()}`,
        x: Math.random() * this.worldWidth,
        y: Math.random() * this.worldHeight,
        type: this.getRandomAmmoType(),
        amount: Math.floor(10 + Math.random() * 20),
        collected: false,
        vx: 0, vy: 0, attractedToPlayerId: null, // For vacuum
        bobPhase: Math.random() * Math.PI * 2,
        sparklePhase: Math.random() * Math.PI * 2,
        animationOffset: Math.random() * Math.PI * 2
      });
    }

    // Maintain powerup count - reduced for better performance
    while (this.powerups.filter(p => !p.collected).length < 12) {
      this.powerups.push({
        id: `powerup_${Date.now()}_${Math.random()}`,
        x: Math.random() * this.worldWidth,
        y: Math.random() * this.worldHeight,
        type: this.getRandomPowerupType(),
        collected: false,
        vx: 0, vy: 0, attractedToPlayerId: null, // For vacuum
        bobPhase: Math.random() * Math.PI * 2,
        animationOffset: Math.random() * Math.PI * 2,
        pulsePhase: Math.random() * Math.PI * 2
      });
    }
  }

  /**
   * Update warfare collectibles (apply vacuum effect)
   */
  updateWarfareCollectibles() {
    const playerAttractors = Array.from(this.players.values());

    // Weapons
    this.weapons = this.weapons.filter(weapon => {
      if (weapon.collected) return false;
      this.applyVacuumToItem(weapon, playerAttractors, 'weapon');
      return true;
    });

    // Ammo
    this.ammo = this.ammo.filter(ammo_item => { // Changed 'ammo' to 'ammo_item' to avoid conflict with array name
      if (ammo_item.collected) return false;
      this.applyVacuumToItem(ammo_item, playerAttractors, 'ammo');
      return true;
    });

    // Powerups
    this.powerups = this.powerups.filter(powerup => {
      if (powerup.collected) return false;
      this.applyVacuumToItem(powerup, playerAttractors, 'powerup');
      return true;
    });
  }

  /**
   * Destroy the game instance and clean up resources
   */
  destroy() {
    this.gameRunning = false;
    this.players.clear();
    this.inputRateLimit.clear();
    this.shootRateLimit.clear();
    console.log('🗑️ ServerGame destroyed');
  }

  // NEW FUNCTION for Battering Ram head-on collisions
  handleBatteringRamHeadCollision(rammer, victim) {
    this.createCollisionEffect(
      { type: 'battering_ram_impact', weaponType: 'battering_ram' }, // Simplified projectile-like object for effect
      victim.x, 
      victim.y, 
      'battering_ram_head_hit', 
      victim
    );

    const victimHadHelmet = victim.hasHelmet && victim.hasHelmet();
    if (victimHadHelmet) {
      const helmetDestroyed = victim.damageHelmet(1000); // Battering ram deals massive damage, effectively destroying helmet
      if (helmetDestroyed) {
        this.createHelmetBreakEffect(victim.x, victim.y);
      }
      console.log(`💥 ${rammer.username}'s Battering Ram hit ${victim.username}'s helmet! Helmet health: ${victim.getHelmet() ? victim.getHelmet().currentHelmetHealth : 'N/A'}`);
    }
    
    this.handleSnakeDeath(victim, rammer.playerId || rammer.username, 'battering_ram', 'head_on_ram');
    console.log(`💥 ${rammer.username} (Battering Ram) fatally struck ${victim.username} head-on.`);
  }

  updateFoodItems() {
    const potentialAttractors = [...this.players.values(), ...(this.enableAI ? this.aiSnakes : [])];
    this.food = this.food.filter(foodItem => {
      if (foodItem.collected) return false; // Though food collection is handled in checkFoodCollisions
      this.applyVacuumToItem(foodItem, potentialAttractors, 'food');
      return true; // Keep food for collision check
    });
  }
}

module.exports = ServerGame;
