// Weapon configuration data
const WEAPON_CONFIGS = {
    // Default sidearm - always available
    sidearm: {
        name: 'Snake Fang',
        tier: 0,
        damage: 1,
        maxAmmo: Infinity,
        fireRate: 300, // Reduced from 800 for more frequent shooting
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

    // Tier 1: Light Weapons
    laser_pistol: {
        name: 'Laser Pistol',
        tier: 1,
        damage: 2,
        maxAmmo: 24,
        fireRate: 400,
        projectileSpeed: 18,
        accuracy: 95,
        rarity: 'common',
        color: '#FF4444',
        secondaryColor: '#FF7777',
        glowColor: '#FFAAAA',
        accentColor: '#FFCCCC',
        ammoTypes: ['light_energy'],
        description: 'Fast-firing energy sidearm'
    },

    plasma_smg: {
        name: 'Plasma SMG',
        tier: 1,
        damage: 1.5,
        maxAmmo: 30,
        fireRate: 200,
        projectileSpeed: 15,
        accuracy: 85,
        rarity: 'common',
        color: '#44FF44',
        secondaryColor: '#77FF77',
        glowColor: '#AAFFAA',
        accentColor: '#CCFFCC',
        ammoTypes: ['plasma_cells'],
        description: 'Rapid-fire plasma weapon',
        firingMode: 'full_auto' // Full auto firing mode
    },

    // Tier 2: Medium Weapons
    laser_rifle: {
        name: 'Laser Rifle',
        tier: 2,
        damage: 3,
        maxAmmo: 30,
        fireRate: 600,
        projectileSpeed: 20,
        accuracy: 98,
        rarity: 'uncommon',
        color: '#FF2222',
        secondaryColor: '#FF6666',
        glowColor: '#FF9999',
        accentColor: '#FFCCCC',
        ammoTypes: ['light_energy', 'heavy_energy'],
        description: 'Accurate long-range laser',
        firingMode: 'tri_burst_sequential', // Sequential tri-burst mode
        burstCount: 3,
        burstDelay: 100, // 100ms between shots in burst
        burstCooldown: 800 // 800ms cooldown after burst
    },

    plasma_cannon: {
        name: 'Plasma Cannon',
        tier: 2,
        damage: 5,
        maxAmmo: 15,
        fireRate: 1000,
        projectileSpeed: 16,
        accuracy: 90,
        rarity: 'uncommon',
        color: '#22FF22',
        secondaryColor: '#66FF66',
        glowColor: '#99FF99',
        accentColor: '#CCFFCC',
        ammoTypes: ['plasma_cells', 'heavy_plasma'],
        description: 'Heavy plasma artillery',
        firingMode: 'tri_burst_spread', // Spread tri-burst mode
        burstCount: 3,
        spreadAngle: 0.3 // 0.3 radians spread between shots
    },

    // Tier 3: Heavy Weapons
    rocket_launcher: {
        name: 'Rocket Launcher',
        tier: 3,
        damage: 8,
        maxAmmo: 8,
        fireRate: 2000,
        projectileSpeed: 14,
        accuracy: 85,
        rarity: 'rare',
        color: '#FF6622',
        secondaryColor: '#FF9966',
        glowColor: '#FFCC99',
        accentColor: '#FFDDCC',
        ammoTypes: ['rockets'],
        description: 'Explosive rocket weapon'
    },

    rail_gun: {
        name: 'Rail Gun',
        tier: 3,
        damage: 12,
        maxAmmo: 5,
        fireRate: 3000,
        projectileSpeed: 25,
        accuracy: 100,
        rarity: 'rare',
        color: '#4444FF',
        secondaryColor: '#7777FF',
        glowColor: '#AAAAFF',
        accentColor: '#CCCCFF',
        ammoTypes: ['rail_slugs'],
        description: 'Piercing electromagnetic weapon'
    },

    // Tier 4: Ultimate Weapons
    minigun: {
        name: 'Minigun',
        tier: 4,
        damage: 2,
        maxAmmo: 500,
        fireRate: 60, // Very fast fire rate (60ms between shots)
        projectileSpeed: 12,
        accuracy: 75, // Lower accuracy due to rapid fire
        rarity: 'legendary',
        color: '#FF0000',
        secondaryColor: '#FF4444',
        glowColor: '#FF8888',
        accentColor: '#FFCCCC',
        ammoTypes: ['heavy_energy', 'heavy_plasma'],
        description: 'Rapid-fire heavy weapon with massive ammo capacity',
        spinUp: true, // Special property for minigun spin-up mechanic
        spinUpTime: 1000, // 1 second to reach full fire rate
        maxSpinLevel: 10, // Maximum spin level for fire rate bonus
        firingMode: 'full_auto', // Full auto firing mode
        tracerRounds: true // Uses tracer rounds
    }
};

// Ammo configuration
const AMMO_CONFIGS = {
    light_energy: {
        name: 'Energy Cells',
        color: '#FFFF44',
        minAmount: 15,
        maxAmount: 30,
        rarity: 'common'
    },
    heavy_energy: {
        name: 'Heavy Energy',
        color: '#FFAA44',
        minAmount: 8,
        maxAmount: 15,
        rarity: 'uncommon'
    },
    plasma_cells: {
        name: 'Plasma Cells',
        color: '#44FFAA',
        minAmount: 10,
        maxAmount: 20,
        rarity: 'common'
    },
    heavy_plasma: {
        name: 'Heavy Plasma',
        color: '#44FF44',
        minAmount: 5,
        maxAmount: 10,
        rarity: 'uncommon'
    },
    rockets: {
        name: 'Rockets',
        color: '#FF8844',
        minAmount: 2,
        maxAmount: 6,
        rarity: 'rare'
    },
    rail_slugs: {
        name: 'Rail Slugs',
        color: '#8844FF',
        minAmount: 1,
        maxAmount: 3,
        rarity: 'rare'
    }
};

// Powerup configuration
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
    forcefield: {
        name: 'Energy Forcefield',
        type: 'defensive',
        duration: 20000, // 20 seconds
        damageReduction: 0.75, // 75% damage reduction
        headProtection: 0.95, // 95% chance to survive headshot
        rarity: 'uncommon',
        color: '#44AAFF',
        secondaryColor: '#66CCFF',
        glowColor: '#88DDFF',
        description: 'Advanced energy shield with superior protection'
    },
    armor_plating: {
        name: 'Armor Plating',
        type: 'defensive',
        duration: 45000, // 45 seconds
        damageReduction: 0.3, // 30% damage reduction
        headProtection: 0.4, // 40% chance to survive headshot
        rarity: 'common',
        color: '#666666',
        secondaryColor: '#999999',
        glowColor: '#BBBBBB',
        description: 'Heavy armor plating for extended protection'
    },
    battering_ram: {
        name: 'Battering Ram',
        type: 'offensive',
        duration: 25000, // 25 seconds
        boostDamage: 75, // Damage dealt when boosting into segments
        speedBoost: 1.5, // 50% speed increase
        rarity: 'rare',
        color: '#FF6600',
        secondaryColor: '#FF9933',
        glowColor: '#FFCC66',
        description: 'Ram through enemy segments while boosting, increased speed'
    },
    shield_generator: {
        name: 'Shield Generator',
        type: 'defensive',
        duration: 15000, // 15 seconds
        damageReduction: 0.9, // 90% damage reduction
        headProtection: 0.99, // 99% chance to survive headshot
        rarity: 'rare',
        color: '#00FFAA',
        secondaryColor: '#33FFBB',
        glowColor: '#66FFCC',
        description: 'Experimental shield technology'
    }
};

class Weapon {
    constructor(x, y, type = null) {
        this.x = x;
        this.y = y;
        this.size = 25;
        this.collected = false;
        this.type = type || this.randomWeaponType();
        this.animationOffset = Math.random() * Math.PI * 2;

        // Get weapon configuration
        this.config = WEAPON_CONFIGS[this.type] || WEAPON_CONFIGS.sidearm;
        this.setWeaponProperties();
        this.currentAmmo = this.maxAmmo;

        // Individual weapon timing
        this.lastShotTime = 0;

        // Burst firing state
        this.burstState = {
            inBurst: false,
            shotsInBurst: 0,
            lastBurstShotTime: 0,
            burstCooldownStart: 0
        };

        // Visual effects
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.rotationSpeed = 0.5 + Math.random() * 1.0;
    }

    randomWeaponType() {
        const types = ['laser_pistol', 'plasma_smg', 'laser_rifle', 'plasma_cannon', 'rocket_launcher', 'rail_gun', 'minigun'];
        // Weight the selection based on rarity
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

    setWeaponProperties() {
        // Copy properties from config
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

        const now = Date.now();
        const firingMode = this.config.firingMode || 'semi_auto';

        switch (firingMode) {
            case 'tri_burst_sequential':
                // Check if we're in a burst
                if (this.burstState.inBurst) {
                    // Check if we can fire the next shot in the burst
                    return now - this.burstState.lastBurstShotTime >= (this.config.burstDelay || 100);
                } else {
                    // Check if burst cooldown is over
                    return now - this.burstState.burstCooldownStart >= (this.config.burstCooldown || 800);
                }

            case 'tri_burst_spread':
                // Spread burst fires all shots at once, so just check cooldown
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

    reload(ammoAmount) {
        const ammoNeeded = this.maxAmmo - this.currentAmmo;
        const ammoToAdd = Math.min(ammoAmount, ammoNeeded);
        this.currentAmmo += ammoToAdd;
        return ammoAmount - ammoToAdd; // Return remaining ammo
    }

    getAmmoPercentage() {
        return this.currentAmmo / this.maxAmmo;
    }

    draw(ctx, cameraX, cameraY) {
        if (this.collected) return;

        const screenX = this.x - cameraX;
        const screenY = this.y - cameraY;

        // Don't draw if off screen
        if (screenX < -100 || screenX > ctx.canvas.width + 100 ||
            screenY < -100 || screenY > ctx.canvas.height + 100) {
            return;
        }

        const time = Date.now() * 0.001;

        // Enhanced weapon bubble design
        this.drawWeaponContainer(ctx, screenX, screenY, time);
        this.drawAmmoIndicator(ctx, screenX, screenY, time);
        this.drawWeaponDetails(ctx, screenX, screenY, time);
        this.drawWeaponEffects(ctx, screenX, screenY, time);
    }

    drawWeaponContainer(ctx, x, y, time) {
        const baseSize = this.size;
        const pulse = Math.sin(time * 2 + this.pulsePhase) * 0.1 + 1;
        const containerSize = baseSize * pulse;

        // Outer energy field
        const outerGradient = ctx.createRadialGradient(x, y, 0, x, y, containerSize * 2.2);
        outerGradient.addColorStop(0, this.color + '30');
        outerGradient.addColorStop(0.4, this.color + '20');
        outerGradient.addColorStop(0.8, this.color + '10');
        outerGradient.addColorStop(1, 'transparent');

        ctx.fillStyle = outerGradient;
        ctx.beginPath();
        ctx.arc(x, y, containerSize * 2.2, 0, Math.PI * 2);
        ctx.fill();

        // Main container (hexagonal design)
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(time * this.rotationSpeed + this.animationOffset);

        // Hexagonal container
        const hexRadius = containerSize * 0.9;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3;
            const hx = Math.cos(angle) * hexRadius;
            const hy = Math.sin(angle) * hexRadius;
            if (i === 0) ctx.moveTo(hx, hy);
            else ctx.lineTo(hx, hy);
        }
        ctx.closePath();

        // Container gradient
        const containerGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, hexRadius);
        containerGradient.addColorStop(0, this.accentColor + 'CC');
        containerGradient.addColorStop(0.3, this.secondaryColor + 'AA');
        containerGradient.addColorStop(0.7, this.color + '88');
        containerGradient.addColorStop(1, this.color + 'DD');

        ctx.fillStyle = containerGradient;
        ctx.fill();

        // Container border
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 3;
        ctx.stroke();

        // Inner hexagon detail
        const innerHexRadius = hexRadius * 0.7;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3;
            const hx = Math.cos(angle) * innerHexRadius;
            const hy = Math.sin(angle) * innerHexRadius;
            if (i === 0) ctx.moveTo(hx, hy);
            else ctx.lineTo(hx, hy);
        }
        ctx.closePath();

        ctx.strokeStyle = this.secondaryColor + '80';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();
    }

    drawAmmoIndicator(ctx, x, y, time) {
        const ammoPercentage = this.getAmmoPercentage();
        const indicatorRadius = this.size * 1.1;

        // Ammo ring background
        ctx.strokeStyle = '#333333';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(x, y, indicatorRadius, 0, Math.PI * 2);
        ctx.stroke();

        // Ammo ring fill
        const ammoAngle = ammoPercentage * Math.PI * 2;
        let ammoColor;
        if (ammoPercentage > 0.6) ammoColor = '#00FF00';
        else if (ammoPercentage > 0.3) ammoColor = '#FFFF00';
        else ammoColor = '#FF0000';

        if (ammoPercentage > 0) {
            ctx.strokeStyle = ammoColor;
            ctx.lineWidth = 4;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.arc(x, y, indicatorRadius, -Math.PI / 2, -Math.PI / 2 + ammoAngle);
            ctx.stroke();
        }

        // Ammo count text
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${this.currentAmmo}`, x, y + this.size * 1.4);
    }

    drawWeaponDetails(ctx, x, y, time) {
        const iconSize = this.size * 0.5;

        ctx.save();
        ctx.translate(x, y);

        // Weapon-specific detailed icon
        switch (this.type) {
            case 'sidearm':
                this.drawSidearmWeaponIcon(ctx, iconSize, time);
                break;
            case 'laser_pistol':
            case 'laser_rifle':
                this.drawLaserWeaponIcon(ctx, iconSize, time);
                break;
            case 'plasma_smg':
            case 'plasma_cannon':
                this.drawPlasmaWeaponIcon(ctx, iconSize, time);
                break;
            case 'rocket_launcher':
                this.drawMissileWeaponIcon(ctx, iconSize, time);
                break;
            case 'rail_gun':
                this.drawRailGunWeaponIcon(ctx, iconSize, time);
                break;
            case 'minigun':
                this.drawMinigunWeaponIcon(ctx, iconSize, time);
                break;
        }

        ctx.restore();

        // Weapon name
        ctx.fillStyle = this.color;
        ctx.font = 'bold 8px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.name, x, y - this.size * 1.6);
    }

    drawWeaponEffects(ctx, x, y, time) {
        // Energy particles
        const particleCount = 12;
        for (let i = 0; i < particleCount; i++) {
            const angle = (time * 1.5 + i * (Math.PI * 2 / particleCount)) % (Math.PI * 2);
            const distance = this.size * (1.8 + Math.sin(time * 3 + i) * 0.4);
            const particleX = x + Math.cos(angle) * distance;
            const particleY = y + Math.sin(angle) * distance;

            const particleSize = 1.5 + Math.sin(time * 4 + i) * 0.8;
            const alpha = 0.4 + Math.sin(time * 5 + i) * 0.3;

            // Particle glow
            const particleGradient = ctx.createRadialGradient(
                particleX, particleY, 0,
                particleX, particleY, particleSize * 3
            );
            particleGradient.addColorStop(0, this.color + Math.floor(alpha * 255).toString(16).padStart(2, '0'));
            particleGradient.addColorStop(0.5, this.secondaryColor + Math.floor(alpha * 128).toString(16).padStart(2, '0'));
            particleGradient.addColorStop(1, 'transparent');

            ctx.fillStyle = particleGradient;
            ctx.beginPath();
            ctx.arc(particleX, particleY, particleSize * 3, 0, Math.PI * 2);
            ctx.fill();

            // Particle core
            ctx.fillStyle = this.accentColor;
            ctx.beginPath();
            ctx.arc(particleX, particleY, particleSize, 0, Math.PI * 2);
            ctx.fill();
        }

        // Central energy pulse
        const pulseSize = this.size * 0.3 * (1 + Math.sin(time * 6 + this.pulsePhase) * 0.5);
        const pulseGradient = ctx.createRadialGradient(x, y, 0, x, y, pulseSize);
        pulseGradient.addColorStop(0, '#FFFFFF');
        pulseGradient.addColorStop(0.5, this.color);
        pulseGradient.addColorStop(1, 'transparent');

        ctx.fillStyle = pulseGradient;
        ctx.beginPath();
        ctx.arc(x, y, pulseSize, 0, Math.PI * 2);
        ctx.fill();
    }

    drawLaserWeaponIcon(ctx, size, time) {
        // Laser rifle design
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;

        // Rifle body
        ctx.fillRect(-size * 0.8, -size * 0.2, size * 1.6, size * 0.4);
        ctx.strokeRect(-size * 0.8, -size * 0.2, size * 1.6, size * 0.4);

        // Barrel
        ctx.fillRect(size * 0.8, -size * 0.1, size * 0.4, size * 0.2);
        ctx.strokeRect(size * 0.8, -size * 0.1, size * 0.4, size * 0.2);

        // Energy core (pulsing)
        const corePulse = 0.7 + Math.sin(time * 8) * 0.3;
        ctx.fillStyle = this.color + Math.floor(corePulse * 255).toString(16).padStart(2, '0');
        ctx.fillRect(-size * 0.3, -size * 0.15, size * 0.6, size * 0.3);

        // Laser sight lines
        ctx.strokeStyle = '#FF0000';
        ctx.lineWidth = 1;
        for (let i = 0; i < 3; i++) {
            const offset = (i - 1) * size * 0.1;
            ctx.beginPath();
            ctx.moveTo(size * 1.2, offset);
            ctx.lineTo(size * 1.5, offset);
            ctx.stroke();
        }
    }

    drawPlasmaWeaponIcon(ctx, size, time) {
        // Plasma cannon design
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;

        // Cannon body (wider)
        ctx.fillRect(-size * 0.9, -size * 0.3, size * 1.8, size * 0.6);
        ctx.strokeRect(-size * 0.9, -size * 0.3, size * 1.8, size * 0.6);

        // Plasma chamber (circular)
        ctx.beginPath();
        ctx.arc(-size * 0.2, 0, size * 0.25, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Plasma energy (animated)
        const plasmaPulse = 0.5 + Math.sin(time * 6) * 0.5;
        const plasmaGradient = ctx.createRadialGradient(-size * 0.2, 0, 0, -size * 0.2, 0, size * 0.2);
        plasmaGradient.addColorStop(0, '#FFFFFF');
        plasmaGradient.addColorStop(0.5, this.color);
        plasmaGradient.addColorStop(1, this.secondaryColor);

        ctx.fillStyle = plasmaGradient;
        ctx.beginPath();
        ctx.arc(-size * 0.2, 0, size * 0.15 * plasmaPulse, 0, Math.PI * 2);
        ctx.fill();

        // Barrel with energy coils
        ctx.strokeStyle = this.secondaryColor;
        ctx.lineWidth = 3;
        for (let i = 0; i < 4; i++) {
            const x = size * 0.3 + i * size * 0.2;
            ctx.beginPath();
            ctx.arc(x, 0, size * 0.15, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    drawMissileWeaponIcon(ctx, size, time) {
        // Rocket launcher design
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;

        // Launcher tube
        ctx.fillRect(-size * 1.0, -size * 0.25, size * 2.0, size * 0.5);
        ctx.strokeRect(-size * 1.0, -size * 0.25, size * 2.0, size * 0.5);

        // Missile inside (if ammo > 0)
        if (this.currentAmmo > 0) {
            ctx.fillStyle = this.secondaryColor;
            ctx.fillRect(size * 0.2, -size * 0.15, size * 0.6, size * 0.3);

            // Missile tip
            ctx.beginPath();
            ctx.moveTo(size * 0.8, 0);
            ctx.lineTo(size * 1.0, -size * 0.1);
            ctx.lineTo(size * 1.0, size * 0.1);
            ctx.closePath();
            ctx.fill();
        }

        // Launcher details
        ctx.strokeStyle = this.secondaryColor;
        ctx.lineWidth = 1;
        ctx.strokeRect(-size * 0.8, -size * 0.35, size * 0.3, size * 0.7);

        // Exhaust ports
        for (let i = 0; i < 3; i++) {
            const y = (i - 1) * size * 0.15;
            ctx.beginPath();
            ctx.arc(-size * 1.1, y, size * 0.05, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    drawSidearmWeaponIcon(ctx, size, time) {
        // Simple sidearm design
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;

        // Gun body
        ctx.fillRect(-size * 0.6, -size * 0.15, size * 1.2, size * 0.3);
        ctx.strokeRect(-size * 0.6, -size * 0.15, size * 1.2, size * 0.3);

        // Barrel
        ctx.fillRect(size * 0.6, -size * 0.08, size * 0.3, size * 0.16);
        ctx.strokeRect(size * 0.6, -size * 0.08, size * 0.3, size * 0.16);

        // Grip
        ctx.fillRect(-size * 0.4, size * 0.15, size * 0.2, size * 0.4);
        ctx.strokeRect(-size * 0.4, size * 0.15, size * 0.2, size * 0.4);
    }

    drawRailGunWeaponIcon(ctx, size, time) {
        // Rail gun design
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;

        // Main body (longer and thicker)
        ctx.fillRect(-size * 1.1, -size * 0.2, size * 2.2, size * 0.4);
        ctx.strokeRect(-size * 1.1, -size * 0.2, size * 2.2, size * 0.4);

        // Rail guides (top and bottom)
        ctx.strokeStyle = this.secondaryColor;
        ctx.lineWidth = 1;
        ctx.strokeRect(-size * 1.0, -size * 0.25, size * 2.0, size * 0.1);
        ctx.strokeRect(-size * 1.0, size * 0.15, size * 2.0, size * 0.1);

        // Energy chamber (pulsing)
        const energyPulse = 0.6 + Math.sin(time * 10) * 0.4;
        ctx.fillStyle = this.color + Math.floor(energyPulse * 255).toString(16).padStart(2, '0');
        ctx.fillRect(-size * 0.2, -size * 0.1, size * 0.4, size * 0.2);

        // Electromagnetic coils
        ctx.strokeStyle = '#4444FF';
        ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
            const x = -size * 0.6 + i * size * 0.4;
            ctx.beginPath();
            ctx.arc(x, 0, size * 0.12, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    drawMinigunWeaponIcon(ctx, size, time) {
        // Minigun design with rotating barrels
        const rotationSpeed = time * 5; // Fast rotation for minigun effect

        ctx.save();
        ctx.rotate(rotationSpeed);

        // Multiple rotating barrels
        const barrelCount = 6;
        const barrelRadius = size * 0.3;

        for (let i = 0; i < barrelCount; i++) {
            const angle = (i / barrelCount) * Math.PI * 2;
            const barrelX = Math.cos(angle) * barrelRadius;
            const barrelY = Math.sin(angle) * barrelRadius;

            // Individual barrel
            ctx.fillStyle = this.color;
            ctx.strokeStyle = this.secondaryColor;
            ctx.lineWidth = 1;

            ctx.beginPath();
            ctx.arc(barrelX, barrelY, size * 0.08, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Barrel opening
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(barrelX, barrelY, size * 0.04, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();

        // Central hub
        ctx.fillStyle = this.secondaryColor;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Weapon body/handle
        ctx.fillStyle = this.color;
        ctx.fillRect(-size * 0.1, size * 0.2, size * 0.2, size * 0.4);
        ctx.strokeRect(-size * 0.1, size * 0.2, size * 0.2, size * 0.4);

        // Ammo feed
        ctx.fillStyle = this.accentColor;
        ctx.fillRect(-size * 0.15, size * 0.1, size * 0.3, size * 0.15);
        ctx.strokeRect(-size * 0.15, size * 0.1, size * 0.3, size * 0.15);

        // Muzzle flash effect (if spinning fast)
        if (Math.sin(time * 10) > 0.5) {
            const flashGradient = ctx.createRadialGradient(0, -size * 0.5, 0, 0, -size * 0.5, size * 0.3);
            flashGradient.addColorStop(0, '#FFFF00');
            flashGradient.addColorStop(0.5, '#FF8800');
            flashGradient.addColorStop(1, 'transparent');

            ctx.fillStyle = flashGradient;
            ctx.beginPath();
            ctx.arc(0, -size * 0.5, size * 0.3, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

// New Ammo class for separate ammo pickups
class Ammo {
    constructor(x, y, type = null, amount = null) {
        this.x = x;
        this.y = y;
        this.size = 15;
        this.collected = false;
        this.type = type || this.randomAmmoType();
        this.animationOffset = Math.random() * Math.PI * 2;

        // Set ammo properties
        this.setAmmoProperties(amount);

        // Visual effects
        this.bobPhase = Math.random() * Math.PI * 2;
        this.sparklePhase = Math.random() * Math.PI * 2;
    }

    randomAmmoType() {
        const types = ['light_energy', 'plasma_cells', 'heavy_energy', 'heavy_plasma', 'rockets', 'rail_slugs'];
        const weights = [30, 25, 20, 15, 8, 2]; // Common ammo more likely

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

    setAmmoProperties(customAmount = null) {
        const config = AMMO_CONFIGS[this.type];
        if (config) {
            this.color = config.color;
            this.secondaryColor = this.lightenColor(config.color);
            this.name = config.name;
            this.rarity = config.rarity;
            this.amount = customAmount || (config.minAmount + Math.floor(Math.random() * (config.maxAmount - config.minAmount + 1)));
        } else {
            // Fallback for unknown types
            this.color = '#FFFFFF';
            this.secondaryColor = '#CCCCCC';
            this.amount = customAmount || 10;
            this.name = 'Unknown Ammo';
            this.rarity = 'common';
        }
    }

    lightenColor(color) {
        // Simple color lightening function
        const hex = color.replace('#', '');
        const r = Math.min(255, parseInt(hex.substr(0, 2), 16) + 60);
        const g = Math.min(255, parseInt(hex.substr(2, 2), 16) + 60);
        const b = Math.min(255, parseInt(hex.substr(4, 2), 16) + 60);
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }

    draw(ctx, cameraX, cameraY) {
        if (this.collected) return;

        const screenX = this.x - cameraX;
        const screenY = this.y - cameraY;

        // Don't draw if off screen
        if (screenX < -50 || screenX > ctx.canvas.width + 50 ||
            screenY < -50 || screenY > ctx.canvas.height + 50) {
            return;
        }

        const time = Date.now() * 0.001;
        const bobOffset = Math.sin(time * 3 + this.bobPhase) * 3;
        const finalY = screenY + bobOffset;

        this.drawAmmoContainer(ctx, screenX, finalY, time);
        this.drawAmmoIcon(ctx, screenX, finalY, time);
        this.drawAmmoEffects(ctx, screenX, finalY, time);
    }

    drawAmmoContainer(ctx, x, y, time) {
        const pulse = 0.9 + Math.sin(time * 4 + this.animationOffset) * 0.1;
        const containerSize = this.size * pulse;

        // Outer glow
        const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, containerSize * 2);
        glowGradient.addColorStop(0, this.color + '60');
        glowGradient.addColorStop(0.5, this.color + '30');
        glowGradient.addColorStop(1, 'transparent');

        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(x, y, containerSize * 2, 0, Math.PI * 2);
        ctx.fill();

        // Main container (diamond shape)
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(time * 1.5 + this.animationOffset);

        const diamondSize = containerSize * 0.8;
        ctx.beginPath();
        ctx.moveTo(0, -diamondSize);
        ctx.lineTo(diamondSize, 0);
        ctx.lineTo(0, diamondSize);
        ctx.lineTo(-diamondSize, 0);
        ctx.closePath();

        // Container gradient
        const containerGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, diamondSize);
        containerGradient.addColorStop(0, '#FFFFFF');
        containerGradient.addColorStop(0.3, this.secondaryColor);
        containerGradient.addColorStop(1, this.color);

        ctx.fillStyle = containerGradient;
        ctx.fill();

        // Container border
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();
    }

    drawAmmoIcon(ctx, x, y, time) {
        const iconSize = this.size * 0.4;

        ctx.save();
        ctx.translate(x, y);

        // Ammo type icon
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 1;

        switch (this.type) {
            case 'laser':
                // Battery/cell icon
                ctx.fillRect(-iconSize * 0.3, -iconSize * 0.6, iconSize * 0.6, iconSize * 1.2);
                ctx.strokeRect(-iconSize * 0.3, -iconSize * 0.6, iconSize * 0.6, iconSize * 1.2);
                // Positive terminal
                ctx.fillRect(-iconSize * 0.1, -iconSize * 0.8, iconSize * 0.2, iconSize * 0.2);
                break;

            case 'plasma':
                // Energy core icon
                ctx.beginPath();
                ctx.arc(0, 0, iconSize * 0.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                // Energy lines
                for (let i = 0; i < 4; i++) {
                    const angle = i * Math.PI / 2;
                    ctx.beginPath();
                    ctx.moveTo(Math.cos(angle) * iconSize * 0.3, Math.sin(angle) * iconSize * 0.3);
                    ctx.lineTo(Math.cos(angle) * iconSize * 0.7, Math.sin(angle) * iconSize * 0.7);
                    ctx.stroke();
                }
                break;

            case 'missile':
                // Rocket icon
                ctx.fillRect(-iconSize * 0.1, -iconSize * 0.6, iconSize * 0.2, iconSize * 1.2);
                ctx.strokeRect(-iconSize * 0.1, -iconSize * 0.6, iconSize * 0.2, iconSize * 1.2);
                // Warhead
                ctx.beginPath();
                ctx.moveTo(0, -iconSize * 0.6);
                ctx.lineTo(-iconSize * 0.1, -iconSize * 0.8);
                ctx.lineTo(iconSize * 0.1, -iconSize * 0.8);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                // Fins
                ctx.strokeRect(-iconSize * 0.3, iconSize * 0.4, iconSize * 0.2, iconSize * 0.2);
                ctx.strokeRect(iconSize * 0.1, iconSize * 0.4, iconSize * 0.2, iconSize * 0.2);
                break;
        }

        ctx.restore();

        // Ammo count
        ctx.fillStyle = this.color;
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`+${this.amount}`, x, y + this.size * 1.2);
    }

    drawAmmoEffects(ctx, x, y, time) {
        // Sparkle effects
        const sparkleCount = 6;
        for (let i = 0; i < sparkleCount; i++) {
            const angle = (time * 2 + this.sparklePhase + i * (Math.PI * 2 / sparkleCount)) % (Math.PI * 2);
            const distance = this.size * (1.2 + Math.sin(time * 4 + i) * 0.3);
            const sparkleX = x + Math.cos(angle) * distance;
            const sparkleY = y + Math.sin(angle) * distance;

            const sparkleSize = 1 + Math.sin(time * 6 + i) * 0.5;
            const alpha = 0.6 + Math.sin(time * 8 + i) * 0.4;

            ctx.fillStyle = this.secondaryColor + Math.floor(alpha * 255).toString(16).padStart(2, '0');
            ctx.beginPath();
            ctx.arc(sparkleX, sparkleY, sparkleSize, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

// Powerup class for defensive and offensive powerups
class Powerup {
    constructor(x, y, type = null) {
        this.x = x;
        this.y = y;
        this.size = 20;
        this.collected = false;
        this.type = type || this.randomPowerupType();
        this.animationOffset = Math.random() * Math.PI * 2;

        // Get powerup configuration
        this.config = POWERUP_CONFIGS[this.type] || POWERUP_CONFIGS.helmet;
        this.setPowerupProperties();

        // Visual effects
        this.bobPhase = Math.random() * Math.PI * 2;
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.rotationSpeed = 1.0 + Math.random() * 0.5;
    }

    randomPowerupType() {
        const types = Object.keys(POWERUP_CONFIGS);
        const weights = types.map(type => {
            const rarity = POWERUP_CONFIGS[type].rarity;
            switch (rarity) {
                case 'common': return 50;
                case 'uncommon': return 25;
                case 'rare': return 10;
                default: return 30;
            }
        });

        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
        let random = Math.random() * totalWeight;

        for (let i = 0; i < types.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                return types[i];
            }
        }

        return types[0];
    }

    setPowerupProperties() {
        this.name = this.config.name;
        this.powerupType = this.config.type;
        this.duration = this.config.duration;
        this.damageReduction = this.config.damageReduction || 0;
        this.headProtection = this.config.headProtection || 0;
        this.boostDamage = this.config.boostDamage || 0;
        this.rarity = this.config.rarity;
        this.color = this.config.color;
        this.secondaryColor = this.config.secondaryColor;
        this.glowColor = this.config.glowColor;
        this.description = this.config.description;
    }

    update() {
        // Floating animation
        this.bobPhase += 0.05;
        this.pulsePhase += 0.08;
        this.animationOffset += this.rotationSpeed * 0.02;
    }

    draw(ctx, cameraX, cameraY) {
        const screenX = this.x - cameraX;
        const screenY = this.y - cameraY;

        ctx.save();
        ctx.translate(screenX, screenY);

        // Floating effect
        const bobOffset = Math.sin(this.bobPhase) * 3;
        ctx.translate(0, bobOffset);

        // Rotation
        ctx.rotate(this.animationOffset);

        // Draw weapon bubble style background
        this.drawWeaponBubble(ctx);

        // Draw powerup icon based on type
        this.drawPowerupIcon(ctx, this.size * 0.6); // Smaller icon to fit in bubble

        // Draw powerup label
        this.drawPowerupLabel(ctx);

        ctx.restore();
    }

    drawWeaponBubble(ctx) {
        const time = Date.now() * 0.001;
        const pulseIntensity = 0.8 + Math.sin(this.pulsePhase) * 0.2;

        // Outer glow effect
        const glowSize = this.size * 2 * pulseIntensity;
        const glowGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, glowSize);
        glowGradient.addColorStop(0, this.glowColor + '60');
        glowGradient.addColorStop(0.5, this.glowColor + '30');
        glowGradient.addColorStop(1, 'transparent');

        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(0, 0, glowSize, 0, Math.PI * 2);
        ctx.fill();

        // Main bubble with gradient
        const bubbleGradient = ctx.createRadialGradient(
            -this.size * 0.3, -this.size * 0.3, 0,
            0, 0, this.size
        );
        bubbleGradient.addColorStop(0, this.color + 'FF');
        bubbleGradient.addColorStop(0.7, this.secondaryColor + 'DD');
        bubbleGradient.addColorStop(1, this.color + '88');

        ctx.fillStyle = bubbleGradient;
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();

        // Bubble highlight
        const highlightGradient = ctx.createRadialGradient(
            -this.size * 0.4, -this.size * 0.4, 0,
            -this.size * 0.2, -this.size * 0.2, this.size * 0.6
        );
        highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        highlightGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
        highlightGradient.addColorStop(1, 'transparent');

        ctx.fillStyle = highlightGradient;
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();

        // Bubble outline with pulsing effect
        ctx.strokeStyle = this.glowColor;
        ctx.lineWidth = 2 + Math.sin(time * 4 + this.pulsePhase) * 0.5;
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.stroke();

        // Energy particles around bubble
        for (let i = 0; i < 6; i++) {
            const particleAngle = (time * 2 + i * Math.PI / 3) % (Math.PI * 2);
            const particleDistance = this.size * 1.3;
            const particleX = Math.cos(particleAngle) * particleDistance;
            const particleY = Math.sin(particleAngle) * particleDistance;
            const particleSize = 2 + Math.sin(time * 6 + i) * 1;

            ctx.fillStyle = this.glowColor + 'AA';
            ctx.beginPath();
            ctx.arc(particleX, particleY, particleSize, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawPowerupIcon(ctx, size) {
        switch (this.type) {
            case 'helmet':
                this.drawHelmetIcon(ctx, size);
                break;
            case 'forcefield':
                this.drawForcefieldIcon(ctx, size);
                break;
            case 'armor_plating':
                this.drawArmorIcon(ctx, size);
                break;
            case 'battering_ram':
                this.drawBatteringRamIcon(ctx, size);
                break;
            case 'shield_generator':
                this.drawShieldGeneratorIcon(ctx, size);
                break;
            default:
                this.drawHelmetIcon(ctx, size);
        }
    }

    drawHelmetIcon(ctx, size) {
        // Combat helmet design
        ctx.fillStyle = this.color;
        ctx.strokeStyle = this.secondaryColor;
        ctx.lineWidth = 2;

        // Main helmet dome
        ctx.beginPath();
        ctx.arc(0, -size * 0.2, size * 0.6, 0, Math.PI, true);
        ctx.fill();
        ctx.stroke();

        // Visor
        ctx.fillStyle = this.secondaryColor;
        ctx.beginPath();
        ctx.arc(0, -size * 0.2, size * 0.4, 0, Math.PI, true);
        ctx.fill();

        // Chin guard
        ctx.fillStyle = this.color;
        ctx.fillRect(-size * 0.3, size * 0.1, size * 0.6, size * 0.2);
        ctx.strokeRect(-size * 0.3, size * 0.1, size * 0.6, size * 0.2);
    }

    drawForcefieldIcon(ctx, size) {
        // Energy forcefield design
        const time = Date.now() * 0.005;

        // Multiple energy rings
        for (let i = 0; i < 3; i++) {
            const ringSize = size * (0.3 + i * 0.2);
            const alpha = 0.8 - i * 0.2;

            ctx.strokeStyle = this.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
            ctx.lineWidth = 3 - i;

            ctx.beginPath();
            ctx.arc(0, 0, ringSize + Math.sin(time + i) * 3, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Central energy core
        ctx.fillStyle = this.glowColor;
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.15, 0, Math.PI * 2);
        ctx.fill();
    }

    drawArmorIcon(ctx, size) {
        // Armor plating design
        ctx.fillStyle = this.color;
        ctx.strokeStyle = this.secondaryColor;
        ctx.lineWidth = 2;

        // Main armor plate
        ctx.fillRect(-size * 0.4, -size * 0.4, size * 0.8, size * 0.8);
        ctx.strokeRect(-size * 0.4, -size * 0.4, size * 0.8, size * 0.8);

        // Armor segments
        for (let i = 0; i < 3; i++) {
            const y = -size * 0.2 + i * size * 0.2;
            ctx.strokeStyle = this.secondaryColor;
            ctx.beginPath();
            ctx.moveTo(-size * 0.3, y);
            ctx.lineTo(size * 0.3, y);
            ctx.stroke();
        }

        // Rivets
        for (let x = -1; x <= 1; x += 2) {
            for (let y = -1; y <= 1; y += 2) {
                ctx.fillStyle = this.secondaryColor;
                ctx.beginPath();
                ctx.arc(x * size * 0.25, y * size * 0.25, size * 0.05, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    drawBatteringRamIcon(ctx, size) {
        // Battering ram design
        ctx.fillStyle = this.color;
        ctx.strokeStyle = this.secondaryColor;
        ctx.lineWidth = 2;

        // Ram head (pointed)
        ctx.beginPath();
        ctx.moveTo(size * 0.4, 0);
        ctx.lineTo(-size * 0.2, -size * 0.3);
        ctx.lineTo(-size * 0.4, -size * 0.1);
        ctx.lineTo(-size * 0.4, size * 0.1);
        ctx.lineTo(-size * 0.2, size * 0.3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Impact spikes
        for (let i = 0; i < 3; i++) {
            const angle = (i - 1) * 0.3;
            const x = Math.cos(angle) * size * 0.3;
            const y = Math.sin(angle) * size * 0.3;

            ctx.fillStyle = this.secondaryColor;
            ctx.beginPath();
            ctx.arc(x, y, size * 0.08, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawShieldGeneratorIcon(ctx, size) {
        // Shield generator design
        const time = Date.now() * 0.008;

        // Generator core
        ctx.fillStyle = this.color;
        ctx.fillRect(-size * 0.2, -size * 0.2, size * 0.4, size * 0.4);

        // Energy projectors
        for (let i = 0; i < 4; i++) {
            const angle = i * Math.PI * 0.5;
            const x = Math.cos(angle) * size * 0.3;
            const y = Math.sin(angle) * size * 0.3;

            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle);

            ctx.fillStyle = this.secondaryColor;
            ctx.fillRect(-size * 0.05, -size * 0.1, size * 0.1, size * 0.2);
            ctx.restore();
        }

        // Animated shield dome
        ctx.strokeStyle = this.glowColor + '80';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.lineDashOffset = time * 10;

        ctx.beginPath();
        ctx.arc(0, 0, size * 0.7, 0, Math.PI * 2);
        ctx.stroke();

        ctx.setLineDash([]);
    }

    drawPowerupLabel(ctx) {
        // Get short label for powerup type
        const labels = {
            'helmet': 'HELMET',
            'forcefield': 'SHIELD',
            'armor_plating': 'ARMOR',
            'battering_ram': 'RAM',
            'shield_generator': 'GENERATOR'
        };

        const label = labels[this.type] || 'POWERUP';

        // Position label below the bubble
        const labelY = this.size + 15;

        ctx.save();

        // Text styling
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Text background for better readability
        const textWidth = ctx.measureText(label).width;
        const padding = 3;
        const bgWidth = textWidth + padding * 2;
        const bgHeight = 10;

        // Background with slight transparency
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(-bgWidth / 2, labelY - bgHeight / 2, bgWidth, bgHeight);

        // Border around background
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 1;
        ctx.strokeRect(-bgWidth / 2, labelY - bgHeight / 2, bgWidth, bgHeight);

        // Text with powerup color
        ctx.fillStyle = this.glowColor;
        ctx.fillText(label, 0, labelY);

        // Add small glow effect to text
        ctx.shadowColor = this.glowColor;
        ctx.shadowBlur = 2;
        ctx.fillText(label, 0, labelY);

        ctx.restore();
    }
}

class Game {
    constructor(canvas, gameMode = 'classic') {
        console.log('Game constructor started');

        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d');
        this.minimap = null;
        this.minimapCtx = null;

        // Canvas setup - size to container
        const resizeCanvas = () => {
            const rect = this.canvas.getBoundingClientRect();
            const newWidth = rect.width || window.innerWidth;
            const newHeight = rect.height || window.innerHeight;

            if (newWidth > 0 && newHeight > 0) {
                this.canvas.width = newWidth;
                this.canvas.height = newHeight;
                console.log('Canvas resized to:', this.canvas.width, 'x', this.canvas.height);
            } else {
                console.log('Canvas size invalid:', newWidth, 'x', newHeight, 'rect:', rect);
            }
        };

        // Store resize function for cleanup
        this.resizeCanvas = resizeCanvas;

        // Initial resize with multiple attempts
        setTimeout(resizeCanvas, 50);
        setTimeout(resizeCanvas, 200);
        setTimeout(resizeCanvas, 500);

        // Handle window resize
        window.addEventListener('resize', resizeCanvas);

        // Game world dimensions
        this.worldWidth = 4000;
        this.worldHeight = 4000;

        // Game mode
        this.gameMode = gameMode;

        // Warfare mode properties
        this.weapons = [];
        this.ammo = []; // Separate ammo pickups
        this.powerups = []; // Defensive and offensive powerups
        this.projectiles = []; // Projectiles fired by snakes
        this.coins = []; // Collectible coins from damaged segments

        // Gambling system
        this.playerWager = 0; // Player's selected wager amount
        this.availableWagers = [10, 25, 50, 100, 250, 500]; // Available wager options

        // Weapon inventory system
        this.weaponInventory = {
            primaryWeapon: null,
            secondaryWeapon: null,
            sidearm: new Weapon(0, 0, 'sidearm'), // Always available
            currentSlot: 'sidearm'
        };
        this.currentWeapon = this.weaponInventory.sidearm;
        this.lastWeaponSlot = 'sidearm'; // For quick switching

        // Ammo inventory tracking
        this.ammoInventory = {
            light_energy: 0,
            heavy_energy: 0,
            plasma_cells: 0,
            heavy_plasma: 0,
            rockets: 0,
            rail_slugs: 0
        };

        // Game state
        this.gameRunning = true;
        this.score = 0;
        this.cashBalance = 0; // Separate cash balance for warfare mode
        this.camera = { x: 1500, y: 1500 }; // Start camera in middle of world
        this.currentKing = null; // Track the snake with highest balance

        // Game objects
        this.player = new Snake(2000, 2000, '#FFD700', true); // Golden yellow color
        this.player.gameInstance = this; // Set game reference

        // Set default player wager for both modes (gambling mechanics in both)
        this.playerWager = 50; // Default $50 wager
        this.player.wager = this.playerWager;
        // Give player starting cash equal to their wager
        this.cashBalance = this.playerWager;

        // Activate spawn invincibility for player
        this.player.activateSpawnInvincibility(this.playerWager);

        // Log initial player state for debugging
        console.log('Initial player setup - segments:', this.player.segments.length, 'cash balance: $' + this.cashBalance);

        if (this.gameMode === 'classic') {
            // In classic mode, score is separate from cash
            this.score = 0;
        } else {
            // In warfare mode, score equals cash
            this.score = this.cashBalance;
        }

        // Multiplayer system - replace AI snakes with remote players
        this.remotePlayers = []; // Other players in the same room
        this.isMultiplayer = true; // Enable multiplayer mode
        this.roomId = null; // Current room ID
        this.playerId = null; // This player's unique ID
        this.realtimeChannel = null; // Supabase realtime channel
        this.multiplayerService = null; // Reference to multiplayer service

        this.aiSnakes = []; // Keep for compatibility but won't be used in multiplayer
        this.food = [];
        this.glowOrbs = [];

        // Weapons system (warfare mode only)
        this.weapons = [];
        this.ammo = [];
        this.powerups = [];
        this.projectiles = [];
        this.coins = []; // For gambling mechanics in both modes

        // Input handling
        this.mouse = { x: this.canvas.width / 2, y: this.canvas.height / 2 };
        this.boosting = false;
        this.mouseHeld = false; // Track if mouse is held down for full auto

        // Generate initial game objects
        this.generateFood();
        this.generateGlowOrbs();

        // React integration
        this.onStateUpdate = null;
        this.onGameOver = null;

        // Cashout system
        this.cashedOut = false;
        this.spectating = false;
        this.spectateTarget = 0; // Index of snake being spectated
        this.cashoutBalance = 0; // Final cashed out amount

        // DON'T auto-initialize - wait for explicit start() call to ensure callbacks are set up
        console.log('Game constructor completed - waiting for start() call');
    }

    init() {
        console.log('Initializing multiplayer game...');

        // MULTIPLAYER MODE: No AI snakes - only real players
        console.log('🌐 Multiplayer mode enabled - AI snakes disabled');
        console.log('🎮 Waiting for other players to join the room...');

        // Initialize warfare mode if selected
        if (this.gameMode === 'warfare') {
            // Generate initial weapons
            for (let i = 0; i < 5; i++) {
                const x = Math.random() * this.worldWidth;
                const y = Math.random() * this.worldHeight;
                this.weapons.push(new Weapon(x, y));
            }

            // Generate initial ammo
            for (let i = 0; i < 15; i++) {
                const x = Math.random() * this.worldWidth;
                const y = Math.random() * this.worldHeight;
                this.ammo.push(new Ammo(x, y));
            }

            // Generate initial powerups
            for (let i = 0; i < 8; i++) {
                const x = Math.random() * this.worldWidth;
                const y = Math.random() * this.worldHeight;
                this.powerups.push(new Powerup(x, y));
            }
        }

        // Add to Game class update method
        if (this.gameMode === 'warfare') {
            // Update weapons
            this.weapons = this.weapons.filter(weapon => !weapon.collected);

            // Generate new weapons if needed
            while (this.weapons.length < 5) {
                const x = Math.random() * this.worldWidth;
                const y = Math.random() * this.worldHeight;
                this.weapons.push(new Weapon(x, y));
            }

            // Weapon UI will be updated through React state callback
        }

        // Reset game state (but keep player from constructor)
        this.gameRunning = true;
        this.score = this.gameMode === 'warfare' ? this.cashBalance : 0;
        this.camera = { x: 1500, y: 1500 }; // Start camera in middle of world

        // Reset game objects (but keep player and aiSnakes from constructor)
        // DON'T reset player or aiSnakes here - they were already created above!
        this.food = [];
        this.glowOrbs = [];

        // Input handling
        this.mouse = { x: this.canvas.width / 2, y: this.canvas.height / 2 };
        this.boosting = false;

        // Initialize gamepad support
        this.initializeGamepadSupport();

        // Generate initial game objects
        this.generateFood();
        this.generateGlowOrbs();
    }

    generateFood() {
        console.log('Generating food...');
        // Generate more food in warfare mode for speed boost mechanics
        const foodCount = this.gameMode === 'warfare' ? 1000 : 500; // Double food in warfare mode

        for (let i = 0; i < foodCount; i++) {
            this.food.push({
                x: Math.random() * this.worldWidth,
                y: Math.random() * this.worldHeight,
                color: `hsl(${Math.random() * 360}, 70%, 60%)`,
                size: 4 + Math.random() * 3
            });
        }
        console.log(`Generated ${this.food.length} food items for ${this.gameMode} mode`);
    }

    generateGlowOrbs() {
        console.log('Generating glow orbs...');
        for (let i = 0; i < 10; i++) {
            const hue = Math.random() * 360;
            this.glowOrbs.push({
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
        console.log(`Generated ${this.glowOrbs.length} glow orbs`);
    }

    setupEventListeners() {
        // Mouse movement
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
        });

        // Mouse controls
        this.canvas.addEventListener('mousedown', (e) => {
            if (e.button === 0) {
                // Left click - shoot in warfare mode (only if not invincible), boost in classic mode
                if (this.gameMode === 'warfare' && this.currentWeapon && !this.player.isInvincible()) {
                    this.mouseHeld = true;
                    this.shoot();
                } else {
                    this.boosting = true;
                }
            } else if (e.button === 2) {
                // Right click - always boost
                this.boosting = true;
            }
        });

        this.canvas.addEventListener('mouseup', (e) => {
            if (e.button === 0) {
                // Left click release
                this.mouseHeld = false;
                if (this.gameMode !== 'warfare') {
                    this.boosting = false;
                }
            } else if (e.button === 2) {
                // Right click release - stop boost
                this.boosting = false;
            }
        });

        // Disable right-click context menu
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });

        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                if (this.gameMode === 'warfare' && this.currentWeapon && !this.player.isInvincible()) {
                    this.shoot();
                } else {
                    this.boosting = true;
                }
            }

            // Cashout hotkey (both modes)
            if (e.code === 'KeyC') {
                e.preventDefault();
                this.cashOut();
            }

            // Spectate cycling (when spectating)
            if (e.code === 'Tab' && this.spectating) {
                e.preventDefault();
                this.cycleThroughSnakes();
            }

            // Weapon switching (warfare mode only)
            if (this.gameMode === 'warfare') {
                switch (e.code) {
                    case 'Digit1':
                        this.switchToWeapon('primaryWeapon');
                        break;
                    case 'Digit2':
                        this.switchToWeapon('secondaryWeapon');
                        break;
                    case 'Digit3':
                        this.switchToWeapon('sidearm');
                        break;
                    case 'KeyQ':
                        this.quickSwitchWeapon();
                        break;
                }
            }
        });

        document.addEventListener('keyup', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.boosting = false;
            }
        });
    }

    // Weapon switching methods
    switchToWeapon(slot) {
        const weapon = this.weaponInventory[slot];

        if (weapon && (weapon.currentAmmo > 0 || weapon.maxAmmo === Infinity)) {
            this.lastWeaponSlot = this.weaponInventory.currentSlot;
            this.weaponInventory.currentSlot = slot;
            this.currentWeapon = weapon;
        }
    }

    quickSwitchWeapon() {
        if (this.lastWeaponSlot && this.weaponInventory[this.lastWeaponSlot]) {
            const temp = this.weaponInventory.currentSlot;
            this.switchToWeapon(this.lastWeaponSlot);
            this.lastWeaponSlot = temp;
        }
    }

    addWeaponToInventory(weapon) {
        // Try to add to primary slot first, then secondary
        if (!this.weaponInventory.primaryWeapon) {
            this.weaponInventory.primaryWeapon = weapon;
            this.switchToWeapon('primaryWeapon');
        } else if (!this.weaponInventory.secondaryWeapon) {
            this.weaponInventory.secondaryWeapon = weapon;
            this.switchToWeapon('secondaryWeapon');
        } else {
            // Replace current weapon
            const currentSlot = this.weaponInventory.currentSlot;
            if (currentSlot !== 'sidearm') {
                this.weaponInventory[currentSlot] = weapon;
                this.currentWeapon = weapon;
            } else {
                // If sidearm is active, replace primary
                this.weaponInventory.primaryWeapon = weapon;
                this.switchToWeapon('primaryWeapon');
            }
        }
    }

    getAmmoInventory() {
        // Return only ammo types that have non-zero amounts
        const nonZeroAmmo = {};
        Object.entries(this.ammoInventory).forEach(([type, amount]) => {
            if (amount > 0) {
                nonZeroAmmo[type] = amount;
            }
        });
        return nonZeroAmmo;
    }

    reloadWeaponsFromInventory() {
        // Try to reload all weapons from ammo inventory
        ['primaryWeapon', 'secondaryWeapon', 'sidearm'].forEach(slot => {
            const weapon = this.weaponInventory[slot];
            if (weapon && weapon.ammoTypes.length > 0) {
                // Try each compatible ammo type
                weapon.ammoTypes.forEach(ammoType => {
                    if (this.ammoInventory[ammoType] > 0 && weapon.currentAmmo < weapon.maxAmmo) {
                        const ammoNeeded = weapon.maxAmmo - weapon.currentAmmo;
                        const ammoToUse = Math.min(this.ammoInventory[ammoType], ammoNeeded);

                        weapon.currentAmmo += ammoToUse;
                        this.ammoInventory[ammoType] -= ammoToUse;
                    }
                });
            }
        });
    }

    reloadAIWeaponsFromInventory(snake) {
        if (!snake.weaponInventory || !snake.ammoInventory) return;

        // Try to reload all AI weapons from ammo inventory
        ['primaryWeapon', 'secondaryWeapon', 'sidearm'].forEach(slot => {
            const weapon = snake.weaponInventory[slot];
            if (weapon && weapon.ammoTypes.length > 0) {
                // Try each compatible ammo type
                weapon.ammoTypes.forEach(ammoType => {
                    if (snake.ammoInventory[ammoType] > 0 && weapon.currentAmmo < weapon.maxAmmo) {
                        const ammoNeeded = weapon.maxAmmo - weapon.currentAmmo;
                        const ammoToUse = Math.min(snake.ammoInventory[ammoType], ammoNeeded);

                        weapon.currentAmmo += ammoToUse;
                        snake.ammoInventory[ammoType] -= ammoToUse;
                    }
                });
            }
        });
    }

    shoot() {
        if (!this.currentWeapon) return;

        // Check if weapon can shoot (ammo and cooldown)
        if (!this.currentWeapon.canShoot()) return;

        const worldMouseX = this.mouse.x + this.camera.x;
        const worldMouseY = this.mouse.y + this.camera.y;
        const playerHead = this.player.segments[0];

        // Calculate shot direction
        const dx = worldMouseX - playerHead.x;
        const dy = worldMouseY - playerHead.y;
        const angle = Math.atan2(dy, dx);

        // Store weapon reference before shooting (in case it changes)
        const weaponUsed = this.currentWeapon;
        const firingMode = weaponUsed.config.firingMode || 'semi_auto';

        // Handle different firing modes
        switch (firingMode) {
            case 'tri_burst_sequential':
                this.handleSequentialBurst(weaponUsed, angle, playerHead);
                break;
            case 'tri_burst_spread':
                this.handleSpreadBurst(weaponUsed, angle, playerHead);
                break;
            case 'full_auto':
            case 'semi_auto':
            default:
                this.createProjectile(weaponUsed, angle, playerHead);
                break;
        }

        // Switch to sidearm if current weapon is out of ammo
        if (weaponUsed.currentAmmo <= 0 && weaponUsed.type !== 'sidearm') {
            this.switchToWeapon('sidearm');
        }
    }

    handleSequentialBurst(weapon, angle, playerHead) {
        const now = Date.now();

        if (!weapon.burstState.inBurst) {
            // Start new burst
            weapon.burstState.inBurst = true;
            weapon.burstState.shotsInBurst = 0;
        }

        // Fire shot
        this.createProjectile(weapon, angle, playerHead);
        weapon.burstState.shotsInBurst++;
        weapon.burstState.lastBurstShotTime = now;

        // Check if burst is complete
        if (weapon.burstState.shotsInBurst >= (weapon.config.burstCount || 3)) {
            weapon.burstState.inBurst = false;
            weapon.burstState.shotsInBurst = 0;
            weapon.burstState.burstCooldownStart = now;
        }
    }

    handleSpreadBurst(weapon, angle, playerHead) {
        const burstCount = weapon.config.burstCount || 3;
        const spreadAngle = weapon.config.spreadAngle || 0.3;

        // Fire multiple projectiles at once with spread
        for (let i = 0; i < burstCount; i++) {
            const offset = (i - Math.floor(burstCount / 2)) * spreadAngle;
            const shotAngle = angle + offset;
            this.createProjectile(weapon, shotAngle, playerHead);
        }
    }

    createProjectile(weapon, angle, playerHead) {
        // Use ammo from weapon
        if (!weapon.shoot()) return;

        // Create projectile with enhanced properties
        const projectile = {
            x: playerHead.x,
            y: playerHead.y,
            vx: Math.cos(angle) * weapon.projectileSpeed,
            vy: Math.sin(angle) * weapon.projectileSpeed,
            type: weapon.type,
            damage: weapon.damage,
            owner: this.player, // Add owner for friendly fire prevention
            // Enhanced animation properties
            angle: angle,
            creationTime: Date.now(),
            trail: [], // For trail effects
            animationOffset: Math.random() * Math.PI * 2,
            // Tracer round properties for minigun
            isTracer: weapon.config.tracerRounds || false
        };

        // Add projectile to game
        if (!this.projectiles) this.projectiles = [];
        this.projectiles.push(projectile);
    }

    handleFullAutoFiring() {
        // Only fire if mouse is held down and we have a weapon
        if (!this.mouseHeld || !this.currentWeapon || this.gameMode !== 'warfare') return;

        const firingMode = this.currentWeapon.config.firingMode || 'semi_auto';

        // Only handle full auto weapons here
        if (firingMode === 'full_auto' && this.currentWeapon.canShoot()) {
            this.shoot();
        }
    }

    update() {
        if (!this.gameRunning) return;

        // Handle full auto firing
        this.handleFullAutoFiring();

        // Update player
        this.updatePlayer();

        // Update remote players (multiplayer)
        this.updateRemotePlayers();

        // Update glow orbs
        this.updateGlowOrbs();

        // Check collisions
        this.checkCollisions();

        // Update camera
        this.updateCamera();

        // Update king status
        this.updateKing();

        // Update coins (gambling mechanics in both modes)
        this.updateCoins();

        // Update UI
        this.updateGameState();

        // Warfare mode updates
        if (this.gameMode === 'warfare') {
            // Update weapons
            this.weapons = this.weapons.filter(weapon => !weapon.collected);

            // Generate new weapons if needed
            while (this.weapons.length < 5) {
                const x = Math.random() * this.worldWidth;
                const y = Math.random() * this.worldHeight;
                this.weapons.push(new Weapon(x, y));
            }

            // Update ammo
            this.ammo = this.ammo.filter(ammo => !ammo.collected);

            // Generate new ammo if needed
            while (this.ammo.length < 15) {
                const x = Math.random() * this.worldWidth;
                const y = Math.random() * this.worldHeight;
                this.ammo.push(new Ammo(x, y));
            }

            // Update powerups
            this.powerups = this.powerups.filter(powerup => !powerup.collected);

            // Generate new powerups if needed
            while (this.powerups.length < 8) {
                const x = Math.random() * this.worldWidth;
                const y = Math.random() * this.worldHeight;
                this.powerups.push(new Powerup(x, y));
            }

            // Update powerup animations
            this.powerups.forEach(powerup => {
                if (!powerup.collected) {
                    powerup.update();
                }
            });

            // Check weapon collisions (all snakes in warfare mode)
            if (this.gameMode === 'warfare') {
                const allSnakes = [this.player, ...this.aiSnakes].filter(s => s.alive);

                this.weapons.forEach(weapon => {
                    if (!weapon.collected) {
                        allSnakes.forEach(snake => {
                            const dx = snake.segments[0].x - weapon.x;
                            const dy = snake.segments[0].y - weapon.y;
                            const distance = Math.sqrt(dx * dx + dy * dy);

                            if (distance < snake.size + weapon.size) {
                                weapon.collected = true;
                                if (snake.isPlayer) {
                                    this.addWeaponToInventory(weapon);
                                } else {
                                    snake.addWeaponToInventory(weapon);
                                }
                            }
                        });
                    }
                });

                // Check ammo collisions (all snakes in warfare mode)
                this.ammo.forEach(ammoItem => {
                    if (!ammoItem.collected) {
                        allSnakes.forEach(snake => {
                            const dx = snake.segments[0].x - ammoItem.x;
                            const dy = snake.segments[0].y - ammoItem.y;
                            const distance = Math.sqrt(dx * dx + dy * dy);

                            if (distance < snake.size + ammoItem.size) {
                                ammoItem.collected = true;

                                if (snake.isPlayer) {
                                    // Add ammo to player inventory
                                    this.ammoInventory[ammoItem.type] = (this.ammoInventory[ammoItem.type] || 0) + ammoItem.amount;
                                    this.reloadWeaponsFromInventory();
                                } else {
                                    // Add ammo to AI inventory
                                    snake.ammoInventory[ammoItem.type] = (snake.ammoInventory[ammoItem.type] || 0) + ammoItem.amount;
                                    this.reloadAIWeaponsFromInventory(snake);
                                }
                            }
                        });
                    }
                });

                // Check powerup collisions (all snakes in warfare mode)
                this.powerups.forEach(powerupItem => {
                    if (!powerupItem.collected) {
                        allSnakes.forEach(snake => {
                            const dx = snake.segments[0].x - powerupItem.x;
                            const dy = snake.segments[0].y - powerupItem.y;
                            const distance = Math.sqrt(dx * dx + dy * dy);

                            if (distance < snake.size + powerupItem.size) {
                                powerupItem.collected = true;

                                // Add powerup to snake's inventory
                                snake.addPowerup(powerupItem);

                                // For player, automatically activate defensive powerups
                                if (snake.isPlayer && powerupItem.powerupType === 'defensive') {
                                    snake.activatePowerup(powerupItem.type);
                                }
                                // For AI, activate powerups based on situation
                                else if (!snake.isPlayer) {
                                    // AI automatically activates powerups
                                    snake.activatePowerup(powerupItem.type);
                                }
                            }
                        });
                    }
                });
            }

            // Update and check projectiles
            if (this.projectiles) {
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

                    // Update position
                    projectile.x += projectile.vx;
                    projectile.y += projectile.vy;

                    // Check if projectile is out of bounds
                    if (projectile.x < 0 || projectile.x > this.worldWidth ||
                        projectile.y < 0 || projectile.y > this.worldHeight) {
                        return false;
                    }

                    // Check collisions with snakes
                    const allSnakes = [this.player, ...this.aiSnakes].filter(s => s.alive);
                    for (const snake of allSnakes) {
                        // Skip collision with projectile owner (no friendly fire)
                        if (snake === projectile.owner) {
                            continue;
                        }

                        // Check if snake is invincible
                        if (snake.isInvincible()) {
                            console.log('Projectile hit invincible snake, no damage dealt');
                            continue; // Skip damage for invincible snakes
                        }

                        // Check head collision (instant kill with protection check)
                        const headDx = snake.segments[0].x - projectile.x;
                        const headDy = snake.segments[0].y - projectile.y;
                        const headDist = Math.sqrt(headDx * headDx + headDy * headDy);

                        if (headDist < snake.size) {
                            // Check for helmet protection first
                            const helmetDamageResult = snake.damageHelmet(projectile.damage * 25);

                            if (helmetDamageResult !== null) {
                                // Helmet absorbed the damage
                                if (helmetDamageResult) {
                                    // Helmet was destroyed, show visual effect
                                    console.log("Helmet destroyed!");
                                }
                                return false; // Projectile absorbed by helmet
                            }

                            // No helmet or helmet destroyed, check other head protection
                            const headProtection = snake.getHeadProtection();
                            const survives = Math.random() < headProtection;

                            if (survives) {
                                // Snake survives headshot due to protection
                                // Apply reduced damage to head segment instead
                                const reducedDamage = projectile.damage * 10; // Much less than normal segment damage
                                snake.segments[0].health -= reducedDamage;

                                if (snake.segments[0].health <= 0) {
                                    // Head destroyed despite protection
                                    this.convertSnakeToCoins(snake);
                                    snake.alive = false;
                                    if (snake.isPlayer) {
                                        this.gameOver();
                                    }
                                }
                                return false;
                            } else {
                                // Normal headshot - convert entire snake to coins
                                this.convertSnakeToCoins(snake);
                                snake.alive = false;

                                // Check if player died for game over
                                if (snake.isPlayer) {
                                    this.gameOver(); // Call gameOver() method to show game over screen
                                }

                                return false;
                            }
                        }

                        // Check body collision (segment damage system)
                        let hitSegment = false;
                        for (let i = 1; i < snake.segments.length; i++) {
                            const segment = snake.segments[i];
                            const dx = segment.x - projectile.x;
                            const dy = segment.y - projectile.y;
                            const dist = Math.sqrt(dx * dx + dy * dy);

                            if (dist < snake.size) {
                                // Apply damage reduction from defensive powerups
                                const damageReduction = snake.getDamageReduction();
                                const baseDamage = projectile.damage * 25; // Scale damage for health system
                                const finalDamage = baseDamage * (1 - damageReduction);

                                segment.health -= finalDamage;

                                // If segment health reaches 0, break it off
                                if (segment.health <= 0) {
                                    this.breakOffSegments(snake, i, projectile.owner);
                                }

                                hitSegment = true;
                                break;
                            }
                        }
                        if (hitSegment) return false;
                    }

                    return true;
                });
            }

            // Weapon UI will be updated through React state callback
        }
    }

    updatePlayer() {
        if (!this.player.alive) return;

        // Calculate target direction based on mouse position
        const worldMouseX = this.mouse.x + this.camera.x;
        const worldMouseY = this.mouse.y + this.camera.y;

        const dx = worldMouseX - this.player.x;
        const dy = worldMouseY - this.player.y;
        const angle = Math.atan2(dy, dx);

        this.player.targetAngle = angle;
        this.player.update(this.boosting);
    }

    updateAISnake(snake) {
        if (!snake.alive) return;

        if (this.gameMode === 'warfare') {
            this.updateWarfareAI(snake);
        } else {
            this.updateClassicAI(snake);
        }
    }

    updateClassicAI(snake) {
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

        // Find nearest food (lower priority than coins)
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

        // Find nearest glow orbs (for boost)
        if (targetType === 'none') {
            this.glowOrbs.forEach(orb => {
                const dist = Math.hypot(orb.x - snake.x, orb.y - snake.y);
                if (dist < minDist && dist < 180) {
                    minDist = dist;
                    targetX = orb.x;
                    targetY = orb.y;
                    targetType = 'orb';
                }
            });
        }

        // Check for threats (other snakes including player)
        const threats = [this.player, ...this.aiSnakes].filter(s => s !== snake && s.alive);
        threats.forEach(threat => {
            const dist = Math.hypot(threat.x - snake.x, threat.y - snake.y);
            if (dist < 80) {
                // Move away from threat
                targetX = snake.x - (threat.x - snake.x);
                targetY = snake.y - (threat.y - snake.y);
                targetType = 'flee';
            }
        });

        // Calculate direction
        const dx = targetX - snake.x;
        const dy = targetY - snake.y;
        if (Math.hypot(dx, dy) > 0) {
            snake.targetAngle = Math.atan2(dy, dx);
        } else {
            // Random movement if no target
            snake.targetAngle += (Math.random() - 0.5) * 0.3;
        }

        // Boost when chasing coins or fleeing
        const shouldBoost = (targetType === 'coin' || targetType === 'flee') && snake.boost > 30;
        snake.update(shouldBoost);
    }

    updateWarfareAI(snake) {
        const now = Date.now();

        // Decision making frequency (AI thinks every 100-300ms based on personality)
        if (now - snake.lastDecisionTime < snake.reactionTime) {
            snake.update(snake.shouldBoost);
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
                this.projectiles.push(projectile);
            }
        }

        // Handle weapon switching
        if (action.switchWeapon) {
            this.handleAIWeaponSwitch(snake, situation);
        }

        // Update snake with boost decision
        snake.shouldBoost = action.boost;
        snake.update(action.boost);
    }

    // AI Situation Assessment
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

        const allEnemies = [this.player, ...this.aiSnakes].filter(s => s !== snake && s.alive);
        const detectionRange = 300;

        // Scan for enemies
        allEnemies.forEach(enemy => {
            const dist = Math.hypot(enemy.x - snake.x, enemy.y - snake.y);
            if (dist < detectionRange) {
                const threat = {
                    snake: enemy,
                    distance: dist,
                    angle: Math.atan2(enemy.y - snake.y, enemy.x - snake.x),
                    size: enemy.segments.length,
                    hasWeapon: enemy.currentWeapon && enemy.currentWeapon.type !== 'sidearm',
                    threatScore: this.calculateThreatScore(snake, enemy, dist)
                };
                situation.nearbyEnemies.push(threat);
                situation.threatLevel += threat.threatScore;
            }
        });

        // Scan for weapons
        this.weapons.forEach(weapon => {
            if (!weapon.collected) {
                const dist = Math.hypot(weapon.x - snake.x, weapon.y - snake.y);
                if (dist < detectionRange) {
                    situation.nearbyWeapons.push({
                        weapon: weapon,
                        distance: dist,
                        angle: Math.atan2(weapon.y - snake.y, weapon.x - snake.x),
                        priority: this.calculateWeaponPriority(snake, weapon)
                    });
                }
            }
        });

        // Scan for ammo
        this.ammo.forEach(ammoItem => {
            if (!ammoItem.collected) {
                const dist = Math.hypot(ammoItem.x - snake.x, ammoItem.y - snake.y);
                if (dist < detectionRange) {
                    situation.nearbyAmmo.push({
                        ammo: ammoItem,
                        distance: dist,
                        angle: Math.atan2(ammoItem.y - snake.y, ammoItem.x - snake.x),
                        needed: this.isAmmoNeeded(snake, ammoItem.type)
                    });
                }
            }
        });

        // Scan for food and orbs
        this.food.forEach(food => {
            const dist = Math.hypot(food.x - snake.x, food.y - snake.y);
            if (dist < 200) {
                situation.nearbyFood.push({
                    food: food,
                    distance: dist,
                    angle: Math.atan2(food.y - snake.y, food.x - snake.x)
                });
            }
        });

        this.glowOrbs.forEach(orb => {
            const dist = Math.hypot(orb.x - snake.x, orb.y - snake.y);
            if (dist < detectionRange) {
                situation.nearbyOrbs.push({
                    orb: orb,
                    distance: dist,
                    angle: Math.atan2(orb.y - snake.y, orb.x - snake.x),
                    priority: 10 // High priority for boost refill
                });
                situation.opportunityLevel += 5;
            }
        });

        // Scan for coins (high priority for cash)
        if (this.coins) {
            this.coins.forEach(coin => {
                if (coin.collected) return;
                const dist = Math.hypot(coin.x - snake.x, coin.y - snake.y);
                if (dist < detectionRange) {
                    situation.nearbyCoins.push({
                        coin: coin,
                        distance: dist,
                        angle: Math.atan2(coin.y - snake.y, coin.x - snake.x),
                        priority: 15, // Very high priority for cash
                        value: coin.value
                    });
                    situation.opportunityLevel += 8; // High opportunity value
                }
            });
        }

        // Scan for incoming projectiles
        if (this.projectiles) {
            this.projectiles.forEach(projectile => {
                if (projectile.owner !== snake) {
                    const dist = Math.hypot(projectile.x - snake.x, projectile.y - snake.y);
                    const projectileAngle = Math.atan2(projectile.vy, projectile.vx);
                    const toSnakeAngle = Math.atan2(snake.y - projectile.y, snake.x - projectile.x);
                    const angleDiff = Math.abs(projectileAngle - toSnakeAngle);

                    if (dist < 150 && angleDiff < 0.5) {
                        situation.incomingProjectiles.push({
                            projectile: projectile,
                            distance: dist,
                            timeToImpact: dist / Math.hypot(projectile.vx, projectile.vy),
                            dangerLevel: projectile.damage / Math.max(dist, 1)
                        });
                    }
                }
            });
        }

        return situation;
    }

    updateGlowOrbs() {
        this.glowOrbs.forEach(orb => {
            orb.x += orb.vx;
            orb.y += orb.vy;

            // Bounce off world boundaries
            if (orb.x < 0 || orb.x > this.worldWidth) orb.vx *= -1;
            if (orb.y < 0 || orb.y > this.worldHeight) orb.vy *= -1;

            orb.x = Math.max(0, Math.min(this.worldWidth, orb.x));
            orb.y = Math.max(0, Math.min(this.worldHeight, orb.y));

            orb.glow = (orb.glow + 0.1) % (Math.PI * 2);
        });
    }

    convertSnakeToFood(snake) {
        // Convert each segment of the dead snake into food
        snake.segments.forEach((segment, index) => {
            // Skip the head (index 0) to avoid too much food
            if (index > 0) {
                this.food.push({
                    x: segment.x + (Math.random() - 0.5) * 20, // Add some spread
                    y: segment.y + (Math.random() - 0.5) * 20,
                    color: snake.isPlayer ? '#FFD700' : '#FF6B6B', // Gold for player, red for AI
                    size: 8 + Math.random() * 4,
                    value: 2 // Higher value than normal food
                });
            }
        });
    }

    convertSnakeToCoins(snake) {
        // Get the snake's actual cash balance at the moment of death
        const totalCashValue = snake.isPlayer ?
            this.cashBalance :
            (snake.collectedCash || 0);

        // Reduce snake's cash balance to zero (they lost everything)
        if (snake.isPlayer) {
            this.cashBalance = 0; // Player loses all cash on death
            // In warfare mode, score equals cash; in classic mode, keep them separate
            if (this.gameMode === 'warfare') {
                this.score = this.cashBalance;
            }
        } else {
            snake.collectedCash = 0; // AI loses all cash on death
        }

        // Calculate total number of coins to create
        const totalCoins = snake.segments.length * 4; // 4 coins per segment for good distribution
        const valuePerCoin = Math.max(1, Math.floor(totalCashValue / totalCoins)); // Minimum $1 per coin

        snake.segments.forEach((segment) => {
            // Create multiple coins per segment for better collection
            const coinsPerSegment = 4; // Consistent number of coins per segment
            for (let i = 0; i < coinsPerSegment; i++) {
                this.coins.push({
                    x: segment.x + (Math.random() - 0.5) * 40,
                    y: segment.y + (Math.random() - 0.5) * 40,
                    value: valuePerCoin,
                    size: 8 + Math.random() * 4,
                    color: '#FFD700', // Gold color for coins
                    collected: false,
                    bobPhase: Math.random() * Math.PI * 2,
                    sparklePhase: Math.random() * Math.PI * 2,
                    creationTime: Date.now()
                });
            }
        });

        console.log(`Snake died with $${totalCashValue} cash, created ${totalCoins} coins worth $${valuePerCoin} each (total: $${totalCoins * valuePerCoin})`);
    }

    breakOffSegments(snake, segmentIndex, attacker) {
        // Calculate cash value of broken segments
        const brokenSegments = snake.segments.splice(segmentIndex);
        const segmentValue = this.calculateSegmentValue(snake);

        // Calculate total value lost
        const totalValueLost = segmentValue * brokenSegments.length;

        // Reduce snake's cash balance based on lost segments
        if (snake.isPlayer) {
            this.cashBalance = Math.max(0, this.cashBalance - totalValueLost);
            this.score = this.cashBalance; // Keep score in sync
        } else {
            snake.collectedCash = Math.max(0, (snake.collectedCash || 0) - totalValueLost);
        }

        // Create coins from broken segments
        brokenSegments.forEach((segment, index) => {
            // Create multiple coins per segment for better collection
            for (let i = 0; i < 3; i++) {
                this.coins.push({
                    x: segment.x + (Math.random() - 0.5) * 30,
                    y: segment.y + (Math.random() - 0.5) * 30,
                    value: Math.floor(segmentValue / 3), // Divide value among coins
                    size: 8 + Math.random() * 4,
                    color: '#FFD700', // Gold color for coins
                    collected: false,
                    bobPhase: Math.random() * Math.PI * 2,
                    sparklePhase: Math.random() * Math.PI * 2,
                    creationTime: Date.now()
                });
            }
        });

        // Update snake's cash value
        this.updateSnakeCashValue(snake);
    }

    calculateSegmentValue(snake) {
        // Base value per segment based on wager
        const baseValue = Math.max(snake.wager || 10, 10); // Minimum $10 per segment
        return Math.floor(baseValue / 10); // $1 per segment for $10 wager, etc.
    }

    updateSnakeCashValue(snake) {
        // Recalculate total cash value based on remaining segments
        const segmentValue = this.calculateSegmentValue(snake);
        snake.cashValue = snake.segments.length * segmentValue;
    }

    updateCoins() {
        // Remove old coins (after 30 seconds)
        const now = Date.now();
        this.coins = this.coins.filter(coin => !coin.collected && (now - coin.creationTime) < 30000);

        // Check coin collisions with all snakes
        const allSnakes = [this.player, ...this.aiSnakes].filter(s => s.alive);

        this.coins.forEach(coin => {
            if (coin.collected) return;

            allSnakes.forEach(snake => {
                const dx = snake.segments[0].x - coin.x;
                const dy = snake.segments[0].y - coin.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < snake.size + coin.size) {
                    coin.collected = true;

                    // Add cash to snake
                    if (snake.isPlayer) {
                        this.cashBalance += coin.value;
                        // In warfare mode, score equals cash; in classic mode, keep them separate
                        if (this.gameMode === 'warfare') {
                            this.score = this.cashBalance;
                        }
                    } else {
                        // AI snakes collect cash too (for future features)
                        snake.collectedCash = (snake.collectedCash || 0) + coin.value;
                    }
                }
            });
        });
    }

    // AI Helper Methods
    calculateThreatScore(snake, enemy, distance) {
        let score = 0;

        // Base threat from size difference
        const sizeDiff = enemy.segments.length - snake.segments.length;
        score += sizeDiff * 0.5;

        // Weapon threat
        if (enemy.currentWeapon && enemy.currentWeapon.type !== 'sidearm') {
            score += enemy.currentWeapon.tier * 2;
        }

        // Distance factor (closer = more threatening)
        score += (300 - distance) / 100;

        // Player is always more threatening
        if (enemy.isPlayer) {
            score += 3;
        }

        return Math.max(0, score);
    }

    calculateWeaponPriority(snake, weapon) {
        let priority = weapon.tier;

        // Prefer weapons that match AI personality
        if (snake.weaponPreference === weapon.type || snake.weaponPreference === 'balanced') {
            priority += 2;
        }

        // Higher priority if current weapon is weak
        if (!snake.currentWeapon || snake.currentWeapon.type === 'sidearm') {
            priority += 3;
        }

        return priority;
    }

    isAmmoNeeded(snake, ammoType) {
        if (!snake.ammoInventory) return false;

        // Check if any weapon uses this ammo type
        const weapons = [snake.weaponInventory?.primaryWeapon, snake.weaponInventory?.secondaryWeapon];
        return weapons.some(weapon => weapon && weapon.ammoTypes.includes(ammoType) && weapon.currentAmmo < weapon.maxAmmo);
    }

    updateAICombatState(snake, situation) {
        const now = Date.now();
        const timeSinceStateChange = now - snake.lastStateChange;

        // State transition logic based on situation
        switch (snake.combatState) {
            case 'hunting':
                if (situation.threatLevel > 5) {
                    snake.combatState = 'engaging';
                    snake.lastStateChange = now;
                } else if (situation.nearbyWeapons.length > 0 || situation.nearbyAmmo.length > 0) {
                    snake.combatState = 'collecting';
                    snake.lastStateChange = now;
                }
                break;

            case 'engaging':
                if (situation.threatLevel < 2 && timeSinceStateChange > 3000) {
                    snake.combatState = 'hunting';
                    snake.lastStateChange = now;
                } else if (snake.boost < 30 || (snake.currentWeapon && snake.currentWeapon.currentAmmo < 3)) {
                    snake.combatState = 'retreating';
                    snake.lastStateChange = now;
                }
                break;

            case 'retreating':
                if (situation.threatLevel < 1 && timeSinceStateChange > 2000) {
                    snake.combatState = 'collecting';
                    snake.lastStateChange = now;
                }
                break;

            case 'collecting':
                if (situation.threatLevel > 3) {
                    snake.combatState = 'engaging';
                    snake.lastStateChange = now;
                } else if (timeSinceStateChange > 5000) {
                    snake.combatState = 'hunting';
                    snake.lastStateChange = now;
                }
                break;
        }
    }

    executeAIBehavior(snake, situation) {
        const action = {
            targetX: snake.x,
            targetY: snake.y,
            shoot: false,
            shootTarget: null,
            boost: false,
            switchWeapon: false
        };

        switch (snake.combatState) {
            case 'hunting':
                return this.executeHuntingBehavior(snake, situation, action);
            case 'engaging':
                return this.executeEngagingBehavior(snake, situation, action);
            case 'retreating':
                return this.executeRetreatingBehavior(snake, situation, action);
            case 'collecting':
                return this.executeCollectingBehavior(snake, situation, action);
        }

        return action;
    }

    executeHuntingBehavior(snake, situation, action) {
        // Priority: Find enemies to engage or resources to collect

        // Look for enemies to hunt
        if (situation.nearbyEnemies.length > 0) {
            const target = situation.nearbyEnemies
                .filter(e => e.distance < 300) // Reasonable hunting range
                .sort((a, b) => a.threatScore - b.threatScore)[0]; // Target weakest enemy

            if (target) {
                action.targetX = target.snake.x;
                action.targetY = target.snake.y;
                action.boost = target.distance > 100 && snake.boost > 50;

                // Shoot if in range and have weapon (including sidearm) and not invincible
                if (target.distance < 250 && snake.currentWeapon && !snake.isInvincible()) {
                    action.shoot = true;
                    action.shootTarget = { x: target.snake.x, y: target.snake.y };
                }
            }
        }
        // Look for coins (valuable cash)
        else if (situation.nearbyCoins.length > 0) {
            const coin = situation.nearbyCoins.sort((a, b) => {
                const ratioA = a.value / Math.max(a.distance, 1);
                const ratioB = b.value / Math.max(b.distance, 1);
                return ratioB - ratioA;
            })[0];
            action.targetX = coin.coin.x;
            action.targetY = coin.coin.y;
            action.boost = coin.distance > 60 && snake.boost > 30;
        }
        // Look for valuable resources
        else if (situation.nearbyOrbs.length > 0) {
            const orb = situation.nearbyOrbs.sort((a, b) => a.distance - b.distance)[0];
            action.targetX = orb.orb.x;
            action.targetY = orb.orb.y;
            action.boost = orb.distance > 80 && snake.boost > 30;
        }
        // Look for weapons if current weapon is weak
        else if (situation.nearbyWeapons.length > 0 && (!snake.currentWeapon || snake.currentWeapon.type === 'sidearm')) {
            const weapon = situation.nearbyWeapons.sort((a, b) => b.priority - a.priority)[0];
            action.targetX = weapon.weapon.x;
            action.targetY = weapon.weapon.y;
            action.boost = weapon.distance > 100;
        }
        // Patrol behavior
        else {
            const dx = snake.patrolTarget.x - snake.x;
            const dy = snake.patrolTarget.y - snake.y;
            if (Math.hypot(dx, dy) < 50) {
                // Pick new patrol target
                snake.patrolTarget = {
                    x: Math.random() * this.worldWidth,
                    y: Math.random() * this.worldHeight
                };
            }
            action.targetX = snake.patrolTarget.x;
            action.targetY = snake.patrolTarget.y;
        }

        return action;
    }

    executeEngagingBehavior(snake, situation, action) {
        // Priority: Combat with nearby enemies

        if (situation.nearbyEnemies.length > 0) {
            // Find best target based on threat and opportunity
            const target = situation.nearbyEnemies.sort((a, b) => {
                const scoreA = a.threatScore + (a.hasWeapon ? 2 : 0) - a.distance / 50;
                const scoreB = b.threatScore + (b.hasWeapon ? 2 : 0) - b.distance / 50;
                return scoreB - scoreA;
            })[0];

            // Predict enemy movement for better accuracy
            const predictedX = target.snake.x + Math.cos(target.snake.angle) * target.snake.speed * 10;
            const predictedY = target.snake.y + Math.sin(target.snake.angle) * target.snake.speed * 10;

            // Combat positioning
            if (target.distance < 80) {
                // Too close - back away while shooting
                action.targetX = snake.x - (target.snake.x - snake.x);
                action.targetY = snake.y - (target.snake.y - snake.y);
                action.boost = true;
            } else if (target.distance > 180) {
                // Too far - close distance
                action.targetX = target.snake.x;
                action.targetY = target.snake.y;
                action.boost = snake.boost > 40;
            } else {
                // Good range - strafe and shoot
                const strafeAngle = target.angle + Math.PI / 2;
                action.targetX = snake.x + Math.cos(strafeAngle) * 50;
                action.targetY = snake.y + Math.sin(strafeAngle) * 50;
            }

            // Shooting logic - increased range and more aggressive (only if not invincible)
            if (snake.canShoot() && target.distance < 300 && !snake.isInvincible()) {
                action.shoot = true;
                action.shootTarget = { x: predictedX, y: predictedY };
            }

            // Weapon switching for optimal range
            action.switchWeapon = this.shouldSwitchWeapon(snake, target.distance);
        }

        return action;
    }

    executeRetreatingBehavior(snake, situation, action) {
        // Priority: Escape from threats and find safety

        if (situation.nearbyEnemies.length > 0) {
            // Calculate escape vector away from all threats
            let escapeX = 0;
            let escapeY = 0;

            situation.nearbyEnemies.forEach(threat => {
                const weight = 1 / Math.max(threat.distance, 1);
                escapeX -= (threat.snake.x - snake.x) * weight;
                escapeY -= (threat.snake.y - snake.y) * weight;
            });

            action.targetX = snake.x + escapeX;
            action.targetY = snake.y + escapeY;
            action.boost = true; // Always boost when retreating
        }

        // Look for glow orbs for boost refill while retreating
        if (situation.nearbyOrbs.length > 0 && snake.boost < 50) {
            const orb = situation.nearbyOrbs.sort((a, b) => a.distance - b.distance)[0];
            action.targetX = orb.orb.x;
            action.targetY = orb.orb.y;
        }

        return action;
    }

    executeCollectingBehavior(snake, situation, action) {
        // Priority: Collect coins, weapons, ammo, and resources

        // Prioritize coins for cash (highest priority)
        if (situation.nearbyCoins.length > 0) {
            const coin = situation.nearbyCoins.sort((a, b) => {
                // Sort by value/distance ratio for efficiency
                const ratioA = a.value / Math.max(a.distance, 1);
                const ratioB = b.value / Math.max(b.distance, 1);
                return ratioB - ratioA;
            })[0];
            action.targetX = coin.coin.x;
            action.targetY = coin.coin.y;
            action.boost = coin.distance > 60; // Boost to get coins quickly
        }
        // Prioritize glow orbs for boost
        else if (situation.nearbyOrbs.length > 0) {
            const orb = situation.nearbyOrbs.sort((a, b) => a.distance - b.distance)[0];
            action.targetX = orb.orb.x;
            action.targetY = orb.orb.y;
            action.boost = orb.distance > 80;
        }
        // Collect weapons
        else if (situation.nearbyWeapons.length > 0) {
            const weapon = situation.nearbyWeapons.sort((a, b) => b.priority - a.priority)[0];
            action.targetX = weapon.weapon.x;
            action.targetY = weapon.weapon.y;
            action.boost = weapon.distance > 100;
        }
        // Collect needed ammo
        else if (situation.nearbyAmmo.length > 0) {
            const ammo = situation.nearbyAmmo.filter(a => a.needed).sort((a, b) => a.distance - b.distance)[0];
            if (ammo) {
                action.targetX = ammo.ammo.x;
                action.targetY = ammo.ammo.y;
                action.boost = ammo.distance > 80;
            }
        }
        // Collect food for growth
        else if (situation.nearbyFood.length > 0) {
            const food = situation.nearbyFood.sort((a, b) => a.distance - b.distance)[0];
            action.targetX = food.food.x;
            action.targetY = food.food.y;
        }

        return action;
    }

    shouldSwitchWeapon(snake, targetDistance) {
        if (!snake.weaponInventory) return false;

        const current = snake.currentWeapon;
        if (!current) return true;

        // Switch to long-range weapon for distant targets
        if (targetDistance > 150) {
            const longRange = snake.weaponInventory.primaryWeapon;
            if (longRange && longRange.type === 'rail_gun' && longRange.currentAmmo > 0) {
                return true;
            }
        }

        // Switch to close-range weapon for close targets
        if (targetDistance < 100) {
            const closeRange = snake.weaponInventory.secondaryWeapon;
            if (closeRange && (closeRange.type === 'plasma_smg' || closeRange.type === 'rocket_launcher') && closeRange.currentAmmo > 0) {
                return true;
            }
        }

        return false;
    }

    handleAIWeaponSwitch(snake, situation) {
        if (!snake.weaponInventory) return;

        // Simple weapon switching logic
        const weapons = ['primaryWeapon', 'secondaryWeapon', 'sidearm'];
        const currentIndex = weapons.indexOf(snake.weaponInventory.currentSlot);
        const nextIndex = (currentIndex + 1) % weapons.length;
        const nextSlot = weapons[nextIndex];

        if (snake.weaponInventory[nextSlot] && snake.weaponInventory[nextSlot].currentAmmo > 0) {
            snake.switchToWeapon(nextSlot);
        }
    }

    checkCollisions() {
        const allSnakes = [this.player, ...this.aiSnakes].filter(s => s.alive);

        // Check food collisions with vacuum effect
        allSnakes.forEach(snake => {
            const vacuumRadius = snake.size * 3.5; // Larger vacuum radius

            // Regular food
            for (let i = this.food.length - 1; i >= 0; i--) {
                const food = this.food[i];
                const dist = Math.hypot(food.x - snake.x, food.y - snake.y);

                // Vacuum effect - pull food toward snake
                if (dist < vacuumRadius && dist > snake.size + food.size) {
                    // Stronger pull that increases as food gets closer
                    const distanceRatio = 1 - (dist / vacuumRadius);
                    const pullStrength = 1.2 + distanceRatio * 2.0; // Much stronger pull
                    const angle = Math.atan2(snake.y - food.y, snake.x - food.x);
                    food.x += Math.cos(angle) * pullStrength;
                    food.y += Math.sin(angle) * pullStrength;
                }

                // Collect food on contact
                if (dist < snake.size + food.size) {
                    this.food.splice(i, 1);

                    if (snake === this.player) {
                        // Food gives 5% mass (growth) and 1% speed boost in both modes
                        // 5% mass = 5% of what coins give for growth
                        const coinMassValue = 10; // What coins give for mass/length
                        const foodMassValue = coinMassValue * 0.05; // 5% of coin mass value

                        // Add mass/growth (no cap on snake growth)
                        this.player.growthQueue += foodMassValue;

                        // Add 1% speed boost (remove cap when collecting food)
                        this.player.addSpeedBoost(1);

                        // Food adds to boost percentage and removes cap
                        this.player.boostCapRemoved = true; // Remove boost cap when collecting food
                        this.player.boost += 5; // Add 5% boost (no cap when collecting food)

                        // Player ate food

                        if (this.gameMode === 'warfare') {
                            this.score = this.cashBalance; // In warfare mode, score equals cash
                        }
                        this.updateGameState();
                    } else {
                        // AI snakes also get benefits from food (same as player)
                        // Food gives 5% mass (growth) and 1% speed boost in both modes
                        const coinMassValue = 10; // What coins give for mass/length
                        const foodMassValue = coinMassValue * 0.05; // 5% of coin mass value

                        // Add mass/growth (no cap on snake growth)
                        snake.growthQueue += foodMassValue;

                        // Add 1% speed boost (remove cap when collecting food)
                        snake.addSpeedBoost(1);

                        // Food adds to boost percentage and removes cap
                        snake.boostCapRemoved = true; // Remove boost cap when collecting food
                        snake.boost += 5; // Add 5% boost (no cap when collecting food)
                    }
                }
            }

            // Glow orbs
            for (let i = this.glowOrbs.length - 1; i >= 0; i--) {
                const orb = this.glowOrbs[i];
                const dist = Math.hypot(orb.x - snake.x, orb.y - snake.y);

                // Vacuum effect for glow orbs
                if (dist < vacuumRadius && dist > snake.size + orb.size) {
                    const distanceRatio = 1 - (dist / vacuumRadius);
                    const pullStrength = 0.8 + distanceRatio * 1.5; // Slightly weaker than food
                    const angle = Math.atan2(snake.y - orb.y, snake.x - orb.x);
                    orb.x += Math.cos(angle) * pullStrength;
                    orb.y += Math.sin(angle) * pullStrength;
                }

                if (dist < snake.size + orb.size) {
                    this.glowOrbs.splice(i, 1);

                    // Golden orbs add 100% boost in both modes
                    snake.boost += 100; // ADD 100% boost, don't set to 100%
                    console.log(`Golden orb collected! Boost increased by 100%, now at ${snake.boost}%`);

                    if (this.gameMode === 'classic') {
                        // Classic mode - orbs also give growth
                        for (let j = 0; j < orb.value; j++) {
                            snake.grow();
                        }
                        if (snake === this.player) {
                            this.score += orb.value * 2;
                        }
                    }

                    if (snake === this.player) {
                        this.updateGameState();
                    }

                    // Spawn new glow orb
                    const hue = Math.random() * 360;
                    this.glowOrbs.push({
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
        });

        // Check snake vs snake collisions
        allSnakes.forEach(snake => {
            allSnakes.forEach(otherSnake => {
                if (snake === otherSnake || !snake.alive || !otherSnake.alive) return;

                // Check if either snake is invincible
                if (snake.isInvincible() || otherSnake.isInvincible()) {
                    return; // Skip collision for invincible snakes
                }

                // Check if snake head hits other snake's body
                otherSnake.segments.forEach((segment, index) => {
                    if (index === 0) return; // Skip head

                    const dist = Math.hypot(segment.x - snake.x, segment.y - snake.y);
                    if (dist < snake.size + otherSnake.size - 2) {
                        // Check for battering ram collision damage (only if attacker is not invincible)
                        const batteringRamDamage = snake.getBoostDamage();
                        const isRamming = snake.boost < snake.maxBoost && batteringRamDamage > 0 && !snake.isInvincible(); // Snake is boosting and has battering ram and not invincible

                        if (isRamming) {
                            // Apply battering ram damage to the segment
                            segment.health -= batteringRamDamage;

                            if (segment.health <= 0) {
                                // Break off segments from the collision point
                                this.breakOffSegments(otherSnake, index, snake);
                                return; // Don't kill the ramming snake
                            } else {
                                // Segment damaged but not destroyed, ramming snake bounces off
                                // Apply some knockback to the ramming snake
                                const knockbackAngle = Math.atan2(snake.y - segment.y, snake.x - segment.x);
                                snake.x += Math.cos(knockbackAngle) * 20;
                                snake.y += Math.sin(knockbackAngle) * 20;
                                return; // Don't kill the ramming snake
                            }
                        }

                        // Normal collision - snake dies (only if attacker is not invincible)
                        if (!snake.isInvincible()) {
                            snake.alive = false;

                            // Convert dead snake to coins (gambling mechanics in both modes)
                            this.convertSnakeToCoins(snake);

                            // Check if player died for game over
                            if (snake.isPlayer) {
                                console.log('Player died from collision, calling gameOver()');
                                this.gameOver();
                                return; // Exit early to prevent further processing
                            } else {
                                // Respawn AI snake
                                setTimeout(() => {
                                    const x = Math.random() * this.worldWidth;
                                    const y = Math.random() * this.worldHeight;
                                    const colors = ['#ff0080', '#00ff41', '#00ffff', '#ff8000', '#8000ff', '#ffff00', '#ff4444', '#44ff44', '#4444ff'];
                                    const color = colors[Math.floor(Math.random() * colors.length)];
                                    const newSnake = new Snake(x, y, color, false);
                                    newSnake.gameInstance = this; // Set game reference

                                    // Set random wager for respawned AI snakes in both modes (gambling mechanics in both)
                                    newSnake.wager = this.availableWagers[Math.floor(Math.random() * this.availableWagers.length)];
                                    // Give AI starting cash equal to their wager
                                    newSnake.collectedCash = newSnake.wager;
                                    this.updateSnakeCashValue(newSnake);

                                    // Activate spawn invincibility for respawned AI snake
                                    newSnake.activateSpawnInvincibility(newSnake.wager);

                                    const index = this.aiSnakes.indexOf(snake);
                                    if (index !== -1) {
                                        this.aiSnakes[index] = newSnake;
                                        console.log(`Respawned AI snake: ${newSnake.aiPersonality?.name || 'Classic'} at (${Math.round(x)}, ${Math.round(y)}) with wager $${newSnake.wager || 0}`);
                                    }
                                }, 3000);
                            }
                        }
                    }
                });
            });
        });

        // Respawn food if needed - more food in warfare mode
        const maxFood = this.gameMode === 'warfare' ? 800 : 400; // Double food in warfare mode
        const spawnAmount = this.gameMode === 'warfare' ? 100 : 50; // Spawn more at once in warfare mode

        if (this.food.length < maxFood) {
            for (let i = 0; i < spawnAmount; i++) {
                this.food.push({
                    x: Math.random() * this.worldWidth,
                    y: Math.random() * this.worldHeight,
                    color: `hsl(${Math.random() * 360}, 70%, 60%)`,
                    size: 4 + Math.random() * 3
                });
            }
        }
    }

    gameOver() {
        console.log('💀💀💀 GAME OVER METHOD CALLED 💀💀💀');
        this.gameRunning = false;

        // Ensure player is marked as dead
        if (this.player) {
            this.player.alive = false;
        }

        // Create proper game over state
        const gameOverState = {
            score: this.gameMode === 'warfare' ? this.cashBalance : this.score,
            cashBalance: this.cashBalance,
            length: this.player ? this.player.segments.length : 0,
            boost: this.player ? this.player.boost : 0,
            weapon: this.currentWeapon ? this.currentWeapon.name : 'None',
            cooldown: 'Ready',
            isGameOver: true,
            finalScore: this.gameMode === 'warfare' ? this.cashBalance : this.score,
            finalLength: this.player ? this.player.segments.length : 0,
            gameMode: this.gameMode,
            cashedOut: this.cashedOut || false,
            spectating: this.spectating || false
        };

        console.log('Game over state:', gameOverState);

        // Call the game over callback if it exists
        if (this.onGameOver) {
            console.log('Calling onGameOver callback');
            this.onGameOver(gameOverState);
        } else {
            console.log('No onGameOver callback found');
        }

        // Also update the regular game state
        if (this.onStateUpdate) {
            console.log('Calling onStateUpdate with game over state');
            this.onStateUpdate(gameOverState);
        } else {
            console.log('No onStateUpdate callback found');
        }
    }



    updateCamera() {
        let targetX, targetY;

        if (this.spectating) {
            // Follow spectated snake
            const aliveSnakes = this.aiSnakes.filter(snake => snake.alive);
            if (aliveSnakes.length > 0) {
                const spectatedSnake = aliveSnakes[this.spectateTarget % aliveSnakes.length];
                targetX = spectatedSnake.x - this.canvas.width / 2;
                targetY = spectatedSnake.y - this.canvas.height / 2;
            } else {
                // No snakes left to spectate, keep current camera position
                return;
            }
        } else if (this.player && this.player.alive) {
            // Follow the player
            targetX = this.player.x - this.canvas.width / 2;
            targetY = this.player.y - this.canvas.height / 2;
        } else {
            // Player is dead but not spectating, keep current camera position
            return;
        }

        // Smooth camera movement
        this.camera.x += (targetX - this.camera.x) * 0.1;
        this.camera.y += (targetY - this.camera.y) * 0.1;

        // Keep camera within world bounds
        this.camera.x = Math.max(0, Math.min(this.worldWidth - this.canvas.width, this.camera.x));
        this.camera.y = Math.max(0, Math.min(this.worldHeight - this.canvas.height, this.camera.y));
    }

    updateKing() {
        // Find the snake with the highest balance
        const allSnakes = [this.player, ...this.aiSnakes].filter(snake => snake.alive);

        if (allSnakes.length === 0) return;

        let newKing = allSnakes[0];
        let highestBalance = this.player.isPlayer ? this.cashBalance : (allSnakes[0].collectedCash || 0);

        allSnakes.forEach(snake => {
            const balance = snake.isPlayer ? this.cashBalance : (snake.collectedCash || 0);
            if (balance > highestBalance) {
                highestBalance = balance;
                newKing = snake;
            }
        });

        // Only update if king changed or if there's no current king
        if (this.currentKing !== newKing) {
            this.currentKing = newKing;
            console.log(`New king: ${newKing.isPlayer ? 'Player' : 'AI'} with balance $${highestBalance}`);
        }
    }



    render() {
        // Debug logging
        if (Math.random() < 0.01) { // Log occasionally to avoid spam
            console.log('Rendering frame, canvas size:', this.canvas.width, 'x', this.canvas.height);
        }

        // Clear main canvas
        this.ctx.fillStyle = '#0a0a0a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw grid
        this.drawGrid();

        // Draw food
        this.drawFood();

        // Draw glow orbs
        this.drawGlowOrbs();

        // Draw snakes
        this.drawSnakes();

        // Draw warfare mode elements
        if (this.gameMode === 'warfare') {
            this.drawWeapons();
            this.drawAmmo();
            this.drawPowerups();
            this.drawProjectiles();
        }

        // Draw coins in both modes (gambling mechanics in both)
        this.drawCoins();

        // Draw king indicator
        this.drawKingIndicator();

        // Draw debug info
        this.drawDebugInfo();

        // Draw minimap
        this.drawMinimap();
    }

    drawWeapons() {
        this.weapons.forEach(weapon => {
            if (!weapon.collected) {
                weapon.draw(this.ctx, this.camera.x, this.camera.y);
            }
        });
    }

    drawAmmo() {
        this.ammo.forEach(ammoItem => {
            if (!ammoItem.collected) {
                ammoItem.draw(this.ctx, this.camera.x, this.camera.y);
            }
        });
    }

    drawPowerups() {
        this.powerups.forEach(powerupItem => {
            if (!powerupItem.collected) {
                powerupItem.draw(this.ctx, this.camera.x, this.camera.y);
            }
        });
    }

    drawCoins() {
        if (!this.coins) return;

        const time = Date.now() * 0.001;

        this.coins.forEach(coin => {
            if (coin.collected) return;

            const x = coin.x - this.camera.x;
            const y = coin.y - this.camera.y;

            // Skip if off-screen
            if (x < -50 || x > this.canvas.width + 50 || y < -50 || y > this.canvas.height + 50) {
                return;
            }

            // Bobbing animation
            const bobOffset = Math.sin(time * 3 + coin.bobPhase) * 3;
            const finalY = y + bobOffset;

            // Sparkle animation
            const sparkleIntensity = Math.sin(time * 4 + coin.sparklePhase) * 0.5 + 0.5;

            // Draw coin glow
            const glowSize = coin.size * (2 + sparkleIntensity * 0.5);
            const glowGradient = this.ctx.createRadialGradient(x, finalY, 0, x, finalY, glowSize);
            glowGradient.addColorStop(0, '#FFD700');
            glowGradient.addColorStop(0.5, 'rgba(255, 215, 0, 0.6)');
            glowGradient.addColorStop(1, 'transparent');

            this.ctx.fillStyle = glowGradient;
            this.ctx.beginPath();
            this.ctx.arc(x, finalY, glowSize, 0, Math.PI * 2);
            this.ctx.fill();

            // Draw main coin
            const coinGradient = this.ctx.createRadialGradient(
                x - coin.size * 0.3, finalY - coin.size * 0.3, 0,
                x, finalY, coin.size
            );
            coinGradient.addColorStop(0, '#FFFF80');
            coinGradient.addColorStop(0.7, '#FFD700');
            coinGradient.addColorStop(1, '#B8860B');

            this.ctx.fillStyle = coinGradient;
            this.ctx.beginPath();
            this.ctx.arc(x, finalY, coin.size, 0, Math.PI * 2);
            this.ctx.fill();

            // Draw coin outline
            this.ctx.strokeStyle = '#B8860B';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(x, finalY, coin.size, 0, Math.PI * 2);
            this.ctx.stroke();

            // Draw dollar sign
            this.ctx.fillStyle = '#8B4513';
            this.ctx.font = `${coin.size * 1.2}px bold monospace`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('$', x, finalY);

            // Draw sparkles around coin
            for (let i = 0; i < 4; i++) {
                const sparkleAngle = (time * 2 + i * Math.PI / 2) % (Math.PI * 2);
                const sparkleDistance = coin.size * 1.8;
                const sparkleX = x + Math.cos(sparkleAngle) * sparkleDistance;
                const sparkleY = finalY + Math.sin(sparkleAngle) * sparkleDistance;

                this.ctx.fillStyle = `rgba(255, 255, 255, ${sparkleIntensity})`;
                this.ctx.beginPath();
                this.ctx.arc(sparkleX, sparkleY, 1.5, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });
    }

    drawProjectiles() {
        if (!this.projectiles) return;

        this.projectiles.forEach(projectile => {
            // Validate projectile coordinates
            if (!isFinite(projectile.x) || !isFinite(projectile.y)) {
                console.warn('Invalid projectile position:', projectile.x, projectile.y);
                return;
            }

            const screenX = projectile.x - this.camera.x;
            const screenY = projectile.y - this.camera.y;

            // Validate screen coordinates
            if (!isFinite(screenX) || !isFinite(screenY)) {
                console.warn('Invalid screen coordinates:', screenX, screenY);
                return;
            }

            // Don't draw if off screen
            if (screenX < -100 || screenX > this.canvas.width + 100 ||
                screenY < -100 || screenY > this.canvas.height + 100) {
                return;
            }

            const time = Date.now() * 0.001;
            const age = (Date.now() - projectile.creationTime) * 0.001;

            // Draw projectile based on type with enhanced animations
            switch (projectile.type) {
                case 'sidearm':
                    this.drawDefaultProjectile(projectile, screenX, screenY, time, age);
                    break;
                case 'laser_pistol':
                case 'laser_rifle':
                    this.drawLaserProjectile(projectile, screenX, screenY, time, age);
                    break;
                case 'plasma_smg':
                case 'plasma_cannon':
                    this.drawPlasmaProjectile(projectile, screenX, screenY, time, age);
                    break;
                case 'rocket_launcher':
                    this.drawMissileProjectile(projectile, screenX, screenY, time, age);
                    break;
                case 'rail_gun':
                    this.drawRailGunProjectile(projectile, screenX, screenY, time, age);
                    break;
                default:
                    this.drawDefaultProjectile(projectile, screenX, screenY, time, age);
                    break;
            }
        });
    }

    drawLaserProjectile(projectile, x, y, time, age) {
        this.ctx.save();

        // Draw laser beam with glow effects
        const beamLength = 30;
        const angle = projectile.angle;

        // Multiple glow layers for intense effect
        for (let i = 0; i < 3; i++) {
            const glowSize = (3 - i) * 4;
            const alpha = 0.3 - i * 0.1;

            this.ctx.strokeStyle = `rgba(255, 68, 68, ${alpha})`;
            this.ctx.lineWidth = glowSize;
            this.ctx.lineCap = 'round';

            this.ctx.beginPath();
            this.ctx.moveTo(
                x - Math.cos(angle) * beamLength,
                y - Math.sin(angle) * beamLength
            );
            this.ctx.lineTo(
                x + Math.cos(angle) * beamLength,
                y + Math.sin(angle) * beamLength
            );
            this.ctx.stroke();
        }

        // Core beam
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(
            x - Math.cos(angle) * beamLength,
            y - Math.sin(angle) * beamLength
        );
        this.ctx.lineTo(
            x + Math.cos(angle) * beamLength,
            y + Math.sin(angle) * beamLength
        );
        this.ctx.stroke();

        // Sparks and particles
        for (let i = 0; i < 6; i++) {
            const sparkAngle = angle + (Math.random() - 0.5) * 0.5;
            const sparkDistance = 15 + Math.random() * 10;
            const sparkX = x + Math.cos(sparkAngle) * sparkDistance;
            const sparkY = y + Math.sin(sparkAngle) * sparkDistance;

            this.ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.8})`;
            this.ctx.beginPath();
            this.ctx.arc(sparkX, sparkY, 1 + Math.random() * 2, 0, Math.PI * 2);
            this.ctx.fill();
        }

        this.ctx.restore();
    }

    drawPlasmaProjectile(projectile, x, y, time, age) {
        this.ctx.save();

        const pulseSize = 12 + Math.sin(time * 8 + projectile.animationOffset) * 4;

        // Draw trail
        this.drawProjectileTrail(projectile, '#44FF44', 0.6);

        // Outer energy field
        const outerGradient = this.ctx.createRadialGradient(x, y, 0, x, y, pulseSize * 2);
        outerGradient.addColorStop(0, 'rgba(68, 255, 68, 0.4)');
        outerGradient.addColorStop(0.5, 'rgba(68, 255, 68, 0.2)');
        outerGradient.addColorStop(1, 'transparent');

        this.ctx.fillStyle = outerGradient;
        this.ctx.beginPath();
        this.ctx.arc(x, y, pulseSize * 2, 0, Math.PI * 2);
        this.ctx.fill();

        // Main plasma ball
        const plasmaGradient = this.ctx.createRadialGradient(x, y, 0, x, y, pulseSize);
        plasmaGradient.addColorStop(0, '#FFFFFF');
        plasmaGradient.addColorStop(0.3, '#44FF44');
        plasmaGradient.addColorStop(0.7, '#228822');
        plasmaGradient.addColorStop(1, 'rgba(34, 136, 34, 0.5)');

        this.ctx.fillStyle = plasmaGradient;
        this.ctx.beginPath();
        this.ctx.arc(x, y, pulseSize, 0, Math.PI * 2);
        this.ctx.fill();

        // Electric arcs
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 2;
        this.ctx.lineCap = 'round';

        for (let i = 0; i < 6; i++) {
            const arcAngle = (time * 4 + projectile.animationOffset + i * Math.PI / 3) % (Math.PI * 2);
            const arcLength = pulseSize * 1.5;
            const startX = x + Math.cos(arcAngle) * pulseSize * 0.7;
            const startY = y + Math.sin(arcAngle) * pulseSize * 0.7;
            const endX = x + Math.cos(arcAngle) * arcLength;
            const endY = y + Math.sin(arcAngle) * arcLength;

            // Zigzag effect for electric arc
            const midX = (startX + endX) / 2 + (Math.random() - 0.5) * 8;
            const midY = (startY + endY) / 2 + (Math.random() - 0.5) * 8;

            this.ctx.beginPath();
            this.ctx.moveTo(startX, startY);
            this.ctx.lineTo(midX, midY);
            this.ctx.lineTo(endX, endY);
            this.ctx.stroke();
        }

        this.ctx.restore();
    }

    drawMissileProjectile(projectile, x, y, time, age) {
        this.ctx.save();

        // Draw exhaust trail
        this.drawProjectileTrail(projectile, '#FF8844', 0.8);

        // Rotate missile to face direction of travel
        this.ctx.translate(x, y);
        this.ctx.rotate(projectile.angle);

        // Missile body
        const missileGradient = this.ctx.createLinearGradient(-8, -4, -8, 4);
        missileGradient.addColorStop(0, '#FFAA88');
        missileGradient.addColorStop(0.5, '#FF8844');
        missileGradient.addColorStop(1, '#CC6622');

        this.ctx.fillStyle = missileGradient;
        this.ctx.fillRect(-8, -3, 16, 6);

        // Missile tip
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.beginPath();
        this.ctx.moveTo(8, 0);
        this.ctx.lineTo(12, -2);
        this.ctx.lineTo(12, 2);
        this.ctx.closePath();
        this.ctx.fill();

        // Fins
        this.ctx.fillStyle = '#FF6622';
        this.ctx.beginPath();
        this.ctx.moveTo(-8, -3);
        this.ctx.lineTo(-12, -5);
        this.ctx.lineTo(-10, -2);
        this.ctx.closePath();
        this.ctx.fill();

        this.ctx.beginPath();
        this.ctx.moveTo(-8, 3);
        this.ctx.lineTo(-12, 5);
        this.ctx.lineTo(-10, 2);
        this.ctx.closePath();
        this.ctx.fill();

        // Exhaust flame
        const exhaustPulse = Math.sin(time * 12 + projectile.animationOffset) * 0.3 + 0.7;
        const flameGradient = this.ctx.createRadialGradient(-8, 0, 0, -15, 0, 8);
        flameGradient.addColorStop(0, `rgba(255, 255, 255, ${exhaustPulse})`);
        flameGradient.addColorStop(0.3, `rgba(255, 136, 68, ${exhaustPulse * 0.8})`);
        flameGradient.addColorStop(0.7, `rgba(255, 68, 68, ${exhaustPulse * 0.6})`);
        flameGradient.addColorStop(1, 'transparent');

        this.ctx.fillStyle = flameGradient;
        this.ctx.beginPath();
        this.ctx.ellipse(-12, 0, 8 * exhaustPulse, 4 * exhaustPulse, 0, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.restore();
    }

    drawRailGunProjectile(projectile, x, y, time, age) {
        this.ctx.save();

        // Draw electromagnetic trail
        this.drawProjectileTrail(projectile, '#4444FF', 0.9);

        // Rail gun projectile - high-energy electromagnetic slug
        const coreSize = 6;
        const fieldSize = 16;

        // Electromagnetic field effect
        const fieldGradient = this.ctx.createRadialGradient(x, y, 0, x, y, fieldSize);
        fieldGradient.addColorStop(0, 'rgba(68, 68, 255, 0.8)');
        fieldGradient.addColorStop(0.5, 'rgba(68, 68, 255, 0.4)');
        fieldGradient.addColorStop(1, 'transparent');

        this.ctx.fillStyle = fieldGradient;
        this.ctx.beginPath();
        this.ctx.arc(x, y, fieldSize, 0, Math.PI * 2);
        this.ctx.fill();

        // Electromagnetic field lines
        this.ctx.strokeStyle = '#8888FF';
        this.ctx.lineWidth = 1;
        for (let i = 0; i < 6; i++) {
            const angle = (time * 10 + i * Math.PI / 3) % (Math.PI * 2);
            const innerRadius = coreSize;
            const outerRadius = fieldSize * 0.8;

            this.ctx.beginPath();
            this.ctx.moveTo(
                x + Math.cos(angle) * innerRadius,
                y + Math.sin(angle) * innerRadius
            );
            this.ctx.lineTo(
                x + Math.cos(angle) * outerRadius,
                y + Math.sin(angle) * outerRadius
            );
            this.ctx.stroke();
        }

        // Core projectile
        const coreGradient = this.ctx.createRadialGradient(x, y, 0, x, y, coreSize);
        coreGradient.addColorStop(0, '#FFFFFF');
        coreGradient.addColorStop(0.7, '#AAAAFF');
        coreGradient.addColorStop(1, '#4444FF');

        this.ctx.fillStyle = coreGradient;
        this.ctx.beginPath();
        this.ctx.arc(x, y, coreSize, 0, Math.PI * 2);
        this.ctx.fill();

        // Bright core
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.beginPath();
        this.ctx.arc(x, y, coreSize * 0.4, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.restore();
    }

    drawDefaultProjectile(projectile, x, y, time, age) {
        // Check if this is a tracer round
        if (projectile.isTracer) {
            this.drawTracerRound(projectile, x, y, time, age);
            return;
        }

        // Validate coordinates to prevent canvas errors
        if (!isFinite(x) || !isFinite(y)) {
            console.warn('Invalid projectile coordinates:', x, y);
            return;
        }

        // Simple white projectile with glow
        const glowGradient = this.ctx.createRadialGradient(x, y, 0, x, y, 8);
        glowGradient.addColorStop(0, '#FFFFFF');
        glowGradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.5)');
        glowGradient.addColorStop(1, 'transparent');

        this.ctx.fillStyle = glowGradient;
        this.ctx.beginPath();
        this.ctx.arc(x, y, 8, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.beginPath();
        this.ctx.arc(x, y, 4, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawTracerRound(projectile, x, y, time, age) {
        // Validate coordinates to prevent canvas errors
        if (!isFinite(x) || !isFinite(y)) {
            console.warn('Invalid tracer coordinates:', x, y);
            return;
        }

        this.ctx.save();

        // Calculate trail length based on velocity
        const velocity = Math.hypot(projectile.vx, projectile.vy);
        const trailLength = Math.min(velocity * 2, 40); // Max trail length of 40 pixels

        // Calculate trail start position
        const angle = Math.atan2(projectile.vy, projectile.vx);
        const trailStartX = x - Math.cos(angle) * trailLength;
        const trailStartY = y - Math.sin(angle) * trailLength;

        // Draw bright yellow tracer trail
        const gradient = this.ctx.createLinearGradient(trailStartX, trailStartY, x, y);
        gradient.addColorStop(0, 'rgba(255, 255, 0, 0)'); // Transparent start
        gradient.addColorStop(0.3, 'rgba(255, 255, 0, 0.3)'); // Fading yellow
        gradient.addColorStop(0.7, 'rgba(255, 255, 0, 0.8)'); // Bright yellow
        gradient.addColorStop(1, 'rgba(255, 255, 255, 1)'); // White hot tip

        this.ctx.strokeStyle = gradient;
        this.ctx.lineWidth = 4;
        this.ctx.lineCap = 'round';

        this.ctx.beginPath();
        this.ctx.moveTo(trailStartX, trailStartY);
        this.ctx.lineTo(x, y);
        this.ctx.stroke();

        // Draw bright projectile tip
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.shadowColor = '#FFFF00';
        this.ctx.shadowBlur = 8;
        this.ctx.beginPath();
        this.ctx.arc(x, y, 2, 0, Math.PI * 2);
        this.ctx.fill();

        // Add glow effect
        this.ctx.shadowBlur = 15;
        this.ctx.fillStyle = '#FFFF00';
        this.ctx.beginPath();
        this.ctx.arc(x, y, 4, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.restore();
    }

    drawProjectileTrail(projectile, color, maxAlpha) {
        if (!projectile.trail || projectile.trail.length < 2) return;

        this.ctx.save();

        for (let i = 0; i < projectile.trail.length - 1; i++) {
            const current = projectile.trail[i];
            const next = projectile.trail[i + 1];

            const currentScreen = {
                x: current.x - this.camera.x,
                y: current.y - this.camera.y
            };
            const nextScreen = {
                x: next.x - this.camera.x,
                y: next.y - this.camera.y
            };

            const alpha = (i / projectile.trail.length) * maxAlpha;
            const width = (i / projectile.trail.length) * 6 + 1;

            this.ctx.strokeStyle = color.replace(')', `, ${alpha})`).replace('rgb', 'rgba');
            this.ctx.lineWidth = width;
            this.ctx.lineCap = 'round';

            this.ctx.beginPath();
            this.ctx.moveTo(currentScreen.x, currentScreen.y);
            this.ctx.lineTo(nextScreen.x, nextScreen.y);
            this.ctx.stroke();
        }

        this.ctx.restore();
    }

    drawGrid() {
        this.ctx.strokeStyle = '#1a1a1a';
        this.ctx.lineWidth = 1;

        const gridSize = 50;
        const startX = Math.floor(this.camera.x / gridSize) * gridSize;
        const startY = Math.floor(this.camera.y / gridSize) * gridSize;

        for (let x = startX; x < this.camera.x + this.canvas.width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x - this.camera.x, 0);
            this.ctx.lineTo(x - this.camera.x, this.canvas.height);
            this.ctx.stroke();
        }

        for (let y = startY; y < this.camera.y + this.canvas.height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y - this.camera.y);
            this.ctx.lineTo(this.canvas.width, y - this.camera.y);
            this.ctx.stroke();
        }
    }

    drawFood() {
        this.food.forEach(food => {
            const x = food.x - this.camera.x;
            const y = food.y - this.camera.y;

            if (x > -20 && x < this.canvas.width + 20 && y > -20 && y < this.canvas.height + 20) {
                // Check if food is being vacuumed
                let beingVacuumed = false;
                let closestSnake = null;
                let minDistance = Infinity;
                const allSnakes = [this.player, ...this.aiSnakes].filter(s => s.alive);

                allSnakes.forEach(snake => {
                    const dist = Math.hypot(food.x - snake.x, food.y - snake.y);
                    const vacuumRadius = snake.size * 3.5;
                    if (dist < vacuumRadius && dist > snake.size + food.size) {
                        beingVacuumed = true;
                        if (dist < minDistance) {
                            minDistance = dist;
                            closestSnake = snake;
                        }
                    }
                });

                // Draw vacuum trail if being pulled
                if (beingVacuumed && closestSnake) {
                    this.drawVacuumTrail(food, closestSnake, x, y);
                }

                // Draw enhanced vacuum effect
                if (beingVacuumed) {
                    const time = Date.now() * 0.005;
                    const pulseSize = food.size * 3 + Math.sin(time * 3) * food.size;
                    const pulseAlpha = 0.4 + Math.sin(time * 2) * 0.2;

                    const glowGradient = this.ctx.createRadialGradient(x, y, 0, x, y, pulseSize);
                    glowGradient.addColorStop(0, food.color);
                    glowGradient.addColorStop(0.3, this.addAlpha(food.color, pulseAlpha));
                    glowGradient.addColorStop(0.7, this.addAlpha('#ffffff', pulseAlpha * 0.5));
                    glowGradient.addColorStop(1, 'transparent');

                    this.ctx.fillStyle = glowGradient;
                    this.ctx.beginPath();
                    this.ctx.arc(x, y, pulseSize, 0, Math.PI * 2);
                    this.ctx.fill();

                    // Add vacuum ring indicator
                    this.ctx.strokeStyle = this.addAlpha('#ffffff', pulseAlpha);
                    this.ctx.lineWidth = 1;
                    this.ctx.setLineDash([2, 2]);
                    this.ctx.beginPath();
                    this.ctx.arc(x, y, pulseSize * 0.7, 0, Math.PI * 2);
                    this.ctx.stroke();
                    this.ctx.setLineDash([]);
                }

                // Draw regular colorful food
                const foodSize = beingVacuumed ? food.size * 1.2 : food.size;

                // Draw food with glow effect
                const glowGradient = this.ctx.createRadialGradient(x, y, 0, x, y, foodSize * 1.5);
                glowGradient.addColorStop(0, food.color);
                glowGradient.addColorStop(0.7, this.addAlpha(food.color, 0.8));
                glowGradient.addColorStop(1, 'transparent');

                this.ctx.fillStyle = glowGradient;
                this.ctx.beginPath();
                this.ctx.arc(x, y, foodSize * 1.5, 0, Math.PI * 2);
                this.ctx.fill();

                // Draw main food body
                this.ctx.fillStyle = food.color;
                this.ctx.beginPath();
                this.ctx.arc(x, y, foodSize, 0, Math.PI * 2);
                this.ctx.fill();

                // Add highlight
                this.ctx.fillStyle = this.addAlpha('#ffffff', 0.6);
                this.ctx.beginPath();
                this.ctx.arc(x - foodSize * 0.3, y - foodSize * 0.3, foodSize * 0.3, 0, Math.PI * 2);
                this.ctx.fill();

                // Add outline
                this.ctx.strokeStyle = beingVacuumed ? '#ffffff' : this.addAlpha(food.color, 0.8);
                this.ctx.lineWidth = beingVacuumed ? 2 : 1;
                this.ctx.beginPath();
                this.ctx.arc(x, y, foodSize, 0, Math.PI * 2);
                this.ctx.stroke();
            }
        });
    }

    drawVacuumTrail(food, snake, foodX, foodY) {
        const headX = snake.x - this.camera.x;
        const headY = snake.y - this.camera.y;

        // Calculate direction from food to snake head
        const dx = headX - foodX;
        const dy = headY - foodY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance === 0) return;

        const normalizedDx = dx / distance;
        const normalizedDy = dy / distance;

        // Draw multiple particle trails
        const numParticles = 6;
        const time = Date.now() * 0.01;

        for (let i = 0; i < numParticles; i++) {
            const progress = (i / numParticles) + (time % 1);
            const trailProgress = progress % 1;

            const trailX = foodX + normalizedDx * distance * trailProgress;
            const trailY = foodY + normalizedDy * distance * trailProgress;

            const alpha = 1 - trailProgress;
            const size = 2 * alpha;

            if (size > 0.1) {
                this.ctx.fillStyle = this.addAlpha(food.color, alpha * 0.8);
                this.ctx.beginPath();
                this.ctx.arc(trailX, trailY, size, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }

        // Draw main vacuum line
        const lineAlpha = 0.3 + Math.sin(time * 0.5) * 0.2;
        this.ctx.strokeStyle = this.addAlpha(snake.color, lineAlpha);
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 3]);
        this.ctx.beginPath();
        this.ctx.moveTo(foodX, foodY);
        this.ctx.lineTo(headX, headY);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }

    drawGlowOrbs() {
        this.glowOrbs.forEach(orb => {
            const x = orb.x - this.camera.x;
            const y = orb.y - this.camera.y;

            if (x > -50 && x < this.canvas.width + 50 && y > -50 && y < this.canvas.height + 50) {
                const time = Date.now() * 0.001;
                const glowSize = orb.size + Math.sin(orb.glow) * 4;
                const baseColor = `hsl(${orb.hue}, 100%, 70%)`;

                // 5-layer aura system
                // Outer aura (largest)
                const outerAura = this.ctx.createRadialGradient(x, y, 0, x, y, glowSize * 4);
                outerAura.addColorStop(0, `hsla(${orb.hue}, 100%, 70%, 0.1)`);
                outerAura.addColorStop(0.5, `hsla(${orb.hue}, 100%, 70%, 0.05)`);
                outerAura.addColorStop(1, 'transparent');

                this.ctx.fillStyle = outerAura;
                this.ctx.beginPath();
                this.ctx.arc(x, y, glowSize * 4, 0, Math.PI * 2);
                this.ctx.fill();

                // Middle glow
                const middleGlow = this.ctx.createRadialGradient(x, y, 0, x, y, glowSize * 3);
                middleGlow.addColorStop(0, `hsla(${orb.hue}, 100%, 70%, 0.3)`);
                middleGlow.addColorStop(0.5, `hsla(${orb.hue}, 100%, 70%, 0.2)`);
                middleGlow.addColorStop(1, 'transparent');

                this.ctx.fillStyle = middleGlow;
                this.ctx.beginPath();
                this.ctx.arc(x, y, glowSize * 3, 0, Math.PI * 2);
                this.ctx.fill();

                // Inner glow
                const innerGlow = this.ctx.createRadialGradient(x, y, 0, x, y, glowSize * 2);
                innerGlow.addColorStop(0, `hsla(${orb.hue}, 100%, 70%, 0.8)`);
                innerGlow.addColorStop(0.6, `hsla(${orb.hue}, 100%, 70%, 0.4)`);
                innerGlow.addColorStop(1, 'transparent');

                this.ctx.fillStyle = innerGlow;
                this.ctx.beginPath();
                this.ctx.arc(x, y, glowSize * 2, 0, Math.PI * 2);
                this.ctx.fill();

                // Core glow
                const coreGlow = this.ctx.createRadialGradient(x, y, 0, x, y, glowSize);
                coreGlow.addColorStop(0, '#ffffff');
                coreGlow.addColorStop(0.5, baseColor);
                coreGlow.addColorStop(1, `hsla(${orb.hue}, 100%, 70%, 0.7)`);

                this.ctx.fillStyle = coreGlow;
                this.ctx.beginPath();
                this.ctx.arc(x, y, glowSize, 0, Math.PI * 2);
                this.ctx.fill();

                // Ultra-bright core
                this.ctx.fillStyle = '#ffffff';

                // Draw 12 rotating sparkles
                for (let i = 0; i < 12; i++) {
                    const sparkleAngle = (time * 2 + (i * Math.PI / 6)) % (Math.PI * 2);
                    const sparkleDistance = glowSize * 1.5;
                    const sparkleX = x + Math.cos(sparkleAngle) * sparkleDistance;
                    const sparkleY = y + Math.sin(sparkleAngle) * sparkleDistance;

                    // Sparkle size pulsation
                    const sparkleSize = 2 + Math.sin(time * 4 + i) * 1;

                    this.ctx.fillStyle = `hsla(${orb.hue}, 100%, 90%, ${0.7 + Math.sin(time * 3 + i) * 0.3})`;
                    this.ctx.beginPath();
                    this.ctx.arc(sparkleX, sparkleY, sparkleSize, 0, Math.PI * 2);
                    this.ctx.fill();
                }

                // Draw 3 animated energy rings
                for (let i = 0; i < 3; i++) {
                    const ringRadius = glowSize * (1.5 + i * 0.5);
                    const dashOffset = time * (1 + i) * 50;

                    this.ctx.strokeStyle = `hsla(${orb.hue}, 100%, 80%, ${0.4 - i * 0.1})`;
                    this.ctx.lineWidth = 2;
                    this.ctx.setLineDash([10, 10]);
                    this.ctx.lineDashOffset = dashOffset;

                    this.ctx.beginPath();
                    this.ctx.arc(x, y, ringRadius, 0, Math.PI * 2);
                    this.ctx.stroke();
                }

                // Color-shifting effect
                const shiftedHue = (orb.hue + time * 20) % 360;
                const shiftedColor = `hsla(${shiftedHue}, 100%, 70%, 0.3)`;

                const shiftGlow = this.ctx.createRadialGradient(x, y, 0, x, y, glowSize * 2.5);
                shiftGlow.addColorStop(0, 'transparent');
                shiftGlow.addColorStop(0.5, shiftedColor);
                shiftGlow.addColorStop(1, 'transparent');

                this.ctx.fillStyle = shiftGlow;
                this.ctx.beginPath();
                this.ctx.arc(x, y, glowSize * 2.5, 0, Math.PI * 2);
                this.ctx.fill();

                // Reset line dash
                this.ctx.setLineDash([]);

                // Draw glowing orb core
                const coreGradient = this.ctx.createRadialGradient(x, y, 0, x, y, glowSize * 0.8);
                coreGradient.addColorStop(0, `hsla(${orb.hue}, 100%, 90%, 1)`);
                coreGradient.addColorStop(0.5, `hsla(${orb.hue}, 100%, 70%, 0.8)`);
                coreGradient.addColorStop(1, `hsla(${orb.hue}, 100%, 50%, 0.4)`);

                this.ctx.fillStyle = coreGradient;
                this.ctx.beginPath();
                this.ctx.arc(x, y, glowSize * 0.8, 0, Math.PI * 2);
                this.ctx.fill();

                // Draw inner bright core
                this.ctx.fillStyle = `hsla(${orb.hue}, 100%, 95%, 0.9)`;
                this.ctx.beginPath();
                this.ctx.arc(x, y, glowSize * 0.4, 0, Math.PI * 2);
                this.ctx.fill();

                // Draw energy symbol in center
                this.ctx.fillStyle = `hsla(${orb.hue}, 100%, 30%, 0.8)`;
                this.ctx.font = `${glowSize * 0.8}px monospace`;
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText('⚡', x, y);

                // Draw sparkle effect
                for (let i = 0; i < 6; i++) {
                    const sparkleAngle = (orb.glow + i * Math.PI / 3) % (Math.PI * 2);
                    const sparkleDistance = glowSize * 1.8;
                    const sparkleX = x + Math.cos(sparkleAngle) * sparkleDistance;
                    const sparkleY = y + Math.sin(sparkleAngle) * sparkleDistance;

                    this.ctx.fillStyle = `hsla(${orb.hue}, 100%, 80%, 0.8)`;
                    this.ctx.beginPath();
                    this.ctx.arc(sparkleX, sparkleY, 2, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            }
        });
    }

    drawSnakes() {
        // Draw all snakes (player + remote players in multiplayer)
        const allSnakes = [this.player, ...this.remotePlayers].filter(s => s.alive);

        allSnakes.forEach(snake => {
            this.drawRealisticSnake(snake);
        });
    }

    drawRealisticSnake(snake) {
        if (snake.segments.length < 2) return;

        // Get head position for effects
        const headX = snake.segments[0].x - this.camera.x;
        const headY = snake.segments[0].y - this.camera.y;

        // Skip if snake is off-screen
        if (headX < -200 || headX > this.canvas.width + 200 || headY < -200 || headY > this.canvas.height + 200) {
            return;
        }

        // Check if snake is invincible and should blink
        const isInvincible = snake.isInvincible();
        const shouldBlink = isInvincible && Math.sin(snake.blinkPhase) < 0;

        // Skip drawing if blinking (creates blinking effect)
        if (shouldBlink) {
            // Still draw wager display even when blinking
            this.drawWagerDisplay(snake);
            return;
        }

        // Draw invincibility glow effect
        if (isInvincible) {
            const invincibilityGlow = this.ctx.createRadialGradient(headX, headY, 0, headX, headY, snake.size * 4);
            invincibilityGlow.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
            invincibilityGlow.addColorStop(0.5, 'rgba(0, 255, 255, 0.2)');
            invincibilityGlow.addColorStop(1, 'transparent');

            this.ctx.fillStyle = invincibilityGlow;
            this.ctx.beginPath();
            this.ctx.arc(headX, headY, snake.size * 4, 0, Math.PI * 2);
            this.ctx.fill();
        }

        // Draw boost effect for player
        if (snake === this.player && this.boosting) {
            const boostGlow = this.ctx.createRadialGradient(headX, headY, 0, headX, headY, snake.size * 3);
            boostGlow.addColorStop(0, '#ffffff');
            boostGlow.addColorStop(0.3, snake.color);
            boostGlow.addColorStop(1, 'transparent');

            this.ctx.fillStyle = boostGlow;
            this.ctx.beginPath();
            this.ctx.arc(headX, headY, snake.size * 3, 0, Math.PI * 2);
            this.ctx.fill();
        }

        // Draw snake body using overlapping circles for smooth appearance
        this.drawSmoothSnakeBody(snake);

        // Add snake pattern/scales
        this.drawSnakePattern(snake);

        // Draw the head details
        this.drawSnakeHead(snake);

        // Draw wager display (both modes have gambling mechanics)
        this.drawWagerDisplay(snake);
    }

    drawSmoothSnakeBody(snake) {
        // Draw the snake as ONE unified fluid shape with wider head

        // Step 1: Draw the unified golden outline - body first, then wider head
        this.ctx.strokeStyle = snake.color; // Golden outline
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        // Draw body outline
        this.ctx.lineWidth = snake.size * 2.0;
        this.ctx.beginPath();
        for (let i = 1; i < snake.segments.length; i++) { // Start from segment 1 (skip head)
            const segment = snake.segments[i];
            const x = segment.x - this.camera.x;
            const y = segment.y - this.camera.y;

            if (i === 1) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        this.ctx.stroke();

        // Draw wider head outline (serpent-like)
        const head = snake.segments[0];
        const headX = head.x - this.camera.x;
        const headY = head.y - this.camera.y;

        this.ctx.lineWidth = snake.size * 2.8; // Much wider for head
        this.ctx.beginPath();

        // Connect head to body if there's a second segment
        if (snake.segments.length > 1) {
            const neck = snake.segments[1];
            const neckX = neck.x - this.camera.x;
            const neckY = neck.y - this.camera.y;

            this.ctx.moveTo(neckX, neckY);
            this.ctx.lineTo(headX, headY);
        } else {
            // Just draw head if only one segment
            this.ctx.moveTo(headX, headY);
            this.ctx.lineTo(headX, headY);
        }
        this.ctx.stroke();

        // Step 2: Fill the interior with black - body first
        this.ctx.strokeStyle = '#000000'; // Black interior
        this.ctx.lineWidth = snake.size * 1.6;
        this.ctx.beginPath();
        for (let i = 1; i < snake.segments.length; i++) {
            const segment = snake.segments[i];
            const x = segment.x - this.camera.x;
            const y = segment.y - this.camera.y;

            if (i === 1) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        this.ctx.stroke();

        // Fill head interior with black (wider)
        this.ctx.lineWidth = snake.size * 2.4; // Wider black fill for head
        this.ctx.beginPath();
        if (snake.segments.length > 1) {
            const neck = snake.segments[1];
            const neckX = neck.x - this.camera.x;
            const neckY = neck.y - this.camera.y;

            this.ctx.moveTo(neckX, neckY);
            this.ctx.lineTo(headX, headY);
        } else {
            this.ctx.moveTo(headX, headY);
            this.ctx.lineTo(headX, headY);
        }
        this.ctx.stroke();

        // Step 3: Add golden center dots to each segment position
        for (let i = 0; i < snake.segments.length; i++) {
            const segment = snake.segments[i];
            const x = segment.x - this.camera.x;
            const y = segment.y - this.camera.y;

            // Skip if segment is off-screen
            if (x < -100 || x > this.canvas.width + 100 || y < -100 || y > this.canvas.height + 100) {
                continue;
            }

            // Dot size - larger for head
            const dotSize = i === 0 ? snake.size * 0.25 : snake.size * 0.15;

            this.ctx.fillStyle = snake.color; // Golden dots
            this.ctx.beginPath();
            this.ctx.arc(x, y, dotSize, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }



    drawSnakePattern(snake) {
        const time = Date.now() * 0.001;

        // Draw massive pulsating aura around entire snake
        for (let i = 0; i < snake.segments.length; i += 3) {
            const segment = snake.segments[i];
            const x = segment.x - this.camera.x;
            const y = segment.y - this.camera.y;

            if (x < -100 || x > this.canvas.width + 100 || y < -100 || y > this.canvas.height + 100) {
                continue;
            }

            const segmentRatio = 1 - (i / snake.segments.length) * 0.4;
            const segmentSize = snake.size * segmentRatio;
            const auraSize = segmentSize * (2.5 + Math.sin(time * 2 + i * 0.1) * 0.3);

            // Create pulsating aura
            const auraGradient = this.ctx.createRadialGradient(x, y, 0, x, y, auraSize);
            auraGradient.addColorStop(0, this.addAlpha(snake.color, 0.2));
            auraGradient.addColorStop(0.5, this.addAlpha(snake.color, 0.1));
            auraGradient.addColorStop(1, 'transparent');

            this.ctx.fillStyle = auraGradient;
            this.ctx.beginPath();
            this.ctx.arc(x, y, auraSize, 0, Math.PI * 2);
            this.ctx.fill();
        }

        // Draw hexagonal scales with metallic effect
        for (let i = 0; i < snake.segments.length - 1; i += 2) {
            const segment = snake.segments[i];
            const x = segment.x - this.camera.x;
            const y = segment.y - this.camera.y;

            if (x < -100 || x > this.canvas.width + 100 || y < -100 || y > this.canvas.height + 100) {
                continue;
            }

            const segmentRatio = 1 - (i / snake.segments.length) * 0.4;
            const segmentSize = snake.size * segmentRatio;
            const scaleSize = segmentSize * 0.4;
            const angle = snake.angle + (i * 0.1) + Math.sin(time + i * 0.2) * 0.1; // Dynamic rotation

            this.ctx.save();
            this.ctx.translate(x, y);
            this.ctx.rotate(angle);

            // Draw hexagonal scales
            const hexPoints = [];
            for (let j = 0; j < 6; j++) {
                const scaleAngle = (j * Math.PI / 3);
                hexPoints.push({
                    x: Math.cos(scaleAngle) * scaleSize,
                    y: Math.sin(scaleAngle) * scaleSize
                });
            }

            // Metallic gradient for scales
            const scaleGradient = this.ctx.createRadialGradient(
                -scaleSize * 0.2, -scaleSize * 0.2, 0,
                0, 0, scaleSize
            );
            scaleGradient.addColorStop(0, '#ffffff');
            scaleGradient.addColorStop(0.3, snake.color);
            scaleGradient.addColorStop(0.6, this.darkenColor(snake.color, 0.2));
            scaleGradient.addColorStop(0.8, snake.color);
            scaleGradient.addColorStop(1, this.darkenColor(snake.color, 0.3));

            // Draw scale with shimmer effect
            this.ctx.fillStyle = scaleGradient;
            this.ctx.beginPath();
            this.ctx.moveTo(hexPoints[0].x, hexPoints[0].y);
            for (let j = 1; j < hexPoints.length; j++) {
                this.ctx.lineTo(hexPoints[j].x, hexPoints[j].y);
            }
            this.ctx.closePath();
            this.ctx.fill();

            // Add dynamic shine effect
            const shineOpacity = Math.max(0, Math.sin(time * 3 + i * 0.2)) * 0.4;
            this.ctx.fillStyle = this.addAlpha('#ffffff', shineOpacity);
            this.ctx.beginPath();
            this.ctx.arc(-scaleSize * 0.2, -scaleSize * 0.2, scaleSize * 0.3, 0, Math.PI * 2);
            this.ctx.fill();

            this.ctx.restore();
        }
    }

    drawSnakeHead(snake) {
        const head = snake.segments[0];
        const x = head.x - this.camera.x;
        const y = head.y - this.camera.y;

        if (x < -100 || x > this.canvas.width + 100 || y < -100 || y > this.canvas.height + 100) {
            return;
        }

        const time = Date.now() * 0.001;
        const headSize = snake.size * 1.2;
        const eyeSize = headSize * 0.3;
        const eyeOffset = headSize * 0.5;

        // Draw massive pulsating aura
        const auraSize = headSize * (3 + Math.sin(time * 2) * 0.5);
        const auraGradient = this.ctx.createRadialGradient(x, y, 0, x, y, auraSize);
        auraGradient.addColorStop(0, this.addAlpha(snake.color, 0.4));
        auraGradient.addColorStop(0.5, this.addAlpha(snake.color, 0.2));
        auraGradient.addColorStop(1, 'transparent');

        this.ctx.fillStyle = auraGradient;
        this.ctx.beginPath();
        this.ctx.arc(x, y, auraSize, 0, Math.PI * 2);
        this.ctx.fill();

        // Draw battering ram comet effect if active
        if (snake.hasActivePowerup('battering_ram')) {
            this.drawBatteringRamEffect(snake, x, y, headSize);
        }

        // Head is already drawn in drawSmoothSnakeBody as part of unified shape
        // Just add eyes here

        // Draw all active powerup effects
        this.drawActivePowerupEffects(snake, x, y, headSize);

        // Add dynamic glow effect
        const glowSize = headSize * (1.5 + Math.sin(time * 3) * 0.2);
        const glowGradient = this.ctx.createRadialGradient(x, y, headSize * 0.8, x, y, glowSize);
        glowGradient.addColorStop(0, this.addAlpha(snake.color, 0.5));
        glowGradient.addColorStop(1, 'transparent');

        this.ctx.fillStyle = glowGradient;
        this.ctx.beginPath();
        this.ctx.arc(x, y, glowSize, 0, Math.PI * 2);
        this.ctx.fill();

        // Draw glowing cyan eyes with red pupils
        const eyeAngle = snake.angle;
        const eyeDistance = headSize * 0.5;

        for (let i = -1; i <= 1; i += 2) {
            const eyeX = x + Math.cos(eyeAngle + Math.PI/2) * eyeDistance * i;
            const eyeY = y + Math.sin(eyeAngle + Math.PI/2) * eyeDistance * i;

            // Eye glow
            const eyeGlow = this.ctx.createRadialGradient(eyeX, eyeY, 0, eyeX, eyeY, eyeSize * 1.5);
            eyeGlow.addColorStop(0, 'rgba(0, 255, 255, 0.8)');
            eyeGlow.addColorStop(0.5, 'rgba(0, 255, 255, 0.4)');
            eyeGlow.addColorStop(1, 'transparent');

            this.ctx.fillStyle = eyeGlow;
            this.ctx.beginPath();
            this.ctx.arc(eyeX, eyeY, eyeSize * 1.5, 0, Math.PI * 2);
            this.ctx.fill();

            // Eye white
            this.ctx.fillStyle = '#00ffff';
            this.ctx.beginPath();
            this.ctx.arc(eyeX, eyeY, eyeSize, 0, Math.PI * 2);
            this.ctx.fill();

            // Red pupil with glow
            const pupilSize = eyeSize * 0.5;
            const pupilX = eyeX + Math.cos(eyeAngle) * eyeSize * 0.2;
            const pupilY = eyeY + Math.sin(eyeAngle) * eyeSize * 0.2;

            const pupilGlow = this.ctx.createRadialGradient(pupilX, pupilY, 0, pupilX, pupilY, pupilSize * 1.5);
            pupilGlow.addColorStop(0, '#ff0000');
            pupilGlow.addColorStop(0.5, 'rgba(255, 0, 0, 0.5)');
            pupilGlow.addColorStop(1, 'transparent');

            this.ctx.fillStyle = pupilGlow;
            this.ctx.beginPath();
            this.ctx.arc(pupilX, pupilY, pupilSize * 1.5, 0, Math.PI * 2);
            this.ctx.fill();

            this.ctx.fillStyle = '#ff0000';
            this.ctx.beginPath();
            this.ctx.arc(pupilX, pupilY, pupilSize, 0, Math.PI * 2);
            this.ctx.fill();

            // Shine effect
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            this.ctx.beginPath();
            this.ctx.arc(eyeX - eyeSize * 0.2, eyeY - eyeSize * 0.2, eyeSize * 0.1, 0, Math.PI * 2);
            this.ctx.fill();
        }

        // Draw forked tongue occasionally
        if (Math.sin(time * 4) > 0.7) {
            const tongueLength = headSize * 2;
            const tongueWidth = headSize * 0.15;
            const tongueAngle = eyeAngle;
            const tongueStartX = x + Math.cos(tongueAngle) * headSize;
            const tongueStartY = y + Math.sin(tongueAngle) * headSize;
            const tongueEndX = tongueStartX + Math.cos(tongueAngle) * tongueLength;
            const tongueEndY = tongueStartY + Math.sin(tongueAngle) * tongueLength;
            const forkLength = tongueLength * 0.3;

            this.ctx.strokeStyle = '#ff3366';
            this.ctx.lineWidth = tongueWidth;
            this.ctx.lineCap = 'round';

            // Main tongue
            this.ctx.beginPath();
            this.ctx.moveTo(tongueStartX, tongueStartY);
            this.ctx.lineTo(tongueEndX, tongueEndY);
            this.ctx.stroke();

            // Forked ends
            const forkAngle = Math.PI / 4;
            for (let i = -1; i <= 1; i += 2) {
                this.ctx.beginPath();
                this.ctx.moveTo(tongueEndX, tongueEndY);
                this.ctx.lineTo(
                    tongueEndX + Math.cos(tongueAngle + forkAngle * i) * forkLength,
                    tongueEndY + Math.sin(tongueAngle + forkAngle * i) * forkLength
                );
                this.ctx.stroke();
            }
        }

        // Draw vacuum radius indicator
        this.drawVacuumIndicator(snake, x, y);

        // Draw crown if this snake is the king
        if (this.currentKing === snake) {
            this.drawCrown(snake, x, y, headSize);
        }

        // Eye pupils
        this.ctx.fillStyle = '#000';
        this.ctx.beginPath();
        this.ctx.arc(eyeOffset * 0.7, -eyeOffset * 0.6, eyeSize * 0.6, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.beginPath();
        this.ctx.arc(eyeOffset * 0.7, eyeOffset * 0.6, eyeSize * 0.6, 0, Math.PI * 2);
        this.ctx.fill();

        // Eye shine
        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(eyeOffset * 0.7 - eyeSize * 0.3, -eyeOffset * 0.6 - eyeSize * 0.3, eyeSize * 0.2, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.beginPath();
        this.ctx.arc(eyeOffset * 0.7 - eyeSize * 0.3, eyeOffset * 0.6 - eyeSize * 0.3, eyeSize * 0.2, 0, Math.PI * 2);
        this.ctx.fill();

        // Nostrils
        this.ctx.fillStyle = this.darkenColor(snake.color, 0.6);
        this.ctx.beginPath();
        this.ctx.arc(headSize * 0.9, -headSize * 0.2, headSize * 0.08, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.beginPath();
        this.ctx.arc(headSize * 0.9, headSize * 0.2, headSize * 0.08, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.restore();
    }

    drawBatteringRamEffect(snake, headX, headY, headSize) {
        const time = Date.now() * 0.001;

        // Calculate direction snake is moving
        const angle = snake.angle;
        const cometLength = headSize * 3;

        // Draw comet trail behind the head
        const trailPoints = [];
        const numTrailPoints = 8;

        for (let i = 0; i < numTrailPoints; i++) {
            const progress = i / numTrailPoints;
            const trailDistance = cometLength * progress;
            const trailX = headX - Math.cos(angle) * trailDistance;
            const trailY = headY - Math.sin(angle) * trailDistance;
            const trailSize = headSize * (1 - progress * 0.8);

            trailPoints.push({ x: trailX, y: trailY, size: trailSize, progress });
        }

        // Draw trail with gradient
        this.ctx.save();

        // Create comet trail gradient
        const trailGradient = this.ctx.createLinearGradient(
            headX, headY,
            headX - Math.cos(angle) * cometLength,
            headY - Math.sin(angle) * cometLength
        );
        trailGradient.addColorStop(0, '#FF6600FF'); // Bright orange at head
        trailGradient.addColorStop(0.3, '#FF9933AA'); // Medium orange
        trailGradient.addColorStop(0.7, '#FFCC6666'); // Light orange
        trailGradient.addColorStop(1, 'transparent'); // Fade to transparent

        // Draw comet body
        this.ctx.fillStyle = trailGradient;
        this.ctx.beginPath();
        this.ctx.moveTo(headX, headY);

        // Create comet shape
        const cometWidth = headSize * 0.8;
        const perpAngle = angle + Math.PI / 2;

        // Top edge of comet
        this.ctx.lineTo(
            headX + Math.cos(perpAngle) * cometWidth / 2,
            headY + Math.sin(perpAngle) * cometWidth / 2
        );
        this.ctx.lineTo(
            headX - Math.cos(angle) * cometLength + Math.cos(perpAngle) * cometWidth / 4,
            headY - Math.sin(angle) * cometLength + Math.sin(perpAngle) * cometWidth / 4
        );

        // Tail point
        this.ctx.lineTo(
            headX - Math.cos(angle) * cometLength,
            headY - Math.sin(angle) * cometLength
        );

        // Bottom edge of comet
        this.ctx.lineTo(
            headX - Math.cos(angle) * cometLength - Math.cos(perpAngle) * cometWidth / 4,
            headY - Math.sin(angle) * cometLength - Math.sin(perpAngle) * cometWidth / 4
        );
        this.ctx.lineTo(
            headX - Math.cos(perpAngle) * cometWidth / 2,
            headY - Math.sin(perpAngle) * cometWidth / 2
        );

        this.ctx.closePath();
        this.ctx.fill();

        // Add sparks and particles
        for (let i = 0; i < 6; i++) {
            const sparkAngle = angle + (Math.random() - 0.5) * Math.PI / 2;
            const sparkDistance = headSize * (1 + Math.random() * 2);
            const sparkX = headX - Math.cos(sparkAngle) * sparkDistance;
            const sparkY = headY - Math.sin(sparkAngle) * sparkDistance;
            const sparkSize = 2 + Math.random() * 3;

            this.ctx.fillStyle = '#FFAA00';
            this.ctx.beginPath();
            this.ctx.arc(sparkX, sparkY, sparkSize, 0, Math.PI * 2);
            this.ctx.fill();
        }

        // Add energy glow around head
        const energyGlow = this.ctx.createRadialGradient(headX, headY, 0, headX, headY, headSize * 2);
        energyGlow.addColorStop(0, '#FF660080');
        energyGlow.addColorStop(0.5, '#FF990040');
        energyGlow.addColorStop(1, 'transparent');

        this.ctx.fillStyle = energyGlow;
        this.ctx.beginPath();
        this.ctx.arc(headX, headY, headSize * 2, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.restore();
    }

    drawHelmet(snake, headX, headY, headSize) {
        const time = Date.now() * 0.001;
        const helmetHealth = snake.getHelmetHealth();
        const maxHelmetHealth = 500;
        const healthRatio = helmetHealth / maxHelmetHealth;

        // Helmet size slightly larger than head
        const helmetSize = headSize * 1.15;

        this.ctx.save();

        // Helmet base color changes based on health
        let helmetColor = '#888888';
        if (healthRatio < 0.3) {
            helmetColor = '#AA4444'; // Red when damaged
        } else if (healthRatio < 0.6) {
            helmetColor = '#AAAA44'; // Yellow when moderately damaged
        }

        // Draw helmet dome
        const helmetGradient = this.ctx.createRadialGradient(
            headX - helmetSize * 0.3, headY - helmetSize * 0.3, 0,
            headX, headY, helmetSize
        );
        helmetGradient.addColorStop(0, '#FFFFFF');
        helmetGradient.addColorStop(0.3, helmetColor);
        helmetGradient.addColorStop(0.7, this.darkenColor(helmetColor, 0.3));
        helmetGradient.addColorStop(1, this.darkenColor(helmetColor, 0.5));

        this.ctx.fillStyle = helmetGradient;
        this.ctx.beginPath();
        this.ctx.arc(headX, headY, helmetSize, 0, Math.PI * 2);
        this.ctx.fill();

        // Helmet visor (darker area)
        const visorGradient = this.ctx.createRadialGradient(
            headX, headY - helmetSize * 0.2, 0,
            headX, headY, helmetSize * 0.8
        );
        visorGradient.addColorStop(0, '#333333AA');
        visorGradient.addColorStop(0.5, '#555555AA');
        visorGradient.addColorStop(1, 'transparent');

        this.ctx.fillStyle = visorGradient;
        this.ctx.beginPath();
        this.ctx.arc(headX, headY, helmetSize * 0.8, 0, Math.PI, true);
        this.ctx.fill();

        // Helmet outline
        this.ctx.strokeStyle = this.darkenColor(helmetColor, 0.4);
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(headX, headY, helmetSize, 0, Math.PI * 2);
        this.ctx.stroke();

        // Add damage cracks if helmet is damaged
        if (healthRatio < 0.8) {
            this.ctx.strokeStyle = '#222222';
            this.ctx.lineWidth = 1;

            // Draw random cracks
            const numCracks = Math.floor((1 - healthRatio) * 5);
            for (let i = 0; i < numCracks; i++) {
                const crackAngle = Math.random() * Math.PI * 2;
                const crackLength = helmetSize * (0.3 + Math.random() * 0.4);
                const startX = headX + Math.cos(crackAngle) * helmetSize * 0.3;
                const startY = headY + Math.sin(crackAngle) * helmetSize * 0.3;
                const endX = startX + Math.cos(crackAngle + (Math.random() - 0.5) * 0.5) * crackLength;
                const endY = startY + Math.sin(crackAngle + (Math.random() - 0.5) * 0.5) * crackLength;

                this.ctx.beginPath();
                this.ctx.moveTo(startX, startY);
                this.ctx.lineTo(endX, endY);
                this.ctx.stroke();
            }
        }

        // Helmet health indicator (small bar above helmet)
        const barWidth = helmetSize * 1.5;
        const barHeight = 4;
        const barX = headX - barWidth / 2;
        const barY = headY - helmetSize - 15;

        // Background bar
        this.ctx.fillStyle = '#333333';
        this.ctx.fillRect(barX, barY, barWidth, barHeight);

        // Health bar
        const healthColor = healthRatio > 0.6 ? '#44AA44' : healthRatio > 0.3 ? '#AAAA44' : '#AA4444';
        this.ctx.fillStyle = healthColor;
        this.ctx.fillRect(barX, barY, barWidth * healthRatio, barHeight);

        // Bar outline
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(barX, barY, barWidth, barHeight);

        this.ctx.restore();
    }

    drawCrown(snake, headX, headY, headSize) {
        const crownSize = headSize * 0.8;
        const crownY = headY - headSize * 1.5; // Position above head

        this.ctx.save();

        // Crown base (golden band)
        const crownGradient = this.ctx.createLinearGradient(
            headX - crownSize, crownY - crownSize * 0.2,
            headX + crownSize, crownY + crownSize * 0.2
        );
        crownGradient.addColorStop(0, '#FFD700'); // Gold
        crownGradient.addColorStop(0.5, '#FFF700'); // Bright gold
        crownGradient.addColorStop(1, '#FFD700'); // Gold

        this.ctx.fillStyle = crownGradient;
        this.ctx.fillRect(headX - crownSize, crownY, crownSize * 2, crownSize * 0.4);

        // Crown spikes
        this.ctx.beginPath();
        const spikeCount = 5;
        const spikeWidth = (crownSize * 2) / spikeCount;

        for (let i = 0; i < spikeCount; i++) {
            const spikeX = headX - crownSize + (i * spikeWidth);
            const spikeHeight = i === 2 ? crownSize * 0.8 : crownSize * 0.6; // Middle spike taller

            // Draw spike triangle
            this.ctx.moveTo(spikeX, crownY);
            this.ctx.lineTo(spikeX + spikeWidth / 2, crownY - spikeHeight);
            this.ctx.lineTo(spikeX + spikeWidth, crownY);
        }
        this.ctx.closePath();
        this.ctx.fill();

        // Crown gems (red jewels)
        for (let i = 0; i < 3; i++) {
            const gemX = headX - crownSize * 0.6 + (i * crownSize * 0.6);
            const gemY = crownY + crownSize * 0.1;

            this.ctx.fillStyle = '#FF0000'; // Red gem
            this.ctx.beginPath();
            this.ctx.arc(gemX, gemY, crownSize * 0.1, 0, Math.PI * 2);
            this.ctx.fill();

            // Gem highlight
            this.ctx.fillStyle = '#FF6666';
            this.ctx.beginPath();
            this.ctx.arc(gemX - crownSize * 0.03, gemY - crownSize * 0.03, crownSize * 0.05, 0, Math.PI * 2);
            this.ctx.fill();
        }

        // Crown outline
        this.ctx.strokeStyle = '#B8860B'; // Dark gold
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(headX - crownSize, crownY, crownSize * 2, crownSize * 0.4);

        this.ctx.restore();
    }

    drawKingIndicator() {
        if (!this.currentKing || !this.player.alive || this.currentKing === this.player) {
            return; // Don't show indicator if no king, player is dead, or player is the king
        }

        const kingX = this.currentKing.x;
        const kingY = this.currentKing.y;
        const playerX = this.player.x;
        const playerY = this.player.y;

        // Calculate direction to king
        const dx = kingX - playerX;
        const dy = kingY - playerY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 200) return; // Don't show if king is very close

        const angle = Math.atan2(dy, dx);

        // Position indicator at edge of screen
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = Math.min(centerX, centerY) * 0.8; // 80% of screen radius

        const indicatorX = centerX + Math.cos(angle) * radius;
        const indicatorY = centerY + Math.sin(angle) * radius;

        this.ctx.save();

        // Draw arrow pointing to king
        const arrowSize = 20;
        const time = Date.now() * 0.001;
        const pulse = 1 + Math.sin(time * 3) * 0.2; // Pulsing effect

        // Arrow background (black with gold border)
        this.ctx.fillStyle = '#000000';
        this.ctx.strokeStyle = '#FFD700';
        this.ctx.lineWidth = 3;

        this.ctx.translate(indicatorX, indicatorY);
        this.ctx.rotate(angle);
        this.ctx.scale(pulse, pulse);

        // Draw arrow shape
        this.ctx.beginPath();
        this.ctx.moveTo(arrowSize, 0);
        this.ctx.lineTo(-arrowSize * 0.5, -arrowSize * 0.5);
        this.ctx.lineTo(-arrowSize * 0.3, 0);
        this.ctx.lineTo(-arrowSize * 0.5, arrowSize * 0.5);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();

        this.ctx.restore();

        // Draw crown icon next to arrow
        this.ctx.save();
        this.ctx.translate(indicatorX, indicatorY);

        const crownSize = 12;
        const crownOffset = 30;
        const crownX = Math.cos(angle + Math.PI / 2) * crownOffset;
        const crownY = Math.sin(angle + Math.PI / 2) * crownOffset;

        // Mini crown
        this.ctx.fillStyle = '#FFD700';
        this.ctx.fillRect(crownX - crownSize, crownY - crownSize * 0.3, crownSize * 2, crownSize * 0.6);

        // Crown spikes
        this.ctx.beginPath();
        for (let i = 0; i < 3; i++) {
            const spikeX = crownX - crownSize + (i * crownSize * 0.8);
            const spikeHeight = i === 1 ? crownSize * 0.8 : crownSize * 0.6;

            this.ctx.moveTo(spikeX, crownY - crownSize * 0.3);
            this.ctx.lineTo(spikeX + crownSize * 0.4, crownY - crownSize * 0.3 - spikeHeight);
            this.ctx.lineTo(spikeX + crownSize * 0.8, crownY - crownSize * 0.3);
        }
        this.ctx.closePath();
        this.ctx.fill();

        // Distance text
        const distanceText = `${Math.floor(distance)}m`;
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '12px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(distanceText, crownX, crownY + crownSize + 15);

        this.ctx.restore();
    }

    drawActivePowerupEffects(snake, headX, headY, headSize) {
        // Draw effects for each active powerup
        snake.activePowerups.forEach(powerup => {
            switch (powerup.type) {
                case 'helmet':
                    this.drawHelmet(snake, headX, headY, headSize);
                    break;
                case 'forcefield':
                    this.drawForcefieldEffect(snake, headX, headY, headSize);
                    break;
                case 'armor_plating':
                    this.drawArmorPlatingEffect(snake, headX, headY, headSize);
                    break;
                case 'shield_generator':
                    this.drawShieldGeneratorEffect(snake, headX, headY, headSize);
                    break;
                // Note: battering_ram effect is drawn separately in drawSnakeHead
            }
        });

        // Draw powerup status indicators
        this.drawPowerupStatusIndicators(snake, headX, headY, headSize);
    }

    drawForcefieldEffect(snake, headX, headY, headSize) {
        const time = Date.now() * 0.001;
        const shieldSize = headSize * 2.5;

        this.ctx.save();

        // Rotating energy shield
        const rotationSpeed = time * 2;

        // Multiple shield layers for depth
        for (let layer = 0; layer < 3; layer++) {
            const layerSize = shieldSize * (0.8 + layer * 0.1);
            const layerAlpha = 0.3 - layer * 0.1;

            this.ctx.save();
            this.ctx.translate(headX, headY);
            this.ctx.rotate(rotationSpeed + layer * Math.PI / 3);

            // Hexagonal energy shield
            this.ctx.strokeStyle = `rgba(0, 255, 255, ${layerAlpha})`;
            this.ctx.lineWidth = 3;
            this.ctx.setLineDash([10, 5]);
            this.ctx.lineDashOffset = time * 20;

            this.ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const angle = (i / 6) * Math.PI * 2;
                const x = Math.cos(angle) * layerSize;
                const y = Math.sin(angle) * layerSize;
                if (i === 0) {
                    this.ctx.moveTo(x, y);
                } else {
                    this.ctx.lineTo(x, y);
                }
            }
            this.ctx.closePath();
            this.ctx.stroke();

            this.ctx.restore();
        }

        // Energy particles around shield
        for (let i = 0; i < 8; i++) {
            const particleAngle = (i / 8) * Math.PI * 2 + time;
            const particleDistance = shieldSize * 0.9;
            const particleX = headX + Math.cos(particleAngle) * particleDistance;
            const particleY = headY + Math.sin(particleAngle) * particleDistance;

            const particleGlow = this.ctx.createRadialGradient(particleX, particleY, 0, particleX, particleY, 8);
            particleGlow.addColorStop(0, '#00FFFF');
            particleGlow.addColorStop(1, 'transparent');

            this.ctx.fillStyle = particleGlow;
            this.ctx.beginPath();
            this.ctx.arc(particleX, particleY, 8, 0, Math.PI * 2);
            this.ctx.fill();
        }

        this.ctx.restore();
    }

    drawArmorPlatingEffect(snake, headX, headY, headSize) {
        const time = Date.now() * 0.001;

        this.ctx.save();

        // Metallic armor plates around the snake
        const plateCount = 8;
        const plateSize = headSize * 0.4;
        const plateDistance = headSize * 1.8;

        for (let i = 0; i < plateCount; i++) {
            const angle = (i / plateCount) * Math.PI * 2 + time * 0.5;
            const plateX = headX + Math.cos(angle) * plateDistance;
            const plateY = headY + Math.sin(angle) * plateDistance;

            this.ctx.save();
            this.ctx.translate(plateX, plateY);
            this.ctx.rotate(angle + Math.PI / 2);

            // Armor plate gradient
            const plateGradient = this.ctx.createLinearGradient(-plateSize, -plateSize, plateSize, plateSize);
            plateGradient.addColorStop(0, '#CCCCCC');
            plateGradient.addColorStop(0.5, '#888888');
            plateGradient.addColorStop(1, '#444444');

            this.ctx.fillStyle = plateGradient;
            this.ctx.strokeStyle = '#FFFFFF';
            this.ctx.lineWidth = 2;

            // Draw armor plate
            this.ctx.beginPath();
            this.ctx.rect(-plateSize / 2, -plateSize, plateSize, plateSize * 2);
            this.ctx.fill();
            this.ctx.stroke();

            // Armor rivets
            this.ctx.fillStyle = '#AAAAAA';
            this.ctx.beginPath();
            this.ctx.arc(0, -plateSize * 0.5, 2, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.beginPath();
            this.ctx.arc(0, plateSize * 0.5, 2, 0, Math.PI * 2);
            this.ctx.fill();

            this.ctx.restore();
        }

        this.ctx.restore();
    }

    drawShieldGeneratorEffect(snake, headX, headY, headSize) {
        const time = Date.now() * 0.001;
        const shieldRadius = headSize * 3;

        this.ctx.save();

        // Powerful energy dome
        const pulseIntensity = 0.7 + Math.sin(time * 4) * 0.3;

        // Outer energy dome
        const domeGradient = this.ctx.createRadialGradient(headX, headY, 0, headX, headY, shieldRadius);
        domeGradient.addColorStop(0, 'transparent');
        domeGradient.addColorStop(0.8, `rgba(255, 255, 0, ${0.1 * pulseIntensity})`);
        domeGradient.addColorStop(0.95, `rgba(255, 255, 0, ${0.3 * pulseIntensity})`);
        domeGradient.addColorStop(1, 'transparent');

        this.ctx.fillStyle = domeGradient;
        this.ctx.beginPath();
        this.ctx.arc(headX, headY, shieldRadius, 0, Math.PI * 2);
        this.ctx.fill();

        // Energy ring pulses
        for (let ring = 0; ring < 3; ring++) {
            const ringTime = time * 2 + ring * Math.PI / 3;
            const ringRadius = shieldRadius * (0.3 + (Math.sin(ringTime) + 1) * 0.35);
            const ringAlpha = Math.max(0, Math.sin(ringTime)) * 0.5;

            this.ctx.strokeStyle = `rgba(255, 255, 0, ${ringAlpha})`;
            this.ctx.lineWidth = 4;
            this.ctx.beginPath();
            this.ctx.arc(headX, headY, ringRadius, 0, Math.PI * 2);
            this.ctx.stroke();
        }

        // Generator core at center
        const coreGlow = this.ctx.createRadialGradient(headX, headY, 0, headX, headY, headSize * 0.5);
        coreGlow.addColorStop(0, '#FFFF00');
        coreGlow.addColorStop(0.5, '#FFAA00');
        coreGlow.addColorStop(1, 'transparent');

        this.ctx.fillStyle = coreGlow;
        this.ctx.beginPath();
        this.ctx.arc(headX, headY, headSize * 0.5, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.restore();
    }

    drawPowerupStatusIndicators(snake, headX, headY, headSize) {
        if (snake.activePowerups.length === 0) return;

        const time = Date.now() * 0.001;
        const indicatorY = headY - headSize * 2.5;
        let indicatorX = headX - (snake.activePowerups.length * 15) / 2;

        this.ctx.save();

        snake.activePowerups.forEach((powerup, index) => {
            const timeRemaining = powerup.expirationTime - Date.now();
            const totalDuration = powerup.duration;
            const timeRatio = timeRemaining / totalDuration;

            // Indicator background
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(indicatorX - 8, indicatorY - 8, 16, 16);

            // Powerup icon color
            let iconColor = '#FFFFFF';
            switch (powerup.type) {
                case 'helmet': iconColor = '#888888'; break;
                case 'forcefield': iconColor = '#00FFFF'; break;
                case 'armor_plating': iconColor = '#CCCCCC'; break;
                case 'battering_ram': iconColor = '#FF6600'; break;
                case 'shield_generator': iconColor = '#FFFF00'; break;
            }

            // Pulsing effect when time is running low
            if (timeRatio < 0.3) {
                const pulseAlpha = 0.5 + Math.sin(time * 10) * 0.5;
                iconColor = this.addAlpha(iconColor, pulseAlpha);
            }

            // Draw powerup icon
            this.ctx.fillStyle = iconColor;
            this.ctx.beginPath();
            this.ctx.arc(indicatorX, indicatorY, 6, 0, Math.PI * 2);
            this.ctx.fill();

            // Time remaining bar
            const barWidth = 12;
            const barHeight = 2;
            const barX = indicatorX - barWidth / 2;
            const barY = indicatorY + 10;

            this.ctx.fillStyle = '#333333';
            this.ctx.fillRect(barX, barY, barWidth, barHeight);

            const timeColor = timeRatio > 0.5 ? '#44AA44' : timeRatio > 0.2 ? '#AAAA44' : '#AA4444';
            this.ctx.fillStyle = timeColor;
            this.ctx.fillRect(barX, barY, barWidth * timeRatio, barHeight);

            indicatorX += 30;
        });

        this.ctx.restore();
    }

    drawVacuumIndicator(snake, headX, headY) {
        const vacuumRadius = snake.size * 3.5;
        const time = Date.now() * 0.003;

        // Pulsating vacuum radius circle
        const pulseIntensity = 0.5 + Math.sin(time * 2) * 0.3;
        const alpha = 0.1 + pulseIntensity * 0.1;

        // Outer vacuum circle
        this.ctx.strokeStyle = this.addAlpha(snake.color, alpha);
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        this.ctx.beginPath();
        this.ctx.arc(headX, headY, vacuumRadius * pulseIntensity, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.setLineDash([]);

        // Inner vacuum glow
        const vacuumGlow = this.ctx.createRadialGradient(headX, headY, 0, headX, headY, vacuumRadius);
        vacuumGlow.addColorStop(0, 'transparent');
        vacuumGlow.addColorStop(0.7, 'transparent');
        vacuumGlow.addColorStop(0.9, this.addAlpha(snake.color, alpha * 0.5));
        vacuumGlow.addColorStop(1, 'transparent');

        this.ctx.fillStyle = vacuumGlow;
        this.ctx.beginPath();
        this.ctx.arc(headX, headY, vacuumRadius, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawWagerDisplay(snake) {
        const headX = snake.segments[0].x - this.camera.x;
        const headY = snake.segments[0].y - this.camera.y;

        // Skip if off-screen
        if (headX < -100 || headX > this.canvas.width + 100 || headY < -100 || headY > this.canvas.height + 100) {
            return;
        }

        // Show cash balance instead of wager - rounded to 2 decimal places
        const cashBalance = snake.isPlayer ? this.cashBalance : (snake.collectedCash || 0);
        const roundedBalance = parseFloat(cashBalance.toFixed(2));
        const displayY = headY - snake.size - 30; // Position above head

        // Create bounty chip design
        this.drawBountyChip(headX, displayY, roundedBalance, snake.isPlayer);
    }

    drawBountyChip(centerX, centerY, amount, isPlayer) {
        // Format the amount text
        const text = `$${amount.toFixed(2)}`;

        // Dynamic sizing based on amount value
        const baseSize = 20;
        const sizeMultiplier = Math.min(1.5, Math.max(0.8, Math.log10(amount + 1) * 0.3));
        const chipRadius = baseSize * sizeMultiplier;

        // Animation effects
        const time = Date.now() * 0.001;
        const pulseEffect = Math.sin(time * 2) * 0.1 + 1;
        const glowIntensity = Math.sin(time * 3) * 0.3 + 0.7;

        this.ctx.save();

        // Enhanced shadow with blur
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
        this.ctx.shadowBlur = 8;
        this.ctx.shadowOffsetX = 2;
        this.ctx.shadowOffsetY = 2;

        // Outer glow ring
        const glowGradient = this.ctx.createRadialGradient(
            centerX, centerY, chipRadius * 0.7,
            centerX, centerY, chipRadius * 1.4
        );
        const glowColor = isPlayer ? '#4CAF50' : '#F44336';
        glowGradient.addColorStop(0, this.addAlpha(glowColor, 0.4 * glowIntensity));
        glowGradient.addColorStop(1, 'transparent');

        this.ctx.fillStyle = glowGradient;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, chipRadius * 1.4, 0, Math.PI * 2);
        this.ctx.fill();

        // Reset shadow for chip itself
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;

        // Main chip background with gradient
        const chipGradient = this.ctx.createRadialGradient(
            centerX - chipRadius * 0.3, centerY - chipRadius * 0.3, 0,
            centerX, centerY, chipRadius
        );

        if (isPlayer) {
            chipGradient.addColorStop(0, '#81C784');
            chipGradient.addColorStop(0.7, '#4CAF50');
            chipGradient.addColorStop(1, '#2E7D32');
        } else {
            chipGradient.addColorStop(0, '#EF5350');
            chipGradient.addColorStop(0.7, '#F44336');
            chipGradient.addColorStop(1, '#C62828');
        }

        this.ctx.fillStyle = chipGradient;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, chipRadius * pulseEffect, 0, Math.PI * 2);
        this.ctx.fill();

        // Inner ring detail
        this.ctx.strokeStyle = isPlayer ? '#A5D6A7' : '#FFAB91';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, chipRadius * 0.8 * pulseEffect, 0, Math.PI * 2);
        this.ctx.stroke();

        // Outer border with neon effect
        this.ctx.strokeStyle = isPlayer ? '#66BB6A' : '#FF7043';
        this.ctx.lineWidth = 3;
        this.ctx.shadowColor = isPlayer ? '#4CAF50' : '#F44336';
        this.ctx.shadowBlur = 6 * glowIntensity;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, chipRadius * pulseEffect, 0, Math.PI * 2);
        this.ctx.stroke();

        // Reset shadow for text
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;

        // Enhanced text styling
        const fontSize = Math.max(10, chipRadius * 0.6);
        this.ctx.font = `bold ${fontSize}px 'Orbitron', monospace`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        // Text shadow for better readability
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillText(text, centerX + 1, centerY + 1);

        // Main text with glow
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.shadowColor = '#FFFFFF';
        this.ctx.shadowBlur = 4;
        this.ctx.fillText(text, centerX, centerY);

        // Add small decorative elements (chip details)
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;

        // Small dots around the edge for authentic chip look
        const dotCount = 8;
        const dotRadius = chipRadius * 0.9;
        const dotSize = 1.5;

        this.ctx.fillStyle = isPlayer ? '#2E7D32' : '#C62828';
        for (let i = 0; i < dotCount; i++) {
            const angle = (i / dotCount) * Math.PI * 2;
            const dotX = centerX + Math.cos(angle) * dotRadius;
            const dotY = centerY + Math.sin(angle) * dotRadius;

            this.ctx.beginPath();
            this.ctx.arc(dotX, dotY, dotSize, 0, Math.PI * 2);
            this.ctx.fill();
        }

        this.ctx.restore();
    }

    darkenColor(color, amount) {
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

    addAlpha(color, alpha) {
        // Add alpha to any color format
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

    drawDebugInfo() {
        if (this.player) {
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '16px Arial';
            this.ctx.fillText(`Player: ${Math.round(this.player.x)}, ${Math.round(this.player.y)}`, 10, this.canvas.height - 60);
            this.ctx.fillText(`Camera: ${Math.round(this.camera.x)}, ${Math.round(this.camera.y)}`, 10, this.canvas.height - 40);
            this.ctx.fillText(`Food: ${this.food.length}, Orbs: ${this.glowOrbs.length}`, 10, this.canvas.height - 20);
        }
    }

    drawMinimap() {
        // Skip if minimap context is not available
        if (!this.minimapCtx || !this.minimap) {
            // Only log occasionally to avoid spam
            if (Math.random() < 0.001) {
                console.log('Minimap not available - ctx:', !!this.minimapCtx, 'canvas:', !!this.minimap);
            }
            return;
        }

        // Clear minimap with dark background
        this.minimapCtx.fillStyle = '#0a0a0a';
        this.minimapCtx.fillRect(0, 0, this.minimap.width, this.minimap.height);

        const scaleX = this.minimap.width / this.worldWidth;
        const scaleY = this.minimap.height / this.worldHeight;

        // Draw world border
        this.minimapCtx.strokeStyle = '#444';
        this.minimapCtx.lineWidth = 2;
        this.minimapCtx.strokeRect(0, 0, this.minimap.width, this.minimap.height);

        // Draw food clusters (sample some food for performance)
        const foodSample = this.food.filter((_, i) => i % 10 === 0); // Show every 10th food item
        foodSample.forEach(food => {
            const x = food.x * scaleX;
            const y = food.y * scaleY;

            this.minimapCtx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            this.minimapCtx.beginPath();
            this.minimapCtx.arc(x, y, 0.5, 0, Math.PI * 2);
            this.minimapCtx.fill();
        });

        // Draw glow orbs with pulsing effect
        this.glowOrbs.forEach(orb => {
            const x = orb.x * scaleX;
            const y = orb.y * scaleY;
            const pulse = Math.sin(Date.now() * 0.005) * 0.5 + 1;

            // Glow effect
            this.minimapCtx.shadowColor = '#FFD700';
            this.minimapCtx.shadowBlur = 3 * pulse;
            this.minimapCtx.fillStyle = '#FFD700';
            this.minimapCtx.beginPath();
            this.minimapCtx.arc(x, y, 1.5 * pulse, 0, Math.PI * 2);
            this.minimapCtx.fill();
            this.minimapCtx.shadowBlur = 0;
        });

        // Draw weapons (in warfare mode)
        if (this.gameMode === 'warfare' && this.weapons) {
            this.weapons.forEach(weapon => {
                const x = weapon.x * scaleX;
                const y = weapon.y * scaleY;

                this.minimapCtx.fillStyle = '#FF6B35';
                this.minimapCtx.beginPath();
                this.minimapCtx.arc(x, y, 1, 0, Math.PI * 2);
                this.minimapCtx.fill();
            });
        }

        // Draw projectiles (in warfare mode)
        if (this.gameMode === 'warfare' && this.projectiles) {
            this.projectiles.forEach(projectile => {
                const x = projectile.x * scaleX;
                const y = projectile.y * scaleY;

                this.minimapCtx.fillStyle = '#FF0000';
                this.minimapCtx.beginPath();
                this.minimapCtx.arc(x, y, 0.5, 0, Math.PI * 2);
                this.minimapCtx.fill();
            });
        }

        // Draw remote players with enhanced visibility
        const aliveRemotePlayers = this.remotePlayers.filter(player => player.alive);
        console.log(`Total remote players: ${this.remotePlayers.length}, Alive remote players: ${aliveRemotePlayers.length}`);

        aliveRemotePlayers.forEach((player) => {
            const x = player.x * scaleX;
            const y = player.y * scaleY;
            const size = Math.max(3, Math.min(7, player.segments.length * 0.2 + 3)); // Larger, more visible

            // Enhanced remote player visibility with glow
            this.minimapCtx.shadowColor = player.color;
            this.minimapCtx.shadowBlur = 6;

            // Draw player body with solid color (no transparency for better visibility)
            this.minimapCtx.fillStyle = player.color;
            this.minimapCtx.beginPath();
            this.minimapCtx.arc(x, y, size, 0, Math.PI * 2);
            this.minimapCtx.fill();

            // Draw direction indicator with contrasting color
            const headX = x + Math.cos(player.angle || 0) * (size + 3);
            const headY = y + Math.sin(player.angle || 0) * (size + 3);
            this.minimapCtx.fillStyle = '#FFFFFF'; // White direction indicator for contrast
            this.minimapCtx.beginPath();
            this.minimapCtx.arc(headX, headY, size * 0.4, 0, Math.PI * 2);
            this.minimapCtx.fill();

            // Add player name indicator (small text)
            if (player.username) {
                this.minimapCtx.fillStyle = '#FFFFFF';
                this.minimapCtx.font = '8px Arial';
                this.minimapCtx.textAlign = 'center';
                this.minimapCtx.fillText(player.username.substring(0, 3), x, y - size - 5);
            }

            this.minimapCtx.shadowBlur = 0;
        });

        // Draw player snake with enhanced visibility
        if (this.player && this.player.alive) {
            const x = this.player.x * scaleX;
            const y = this.player.y * scaleY;
            const size = Math.max(2, Math.min(5, this.player.segments.length * 0.1 + 2));

            // Player glow effect
            this.minimapCtx.shadowColor = '#4CAF50';
            this.minimapCtx.shadowBlur = 5;

            // Draw player body
            this.minimapCtx.fillStyle = '#4CAF50';
            this.minimapCtx.beginPath();
            this.minimapCtx.arc(x, y, size, 0, Math.PI * 2);
            this.minimapCtx.fill();

            // Draw direction indicator for player
            const headX = x + Math.cos(this.player.angle) * (size + 2);
            const headY = y + Math.sin(this.player.angle) * (size + 2);

            this.minimapCtx.strokeStyle = '#81C784';
            this.minimapCtx.lineWidth = 2;
            this.minimapCtx.beginPath();
            this.minimapCtx.moveTo(x, y);
            this.minimapCtx.lineTo(headX, headY);
            this.minimapCtx.stroke();

            this.minimapCtx.shadowBlur = 0;
        }

        // Draw camera view rectangle
        const camX = this.camera.x * scaleX;
        const camY = this.camera.y * scaleY;
        const camW = this.canvas.width * scaleX;
        const camH = this.canvas.height * scaleY;

        this.minimapCtx.strokeStyle = 'rgba(76, 175, 80, 0.8)';
        this.minimapCtx.lineWidth = 1;
        this.minimapCtx.setLineDash([2, 2]);
        this.minimapCtx.strokeRect(camX, camY, camW, camH);
        this.minimapCtx.setLineDash([]);

        // Add minimap title
        this.minimapCtx.fillStyle = '#fff';
        this.minimapCtx.font = '10px monospace';
        this.minimapCtx.textAlign = 'center';
        this.minimapCtx.fillText('RADAR', this.minimap.width / 2, 12);

        // Add legend
        let legendY = this.minimap.height - 25;
        this.minimapCtx.font = '8px monospace';
        this.minimapCtx.textAlign = 'left';

        // Player legend
        this.minimapCtx.fillStyle = '#4CAF50';
        this.minimapCtx.beginPath();
        this.minimapCtx.arc(10, legendY, 2, 0, Math.PI * 2);
        this.minimapCtx.fill();
        this.minimapCtx.fillStyle = '#fff';
        this.minimapCtx.fillText('YOU', 16, legendY + 3);

        // Remote players legend
        this.minimapCtx.fillStyle = '#f44336';
        this.minimapCtx.beginPath();
        this.minimapCtx.arc(50, legendY, 2, 0, Math.PI * 2);
        this.minimapCtx.fill();
        this.minimapCtx.fillStyle = '#fff';
        this.minimapCtx.fillText('PLAYERS', 56, legendY + 3);

        // Orbs legend
        this.minimapCtx.fillStyle = '#FFD700';
        this.minimapCtx.beginPath();
        this.minimapCtx.arc(80, legendY, 2, 0, Math.PI * 2);
        this.minimapCtx.fill();
        this.minimapCtx.fillStyle = '#fff';
        this.minimapCtx.fillText('ORBS', 86, legendY + 3);

        // Weapons legend (warfare mode only)
        if (this.gameMode === 'warfare') {
            this.minimapCtx.fillStyle = '#FF6B35';
            this.minimapCtx.beginPath();
            this.minimapCtx.arc(130, legendY, 2, 0, Math.PI * 2);
            this.minimapCtx.fill();
            this.minimapCtx.fillStyle = '#fff';
            this.minimapCtx.fillText('WEAPONS', 136, legendY + 3);

            legendY += 12;
            this.minimapCtx.fillStyle = '#44FF44';
            this.minimapCtx.beginPath();
            this.minimapCtx.arc(130, legendY, 2, 0, Math.PI * 2);
            this.minimapCtx.fill();
            this.minimapCtx.fillStyle = '#fff';
            this.minimapCtx.fillText('AMMO', 136, legendY + 3);
        }
    }

    gameLoop() {
        if (this.gameRunning) {
            this.update();
            this.render();
        }

        requestAnimationFrame(() => this.gameLoop());
    }

    // React integration methods
    async start() {
        // FIXED: Use the same initialization as restart() to ensure identical behavior
        this.setupEventListeners();

        // Initialize multiplayer if enabled
        if (this.isMultiplayer) {
            await this.initializeMultiplayer();
        }

        this.restart(); // This will do the complete initialization just like subsequent games
        this.gameLoop(); // Start the game loop ONCE
    }

    setMinimapCanvas(minimapCanvas) {
        console.log('Setting minimap canvas:', minimapCanvas);
        this.minimap = minimapCanvas;
        this.minimapCtx = minimapCanvas.getContext('2d');
        this.minimap.width = 250;
        this.minimap.height = 200;
        console.log('Minimap setup complete:', {
            canvas: !!this.minimap,
            ctx: !!this.minimapCtx,
            width: this.minimap.width,
            height: this.minimap.height
        });
    }

    restart() {
        console.log('🔄🔄🔄 RESTART METHOD CALLED 🔄🔄🔄');
        // Reset game state
        this.gameRunning = true;
        this.score = 0;
        this.cashBalance = 0; // Reset cash balance
        this.camera = { x: 1500, y: 1500 };

        // Reset weapon system completely
        this.weaponInventory = {
            primaryWeapon: null,
            secondaryWeapon: null,
            sidearm: new Weapon(0, 0, 'sidearm'), // Always available
            currentSlot: 'sidearm'
        };
        this.currentWeapon = this.weaponInventory.sidearm;
        this.lastWeaponSlot = 'sidearm'; // For quick switching
        this.currentWeaponIndex = 0;
        this.lastShotTime = 0;
        this.projectiles = [];

        // Reset ammo inventory
        this.ammoInventory = {
            light_energy: 0,
            medium_energy: 0,
            heavy_energy: 0,
            light_plasma: 0,
            medium_plasma: 0,
            heavy_plasma: 0,
            missiles: 0,
            rail_slugs: 0
        };

        // Reset powerup system
        this.powerups = [];
        this.cashedOut = false;
        this.spectating = false;

        // Reset player completely
        this.player = new Snake(2000, 2000, '#4CAF50', true);
        this.player.gameInstance = this; // Set game reference

        // Reset all player properties to default state
        this.player.speedMultiplier = 1.0; // Reset speed multiplier
        this.player.boostCapRemoved = false; // Reset boost cap
        this.player.boost = 100; // Reset boost to 100%
        this.player.alive = true; // Ensure player is alive
        this.player.segments = [{ x: 2000, y: 2000, health: 100, maxHealth: 100 }]; // Reset to single head segment
        this.player.growthQueue = 0; // Reset growth queue

        // Activate spawn invincibility for reset player
        this.player.activateSpawnInvincibility(this.playerWager);

        // Set player wager and starting cash for both modes (gambling mechanics in both)
        this.playerWager = 50; // Default $50 wager
        this.player.wager = this.playerWager;
        // Give player starting cash equal to their wager
        this.cashBalance = this.playerWager;

        // Log initial player state for debugging
        console.log('Player initialized with', this.player.segments.length, 'segments and $' + this.cashBalance + ' cash balance');
        if (this.gameMode === 'classic') {
            // In classic mode, score is separate from cash
            this.score = 0;
        } else {
            // In warfare mode, score equals cash
            this.score = this.cashBalance;
        }

        // MULTIPLAYER MODE: No AI snakes on restart
        this.aiSnakes = [];
        console.log('🔄 Multiplayer restart - AI snakes remain disabled');

        // Reset game objects
        this.food = [];
        this.glowOrbs = [];
        this.weapons = [];
        this.generateFood();
        this.generateGlowOrbs();

        // DON'T start a new game loop - one is already running from start()
        // The existing game loop will resume when gameRunning becomes true
    }

    cashOut() {
        if (this.cashedOut || !this.player.alive) return;

        // Check if player has gained cash beyond their initial wager
        const initialWager = this.playerWager || 50;
        if (this.cashBalance <= initialWager) {
            console.log(`Cannot cash out: Current balance $${this.cashBalance} is not greater than initial wager $${initialWager}`);
            return; // Cannot cash out if no profit made
        }

        console.log(`Player cashing out with $${this.cashBalance} (profit: $${this.cashBalance - initialWager})`);

        // Record the cashout
        this.cashedOut = true;
        this.cashoutBalance = this.cashBalance;
        this.spectating = true;

        // "Kill" the player but don't create coins
        this.player.alive = false;

        // Update game state to trigger the modal
        if (this.onStateUpdate) {
            this.onStateUpdate({
                score: this.score,
                cashBalance: this.cashBalance,
                length: this.player.length,
                boost: this.player.boost,
                weapon: this.currentWeapon ? this.currentWeapon.name : 'None',
                weaponAmmo: this.currentWeapon ?
                    (this.currentWeapon.maxAmmo === Infinity ? '∞' : `${this.currentWeapon.currentAmmo}/${this.currentWeapon.maxAmmo}`) :
                    '0/0',
                cooldown: 'Ready',
                isGameOver: true,
                finalScore: this.score,
                finalLength: this.player.length,
                cashedOut: true,
                cashoutAmount: this.cashoutBalance
            });
        }
    }

    cycleThroughSnakes() {
        if (!this.spectating) return;

        // In multiplayer, spectate remote players instead of AI
        const aliveSnakes = this.remotePlayers.filter(player => player.alive);
        if (aliveSnakes.length === 0) return;

        this.spectateTarget = (this.spectateTarget + 1) % aliveSnakes.length;
        const targetSnake = aliveSnakes[this.spectateTarget];

        // Update camera to follow the spectated snake
        this.camera.x = targetSnake.x - this.canvas.width / 2;
        this.camera.y = targetSnake.y - this.canvas.height / 2;
    }

    // ===== MULTIPLAYER METHODS =====

    async initializeMultiplayer() {
        if (!this.isMultiplayer || !this.multiplayerService) {
            console.log('🌐 Multiplayer service already connected or not needed');
            return;
        }

        try {
            console.log('🌐 Multiplayer service connected to game instance');

            // Set up player ID if available
            if (this.multiplayerService.playerId) {
                this.playerId = this.multiplayerService.playerId;
            }

        } catch (error) {
            console.error('❌ Failed to initialize multiplayer service:', error);
        }
    }

    updateRemotePlayers() {
        // Update remote players based on received data
        this.remotePlayers.forEach(player => {
            if (player.alive) {
                // Interpolate position for smooth movement
                this.interpolatePlayerPosition(player);

                // Update player segments
                if (player.segments && player.segments.length > 0) {
                    this.updateRemotePlayerSegments(player);
                }
            }
        });
    }

    interpolatePlayerPosition(player) {
        // Simple linear interpolation for smooth movement
        if (player.targetX !== undefined && player.targetY !== undefined) {
            const lerpFactor = 0.1; // Adjust for smoothness vs responsiveness
            player.x += (player.targetX - player.x) * lerpFactor;
            player.y += (player.targetY - player.y) * lerpFactor;
        }
    }

    updateRemotePlayerSegments(player) {
        // Update segments to follow the head
        if (player.segments.length > 1) {
            for (let i = 1; i < player.segments.length; i++) {
                const prevSegment = player.segments[i - 1];
                const currentSegment = player.segments[i];

                const dx = prevSegment.x - currentSegment.x;
                const dy = prevSegment.y - currentSegment.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance > player.segmentDistance) {
                    const ratio = player.segmentDistance / distance;
                    currentSegment.x = prevSegment.x - dx * ratio;
                    currentSegment.y = prevSegment.y - dy * ratio;
                }
            }
        }
    }

    // Broadcast game events to other players
    broadcastGameEvent(eventType, data) {
        if (this.multiplayerService && this.isMultiplayer) {
            this.multiplayerService.broadcastGameEvent({
                type: eventType,
                playerId: this.playerId,
                data: data,
                timestamp: Date.now()
            });
        }
    }

    initializeGamepadSupport() {
        // Check if gamepad API is supported
        if (!('getGamepads' in navigator)) {
            console.log('Gamepad API not supported');
            return;
        }

        console.log('Initializing gamepad support...');
        this.gamepads = {};
        this.deadzone = 0.15;
        this.buttonStates = {};
        this.previousButtonStates = {};

        // Controller mappings
        this.controllerMapping = {
            buttons: {
                A: 0,           // A/Cross button (boost)
                B: 1,           // B/Circle button (cancel)
                X: 2,           // X/Square button (cashout)
                Y: 3,           // Y/Triangle button (spectate next)
                LB: 4,          // Left bumper (primary weapon)
                RB: 5,          // Right bumper (secondary weapon)
                LT: 6,          // Left trigger (sidearm)
                RT: 7,          // Right trigger (shoot)
                Back: 8,        // Back/Share button
                Start: 9,       // Start/Options button
                LS: 10,         // Left stick click
                RS: 11,         // Right stick click
                DPadUp: 12,     // D-pad up
                DPadDown: 13,   // D-pad down
                DPadLeft: 14,   // D-pad left
                DPadRight: 15   // D-pad right
            },
            axes: {
                LeftStickX: 0,  // Left stick horizontal
                LeftStickY: 1,  // Left stick vertical
                RightStickX: 2, // Right stick horizontal
                RightStickY: 3  // Right stick vertical
            }
        };

        // Listen for gamepad events
        window.addEventListener('gamepadconnected', (e) => {
            console.log('🎮 Gamepad connected:', e.gamepad.id);
            console.log('🎮 Gamepad details:', {
                id: e.gamepad.id,
                index: e.gamepad.index,
                buttons: e.gamepad.buttons.length,
                axes: e.gamepad.axes.length
            });
            this.addGamepad(e.gamepad);
        });

        window.addEventListener('gamepaddisconnected', (e) => {
            console.log('🎮 Gamepad disconnected:', e.gamepad.id);
            this.removeGamepad(e.gamepad);
        });

        // Start gamepad polling
        this.startGamepadPolling();
        console.log('Gamepad support initialized successfully');

        // Check for already connected gamepads
        this.checkExistingGamepads();
    }

    checkExistingGamepads() {
        console.log('🎮 Checking for existing gamepads...');
        const gamepads = navigator.getGamepads();
        let foundGamepads = 0;

        for (let i = 0; i < gamepads.length; i++) {
            if (gamepads[i]) {
                console.log('🎮 Found existing gamepad:', {
                    index: i,
                    id: gamepads[i].id,
                    connected: gamepads[i].connected
                });
                this.addGamepad(gamepads[i]);
                foundGamepads++;
            }
        }

        if (foundGamepads === 0) {
            console.log('🎮 No gamepads currently connected. Connect a gamepad and press any button to activate it.');
        } else {
            console.log(`🎮 Found ${foundGamepads} connected gamepad(s)`);
        }
    }

    addGamepad(gamepad) {
        console.log('🎮 Adding gamepad to tracking:', gamepad.index);
        this.gamepads[gamepad.index] = gamepad;
        this.buttonStates[gamepad.index] = {};
        this.previousButtonStates[gamepad.index] = {};
        console.log('🎮 Total gamepads tracked:', Object.keys(this.gamepads).length);
    }

    removeGamepad(gamepad) {
        delete this.gamepads[gamepad.index];
        delete this.buttonStates[gamepad.index];
        delete this.previousButtonStates[gamepad.index];
    }

    startGamepadPolling() {
        const pollGamepads = () => {
            this.updateGamepads();
            requestAnimationFrame(pollGamepads);
        };
        pollGamepads();
    }

    updateGamepads() {
        const gamepads = navigator.getGamepads();

        for (let i = 0; i < gamepads.length; i++) {
            const gamepad = gamepads[i];
            if (gamepad && this.gamepads[i]) {
                this.handleGamepadInput(gamepad);
            }
        }
    }

    handleGamepadInput(gamepad) {
        // Store previous button states
        this.previousButtonStates[gamepad.index] = { ...this.buttonStates[gamepad.index] };

        // Update current button states
        for (let i = 0; i < gamepad.buttons.length; i++) {
            this.buttonStates[gamepad.index][i] = gamepad.buttons[i].pressed;
        }

        // Handle movement (left stick)
        const leftX = gamepad.axes[this.controllerMapping.axes.LeftStickX];
        const leftY = gamepad.axes[this.controllerMapping.axes.LeftStickY];

        if (Math.abs(leftX) > this.deadzone || Math.abs(leftY) > this.deadzone) {
            // Debug movement input
            if (Math.random() < 0.01) { // Log occasionally to avoid spam
                console.log('🎮 Gamepad movement:', { leftX: leftX.toFixed(2), leftY: leftY.toFixed(2) });
            }

            // Convert stick input to world coordinates
            const worldX = this.player.x + leftX * 200; // Scale factor for movement
            const worldY = this.player.y + leftY * 200;

            // Update mouse position for snake direction
            this.mouse.x = worldX - this.camera.x;
            this.mouse.y = worldY - this.camera.y;
        }

        // Handle boost (A/Cross button)
        const boostButton = this.controllerMapping.buttons.A;
        const wasBoosting = this.boosting;
        this.boosting = this.isButtonPressed(gamepad.index, boostButton);

        if (this.boosting && !wasBoosting) {
            console.log('🎮 Boost button pressed');
        }

        // Handle shooting (right trigger) - only if not invincible
        const shootButton = this.controllerMapping.buttons.RT;
        if (this.isButtonJustPressed(gamepad.index, shootButton) && !this.player.isInvincible()) {
            console.log('🎮 Shoot button pressed');
            this.shoot();
        }

        // Handle weapon switching
        if (this.isButtonJustPressed(gamepad.index, this.controllerMapping.buttons.LB)) {
            this.switchToWeapon('primaryWeapon');
        }
        if (this.isButtonJustPressed(gamepad.index, this.controllerMapping.buttons.RB)) {
            this.switchToWeapon('secondaryWeapon');
        }
        if (this.isButtonJustPressed(gamepad.index, this.controllerMapping.buttons.LT)) {
            this.switchToWeapon('sidearm');
        }

        // Handle cashout (X/Square button)
        const cashoutButton = this.controllerMapping.buttons.X;
        if (this.isButtonJustPressed(gamepad.index, cashoutButton)) {
            this.cashOut();
        }

        // Handle spectate cycling (Y/Triangle button)
        const spectateButton = this.controllerMapping.buttons.Y;
        if (this.isButtonJustPressed(gamepad.index, spectateButton)) {
            this.cycleThroughSnakes();
        }
    }

    isButtonPressed(gamepadIndex, buttonIndex) {
        return this.buttonStates[gamepadIndex] && this.buttonStates[gamepadIndex][buttonIndex];
    }

    isButtonJustPressed(gamepadIndex, buttonIndex) {
        const current = this.buttonStates[gamepadIndex] && this.buttonStates[gamepadIndex][buttonIndex];
        const previous = this.previousButtonStates[gamepadIndex] && this.previousButtonStates[gamepadIndex][buttonIndex];
        return current && !previous;
    }

    destroy() {
        console.log('Destroying game...');
        this.gameRunning = false;

        // Clean up gamepad support
        if (this.gamepads) {
            this.gamepads = {};
            this.buttonStates = {};
            this.previousButtonStates = {};
        }

        // Note: Event listeners are added inline, so they'll be cleaned up when canvas is removed
        // No need to manually remove them since we don't store references
    }

    canShoot() {
        return Date.now() - this.lastShotTime > this.weaponCooldown;
    }

    updateGameState() {
        // Don't update game state if game is over - let the gameOver() method handle it
        if (!this.gameRunning) {
            console.log('Skipping updateGameState - game is not running');
            return;
        }

        if (this.onStateUpdate) {
            const weaponCooldownRemaining = this.currentWeapon ?
                Math.max(0, this.currentWeapon.fireRate - (Date.now() - this.currentWeapon.lastShotTime)) : 0;
            const cooldownText = weaponCooldownRemaining > 0 ?
                `Cooldown: ${(weaponCooldownRemaining / 1000).toFixed(1)}s` :
                'Ready';

            // Calculate cooldown progress (0-100%)
            const cooldownProgress = this.currentWeapon && this.currentWeapon.fireRate > 0 ?
                Math.max(0, 100 - (weaponCooldownRemaining / this.currentWeapon.fireRate) * 100) : 100;

            // Get weapon slot information
            const weaponSlots = {
                primary: this.weaponInventory.primaryWeapon ?
                    `${this.weaponInventory.primaryWeapon.name} (${this.weaponInventory.primaryWeapon.currentAmmo}/${this.weaponInventory.primaryWeapon.maxAmmo})` :
                    'Empty',
                secondary: this.weaponInventory.secondaryWeapon ?
                    `${this.weaponInventory.secondaryWeapon.name} (${this.weaponInventory.secondaryWeapon.currentAmmo}/${this.weaponInventory.secondaryWeapon.maxAmmo})` :
                    'Empty',
                sidearm: `${this.weaponInventory.sidearm.name} (∞)`
            };

            // Get ammo inventory
            const ammoInventory = this.getAmmoInventory();

            this.onStateUpdate({
                score: this.score, // Score for classic mode, cash for warfare mode
                cashBalance: this.cashBalance, // Always show cash balance
                length: this.player.length,
                boost: this.player.boost,
                weapon: this.currentWeapon ? this.currentWeapon.name : 'None',
                weaponAmmo: this.currentWeapon ?
                    (this.currentWeapon.maxAmmo === Infinity ? '∞' : `${this.currentWeapon.currentAmmo}/${this.currentWeapon.maxAmmo}`) :
                    '0/0',
                weaponTier: this.currentWeapon ? `Tier ${this.currentWeapon.tier}` : 'None',
                weaponSlots: weaponSlots,
                currentSlot: this.weaponInventory.currentSlot,
                cooldown: this.currentWeapon && this.currentWeapon.canShoot() ? 'Ready' : cooldownText,
                cooldownProgress: cooldownProgress,
                ammoInventory: ammoInventory,
                isGameOver: !this.gameRunning || this.cashedOut, // Include cashout state
                finalScore: this.gameMode === 'warfare' ? this.cashBalance : this.score,
                finalLength: this.player.length,
                cashedOut: this.cashedOut, // Preserve cashout state
                cashoutAmount: this.cashoutBalance // Preserve cashout amount
            });
        }
    }
}

class Snake {
    constructor(x, y, color, isPlayer = false) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.isPlayer = isPlayer;
        this.baseSize = 8;
        this.speed = 4; // Increased from 2 to 4 for faster base movement
        this.baseSpeed = 4; // Store base speed for calculations
        this.speedMultiplier = 1.0; // Speed multiplier from food (100% = 1.0)
        this.angle = Math.random() * Math.PI * 2;
        this.targetAngle = this.angle;
        this.alive = true;
        this.boost = 100;
        this.maxBoost = 100;
        this.boostCapRemoved = false; // Track if boost cap has been removed by food

        // Snake segments - Start with just head, growth is cash-based
        this.segments = [{ x: x, y: y, health: 100, maxHealth: 100 }];

        // Path tracking for continuous movement in classic mode
        this.pathHistory = [{ x: x, y: y }]; // Store head's movement path, start with initial position
        this.maxPathLength = 1000; // Increased for larger snakes
        this.pathRecordDistance = 2; // Only record path points when head moves this distance

        // Growth system - cash-based growth
        this.growthProgress = 0; // Progress toward next segment (0-1)
        this.growthRate = 0.02; // How fast to grow each frame

        // Invincibility system for new spawns
        this.invincible = false;
        this.invincibilityEndTime = 0;
        this.blinkPhase = 0; // For blinking animation
        this.shrinkProgress = 0; // Progress toward shrinking
        this.growthQueue = 0; // Queue for growth from food consumption

        // AI Weapon System (for non-player snakes)
        if (!isPlayer) {
            this.weaponInventory = {
                primaryWeapon: null,
                secondaryWeapon: null,
                sidearm: new Weapon(0, 0, 'sidearm'),
                currentSlot: 'sidearm'
            };
            this.currentWeapon = this.weaponInventory.sidearm;
            this.lastWeaponSlot = 'sidearm';

            // AI ammo inventory
            this.ammoInventory = {
                light_energy: 0,
                heavy_energy: 0,
                plasma_cells: 0,
                heavy_plasma: 0,
                rockets: 0,
                rail_slugs: 0
            };

            // AI Combat Intelligence
            this.aiPersonality = this.generateAIPersonality();
            this.lastShotTime = 0;
            this.targetEnemy = null;
            this.combatState = 'hunting'; // hunting, engaging, retreating, collecting
            this.lastStateChange = Date.now();
            this.threatLevel = 0;
            this.aggressionLevel = Math.random() * 0.5 + 0.3; // 0.3-0.8
            this.accuracy = 0.6 + Math.random() * 0.3; // 0.6-0.9
            this.reactionTime = 200 + Math.random() * 300; // 200-500ms
            this.lastDecisionTime = 0;
            this.patrolTarget = { x: x, y: y };
            this.lastKnownEnemyPos = null;
            this.weaponPreference = this.generateWeaponPreference();
        }

        // Powerup system for all snakes
        this.activePowerups = []; // Array of active powerup effects
        this.powerupInventory = []; // Collected powerups not yet activated

        // Gambling system properties
        this.wager = 0; // Snake's wager amount
        this.cashValue = 0; // Total cash value of this snake
    }

    get size() {
        // Size directly correlates to cash balance - no cap on growth
        const cashBalance = this.isPlayer ?
            (this.gameInstance ? this.gameInstance.cashBalance : 50) :
            (this.collectedCash || 50);

        // Base size + cash-based scaling (no cap)
        const cashMultiplier = Math.sqrt(cashBalance / 10); // Smooth scaling
        return this.baseSize + cashMultiplier * 2; // Direct cash-to-size correlation
    }

    getGame() {
        // Helper method to get game instance (will be set by game)
        return this.gameInstance;
    }

    get length() {
        // Always return actual segment count for consistency
        return this.segments.length;
    }

    // Get target length based on cash balance for growth system
    getTargetLength() {
        // Target length based on cash balance
        const cashBalance = this.isPlayer ?
            (this.gameInstance ? this.gameInstance.cashBalance : 50) :
            (this.collectedCash || 50);

        // $10 = 1 segment beyond base 1, minimum 1 segment (head only)
        const baseSegments = 1;
        const cashPerSegment = 10;
        const bonusSegments = Math.floor(cashBalance / cashPerSegment);
        const targetLength = baseSegments + bonusSegments;

        // Removed spam logging
        return Math.max(baseSegments, targetLength);
    }

    get segmentDistance() {
        return this.size * 1.2;
    }

    update(boosting = false) {
        if (!this.alive) return;

        // Smooth angle transition
        let angleDiff = this.targetAngle - this.angle;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

        this.angle += angleDiff * 0.1;

        // Handle boosting
        let currentSpeed = this.baseSpeed * this.speedMultiplier; // Apply food speed multiplier
        if (boosting && this.boost > 0) {
            currentSpeed *= 2.5; // Increased from 2 to 2.5 for faster boost speed
            this.boost -= 0.4; // Reduced from 1 to 0.4 for longer boost duration

            // If boost reaches 0 and cap was removed, restore the cap
            if (this.boost <= 0 && this.boostCapRemoved) {
                this.boostCapRemoved = false;
            }
        } else if (!boosting) {
            // Natural regeneration only goes up to maxBoost (100%)
            // Only food can push boost beyond 100%
            if (this.boost < this.maxBoost) {
                this.boost += 0.5;
            }
        }

        // Apply powerup speed multipliers (like battering ram)
        currentSpeed *= this.getSpeedMultiplier();

        // Move head
        this.x += Math.cos(this.angle) * currentSpeed;
        this.y += Math.sin(this.angle) * currentSpeed;

        // Keep in world bounds
        this.x = Math.max(this.size, Math.min(4000 - this.size, this.x));
        this.y = Math.max(this.size, Math.min(4000 - this.size, this.y));

        // Update head position
        this.segments[0].x = this.x;
        this.segments[0].y = this.y;

        // Track head's path for continuous movement (classic mode)
        if (this.gameInstance && this.gameInstance.gameMode === 'classic') {
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

        // Handle natural growth
        this.handleGrowth();

        // Update powerups
        this.updatePowerups();

        // Update invincibility
        this.updateInvincibility();

        // Update body segments - different behavior for classic vs warfare mode
        if (this.gameInstance && this.gameInstance.gameMode === 'classic') {
            // Classic mode: Continuous path following
            this.updateSegmentsClassicMode();
        } else {
            // Warfare mode: Fluid/jelly-like movement
            this.updateSegmentsWarfareMode();
        }
    }

    updateSegmentsClassicMode() {
        // Classic mode: Body segments continuously follow the head's path
        if (this.pathHistory.length < 2 || this.segments.length < 2) return;

        // Calculate total path length for better distribution
        let totalPathLength = 0;
        for (let i = 1; i < this.pathHistory.length; i++) {
            const current = this.pathHistory[i];
            const previous = this.pathHistory[i - 1];
            totalPathLength += Math.hypot(current.x - previous.x, current.y - previous.y);
        }

        // If path is too short, fall back to simple following
        const requiredPathLength = (this.segments.length - 1) * this.segmentDistance;
        if (totalPathLength < requiredPathLength) {
            this.updateSegmentsWarfareMode(); // Use warfare mode as fallback
            return;
        }

        for (let i = 1; i < this.segments.length; i++) {
            // Calculate how far back in the path this segment should be
            const segmentDelay = i * this.segmentDistance;

            // Find the appropriate position in the path history
            let accumulatedDistance = 0;
            let targetPoint = null;

            // Start from the most recent point and work backwards
            for (let j = this.pathHistory.length - 1; j > 0; j--) {
                const current = this.pathHistory[j];
                const previous = this.pathHistory[j - 1];
                const stepDistance = Math.hypot(current.x - previous.x, current.y - previous.y);

                if (accumulatedDistance + stepDistance >= segmentDelay) {
                    // Interpolate between these two points
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

            // If we found a target point, move the segment there smoothly
            if (targetPoint) {
                // Add some smoothing to prevent jittery movement
                const smoothing = 0.8; // Higher value = more direct following
                this.segments[i].x += (targetPoint.x - this.segments[i].x) * smoothing;
                this.segments[i].y += (targetPoint.y - this.segments[i].y) * smoothing;
            } else {
                // Fallback: use the oldest point in the path
                const oldestPoint = this.pathHistory[0];
                if (oldestPoint) {
                    const smoothing = 0.3;
                    this.segments[i].x += (oldestPoint.x - this.segments[i].x) * smoothing;
                    this.segments[i].y += (oldestPoint.y - this.segments[i].y) * smoothing;
                }
            }
        }
    }

    updateSegmentsWarfareMode() {
        // Warfare mode: Fluid/jelly-like movement (original behavior)
        for (let i = 1; i < this.segments.length; i++) {
            const prev = this.segments[i - 1];
            const current = this.segments[i];

            const dx = prev.x - current.x;
            const dy = prev.y - current.y;
            const distance = Math.hypot(dx, dy);

            if (distance > this.segmentDistance) {
                // Fluid movement - segments follow with slight delay and smoothing
                const angle = Math.atan2(dy, dx);
                const targetX = prev.x - Math.cos(angle) * this.segmentDistance;
                const targetY = prev.y - Math.sin(angle) * this.segmentDistance;

                // Smooth interpolation for jelly-like effect
                const smoothing = 0.3; // Adjust for more/less fluid movement
                current.x += (targetX - current.x) * smoothing;
                current.y += (targetY - current.y) * smoothing;
            }
        }
    }

    activateSpawnInvincibility(cashBalance) {
        // Calculate invincibility duration based on cash balance
        // Formula: 1 second base + 0.02 seconds per dollar (max 3 seconds)
        const baseDuration = 1000; // 1 second base
        const perDollarDuration = 20; // 0.02 seconds per dollar
        const maxDuration = 3000; // 3 seconds maximum

        const duration = Math.min(baseDuration + (cashBalance * perDollarDuration), maxDuration);

        this.invincible = true;
        this.invincibilityEndTime = Date.now() + duration;
        this.blinkPhase = 0;

        console.log(`Snake activated invincibility for ${duration/1000} seconds (cash: $${cashBalance})`);
    }

    updateInvincibility() {
        if (this.invincible) {
            const now = Date.now();
            if (now >= this.invincibilityEndTime) {
                this.invincible = false;
                console.log('Snake invincibility expired');
            } else {
                // Update blinking animation
                this.blinkPhase += 0.3; // Adjust speed of blinking
            }
        }
    }

    isInvincible() {
        return this.invincible && Date.now() < this.invincibilityEndTime;
    }

    handleGrowth() {
        // Cash-based growth system - snake size determined by cash balance
        const targetLength = this.getTargetLength();
        const currentLength = this.segments.length;

        if (targetLength > currentLength) {
            // Need to grow based on cash balance
            this.growthProgress += this.growthRate * 2; // Smooth growth animation
            if (this.growthProgress >= 1) {
                this.addSegment();
                this.growthProgress = 0;
            }
        } else if (targetLength < currentLength && currentLength > 3) {
            // Need to shrink (but keep minimum 3 segments)
            this.shrinkProgress = (this.shrinkProgress || 0) + this.growthRate;
            if (this.shrinkProgress >= 1) {
                this.removeSegment();
                this.shrinkProgress = 0;
            }
        }
    }

    addSegment() {
        // Add segment between head and body for more natural growth
        // This makes the snake grow from the middle, keeping head moving and tail stationary
        if (this.segments.length < 2) {
            // If only head exists, add first body segment behind it
            const head = this.segments[0];
            this.segments.push({
                x: head.x - Math.cos(this.angle) * this.segmentDistance,
                y: head.y - Math.sin(this.angle) * this.segmentDistance,
                health: 100,
                maxHealth: 100
            });
        } else {
            // Insert new segment between head and first body segment
            const head = this.segments[0];
            const firstBody = this.segments[1];

            const newSegment = {
                x: (head.x + firstBody.x) / 2,
                y: (head.y + firstBody.y) / 2,
                health: 100,
                maxHealth: 100
            };

            // Insert at position 1 (between head and body)
            this.segments.splice(1, 0, newSegment);
        }
    }

    removeSegment() {
        // Remove the tail segment (but keep minimum 3 segments)
        if (this.segments.length > 3) {
            this.segments.pop();
        }
    }

    grow() {
        // Instead of immediately adding segments, queue them for natural growth
        this.growthQueue += 2; // Grow by 2 segments per food
    }

    // Add speed boost from food consumption (warfare mode)
    addSpeedBoost(percentage) {
        this.speedMultiplier += percentage / 100; // Convert percentage to decimal
        // No cap on speed - can go beyond 100%
    }

    // AI Personality Generation
    generateAIPersonality() {
        const personalities = [
            { name: 'Aggressive', aggression: 0.8, caution: 0.2, teamwork: 0.3 },
            { name: 'Tactical', aggression: 0.5, caution: 0.7, teamwork: 0.6 },
            { name: 'Sniper', aggression: 0.4, caution: 0.8, teamwork: 0.4 },
            { name: 'Berserker', aggression: 0.9, caution: 0.1, teamwork: 0.2 },
            { name: 'Support', aggression: 0.3, caution: 0.6, teamwork: 0.8 },
            { name: 'Hunter', aggression: 0.6, caution: 0.5, teamwork: 0.5 }
        ];
        return personalities[Math.floor(Math.random() * personalities.length)];
    }

    generateWeaponPreference() {
        const preferences = [
            'laser', 'plasma', 'rocket', 'rail', 'balanced'
        ];
        return preferences[Math.floor(Math.random() * preferences.length)];
    }

    // AI Weapon Management
    addWeaponToInventory(weapon) {
        if (!this.weaponInventory) return;

        // Try to add to primary slot first, then secondary
        if (!this.weaponInventory.primaryWeapon) {
            this.weaponInventory.primaryWeapon = weapon;
            this.switchToWeapon('primaryWeapon');
        } else if (!this.weaponInventory.secondaryWeapon) {
            this.weaponInventory.secondaryWeapon = weapon;
            this.switchToWeapon('secondaryWeapon');
        } else {
            // Replace current weapon based on preference
            const currentSlot = this.weaponInventory.currentSlot;
            if (currentSlot !== 'sidearm') {
                this.weaponInventory[currentSlot] = weapon;
                this.currentWeapon = weapon;
            } else {
                // If sidearm is active, replace primary
                this.weaponInventory.primaryWeapon = weapon;
                this.switchToWeapon('primaryWeapon');
            }
        }
    }

    switchToWeapon(slot) {
        if (!this.weaponInventory) return;

        const weapon = this.weaponInventory[slot];
        if (weapon && (weapon.currentAmmo > 0 || weapon.maxAmmo === Infinity)) {
            this.lastWeaponSlot = this.weaponInventory.currentSlot;
            this.weaponInventory.currentSlot = slot;
            this.currentWeapon = weapon;
        }
    }

    // Powerup Management
    addPowerup(powerup) {
        // Add powerup to inventory for later activation
        this.powerupInventory.push({
            type: powerup.type,
            config: powerup.config,
            name: powerup.name,
            duration: powerup.duration,
            damageReduction: powerup.damageReduction,
            headProtection: powerup.headProtection,
            boostDamage: powerup.boostDamage,
            speedBoost: powerup.speedBoost,
            helmetHealth: powerup.helmetHealth,
            description: powerup.description
        });
    }

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

        return true;
    }

    updatePowerups() {
        const currentTime = Date.now();

        // Remove expired powerups
        this.activePowerups = this.activePowerups.filter(powerup => {
            return currentTime < powerup.expirationTime;
        });
    }

    getDamageReduction() {
        let totalReduction = 0;
        this.activePowerups.forEach(powerup => {
            if (powerup.damageReduction) {
                totalReduction = Math.max(totalReduction, powerup.damageReduction);
            }
        });
        return Math.min(totalReduction, 0.95); // Cap at 95% reduction
    }

    getHeadProtection() {
        let totalProtection = 0;
        this.activePowerups.forEach(powerup => {
            if (powerup.headProtection) {
                totalProtection = Math.max(totalProtection, powerup.headProtection);
            }
        });
        return Math.min(totalProtection, 0.99); // Cap at 99% protection
    }

    getBoostDamage() {
        let totalDamage = 0;
        this.activePowerups.forEach(powerup => {
            if (powerup.boostDamage) {
                totalDamage += powerup.boostDamage;
            }
        });
        return totalDamage;
    }

    hasActivePowerup(type) {
        return this.activePowerups.some(powerup => powerup.type === type);
    }

    getSpeedMultiplier() {
        let speedMultiplier = 1.0;
        this.activePowerups.forEach(powerup => {
            if (powerup.speedBoost) {
                speedMultiplier *= powerup.speedBoost;
            }
        });
        return speedMultiplier;
    }

    damageHelmet(damage) {
        const helmet = this.activePowerups.find(p => p.type === 'helmet');
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

    getHelmetHealth() {
        const helmet = this.activePowerups.find(p => p.type === 'helmet');
        return helmet ? helmet.currentHelmetHealth : 0;
    }

    // AI Shooting Logic
    canShoot() {
        return this.currentWeapon && this.currentWeapon.canShoot();
    }

    shoot(targetX, targetY) {
        if (!this.canShoot()) return false;

        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const angle = Math.atan2(dy, dx);

        // Add AI inaccuracy
        const inaccuracy = (1 - this.accuracy) * 0.3;
        const finalAngle = angle + (Math.random() - 0.5) * inaccuracy;

        // Use ammo from weapon
        if (!this.currentWeapon.shoot()) return false;

        return {
            x: this.x,
            y: this.y,
            vx: Math.cos(finalAngle) * this.currentWeapon.projectileSpeed,
            vy: Math.sin(finalAngle) * this.currentWeapon.projectileSpeed,
            angle: finalAngle,
            speed: this.currentWeapon.projectileSpeed,
            damage: this.currentWeapon.damage,
            type: this.currentWeapon.type,
            owner: this,
            animationOffset: Math.random() * Math.PI * 2
        };
    }

    // Helper functions for enhanced snake visuals
    darkenColor(color, amount) {
        // Convert hex color to RGB and darken it
        const hex = color.replace('#', '');
        const r = Math.max(0, parseInt(hex.substr(0, 2), 16) * (1 - amount));
        const g = Math.max(0, parseInt(hex.substr(2, 2), 16) * (1 - amount));
        const b = Math.max(0, parseInt(hex.substr(4, 2), 16) * (1 - amount));

        return `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
    }

    addAlpha(color, alpha) {
        // Add alpha channel to color
        const hex = color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);

        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
}






// Global gamepad testing function for debugging
window.testGamepads = function() {
    console.log('🎮 Testing gamepad connectivity...');

    if (!('getGamepads' in navigator)) {
        console.log('❌ Gamepad API not supported in this browser');
        return;
    }

    const gamepads = navigator.getGamepads();
    console.log('🎮 Raw gamepad array:', gamepads);

    let connectedCount = 0;
    for (let i = 0; i < gamepads.length; i++) {
        if (gamepads[i]) {
            connectedCount++;
            console.log(`🎮 Gamepad ${i}:`, {
                id: gamepads[i].id,
                connected: gamepads[i].connected,
                buttons: gamepads[i].buttons.length,
                axes: gamepads[i].axes.length,
                mapping: gamepads[i].mapping
            });

            // Test button states
            const pressedButtons = [];
            for (let j = 0; j < gamepads[i].buttons.length; j++) {
                if (gamepads[i].buttons[j].pressed) {
                    pressedButtons.push(j);
                }
            }
            if (pressedButtons.length > 0) {
                console.log(`🎮 Pressed buttons on gamepad ${i}:`, pressedButtons);
            }

            // Test axis values
            const activeAxes = [];
            for (let j = 0; j < gamepads[i].axes.length; j++) {
                if (Math.abs(gamepads[i].axes[j]) > 0.1) {
                    activeAxes.push({ axis: j, value: gamepads[i].axes[j].toFixed(2) });
                }
            }
            if (activeAxes.length > 0) {
                console.log(`🎮 Active axes on gamepad ${i}:`, activeAxes);
            }
        }
    }

    if (connectedCount === 0) {
        console.log('🎮 No gamepads detected. Make sure your controller is connected and press any button on it.');
    } else {
        console.log(`🎮 Found ${connectedCount} connected gamepad(s)`);
    }
};

// Export for ES6 modules
export { Game, Snake, Weapon };