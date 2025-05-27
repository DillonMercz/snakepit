class Game {
    constructor() {
        console.log('Game constructor started');
        
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.minimap = document.getElementById('minimap');
        this.minimapCtx = this.minimap.getContext('2d');
        
        console.log('Canvas elements found:', this.canvas, this.minimap);
        
        // Game world dimensions
        this.worldWidth = 4000;
        this.worldHeight = 4000;
        
        // Canvas setup
        this.setupCanvas();
        console.log('Canvas setup complete');
        
        // Game state
        this.gameRunning = true;
        this.score = 0;
        this.camera = { x: 0, y: 0 };
        
        // Game objects
        this.player = null;
        this.aiSnakes = [];
        this.food = [];
        this.glowOrbs = [];
        
        // Input handling
        this.mouse = { x: 0, y: 0 };
        this.boosting = false;
        
        console.log('About to call init()');
        this.init();
        console.log('Game constructor complete');
    }
    
    setupCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.minimap.width = 200;
        this.minimap.height = 200;
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        });
    }
    
    init() {
        // Create player snake
        this.player = new Snake(this.worldWidth / 2, this.worldHeight / 2, '#4CAF50', true);
        
        // Create AI snakes
        for (let i = 0; i < 15; i++) {
            const x = Math.random() * this.worldWidth;
            const y = Math.random() * this.worldHeight;
            const colors = ['#f44336', '#2196F3', '#FF9800', '#9C27B0', '#00BCD4', '#FFEB3B'];
            const color = colors[Math.floor(Math.random() * colors.length)];
            this.aiSnakes.push(new Snake(x, y, color, false));
        }
        
        // Generate food
        this.generateFood();
        this.generateGlowOrbs();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Start game loop
        this.gameLoop();
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
            if (e.button === 0) this.boosting = true;
        });
        
        this.canvas.addEventListener('mouseup', (e) => {
            if (e.button === 0) this.boosting = false;
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.boosting = true;
            }
        });
        
        document.addEventListener('keyup', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.boosting = false;
            }
        });
        
        // Restart button
        document.getElementById('restartBtn').addEventListener('click', () => {
            this.restart();
        });
    }
    
    generateFood() {
        // Generate regular food dots
        for (let i = 0; i < 1000; i++) {
            this.food.push({
                x: Math.random() * this.worldWidth,
                y: Math.random() * this.worldHeight,
                color: `hsl(${Math.random() * 360}, 70%, 60%)`,
                size: 4 + Math.random() * 3
            });
        }
    }
    
    generateGlowOrbs() {
        // Generate moving glow orbs
        for (let i = 0; i < 20; i++) {
            this.glowOrbs.push({
                x: Math.random() * this.worldWidth,
                y: Math.random() * this.worldHeight,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                color: `hsl(${Math.random() * 360}, 100%, 70%)`,
                size: 8 + Math.random() * 4,
                glow: 0,
                value: 5
            });
        }
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
        
        // Respawn food if needed
        if (this.food.length < 800) {
            for (let i = 0; i < 50; i++) {
                this.food.push({
                    x: Math.random() * this.worldWidth,
                    y: Math.random() * this.worldHeight,
                    color: `hsl(${Math.random() * 360}, 70%, 60%)`,
                    size: 4 + Math.random() * 3
                });
            }
        }
        
        // Update UI
        this.updateUI();
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
            if (dist < minDist && dist < 200) {
                minDist = dist;
                targetX = food.x;
                targetY = food.y;
            }
        });
        
        // Check for threats (other snakes)
        const threats = [this.player, ...this.aiSnakes].filter(s => s !== snake && s.alive);
        threats.forEach(threat => {
            const dist = Math.hypot(threat.x - snake.x, threat.y - snake.y);
            if (dist < 100) {
                // Move away from threat
                targetX = snake.x - (threat.x - snake.x);
                targetY = snake.y - (threat.y - snake.y);
            }
        });
        
        // Calculate direction
        const dx = targetX - snake.x;
        const dy = targetY - snake.y;
        snake.targetAngle = Math.atan2(dy, dx);
        
        // Random boost chance
        const shouldBoost = Math.random() < 0.01 && snake.boost > 50;
        snake.update(shouldBoost);
    }
    
    updateGlowOrbs() {
        this.glowOrbs.forEach(orb => {
            orb.x += orb.vx;
            orb.y += orb.vy;
            
            // Bounce off world boundaries
            if (orb.x < 0 || orb.x > this.worldWidth) orb.vx *= -1;
            if (orb.y < 0 || orb.y > this.worldHeight) orb.vy *= -1;
            
            // Keep in bounds
            orb.x = Math.max(0, Math.min(this.worldWidth, orb.x));
            orb.y = Math.max(0, Math.min(this.worldHeight, orb.y));
            
            // Update glow effect
            orb.glow = (orb.glow + 0.1) % (Math.PI * 2);
        });
    }
    
    checkCollisions() {
        const allSnakes = [this.player, ...this.aiSnakes].filter(s => s.alive);
        
        // Check food collisions
        allSnakes.forEach(snake => {
            // Regular food
            for (let i = this.food.length - 1; i >= 0; i--) {
                const food = this.food[i];
                const dist = Math.hypot(food.x - snake.x, food.y - snake.y);
                if (dist < snake.size + food.size) {
                    this.food.splice(i, 1);
                    snake.grow();
                    if (snake === this.player) {
                        this.score += 1;
                    }
                }
            }
            
            // Glow orbs
            for (let i = this.glowOrbs.length - 1; i >= 0; i--) {
                const orb = this.glowOrbs[i];
                const dist = Math.hypot(orb.x - snake.x, orb.y - snake.y);
                if (dist < snake.size + orb.size) {
                    this.glowOrbs.splice(i, 1);
                    for (let j = 0; j < orb.value; j++) {
                        snake.grow();
                    }
                    if (snake === this.player) {
                        this.score += orb.value * 2;
                    }
                    
                    // Spawn new glow orb
                    this.glowOrbs.push({
                        x: Math.random() * this.worldWidth,
                        y: Math.random() * this.worldHeight,
                        vx: (Math.random() - 0.5) * 2,
                        vy: (Math.random() - 0.5) * 2,
                        color: `hsl(${Math.random() * 360}, 100%, 70%)`,
                        size: 8 + Math.random() * 4,
                        glow: 0,
                        value: 5
                    });
                }
            }
        });
        
        // Check snake collisions
        allSnakes.forEach(snake => {
            allSnakes.forEach(otherSnake => {
                if (snake === otherSnake || !snake.alive || !otherSnake.alive) return;
                
                // Check if snake head hits other snake's body
                otherSnake.segments.forEach((segment, index) => {
                    if (index === 0) return; // Skip head
                    
                    const dist = Math.hypot(segment.x - snake.x, segment.y - snake.y);
                    if (dist < snake.size + otherSnake.size) {
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
                                const colors = ['#f44336', '#2196F3', '#FF9800', '#9C27B0', '#00BCD4', '#FFEB3B'];
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
    
    updateUI() {
        document.getElementById('score').textContent = `Score: ${this.score}`;
        if (this.player && this.player.segments) {
            document.getElementById('length').textContent = `Length: ${this.player.segments.length}`;
            document.getElementById('boost').textContent = `Boost: ${Math.round(this.player.boost)}%`;
        }
    }
    
    render() {
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
        
        // Draw debug info
        this.drawDebugInfo();
        
        // Draw minimap
        this.drawMinimap();
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
                this.ctx.fillStyle = food.color;
                this.ctx.beginPath();
                this.ctx.arc(x, y, food.size, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });
    }
    
    drawGlowOrbs() {
        this.glowOrbs.forEach(orb => {
            const x = orb.x - this.camera.x;
            const y = orb.y - this.camera.y;
            
            if (x > -50 && x < this.canvas.width + 50 && y > -50 && y < this.canvas.height + 50) {
                // Draw glow effect
                const glowSize = orb.size + Math.sin(orb.glow) * 3;
                const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, glowSize * 2);
                gradient.addColorStop(0, orb.color);
                gradient.addColorStop(0.5, orb.color + '80');
                gradient.addColorStop(1, 'transparent');
                
                this.ctx.fillStyle = gradient;
                this.ctx.beginPath();
                this.ctx.arc(x, y, glowSize * 2, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Draw core
                this.ctx.fillStyle = orb.color;
                this.ctx.beginPath();
                this.ctx.arc(x, y, glowSize, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });
    }
    
    drawSnakes() {
        const allSnakes = [this.player, ...this.aiSnakes].filter(s => s.alive);
        
        allSnakes.forEach(snake => {
            snake.segments.forEach((segment, index) => {
                const x = segment.x - this.camera.x;
                const y = segment.y - this.camera.y;
                
                if (x > -50 && x < this.canvas.width + 50 && y > -50 && y < this.canvas.height + 50) {
                    // Draw segment
                    this.ctx.fillStyle = index === 0 ? snake.color : snake.color + 'CC';
                    this.ctx.beginPath();
                    this.ctx.arc(x, y, snake.size, 0, Math.PI * 2);
                    this.ctx.fill();
                    
                    // Draw outline
                    this.ctx.strokeStyle = '#000';
                    this.ctx.lineWidth = 2;
                    this.ctx.stroke();
                    
                    // Draw eyes for head
                    if (index === 0) {
                        const eyeOffset = snake.size * 0.3;
                        const eyeSize = snake.size * 0.15;
                        
                        this.ctx.fillStyle = '#fff';
                        this.ctx.beginPath();
                        this.ctx.arc(x + Math.cos(snake.angle - 0.5) * eyeOffset, 
                                   y + Math.sin(snake.angle - 0.5) * eyeOffset, eyeSize, 0, Math.PI * 2);
                        this.ctx.fill();
                        
                        this.ctx.beginPath();
                        this.ctx.arc(x + Math.cos(snake.angle + 0.5) * eyeOffset, 
                                   y + Math.sin(snake.angle + 0.5) * eyeOffset, eyeSize, 0, Math.PI * 2);
                        this.ctx.fill();
                        
                        this.ctx.fillStyle = '#000';
                        this.ctx.beginPath();
                        this.ctx.arc(x + Math.cos(snake.angle - 0.5) * eyeOffset, 
                                   y + Math.sin(snake.angle - 0.5) * eyeOffset, eyeSize * 0.6, 0, Math.PI * 2);
                        this.ctx.fill();
                        
                        this.ctx.beginPath();
                        this.ctx.arc(x + Math.cos(snake.angle + 0.5) * eyeOffset, 
                                   y + Math.sin(snake.angle + 0.5) * eyeOffset, eyeSize * 0.6, 0, Math.PI * 2);
                        this.ctx.fill();
                    }
                }
            });
        });
    }
    
    drawMinimap() {
        // Clear minimap
        this.minimapCtx.fillStyle = '#000';
        this.minimapCtx.fillRect(0, 0, this.minimap.width, this.minimap.height);
        
        const scaleX = this.minimap.width / this.worldWidth;
        const scaleY = this.minimap.height / this.worldHeight;
        
        // Draw world border
        this.minimapCtx.strokeStyle = '#444';
        this.minimapCtx.lineWidth = 1;
        this.minimapCtx.strokeRect(0, 0, this.minimap.width, this.minimap.height);
        
        // Draw snakes
        const allSnakes = [this.player, ...this.aiSnakes].filter(s => s.alive);
        allSnakes.forEach(snake => {
            const x = snake.x * scaleX;
            const y = snake.y * scaleY;
            
            this.minimapCtx.fillStyle = snake === this.player ? '#4CAF50' : '#f44336';
            this.minimapCtx.beginPath();
            this.minimapCtx.arc(x, y, 2, 0, Math.PI * 2);
            this.minimapCtx.fill();
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
        this.update();
        this.render();
        
        if (this.gameRunning) {
            requestAnimationFrame(() => this.gameLoop());
        }
    }
    
    gameOver() {
        this.gameRunning = false;
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('finalLength').textContent = this.player.segments.length;
        document.getElementById('gameOver').classList.remove('hidden');
    }
    
    restart() {
        document.getElementById('gameOver').classList.add('hidden');
        this.gameRunning = true;
        this.score = 0;
        this.food = [];
        this.glowOrbs = [];
        this.aiSnakes = [];
        this.init();
    }
}

class Snake {
    constructor(x, y, color, isPlayer = false) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.isPlayer = isPlayer;
        this.size = 8;
        this.speed = 2;
        this.angle = Math.random() * Math.PI * 2;
        this.targetAngle = this.angle;
        this.alive = true;
        this.boost = 100;
        this.maxBoost = 100;
        
        // Snake segments
        this.segments = [{ x: x, y: y }];
        this.segmentDistance = this.size * 1.5;
        
        // Initialize with 3 segments
        for (let i = 1; i < 3; i++) {
            this.segments.push({
                x: x - Math.cos(this.angle) * this.segmentDistance * i,
                y: y - Math.sin(this.angle) * this.segmentDistance * i
            });
        }
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
        this.x = Math.max(this.size, Math.min(game.worldWidth - this.size, this.x));
        this.y = Math.max(this.size, Math.min(game.worldHeight - this.size, this.y));
        
        // Update head position
        this.segments[0].x = this.x;
        this.segments[0].y = this.y;
        
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
    
    grow() {
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
}

// Start the game when page loads
let game;
window.addEventListener('load', () => {
    console.log('Page loaded, starting game...');
    try {
        game = new Game();
        console.log('Game initialized successfully');
    } catch (error) {
        console.error('Error initializing game:', error);
    }
});

// Also try to start when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM ready');
    if (!game) {
        try {
            game = new Game();
            console.log('Game initialized on DOM ready');
        } catch (error) {
            console.error('Error initializing game on DOM ready:', error);
        }
    }
});