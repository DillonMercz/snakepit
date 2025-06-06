const EventEmitter = require('events');
const ServerGame = require('./ServerGame');

class GameRoom extends EventEmitter {
  constructor(id, gameMode, options = {}) {
    super();
    
    this.id = id;
    this.gameMode = gameMode;
    this.maxPlayers = options.maxPlayers || 100;
    this.createdAt = Date.now();
    this.markedForCleanup = false;
    this.acceptingPlayers = true;
    
    // Player management
    this.players = new Map(); // playerId -> player data
    this.sockets = new Map(); // playerId -> socket
    
    // Game instance
    this.game = new ServerGame(gameMode, {
      worldWidth: options.worldWidth || 6000,
      worldHeight: options.worldHeight || 6000,
      maxPlayers: this.maxPlayers,
      enableAI: true //options.enableAI !== undefined ? options.enableAI : true
    });

    // Set up broadcast methods for the game instance
    this.game.broadcastToRoom = (event, data) => this.broadcastToRoom(event, data);
    this.game.sendToPlayer = (playerId, event, data) => this.sendToPlayer(playerId, event, data);
    
    // Game loop - 120 FPS for ultra-smooth gameplay
    this.tickRate = options.tickRate || 120; // 120 FPS for ultra-smooth gameplay
    this.tickInterval = 1000 / this.tickRate;
    this.lastTick = Date.now();
    this.gameLoop = null;

    // Network optimization - adaptive rate based on player count
    this.lastBroadcast = 0;
    this.baseBroadcastRate = 30; // Base 30 FPS
    this.maxBroadcastRate = 60; // Max 60 FPS for small rooms
    this.broadcastInterval = this.calculateOptimalBroadcastInterval();
    
    // Performance monitoring
    this.performanceStats = {
      averageTickTime: 0,
      maxTickTime: 0,
      tickCount: 0,
      networkUpdates: 0,
      averageNetworkTime: 0,
      maxNetworkTime: 0,
      skippedBroadcasts: 0
    };
    
    this.startGameLoop();
    console.log(`🎮 GameRoom ${id} created for ${gameMode} mode (${this.tickRate} FPS)`);

    // Performance monitoring interval (reduced frequency)
    this.performanceLogInterval = setInterval(() => {
      this.logPerformanceStats();
    }, 300000); // Log every 5 minutes instead of 30 seconds
  }

  /**
   * Add a player to the room
   * @param {Socket} socket - Player's socket connection
   * @param {Object} playerData - Player data
   * @returns {boolean} - Success status
   */
  async addPlayer(socket, playerData) {
    try {
      if (this.players.size >= this.maxPlayers) {
        console.log(`❌ Room ${this.id} is full (${this.players.size}/${this.maxPlayers})`);
        return false;
      }

      if (!this.acceptingPlayers) {
        console.log(`❌ Room ${this.id} is not accepting new players`);
        return false;
      }

      // Store player and socket
      this.players.set(playerData.id, playerData);
      this.sockets.set(playerData.id, socket);
      
      // Join socket to room for broadcasting
      socket.join(this.id);
      
      // Add player to game instance
      const success = this.game.addPlayer(playerData);
      
      if (!success) {
        // Cleanup if game addition failed
        this.players.delete(playerData.id);
        this.sockets.delete(playerData.id);
        socket.leave(this.id);
        return false;
      }

      // Send initial game state to new player
      const gameState = this.game.getGameStateForPlayer(playerData.id);
      socket.emit('gameJoined', {
        roomId: this.id,
        playerId: playerData.id,
        gameMode: this.gameMode,
        gameState: gameState
      });

      // Notify other players
      socket.to(this.id).emit('playerJoined', {
        id: playerData.id,
        username: playerData.username,
        color: playerData.color
      });

      this.emit('playerJoined', playerData);
      
      console.log(`✅ Player ${playerData.username} added to room ${this.id} (${this.players.size}/${this.maxPlayers})`);
      return true;
      
    } catch (error) {
      console.error(`Error adding player to room ${this.id}:`, error);
      return false;
    }
  }

  /**
   * Remove a player from the room
   * @param {string} playerId - Player ID to remove
   */
  removePlayer(playerId) {
    try {
      const playerData = this.players.get(playerId);
      const socket = this.sockets.get(playerId);
      
      if (!playerData) {
        return; // Player not in room
      }

      // Remove from game instance
      this.game.removePlayer(playerId);
      
      // Remove from room
      this.players.delete(playerId);
      this.sockets.delete(playerId);
      
      if (socket) {
        socket.leave(this.id);
      }

      // Notify other players
      this.broadcastToRoom('playerLeft', {
        id: playerId,
        username: playerData.username
      });

      this.emit('playerLeft', playerId);
      
      console.log(`👋 Player ${playerData.username} removed from room ${this.id} (${this.players.size}/${this.maxPlayers})`);
      
      // Check if room is empty
      if (this.players.size === 0) {
        this.emit('empty');
      }
      
    } catch (error) {
      console.error(`Error removing player from room ${this.id}:`, error);
    }
  }

  /**
   * Handle player input
   * @param {string} playerId - Player ID
   * @param {Object} inputData - Input data
   */
  handlePlayerInput(playerId, inputData) {
    if (!this.players.has(playerId)) return;
    
    // Validate and process input
    this.game.handlePlayerInput(playerId, inputData);
  }

  /**
   * Handle player shooting (warfare mode)
   * @param {string} playerId - Player ID
   * @param {Object} shootData - Shooting data
   */
  handlePlayerShoot(playerId, shootData) {
    if (!this.players.has(playerId) || this.gameMode !== 'warfare') return;
    
    this.game.handlePlayerShoot(playerId, shootData);
  }

  /**
   * Handle weapon switching (warfare mode)
   * @param {string} playerId - Player ID
   * @param {Object} weaponData - Weapon data
   */
  handleWeaponSwitch(playerId, weaponData) {
    if (!this.players.has(playerId) || this.gameMode !== 'warfare') return;
    
    this.game.handleWeaponSwitch(playerId, weaponData);
  }

  /**
   * Handle player cashout
   * @param {string} playerId - Player ID
   * @param {Object} cashoutData - Cashout data
   * @returns {Object} - Cashout result
   */
  handlePlayerCashout(playerId, cashoutData) {
    if (!this.players.has(playerId)) {
      return { success: false, reason: 'Player not found in room' };
    }

    const result = this.game.handlePlayerCashout(playerId, cashoutData);

    if (result && result.success) {
      const socket = this.sockets.get(playerId);
      if (socket) {
        socket.emit('cashoutSuccess', result);
      }
    }

    return result;
  }

  /**
   * Handle chat message
   * @param {string} playerId - Player ID
   * @param {Object} messageData - Message data
   */
  handleChatMessage(playerId, messageData) {
    const playerData = this.players.get(playerId);
    if (!playerData) return;
    
    // Broadcast chat message to all players in room
    this.broadcastToRoom('chatMessage', {
      playerId: playerId,
      username: playerData.username,
      message: messageData.message,
      timestamp: messageData.timestamp
    });
  }

  /**
   * Start the game loop
   */
  startGameLoop() {
    this.gameLoop = setInterval(() => {
      this.tick();
    }, this.tickInterval);
  }

  /**
   * Game tick - update game state and broadcast to players
   */
  tick() {
    const tickStart = Date.now();

    try {
      // Update game state
      this.game.update();

      // Only broadcast at network update rate (30 FPS) for performance
      if (tickStart - this.lastBroadcast >= this.broadcastInterval) {
        const networkStart = Date.now();

        // Send player-specific game states for warfare mode (includes inventory data)
        if (this.gameMode === 'warfare') {
          for (const [playerId, socket] of this.sockets.entries()) {
            const playerGameState = this.game.getGameStateForPlayer(playerId);
            socket.emit('gameState', playerGameState);
          }
        } else {
          // For other modes, use general game state
          const gameState = this.game.getGameState();
          this.broadcastToRoom('gameState', gameState);
        }

        this.lastBroadcast = tickStart;

        // Track network performance
        const networkTime = Date.now() - networkStart;
        this.updateNetworkStats(networkTime);
      } else {
        // Track skipped broadcasts for performance monitoring
        this.performanceStats.skippedBroadcasts++;
      }

      // Update performance stats
      const tickTime = Date.now() - tickStart;
      this.updatePerformanceStats(tickTime);

    } catch (error) {
      console.error(`Error in game tick for room ${this.id}:`, error);
      this.emit('error', error);
    }
  }

  /**
   * Calculate optimal broadcast interval based on player count and performance
   * @returns {number} - Broadcast interval in milliseconds
   */
  calculateOptimalBroadcastInterval() {
    const playerCount = this.players.size;

    // Adaptive rate: fewer players = higher rate for better responsiveness
    let targetRate = this.baseBroadcastRate;

    if (playerCount <= 4) {
      targetRate = this.maxBroadcastRate; // 60 FPS for small rooms
    } else if (playerCount <= 10) {
      targetRate = 45; // 45 FPS for medium rooms
    } else if (playerCount <= 20) {
      targetRate = 35; // 35 FPS for larger rooms
    }
    // else use base rate (30 FPS) for very large rooms

    return 1000 / targetRate;
  }

  /**
   * Update performance statistics
   * @param {number} tickTime - Time taken for this tick
   */
  updatePerformanceStats(tickTime) {
    this.performanceStats.tickCount++;
    this.performanceStats.maxTickTime = Math.max(this.performanceStats.maxTickTime, tickTime);

    // Calculate rolling average
    const alpha = 0.1; // Smoothing factor
    this.performanceStats.averageTickTime =
      (this.performanceStats.averageTickTime * (1 - alpha)) + (tickTime * alpha);

    // Dynamically adjust broadcast rate every 1000 ticks
    if (this.performanceStats.tickCount % 1000 === 0) {
      const newInterval = this.calculateOptimalBroadcastInterval();
      if (Math.abs(newInterval - this.broadcastInterval) > 1) {
        this.broadcastInterval = newInterval;
        // Log broadcast rate changes only every 10000 ticks to reduce spam
        if (this.performanceStats.tickCount % 10000 === 0) {
          console.log(`📡 Adjusted broadcast rate to ${(1000/newInterval).toFixed(1)} FPS for ${this.players.size} players`);
        }
      }
    }
  }

  /**
   * Update network performance statistics
   * @param {number} networkTime - Time taken for network broadcast
   */
  updateNetworkStats(networkTime) {
    this.performanceStats.networkUpdates++;
    this.performanceStats.maxNetworkTime = Math.max(this.performanceStats.maxNetworkTime, networkTime);

    // Calculate rolling average
    const alpha = 0.1; // Smoothing factor
    this.performanceStats.averageNetworkTime =
      (this.performanceStats.averageNetworkTime * (1 - alpha)) + (networkTime * alpha);
  }

  /**
   * Log performance statistics for monitoring
   */
  logPerformanceStats() {
    const stats = this.performanceStats;
    const networkEfficiency = stats.networkUpdates / (stats.networkUpdates + stats.skippedBroadcasts) * 100;
    const currentBroadcastRate = (1000 / this.broadcastInterval).toFixed(1);

    console.log(`📊 Room ${this.id} Performance Stats:`);
    console.log(`  Players: ${this.players.size}/${this.maxPlayers}`);
    console.log(`  Tick Time: ${stats.averageTickTime.toFixed(2)}ms avg, ${stats.maxTickTime}ms max`);
    console.log(`  Network Time: ${stats.averageNetworkTime.toFixed(2)}ms avg, ${stats.maxNetworkTime}ms max`);
    console.log(`  Network Rate: ${currentBroadcastRate} FPS (adaptive)`);
    console.log(`  Network Efficiency: ${networkEfficiency.toFixed(1)}% (${stats.networkUpdates} sent, ${stats.skippedBroadcasts} skipped)`);
    console.log(`  Total Ticks: ${stats.tickCount}`);

    // Performance grade
    const avgTotal = stats.averageTickTime + stats.averageNetworkTime;
    const grade = avgTotal < 1.5 ? '🟢 EXCELLENT' :
                  avgTotal < 3.0 ? '🟡 GOOD' :
                  avgTotal < 5.0 ? '🟠 FAIR' : '🔴 POOR';
    console.log(`  Performance Grade: ${grade} (${avgTotal.toFixed(2)}ms total)`);
  }

  /**
   * Broadcast message to all players in room
   * @param {string} event - Event name
   * @param {Object} data - Data to broadcast
   */
  broadcastToRoom(event, data) {
    for (const socket of this.sockets.values()) {
      socket.emit(event, data);
    }
  }

  /**
   * Send message to a specific player in room
   * @param {string} playerId - Player ID to send to
   * @param {string} event - Event name
   * @param {Object} data - Data to send
   */
  sendToPlayer(playerId, event, data) {
    const socket = this.sockets.get(playerId);
    if (socket) {
      socket.emit(event, data);
    }
  }

  /**
   * Get number of players in room
   * @returns {number} - Player count
   */
  getPlayerCount() {
    return this.players.size;
  }

  /**
   * Check if room is accepting new players
   * @returns {boolean} - Whether room is accepting players
   */
  isAcceptingPlayers() {
    return this.acceptingPlayers && this.players.size < this.maxPlayers;
  }

  /**
   * Mark room for cleanup
   */
  markForCleanup() {
    this.markedForCleanup = true;
    this.acceptingPlayers = false;
  }

  /**
   * Check if room should be cleaned up
   * @returns {boolean} - Whether room should be cleaned up
   */
  shouldCleanup() {
    return this.markedForCleanup && this.players.size === 0;
  }

  /**
   * Destroy the room and clean up resources
   */
  destroy() {
    console.log(`🗑️ Destroying room ${this.id}`);
    
    // Stop game loop
    if (this.gameLoop) {
      clearInterval(this.gameLoop);
      this.gameLoop = null;
    }

    // Stop performance logging
    if (this.performanceLogInterval) {
      clearInterval(this.performanceLogInterval);
      this.performanceLogInterval = null;
    }
    
    // Disconnect all players
    for (const socket of this.sockets.values()) {
      socket.leave(this.id);
      socket.emit('roomClosed', { reason: 'Room shutdown' });
    }
    
    // Destroy game instance
    if (this.game) {
      this.game.destroy();
    }
    
    // Clear all data
    this.players.clear();
    this.sockets.clear();
    
    console.log(`✅ Room ${this.id} destroyed`);
  }

  /**
   * Get room status information
   * @returns {Object} - Room status
   */
  getStatus() {
    return {
      id: this.id,
      gameMode: this.gameMode,
      playerCount: this.players.size,
      maxPlayers: this.maxPlayers,
      acceptingPlayers: this.acceptingPlayers,
      uptime: Date.now() - this.createdAt,
      performance: this.performanceStats
    };
  }
}

module.exports = GameRoom;
