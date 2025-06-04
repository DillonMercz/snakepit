const GameRoom = require('./GameRoom');

class RoomManager {
  constructor() {
    this.rooms = new Map(); // roomId -> GameRoom
    this.playerRooms = new Map(); // playerId -> roomId
    this.roomCounter = 0;
    this.maxPlayersPerRoom = 100;
    
    // Cleanup interval for empty rooms
    this.cleanupInterval = setInterval(() => {
      this.cleanupEmptyRooms();
    }, 30000); // Check every 30 seconds
    
    console.log('🏠 RoomManager initialized');
  }

  /**
   * Find an available room or create a new one for the specified game mode
   * @param {string} gameMode - 'classic' or 'warfare'
   * @param {Object} options - Additional room options
   * @returns {GameRoom|null} - Available room or null if error
   */
  async findOrCreateRoom(gameMode, options = {}) {
    try {
      // First, try to find an existing room with space
      const availableRoom = this.findAvailableRoom(gameMode);

      if (availableRoom) {
        console.log(`🔍 Found available room ${availableRoom.id} for ${gameMode} mode`);
        return availableRoom;
      }

      // No available room found, create a new one
      return this.createRoom(gameMode, options);
      
    } catch (error) {
      console.error('Error in findOrCreateRoom:', error);
      return null;
    }
  }

  /**
   * Find an existing room with available space
   * @param {string} gameMode - Game mode to search for
   * @returns {GameRoom|null} - Available room or null
   */
  findAvailableRoom(gameMode) {
    for (const room of this.rooms.values()) {
      if (room.gameMode === gameMode && 
          room.getPlayerCount() < this.maxPlayersPerRoom && 
          room.isAcceptingPlayers()) {
        return room;
      }
    }
    return null;
  }

  /**
   * Create a new game room
   * @param {string} gameMode - Game mode for the new room
   * @param {Object} options - Additional room options
   * @returns {GameRoom} - Newly created room
   */
  createRoom(gameMode, options = {}) {
    const roomId = `${gameMode}_${++this.roomCounter}_${Date.now()}`;

    const room = new GameRoom(roomId, gameMode, {
      maxPlayers: this.maxPlayersPerRoom,
      worldWidth: 6000,
      worldHeight: 6000,
      tickRate: 60, // 60 FPS server tick rate to match original game (FIXED: was 60000)
      enableAI: options.enableAI !== undefined ? options.enableAI : true // AI enabled by default
    });

    this.rooms.set(roomId, room);
    
    // Set up room event handlers
    this.setupRoomEventHandlers(room);
    
    console.log(`🏗️ Created new ${gameMode} room: ${roomId}`);
    return room;
  }

  /**
   * Set up event handlers for a room
   * @param {GameRoom} room - Room to set up handlers for
   */
  setupRoomEventHandlers(room) {
    // Handle room becoming empty
    room.on('empty', () => {
      console.log(`🏠 Room ${room.id} is now empty, marking for cleanup`);
      room.markForCleanup();
    });

    // Handle room errors
    room.on('error', (error) => {
      console.error(`❌ Room ${room.id} error:`, error);
    });

    // Handle player events
    room.on('playerJoined', (playerData) => {
      this.playerRooms.set(playerData.id, room.id);
      console.log(`👤 Player ${playerData.username} joined room ${room.id}`);
    });

    room.on('playerLeft', (playerId) => {
      this.playerRooms.delete(playerId);
      console.log(`👋 Player ${playerId} left room ${room.id}`);
    });
  }

  /**
   * Get a room by ID
   * @param {string} roomId - Room ID to retrieve
   * @returns {GameRoom|null} - Room or null if not found
   */
  getRoom(roomId) {
    return this.rooms.get(roomId) || null;
  }

  /**
   * Get the room a player is in
   * @param {string} playerId - Player ID
   * @returns {GameRoom|null} - Room or null if not found
   */
  getPlayerRoom(playerId) {
    const roomId = this.playerRooms.get(playerId);
    return roomId ? this.getRoom(roomId) : null;
  }

  /**
   * Remove a player from their current room
   * @param {string} playerId - Player ID to remove
   */
  removePlayer(playerId) {
    const room = this.getPlayerRoom(playerId);
    if (room) {
      room.removePlayer(playerId);
    }
  }

  /**
   * Clean up empty rooms that are marked for cleanup
   */
  cleanupEmptyRooms() {
    const roomsToDelete = [];
    
    for (const [roomId, room] of this.rooms.entries()) {
      if (room.shouldCleanup()) {
        roomsToDelete.push(roomId);
      }
    }

    for (const roomId of roomsToDelete) {
      const room = this.rooms.get(roomId);
      if (room) {
        console.log(`🧹 Cleaning up empty room: ${roomId}`);
        room.destroy();
        this.rooms.delete(roomId);
      }
    }

    if (roomsToDelete.length > 0) {
      console.log(`🧹 Cleaned up ${roomsToDelete.length} empty rooms`);
    }
  }

  /**
   * Get statistics about all rooms
   * @returns {Object} - Room statistics
   */
  getRoomStats() {
    const stats = {
      totalRooms: this.rooms.size,
      totalPlayers: 0,
      roomsByMode: {},
      rooms: []
    };

    for (const room of this.rooms.values()) {
      const playerCount = room.getPlayerCount();
      stats.totalPlayers += playerCount;
      
      if (!stats.roomsByMode[room.gameMode]) {
        stats.roomsByMode[room.gameMode] = {
          count: 0,
          players: 0
        };
      }
      
      stats.roomsByMode[room.gameMode].count++;
      stats.roomsByMode[room.gameMode].players += playerCount;
      
      stats.rooms.push({
        id: room.id,
        gameMode: room.gameMode,
        players: playerCount,
        maxPlayers: room.maxPlayers,
        uptime: Date.now() - room.createdAt,
        accepting: room.isAcceptingPlayers()
      });
    }

    return stats;
  }

  /**
   * Shutdown the room manager and all rooms
   */
  shutdown() {
    console.log('🛑 Shutting down RoomManager...');
    
    // Clear cleanup interval
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    // Destroy all rooms
    for (const room of this.rooms.values()) {
      room.destroy();
    }

    // Clear all maps
    this.rooms.clear();
    this.playerRooms.clear();
    
    console.log('✅ RoomManager shutdown complete');
  }

  /**
   * Get total number of active players across all rooms
   * @returns {number} - Total player count
   */
  getTotalPlayerCount() {
    let total = 0;
    for (const room of this.rooms.values()) {
      total += room.getPlayerCount();
    }
    return total;
  }

  /**
   * Get list of all active room IDs
   * @returns {string[]} - Array of room IDs
   */
  getActiveRoomIds() {
    return Array.from(this.rooms.keys());
  }
}

module.exports = RoomManager;
