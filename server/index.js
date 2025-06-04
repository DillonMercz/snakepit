const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const RoomManager = require('./game/RoomManager');
const { validatePlayerInput, sanitizePlayerData } = require('./utils/validation');

const app = express();
const server = http.createServer(app);

// Configure CORS for Socket.IO
const io = socketIo(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "http://localhost:3002",
      "http://192.168.1.81:3000", // LAN access
      "http://192.168.1.81:3002", // LAN access
      "http://127.0.0.1:3000",
      "http://127.0.0.1:3002",
      "https://work-1-kwbmsnzhausxctuw.prod-runtime.all-hands.dev"
    ],
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
const gameResultsRouter = require('./routes/gameResults');
app.use('/api/game-results', gameResultsRouter);

// Initialize room manager
const roomManager = new RoomManager();

// Configuration for AI - can be controlled via environment variable
const AI_ENABLED = process.env.ENABLE_AI === 'true' || process.env.ENABLE_AI === '1';
console.log(`🤖 AI Configuration: ${AI_ENABLED ? 'ENABLED' : 'DISABLED'} (set ENABLE_AI=true to enable)`);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    rooms: roomManager.getRoomStats()
  });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`🔌 Player connected: ${socket.id}`);

  // Handle player joining a game
  socket.on('joinGame', async (data) => {
    try {
      const { gameMode, username, wager, color } = data;
      
      // Validate input data
      if (!validatePlayerInput(data)) {
        socket.emit('error', { message: 'Invalid player data' });
        return;
      }

      // Sanitize player data
      const playerData = sanitizePlayerData({
        id: socket.id,
        username,
        wager: Math.max(10, Math.min(500, wager || 50)), // Clamp wager between $10-$500
        color: color || '#FFD700',
        gameMode: gameMode || 'classic'
      });

      console.log(`🎮 Player ${username} joining ${gameMode} game with $${wager} wager`);

      // Find or create appropriate room
      console.log(`🤖 AI is ${AI_ENABLED ? 'ENABLED' : 'DISABLED'} for this room`);
      const room = await roomManager.findOrCreateRoom(gameMode, { enableAI: AI_ENABLED });
      
      if (!room) {
        socket.emit('error', { message: 'Unable to find or create game room' });
        return;
      }

      // Add player to room
      const success = await room.addPlayer(socket, playerData);
      
      if (!success) {
        socket.emit('error', { message: 'Failed to join game room' });
        return;
      }

      // Store room reference on socket for cleanup
      socket.roomId = room.id;
      socket.gameMode = gameMode;
      socket.playerData = playerData;

      console.log(`✅ Player ${username} joined room ${room.id} (${room.getPlayerCount()}/100 players)`);

    } catch (error) {
      console.error('Error handling joinGame:', error);
      socket.emit('error', { message: 'Internal server error' });
    }
  });

  // Handle player input
  socket.on('playerInput', (inputData) => {
    try {
      if (!socket.roomId) return;

      const room = roomManager.getRoom(socket.roomId);
      if (room) {
        room.handlePlayerInput(socket.id, inputData);
      }
    } catch (error) {
      console.error('Error handling player input:', error);
    }
  });

  // Handle player shooting (warfare mode)
  socket.on('playerShoot', (shootData) => {
    try {
      if (!socket.roomId || socket.gameMode !== 'warfare') return;

      const room = roomManager.getRoom(socket.roomId);
      if (room) {
        room.handlePlayerShoot(socket.id, shootData);
      }
    } catch (error) {
      console.error('Error handling player shoot:', error);
    }
  });

  // Handle weapon switching (warfare mode)
  socket.on('switchWeapon', (weaponData) => {
    try {
      if (!socket.roomId || socket.gameMode !== 'warfare') return;

      const room = roomManager.getRoom(socket.roomId);
      if (room) {
        room.handleWeaponSwitch(socket.id, weaponData);
      }
    } catch (error) {
      console.error('Error handling weapon switch:', error);
    }
  });

  // Handle player cashout (both modes)
  socket.on('playerCashOut', (cashoutData) => {
    try {
      if (!socket.roomId) return;

      const room = roomManager.getRoom(socket.roomId);
      if (room) {
        const result = room.handlePlayerCashout(socket.id, cashoutData);

        // Send cashout result back to player
        socket.emit('cashoutResult', result);

        if (result.success) {
          console.log(`💰 Player ${socket.id} cashed out $${result.profit} profit`);
        }
      }
    } catch (error) {
      console.error('Error handling player cashout:', error);
    }
  });

  // Handle player respawn request (ORIGINAL BEHAVIOR: Manual respawn)
  socket.on('playerRespawn', (respawnData) => {
    try {
      if (!socket.roomId) return;

      const room = roomManager.getRoom(socket.roomId);
      if (room) {
        room.game.handlePlayerRespawnRequest(socket.id);
        console.log(`🔄 Respawn request from ${socket.username || socket.id}`);
      }
    } catch (error) {
      console.error('Error handling player respawn:', error);
    }
  });

  // Handle chat messages
  socket.on('chatMessage', (messageData) => {
    try {
      if (!socket.roomId) return;

      const room = roomManager.getRoom(socket.roomId);
      if (room) {
        room.handleChatMessage(socket.id, messageData);
      }
    } catch (error) {
      console.error('Error handling chat message:', error);
    }
  });

  // Handle ping for latency measurement
  socket.on('ping', (timestamp) => {
    socket.emit('pong', timestamp);
  });

  // Handle disconnection
  socket.on('disconnect', (reason) => {
    if (socket.roomId) {
      const room = roomManager.getRoom(socket.roomId);
      if (room) {
        room.removePlayer(socket.id);
      }
    }
  });

  // Handle connection errors
  socket.on('error', (error) => {
    console.error(`Socket error for ${socket.id}:`, error);
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Server shutting down gracefully...');
  roomManager.shutdown();
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 Server shutting down gracefully...');
  roomManager.shutdown();
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

const PORT = process.env.PORT || 3005;
const HOST = process.env.HOST || '0.0.0.0'; // Listen on all network interfaces

server.listen(PORT, HOST, () => {
  console.log(`🚀 SnakePit multiplayer server running on ${HOST}:${PORT}`);
  console.log(`🎮 Ready to accept connections...`);
  console.log(`🌐 LAN Access: http://192.168.1.81:${PORT}`);
  console.log(`🏠 Local Access: http://localhost:${PORT}`);
});

module.exports = { app, server, io };
