const io = require('socket.io-client');

console.log('🔫 Simple shooting test...');

const socket = io('http://localhost:3005');

socket.on('connect', () => {
  console.log('✅ Connected');
  
  socket.emit('joinGame', {
    gameMode: 'warfare',
    wager: 100,
    username: 'ShootTester'
  });
});

socket.on('gameJoined', (data) => {
  console.log('🎮 Game joined, player ID:', data.playerId);
  
  // Shoot after 1 second
  setTimeout(() => {
    console.log('🔫 Shooting...');
    socket.emit('playerShoot', {
      targetX: 3000,
      targetY: 3000
    });
    
    // Disconnect after 2 seconds
    setTimeout(() => {
      console.log('✅ Test complete');
      socket.disconnect();
      process.exit(0);
    }, 2000);
  }, 1000);
});

socket.on('error', (error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});

// Timeout
setTimeout(() => {
  console.log('⏰ Timeout');
  process.exit(0);
}, 5000);
