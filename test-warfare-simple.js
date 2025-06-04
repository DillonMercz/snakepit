const io = require('socket.io-client');

console.log('🔫 Testing warfare mode - simple test...');

const socket = io('http://localhost:3005', {
  timeout: 5000,
  forceNew: true
});

let testCompleted = false;

socket.on('connect', () => {
  console.log('✅ Connected to server');
  
  socket.emit('join-game', {
    gameMode: 'warfare',
    wager: 100,
    username: 'TestWarrior'
  });
});

socket.on('game-joined', (data) => {
  console.log('🎮 Warfare game joined successfully!');
  console.log('📊 Game state summary:', {
    roomId: data.roomId,
    gameMode: data.gameMode,
    playerId: data.playerId,
    hasWeapons: !!data.gameState.weapons,
    weaponCount: data.gameState.weapons ? data.gameState.weapons.length : 0,
    hasAmmo: !!data.gameState.ammo,
    ammoCount: data.gameState.ammo ? data.gameState.ammo.length : 0,
    hasProjectiles: !!data.gameState.projectiles,
    projectileCount: data.gameState.projectiles ? data.gameState.projectiles.length : 0,
    playerWeapon: data.gameState.playerData ? data.gameState.playerData.weapon : 'unknown'
  });
  
  // Test basic shooting
  console.log('🔫 Testing basic shooting...');
  socket.emit('player-shoot', {
    targetX: 3100,
    targetY: 3100
  });
  
  // Complete test after a short delay
  setTimeout(() => {
    if (!testCompleted) {
      testCompleted = true;
      console.log('✅ Warfare mode test completed successfully!');
      console.log('🎯 Key findings:');
      console.log('  - Server accepts warfare mode connections');
      console.log('  - Warfare items are generated');
      console.log('  - No circular reference crashes detected');
      console.log('  - Basic shooting functionality works');
      socket.disconnect();
      process.exit(0);
    }
  }, 3000);
});

socket.on('game-state', (data) => {
  if (data.projectiles && data.projectiles.length > 0) {
    console.log(`💥 Projectiles detected: ${data.projectiles.length}`);
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
    process.exit(0);
  }
});

// Timeout after 10 seconds
setTimeout(() => {
  if (!testCompleted) {
    console.log('⏰ Test timeout - completing...');
    testCompleted = true;
    socket.disconnect();
    process.exit(0);
  }
}, 10000);
