// Helper functions (copied from src/gameLogic.js)
function darkenColor(color, amount) {
    // Simple color darkening function
    if (color.startsWith('#')) {
        const num = parseInt(color.slice(1), 16);
        const r = Math.max(0, Math.floor((num >> 16) * (1 - amount)));
        const g = Math.max(0, Math.floor(((num >> 8) & 0x00FF) * (1 - amount)));
        const b = Math.max(0, Math.floor((num & 0x0000FF) * (1 - amount)));
        return `rgb(${r}, ${g}, ${b})`;
    }
    return color; // Return original if not hex
}

function addAlpha(color, alpha) {
    // Add alpha channel to color
    if (color.startsWith('hsl(')) {
        return color.replace('hsl(', 'hsla(').replace(')', `, ${alpha})`);
    } else if (color.startsWith('#')) {
        const num = parseInt(color.slice(1), 16);
        const r = (num >> 16) & 255;
        const g = (num >> 8) & 255;
        const b = num & 255;
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    } else if (color.startsWith('rgb(')) {
        return color.replace('rgb(', 'rgba(').replace(')', `, ${alpha})`);
    }
    return color;
}


// Weapon configuration data (minimal version for sidearm)
const WEAPON_CONFIGS = {
    sidearm: {
        name: 'Snake Fang',
        tier: 0,
        damage: 1,
        maxAmmo: Infinity,
        fireRate: 300,
        projectileSpeed: 12,
        accuracy: 90,
        rarity: 'default',
        color: '#888888',
        secondaryColor: '#AAAAAA',
        glowColor: '#CCCCCC',
        accentColor: '#EEEEEE',
        ammoTypes: [],
        description: 'Basic sidearm with unlimited ammo'
    },
    // Add other weapon configs here if needed by Snake class directly,
    // but for now, sidearm is the primary concern for Snake constructor.
};

// Minimal Weapon class (copied and simplified from src/gameLogic.js)
class Weapon {
    constructor(x, y, type = null) {
        this.x = x;
        this.y = y;
        this.size = 25; // Example size, might not be used on server
        this.collected = false;
        this.type = type || 'sidearm'; // Default to sidearm if type is null

        this.config = WEAPON_CONFIGS[this.type] || WEAPON_CONFIGS.sidearm;
        this.setWeaponProperties();
        this.currentAmmo = this.maxAmmo;
        this.lastShotTime = 0;

        this.burstState = {
            inBurst: false,
            shotsInBurst: 0,
            lastBurstShotTime: 0,
            burstCooldownStart: 0
        };
    }

    setWeaponProperties() {
        this.name = this.config.name;
        this.tier = this.config.tier;
        this.damage = this.config.damage;
        this.maxAmmo = this.config.maxAmmo;
        this.fireRate = this.config.fireRate;
        this.projectileSpeed = this.config.projectileSpeed;
        this.accuracy = this.config.accuracy;
        this.rarity = this.config.rarity;
        this.color = this.config.color;
        this.secondaryColor = this.config.secondaryColor;
        this.glowColor = this.config.glowColor;
        this.accentColor = this.config.accentColor;
        this.ammoTypes = this.config.ammoTypes;
        this.description = this.config.description;
    }

    canShoot() {
        if (this.currentAmmo <= 0) return false;
        const now = Date.now(); // Assuming Date.now() is available
        const firingMode = this.config.firingMode || 'semi_auto';

        switch (firingMode) {
            case 'tri_burst_sequential':
                if (this.burstState.inBurst) {
                    return now - this.burstState.lastBurstShotTime >= (this.config.burstDelay || 100);
                } else {
                    return now - this.burstState.burstCooldownStart >= (this.config.burstCooldown || 800);
                }
            case 'tri_burst_spread':
                return now - this.lastShotTime >= this.fireRate;
            case 'full_auto':
            case 'semi_auto':
            default:
                return now - this.lastShotTime >= this.fireRate;
        }
    }

    shoot() {
        if (this.canShoot()) {
            this.currentAmmo--;
            this.lastShotTime = Date.now();
            return true;
        }
        return false;
    }

    // Other methods like reload, getAmmoPercentage, draw are not essential for server-side Snake core logic
}


class Snake {
    constructor(x, y, color, isPlayer = false, id = null, username = 'Snake', gameInstance = null) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.isPlayer = isPlayer;
        this.id = id;
        this.username = username;
        this.gameInstance = gameInstance || { gameMode: 'classic', worldWidth: 4000, worldHeight: 4000 }; // Mock gameInstance

        this.baseSize = 8;
        this.speed = 4; 
        this.baseSpeed = 4; 
        this.speedMultiplier = 1.0; 
        this.angle = Math.random() * Math.PI * 2;
        this.targetAngle = this.angle;
        this.alive = true;
        this.boost = 100;
        this.maxBoost = 100;
        this.boostCapRemoved = false; 

        this.segments = [{ x: x, y: y, health: 100, maxHealth: 100 }];
        this.pathHistory = [{ x: x, y: y }]; 
        this.maxPathLength = 1000; 
        this.pathRecordDistance = 2; 

        this.growthProgress = 0; 
        this.growthRate = 0.02; 

        this.invincible = false;
        this.invincibilityEndTime = 0;
        this.blinkPhase = 0; 
        this.shrinkProgress = 0; 
        this.growthQueue = 0; 

        // Score and Cash - server will manage this more directly based on game rules
        this.score = 0;
        this.cashBalance = 0; // Will be set from server based on wager for PvP
        this.wager = 0;


        // AI Weapon System (for non-player snakes)
        this.weaponInventory = {
            primaryWeapon: null,
            secondaryWeapon: null,
            sidearm: new Weapon(0, 0, 'sidearm'), // Sidearm is part of Snake
            currentSlot: 'sidearm'
        };
        this.currentWeapon = this.weaponInventory.sidearm;
        this.lastWeaponSlot = 'sidearm';

        this.ammoInventory = {
            light_energy: 0, heavy_energy: 0, plasma_cells: 0, heavy_plasma: 0, rockets: 0, rail_slugs: 0
        };
        
        if (!isPlayer) {
            this.aiPersonality = this.generateAIPersonality();
            this.lastShotTime = 0;
            this.targetEnemy = null;
            this.combatState = 'hunting'; 
            this.lastStateChange = Date.now();
            this.threatLevel = 0;
            this.aggressionLevel = Math.random() * 0.5 + 0.3; 
            this.accuracy = 0.6 + Math.random() * 0.3; 
            this.reactionTime = 200 + Math.random() * 300; 
            this.lastDecisionTime = 0;
            this.patrolTarget = { x: x, y: y };
            this.lastKnownEnemyPos = null;
            this.weaponPreference = this.generateWeaponPreference();
        }

        this.activePowerups = []; 
        this.powerupInventory = []; 
        this.cashValue = 0; 
    }

    get size() {
        const balance = this.isPlayer ? 
            (this.gameInstance ? (this.gameInstance.getPlayerCashBalance ? this.gameInstance.getPlayerCashBalance(this) : this.cashBalance) : this.cashBalance) : 
            (this.cashBalance || 50); // Use own cashBalance for AI or if gameInstance method not available
        const cashMultiplier = Math.sqrt(Math.max(0,balance) / 10); 
        return this.baseSize + cashMultiplier * 2; 
    }
    
    getGame() {
        return this.gameInstance;
    }

    get length() {
        return this.segments.length;
    }

    getTargetLength() {
        const balance = this.isPlayer ? 
        (this.gameInstance ? (this.gameInstance.getPlayerCashBalance ? this.gameInstance.getPlayerCashBalance(this) : this.cashBalance) : this.cashBalance) : 
        (this.cashBalance || 50);
        const baseSegments = 1;
        const cashPerSegment = 10;
        const bonusSegments = Math.floor(Math.max(0,balance) / cashPerSegment);
        const targetLength = baseSegments + bonusSegments;
        return Math.max(baseSegments, targetLength);
    }

    get segmentDistance() {
        return this.size * 1.2;
    }

    update(boosting = false) {
        if (!this.alive) return;

        let angleDiff = this.targetAngle - this.angle;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        this.angle += angleDiff * 0.1;

        let currentSpeed = this.baseSpeed * this.speedMultiplier;
        if (boosting && this.boost > 0) {
            currentSpeed *= 2.5; 
            this.boost -= 0.4; 
            if (this.boost <= 0 && this.boostCapRemoved) {
                this.boostCapRemoved = false;
            }
        } else if (!boosting) {
            if (this.boost < this.maxBoost) {
                this.boost += 0.5;
            }
        }

        currentSpeed *= this.getSpeedMultiplier(); // For powerups

        this.x += Math.cos(this.angle) * currentSpeed;
        this.y += Math.sin(this.angle) * currentSpeed;

        const worldWidth = this.gameInstance ? this.gameInstance.worldWidth : 4000;
        const worldHeight = this.gameInstance ? this.gameInstance.worldHeight : 4000;

        this.x = Math.max(this.size, Math.min(worldWidth - this.size, this.x));
        this.y = Math.max(this.size, Math.min(worldHeight - this.size, this.y));

        this.segments[0].x = this.x;
        this.segments[0].y = this.y;

        const gameMode = this.gameInstance ? this.gameInstance.gameMode : 'classic';

        if (gameMode === 'classic') {
            const lastPoint = this.pathHistory[this.pathHistory.length - 1];
            const distance = Math.hypot(this.x - lastPoint.x, this.y - lastPoint.y);
            if (distance >= this.pathRecordDistance) {
                this.pathHistory.push({ x: this.x, y: this.y });
                if (this.pathHistory.length > this.maxPathLength) {
                    this.pathHistory.shift();
                }
            }
        }

        this.handleGrowth();
        this.updatePowerups(); // Assumes Powerup class/logic is not part of this Snake port for now
        this.updateInvincibility();

        if (gameMode === 'classic') {
            this.updateSegmentsClassicMode();
        } else { // warfare, classic_pvp, warfare_pvp
            this.updateSegmentsWarfareMode();
        }
    }

    updateSegmentsClassicMode() {
        if (this.pathHistory.length < 2 || this.segments.length < 2) return;
        let totalPathLength = 0;
        for (let i = 1; i < this.pathHistory.length; i++) {
            totalPathLength += Math.hypot(this.pathHistory[i].x - this.pathHistory[i-1].x, this.pathHistory[i].y - this.pathHistory[i-1].y);
        }
        const requiredPathLength = (this.segments.length - 1) * this.segmentDistance;
        if (totalPathLength < requiredPathLength) {
            this.updateSegmentsWarfareMode(); 
            return;
        }
        for (let i = 1; i < this.segments.length; i++) {
            const segmentDelay = i * this.segmentDistance;
            let accumulatedDistance = 0;
            let targetPoint = null;
            for (let j = this.pathHistory.length - 1; j > 0; j--) {
                const current = this.pathHistory[j];
                const previous = this.pathHistory[j - 1];
                const stepDistance = Math.hypot(current.x - previous.x, current.y - previous.y);
                if (accumulatedDistance + stepDistance >= segmentDelay) {
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
            if (targetPoint) {
                this.segments[i].x += (targetPoint.x - this.segments[i].x) * 0.8;
                this.segments[i].y += (targetPoint.y - this.segments[i].y) * 0.8;
            } else {
                const oldestPoint = this.pathHistory[0];
                if (oldestPoint) {
                    this.segments[i].x += (oldestPoint.x - this.segments[i].x) * 0.3;
                    this.segments[i].y += (oldestPoint.y - this.segments[i].y) * 0.3;
                }
            }
        }
    }

    updateSegmentsWarfareMode() {
        for (let i = 1; i < this.segments.length; i++) {
            const prev = this.segments[i - 1];
            const current = this.segments[i];
            const dx = prev.x - current.x;
            const dy = prev.y - current.y;
            const distance = Math.hypot(dx, dy);
            if (distance > this.segmentDistance) {
                const angle = Math.atan2(dy, dx);
                const targetX = prev.x - Math.cos(angle) * this.segmentDistance;
                const targetY = prev.y - Math.sin(angle) * this.segmentDistance;
                current.x += (targetX - current.x) * 0.3;
                current.y += (targetY - current.y) * 0.3;
            }
        }
    }

    activateSpawnInvincibility(balance) { // Renamed from cashBalance to balance
        const baseDuration = 1000; 
        const perDollarDuration = 20; 
        const maxDuration = 3000; 
        const duration = Math.min(baseDuration + (balance * perDollarDuration), maxDuration);
        this.invincible = true;
        this.invincibilityEndTime = Date.now() + duration;
        this.blinkPhase = 0;
    }

    updateInvincibility() {
        if (this.invincible) {
            if (Date.now() >= this.invincibilityEndTime) {
                this.invincible = false;
            } else {
                this.blinkPhase += 0.3; 
            }
        }
    }

    isInvincible() {
        return this.invincible && Date.now() < this.invincibilityEndTime;
    }

    handleGrowth() {
        const targetLength = this.getTargetLength();
        const currentLength = this.segments.length;
        if (targetLength > currentLength) {
            this.growthProgress += this.growthRate * 2; 
            if (this.growthProgress >= 1) {
                this.addSegment();
                this.growthProgress = 0;
            }
        } else if (targetLength < currentLength && currentLength > 3) {
            this.shrinkProgress = (this.shrinkProgress || 0) + this.growthRate;
            if (this.shrinkProgress >= 1) {
                this.removeSegment();
                this.shrinkProgress = 0;
            }
        }
         // Process growth queue from food
        if (this.growthQueue > 0) {
            const segmentsToGrow = Math.floor(this.growthQueue);
            for (let i = 0; i < segmentsToGrow; i++) {
                this.addSegment();
            }
            this.growthQueue -= segmentsToGrow;
        }
    }

    addSegment() {
        const lastSegment = this.segments[this.segments.length - 1];
        const newSegment = { 
            x: lastSegment.x, // Simplified: add at the tail's current position
            y: lastSegment.y, 
            health: 100, 
            maxHealth: 100 
        };
        this.segments.push(newSegment);
    }


    removeSegment() {
        if (this.segments.length > 3) { // Keep minimum 3 segments
            this.segments.pop();
        }
    }
    
    grow() { // Called by food typically
        this.growthQueue += 0.1; // Grow by a fraction of a segment per food pellet
    }

    addSpeedBoost(percentage) {
        this.speedMultiplier += percentage / 100;
    }

    generateAIPersonality() {
        const personalities = [
            { name: 'Aggressive', aggression: 0.8, caution: 0.2, teamwork: 0.3 },
            { name: 'Tactical', aggression: 0.5, caution: 0.7, teamwork: 0.6 },
        ];
        return personalities[Math.floor(Math.random() * personalities.length)];
    }

    generateWeaponPreference() {
        const preferences = ['laser', 'plasma', 'rocket', 'rail', 'balanced'];
        return preferences[Math.floor(Math.random() * preferences.length)];
    }

    addWeaponToInventory(weaponInstance) { // Changed 'weapon' to 'weaponInstance' to avoid conflict
        if (!this.weaponInventory) return;
        if (!this.weaponInventory.primaryWeapon) {
            this.weaponInventory.primaryWeapon = weaponInstance;
            this.switchToWeapon('primaryWeapon');
        } else if (!this.weaponInventory.secondaryWeapon) {
            this.weaponInventory.secondaryWeapon = weaponInstance;
            this.switchToWeapon('secondaryWeapon');
        } else {
            const currentSlot = this.weaponInventory.currentSlot;
            if (currentSlot !== 'sidearm') {
                this.weaponInventory[currentSlot] = weaponInstance;
                this.currentWeapon = weaponInstance;
            } else {
                this.weaponInventory.primaryWeapon = weaponInstance;
                this.switchToWeapon('primaryWeapon');
            }
        }
    }

    switchToWeapon(slot) {
        if (!this.weaponInventory) return;
        const weaponInstance = this.weaponInventory[slot]; // Renamed
        if (weaponInstance && (weaponInstance.currentAmmo > 0 || weaponInstance.maxAmmo === Infinity)) {
            this.lastWeaponSlot = this.weaponInventory.currentSlot;
            this.weaponInventory.currentSlot = slot;
            this.currentWeapon = weaponInstance;
        }
    }

    addPowerup(powerup) {
        this.powerupInventory.push({
            type: powerup.type, config: powerup.config, name: powerup.name, duration: powerup.duration,
            damageReduction: powerup.damageReduction, headProtection: powerup.headProtection,
            boostDamage: powerup.boostDamage, speedBoost: powerup.speedBoost,
            helmetHealth: powerup.helmetHealth, description: powerup.description
        });
    }

    activatePowerup(powerupType) {
        const powerupIndex = this.powerupInventory.findIndex(p => p.type === powerupType);
        if (powerupIndex === -1) return false;
        const powerup = this.powerupInventory[powerupIndex];
        this.powerupInventory.splice(powerupIndex, 1);
        const activePowerup = {
            ...powerup, startTime: Date.now(),
            expirationTime: Date.now() + powerup.duration,
            currentHelmetHealth: powerup.helmetHealth || 0
        };
        this.activePowerups = this.activePowerups.filter(p => p.type !== powerupType);
        this.activePowerups.push(activePowerup);
        return true;
    }

    updatePowerups() {
        this.activePowerups = this.activePowerups.filter(p => Date.now() < p.expirationTime);
    }

    getDamageReduction() {
        let totalReduction = 0;
        this.activePowerups.forEach(p => { if (p.damageReduction) totalReduction = Math.max(totalReduction, p.damageReduction); });
        return Math.min(totalReduction, 0.95);
    }

    getHeadProtection() {
        let totalProtection = 0;
        this.activePowerups.forEach(p => { if (p.headProtection) totalProtection = Math.max(totalProtection, p.headProtection); });
        return Math.min(totalProtection, 0.99);
    }

    getBoostDamage() {
        let totalDamage = 0;
        this.activePowerups.forEach(p => { if (p.boostDamage) totalDamage += p.boostDamage; });
        return totalDamage;
    }

    eatFood(foodItem) {
        this.score += foodItem.value || 1; // Assuming foodItem might have a value property
        this.growthQueue += 1; // Each food item contributes to growth queue
        // In classic_pvp, food typically doesn't add cashBalance.
        // console.log(`${this.username} ate food. Score: ${this.score}, GrowthQueue: ${this.growthQueue}`);
    }

    collectOrb(orbItem) {
        this.score += orbItem.scoreValue || 2; // Orbs can also give a bit of score
        this.boost += orbItem.value || 10; // Default orb value for boost
        if (this.boost > (this.maxBoost || 100)) { // Assuming maxBoost, default 100
            this.boost = this.maxBoost || 100;
        }
        // console.log(`${this.username} collected orb. Score: ${this.score}, Boost: ${this.boost}`);
    }

    convertToFoodItems() {
        const foodItems = [];
        const segmentValue = Math.max(1, Math.floor((this.cashBalance || this.wager || 10) / this.segments.length / 2)); // Value per food piece
        const foodSize = Math.max(3, (this.size || 8) / 2);

        this.segments.forEach(segment => {
            // Create 1 or 2 food items per segment
            for (let i = 0; i < (Math.random() < 0.5 ? 1 : 2) ; i++) {
                foodItems.push({
                    x: segment.x + (Math.random() - 0.5) * (this.size || 8), // Spread food a bit
                    y: segment.y + (Math.random() - 0.5) * (this.size || 8),
                    color: this.color, // Food takes on snake's color
                    size: foodSize,
                    value: segmentValue // Each piece of food has some value
                });
            }
        });
        return foodItems;
    }

    hasActivePowerup(type) {
        return this.activePowerups.some(p => p.type === type);
    }

    getSpeedMultiplier() {
        let multiplier = 1.0;
        this.activePowerups.forEach(p => { if (p.speedBoost) multiplier *= p.speedBoost; });
        return multiplier;
    }
    
    damageHelmet(damage) {
        const helmet = this.activePowerups.find(p => p.type === 'helmet');
        if (helmet && helmet.currentHelmetHealth > 0) {
            helmet.currentHelmetHealth -= damage;
            if (helmet.currentHelmetHealth <= 0) {
                this.activePowerups = this.activePowerups.filter(p => p.type !== 'helmet');
                return true; 
            }
            return false; 
        }
        return null; 
    }

    getHelmetHealth() {
        const helmet = this.activePowerups.find(p => p.type === 'helmet');
        return helmet ? helmet.currentHelmetHealth : 0;
    }
    
    canShoot() { // For AI
        return this.currentWeapon && this.currentWeapon.canShoot();
    }

    shoot(targetX, targetY) { // For AI
        if (!this.canShoot()) return null; // Return null if cannot shoot

        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const angle = Math.atan2(dy, dx);

        const inaccuracy = (1 - this.accuracy) * 0.3;
        const finalAngle = angle + (Math.random() - 0.5) * inaccuracy;

        if (!this.currentWeapon.shoot()) return null; // Check ammo and update lastShotTime in Weapon

        return {
            x: this.x, y: this.y,
            vx: Math.cos(finalAngle) * this.currentWeapon.projectileSpeed,
            vy: Math.sin(finalAngle) * this.currentWeapon.projectileSpeed,
            angle: finalAngle, speed: this.currentWeapon.projectileSpeed,
            damage: this.currentWeapon.damage, type: this.currentWeapon.type,
            ownerId: this.id, // Use ownerId for server-side tracking
            animationOffset: Math.random() * Math.PI * 2
        };
    }

    // darkenColor and addAlpha are global helpers now
}

module.exports = Snake;
