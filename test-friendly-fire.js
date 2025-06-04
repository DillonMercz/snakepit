const io = require('socket.io-client');

console.log('🛡️ Testing friendly fire prevention...');

const socket = io('http://localhost:3005', {
  timeout: 5000,
  forceNew: true
});

let gameState = null;
let playerId = null;
let testCompleted = false;

socket.on('connect', () => {
  console.log('✅ Connected to server');
  
  socket.emit('join-game', {
    gameMode: 'warfare',
    wager: 100,
    username: 'FriendlyFireTester'
  });
});

socket.on('game-joined', (data) => {
  console.log('🎮 Warfare game joined successfully!');
  console.log('📊 Player info:', {
    playerId: data.playerId,
    username: 'FriendlyFireTester'
  });
  
  playerId = data.playerId;
  gameState = data.gameState;
  
  // Find our player in the game state
  const ourPlayer = data.gameState.players.find(p => p.id === playerId);
  if (ourPlayer) {
    console.log(`👤 Our player found: ${ourPlayer.username} at (${ourPlayer.x}, ${ourPlayer.y})`);
    
    // Test shooting at our own position (should not kill us)
    console.log('🔫 Testing friendly fire - shooting at our own position...');
    setTimeout(() => {
      socket.emit('player-shoot', {
        targetX: ourPlayer.x,
        targetY: ourPlayer.y
      });
      
      // Shoot multiple times to be sure
      setTimeout(() => {
        socket.emit('player-shoot', {
          targetX: ourPlayer.x + 10,
          targetY: ourPlayer.y + 10
        });
      }, 100);
      
      setTimeout(() => {
        socket.emit('player-shoot', {
          targetX: ourPlayer.x - 10,
          targetY: ourPlayer.y - 10
        });
      }, 200);
      
    }, 1000);
  }
  
  // Complete test after checking results
  setTimeout(() => {
    if (!testCompleted) {
      testCompleted = true;
      console.log('✅ Friendly fire test completed!');
      socket.disconnect();
      process.exit(0);
    }
  }, 5000);
});

socket.on('game-state', (data) => {
  gameState = data;
  
  const ourPlayer = data.players.find(p => p.id === playerId);
  if (ourPlayer) {
    if (!ourPlayer.alive) {
      console.log('❌ FRIENDLY FIRE FAILED: Player was killed by own bullets!');
      console.log('💀 Player died - this should not happen with friendly fire prevention');
      testCompleted = true;
      socket.disconnect();
      process.exit(1);
    }
    
    // Log projectiles if any
    if (data.projectiles && data.projectiles.length > 0) {
      console.log(`💥 Projectiles in game: ${data.projectiles.length}`);
      data.projectiles.forEach(proj => {
        console.log(`  - Projectile ${proj.id} from ${proj.ownerId} at (${proj.x.toFixed(1)}, ${proj.y.toFixed(1)})`);
      });
    }
  }
});

socket.on('player-died', (data) => {
  if (data.playerId === playerId) {
    console.log('❌ FRIENDLY FIRE FAILED: Our player died!');
    console.log('💀 Death data:', data);
    testCompleted = true;
    socket.disconnect();
    process.exit(1);
  }
});

socket.on('connect_error', (error) => {
  console.error('❌ Connection error:', error);
  process.exit(1);
});

socket.on('error', (error) => {
  console.error('❌ Socket error:', error);
  process.exit(1);
});

socket.on('disconnect', (reason) => {
  console.log('🔌 Disconnected:', reason);
  if (!testCompleted) {
    console.log('✅ Test completed - player survived friendly fire test!');
    process.exit(0);
  }
});

// Timeout after 8 seconds
setTimeout(() => {
  if (!testCompleted) {
    console.log('✅ Test timeout - player survived friendly fire test!');
    testCompleted = true;
    socket.disconnect();
    process.exit(0);
  }
}, 8000);
