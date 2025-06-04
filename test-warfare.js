const io = require('socket.io-client');

console.log('🔫 Testing warfare mode mechanics...');

// Connect to server
console.log('🔌 Attempting to connect to http://localhost:3005...');
const socket = io('http://localhost:3005', {
  timeout: 5000,
  forceNew: true
});

let gameState = null;
let playerId = null;

socket.on('connect', () => {
  console.log('✅ Connected to server');

  // Join warfare mode game
  console.log('🎮 Joining warfare mode game...');
  socket.emit('join-game', {
    gameMode: 'warfare',
    wager: 100,
    username: 'TestWarrior'
  });
});

socket.on('connect_error', (error) => {
  console.error('❌ Connection error:', error);
  process.exit(1);
});

socket.on('disconnect', (reason) => {
  console.log('🔌 Disconnected:', reason);
});

socket.on('game-joined', (data) => {
  console.log('🎮 Warfare game joined:', {
    roomId: data.roomId,
    playerId: data.playerId,
    gameMode: data.gameMode,
    weaponCount: data.gameState.weapons ? data.gameState.weapons.length : 0,
    ammoCount: data.gameState.ammo ? data.gameState.ammo.length : 0,
    projectileCount: data.gameState.projectiles ? data.gameState.projectiles.length : 0
  });
  
  playerId = data.playerId;
  gameState = data.gameState;
  
  // Test movement
  setTimeout(() => {
    console.log('🏃 Testing movement...');
    socket.emit('player-move', {
      targetX: 3000,
      targetY: 3000,
      boosting: false
    });
  }, 1000);
  
  // Test shooting
  setTimeout(() => {
    console.log('🔫 Testing shooting...');
    socket.emit('player-shoot', {
      targetX: 3100,
      targetY: 3100
    });
  }, 2000);
  
  // Test weapon switching
  setTimeout(() => {
    console.log('🔄 Testing weapon switching...');
    socket.emit('switch-weapon', { slot: 'primaryWeapon' });
  }, 3000);
  
  // Monitor for 10 seconds
  setTimeout(() => {
    console.log('✅ Warfare mode test completed');
    socket.disconnect();
  }, 10000);
});

socket.on('game-state', (data) => {
  gameState = data;
  
  const player = data.players.find(p => p.id === playerId);
  if (player) {
    console.log(`🎯 Player state - Cash: $${player.cash}, Alive: ${player.alive}, Segments: ${player.segments.length}, Weapon: ${data.playerData?.weapon || 'unknown'}`);
  }
  
  // Log warfare-specific data
  if (data.weapons) {
    console.log(`⚔️  Weapons available: ${data.weapons.length}, Ammo: ${data.ammo?.length || 0}, Projectiles: ${data.projectiles?.length || 0}`);
  }
});

socket.on('projectile-hit', (data) => {
  console.log('💥 Projectile hit detected:', data);
});

socket.on('weapon-collected', (data) => {
  console.log('🎯 Weapon collected:', data);
});

socket.on('ammo-collected', (data) => {
  console.log('📦 Ammo collected:', data);
});

socket.on('player-died', (data) => {
  console.log('💀 Player died:', data);
});

socket.on('disconnect', (reason) => {
  console.log('🔌 Disconnected:', reason);
  process.exit(0);
});

socket.on('error', (error) => {
  console.error('❌ Socket error:', error);
  process.exit(1);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Test interrupted');
  socket.disconnect();
  process.exit(0);
});
