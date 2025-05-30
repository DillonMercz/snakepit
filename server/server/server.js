const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const Snake = require('./game_engine/snake.js'); // Require the new Snake class

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

// Constants for item regeneration
const PVP_FOOD_THRESHOLD = 500;
const PVP_FOOD_REGEN_COUNT = 50;
const PVP_GLOW_ORB_THRESHOLD = 10;
const PVP_GLOW_ORB_REGEN_COUNT = 5;

// Helper to generate a single food item
function generateSingleFoodItem() {
  return {
    x: Math.random() * 4000,
    y: Math.random() * 4000,
    color: `hsl(${Math.random() * 360}, 70%, 60%)`,
    size: 4 + Math.random() * 3
  };
}

// Helper to generate a single glow orb item
function generateSingleGlowOrbItem() {
  return {
    x: Math.random() * 4000,
    y: Math.random() * 4000,
    vx: (Math.random() - 0.5) * 2, // Example velocity
    vy: (Math.random() - 0.5) * 2, // Example velocity
    color: `hsl(${Math.random() * 360}, 100%, 70%)`, // Example color
    size: 8 + Math.random() * 4,
    glow: 0, // Example glow property
    value: 5 // Example value
  };
}


// Game state update loop
const gameLoop = (roomId) => {
  const room = gameRooms.get(roomId);
  if (!room) return;

  // PvP Item Regeneration
  if (room.gameMode === 'classic_pvp' || room.gameMode === 'warfare_pvp') {
    if (room.food.length < PVP_FOOD_THRESHOLD) {
      for (let i = 0; i < PVP_FOOD_REGEN_COUNT; i++) {
        room.food.push(generateSingleFoodItem());
      }
    }
    if (room.glowOrbs.length < PVP_GLOW_ORB_THRESHOLD) {
      for (let i = 0; i < PVP_GLOW_ORB_REGEN_COUNT; i++) {
        room.glowOrbs.push(generateSingleGlowOrbItem());
      }
    }
  }

  // Update all player positions based on their inputs
  room.players.forEach((player) => {
    if (player instanceof Snake) {
      if (player.input) {
        if (player.input.targetAngle !== undefined) {
          player.targetAngle = player.input.targetAngle;
        }
        const boosting = player.input.boosting || false;
        player.update(boosting);
      } else {
        player.update(false); 
      }
    } else { 
      if (player.input) {
        updatePlayerState(player); 
      }
    }
  });

  // Server-side item collision detection and collection for PvP modes
  if (room.gameMode === 'classic_pvp' || room.gameMode === 'warfare_pvp') {
    room.players.forEach((player) => {
      if (player instanceof Snake && player.alive) {
        // Food collection
        for (let i = room.food.length - 1; i >= 0; i--) {
          const foodItem = room.food[i];
          const dx = player.x - foodItem.x;
          const dy = player.y - foodItem.y;
          // Ensure player.size and foodItem.size are valid numbers
          const collisionThreshold = (player.size || 0) + (foodItem.size || 0);
          if (dx * dx + dy * dy < collisionThreshold * collisionThreshold) {
            player.eatFood(foodItem); // Snake processes eating
            room.food.splice(i, 1); // Remove food from room
            // Potentially break if snake can only eat one per tick, or continue for multiple
          }
        }

        // Glow Orb collection
        for (let i = room.glowOrbs.length - 1; i >= 0; i--) {
          const orbItem = room.glowOrbs[i];
          const dx = player.x - orbItem.x;
          const dy = player.y - orbItem.y;
          const collisionThreshold = (player.size || 0) + (orbItem.size || 0);
          if (dx * dx + dy * dy < collisionThreshold * collisionThreshold) {
            player.collectOrb(orbItem); // Snake processes orb
            room.glowOrbs.splice(i, 1); // Remove orb from room
          }
        }
      }
    });
  }

  // Server-side snake vs snake collision detection for PvP modes
  if (room.gameMode === 'classic_pvp' || room.gameMode === 'warfare_pvp') {
    const playerList = Array.from(room.players.values());
    for (let i = 0; i < playerList.length; i++) {
      const playerA = playerList[i];
      if (!(playerA instanceof Snake) || !playerA.alive || playerA.isInvincible()) {
        continue;
      }

      for (let j = 0; j < playerList.length; j++) {
        if (i === j) continue; // Skip self-collision check

        const playerB = playerList[j];
        if (!(playerB instanceof Snake) || !playerB.alive) {
          continue;
        }

        // Head-to-Body Collision Check (playerA's head vs playerB's body)
        const headA = playerA.segments[0];
        for (let k = 1; k < playerB.segments.length; k++) { // Start from k=1 for body segments
          const segmentB = playerB.segments[k];
          const dx = headA.x - segmentB.x;
          const dy = headA.y - segmentB.y;
          // Using playerA.size for its head, and playerB.size for segment radius (approximation)
          const collisionThreshold = (playerA.size || 8) + (playerB.size || 8) - 4; // Minus a bit for closer feel
          
          if (dx * dx + dy * dy < collisionThreshold * collisionThreshold) {
            if (playerB.isInvincible()) continue; // Cannot die by hitting an invincible player's body (unless B is also A)

            console.log(`Player ${playerA.username} (id: ${playerA.id}) collided with ${playerB.username}'s (id: ${playerB.id}) body.`);
            playerA.alive = false;
            const newFoodItems = playerA.convertToFoodItems();
            room.food.push(...newFoodItems);
            // console.log(`Player ${playerA.username} died. Spawned ${newFoodItems.length} food items.`);
            break; // playerA is dead, no need to check further collisions for playerA
          }
        }
        if (!playerA.alive) break; // If playerA died, move to the next playerA
      }
      
      // Head-to-Head Collision Check (if playerA is still alive)
      // This needs to be careful to avoid processing twice for the same pair
      if (playerA.alive && i < playerList.length -1) { // Only check if i < j to avoid duplicate pairs and self-check
         for (let j = i + 1; j < playerList.length; j++) {
            const playerB = playerList[j];
            if (!(playerB instanceof Snake) || !playerB.alive) continue;
            if (playerA.isInvincible() && playerB.isInvincible()) continue; // Both invincible, no effect

            const headA = playerA.segments[0];
            const headB = playerB.segments[0];
            const dx = headA.x - headB.x;
            const dy = headA.y - headB.y;
            const collisionThreshold = (playerA.size || 8) + (playerB.size || 8) - 4;

            if (dx * dx + dy * dy < collisionThreshold * collisionThreshold) {
                console.log(`Head-on collision between ${playerA.username} and ${playerB.username}`);
                let playerADies = true;
                let playerBDies = true;

                if(playerA.isInvincible()) playerADies = false;
                if(playerB.isInvincible()) playerBDies = false;
                
                // If both are invincible, nothing happens (already continued). If one is, the other dies.
                // If neither is, determine by size or both die. For classic, usually both die or smaller one.
                // Simple rule: if not invincible, you die in head-to-head.
                
                if (playerADies) {
                    playerA.alive = false;
                    const foodA = playerA.convertToFoodItems();
                    room.food.push(...foodA);
                    // console.log(`${playerA.username} died in head-on. Spawned ${foodA.length} items.`);
                }
                if (playerBDies) {
                    playerB.alive = false;
                    const foodB = playerB.convertToFoodItems();
                    room.food.push(...foodB);
                    // console.log(`${playerB.username} died in head-on. Spawned ${foodB.length} items.`);
                }
                 if(playerADies) break; // playerA is dead, process next i.
            }
         }
      }
    }
  }


  // Send game state to all players in room
  io.to(roomId).emit('gameState', {
    players: Array.from(room.players.values()).map(p => {
      if (p instanceof Snake) {
        return {
          id: p.id,
          username: p.username,
          x: p.x, // head x
          y: p.y, // head y
          angle: p.angle,
          segments: p.segments, // Full segments array
          length: p.segments.length,
          score: p.score,
          cashBalance: p.cashBalance,
          color: p.color,
          boosting: p.boosting,
          alive: p.alive,
          size: p.size, // current computed size
          speed: p.speed,
          invincible: p.isInvincible ? p.isInvincible() : false, // current invincibility state
          // activePowerups: p.activePowerups || [], // Omitted for now as per subtask instructions
          currentWeapon: p.currentWeapon ? { 
            name: p.currentWeapon.name, 
            type: p.currentWeapon.type, 
            // tier: p.currentWeapon.tier // Tier might not be on simplified server Weapon
          } : null,
        };
      } else {
        // Existing structure for non-Snake players (non-PvP modes)
        return {
          id: p.id,
          username: p.username,
          x: p.x,
          y: p.y,
          angle: p.angle,
          segments: p.segments || [{ x: p.x, y: p.y }], // Default segments
          length: p.length,
          score: p.score,
          cashBalance: p.cashBalance !== undefined ? p.cashBalance : (p.score || 0), // Default cashBalance
          color: p.color,
          boosting: p.boosting,
          alive: p.alive !== undefined ? p.alive : true, // Default alive
          size: p.size !== undefined ? p.size : 10, // Default size
          speed: p.speed !== undefined ? p.speed : 2, // Default speed
          invincible: false, // Default invincible
          // activePowerups: [],
          currentWeapon: null,
        };
      }
    }),
    food: room.food, // Send full food array
    glowOrbs: room.glowOrbs // Send full glowOrbs array
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
    let player;
    const initialX = 2000 + (Math.random() - 0.5) * 1000;
    const initialY = 2000 + (Math.random() - 0.5) * 1000;
    const initialAngle = Math.random() * Math.PI * 2;

    if (gameMode === 'classic_pvp' || gameMode === 'warfare_pvp') {
      const gameInstanceMock = {
        gameMode: gameMode,
        worldWidth: 4000,
        worldHeight: 4000,
        // Define a way for Snake to get its cashBalance if it's managed by gameInstance
        // For now, cashBalance will be set directly on the snake instance by the server code below
        getPlayerCashBalance: (snakeInstance) => snakeInstance.cashBalance, 
      };
      player = new Snake(initialX, initialY, color, true, socket.id, username, gameInstanceMock);
      player.wager = wager || 0;
      player.cashBalance = player.wager; // Start with cash equal to wager
      player.score = player.cashBalance; // In PvP, score might be cash
      // player.input can be set to a default if needed: { targetAngle: initialAngle, boosting: false }
      // Other properties like alive, speed, targetAngle, size are set by Snake constructor
    } else {
      // Existing player object structure for non-PvP modes
      player = {
        id: socket.id,
        username,
        x: initialX,
        y: initialY,
        angle: initialAngle,
        length: 3,
        score: 0, // Non-PvP score starts at 0
        cashBalance: 0, // Non-PvP cashBalance starts at 0
        color,
        boosting: false,
        input: null
      };
    }

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
    // Send the full player object so clients can render the new snake
    socket.to(roomId).emit('playerJoined', player);
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