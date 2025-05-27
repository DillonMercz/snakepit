class Weapon {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 20;
        this.color = '#FF5722';
        this.collected = false;
        this.type = this.randomWeaponType();
    }

    randomWeaponType() {
        const types = ['laser', 'plasma', 'missile'];
        return types[Math.floor(Math.random() * types.length)];
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
        const pulseSize = this.size * (1 + Math.sin(time * 3) * 0.2);

        // Outer glow
        const gradient = ctx.createRadialGradient(
            screenX, screenY, 0,
            screenX, screenY, pulseSize * 1.5
        );
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(0.5, this.color + '80');
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(screenX, screenY, pulseSize * 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Inner weapon bubble
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(screenX, screenY, pulseSize * 0.6, 0, Math.PI * 2);
        ctx.fill();

        // Weapon type icon
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.type.charAt(0).toUpperCase(), screenX, screenY);
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
        this.weaponCooldown = 2000; // 2 seconds cooldown
        this.lastShotTime = 0;
        this.currentWeapon = null;
        
        // Game state
        this.gameRunning = true;
        this.score = 0;
        this.camera = { x: 1500, y: 1500 }; // Start camera in middle of world
        
        // Game objects
        this.player = new Snake(2000, 2000, '#4CAF50', true);
        this.aiSnakes = [];
        this.food = [];
        this.glowOrbs = [];
        
        // Input handling
        this.mouse = { x: this.canvas.width / 2, y: this.canvas.height / 2 };
        this.boosting = false;
        
        // Generate initial game objects
        this.generateFood();
        this.generateGlowOrbs();
        
        // React integration
        this.onStateUpdate = null;
        
        // Initialize the game
        this.init();
    }
    
    init() {
        console.log('Initializing game...');
        
        // Create AI snakes
        for (let i = 0; i < 10; i++) {
            const x = Math.random() * this.worldWidth;
            const y = Math.random() * this.worldHeight;
            const colors = ['#f44336', '#2196F3', '#FF9800', '#9C27B0', '#00BCD4'];
            const color = colors[Math.floor(Math.random() * colors.length)];
            this.aiSnakes.push(new Snake(x, y, color, false));
        }

        // Initialize warfare mode if selected
        if (this.gameMode === 'warfare') {
            // Generate initial weapons
            for (let i = 0; i < 5; i++) {
                const x = Math.random() * this.worldWidth;
                const y = Math.random() * this.worldHeight;
                this.weapons.push(new Weapon(x, y));
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

            // Update weapon UI
            const weaponDisplay = document.getElementById('weapon');
            weaponDisplay.textContent = `Weapon: ${this.currentWeapon ? this.currentWeapon.type : 'None'}`;
            
            const cooldownDisplay = document.getElementById('cooldown');
            const cooldownRemaining = Math.max(0, this.weaponCooldown - (Date.now() - this.lastShotTime));
            cooldownDisplay.textContent = cooldownRemaining > 0 ? 
                `Cooldown: ${(cooldownRemaining / 1000).toFixed(1)}s` : 
                'Cooldown: Ready';
        }
        
        // Game state
        this.gameRunning = true;
        this.score = 0;
        this.camera = { x: 1500, y: 1500 }; // Start camera in middle of world
        
        // Game objects
        this.player = new Snake(2000, 2000, '#4CAF50', true);
        this.aiSnakes = [];
        this.food = [];
        this.glowOrbs = [];
        
        // Input handling
        this.mouse = { x: this.canvas.width / 2, y: this.canvas.height / 2 };
        this.boosting = false;
        
        // Generate initial game objects
        this.generateFood();
        this.generateGlowOrbs();
    }
    
    generateFood() {
        console.log('Generating food...');
        for (let i = 0; i < 500; i++) {
            this.food.push({
                x: Math.random() * this.worldWidth,
                y: Math.random() * this.worldHeight,
                color: `hsl(${Math.random() * 360}, 70%, 60%)`,
                size: 4 + Math.random() * 3
            });
        }
        console.log(`Generated ${this.food.length} food items`);
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
        
        // Boost controls
        this.canvas.addEventListener('mousedown', (e) => {
            if (e.button === 0) {
                if (this.gameMode === 'warfare' && this.currentWeapon) {
                    this.shoot();
                } else {
                    this.boosting = true;
                }
            }
        });
        
        this.canvas.addEventListener('mouseup', (e) => {
            if (e.button === 0) this.boosting = false;
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                if (this.gameMode === 'warfare' && this.currentWeapon) {
                    this.shoot();
                } else {
                    this.boosting = true;
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

    shoot() {
        if (!this.currentWeapon || Date.now() - this.lastShotTime < this.weaponCooldown) return;

        const worldMouseX = this.mouse.x + this.camera.x;
        const worldMouseY = this.mouse.y + this.camera.y;
        const playerHead = this.player.segments[0];
        
        // Calculate shot direction
        const dx = worldMouseX - playerHead.x;
        const dy = worldMouseY - playerHead.y;
        const angle = Math.atan2(dy, dx);
        
        // Create projectile
        const speed = 15;
        const projectile = {
            x: playerHead.x,
            y: playerHead.y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            type: this.currentWeapon.type,
            damage: this.currentWeapon.type === 'missile' ? 5 : 
                   this.currentWeapon.type === 'plasma' ? 3 : 2
        };
        
        // Add projectile to game
        if (!this.projectiles) this.projectiles = [];
        this.projectiles.push(projectile);
        
        // Update cooldown
        this.lastShotTime = Date.now();
        this.currentWeapon = null;
    }
    
    update() {
        if (!this.gameRunning) return;
        
        // Update player
        this.updatePlayer();
        
        // Update AI snakes
        this.aiSnakes.forEach(snake => this.updateAISnake(snake));
        
        // Update glow orbs
        this.updateGlowOrbs();
        
        // Check collisions
        this.checkCollisions();
        
        // Update camera
        this.updateCamera();
        
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

            // Check weapon collisions
            this.weapons.forEach(weapon => {
                if (!weapon.collected) {
                    const dx = this.player.segments[0].x - weapon.x;
                    const dy = this.player.segments[0].y - weapon.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < this.player.size + weapon.size) {
                        weapon.collected = true;
                        this.currentWeapon = weapon;
                    }
                }
            });

            // Update and check projectiles
            if (this.projectiles) {
                this.projectiles = this.projectiles.filter(projectile => {
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
                        // Check head collision (instant kill)
                        const headDx = snake.segments[0].x - projectile.x;
                        const headDy = snake.segments[0].y - projectile.y;
                        const headDist = Math.sqrt(headDx * headDx + headDy * headDy);

                        if (headDist < snake.size) {
                            if (snake !== this.player) { // Don't let player kill themselves
                                snake.alive = false;
                                return false;
                            }
                            continue;
                        }

                        // Check body collision (segment removal)
                        let hitSegment = false;
                        for (let i = 1; i < snake.segments.length; i++) {
                            const segment = snake.segments[i];
                            const dx = segment.x - projectile.x;
                            const dy = segment.y - projectile.y;
                            const dist = Math.sqrt(dx * dx + dy * dy);

                            if (dist < snake.size) {
                                // Remove segments based on weapon damage
                                const removeCount = Math.min(projectile.damage, snake.segments.length - i);
                                snake.segments.splice(i, removeCount);
                                hitSegment = true;
                                break;
                            }
                        }
                        if (hitSegment) return false;
                    }

                    return true;
                });
            }

            // Update weapon UI
            const weaponDisplay = document.getElementById('weapon');
            weaponDisplay.textContent = `Weapon: ${this.currentWeapon ? this.currentWeapon.type : 'None'}`;
            
            const cooldownDisplay = document.getElementById('cooldown');
            const cooldownRemaining = Math.max(0, this.weaponCooldown - (Date.now() - this.lastShotTime));
            cooldownDisplay.textContent = cooldownRemaining > 0 ? 
                `Cooldown: ${(cooldownRemaining / 1000).toFixed(1)}s` : 
                'Cooldown: Ready';
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
        
        // Simple AI: move towards nearest food or away from threats
        let targetX = snake.x;
        let targetY = snake.y;
        let minDist = Infinity;
        
        // Find nearest food
        this.food.forEach(food => {
            const dist = Math.hypot(food.x - snake.x, food.y - snake.y);
            if (dist < minDist && dist < 150) {
                minDist = dist;
                targetX = food.x;
                targetY = food.y;
            }
        });
        
        // Check for threats (other snakes including player)
        const threats = [this.player, ...this.aiSnakes].filter(s => s !== snake && s.alive);
        threats.forEach(threat => {
            const dist = Math.hypot(threat.x - snake.x, threat.y - snake.y);
            if (dist < 80) {
                // Move away from threat
                targetX = snake.x - (threat.x - snake.x);
                targetY = snake.y - (threat.y - snake.y);
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
        
        // Random boost chance
        const shouldBoost = Math.random() < 0.005 && snake.boost > 50;
        snake.update(shouldBoost);
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
                    snake.grow();
                    if (snake === this.player) {
                        this.score += 1;
                        this.updateGameState();
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
                    for (let j = 0; j < orb.value; j++) {
                        snake.grow();
                    }
                    if (snake === this.player) {
                        this.score += orb.value * 2;
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
                
                // Check if snake head hits other snake's body
                otherSnake.segments.forEach((segment, index) => {
                    if (index === 0) return; // Skip head
                    
                    const dist = Math.hypot(segment.x - snake.x, segment.y - snake.y);
                    if (dist < snake.size + otherSnake.size - 2) {
                        snake.alive = false;
                        
                        // Create food from dead snake
                        snake.segments.forEach(seg => {
                            for (let i = 0; i < 3; i++) {
                                this.food.push({
                                    x: seg.x + (Math.random() - 0.5) * 40,
                                    y: seg.y + (Math.random() - 0.5) * 40,
                                    color: snake.color,
                                    size: 6 + Math.random() * 4
                                });
                            }
                        });
                        
                        if (snake === this.player) {
                            this.gameOver();
                        } else {
                            // Respawn AI snake
                            setTimeout(() => {
                                const x = Math.random() * this.worldWidth;
                                const y = Math.random() * this.worldHeight;
                                const colors = ['#f44336', '#2196F3', '#FF9800', '#9C27B0', '#00BCD4'];
                                const color = colors[Math.floor(Math.random() * colors.length)];
                                const newSnake = new Snake(x, y, color, false);
                                const index = this.aiSnakes.indexOf(snake);
                                if (index !== -1) {
                                    this.aiSnakes[index] = newSnake;
                                }
                            }, 3000);
                        }
                    }
                });
            });
        });
        
        // Respawn food if needed
        if (this.food.length < 400) {
            for (let i = 0; i < 50; i++) {
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
        this.gameRunning = false;
        this.updateGameState();
    }
    

    
    updateCamera() {
        if (!this.player || !this.player.alive) return;
        
        // Center camera on player
        this.camera.x = this.player.x - this.canvas.width / 2;
        this.camera.y = this.player.y - this.canvas.height / 2;
        
        // Keep camera in world bounds
        this.camera.x = Math.max(0, Math.min(this.worldWidth - this.canvas.width, this.camera.x));
        this.camera.y = Math.max(0, Math.min(this.worldHeight - this.canvas.height, this.camera.y));
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
            this.drawProjectiles();
        }
        
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

    drawProjectiles() {
        if (!this.projectiles) return;

        this.projectiles.forEach(projectile => {
            const screenX = projectile.x - this.camera.x;
            const screenY = projectile.y - this.camera.y;

            // Don't draw if off screen
            if (screenX < -50 || screenX > this.canvas.width + 50 ||
                screenY < -50 || screenY > this.canvas.height + 50) {
                return;
            }

            // Draw projectile based on type
            this.ctx.beginPath();
            
            switch (projectile.type) {
                case 'laser':
                    this.ctx.strokeStyle = '#FF0000';
                    this.ctx.lineWidth = 3;
                    this.ctx.moveTo(screenX - projectile.vx * 2, screenY - projectile.vy * 2);
                    this.ctx.lineTo(screenX + projectile.vx * 2, screenY + projectile.vy * 2);
                    this.ctx.stroke();
                    break;
                    
                case 'plasma':
                    const gradient = this.ctx.createRadialGradient(
                        screenX, screenY, 0,
                        screenX, screenY, 8
                    );
                    gradient.addColorStop(0, '#00FF00');
                    gradient.addColorStop(1, 'transparent');
                    this.ctx.fillStyle = gradient;
                    this.ctx.arc(screenX, screenY, 8, 0, Math.PI * 2);
                    this.ctx.fill();
                    break;
                    
                case 'missile':
                    this.ctx.fillStyle = '#FFA500';
                    this.ctx.arc(screenX, screenY, 6, 0, Math.PI * 2);
                    this.ctx.fill();
                    // Draw missile trail
                    const trailGradient = this.ctx.createLinearGradient(
                        screenX - projectile.vx * 3, screenY - projectile.vy * 3,
                        screenX, screenY
                    );
                    trailGradient.addColorStop(0, 'transparent');
                    trailGradient.addColorStop(1, '#FFA500');
                    this.ctx.strokeStyle = trailGradient;
                    this.ctx.lineWidth = 2;
                    this.ctx.moveTo(screenX - projectile.vx * 3, screenY - projectile.vy * 3);
                    this.ctx.lineTo(screenX, screenY);
                    this.ctx.stroke();
                    break;
            }
        });
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
                
                // Draw pixelated coin/cash
                const foodSize = beingVacuumed ? food.size * 1.2 : food.size;
                
                // Draw coin base
                this.ctx.fillStyle = '#FFD700'; // Gold color
                this.ctx.beginPath();
                this.ctx.arc(x, y, foodSize, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Draw coin inner circle (darker gold)
                this.ctx.fillStyle = '#DAA520';
                this.ctx.beginPath();
                this.ctx.arc(x, y, foodSize * 0.7, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Draw dollar sign ($) in the center
                this.ctx.fillStyle = '#8B4513'; // Dark brown
                this.ctx.font = `${foodSize * 1.2}px monospace`;
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText('$', x, y);
                
                // Add outline
                this.ctx.strokeStyle = beingVacuumed ? '#ffffff' : '#B8860B';
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
                
                // Draw golden coin base
                this.ctx.fillStyle = '#FFD700';
                this.ctx.beginPath();
                this.ctx.arc(x, y, glowSize * 0.8, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Draw inner golden circle
                this.ctx.fillStyle = '#FFA500';
                this.ctx.beginPath();
                this.ctx.arc(x, y, glowSize * 0.6, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Draw diamond symbol (♦) in center
                this.ctx.fillStyle = '#8B0000'; // Dark red
                this.ctx.font = `${glowSize * 1.2}px monospace`;
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText('♦', x, y);
                
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
        const allSnakes = [this.player, ...this.aiSnakes].filter(s => s.alive);
        
        allSnakes.forEach(snake => {
            this.drawRealisticSnake(snake);
        });
    }
    
    drawRealisticSnake(snake) {
        if (snake.segments.length < 2) return;
        
        // Draw boost effect for player
        if (snake === this.player && this.boosting) {
            const headX = snake.segments[0].x - this.camera.x;
            const headY = snake.segments[0].y - this.camera.y;
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
    }
    
    drawSmoothSnakeBody(snake) {
        // Draw each segment as a circle with proper tapering and gradients
        for (let i = snake.segments.length - 1; i >= 0; i--) {
            const segment = snake.segments[i];
            const x = segment.x - this.camera.x;
            const y = segment.y - this.camera.y;
            
            // Skip if segment is off-screen
            if (x < -100 || x > this.canvas.width + 100 || y < -100 || y > this.canvas.height + 100) {
                continue;
            }
            
            const segmentRatio = 1 - (i / snake.segments.length) * 0.4;
            const segmentSize = snake.size * segmentRatio;
            
            // Create gradient for each segment
            const segmentGradient = this.ctx.createRadialGradient(
                x - segmentSize * 0.3, y - segmentSize * 0.3, 0,
                x, y, segmentSize
            );
            
            if (i === 0) {
                // Head is brighter
                segmentGradient.addColorStop(0, '#ffffff');
                segmentGradient.addColorStop(0.3, snake.color);
                segmentGradient.addColorStop(1, this.darkenColor(snake.color, 0.1));
            } else {
                // Body segments
                const lightColor = snake.color;
                const darkColor = this.darkenColor(snake.color, 0.2 + (i / snake.segments.length) * 0.2);
                segmentGradient.addColorStop(0, lightColor);
                segmentGradient.addColorStop(0.7, lightColor);
                segmentGradient.addColorStop(1, darkColor);
            }
            
            // Draw segment
            this.ctx.fillStyle = segmentGradient;
            this.ctx.beginPath();
            this.ctx.arc(x, y, segmentSize, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Add subtle outline
            this.ctx.strokeStyle = this.darkenColor(snake.color, 0.4);
            this.ctx.lineWidth = Math.max(1, segmentSize * 0.05);
            this.ctx.stroke();
        }
        
        // Draw connecting segments for smoother appearance
        for (let i = 0; i < snake.segments.length - 1; i++) {
            const segment1 = snake.segments[i];
            const segment2 = snake.segments[i + 1];
            
            const x1 = segment1.x - this.camera.x;
            const y1 = segment1.y - this.camera.y;
            const x2 = segment2.x - this.camera.x;
            const y2 = segment2.y - this.camera.y;
            
            // Skip if segments are off-screen
            if ((x1 < -100 || x1 > this.canvas.width + 100) && 
                (x2 < -100 || x2 > this.canvas.width + 100)) continue;
            if ((y1 < -100 || y1 > this.canvas.height + 100) && 
                (y2 < -100 || y2 > this.canvas.height + 100)) continue;
            
            const ratio1 = 1 - (i / snake.segments.length) * 0.4;
            const ratio2 = 1 - ((i + 1) / snake.segments.length) * 0.4;
            const size1 = snake.size * ratio1;
            const size2 = snake.size * ratio2;
            
            // Draw connecting rectangle
            const dx = x2 - x1;
            const dy = y2 - y1;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0) {
                const angle = Math.atan2(dy, dx);
                
                this.ctx.save();
                this.ctx.translate(x1, y1);
                this.ctx.rotate(angle);
                
                // Create gradient for connection
                const connectGradient = this.ctx.createLinearGradient(0, 0, distance, 0);
                const color1 = i === 0 ? snake.color : this.darkenColor(snake.color, 0.1 + (i / snake.segments.length) * 0.2);
                const color2 = this.darkenColor(snake.color, 0.1 + ((i + 1) / snake.segments.length) * 0.2);
                connectGradient.addColorStop(0, color1);
                connectGradient.addColorStop(1, color2);
                
                this.ctx.fillStyle = connectGradient;
                this.ctx.fillRect(0, -size1, distance, size1 + size2);
                
                this.ctx.restore();
            }
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

        // Draw metallic head with multi-layer gradient
        const metallicGradient = this.ctx.createRadialGradient(
            x - headSize * 0.3, y - headSize * 0.3, 0,
            x, y, headSize
        );
        metallicGradient.addColorStop(0, '#ffffff');
        metallicGradient.addColorStop(0.3, snake.color);
        metallicGradient.addColorStop(0.6, this.darkenColor(snake.color, 0.2));
        metallicGradient.addColorStop(0.8, snake.color);
        metallicGradient.addColorStop(1, this.darkenColor(snake.color, 0.3));

        this.ctx.fillStyle = metallicGradient;
        this.ctx.beginPath();
        this.ctx.arc(x, y, headSize, 0, Math.PI * 2);
        this.ctx.fill();

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
            return;
        }
        
        // Clear minimap
        this.minimapCtx.fillStyle = '#000';
        this.minimapCtx.fillRect(0, 0, this.minimap.width, this.minimap.height);
        
        const scaleX = this.minimap.width / this.worldWidth;
        const scaleY = this.minimap.height / this.worldHeight;
        
        // Draw world border
        this.minimapCtx.strokeStyle = '#444';
        this.minimapCtx.lineWidth = 1;
        this.minimapCtx.strokeRect(0, 0, this.minimap.width, this.minimap.height);
        
        // Draw player
        if (this.player) {
            const x = this.player.x * scaleX;
            const y = this.player.y * scaleY;
            
            this.minimapCtx.fillStyle = '#4CAF50';
            this.minimapCtx.beginPath();
            this.minimapCtx.arc(x, y, 3, 0, Math.PI * 2);
            this.minimapCtx.fill();
        }
        
        // Draw AI snakes
        this.aiSnakes.forEach(snake => {
            if (snake.alive) {
                const x = snake.x * scaleX;
                const y = snake.y * scaleY;
                
                this.minimapCtx.fillStyle = '#f44336';
                this.minimapCtx.beginPath();
                this.minimapCtx.arc(x, y, 2, 0, Math.PI * 2);
                this.minimapCtx.fill();
            }
        });
        
        // Draw glow orbs
        this.glowOrbs.forEach(orb => {
            const x = orb.x * scaleX;
            const y = orb.y * scaleY;
            
            this.minimapCtx.fillStyle = '#FFD700';
            this.minimapCtx.beginPath();
            this.minimapCtx.arc(x, y, 1, 0, Math.PI * 2);
            this.minimapCtx.fill();
        });
        
        // Draw camera view
        const camX = this.camera.x * scaleX;
        const camY = this.camera.y * scaleY;
        const camW = this.canvas.width * scaleX;
        const camH = this.canvas.height * scaleY;
        
        this.minimapCtx.strokeStyle = '#4CAF50';
        this.minimapCtx.lineWidth = 1;
        this.minimapCtx.strokeRect(camX, camY, camW, camH);
    }
    
    gameLoop() {
        if (!this.gameLoopStarted) {
            console.log('Game loop started!');
            this.gameLoopStarted = true;
        }
        
        this.update();
        this.render();
        
        if (this.gameRunning) {
            requestAnimationFrame(() => this.gameLoop());
        }
    }

    // React integration methods
    start() {
        console.log('Starting game...');
        console.log('Canvas dimensions:', this.canvas.width, 'x', this.canvas.height);
        console.log('Canvas context:', this.ctx);
        console.log('Player position:', this.player.x, this.player.y);
        console.log('Camera position:', this.camera.x, this.camera.y);
        this.setupEventListeners();
        this.gameLoop();
    }

    setMinimapCanvas(minimapCanvas) {
        this.minimap = minimapCanvas;
        this.minimapCtx = minimapCanvas.getContext('2d');
        this.minimap.width = 200;
        this.minimap.height = 200;
    }

    restart() {
        console.log('Restarting game...');
        // Reset game state
        this.gameRunning = true;
        this.score = 0;
        this.camera = { x: 1500, y: 1500 };
        
        // Reset player
        this.player = new Snake(2000, 2000, '#4CAF50', true);
        
        // Reset AI snakes
        this.aiSnakes = [];
        for (let i = 0; i < 10; i++) {
            const x = Math.random() * this.worldWidth;
            const y = Math.random() * this.worldHeight;
            const colors = ['#f44336', '#2196F3', '#FF9800', '#9C27B0', '#00BCD4'];
            const color = colors[Math.floor(Math.random() * colors.length)];
            this.aiSnakes.push(new Snake(x, y, color, false));
        }
        
        // Reset game objects
        this.food = [];
        this.glowOrbs = [];
        this.weapons = [];
        this.generateFood();
        this.generateGlowOrbs();
        
        // Restart game loop
        this.gameLoop();
    }

    destroy() {
        console.log('Destroying game...');
        this.gameRunning = false;
        // Remove event listeners
        if (this.canvas) {
            this.canvas.removeEventListener('mousemove', this.handleMouseMove);
            this.canvas.removeEventListener('mousedown', this.handleMouseDown);
            this.canvas.removeEventListener('mouseup', this.handleMouseUp);
            this.canvas.removeEventListener('contextmenu', this.handleRightClick);
        }
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);
    }

    canShoot() {
        return Date.now() - this.lastShotTime > this.weaponCooldown;
    }

    updateGameState() {
        if (this.onStateUpdate) {
            this.onStateUpdate({
                score: this.score,
                length: this.player.segments.length,
                boost: this.player.boost,
                weapon: this.currentWeapon ? this.currentWeapon.type : 'None',
                cooldown: this.canShoot() ? 'Ready' : 'Reloading',
                isGameOver: !this.gameRunning,
                finalScore: this.score,
                finalLength: this.player.segments.length
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
        this.speed = 2;
        this.angle = Math.random() * Math.PI * 2;
        this.targetAngle = this.angle;
        this.alive = true;
        this.boost = 100;
        this.maxBoost = 100;
        
        // Snake segments
        this.segments = [{ x: x, y: y }];
        
        // Growth system
        this.growthQueue = 0; // How many segments to grow
        this.growthProgress = 0; // Progress toward next segment (0-1)
        this.growthRate = 0.02; // How fast to grow each frame
        
        // Initialize with 3 segments
        for (let i = 1; i < 3; i++) {
            this.segments.push({
                x: x - Math.cos(this.angle) * this.segmentDistance * i,
                y: y - Math.sin(this.angle) * this.segmentDistance * i
            });
        }
    }
    
    get size() {
        // Dynamic size based on length
        return this.baseSize + Math.sqrt(this.segments.length) * 1.5;
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
        let currentSpeed = this.speed;
        if (boosting && this.boost > 0) {
            currentSpeed *= 2;
            this.boost -= 1;
        } else if (!boosting && this.boost < this.maxBoost) {
            this.boost += 0.5;
        }
        
        // Move head
        this.x += Math.cos(this.angle) * currentSpeed;
        this.y += Math.sin(this.angle) * currentSpeed;
        
        // Keep in world bounds
        this.x = Math.max(this.size, Math.min(4000 - this.size, this.x));
        this.y = Math.max(this.size, Math.min(4000 - this.size, this.y));
        
        // Update head position
        this.segments[0].x = this.x;
        this.segments[0].y = this.y;
        
        // Handle natural growth
        this.handleGrowth();
        
        // Update body segments
        for (let i = 1; i < this.segments.length; i++) {
            const prev = this.segments[i - 1];
            const current = this.segments[i];
            
            const dx = prev.x - current.x;
            const dy = prev.y - current.y;
            const distance = Math.hypot(dx, dy);
            
            if (distance > this.segmentDistance) {
                const angle = Math.atan2(dy, dx);
                current.x = prev.x - Math.cos(angle) * this.segmentDistance;
                current.y = prev.y - Math.sin(angle) * this.segmentDistance;
            }
        }
    }
    
    handleGrowth() {
        if (this.growthQueue > 0) {
            this.growthProgress += this.growthRate;
            
            if (this.growthProgress >= 1) {
                // Add a new segment
                this.addSegment();
                this.growthQueue--;
                this.growthProgress = 0;
            }
        }
    }
    
    addSegment() {
        const tail = this.segments[this.segments.length - 1];
        const prevTail = this.segments[this.segments.length - 2] || tail;
        
        const dx = tail.x - prevTail.x;
        const dy = tail.y - prevTail.y;
        const distance = Math.hypot(dx, dy);
        
        if (distance > 0) {
            const angle = Math.atan2(dy, dx);
            this.segments.push({
                x: tail.x + Math.cos(angle) * this.segmentDistance,
                y: tail.y + Math.sin(angle) * this.segmentDistance
            });
        } else {
            this.segments.push({ x: tail.x, y: tail.y });
        }
    }
    
    grow() {
        // Instead of immediately adding segments, queue them for natural growth
        this.growthQueue += 2; // Grow by 2 segments per food
    }
}








// Export for ES6 modules
export { Game, Snake, Weapon };