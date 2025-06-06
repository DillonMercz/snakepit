// Fallback weapon configurations, mirroring ServerGame.js
const WEAPON_CONFIGS_FALLBACK = {
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
  minigun: {
    name: 'Minigun',
    tier: 4,
    damage: 2,
    maxAmmo: 200,
    fireRate: 80,
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

class ServerSnake {
  constructor(x, y, color, isPlayer = false, gameMode = 'classic', gameInstance = null) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.isPlayer = isPlayer;
    this.gameMode = gameMode;
    this.gameInstance = gameInstance; // Reference to game instance for world bounds
    
    // Basic properties - EXACT ORIGINAL VALUES
    this.baseSize = 8;
    this.speed = 5; // EXACT ORIGINAL speed - Increased from 2 to 4 for faster base movement
    this.baseSpeed = 5; // EXACT ORIGINAL base speed - Store base speed for calculations
    this.speedMultiplier = 1.0;
    this.angle = Math.random() * Math.PI * 2;
    this.targetAngle = this.angle;
    this.alive = true;
    this.boost = 100;
    this.maxBoost = 100;
    this.boosting = false;
    this.boostCapRemoved = false; // Track if boost cap has been removed by food

    // Snake segments - Start with just head
    this.segments = [{ x: x, y: y, health: 100, maxHealth: 100 }];

    // Path tracking for continuous movement in classic mode - ORIGINAL MECHANIC
    this.pathHistory = [{ x: x, y: y }]; // Store head's movement path, start with initial position
    this.maxPathLength = 1000; // Increased for larger snakes
    this.pathRecordDistance = 2; // Only record path points when head moves this distance

    // Growth system
    this.growthProgress = 0;
    this.growthRate = 0.02;
    this.growthQueue = 0; // Queue for growth from food consumption (original mechanic)

    // Invincibility system
    this.invincible = false;
    this.invincibilityEndTime = 0;
    this.blinkPhase = 0;

    // Cash/gambling system
    this.wager = 0;
    this.collectedCash = 0;
    this.cashedOut = false;

    // Respawn control (ORIGINAL BEHAVIOR: Manual respawn choice)
    this.wantsRespawn = false; // Player must choose to respawn

    // Weapon system (warfare mode)
    if (gameMode === 'warfare') {
      this.weaponInventory = {
        primaryWeapon: null,
        secondaryWeapon: null,
        sidearm: this.createSidearm(),
        currentSlot: 'sidearm'
      };
      this.currentWeapon = this.weaponInventory.sidearm;
      this.lastWeaponSlot = 'sidearm';

      // Ammo inventory
      this.ammoInventory = {
        light_energy: 0,
        heavy_energy: 0,
        plasma_cells: 0,
        heavy_plasma: 0,
        rockets: 0,
        rail_slugs: 0
      };
    }

    // Powerup system
    this.activePowerups = [];
    this.powerupInventory = [];

    // Player identification
    this.playerId = null;
    this.username = '';
  }

  /**
   * Create default sidearm weapon
   */
  createSidearm() {
    return {
      type: 'sidearm',
      name: 'Snake Fang',
      damage: 1,
      maxAmmo: Infinity,
      currentAmmo: Infinity,
      fireRate: 300,
      projectileSpeed: 12,
      accuracy: 90,
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
  }

  /**
   * Get current size based on cash balance
   */
  get size() {
    const cashMultiplier = Math.sqrt(this.collectedCash / 10);
    return this.baseSize + cashMultiplier * 2;
  }

  /**
   * Get target length based on cash balance
   */
  getTargetLength() {
    const baseSegments = 1;
    const cashPerSegment = 10;
    const bonusSegments = Math.floor(this.collectedCash / cashPerSegment);
    return Math.max(baseSegments, baseSegments + bonusSegments);
  }

  /**
   * Update snake position and state - EXACT ORIGINAL ALGORITHM WITH FRAME-RATE INDEPENDENCE
   */
  update(boosting = false, targetX = null, targetY = null, deltaTime = 16.67) {
    if (!this.alive) return;

    // Update active powerups (duration, effects)
    this.updatePowerups(deltaTime);

    // Normalize delta time to 60 FPS (16.67ms per frame) for consistent movement
    const frameTimeMultiplier = deltaTime / 16.67;

    // Original movement algorithm - smooth mouse following
    if (targetX !== null && targetY !== null) {
      const dx = targetX - this.x;
      const dy = targetY - this.y;
      this.targetAngle = Math.atan2(dy, dx);
    }

    // Smooth angle transition - EXACT ORIGINAL ALGORITHM WITH FRAME-RATE INDEPENDENCE
    let angleDiff = this.targetAngle - this.angle;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

    // EXACT ORIGINAL turning speed with frame-rate independence
    this.angle += angleDiff * 0.1 * frameTimeMultiplier;

    // EXACT ORIGINAL speed calculation
    let currentSpeed = this.baseSpeed * this.speedMultiplier; // Apply food speed multiplier

    // Handle boosting - EXACT ORIGINAL MECHANICS WITH FRAME-RATE INDEPENDENCE
    if (boosting && this.boost > 0) {
      currentSpeed *= 2.5; // EXACT ORIGINAL boost multiplier
      this.boost -= 0.4 * frameTimeMultiplier; // EXACT ORIGINAL boost consumption rate with frame-rate independence

      // If boost reaches 0 and cap was removed, restore the cap
      if (this.boost <= 0 && this.boostCapRemoved) {
        this.boostCapRemoved = false;
      }
    } else if (!boosting) {
      // Natural regeneration only goes up to maxBoost (100%) - EXACT ORIGINAL
      // Only food can push boost beyond 100%
      if (this.boost < this.maxBoost) {
        this.boost += 0.5 * frameTimeMultiplier; // EXACT ORIGINAL boost regeneration rate with frame-rate independence
      }
    }

    // Apply powerup speed multipliers
    currentSpeed *= this.getSpeedMultiplier();

    // Move head with original algorithm - FRAME-RATE INDEPENDENT
    this.x += Math.cos(this.angle) * currentSpeed * frameTimeMultiplier;
    this.y += Math.sin(this.angle) * currentSpeed * frameTimeMultiplier;

    // World boundary bounce mechanics to prevent corner camping
    const worldWidth = this.gameInstance ? this.gameInstance.worldWidth : 40000;
    const worldHeight = this.gameInstance ? this.gameInstance.worldHeight : 40000;

    // Check for boundary collisions and apply bounce
    let bounced = false;
    const bounceForce = 0.8; // Bounce strength (0.8 = 80% velocity reflection)
    const minBounceSpeed = 2; // Minimum speed after bounce

    // Left boundary collision
    if (this.x <= 0) {
      this.x = 0;
      // Reverse horizontal velocity component and apply bounce
      const currentVelX = Math.cos(this.angle) * this.baseSpeed;
      const newVelX = Math.abs(currentVelX) * bounceForce;
      const newVelY = Math.sin(this.angle) * this.baseSpeed;
      this.angle = Math.atan2(newVelY, Math.max(newVelX, minBounceSpeed));
      bounced = true;
    }
    // Right boundary collision
    else if (this.x >= worldWidth) {
      this.x = worldWidth;
      // Reverse horizontal velocity component and apply bounce
      const currentVelX = Math.cos(this.angle) * this.baseSpeed;
      const newVelX = -Math.abs(currentVelX) * bounceForce;
      const newVelY = Math.sin(this.angle) * this.baseSpeed;
      this.angle = Math.atan2(newVelY, Math.min(newVelX, -minBounceSpeed));
      bounced = true;
    }

    // Top boundary collision
    if (this.y <= 0) {
      this.y = 0;
      // Reverse vertical velocity component and apply bounce
      const currentVelY = Math.sin(this.angle) * this.baseSpeed;
      const newVelY = Math.abs(currentVelY) * bounceForce;
      const newVelX = Math.cos(this.angle) * this.baseSpeed;
      this.angle = Math.atan2(Math.max(newVelY, minBounceSpeed), newVelX);
      bounced = true;
    }
    // Bottom boundary collision
    else if (this.y >= worldHeight) {
      this.y = worldHeight;
      // Reverse vertical velocity component and apply bounce
      const currentVelY = Math.sin(this.angle) * this.baseSpeed;
      const newVelY = -Math.abs(currentVelY) * bounceForce;
      const newVelX = Math.cos(this.angle) * this.baseSpeed;
      this.angle = Math.atan2(Math.min(newVelY, -minBounceSpeed), newVelX);
      bounced = true;
    }

    // Add slight random variation to prevent predictable bouncing patterns
    if (bounced) {
      const randomVariation = (Math.random() - 0.5) * 0.2; // ±0.1 radians variation
      this.angle += randomVariation;
    }

    // Update head position
    this.segments[0].x = this.x;
    this.segments[0].y = this.y;

    // Track head's path for continuous movement (classic mode) - EXACT ORIGINAL MECHANIC
    if (this.gameMode === 'classic') {
      // Only record path points when head moves a significant distance
      const lastPoint = this.pathHistory[this.pathHistory.length - 1];
      const distance = Math.hypot(this.x - lastPoint.x, this.y - lastPoint.y);

      if (distance >= this.pathRecordDistance) {
        this.pathHistory.push({ x: this.x, y: this.y });

        // Limit path history length
        if (this.pathHistory.length > this.maxPathLength) {
          this.pathHistory.shift();
        }
      }
    }

    // Handle growth
    this.handleGrowth(frameTimeMultiplier);

    // Update powerups
    this.updatePowerups();

    // Update invincibility
    this.updateInvincibility(frameTimeMultiplier);

    // Update body segments - different behavior for classic vs warfare mode
    if (this.gameMode === 'classic') {
      // Classic mode: Continuous path following
      this.updateSegmentsClassicMode();
    } else {
      // Warfare mode: Fluid/jelly-like movement
      this.updateSegments();
    }
  }

  /**
   * Handle cash-based growth system + food growth queue (original mechanics) - FRAME-RATE INDEPENDENT
   */
  handleGrowth(frameTimeMultiplier = 1) {
    // Process growth queue from food consumption (original mechanic)
    if (this.growthQueue > 0) {
      const growthToProcess = Math.min(this.growthQueue, this.growthRate * 10 * frameTimeMultiplier);
      this.growthQueue -= growthToProcess;
      this.growthProgress += growthToProcess;

      while (this.growthProgress >= 1) {
        this.addSegment();
        this.growthProgress -= 1;
      }
    }

    // Cash-based growth system (original mechanic)
    const targetLength = this.getTargetLength();
    const currentLength = this.segments.length;

    if (targetLength > currentLength) {
      this.growthProgress += this.growthRate * 2 * frameTimeMultiplier;
      if (this.growthProgress >= 1) {
        this.addSegment();
        this.growthProgress = 0;
      }
    } else if (targetLength < currentLength && currentLength > 1) {
      this.shrinkProgress = (this.shrinkProgress || 0) + this.growthRate * frameTimeMultiplier;
      if (this.shrinkProgress >= 1) {
        this.removeSegment();
        this.shrinkProgress = 0;
      }
    }
  }

  /**
   * Add a segment to the snake
   */
  addSegment() {
    if (this.segments.length < 2) {
      const head = this.segments[0];
      this.segments.push({
        x: head.x - Math.cos(this.angle) * this.getSegmentDistance(),
        y: head.y - Math.sin(this.angle) * this.getSegmentDistance(),
        health: 100,
        maxHealth: 100
      });
    } else {
      const head = this.segments[0];
      const firstBody = this.segments[1];
      const newSegment = {
        x: (head.x + firstBody.x) / 2,
        y: (head.y + firstBody.y) / 2,
        health: 100,
        maxHealth: 100
      };
      this.segments.splice(1, 0, newSegment);
    }
  }

  /**
   * Remove a segment from the snake
   */
  removeSegment() {
    if (this.segments.length > 1) {
      this.segments.pop();
    }
  }

  /**
   * Update body segments for classic mode - EXACT ORIGINAL ALGORITHM WITH CONTINUOUS MOVEMENT
   */
  updateSegmentsClassicMode() {
    // Classic mode: Body segments continuously follow the head's path - NEVER STOP MOVING
    if (this.pathHistory.length < 2 || this.segments.length < 2) return;

    // Calculate total path length for better distribution
    let totalPathLength = 0;
    for (let i = 1; i < this.pathHistory.length; i++) {
      const current = this.pathHistory[i];
      const previous = this.pathHistory[i - 1];
      totalPathLength += Math.hypot(current.x - previous.x, current.y - previous.y);
    }

    // ALWAYS update segments, even if path is short - CONTINUOUS MOVEMENT
    for (let i = 1; i < this.segments.length; i++) {
      // Calculate how far back in the path this segment should be - EXACT ORIGINAL
      const segmentDelay = i * this.getSegmentDistance();

      // Find the appropriate position in the path history
      let accumulatedDistance = 0;
      let targetPoint = null;

      // Start from the most recent point and work backwards - EXACT ORIGINAL
      for (let j = this.pathHistory.length - 1; j > 0; j--) {
        const current = this.pathHistory[j];
        const previous = this.pathHistory[j - 1];
        const stepDistance = Math.hypot(current.x - previous.x, current.y - previous.y);

        if (accumulatedDistance + stepDistance >= segmentDelay) {
          // Interpolate between these two points - EXACT ORIGINAL
          const remainingDistance = segmentDelay - accumulatedDistance;
          const ratio = stepDistance > 0 ? remainingDistance / stepDistance : 0;

          targetPoint = {
            x: current.x - (current.x - previous.x) * ratio,
            y: current.y - (current.y - previous.y) * ratio
          };
          break;
        }

        accumulatedDistance += stepDistance;
      }

      // ALWAYS move segments - CONTINUOUS MOVEMENT GUARANTEE
      if (targetPoint) {
        // Direct following for smooth continuous movement - EXACT ORIGINAL
        const smoothing = 0.8; // Higher value = more direct following - EXACT ORIGINAL
        this.segments[i].x += (targetPoint.x - this.segments[i].x) * smoothing;
        this.segments[i].y += (targetPoint.y - this.segments[i].y) * smoothing;
      } else {
        // Fallback: follow previous segment directly for continuous movement
        const prevSegment = this.segments[i - 1];
        const dx = prevSegment.x - this.segments[i].x;
        const dy = prevSegment.y - this.segments[i].y;
        const distance = Math.hypot(dx, dy);

        if (distance > this.getSegmentDistance()) {
          // Move toward previous segment to maintain distance
          const angle = Math.atan2(dy, dx);
          const targetX = prevSegment.x - Math.cos(angle) * this.getSegmentDistance();
          const targetY = prevSegment.y - Math.sin(angle) * this.getSegmentDistance();

          // Smooth movement to ensure continuous motion
          const smoothing = 0.6; // Ensure segments keep moving
          this.segments[i].x += (targetX - this.segments[i].x) * smoothing;
          this.segments[i].y += (targetY - this.segments[i].y) * smoothing;
        }
      }
    }
  }

  /**
   * Update body segments for warfare mode - EXACT ORIGINAL ALGORITHM
   */
  updateSegments() {
    // Warfare mode: Fluid/jelly-like movement (original behavior) - EXACT ORIGINAL
    for (let i = 1; i < this.segments.length; i++) {
      const prev = this.segments[i - 1];
      const current = this.segments[i];

      const dx = prev.x - current.x;
      const dy = prev.y - current.y;
      const distance = Math.hypot(dx, dy);

      if (distance > this.getSegmentDistance()) {
        // Fluid movement - segments follow with slight delay and smoothing - EXACT ORIGINAL
        const angle = Math.atan2(dy, dx);
        const targetX = prev.x - Math.cos(angle) * this.getSegmentDistance();
        const targetY = prev.y - Math.sin(angle) * this.getSegmentDistance();

        // Smooth interpolation for jelly-like effect - EXACT ORIGINAL
        const smoothing = 0.3; // Adjust for more/less fluid movement - EXACT ORIGINAL
        current.x += (targetX - current.x) * smoothing;
        current.y += (targetY - current.y) * smoothing;
      }
    }
  }

  /**
   * Get segment distance - EXACT ORIGINAL
   */
  getSegmentDistance() {
    return this.size * 1.2; // EXACT ORIGINAL segmentDistance calculation
  }

  /**
   * Get segmentDistance property for compatibility - EXACT ORIGINAL
   */
  get segmentDistance() {
    return this.size * 1.2; // EXACT ORIGINAL
  }

  /**
   * Activate spawn invincibility
   */
  activateSpawnInvincibility(cashBalance) {
    const baseDuration = 1000;
    const perDollarDuration = 20;
    const maxDuration = 3000;
    const duration = Math.min(baseDuration + (cashBalance * perDollarDuration), maxDuration);

    this.invincible = true;
    this.invincibilityEndTime = Date.now() + duration;
    this.blinkPhase = 0;
  }

  /**
   * Update invincibility status - FRAME-RATE INDEPENDENT
   */
  updateInvincibility(frameTimeMultiplier = 1) {
    if (this.invincible) {
      const now = Date.now();
      if (now >= this.invincibilityEndTime) {
        this.invincible = false;
      } else {
        this.blinkPhase += 0.3 * frameTimeMultiplier;
      }
    }
  }

  /**
   * Check if snake is invincible
   */
  isInvincible() {
    return this.invincible && Date.now() < this.invincibilityEndTime;
  }

  /**
   * Add cash to the snake (only from coins, not food)
   */
  addCash(amount) {
    this.collectedCash += amount;
  }

  /**
   * Add growth from food consumption (original mechanic)
   */
  addGrowth(amount) {
    this.growthQueue = (this.growthQueue || 0) + amount;
  }

  /**
   * Add speed boost from food consumption (original mechanic)
   */
  addSpeedBoost(percentage) {
    this.speedMultiplier = (this.speedMultiplier || 1.0) + (percentage / 100);
  }

  /**
   * Cash out - EXACT original mechanic from single player
   */
  cashOut() {
    if (!this.alive || this.cashedOut || this.collectedCash <= this.wager) {
      return false; // Can't cash out if dead, already cashed out, or no profit
    }

    // Calculate profit (total cash minus original wager)
    const profit = this.collectedCash - this.wager;
    const totalCashed = this.collectedCash;

    // Mark as cashed out
    this.cashedOut = true;

    // ORIGINAL BEHAVIOR: Kill the player (don't keep alive like before)
    this.alive = false;

    // Store the cashout amount for final stats
    this.cashoutBalance = totalCashed;

    // Removed spammy log

    return {
      success: true,
      profit: profit,
      totalCashed: totalCashed
    };
  }

  /**
   * Take damage
   */
  takeDamage(damage) {
    if (this.isInvincible()) return;

    // Apply powerup damage reduction
    const actualDamage = damage * (1 - this.getDamageReduction());
    
    // For now, any damage kills the snake
    // In a more complex system, you could implement health per segment
    this.alive = false;
  }

  /**
   * Get current speed multiplier from active powerups (e.g., speed_boost)
   * This will be additive with the base food speedMultiplier.
   */
  getSpeedMultiplier() {
    let totalSpeedBoostFactor = 1.0; // Start with no boost
    const now = Date.now();
    this.activePowerups.forEach(powerup => {
      if (powerup.expirationTime && now < powerup.expirationTime) {
        if (powerup.speedBoost) { // Assuming powerup.speedBoost is a multiplier like 1.4 for 40%
          totalSpeedBoostFactor += (powerup.speedBoost); // Additive stacking of the boost amount itself
        }
      }
    });
    return totalSpeedBoostFactor;
  }

  /**
   * Get damage reduction from defensive powerups - HIGHEST WINS
   */
  getDamageReduction() {
    let maxDamageReduction = 0;
    const now = Date.now();

    this.activePowerups.forEach(powerup => {
      // Ensure powerup is active by checking expirationTime
      if (powerup.expirationTime && now < powerup.expirationTime) {
        const reduction = powerup.damageReduction || 0;
        if (reduction > maxDamageReduction) {
          maxDamageReduction = reduction;
        }
      }
    });
    return maxDamageReduction; // Capped at source (e.g. forcefield is 0.8)
  }

  /**
   * Update active powerups
   */
  updatePowerups(deltaTime = 16.67) {
    const currentTime = Date.now();
    this.activePowerups = this.activePowerups.filter(powerup => {
      return currentTime < powerup.expirationTime;
    });
  }

  /**
   * Check if snake has an active forcefield - ORIGINAL SYSTEM
   */
  hasForcefield() {
    const now = Date.now();
    return this.activePowerups.some(powerup => 
      powerup.type === 'forcefield' && 
      powerup.expirationTime && 
      now < powerup.expirationTime
    );
  }

  /**
   * Check if snake has active helmet powerup
   */
  hasHelmet() {
    return this.activePowerups.some(powerup => powerup.type === 'helmet');
  }

  /**
   * Get helmet powerup for health tracking
   */
  getHelmet() {
    return this.activePowerups.find(powerup => powerup.type === 'helmet');
  }

  /**
   * Damage helmet and check if it breaks
   * @param {number} damage - Damage to apply to helmet
   * @returns {boolean} - True if helmet was destroyed
   */
  damageHelmet(damage) {
    const helmet = this.getHelmet();
    if (helmet && helmet.currentHelmetHealth > 0) {
      helmet.currentHelmetHealth -= damage;

      if (helmet.currentHelmetHealth <= 0) {
        // Helmet is destroyed, remove it
        this.activePowerups = this.activePowerups.filter(p => p.type !== 'helmet');
        return true; // Helmet was destroyed
      }
      return false; // Helmet absorbed damage but still intact
    }
    return null; // No helmet equipped
  }

  /**
   * Add weapon to inventory - ORIGINAL SYSTEM FROM GAMELOGIC.JS
   */
  addWeaponToInventory(weapon) {
    // Get the base weapon configurations
    const configsFromInstance = this.gameInstance ? this.gameInstance.WEAPON_CONFIGS : undefined;
    const WEAPON_CONFIGS_REF = configsFromInstance || WEAPON_CONFIGS_FALLBACK;

    // Get the specific configuration for the picked-up weapon type
    const weaponConfig = WEAPON_CONFIGS_REF[weapon.type] || WEAPON_CONFIGS_REF.sidearm; // Fallback to sidearm if type is unknown

    // Create weapon object with proper configuration
    const weaponObj = {
      type: weapon.type,
      name: weaponConfig.name,
      damage: weaponConfig.damage,
      maxAmmo: weaponConfig.maxAmmo,
      currentAmmo: weaponConfig.maxAmmo, // Start with full ammo
      fireRate: weaponConfig.fireRate,
      projectileSpeed: weaponConfig.projectileSpeed,
      accuracy: weaponConfig.accuracy,
      // firingMode: weaponConfig.firingMode, // Not strictly needed on the instance if ServerGame checks global config
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

    // Add to appropriate slot - ORIGINAL LOGIC
    if (!this.weaponInventory.primaryWeapon) {
      this.weaponInventory.primaryWeapon = weaponObj;
      this.switchToWeapon('primaryWeapon');
      console.log(`${this.username} picked up ${weaponObj.name} (primary slot)`);
    } else if (!this.weaponInventory.secondaryWeapon) {
      this.weaponInventory.secondaryWeapon = weaponObj;
      console.log(`${this.username} picked up ${weaponObj.name} (secondary slot)`);
    } else {
      // Replace current weapon if it's not sidearm
      if (this.weaponInventory.currentSlot !== 'sidearm') {
        this.weaponInventory[this.weaponInventory.currentSlot] = weaponObj;
        this.currentWeapon = weaponObj;
        console.log(`${this.username} replaced weapon with ${weaponObj.name}`);
      }
    }
  }

  /**
   * Switch to weapon slot
   */
  switchToWeapon(slot) {
    const weapon = this.weaponInventory[slot];
    if (weapon && (weapon.currentAmmo > 0 || weapon.maxAmmo === Infinity)) {
      this.lastWeaponSlot = this.weaponInventory.currentSlot;
      this.weaponInventory.currentSlot = slot;
      this.currentWeapon = weapon;
    }
  }

  /**
   * Shoot projectile (warfare mode)
   * @param {number} targetX - Target X coordinate
   * @param {number} targetY - Target Y coordinate
   * @returns {Object|null} - Projectile object or null if can't shoot
   */
  shoot(targetX, targetY) {
    if (!this.currentWeapon || !this.currentWeapon.canShoot()) {
      return null;
    }

    // Consume ammo or check sidearm
    if (this.currentWeapon.type !== 'sidearm') {
      if (this.currentWeapon.currentAmmo > 0) {
        this.currentWeapon.currentAmmo--;
      } else {
        // Auto-switch to sidearm if out of ammo (and not already sidearm)
        this.switchToWeapon('sidearm');
        if (!this.currentWeapon.canShoot()) return null; // Sidearm might also be on cooldown
      }
    }
    this.currentWeapon.shoot(); // Mark lastShotTime

    // Get weapon configuration
    const configsFromInstance = this.gameInstance ? this.gameInstance.WEAPON_CONFIGS : undefined;
    const WEAPON_CONFIGS_REF = configsFromInstance || WEAPON_CONFIGS_FALLBACK;
    const weaponConfig = WEAPON_CONFIGS_REF[this.currentWeapon.type] || WEAPON_CONFIGS_REF.sidearm;

    // Calculate projectile direction with accuracy
    const baseAngle = Math.atan2(targetY - this.y, targetX - this.x);
    const accuracy = weaponConfig.accuracy || 90;
    const spread = (100 - accuracy) / 100 * (Math.PI / 18); // Max 10 degree spread (PI/18 radians)
    const finalAngle = baseAngle + (Math.random() - 0.5) * spread;

    // Apply damage amplification
    const damageMultiplier = this.getDamageMultiplier(); // Changed from getDamageAmplifier for consistency
    const finalDamage = (weaponConfig.damage || 1) * damageMultiplier;

    const projectile = {
      id: `proj_${this.playerId || 'ai'}_${Date.now()}`,
      ownerId: this.playerId || (this.isAI ? this.username : 'ai_unknown'),
      ownerRef: this, // Direct reference to the snake instance
      x: this.x + Math.cos(this.angle) * (this.size + 5), // Start projectile slightly ahead
      y: this.y + Math.sin(this.angle) * (this.size + 5),
      vx: Math.cos(finalAngle) * (weaponConfig.projectileSpeed || 10),
      vy: Math.sin(finalAngle) * (weaponConfig.projectileSpeed || 10),
      damage: finalDamage, // Use amplified damage
      size: weaponConfig.projectileSize || 3,
      color: weaponConfig.color || '#FFFF00',
      type: this.currentWeapon.type,
      weaponType: this.currentWeapon.type, // for effects
      createdAt: Date.now(),
      trail: [],
      animationOffset: Math.random() * Math.PI * 2,
      isTracer: weaponConfig.tracerRounds || false,
      angle: finalAngle // Store the final angle for rendering if needed
    };
    return projectile;
  }

  /**
   * Add ammo to inventory
   */
  addAmmo(type, amount) {
    if (this.ammoInventory[type] !== undefined) {
      const roundedAmount = Math.floor(amount);
      this.ammoInventory[type] += roundedAmount;
    }
  }

  /**
   * Add powerup to inventory and activate - ORIGINAL SYSTEM FROM GAMELOGIC.JS
   */
  addPowerup(powerup) {
    // Add powerup to inventory for later activation (like original game)
    this.powerupInventory.push({
      type: powerup.type,
      name: powerup.name || powerup.type,
      duration: powerup.duration || 30000,
      damageReduction: powerup.damageReduction || 0,
      headProtection: powerup.headProtection || 0,
      boostDamage: powerup.boostDamage || 0,
      speedBoost: powerup.speedBoost || 0,
      helmetHealth: powerup.helmetHealth || 0,
      description: powerup.description || 'Unknown powerup'
    });

    // For defensive powerups, activate immediately (like original game)
    if (powerup.type === 'helmet' || powerup.type === 'armor_plating' || powerup.type === 'shield_generator') {
      this.activatePowerup(powerup.type);
    }

    console.log(`${this.username} collected ${powerup.type} powerup`);
  }

  /**
   * Activate a powerup from inventory - ORIGINAL SYSTEM
   */
  activatePowerup(powerupType) {
    // Find powerup in inventory
    const powerupIndex = this.powerupInventory.findIndex(p => p.type === powerupType);
    if (powerupIndex === -1) return false;

    const powerup = this.powerupInventory[powerupIndex];

    // Remove from inventory
    this.powerupInventory.splice(powerupIndex, 1);

    // Add to active powerups with expiration time
    const activePowerup = {
      ...powerup,
      startTime: Date.now(),
      expirationTime: Date.now() + powerup.duration,
      currentHelmetHealth: powerup.helmetHealth || 0 // Track current helmet health
    };

    // Remove any existing powerup of the same type
    this.activePowerups = this.activePowerups.filter(p => p.type !== powerupType);

    // Add new powerup
    this.activePowerups.push(activePowerup);

    console.log(`${this.username} activated ${powerupType} powerup`);
    return true;
  }

  /**
   * Get head protection from powerups - HIGHEST WINS
   */
  getHeadProtection() {
    let maxHeadProtection = 0;
    const now = Date.now();
    this.activePowerups.forEach(powerup => {
      if (powerup.expirationTime && now < powerup.expirationTime) {
        const protection = powerup.headProtection || 0;
        if (protection > maxHeadProtection) {
          maxHeadProtection = protection;
        }
      }
    });
    return maxHeadProtection; // Capped at source (e.g. forcefield is 0.9)
  }

  /**
   * Get boost damage multiplier from offensive powerups (e.g., battering_ram)
   */
  getBoostDamageMultiplier() {
    let multiplier = 1.0;
    for (const powerup of this.activePowerups) {
      if (powerup.boostDamage) {
        multiplier = Math.max(multiplier, powerup.boostDamage);
      }
    }
    return multiplier;
  }

  /**
   * Get damage multiplier from offensive powerups (e.g., damage_amplifier)
   */
  getDamageMultiplier() { // Renamed from getDamageAmplifier
    let multiplier = 1.0;
    const now = Date.now();
    this.activePowerups.forEach(powerup => {
      if (powerup.expirationTime && now < powerup.expirationTime) {
        if (powerup.type === 'damage_amplifier' && powerup.damageMultiplier) {
          multiplier *= powerup.damageMultiplier; // Stack multiplicatively if multiple somehow active
        }
      }
    });
    return multiplier;
  }

  /**
   * Check if player has active powerup of specific type
   */
  hasActivePowerup(powerupType) {
    return this.activePowerups.some(powerup => powerup.type === powerupType);
  }

  /**
   * Add speed boost - ORIGINAL MECHANIC
   */
  addSpeedBoost(amount) {
    // Speed boosts are cumulative but capped
    this.speedBoost = Math.min((this.speedBoost || 0) + amount, 50); // Cap at 50%
  }

  /**
   * Reset weapon inventory to sidearm only (for respawn)
   */
  resetWeaponInventory() {
    if (this.weaponInventory) {
      this.weaponInventory = {
        primaryWeapon: null,
        secondaryWeapon: null,
        sidearm: this.createSidearm(),
        currentSlot: 'sidearm'
      };
      this.currentWeapon = this.weaponInventory.sidearm;
      this.lastWeaponSlot = 'sidearm';
    }
  }

  /**
   * Reset ammo inventory to empty (for respawn)
   */
  resetAmmoInventory() {
    if (this.ammoInventory) {
      this.ammoInventory = {
        light_energy: 0,
        heavy_energy: 0,
        plasma_cells: 0,
        heavy_plasma: 0,
        rockets: 0,
        rail_slugs: 0
      };
    }
  }

  /**
   * Reset powerup inventory and active powerups (for respawn)
   */
  resetPowerupInventory() {
    this.activePowerups = [];
    this.powerupInventory = [];
  }

  /**
   * Reset snake state after cashout
   */
  resetAfterCashout() {
    // Reset cashout-related state
    this.cashedOut = false;
    this.cashoutBalance = 0;
    
    // Reset cash to initial wager
    this.collectedCash = this.wager;
    
    // Reset other gameplay state
    this.alive = true;
    this.invincible = false;
    this.invincibilityEndTime = 0;
    this.blinkPhase = 0;
    
    // Reset segments to initial state
    this.segments = [{
      x: this.x,
      y: this.y,
      health: 100,
      maxHealth: 100
    }];
    
    // Reset growth state
    this.growthQueue = 0;
    
    // Activate spawn protection
    this.activateSpawnInvincibility(this.wager);
  }
}

module.exports = ServerSnake;
