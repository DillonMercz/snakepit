const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Game rooms management
const gameRooms = new Map();

// Player management
const players = new Map();

// Constants
const MAX_PLAYERS_PER_ROOM = 100;
const TICK_RATE = 60;
const TICK_INTERVAL = 1000 / TICK_RATE;

// Game state update loop
const gameLoop = (roomId) => {
  const room = gameRooms.get(roomId);
  if (!room) return;

  // Update all player positions based on their inputs
  room.players.forEach((player) => {
    if (player.input) {
      // Apply player input and update position
      updatePlayerState(player);
    }
  });

  // Send game state to all players in room
  io.to(roomId).emit('gameState', {
    players: Array.from(room.players.values()).map(p => ({
      id: p.id,
      x: p.x,
      y: p.y,
      angle: p.angle,
      length: p.length,
      score: p.score,
      color: p.color,
      boosting: p.boosting
    })),
    food: room.food,
    glowOrbs: room.glowOrbs
  });
};

// Player state update function
const updatePlayerState = (player) => {
  if (!player.input) return;

  // Update angle
  if (player.input.targetAngle !== undefined) {
    player.angle = player.input.targetAngle;
  }

  // Update boost state
  player.boosting = player.input.boosting || false;

  // Calculate speed based on boost
  const speed = player.boosting ? 4 : 2;

  // Update position
  player.x += Math.cos(player.angle) * speed;
  player.y += Math.sin(player.angle) * speed;

  // Keep player in bounds
  player.x = Math.max(0, Math.min(4000, player.x));
  player.y = Math.max(0, Math.min(4000, player.y));
};

// Socket connection handling
io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);

  socket.on('joinGame', (data) => {
    const { gameMode, username, wager, color } = data;

    // Find or create appropriate room
    let roomId = findAvailableRoom(gameMode);
    if (!roomId) {
      roomId = createGameRoom(gameMode);
    }

    // Create player object
    const player = {
      id: socket.id,
      username,
      x: 2000 + (Math.random() - 0.5) * 1000,
      y: 2000 + (Math.random() - 0.5) * 1000,
      angle: Math.random() * Math.PI * 2,
      length: 3,
      score: 0,
      color,
      boosting: false,
      input: null
    };

    // Add player to room
    const room = gameRooms.get(roomId);
    room.players.set(socket.id, player);
    players.set(socket.id, { roomId, player });

    // Join socket room
    socket.join(roomId);

    // Start game loop if first player
    if (room.players.size === 1) {
      room.gameLoopInterval = setInterval(() => gameLoop(roomId), TICK_INTERVAL);
    }

    // Notify player of successful join
    socket.emit('gameJoined', {
      roomId,
      playerId: socket.id,
      gameMode,
      players: Array.from(room.players.values())
    });

    // Notify other players
    socket.to(roomId).emit('playerJoined', {
      id: socket.id,
      username,
      color
    });
  });

  socket.on('playerInput', (input) => {
    const playerData = players.get(socket.id);
    if (!playerData) return;

    const { player } = playerData;
    player.input = input;
  });

  socket.on('disconnect', () => {
    const playerData = players.get(socket.id);
    if (!playerData) return;

    const { roomId } = playerData;
    const room = gameRooms.get(roomId);
    if (!room) return;

    // Remove player
    room.players.delete(socket.id);
    players.delete(socket.id);

    // Notify other players
    socket.to(roomId).emit('playerLeft', { id: socket.id });

    // Clean up empty room
    if (room.players.size === 0) {
      clearInterval(room.gameLoopInterval);
      gameRooms.delete(roomId);
    }

    console.log('Player disconnected:', socket.id);
  });
});

// Helper functions
function findAvailableRoom(gameMode) {
  for (const [roomId, room] of gameRooms) {
    if (room.gameMode === gameMode && room.players.size < MAX_PLAYERS_PER_ROOM) {
      return roomId;
    }
  }
  return null;
}

function createGameRoom(gameMode) {
  const roomId = uuidv4();
  gameRooms.set(roomId, {
    gameMode,
    players: new Map(),
    food: generateInitialFood(),
    glowOrbs: generateInitialGlowOrbs(),
    gameLoopInterval: null
  });
  return roomId;
}

function generateInitialFood() {
  const food = [];
  for (let i = 0; i < 1000; i++) {
    food.push({
      x: Math.random() * 4000,
      y: Math.random() * 4000,
      color: `hsl(${Math.random() * 360}, 70%, 60%)`,
      size: 4 + Math.random() * 3
    });
  }
  return food;
}

function generateInitialGlowOrbs() {
  const orbs = [];
  for (let i = 0; i < 20; i++) {
    orbs.push({
      x: Math.random() * 4000,
      y: Math.random() * 4000,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      color: `hsl(${Math.random() * 360}, 100%, 70%)`,
      size: 8 + Math.random() * 4,
      glow: 0,
      value: 5
    });
  }
  return orbs;
}

// Start server
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Game server running on port ${PORT}`);
});