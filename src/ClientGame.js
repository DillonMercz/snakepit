import NetworkManager from './utils/NetworkManager';
import GamepadManager from './controllers/GamepadManager.js';

class ClientGame {
  constructor(canvas, gameMode = 'classic') {
    console.log('ClientGame constructor started');

    this.canvas = canvas;
    this.ctx = this.canvas.getContext('2d');
    this.gameMode = gameMode;

    // Minimap setup
    this.minimap = null;
    this.minimapCtx = null;

    // Canvas setup
    this.setupCanvas();

    // World dimensions - match server world size (3x original size)
    this.worldWidth = 6000;
    this.worldHeight = 6000;

    // Game state from server
    this.gameState = {
      players: [],
      food: [],
      glowOrbs: [],
      coins: [],
      weapons: [],
      ammo: [],
      powerups: [],
      projectiles: []
    };

    // Local player data
    this.localPlayer = null;
    this.playerId = null;

    // Spectate mode (like original game)
    this.spectating = false;
    this.spectateTarget = 0;
    this.cashedOut = false;

    // Camera - start at center of world (3x original size)
    this.camera = { x: 3000, y: 3000, zoom: 1.0 };

    // Input handling
    this.mouse = { x: this.canvas.width / 2, y: this.canvas.height / 2 };
    this.boosting = false;
    this.mouseHeld = false;

    // Gamepad support
    this.gamepadManager = new GamepadManager();
    this.setupGamepadCallbacks();

    // Network manager
    this.networkManager = NetworkManager;

    // Game state
    this.connected = false;
    this.gameRunning = false;

    // React callbacks
    this.onStateUpdate = null;
    this.onGameOver = null;
    this.onElimination = null;

    // Rendering
    this.lastRenderTime = 0;
    this.renderLoop = null;

    // FPS calculation
    this.fps = 0;
    this.frameCount = 0;
    this.lastFpsUpdate = 0;
    this.frameTimes = [];

    // Performance optimization for 120 FPS
    this.lastGameStateUpdate = 0;
    this.gameStateUpdateRate = 1000 / 60; // Process game state updates at 60 FPS for 120 FPS support

    // Client-side prediction for 120 FPS
    this.lastInputSent = 0;
    this.inputSendRate = 1000 / 60; // 60 FPS input sending for ultra-responsive controls

    // Icon system
    this.icons = new Map();
    this.iconsLoaded = false;
    this.loadIcons();

    console.log('ClientGame constructor completed');
  }

  loadIcons() {
    // Icon mapping from game types to file names
    const iconMappings = {
      // Weapons
      weapons: {
        'sidearm': 'Snake Fang Weapon Icon.png',
        'laser_pistol': 'Laser Pistol Weapon Icon.png',
        'laser_rifle': 'Laser Rifle Weapon Icon.png',
        'plasma_smg': 'Plasma SMG Weapon Icon.png',
        'plasma_cannon': 'Plasma Cannon Weapon Icon.png',
        'rocket_launcher': 'Rocket Launcher Weapon Icon.png',
        'rail_gun': 'Rail Gun Weapon Icon.png',
        'minigun': 'Minigun Weapon Icon.png'
      },
      // Powerups
      powerups: {
        'helmet': 'Combat Helmet Powerup Icon.png',
        'armor_plating': 'Armor Plating Powerup Icon.png',
        'shield_generator': 'Shield Generator Powerup Icon.png',
        'forcefield': 'Force Field Powerup Icon.png',
        'speed_boost': 'Speed Boost Powerup Icon.png',
        'damage_amplifier': 'Damage Amplifier Powerup Icon.png',
        'battering_ram': 'Battering Ram Powerup Icon.png'
      },
      // Ammo
      ammo: {
        'light_energy': 'Energy Cells Ammo Icon.png',
        'heavy_energy': 'Heavy Energy Ammo Icon.png',
        'plasma_cells': 'Plasma Cells Ammo Icon.png',
        'heavy_plasma': 'Heavy Plasma Ammo Icon.png',
        'rockets': 'Rockets Ammo Icon.png',
        'rail_slugs': 'Rail Slugs Ammo Icon.png'
      }
    };

    // Load all icons
    let loadedCount = 0;
    let totalIcons = 0;

    // Count total icons
    Object.values(iconMappings).forEach(category => {
      totalIcons += Object.keys(category).length;
    });

    const checkAllLoaded = () => {
      loadedCount++;
      if (loadedCount >= totalIcons) {
        this.iconsLoaded = true;
        console.log('All icons loaded successfully');
        console.log('Loaded icons:', Array.from(this.icons.keys()));
      }
    };

    // Load weapon icons
    Object.entries(iconMappings.weapons).forEach(([weaponType, fileName]) => {
      const img = new Image();
      img.onload = checkAllLoaded;
      img.onerror = () => {
        console.warn(`Failed to load weapon icon: ${fileName}`);
        checkAllLoaded();
      };
      img.src = `/assets/${encodeURIComponent(fileName)}`;
      this.icons.set(`weapon_${weaponType}`, img);
    });

    // Load powerup icons
    Object.entries(iconMappings.powerups).forEach(([powerupType, fileName]) => {
      const img = new Image();
      img.onload = checkAllLoaded;
      img.onerror = () => {
        console.warn(`Failed to load powerup icon: ${fileName}`);
        checkAllLoaded();
      };
      img.src = `/assets/${encodeURIComponent(fileName)}?v=${Date.now()}`;
      this.icons.set(`powerup_${powerupType}`, img);
    });

    // Load ammo icons
    Object.entries(iconMappings.ammo).forEach(([ammoType, fileName]) => {
      const img = new Image();
      img.onload = checkAllLoaded;
      img.onerror = () => {
        console.warn(`Failed to load ammo icon: ${fileName}`);
        checkAllLoaded();
      };
      img.src = `/assets/${encodeURIComponent(fileName)}`;
      this.icons.set(`ammo_${ammoType}`, img);
    });
  }

  setupCanvas() {
    const resizeCanvas = () => {
      const rect = this.canvas.getBoundingClientRect();
      const newWidth = rect.width || window.innerWidth;
      const newHeight = rect.height || window.innerHeight;

      if (newWidth > 0 && newHeight > 0) {
        this.canvas.width = newWidth;
        this.canvas.height = newHeight;
        console.log('Canvas resized to:', this.canvas.width, 'x', this.canvas.height);
      }
    };

    this.resizeCanvas = resizeCanvas;
    setTimeout(resizeCanvas, 50);
    setTimeout(resizeCanvas, 200);
    setTimeout(resizeCanvas, 500);
    window.addEventListener('resize', resizeCanvas);
  }

  async start() {
    console.log('Starting ClientGame...');

    try {
      console.log('Step 1: Connecting to server...');
      // Connect to server
      await this.connectToServer();
      console.log('Step 1: ✅ Connected to server successfully');

      console.log('Step 2: Setting up event listeners...');
      // Set up event listeners
      this.setupEventListeners();
      console.log('Step 2: ✅ Event listeners set up successfully');

      console.log('Step 3: Joining game...');
      // Join game
      await this.joinGame();
      console.log('Step 3: ✅ Game joined successfully');

      console.log('Step 4: Starting render loop...');
      // Start render loop
      this.startRenderLoop();
      console.log('Step 4: ✅ Render loop started successfully');

      this.gameRunning = true;
      console.log('✅ ClientGame started successfully - MULTIPLAYER MODE ACTIVE');

    } catch (error) {
      console.error('❌ Failed to start ClientGame:', error);
      console.error('❌ Error details:', error.message, error.stack);
      // Rethrow the error so GameCanvas can catch it and fall back
      throw error;
    }
  }

  async connectToServer() {
    console.log('Connecting to multiplayer server...');

    try {
      // Set up network callbacks
      console.log('Setting up network callbacks...');
      this.networkManager.onGameStateUpdate = (gameState) => {
        this.handleGameStateUpdate(gameState);
      };

      this.networkManager.onGameJoined = (data) => {
        this.handleGameJoined(data);
      };

      this.networkManager.onConnectionError = (error) => {
        this.handleConnectionError(error);
      };

      this.networkManager.onDisconnected = (reason) => {
        this.handleDisconnection(reason);
      };

      this.networkManager.onCashoutResult = (result) => {
        this.handleCashoutResult(result);
      };

      this.networkManager.onPlayerElimination = (eliminationData) => {
        this.handlePlayerElimination(eliminationData);
      };

      // Connect
      console.log('Attempting to connect to server...');
      await this.networkManager.connect();
      console.log('✅ Network connection established');
      this.connected = true;
    } catch (error) {
      console.error('❌ Failed to connect to server:', error);
      throw new Error(`Server connection failed: ${error.message}`);
    }
  }

  async joinGame() {
    const gameData = {
      gameMode: this.gameMode,
      username: 'Player_' + Math.floor(Math.random() * 1000),
      wager: 50,
      color: '#FFD700'
    };

    this.networkManager.joinGame(gameData);
  }

  handleGameJoined(data) {
    console.log('Game joined:', data);
    this.playerId = data.playerId;
    
    // Update initial game state
    if (data.gameState) {
      this.handleGameStateUpdate(data.gameState);
    }
  }

  handleGameStateUpdate(gameState) {
    const now = Date.now();

    // Throttle game state processing to reduce CPU load for remote clients
    if (now - this.lastGameStateUpdate < this.gameStateUpdateRate) {
      return;
    }

    this.lastGameStateUpdate = now;
    this.gameState = gameState;

    // Find local player
    this.localPlayer = this.gameState.players?.find(p => p.id === this.playerId);

    // Check if local player cashed out (ORIGINAL BEHAVIOR)
    if (this.localPlayer && this.localPlayer.cashedOut && !this.cashedOut) {
      console.log('💰 Player cashed out - entering spectate mode');
      this.cashedOut = true;
      this.spectating = true;
      this.spectateTarget = 0;
    }

    // Update camera to follow local player or spectated player
    if (this.spectating) {
      // ORIGINAL SPECTATE MODE: Follow other alive players
      const alivePlayers = this.gameState.players.filter(p => p.alive && p.id !== this.playerId);
      if (alivePlayers.length > 0) {
        const spectatedPlayer = alivePlayers[this.spectateTarget % alivePlayers.length];
        this.updateCameraForPlayer(spectatedPlayer);
      }
    } else if (this.localPlayer) {
      // Calculate dynamic zoom based on snake size/cash
      this.updateCameraZoom();

      // Calculate target camera position (center player on screen, adjusted for zoom)
      const effectiveCanvasWidth = this.canvas.width / this.camera.zoom;
      const effectiveCanvasHeight = this.canvas.height / this.camera.zoom;

      let targetX = this.localPlayer.x - effectiveCanvasWidth / 2;
      let targetY = this.localPlayer.y - effectiveCanvasHeight / 2;

      // When player is near world boundaries, position camera so world edge overlaps screen edge
      const boundaryThreshold = 50; // Small threshold for boundary detection

      // When player is near left boundary, show world edge at left screen edge
      if (this.localPlayer.x <= boundaryThreshold) {
        targetX = 0;
      }
      // When player is near right boundary, show world edge at right screen edge
      else if (this.localPlayer.x >= this.worldWidth - boundaryThreshold) {
        targetX = this.worldWidth - this.canvas.width;
      }

      // When player is near top boundary, show world edge at top screen edge
      if (this.localPlayer.y <= boundaryThreshold) {
        targetY = 0;
      }
      // When player is near bottom boundary, show world edge at bottom screen edge
      else if (this.localPlayer.y >= this.worldHeight - boundaryThreshold) {
        targetY = this.worldHeight - this.canvas.height;
      }

      // Apply final camera bounds (ensure camera never goes outside valid range, adjusted for zoom)
      this.camera.x = Math.max(0, Math.min(this.worldWidth - effectiveCanvasWidth, targetX));
      this.camera.y = Math.max(0, Math.min(this.worldHeight - effectiveCanvasHeight, targetY));
    }

    // Update React UI
    if (this.onStateUpdate && this.localPlayer) {
      // Get player data from the server's playerData object
      const playerData = this.gameState.playerData || {};

      // Determine if local player is the king (highest cash)
      const isKing = this.isKing(this.localPlayer);

      const uiState = {
        score: this.localPlayer.cash || 0,
        cashBalance: this.localPlayer.cash || 0,
        length: this.localPlayer.segments ? this.localPlayer.segments.length : 1,
        boost: this.localPlayer.boost || 100,
        weapon: playerData.weapon || this.localPlayer.weapon || 'None',
        weaponAmmo: playerData.currentWeapon ?
          (playerData.currentWeapon.type === 'sidearm' ? '∞' : `${playerData.currentWeapon.currentAmmo || 0}/${playerData.currentWeapon.maxAmmo || 0}`) :
          '0/0',
        weaponSlots: playerData.weaponInventory ? {
          primary: playerData.weaponInventory.primaryWeapon ?
            `${playerData.weaponInventory.primaryWeapon.name || playerData.weaponInventory.primaryWeapon.type} (${playerData.weaponInventory.primaryWeapon.currentAmmo || 0}/${playerData.weaponInventory.primaryWeapon.maxAmmo || 0})` :
            'Empty',
          secondary: playerData.weaponInventory.secondaryWeapon ?
            `${playerData.weaponInventory.secondaryWeapon.name || playerData.weaponInventory.secondaryWeapon.type} (${playerData.weaponInventory.secondaryWeapon.currentAmmo || 0}/${playerData.weaponInventory.secondaryWeapon.maxAmmo || 0})` :
            'Empty',
          sidearm: 'Snake Fang (∞)'
        } : null,
        currentSlot: playerData.weaponInventory?.currentSlot || 'sidearm',
        cooldown: 'Ready',
        ammoInventory: playerData.ammoInventory || {},
        powerupInventory: playerData.powerupInventory || [],
        activePowerups: playerData.activePowerups || [],
        isGameOver: !this.localPlayer.alive || this.cashedOut,
        finalScore: this.localPlayer.cash || 0,
        finalLength: this.localPlayer.segments ? this.localPlayer.segments.length : 1,
        cashedOut: this.cashedOut,
        spectating: this.spectating,
        cashoutAmount: this.localPlayer.cashoutBalance || this.localPlayer.cash || 0,
        isKing: isKing
      };



      this.onStateUpdate(uiState);

      // Check for game over (death or cashout)
      if ((!this.localPlayer.alive || this.cashedOut) && this.onGameOver) {
        this.onGameOver(uiState);
      }
    }
  }



  updateCameraZoom() {
    if (!this.localPlayer) return;

    // Calculate zoom based on snake size and cash

    // Use both snake size and cash as factors for gradual zoom
    const snakeSize = this.localPlayer.size || 10; // Default size if undefined
    const playerCash = this.localPlayer.cash || 0; // Default starting cash
    const baseSizeForZoom = 10; // Starting snake size
    const baseCashForZoom = 100; // Base cash amount for zoom calculations (higher = less sensitive)

    // Calculate growth factor with much more conservative scaling
    const sizeRatio = snakeSize / baseSizeForZoom;
    const cashRatio = playerCash / baseCashForZoom;

    // Use a weighted average instead of max, with size being primary factor
    // This makes zoom much more gradual and tied to actual snake growth
    const growthRatio = (sizeRatio * 0.7) + (Math.sqrt(cashRatio) * 0.3);

    // Zoom out gradually as snake gets bigger
    // Min zoom: 0.6 (moderately zoomed out), Max zoom: 1.0 (normal)
    const minZoom = 0.6;
    const maxZoom = 1.0;

    // Use much more conservative scaling - only zoom out significantly for very large snakes
    const zoomFactor = Math.max(minZoom, maxZoom - Math.log(growthRatio) * 0.1);

    // Smooth zoom transitions to prevent jarring camera movements
    const zoomSpeed = 0.03; // Slower, smoother zoom changes
    this.camera.zoom = this.camera.zoom + (zoomFactor - this.camera.zoom) * zoomSpeed;

    // Clamp zoom to valid range
    this.camera.zoom = Math.max(minZoom, Math.min(maxZoom, this.camera.zoom));
  }

  updateCameraForPlayer(player) {
    if (!player) return;

    // Calculate dynamic zoom based on player size/cash
    const snakeSize = player.size || 10;
    const playerCash = player.cash || 0;
    const baseSizeForZoom = 10;
    const baseCashForZoom = 100;

    const sizeRatio = snakeSize / baseSizeForZoom;
    const cashRatio = playerCash / baseCashForZoom;
    const growthRatio = (sizeRatio * 0.7) + (Math.sqrt(cashRatio) * 0.3);

    const minZoom = 0.6;
    const maxZoom = 1.0;
    const zoomFactor = Math.max(minZoom, maxZoom - Math.log(growthRatio) * 0.1);

    // Smooth zoom transitions
    const zoomSpeed = 0.03;
    this.camera.zoom = this.camera.zoom + (zoomFactor - this.camera.zoom) * zoomSpeed;
    this.camera.zoom = Math.max(minZoom, Math.min(maxZoom, this.camera.zoom));

    // Calculate target camera position
    const effectiveCanvasWidth = this.canvas.width / this.camera.zoom;
    const effectiveCanvasHeight = this.canvas.height / this.camera.zoom;

    let targetX = player.x - effectiveCanvasWidth / 2;
    let targetY = player.y - effectiveCanvasHeight / 2;

    // Apply camera bounds
    this.camera.x = Math.max(0, Math.min(this.worldWidth - effectiveCanvasWidth, targetX));
    this.camera.y = Math.max(0, Math.min(this.worldHeight - effectiveCanvasHeight, targetY));
  }

  handleConnectionError(error) {
    console.error('Connection error:', error);
    this.connected = false;
    // Could implement offline fallback here
  }

  handleDisconnection(reason) {
    console.log('Disconnected:', reason);
    this.connected = false;
    this.gameRunning = false;
  }

  handleCashoutResult(result) {
    console.log('💰 Cashout result received:', result);

    if (result.success) {
      // Show success message
      console.log(`✅ Cashout successful! Profit: $${result.profit}, Total cashed: $${result.totalCashed}`);

      // You could show a UI notification here
      if (this.onStateUpdate) {
        // Update UI to show cashout success
        this.onStateUpdate({
          cashoutResult: result,
          showCashoutMessage: true
        });
      }
    } else {
      // Show error message
      console.log(`❌ Cashout failed: ${result.reason}`);

      // You could show an error notification here
      if (this.onStateUpdate) {
        // Update UI to show cashout error
        this.onStateUpdate({
          cashoutError: result.reason,
          showCashoutError: true
        });
      }
    }
  }

  handlePlayerElimination(eliminationData) {
    console.log('🎯 Player elimination received:', eliminationData);

    // Only show elimination banner if the current player is the killer
    if (this.localPlayer && eliminationData.killerName === this.localPlayer.username) {
      if (this.onElimination) {
        this.onElimination(eliminationData);
      }
    }
  }

  setupEventListeners() {
    // Mouse movement
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
      this.sendInput();
    });

    // Mouse controls
    this.canvas.addEventListener('mousedown', (e) => {
      if (e.button === 0) {
        if (this.gameMode === 'warfare') {
          this.mouseHeld = true;
          this.shoot();
          this.startContinuousShooting();
        } else {
          this.boosting = true;
          this.sendInput();
        }
      } else if (e.button === 2) {
        this.boosting = true;
        this.sendInput();
      }
    });

    this.canvas.addEventListener('mouseup', (e) => {
      if (e.button === 0) {
        this.mouseHeld = false;
        this.stopContinuousShooting();
        if (this.gameMode !== 'warfare') {
          this.boosting = false;
          this.sendInput();
        }
      } else if (e.button === 2) {
        this.boosting = false;
        this.sendInput();
      }
    });

    // Mouse wheel for weapon switching (warfare mode only)
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();

      // Only handle weapon switching in warfare mode
      if (this.gameMode === 'warfare' && this.localPlayer && this.localPlayer.alive) {
        const direction = e.deltaY > 0 ? 1 : -1; // Scroll down = next weapon, scroll up = previous weapon
        this.switchWeaponWithScroll(direction);
      }
    });

    // Disable right-click context menu
    this.canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });

    // Keyboard controls
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (this.gameMode === 'warfare') {
          this.shoot();
        } else {
          this.boosting = true;
          this.sendInput();
        }
      }

      // Cashout (C key) - available in both modes
      if (e.code === 'KeyC') {
        e.preventDefault();
        this.cashOut();
      }

      // Spectate cycling (Tab key) - ORIGINAL BEHAVIOR
      if (e.code === 'Tab' && this.spectating) {
        e.preventDefault();
        this.cycleThroughPlayers();
      }

      // Weapon switching (warfare mode)
      if (this.gameMode === 'warfare') {
        switch (e.code) {
          case 'Digit1':
            this.switchWeapon('primaryWeapon');
            break;
          case 'Digit2':
            this.switchWeapon('secondaryWeapon');
            break;
          case 'Digit3':
            this.switchWeapon('sidearm');
            break;
          default:
            // No action for other keys
            break;
        }
      }
    });

    document.addEventListener('keyup', (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        this.boosting = false;
        this.sendInput();
      }
    });
  }

  setupGamepadCallbacks() {
    // Set up gamepad callbacks for multiplayer input
    this.gamepadManager.setCallback('onMove', (leftX, leftY) => {
      if (!this.connected || !this.localPlayer) return;

      // Convert gamepad stick input to world coordinates
      const magnitude = Math.sqrt(leftX * leftX + leftY * leftY);
      if (magnitude > this.gamepadManager.deadzone) {
        const angle = Math.atan2(leftY, leftX);
        const distance = magnitude * 200; // Scale movement distance
        const worldX = this.localPlayer.x + Math.cos(angle) * distance;
        const worldY = this.localPlayer.y + Math.sin(angle) * distance;

        // Update mouse position for input system
        this.mouse.x = (worldX - this.camera.x) * this.camera.zoom;
        this.mouse.y = (worldY - this.camera.y) * this.camera.zoom;

        this.sendInput();
      }
    });

    this.gamepadManager.setCallback('onBoost', (boosting) => {
      this.boosting = boosting;
      this.sendInput();
    });

    this.gamepadManager.setCallback('onShoot', () => {
      if (this.gameMode === 'warfare') {
        this.shoot();
      }
    });

    this.gamepadManager.setCallback('onCashout', () => {
      this.cashOut();
    });

    this.gamepadManager.setCallback('onWeaponSwitch', (slot) => {
      if (this.gameMode === 'warfare') {
        this.switchWeapon(slot);
      }
    });

    this.gamepadManager.setCallback('onSpectateNext', () => {
      if (this.spectating) {
        this.cycleThroughPlayers();
      }
    });

    // GamepadManager automatically initializes in constructor, no need to call init() again
    console.log('✅ Gamepad callbacks set up successfully');
  }

  sendInput() {
    if (!this.connected || !this.localPlayer) return;

    const now = Date.now();
    if (now - this.lastInputSent < this.inputSendRate) return;

    // Calculate target angle based on mouse position (adjusted for zoom)
    const worldMouseX = (this.mouse.x / this.camera.zoom) + this.camera.x;
    const worldMouseY = (this.mouse.y / this.camera.zoom) + this.camera.y;
    const dx = worldMouseX - this.localPlayer.x;
    const dy = worldMouseY - this.localPlayer.y;
    const targetAngle = Math.atan2(dy, dx);

    const inputData = {
      targetAngle: targetAngle,
      worldX: worldMouseX,  // Add world mouse coordinates for original movement
      worldY: worldMouseY,  // Add world mouse coordinates for original movement
      boosting: this.boosting,
      mouseHeld: this.mouseHeld || false, // Send mouse state for full auto weapons
      timestamp: now
    };

    // Removed spammy debug log

    this.networkManager.sendPlayerInput(inputData);
    this.lastInputSent = now;
  }

  shoot() {
    if (!this.connected || this.gameMode !== 'warfare' || !this.localPlayer) return;

    const worldMouseX = (this.mouse.x / this.camera.zoom) + this.camera.x;
    const worldMouseY = (this.mouse.y / this.camera.zoom) + this.camera.y;

    const shootData = {
      targetX: worldMouseX,
      targetY: worldMouseY,
      timestamp: Date.now()
    };

    this.networkManager.socket.emit('playerShoot', shootData);
  }

  startContinuousShooting() {
    if (this.shootingInterval) {
      clearInterval(this.shootingInterval);
    }

    // Get current weapon info to determine firing mode
    const playerData = this.gameState?.playerData;
    if (!playerData || !playerData.currentWeapon) return;

    const currentWeapon = playerData.currentWeapon;
    const weaponType = currentWeapon.type;

    // Define firing rates for different weapons (shots per second)
    const firingRates = {
      'sidearm': 0, // Semi-auto only
      'laser_pistol': 0, // Semi-auto only
      'plasma_smg': 8, // 8 shots per second
      'laser_rifle': 0, // Semi-auto only
      'plasma_cannon': 0, // Semi-auto only
      'rocket_launcher': 0, // Semi-auto only
      'rail_gun': 0, // Semi-auto only
      'minigun': 15 // 15 shots per second - very fast
    };

    const fireRate = firingRates[weaponType] || 0;

    // Only start continuous shooting for full auto weapons
    if (fireRate > 0) {
      const interval = 1000 / fireRate; // Convert to milliseconds
      this.shootingInterval = setInterval(() => {
        if (this.mouseHeld && this.connected && this.gameMode === 'warfare' && this.localPlayer && this.localPlayer.alive) {
          this.shoot();
        } else {
          this.stopContinuousShooting();
        }
      }, interval);
    }
  }

  stopContinuousShooting() {
    if (this.shootingInterval) {
      clearInterval(this.shootingInterval);
      this.shootingInterval = null;
    }
  }

  switchWeapon(slot) {
    if (!this.connected || this.gameMode !== 'warfare') return;

    this.networkManager.socket.emit('switchWeapon', { slot });

    // Restart continuous shooting with new weapon's fire rate if mouse is held
    if (this.mouseHeld) {
      this.stopContinuousShooting();
      // Small delay to allow server to process weapon switch
      setTimeout(() => {
        if (this.mouseHeld) {
          this.startContinuousShooting();
        }
      }, 50);
    }
  }

  switchWeaponWithScroll(direction) {
    if (!this.connected || this.gameMode !== 'warfare' || !this.localPlayer) return;

    // Get current weapon inventory from player data (server sends it in playerData, not localPlayer)
    const playerData = this.gameState?.playerData;
    if (!playerData) {
      console.warn('No playerData available for weapon switching');
      return;
    }

    const weaponInventory = playerData.weaponInventory || {};
    const currentSlot = weaponInventory.currentSlot || 'sidearm';

    // Define weapon slots in order for cycling
    const weaponSlots = ['sidearm', 'primaryWeapon', 'secondaryWeapon'];

    // Filter to only available weapons (weapons that exist in inventory)
    const availableSlots = weaponSlots.filter(slot => {
      if (slot === 'sidearm') return true; // Sidearm is always available
      return weaponInventory[slot] !== null && weaponInventory[slot] !== undefined;
    });

    // If only sidearm is available, no switching needed
    if (availableSlots.length <= 1) {
      console.log('🔫 Only sidearm available - no weapon switching');
      return;
    }

    // Find current weapon index
    const currentIndex = availableSlots.indexOf(currentSlot);
    if (currentIndex === -1) {
      console.warn('Current weapon slot not found in available slots');
      return;
    }

    // Calculate next weapon index based on scroll direction
    let nextIndex;
    if (direction > 0) {
      // Scroll down = next weapon
      nextIndex = (currentIndex + 1) % availableSlots.length;
    } else {
      // Scroll up = previous weapon
      nextIndex = (currentIndex - 1 + availableSlots.length) % availableSlots.length;
    }

    const nextSlot = availableSlots[nextIndex];

    // Get weapon name for feedback
    const weaponName = this.getWeaponDisplayName(weaponInventory[nextSlot]);
    console.log(`🔄 Switching to ${weaponName} (${nextSlot})`);

    // Show visual feedback for weapon switch
    this.showWeaponSwitchFeedback(weaponName);

    // Switch to the new weapon
    this.switchWeapon(nextSlot);
  }

  getWeaponDisplayName(weapon) {
    if (!weapon) return 'Snake Fang'; // Sidearm default name
    return weapon.name || weapon.type || 'Unknown Weapon';
  }

  showWeaponSwitchFeedback(weaponName) {
    // Store weapon switch notification data
    this.weaponSwitchNotification = {
      text: `🔄 ${weaponName}`,
      startTime: Date.now(),
      duration: 1500 // Show for 1.5 seconds
    };
  }

  drawWeaponSwitchNotification() {
    if (!this.weaponSwitchNotification) return;

    const now = Date.now();
    const elapsed = now - this.weaponSwitchNotification.startTime;

    // Remove notification if expired
    if (elapsed > this.weaponSwitchNotification.duration) {
      this.weaponSwitchNotification = null;
      return;
    }

    // Calculate fade effect
    const fadeInTime = 200; // 200ms fade in
    const fadeOutTime = 300; // 300ms fade out
    const fadeOutStart = this.weaponSwitchNotification.duration - fadeOutTime;

    let alpha = 1;
    if (elapsed < fadeInTime) {
      alpha = elapsed / fadeInTime;
    } else if (elapsed > fadeOutStart) {
      alpha = 1 - ((elapsed - fadeOutStart) / fadeOutTime);
    }

    // Position in center-top of screen
    const centerX = this.canvas.width / 2;
    const y = 80;

    this.ctx.save();

    // Background
    this.ctx.fillStyle = `rgba(0, 0, 0, ${alpha * 0.8})`;
    this.ctx.fillRect(centerX - 100, y - 20, 200, 40);

    // Border
    this.ctx.strokeStyle = `rgba(255, 215, 0, ${alpha})`;
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(centerX - 100, y - 20, 200, 40);

    // Text
    this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    this.ctx.font = '16px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(this.weaponSwitchNotification.text, centerX, y);

    this.ctx.restore();
  }

  cashOut() {
    if (!this.connected || !this.localPlayer || !this.localPlayer.alive) return;

    // Send cashout request to server
    this.networkManager.socket.emit('playerCashOut', {
      timestamp: Date.now()
    });
  }

  cycleThroughPlayers() {
    if (!this.spectating) return;

    // ORIGINAL BEHAVIOR: Cycle through alive players (excluding self)
    const alivePlayers = this.gameState.players.filter(p => p.alive && p.id !== this.playerId);
    if (alivePlayers.length === 0) return;

    this.spectateTarget = (this.spectateTarget + 1) % alivePlayers.length;
    const targetPlayer = alivePlayers[this.spectateTarget];

    console.log(`👁️ Now spectating: ${targetPlayer.username || 'Player'}`);
  }

  /**
   * Request respawn from server (ORIGINAL BEHAVIOR: Manual respawn)
   */
  requestRespawn() {
    if (!this.connected || !this.localPlayer || this.localPlayer.alive) return;

    console.log('🔄 Requesting respawn from server...');

    // Reset local state for respawn
    this.spectating = false;
    this.cashedOut = false;
    this.spectateTarget = 0;

    // Send respawn request to server
    this.networkManager.socket.emit('playerRespawn', {
      timestamp: Date.now()
    });
  }

  /**
   * Restart method called by GameContainer (ORIGINAL BEHAVIOR: Manual respawn)
   */
  restart() {
    console.log('🔄 Restart called - requesting respawn for multiplayer');
    this.requestRespawn();
  }

  startRenderLoop() {
    const render = (timestamp) => {
      this.render(timestamp);
      this.renderLoop = requestAnimationFrame(render);
    };
    this.renderLoop = requestAnimationFrame(render);
  }

  render(timestamp) {
    if (!this.gameRunning) return;

    const deltaTime = timestamp - this.lastRenderTime;
    this.lastRenderTime = timestamp;

    // Update gamepad input
    this.gamepadManager.update();

    // Calculate FPS
    this.calculateFPS(timestamp);

    // Clear main canvas with original dark background
    this.ctx.fillStyle = '#0a0a0a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Apply zoom transformation
    this.ctx.save();
    this.ctx.scale(this.camera.zoom, this.camera.zoom);

    // Adjust camera position for zoom (so zoom centers on player)
    const zoomAdjustedCameraX = this.camera.x / this.camera.zoom;
    const zoomAdjustedCameraY = this.camera.y / this.camera.zoom;

    // Draw grid
    this.drawGrid();

    // Draw world boundaries
    this.drawWorldBounds();

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
      this.drawCollisionEffects();
    }

    // Draw coins in both modes (gambling mechanics in both)
    this.drawCoins();

    // Draw king indicator
    this.drawKingIndicator();

    // Draw minimap
    this.drawMinimap();

    // Draw weapon switch notification
    this.drawWeaponSwitchNotification();

    // Draw debug info
    this.drawDebugInfo();

    // Restore canvas context after zoom transformation
    this.ctx.restore();
  }

  drawGrid() {
    this.ctx.strokeStyle = '#1a1a1a';
    this.ctx.lineWidth = 1;

    const gridSize = 50;
    const startX = Math.floor(this.camera.x / gridSize) * gridSize;
    const startY = Math.floor(this.camera.y / gridSize) * gridSize;

    const effectiveCanvasWidth = this.canvas.width / this.camera.zoom;
    const effectiveCanvasHeight = this.canvas.height / this.camera.zoom;

    for (let x = startX; x < this.camera.x + effectiveCanvasWidth; x += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x - this.camera.x, 0);
      this.ctx.lineTo(x - this.camera.x, effectiveCanvasHeight);
      this.ctx.stroke();
    }

    for (let y = startY; y < this.camera.y + effectiveCanvasHeight; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y - this.camera.y);
      this.ctx.lineTo(effectiveCanvasWidth, y - this.camera.y);
      this.ctx.stroke();
    }
  }

  drawWorldBounds() {
    // Draw world boundaries - same as original game logic
    this.ctx.strokeStyle = '#444444';
    this.ctx.lineWidth = 3;

    // Calculate world boundary positions relative to camera
    const leftBound = 0 - this.camera.x;
    const rightBound = this.worldWidth - this.camera.x;
    const topBound = 0 - this.camera.y;
    const bottomBound = this.worldHeight - this.camera.y;

    // Only draw boundaries that are visible on screen (adjusted for zoom)
    const effectiveCanvasWidth = this.canvas.width / this.camera.zoom;
    const effectiveCanvasHeight = this.canvas.height / this.camera.zoom;

    this.ctx.beginPath();

    // Left boundary
    if (leftBound >= -10 && leftBound <= effectiveCanvasWidth + 10) {
      this.ctx.moveTo(leftBound, Math.max(0, topBound));
      this.ctx.lineTo(leftBound, Math.min(effectiveCanvasHeight, bottomBound));
    }

    // Right boundary
    if (rightBound >= -10 && rightBound <= effectiveCanvasWidth + 10) {
      this.ctx.moveTo(rightBound, Math.max(0, topBound));
      this.ctx.lineTo(rightBound, Math.min(effectiveCanvasHeight, bottomBound));
    }

    // Top boundary
    if (topBound >= -10 && topBound <= effectiveCanvasHeight + 10) {
      this.ctx.moveTo(Math.max(0, leftBound), topBound);
      this.ctx.lineTo(Math.min(effectiveCanvasWidth, rightBound), topBound);
    }

    // Bottom boundary
    if (bottomBound >= -10 && bottomBound <= effectiveCanvasHeight + 10) {
      this.ctx.moveTo(Math.max(0, leftBound), bottomBound);
      this.ctx.lineTo(Math.min(effectiveCanvasWidth, rightBound), bottomBound);
    }

    this.ctx.stroke();

    // Add warning effect when player is near boundaries
    if (this.localPlayer) {
      const playerX = this.localPlayer.x;
      const playerY = this.localPlayer.y;
      const warningDistance = 100; // Distance from edge to show warning

      let nearBoundary = false;

      // Check if player is near any boundary
      if (playerX < warningDistance || playerX > this.worldWidth - warningDistance ||
          playerY < warningDistance || playerY > this.worldHeight - warningDistance) {
        nearBoundary = true;
      }

      // Draw warning effect
      if (nearBoundary) {
        const warningAlpha = 0.1 + Math.sin(Date.now() * 0.01) * 0.05;
        this.ctx.strokeStyle = `rgba(255, 0, 0, ${warningAlpha})`;
        this.ctx.lineWidth = 8;
        this.ctx.setLineDash([10, 5]);

        this.ctx.beginPath();

        // Draw warning boundaries (adjusted for zoom)
        if (leftBound >= -50 && leftBound <= effectiveCanvasWidth + 50) {
          this.ctx.moveTo(leftBound, 0);
          this.ctx.lineTo(leftBound, effectiveCanvasHeight);
        }
        if (rightBound >= -50 && rightBound <= effectiveCanvasWidth + 50) {
          this.ctx.moveTo(rightBound, 0);
          this.ctx.lineTo(rightBound, effectiveCanvasHeight);
        }
        if (topBound >= -50 && topBound <= effectiveCanvasHeight + 50) {
          this.ctx.moveTo(0, topBound);
          this.ctx.lineTo(effectiveCanvasWidth, topBound);
        }
        if (bottomBound >= -50 && bottomBound <= effectiveCanvasHeight + 50) {
          this.ctx.moveTo(0, bottomBound);
          this.ctx.lineTo(effectiveCanvasWidth, bottomBound);
        }

        this.ctx.stroke();
        this.ctx.setLineDash([]);
      }
    }
  }

  drawFood() {
    if (!this.gameState.food) return;

    this.gameState.food.forEach(food => {
      const x = food.x - this.camera.x;
      const y = food.y - this.camera.y;

      // Only draw if on screen (adjusted for zoom)
      const effectiveCanvasWidth = this.canvas.width / this.camera.zoom;
      const effectiveCanvasHeight = this.canvas.height / this.camera.zoom;
      if (x > -50 && x < effectiveCanvasWidth + 50 && y > -50 && y < effectiveCanvasHeight + 50) {
        // Check if being vacuumed by any snake
        let beingVacuumed = false;
        if (this.gameState.players) {
          for (const snake of this.gameState.players) {
            if (snake.alive && snake.segments && snake.segments.length > 0) {
              const headX = snake.segments[0].x - this.camera.x;
              const headY = snake.segments[0].y - this.camera.y;
              const distance = Math.sqrt((x - headX) ** 2 + (y - headY) ** 2);
              if (distance < snake.size * 3) {
                beingVacuumed = true;
                this.drawVacuumTrail(food, snake, x, y);
                break;
              }
            }
          }
        }

        // Draw regular colorful food
        const validFoodSize = (typeof food.size === 'number' && isFinite(food.size)) ? food.size : 5;
        const foodSize = beingVacuumed ? validFoodSize * 1.2 : validFoodSize;

        // Validate coordinates before creating gradient
        if (!isFinite(x) || !isFinite(y) || !isFinite(foodSize)) return;

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
    const headX = snake.segments[0].x - this.camera.x;
    const headY = snake.segments[0].y - this.camera.y;

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
      const progress = (time + i * 10) % 30 / 30;
      const particleX = foodX + normalizedDx * distance * progress;
      const particleY = foodY + normalizedDy * distance * progress;

      this.ctx.fillStyle = this.addAlpha(snake.color, 0.8 - progress * 0.6);
      this.ctx.beginPath();
      this.ctx.arc(particleX, particleY, 2 * (1 - progress), 0, Math.PI * 2);
      this.ctx.fill();
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
    if (!this.gameState.glowOrbs) return;

    this.gameState.glowOrbs.forEach(orb => {
      // Validate orb properties
      if (!orb || typeof orb.x !== 'number' || typeof orb.y !== 'number') return;
      if (!isFinite(orb.x) || !isFinite(orb.y)) return;

      const x = orb.x - this.camera.x;
      const y = orb.y - this.camera.y;

      // Validate screen coordinates
      if (!isFinite(x) || !isFinite(y)) return;
      const effectiveCanvasWidth = this.canvas.width / this.camera.zoom;
      const effectiveCanvasHeight = this.canvas.height / this.camera.zoom;
      if (x > -50 && x < effectiveCanvasWidth + 50 && y > -50 && y < effectiveCanvasHeight + 50) {
        const time = Date.now() * 0.001;
        const validOrbSize = (typeof orb.size === 'number' && isFinite(orb.size)) ? orb.size : 10;
        const glowSize = validOrbSize + Math.sin(orb.glow || time * 2) * 4;

        // Validate glow size
        if (!isFinite(glowSize) || glowSize <= 0) return;

        const validHue = (typeof orb.hue === 'number' && isFinite(orb.hue)) ? orb.hue : 180;
        const baseColor = `hsl(${validHue}, 100%, 70%)`;

        // 5-layer aura system
        // Outer aura (largest)
        const outerAura = this.ctx.createRadialGradient(x, y, 0, x, y, glowSize * 4);
        outerAura.addColorStop(0, `hsla(${validHue}, 100%, 70%, 0.1)`);
        outerAura.addColorStop(0.5, `hsla(${validHue}, 100%, 70%, 0.05)`);
        outerAura.addColorStop(1, 'transparent');

        this.ctx.fillStyle = outerAura;
        this.ctx.beginPath();
        this.ctx.arc(x, y, glowSize * 4, 0, Math.PI * 2);
        this.ctx.fill();

        // Mid aura
        const midAura = this.ctx.createRadialGradient(x, y, 0, x, y, glowSize * 2.5);
        midAura.addColorStop(0, `hsla(${orb.hue}, 100%, 70%, 0.2)`);
        midAura.addColorStop(0.5, `hsla(${orb.hue}, 100%, 70%, 0.1)`);
        midAura.addColorStop(1, 'transparent');

        this.ctx.fillStyle = midAura;
        this.ctx.beginPath();
        this.ctx.arc(x, y, glowSize * 2.5, 0, Math.PI * 2);
        this.ctx.fill();

        // Inner aura
        const innerAura = this.ctx.createRadialGradient(x, y, 0, x, y, glowSize * 1.5);
        innerAura.addColorStop(0, `hsla(${orb.hue}, 100%, 80%, 0.4)`);
        innerAura.addColorStop(0.7, `hsla(${orb.hue}, 100%, 70%, 0.2)`);
        innerAura.addColorStop(1, 'transparent');

        this.ctx.fillStyle = innerAura;
        this.ctx.beginPath();
        this.ctx.arc(x, y, glowSize * 1.5, 0, Math.PI * 2);
        this.ctx.fill();

        // Core orb
        const coreGradient = this.ctx.createRadialGradient(x, y, 0, x, y, glowSize);
        coreGradient.addColorStop(0, `hsl(${orb.hue}, 100%, 90%)`);
        coreGradient.addColorStop(0.7, `hsl(${orb.hue}, 100%, 70%)`);
        coreGradient.addColorStop(1, `hsl(${orb.hue}, 100%, 50%)`);

        this.ctx.fillStyle = coreGradient;
        this.ctx.beginPath();
        this.ctx.arc(x, y, glowSize, 0, Math.PI * 2);
        this.ctx.fill();

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

        // Draw energy symbol in center
        this.ctx.fillStyle = `hsla(${orb.hue}, 100%, 30%, 0.8)`;
        this.ctx.font = `${glowSize * 0.8}px monospace`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('⚡', x, y);
      }
    });
  }

  drawSnakes() {
    if (!this.gameState.players) return;

    const allSnakes = this.gameState.players.filter(s => s.alive);
    allSnakes.forEach(snake => {
      this.drawRealisticSnake(snake);
    });
  }

  drawRealisticSnake(snake) {
    if (!snake.segments || snake.segments.length < 1) return;

    // Get head position for effects
    const headX = snake.segments[0].x - this.camera.x;
    const headY = snake.segments[0].y - this.camera.y;

    // Check if any part of the snake is visible on screen (adjusted for zoom)
    let isSnakeVisible = false;
    const effectiveCanvasWidth = this.canvas.width / this.camera.zoom;
    const effectiveCanvasHeight = this.canvas.height / this.camera.zoom;
    for (let i = 0; i < Math.min(snake.segments.length, 10); i++) { // Check first 10 segments for performance
      const segX = snake.segments[i].x - this.camera.x;
      const segY = snake.segments[i].y - this.camera.y;
      if (segX >= -200 && segX <= effectiveCanvasWidth + 200 &&
          segY >= -200 && segY <= effectiveCanvasHeight + 200) {
        isSnakeVisible = true;
        break;
      }
    }

    // Skip if no part of snake is visible
    if (!isSnakeVisible) {
      // Debug: Log when snakes are being culled (only for non-local players to reduce spam)
      if (snake.id !== this.playerId) {
        console.debug(`Snake ${snake.id} culled - head at (${headX.toFixed(0)}, ${headY.toFixed(0)})`);
      }
      return;
    }

    // Check if snake is invincible and should blink - EXACT ORIGINAL ALGORITHM
    const isInvincible = snake.invincible;
    const shouldBlink = isInvincible && Math.sin(snake.blinkPhase || 0) < 0;

    // Skip drawing if blinking (creates blinking effect) - EXACT ORIGINAL
    if (shouldBlink) {
      // Still draw wager display even when blinking
      this.drawWagerDisplay(snake);
      return;
    }

    // Draw boost effect for player
    if (snake.id === this.playerId && this.boosting) {
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

    // Draw body outline (only if there are body segments)
    if (snake.segments.length > 1) {
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
    }

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

    // Step 2: Fill the interior with black - body first (only if there are body segments)
    if (snake.segments.length > 1) {
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
    }

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

      // Skip if segment is far off-screen (more generous bounds, adjusted for zoom)
      const effectiveCanvasWidth = this.canvas.width / this.camera.zoom;
      const effectiveCanvasHeight = this.canvas.height / this.camera.zoom;
      if (x < -150 || x > effectiveCanvasWidth + 150 || y < -150 || y > effectiveCanvasHeight + 150) {
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

      if (x < -150 || x > this.canvas.width + 150 || y < -150 || y > this.canvas.height + 150) {
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

      if (x < -150 || x > this.canvas.width + 150 || y < -150 || y > this.canvas.height + 150) {
        continue;
      }

      const segmentRatio = 1 - (i / snake.segments.length) * 0.4;
      const segmentSize = snake.size * segmentRatio;
      const scaleSize = segmentSize * 0.4;
      const angle = (snake.angle || 0) + (i * 0.1) + Math.sin(time + i * 0.2) * 0.1; // Dynamic rotation

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

    // More generous bounds for head rendering to prevent disappearing
    if (x < -200 || x > this.canvas.width + 200 || y < -200 || y > this.canvas.height + 200) {
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

    // Head is already drawn in drawSmoothSnakeBody as part of unified shape
    // Just add eyes here

    // Add dynamic glow effect
    const glowSize = headSize * (1.5 + Math.sin(time * 3) * 0.2);
    const glowGradient = this.ctx.createRadialGradient(x, y, headSize * 0.8, x, y, glowSize);
    glowGradient.addColorStop(0, this.addAlpha(snake.color, 0.5));
    glowGradient.addColorStop(1, 'transparent');

    this.ctx.fillStyle = glowGradient;
    this.ctx.beginPath();
    this.ctx.arc(x, y, glowSize, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw glowing cyan eyes with red pupils - ORIGINAL ALGORITHM
    // Calculate movement direction from snake angle or segments
    let eyeAngle = snake.angle || 0;

    // If no angle provided, calculate from segment movement (fallback)
    if (!snake.angle && snake.segments && snake.segments.length > 1) {
      const head = snake.segments[0];
      const neck = snake.segments[1];
      eyeAngle = Math.atan2(head.y - neck.y, head.x - neck.x);
    }

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

    // Draw all active powerup effects
    this.drawActivePowerupEffects(snake, x, y, headSize);

    // Draw crown if this snake is the king
    if (this.isKing(snake)) {
      this.drawCrown(snake, x, y, headSize);
    }
  }

  drawWagerDisplay(snake) {
    if (!snake.segments || snake.segments.length === 0) return;

    const headX = snake.segments[0].x - this.camera.x;
    const headY = snake.segments[0].y - this.camera.y;

    // Display above the snake
    const displayY = headY - snake.size * 2 - 20;

    // Background
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(headX - 30, displayY - 10, 60, 20);

    // Border
    this.ctx.strokeStyle = snake.color;
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(headX - 30, displayY - 10, 60, 20);

    // Text
    this.ctx.fillStyle = '#FFD700';
    this.ctx.font = '12px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`$${snake.cash || 0}`, headX, displayY + 3);

    // Username
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = '10px Arial';
    this.ctx.fillText(snake.username || 'Player', headX, displayY - 15);
  }

  addAlpha(color, alpha) {
    // Helper function to add alpha to hex colors
    if (color.startsWith('#')) {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    return color;
  }

  darkenColor(color, factor) {
    // Helper function to darken a color
    if (color.startsWith('#')) {
      const r = Math.floor(parseInt(color.slice(1, 3), 16) * (1 - factor));
      const g = Math.floor(parseInt(color.slice(3, 5), 16) * (1 - factor));
      const b = Math.floor(parseInt(color.slice(5, 7), 16) * (1 - factor));
      return `rgb(${r}, ${g}, ${b})`;
    }
    return color;
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
  }

  isKing(snake) {
    // Check if this snake is the king (highest cash)
    if (!this.gameState.players || this.gameState.players.length === 0) return false;

    const king = this.gameState.players.reduce((prev, current) =>
      (current.cash > prev.cash) ? current : prev
    );

    return king.id === snake.id;
  }

  drawActivePowerupEffects(snake, headX, headY, headSize) {
    // Check if snake has activePowerups array
    if (!snake.activePowerups || !Array.isArray(snake.activePowerups)) {
      return;
    }

    // Draw effects for each active powerup
    snake.activePowerups.forEach(powerup => {
      switch (powerup.type) {
        case 'helmet':
          this.drawHelmet(snake, headX, headY, headSize);
          break;
        case 'forcefield':
          this.drawForcefieldEffect(snake, headX, headY, headSize);
          this.drawSnakeBodyGlow(snake, '#00FFFF', 0.3); // Cyan glow for forcefield
          break;
        case 'armor_plating':
          this.drawArmorPlatingEffect(snake, headX, headY, headSize);
          this.drawSnakeBodyGlow(snake, '#CCCCCC', 0.2); // Silver glow for armor
          break;
        case 'shield_generator':
          this.drawShieldGeneratorEffect(snake, headX, headY, headSize);
          this.drawSnakeBodyGlow(snake, '#FFFF00', 0.4); // Yellow glow for shield
          break;
        case 'battering_ram':
          this.drawBatteringRamEffect(snake, headX, headY, headSize);
          this.drawSnakeBodyGlow(snake, '#FF6600', 0.3); // Orange glow for battering ram
          break;
        case 'speed_boost':
          this.drawSpeedBoostEffect(snake, headX, headY, headSize);
          this.drawSnakeBodyGlow(snake, '#00FF00', 0.25); // Green glow for speed
          break;
        case 'damage_amplifier':
          this.drawDamageAmplifierEffect(snake, headX, headY, headSize);
          this.drawSnakeBodyGlow(snake, '#FF0000', 0.3); // Red glow for damage
          break;
      }
    });

    // Draw powerup status indicators
    this.drawPowerupStatusIndicators(snake, headX, headY, headSize);
  }

  drawHelmet(snake, headX, headY, headSize) {
    const time = Date.now() * 0.001;
    const helmetHealth = snake.getHelmetHealth ? snake.getHelmetHealth() : 500;
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
    helmetGradient.addColorStop(0.8, this.darkenColor(helmetColor, 0.3));
    helmetGradient.addColorStop(1, this.darkenColor(helmetColor, 0.6));

    this.ctx.fillStyle = helmetGradient;
    this.ctx.beginPath();
    this.ctx.arc(headX, headY, helmetSize, 0, Math.PI * 2);
    this.ctx.fill();

    // Helmet visor
    const visorGradient = this.ctx.createLinearGradient(
      headX - helmetSize * 0.6, headY - helmetSize * 0.3,
      headX + helmetSize * 0.6, headY + helmetSize * 0.3
    );
    visorGradient.addColorStop(0, 'rgba(0, 100, 200, 0.8)');
    visorGradient.addColorStop(0.5, 'rgba(0, 150, 255, 0.6)');
    visorGradient.addColorStop(1, 'rgba(0, 100, 200, 0.8)');

    this.ctx.fillStyle = visorGradient;
    this.ctx.beginPath();
    this.ctx.ellipse(headX, headY - helmetSize * 0.1, helmetSize * 0.7, helmetSize * 0.4, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // Helmet damage cracks
    if (healthRatio < 0.8) {
      this.ctx.strokeStyle = '#FF4444';
      this.ctx.lineWidth = 2;
      this.ctx.setLineDash([3, 3]);

      // Random crack pattern based on health
      const crackCount = Math.floor((1 - healthRatio) * 5);
      for (let i = 0; i < crackCount; i++) {
        const angle = (i / crackCount) * Math.PI * 2;
        const startX = headX + Math.cos(angle) * helmetSize * 0.5;
        const startY = headY + Math.sin(angle) * helmetSize * 0.5;
        const endX = headX + Math.cos(angle + 0.5) * helmetSize * 0.9;
        const endY = headY + Math.sin(angle + 0.5) * helmetSize * 0.9;

        this.ctx.beginPath();
        this.ctx.moveTo(startX, startY);
        this.ctx.lineTo(endX, endY);
        this.ctx.stroke();
      }
      this.ctx.setLineDash([]);
    }

    this.ctx.restore();
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

    this.ctx.setLineDash([]);
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
      this.ctx.fillRect(-plateSize / 2, -plateSize / 2, plateSize, plateSize);
      this.ctx.strokeRect(-plateSize / 2, -plateSize / 2, plateSize, plateSize);

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

  drawBatteringRamEffect(snake, headX, headY, headSize) {
    const time = Date.now() * 0.001;
    const angle = snake.angle || 0;
    const isBoosting = snake.boost || false;

    this.ctx.save();

    // Enhanced meteor effect when boosting
    if (isBoosting) {
      // Large meteor head with fiery core
      const meteorSize = headSize * 1.8;
      const coreGradient = this.ctx.createRadialGradient(headX, headY, 0, headX, headY, meteorSize);
      coreGradient.addColorStop(0, '#FFFFFF');
      coreGradient.addColorStop(0.3, '#FFFF00');
      coreGradient.addColorStop(0.6, '#FF6600');
      coreGradient.addColorStop(0.8, '#FF3300');
      coreGradient.addColorStop(1, '#AA1100');

      this.ctx.fillStyle = coreGradient;
      this.ctx.beginPath();
      this.ctx.arc(headX, headY, meteorSize, 0, Math.PI * 2);
      this.ctx.fill();

      // Intense comet trail when boosting
      const trailLength = headSize * 8;
      const numTrailPoints = 15;

      for (let i = 0; i < numTrailPoints; i++) {
        const progress = i / numTrailPoints;
        const trailDistance = trailLength * progress;
        const trailX = headX - Math.cos(angle) * trailDistance;
        const trailY = headY - Math.sin(angle) * trailDistance;
        const trailSize = headSize * (2 - progress * 1.5);
        const alpha = 0.9 - progress * 0.7;

        // Fiery trail colors
        const colors = [
          `rgba(255, 255, 255, ${alpha})`,
          `rgba(255, 255, 0, ${alpha * 0.8})`,
          `rgba(255, 102, 0, ${alpha * 0.6})`,
          `rgba(255, 51, 0, ${alpha * 0.4})`,
          `rgba(170, 17, 0, ${alpha * 0.2})`
        ];

        const colorIndex = Math.floor(progress * colors.length);
        this.ctx.fillStyle = colors[Math.min(colorIndex, colors.length - 1)];
        this.ctx.beginPath();
        this.ctx.arc(trailX, trailY, trailSize, 0, Math.PI * 2);
        this.ctx.fill();
      }

      // Sparks and debris
      for (let i = 0; i < 8; i++) {
        const sparkAngle = angle + Math.PI + (Math.random() - 0.5) * 1.5;
        const sparkDistance = 30 + Math.random() * 50;
        const sparkX = headX + Math.cos(sparkAngle) * sparkDistance;
        const sparkY = headY + Math.sin(sparkAngle) * sparkDistance;
        const sparkSize = 2 + Math.random() * 4;

        this.ctx.fillStyle = `rgba(255, ${100 + Math.random() * 155}, 0, ${0.6 + Math.random() * 0.4})`;
        this.ctx.beginPath();
        this.ctx.arc(sparkX, sparkY, sparkSize, 0, Math.PI * 2);
        this.ctx.fill();
      }
    } else {
      // Normal battering ram effect (smaller)
      const cometLength = headSize * 3;
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

      // Draw normal trail effect
      trailPoints.forEach((point) => {
        const alpha = 0.6 - point.progress * 0.4;
        this.ctx.fillStyle = `rgba(255, 102, 0, ${alpha})`;
        this.ctx.beginPath();
        this.ctx.arc(point.x, point.y, point.size, 0, Math.PI * 2);
        this.ctx.fill();
      });
    }

    this.ctx.restore();
  }

  drawPowerupStatusIndicators(snake, headX, headY, headSize) {
    if (!snake.activePowerups || snake.activePowerups.length === 0) return;

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

      // Draw simple icon
      this.ctx.fillStyle = iconColor;
      this.ctx.fillRect(indicatorX - 6, indicatorY - 6, 12, 12);

      // Time remaining bar
      this.ctx.fillStyle = timeRatio > 0.3 ? '#00FF00' : '#FF0000';
      this.ctx.fillRect(indicatorX - 8, indicatorY + 10, 16 * timeRatio, 2);

      indicatorX += 30;
    });

    this.ctx.restore();
  }

  drawSnakeBodyGlow(snake, glowColor, intensity) {
    if (!snake.segments || snake.segments.length === 0) return;

    this.ctx.save();

    // Create glow effect around snake body
    const time = Date.now() * 0.001;
    const pulseIntensity = intensity * (0.8 + Math.sin(time * 3) * 0.2);

    snake.segments.forEach((segment) => {
      // Convert world coordinates to screen coordinates
      const screenX = segment.x - this.camera.x;
      const screenY = segment.y - this.camera.y;
      const segmentSize = snake.size * (1 + pulseIntensity * 0.3);

      // Only draw if segment is visible on screen
      const effectiveCanvasWidth = this.canvas.width / this.camera.zoom;
      const effectiveCanvasHeight = this.canvas.height / this.camera.zoom;
      if (screenX < -segmentSize * 2 || screenX > effectiveCanvasWidth + segmentSize * 2 ||
          screenY < -segmentSize * 2 || screenY > effectiveCanvasHeight + segmentSize * 2) {
        return;
      }

      // Create radial gradient for glow
      const gradient = this.ctx.createRadialGradient(
        screenX, screenY, 0,
        screenX, screenY, segmentSize * 1.5
      );

      // Parse color and add alpha
      const alpha = pulseIntensity * 0.6;
      if (glowColor.startsWith('#')) {
        const hex = glowColor.slice(1);
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha})`);
        gradient.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, ${alpha * 0.3})`);
        gradient.addColorStop(1, 'transparent');
      } else {
        gradient.addColorStop(0, glowColor);
        gradient.addColorStop(1, 'transparent');
      }

      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.arc(screenX, screenY, segmentSize * 1.5, 0, Math.PI * 2);
      this.ctx.fill();
    });

    this.ctx.restore();
  }

  drawSpeedBoostEffect(snake, headX, headY, headSize) {
    const time = Date.now() * 0.001;

    this.ctx.save();

    // Speed lines behind the snake
    const angle = snake.angle || 0;
    const lineCount = 8;
    const lineLength = headSize * 4;

    for (let i = 0; i < lineCount; i++) {
      const lineAngle = angle + Math.PI + (Math.random() - 0.5) * 0.5;
      const lineDistance = (i + 1) * 20;
      const lineX = headX - Math.cos(lineAngle) * lineDistance;
      const lineY = headY - Math.sin(lineAngle) * lineDistance;

      const alpha = 0.8 - (i / lineCount) * 0.6;
      this.ctx.strokeStyle = `rgba(0, 255, 0, ${alpha})`;
      this.ctx.lineWidth = 3 - (i / lineCount) * 2;
      this.ctx.setLineDash([5, 5]);
      this.ctx.lineDashOffset = time * 20;

      this.ctx.beginPath();
      this.ctx.moveTo(lineX, lineY);
      this.ctx.lineTo(lineX - Math.cos(lineAngle) * lineLength, lineY - Math.sin(lineAngle) * lineLength);
      this.ctx.stroke();
    }

    this.ctx.setLineDash([]);
    this.ctx.restore();
  }

  drawDamageAmplifierEffect(snake, headX, headY, headSize) {
    const time = Date.now() * 0.001;

    this.ctx.save();

    // Pulsing red energy around the head
    const pulseSize = headSize * (1.5 + Math.sin(time * 6) * 0.3);
    const pulseAlpha = 0.4 + Math.sin(time * 6) * 0.2;

    // Outer energy ring
    const outerGradient = this.ctx.createRadialGradient(headX, headY, 0, headX, headY, pulseSize);
    outerGradient.addColorStop(0, 'transparent');
    outerGradient.addColorStop(0.7, `rgba(255, 0, 0, ${pulseAlpha * 0.3})`);
    outerGradient.addColorStop(1, 'transparent');

    this.ctx.fillStyle = outerGradient;
    this.ctx.beginPath();
    this.ctx.arc(headX, headY, pulseSize, 0, Math.PI * 2);
    this.ctx.fill();

    // Inner energy core
    const coreGradient = this.ctx.createRadialGradient(headX, headY, 0, headX, headY, headSize * 0.8);
    coreGradient.addColorStop(0, `rgba(255, 100, 100, ${pulseAlpha})`);
    coreGradient.addColorStop(1, 'transparent');

    this.ctx.fillStyle = coreGradient;
    this.ctx.beginPath();
    this.ctx.arc(headX, headY, headSize * 0.8, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();
  }

  // Helper method to darken colors
  darkenColor(color, factor) {
    // Simple color darkening - convert hex to RGB, darken, convert back
    if (color.startsWith('#')) {
      const hex = color.slice(1);
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);

      const newR = Math.floor(r * (1 - factor));
      const newG = Math.floor(g * (1 - factor));
      const newB = Math.floor(b * (1 - factor));

      return `rgb(${newR}, ${newG}, ${newB})`;
    }
    return color; // Return original if not hex
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

    this.ctx.restore();
  }

  drawWeapons() {
    if (!this.gameState.weapons) return;

    // Only draw weapons that haven't been collected
    this.gameState.weapons.forEach(weapon => {
      if (!weapon.collected) {
        this.drawWeapon(weapon);
      }
    });
  }

  drawWeapon(weapon) {
    // Validate weapon object
    if (!weapon || typeof weapon.x !== 'number' || typeof weapon.y !== 'number') {
      console.warn('Invalid weapon object:', weapon);
      return;
    }
    if (!isFinite(weapon.x) || !isFinite(weapon.y)) {
      console.warn('Invalid weapon coordinates:', weapon.x, weapon.y);
      return;
    }

    const screenX = weapon.x - this.camera.x;
    const screenY = weapon.y - this.camera.y;

    // Don't draw if off screen
    if (screenX < -100 || screenX > this.canvas.width + 100 ||
        screenY < -100 || screenY > this.canvas.height + 100) {
      return;
    }

    const time = Date.now() * 0.001;

    // Enhanced weapon bubble design
    this.drawWeaponContainer(weapon, screenX, screenY, time);
    this.drawWeaponIcon(weapon, screenX, screenY, time);
    this.drawWeaponEffects(weapon, screenX, screenY, time);
  }

  drawWeaponContainer(weapon, x, y, time) {
    // Validate weapon properties
    if (!weapon || typeof weapon.size !== 'number' || !isFinite(weapon.size)) {
      console.warn('Invalid weapon size:', weapon);
      return;
    }
    if (!weapon.color || typeof weapon.color !== 'string') {
      console.warn('Invalid weapon color:', weapon);
      return;
    }
    if (!isFinite(x) || !isFinite(y)) {
      console.warn('Invalid weapon coordinates:', x, y);
      return;
    }

    const containerSize = weapon.size * 1.5;

    // Hexagonal container
    const hexRadius = containerSize * 0.9;
    this.ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const hx = x + Math.cos(angle) * hexRadius;
      const hy = y + Math.sin(angle) * hexRadius;
      if (i === 0) this.ctx.moveTo(hx, hy);
      else this.ctx.lineTo(hx, hy);
    }
    this.ctx.closePath();

    // Container gradient
    const containerGradient = this.ctx.createRadialGradient(x, y, 0, x, y, hexRadius);
    containerGradient.addColorStop(0, weapon.color + 'CC');
    containerGradient.addColorStop(0.3, weapon.color + 'AA');
    containerGradient.addColorStop(0.7, weapon.color + '88');
    containerGradient.addColorStop(1, weapon.color + 'DD');

    this.ctx.fillStyle = containerGradient;
    this.ctx.fill();

    // Container border
    this.ctx.strokeStyle = weapon.color;
    this.ctx.lineWidth = 3;
    this.ctx.stroke();
  }

  drawWeaponIcon(weapon, x, y, time) {
    // Validate weapon properties
    if (!weapon || typeof weapon.size !== 'number' || !isFinite(weapon.size)) {
      return;
    }
    if (!isFinite(x) || !isFinite(y)) {
      return;
    }

    this.ctx.save();

    // Try to use loaded icon first
    const iconKey = `weapon_${weapon.type}`;
    const iconImage = this.icons.get(iconKey);

    if (iconImage && iconImage.complete && iconImage.naturalWidth > 0 && this.iconsLoaded) {
      try {
        // Draw the actual icon image
        const iconSize = weapon.size * 1.5; // Make icons slightly larger than the original size
        this.ctx.drawImage(
          iconImage,
          x - iconSize / 2,
          y - iconSize / 2,
          iconSize,
          iconSize
        );
      } catch (error) {
        console.warn(`Failed to draw weapon icon for ${weapon.type}:`, error);
        // Fall through to emoji fallback
      }
    } else {
      // Fallback to emoji icons if image not loaded
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.font = `${weapon.size}px Arial`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';

      // Get fallback icon based on weapon type
      const weaponIcons = {
        sidearm: '🔫',
        laser_pistol: '🔴',
        laser_rifle: '🟠',
        plasma_smg: '🟢',
        plasma_cannon: '🟣',
        rocket_launcher: '🚀',
        rail_gun: '🔵',
        minigun: '🟡'
      };

      const icon = weaponIcons[weapon.type] || '🔫';
      this.ctx.fillText(icon, x, y);
    }

    this.ctx.restore();
  }

  drawWeaponEffects(weapon, x, y, time) {
    // Validate weapon properties
    if (!weapon || typeof weapon.size !== 'number' || !isFinite(weapon.size)) {
      return;
    }
    if (!weapon.color || typeof weapon.color !== 'string') {
      return;
    }
    if (!isFinite(x) || !isFinite(y)) {
      return;
    }

    // Energy particles
    const particleCount = 12;
    for (let i = 0; i < particleCount; i++) {
      const angle = (time * 1.5 + i * (Math.PI * 2 / particleCount)) % (Math.PI * 2);
      const distance = weapon.size * (1.8 + Math.sin(time * 3 + i) * 0.4);
      const particleX = x + Math.cos(angle) * distance;
      const particleY = y + Math.sin(angle) * distance;

      const particleSize = 1.5 + Math.sin(time * 4 + i) * 0.8;
      const alpha = 0.4 + Math.sin(time * 5 + i) * 0.3;

      this.ctx.fillStyle = this.addAlpha(weapon.color, alpha);
      this.ctx.beginPath();
      this.ctx.arc(particleX, particleY, particleSize, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  drawAmmo() {
    if (!this.gameState.ammo) return;

    this.gameState.ammo.forEach(ammoItem => {
      if (!ammoItem.collected) {
        this.drawAmmoItem(ammoItem);
      }
    });
  }

  drawAmmoItem(ammo) {
    // Validate ammo properties
    if (!ammo || typeof ammo.x !== 'number' || typeof ammo.y !== 'number') {
      console.warn('Invalid ammo object:', ammo);
      return;
    }
    if (!isFinite(ammo.x) || !isFinite(ammo.y)) {
      console.warn('Invalid ammo coordinates:', ammo.x, ammo.y);
      return;
    }
    if (!ammo.size || typeof ammo.size !== 'number' || !isFinite(ammo.size)) {
      console.warn('Invalid ammo size:', ammo.size);
      return;
    }
    if (!ammo.color || typeof ammo.color !== 'string') {
      console.warn('Invalid ammo color:', ammo.color);
      return;
    }

    const screenX = ammo.x - this.camera.x;
    const screenY = ammo.y - this.camera.y;

    // Validate screen coordinates
    if (!isFinite(screenX) || !isFinite(screenY)) {
      console.warn('Invalid ammo screen coordinates:', screenX, screenY);
      return;
    }

    // Don't draw if off screen
    if (screenX < -50 || screenX > this.canvas.width + 50 ||
        screenY < -50 || screenY > this.canvas.height + 50) {
      return;
    }

    const time = Date.now() * 0.001;
    const bobOffset = Math.sin(time * 3 + (ammo.bobPhase || 0)) * 3;
    const finalY = screenY + bobOffset;

    this.ctx.save();
    this.ctx.translate(screenX, finalY);

    // Ammo container with glow effect
    const containerGradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, ammo.size * 1.5);
    containerGradient.addColorStop(0, ammo.color + 'FF');
    containerGradient.addColorStop(0.7, ammo.color + '88');
    containerGradient.addColorStop(1, ammo.color + '22');

    this.ctx.fillStyle = containerGradient;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, ammo.size * 1.2, 0, Math.PI * 2);
    this.ctx.fill();

    // Inner ammo container
    this.ctx.fillStyle = ammo.color;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, ammo.size, 0, Math.PI * 2);
    this.ctx.fill();

    // Try to use loaded icon first
    const iconKey = `ammo_${ammo.type}`;
    const iconImage = this.icons.get(iconKey);

    if (iconImage && iconImage.complete && iconImage.naturalWidth > 0 && this.iconsLoaded) {
      try {
        // Draw the actual icon image
        const iconSize = ammo.size * 1.4; // Make icons slightly larger than the container
        this.ctx.drawImage(
          iconImage,
          -iconSize / 2,
          -iconSize / 2,
          iconSize,
          iconSize
        );
      } catch (error) {
        console.warn(`Failed to draw ammo icon for ${ammo.type}:`, error);
        // Fall through to emoji fallback
      }
    } else {
      // Fallback to simple icons if image not loaded
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.font = `${ammo.size * 0.8}px Arial`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';

      // Get fallback icon based on ammo type
      const ammoIcons = {
        light_energy: '⚡',
        heavy_energy: '🔋',
        plasma_cells: '🟢',
        heavy_plasma: '🟡',
        rockets: '🚀',
        rail_slugs: '🔹'
      };

      const icon = ammoIcons[ammo.type] || '●';
      this.ctx.fillText(icon, 0, 0);
    }

    this.ctx.restore();
  }

  drawPowerups() {
    if (!this.gameState.powerups) return;

    this.gameState.powerups.forEach(powerupItem => {
      if (!powerupItem.collected) {
        this.drawPowerup(powerupItem);
      }
    });
  }

  drawPowerup(powerup) {
    // Validate powerup properties
    if (!powerup || typeof powerup.x !== 'number' || typeof powerup.y !== 'number') {
      console.warn('Invalid powerup object:', powerup);
      return;
    }
    if (!isFinite(powerup.x) || !isFinite(powerup.y)) {
      console.warn('Invalid powerup coordinates:', powerup.x, powerup.y);
      return;
    }
    if (!powerup.size || typeof powerup.size !== 'number' || !isFinite(powerup.size)) {
      console.warn('Invalid powerup size:', powerup.size);
      return;
    }
    if (!powerup.color || typeof powerup.color !== 'string') {
      console.warn('Invalid powerup color:', powerup.color);
      return;
    }

    const screenX = powerup.x - this.camera.x;
    const screenY = powerup.y - this.camera.y;

    // Validate screen coordinates
    if (!isFinite(screenX) || !isFinite(screenY)) {
      console.warn('Invalid screen coordinates:', screenX, screenY);
      return;
    }

    const time = Date.now() * 0.001;
    const bobOffset = Math.sin(powerup.bobPhase || time * 3) * 3;
    const finalY = screenY + bobOffset;

    // Validate final coordinates
    if (!isFinite(finalY)) {
      console.warn('Invalid final Y coordinate:', finalY);
      return;
    }

    this.ctx.save();
    this.ctx.translate(screenX, finalY);

    // Rotation
    this.ctx.rotate(powerup.animationOffset || time);

    // Draw powerup bubble
    const bubbleGradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, powerup.size);
    bubbleGradient.addColorStop(0, powerup.color + 'FF');
    bubbleGradient.addColorStop(0.7, powerup.color + 'AA');
    bubbleGradient.addColorStop(1, powerup.color + '44');

    this.ctx.fillStyle = bubbleGradient;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, powerup.size, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw powerup icon - try to use loaded icon first
    const iconKey = `powerup_${powerup.type}`;
    const iconImage = this.icons.get(iconKey);

    // Debug logging for shield generator specifically
    if (powerup.type === 'shield_generator') {
      console.log('Shield Generator Debug:', {
        iconKey,
        iconExists: !!iconImage,
        iconComplete: iconImage?.complete,
        iconWidth: iconImage?.naturalWidth,
        iconsLoaded: this.iconsLoaded
      });
    }

    if (iconImage && iconImage.complete && iconImage.naturalWidth > 0 && this.iconsLoaded) {
      try {
        // Draw the actual icon image
        const iconSize = powerup.size * 1.2; // Make icons slightly larger than the bubble
        this.ctx.drawImage(
          iconImage,
          -iconSize / 2,
          -iconSize / 2,
          iconSize,
          iconSize
        );

        // Debug success for shield generator
        if (powerup.type === 'shield_generator') {
          console.log('✅ Shield Generator icon drawn successfully');
        }
      } catch (error) {
        console.warn(`Failed to draw powerup icon for ${powerup.type}:`, error);
        // Fall through to emoji fallback
      }
    } else {
      // Fallback to emoji icons if image not loaded
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.font = `${powerup.size * 0.8}px Arial`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';

      // Get fallback icon based on powerup type
      const powerupIcons = {
        helmet: '⛑️',
        armor_plating: '🛡️',
        shield_generator: '🔰',
        forcefield: '🔵',
        battering_ram: '🔨',
        speed_boost: '💨',
        damage_amplifier: '💥'
      };

      const icon = powerupIcons[powerup.type] || '⚡';
      this.ctx.fillText(icon, 0, 0);
    }

    this.ctx.restore();
  }

  drawProjectiles() {
    if (!this.gameState.projectiles) return;

    this.gameState.projectiles.forEach(projectile => {
      this.drawProjectile(projectile);
    });
  }

  drawCollisionEffects() {
    if (!this.gameState.collisionEffects) return;

    this.gameState.collisionEffects.forEach(effect => {
      this.drawCollisionEffect(effect);
    });
  }

  drawCollisionEffect(effect) {
    if (!effect || !effect.particles) return;

    const screenX = effect.x - this.camera.x;
    const screenY = effect.y - this.camera.y;

    // Skip if effect is off-screen
    if (screenX < -100 || screenX > this.canvas.width + 100 ||
        screenY < -100 || screenY > this.canvas.height + 100) {
      return;
    }

    this.ctx.save();

    // Draw central flash effect
    const age = Date.now() - effect.createdAt;
    const progress = age / effect.duration;
    const flashAlpha = Math.max(0, 1 - progress * 2); // Quick fade

    if (flashAlpha > 0) {
      const flashSize = effect.size * (1 + progress * 0.5);

      // Outer glow
      this.ctx.globalAlpha = flashAlpha * 0.3;
      this.ctx.fillStyle = effect.color;
      this.ctx.beginPath();
      this.ctx.arc(screenX, screenY, flashSize * 1.5, 0, Math.PI * 2);
      this.ctx.fill();

      // Inner flash
      this.ctx.globalAlpha = flashAlpha * 0.8;
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.beginPath();
      this.ctx.arc(screenX, screenY, flashSize * 0.5, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // Draw particles
    effect.particles.forEach(particle => {
      const particleScreenX = particle.x - this.camera.x;
      const particleScreenY = particle.y - this.camera.y;

      const particleProgress = 1 - (particle.life / particle.maxLife);
      const particleAlpha = Math.max(0, 1 - particleProgress);
      const particleSize = particle.size * (1 - particleProgress * 0.5);

      if (particleAlpha > 0 && particleSize > 0) {
        this.ctx.globalAlpha = particleAlpha;
        this.ctx.fillStyle = particle.color;
        this.ctx.beginPath();
        this.ctx.arc(particleScreenX, particleScreenY, particleSize, 0, Math.PI * 2);
        this.ctx.fill();
      }
    });

    this.ctx.restore();
  }

  drawProjectile(projectile) {
    // Validate projectile properties
    if (!projectile || typeof projectile.x !== 'number' || typeof projectile.y !== 'number') {
      console.warn('Invalid projectile object:', projectile);
      return;
    }
    if (!isFinite(projectile.x) || !isFinite(projectile.y)) {
      console.warn('Invalid projectile coordinates:', projectile.x, projectile.y);
      return;
    }

    const x = projectile.x - this.camera.x;
    const y = projectile.y - this.camera.y;

    // Validate screen coordinates
    if (!isFinite(x) || !isFinite(y)) {
      console.warn('Invalid projectile screen coordinates:', x, y);
      return;
    }

    // Don't draw if off screen
    if (x < -100 || x > this.canvas.width + 100 ||
        y < -100 || y > this.canvas.height + 100) {
      return;
    }

    const time = Date.now() * 0.001;
    const age = (Date.now() - (projectile.createdAt || Date.now())) * 0.001;

    // Draw projectile based on type with enhanced animations from original game
    switch (projectile.type) {
      case 'sidearm':
        this.drawDefaultProjectile(projectile, x, y, time, age);
        break;
      case 'laser_pistol':
      case 'laser_rifle':
        this.drawLaserProjectile(projectile, x, y, time, age);
        break;
      case 'plasma_smg':
      case 'plasma_cannon':
        this.drawPlasmaProjectile(projectile, x, y, time, age);
        break;
      case 'rocket_launcher':
        this.drawMissileProjectile(projectile, x, y, time, age);
        break;
      case 'rail_gun':
        this.drawRailGunProjectile(projectile, x, y, time, age);
        break;
      default:
        this.drawDefaultProjectile(projectile, x, y, time, age);
        break;
    }
  }

  drawLaserProjectile(projectile, x, y, time, age) {
    this.ctx.save();

    // Draw laser beam with glow effects
    const beamLength = 30;
    const angle = projectile.angle || Math.atan2(projectile.vy || 0, projectile.vx || 0);

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

    // Core laser beam
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

    this.ctx.restore();
  }

  drawPlasmaProjectile(projectile, x, y, time, age) {
    this.ctx.save();

    const pulseSize = 12 + Math.sin(time * 8 + (projectile.animationOffset || 0)) * 4;

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

    // Inner plasma core
    const coreGradient = this.ctx.createRadialGradient(x, y, 0, x, y, pulseSize);
    coreGradient.addColorStop(0, '#FFFFFF');
    coreGradient.addColorStop(0.3, '#88FF88');
    coreGradient.addColorStop(0.7, '#44FF44');
    coreGradient.addColorStop(1, 'rgba(68, 255, 68, 0.5)');

    this.ctx.fillStyle = coreGradient;
    this.ctx.beginPath();
    this.ctx.arc(x, y, pulseSize, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();
  }

  drawMissileProjectile(projectile, x, y, time, age) {
    this.ctx.save();

    // Draw exhaust trail
    this.drawProjectileTrail(projectile, '#FF8844', 0.8);

    // Rotate missile to face direction of travel
    this.ctx.translate(x, y);
    this.ctx.rotate(projectile.angle || Math.atan2(projectile.vy || 0, projectile.vx || 0));

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

    // Exhaust flame
    const flameSize = 8 + Math.sin(time * 20) * 3;
    const flameGradient = this.ctx.createLinearGradient(-8, 0, -flameSize, 0);
    flameGradient.addColorStop(0, '#FF8844');
    flameGradient.addColorStop(0.5, '#FFAA44');
    flameGradient.addColorStop(1, 'transparent');

    this.ctx.fillStyle = flameGradient;
    this.ctx.beginPath();
    this.ctx.moveTo(-8, -2);
    this.ctx.lineTo(-flameSize, 0);
    this.ctx.lineTo(-8, 2);
    this.ctx.closePath();
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

    // Core slug
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.shadowColor = '#4444FF';
    this.ctx.shadowBlur = 10;
    this.ctx.beginPath();
    this.ctx.arc(x, y, coreSize, 0, Math.PI * 2);
    this.ctx.fill();

    // Electric arcs
    for (let i = 0; i < 4; i++) {
      const arcAngle = (time * 5 + i * Math.PI / 2) % (Math.PI * 2);
      const arcRadius = fieldSize * 0.8;
      const arcX = x + Math.cos(arcAngle) * arcRadius;
      const arcY = y + Math.sin(arcAngle) * arcRadius;

      this.ctx.strokeStyle = `rgba(68, 68, 255, 0.6)`;
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(x, y);
      this.ctx.lineTo(arcX, arcY);
      this.ctx.stroke();
    }

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

    this.ctx.save();

    // Simple projectile with basic trail
    const projectileSize = projectile.size || 3;
    const trailLength = 15;
    const angle = projectile.angle || Math.atan2(projectile.vy || 0, projectile.vx || 0);

    // Draw trail
    const trailStartX = x - Math.cos(angle) * trailLength;
    const trailStartY = y - Math.sin(angle) * trailLength;

    const gradient = this.ctx.createLinearGradient(trailStartX, trailStartY, x, y);
    gradient.addColorStop(0, 'rgba(255, 255, 0, 0)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 0, 0.5)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 1)');

    this.ctx.strokeStyle = gradient;
    this.ctx.lineWidth = 3;
    this.ctx.lineCap = 'round';

    this.ctx.beginPath();
    this.ctx.moveTo(trailStartX, trailStartY);
    this.ctx.lineTo(x, y);
    this.ctx.stroke();

    // Draw projectile
    this.ctx.fillStyle = projectile.color || '#FFFF00';
    this.ctx.shadowColor = projectile.color || '#FFFF00';
    this.ctx.shadowBlur = 5;
    this.ctx.beginPath();
    this.ctx.arc(x, y, projectileSize, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();
  }

  drawTracerRound(projectile, x, y, time, age) {
    this.ctx.save();

    const trailLength = 25;
    const angle = projectile.angle || Math.atan2(projectile.vy || 0, projectile.vx || 0);

    // Calculate trail start position
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

  drawCoins() {
    if (!this.gameState.coins) return;

    const time = Date.now() * 0.001;

    this.gameState.coins.forEach(coin => {
      // Validate coin properties
      if (!coin || typeof coin.x !== 'number' || typeof coin.y !== 'number') return;
      if (!isFinite(coin.x) || !isFinite(coin.y)) return;

      const coinSize = (typeof coin.size === 'number' && isFinite(coin.size)) ? coin.size : 10;

      const x = coin.x - this.camera.x;
      const y = coin.y - this.camera.y;

      // Only draw if on screen and coordinates are valid
      if (!isFinite(x) || !isFinite(y)) return;
      if (x > -50 && x < this.canvas.width + 50 && y > -50 && y < this.canvas.height + 50) {
        const bobOffset = Math.sin(time * 3 + (coin.bobPhase || 0)) * 2;
        const finalY = y + bobOffset;

        // Validate final coordinates before creating gradient
        if (!isFinite(finalY) || !isFinite(coinSize)) return;

        // Coin glow
        const glowGradient = this.ctx.createRadialGradient(x, finalY, 0, x, finalY, coinSize * 2);
        glowGradient.addColorStop(0, '#FFD700');
        glowGradient.addColorStop(0.5, '#FFA500');
        glowGradient.addColorStop(1, 'transparent');

        this.ctx.fillStyle = glowGradient;
        this.ctx.beginPath();
        this.ctx.arc(x, finalY, coinSize * 2, 0, Math.PI * 2);
        this.ctx.fill();

        // Main coin
        this.ctx.fillStyle = '#FFD700';
        this.ctx.beginPath();
        this.ctx.arc(x, finalY, coinSize, 0, Math.PI * 2);
        this.ctx.fill();

        // Coin center
        this.ctx.fillStyle = '#FFA500';
        this.ctx.beginPath();
        this.ctx.arc(x, finalY, coinSize * 0.6, 0, Math.PI * 2);
        this.ctx.fill();

        // Dollar sign
        this.ctx.fillStyle = '#000000';
        this.ctx.font = `${coinSize}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('$', x, finalY);

        // Draw sparkles around coin
        for (let i = 0; i < 4; i++) {
          const sparkleAngle = (time * 2 + i * Math.PI / 2) % (Math.PI * 2);
          const sparkleDistance = coinSize * 1.8;
          const sparkleX = x + Math.cos(sparkleAngle) * sparkleDistance;
          const sparkleY = finalY + Math.sin(sparkleAngle) * sparkleDistance;

          // Validate sparkle coordinates
          if (isFinite(sparkleX) && isFinite(sparkleY)) {
            this.ctx.fillStyle = `rgba(255, 255, 255, 0.8)`;
            this.ctx.beginPath();
            this.ctx.arc(sparkleX, sparkleY, 1.5, 0, Math.PI * 2);
            this.ctx.fill();
          }
        }
      }
    });
  }

  drawKingIndicator() {
    // Find the king (player with highest cash)
    if (!this.gameState.players || this.gameState.players.length === 0) return;

    const king = this.gameState.players.reduce((prev, current) =>
      (current.cash > prev.cash) ? current : prev
    );

    // Don't show indicator if no king or if the current player is the king
    if (!king || !king.segments || king.segments.length === 0) return;
    if (this.gameState.playerData && king.id === this.gameState.playerData.id) return;

    const kingWorldX = king.segments[0].x;
    const kingWorldY = king.segments[0].y;
    const kingScreenX = kingWorldX - this.camera.x;
    const kingScreenY = kingWorldY - this.camera.y;

    // Check if king is visible on screen
    const margin = 100;
    const isKingVisible = kingScreenX >= -margin && kingScreenX <= this.canvas.width + margin &&
                         kingScreenY >= -margin && kingScreenY <= this.canvas.height + margin;

    // Only show directional indicator if king is off-screen
    if (!isKingVisible) {
      this.drawOffScreenKingIndicator(kingWorldX, kingWorldY);
    }
  }

  drawOffScreenKingIndicator(kingWorldX, kingWorldY) {
    // Calculate player position (camera center represents player position)
    const playerX = this.camera.x + this.canvas.width / 2;
    const playerY = this.camera.y + this.canvas.height / 2;

    // Calculate direction to king
    const dx = kingWorldX - playerX;
    const dy = kingWorldY - playerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);

    // Position indicator at edge of screen
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    const radius = Math.min(centerX, centerY) * 0.85; // 85% of screen radius

    const indicatorX = centerX + Math.cos(angle) * radius;
    const indicatorY = centerY + Math.sin(angle) * radius;

    this.ctx.save();

    // Pulsing effect
    const time = Date.now() * 0.003;
    const pulse = 1 + Math.sin(time * 4) * 0.15;

    // Draw arrow pointing to king
    const arrowSize = 16;
    this.ctx.translate(indicatorX, indicatorY);
    this.ctx.rotate(angle);
    this.ctx.scale(pulse, pulse);

    // Arrow background
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.strokeStyle = '#FFD700';
    this.ctx.lineWidth = 2;

    // Draw arrow shape
    this.ctx.beginPath();
    this.ctx.moveTo(arrowSize, 0);
    this.ctx.lineTo(-arrowSize * 0.6, -arrowSize * 0.4);
    this.ctx.lineTo(-arrowSize * 0.3, 0);
    this.ctx.lineTo(-arrowSize * 0.6, arrowSize * 0.4);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();

    this.ctx.restore();

    // Draw crown icon next to arrow
    this.drawKingCrownIcon(indicatorX, indicatorY, angle, distance);
  }

  drawKingCrownIcon(indicatorX, indicatorY, angle, distance) {
    this.ctx.save();

    // Position crown icon offset from arrow
    const crownOffset = 35;
    const crownX = indicatorX + Math.cos(angle + Math.PI / 2) * crownOffset;
    const crownY = indicatorY + Math.sin(angle + Math.PI / 2) * crownOffset;

    // Draw crown icon using SVG-style path
    const crownSize = 14;
    this.ctx.translate(crownX, crownY);

    // Crown base
    this.ctx.fillStyle = '#FFD700';
    this.ctx.fillRect(-crownSize, -crownSize * 0.3, crownSize * 2, crownSize * 0.6);

    // Crown spikes
    this.ctx.beginPath();
    const spikes = [
      { x: -crownSize * 0.8, height: crownSize * 0.6 },
      { x: -crownSize * 0.4, height: crownSize * 0.8 },
      { x: 0, height: crownSize },
      { x: crownSize * 0.4, height: crownSize * 0.8 },
      { x: crownSize * 0.8, height: crownSize * 0.6 }
    ];

    spikes.forEach(spike => {
      this.ctx.moveTo(spike.x - crownSize * 0.15, -crownSize * 0.3);
      this.ctx.lineTo(spike.x, -crownSize * 0.3 - spike.height);
      this.ctx.lineTo(spike.x + crownSize * 0.15, -crownSize * 0.3);
    });
    this.ctx.closePath();
    this.ctx.fill();

    // Crown gems
    this.ctx.fillStyle = '#FF4444';
    [-crownSize * 0.5, 0, crownSize * 0.5].forEach(x => {
      this.ctx.beginPath();
      this.ctx.arc(x, -crownSize * 0.1, crownSize * 0.08, 0, Math.PI * 2);
      this.ctx.fill();
    });

    // Distance text
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.strokeStyle = '#000000';
    this.ctx.lineWidth = 3;
    this.ctx.font = 'bold 11px monospace';
    this.ctx.textAlign = 'center';
    const distanceText = `${Math.floor(distance)}m`;
    this.ctx.strokeText(distanceText, 0, crownSize + 18);
    this.ctx.fillText(distanceText, 0, crownSize + 18);

    this.ctx.restore();
  }

  calculateFPS(timestamp) {
    // Add current frame time
    this.frameTimes.push(timestamp);

    // Keep only the last second of frame times
    const oneSecondAgo = timestamp - 1000;
    this.frameTimes = this.frameTimes.filter(time => time > oneSecondAgo);

    // Calculate FPS as the number of frames in the last second
    this.fps = this.frameTimes.length;
  }

  drawDebugInfo() {
    // FPS and connection status
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '12px monospace';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`FPS: ${this.fps}`, 10, 20);

    if (this.connected) {
      this.ctx.fillText('🟢 Connected', 10, 40);
    } else {
      this.ctx.fillText('🔴 Disconnected', 10, 40);
    }

    // Player count
    const playerCount = this.gameState.players ? this.gameState.players.length : 0;
    this.ctx.fillText(`Players: ${playerCount}`, 10, 60);

    // Zoom debug info
    if (this.localPlayer) {
      this.ctx.fillText(`Zoom: ${(this.camera.zoom * 100).toFixed(0)}%`, 10, 80);
      this.ctx.fillText(`Size: ${this.localPlayer.size?.toFixed(1) || 'N/A'}`, 10, 100);
      this.ctx.fillText(`Cash: $${this.localPlayer.cash || 0}`, 10, 120);
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
    const foodSample = this.gameState.food.filter((_, i) => i % 10 === 0); // Show every 10th food item
    foodSample.forEach(food => {
      const x = food.x * scaleX;
      const y = food.y * scaleY;

      this.minimapCtx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      this.minimapCtx.beginPath();
      this.minimapCtx.arc(x, y, 0.5, 0, Math.PI * 2);
      this.minimapCtx.fill();
    });

    // Draw glow orbs
    this.gameState.glowOrbs.forEach(orb => {
      const x = orb.x * scaleX;
      const y = orb.y * scaleY;

      this.minimapCtx.fillStyle = 'rgba(0, 255, 255, 0.6)';
      this.minimapCtx.beginPath();
      this.minimapCtx.arc(x, y, 1, 0, Math.PI * 2);
      this.minimapCtx.fill();
    });

    // Draw coins
    this.gameState.coins.forEach(coin => {
      const x = coin.x * scaleX;
      const y = coin.y * scaleY;

      this.minimapCtx.fillStyle = '#FFD700';
      this.minimapCtx.beginPath();
      this.minimapCtx.arc(x, y, 1, 0, Math.PI * 2);
      this.minimapCtx.fill();
    });

    // Draw weapons (in warfare mode)
    if (this.gameMode === 'warfare' && this.gameState.weapons) {
      this.gameState.weapons.forEach(weapon => {
        const x = weapon.x * scaleX;
        const y = weapon.y * scaleY;

        this.minimapCtx.fillStyle = '#FF6B35';
        this.minimapCtx.beginPath();
        this.minimapCtx.arc(x, y, 1, 0, Math.PI * 2);
        this.minimapCtx.fill();
      });
    }

    // Draw projectiles (in warfare mode)
    if (this.gameMode === 'warfare' && this.gameState.projectiles) {
      this.gameState.projectiles.forEach(projectile => {
        const x = projectile.x * scaleX;
        const y = projectile.y * scaleY;

        this.minimapCtx.fillStyle = '#FF0000';
        this.minimapCtx.beginPath();
        this.minimapCtx.arc(x, y, 0.5, 0, Math.PI * 2);
        this.minimapCtx.fill();
      });
    }

    // Draw all players (including AI)
    this.gameState.players.forEach((player) => {
      if (!player.alive) return;

      const x = player.x * scaleX;
      const y = player.y * scaleY;
      const size = Math.max(2, Math.min(7, (player.segments?.length || 1) * 0.2 + 2));

      // Different colors for different player types
      let color = player.color || '#4CAF50';
      if (player.id === this.playerId) {
        color = '#4CAF50'; // Local player in green
      } else if (player.isAI) {
        // Keep AI player's original color but make it visible
      }

      // Enhanced visibility with glow
      this.minimapCtx.shadowColor = color;
      this.minimapCtx.shadowBlur = 6;

      // Draw player body
      this.minimapCtx.fillStyle = color;
      this.minimapCtx.beginPath();
      this.minimapCtx.arc(x, y, size, 0, Math.PI * 2);
      this.minimapCtx.fill();

      // Draw direction indicator for local player
      if (player.id === this.playerId && player.angle !== undefined) {
        const headX = x + Math.cos(player.angle) * (size + 2);
        const headY = y + Math.sin(player.angle) * (size + 2);

        this.minimapCtx.fillStyle = '#FFFFFF';
        this.minimapCtx.beginPath();
        this.minimapCtx.arc(headX, headY, 1, 0, Math.PI * 2);
        this.minimapCtx.fill();
      }

      // Reset shadow
      this.minimapCtx.shadowBlur = 0;
    });

    // Draw camera view rectangle
    if (this.localPlayer) {
      const camX = (this.localPlayer.x - this.canvas.width / 2) * scaleX;
      const camY = (this.localPlayer.y - this.canvas.height / 2) * scaleY;
      const camW = this.canvas.width * scaleX;
      const camH = this.canvas.height * scaleY;

      this.minimapCtx.strokeStyle = 'rgba(76, 175, 80, 0.8)';
      this.minimapCtx.lineWidth = 1;
      this.minimapCtx.setLineDash([2, 2]);
      this.minimapCtx.strokeRect(camX, camY, camW, camH);
      this.minimapCtx.setLineDash([]);
    }

    // Add minimap title
    this.minimapCtx.fillStyle = '#fff';
    this.minimapCtx.font = '10px monospace';
    this.minimapCtx.textAlign = 'center';
    this.minimapCtx.fillText('RADAR', this.minimap.width / 2, 12);

    // Add legend
    let legendY = this.minimap.height - 25;
    this.minimapCtx.font = '8px monospace';
    this.minimapCtx.textAlign = 'left';

    // Player count
    const playerCount = this.gameState.players ? this.gameState.players.filter(p => p.alive).length : 0;
    this.minimapCtx.fillStyle = '#4CAF50';
    this.minimapCtx.fillText(`Players: ${playerCount}`, 5, legendY);
  }

  // React integration methods
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

  destroy() {
    console.log('Destroying ClientGame...');

    this.gameRunning = false;

    if (this.renderLoop) {
      cancelAnimationFrame(this.renderLoop);
    }

    if (this.connected) {
      this.networkManager.disconnect();
    }

    window.removeEventListener('resize', this.resizeCanvas);

    console.log('ClientGame destroyed');
  }

}

export default ClientGame;
