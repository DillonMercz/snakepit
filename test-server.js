const io = require('socket.io-client');

// Test configuration
const SERVER_URL = 'http://localhost:3001';
const TEST_PLAYERS = 5;

console.log('🧪 Starting SnakePit Multiplayer Server Test');
console.log(`📡 Connecting to: ${SERVER_URL}`);
console.log(`👥 Testing with ${TEST_PLAYERS} simulated players`);

// Test results tracking
let connectedPlayers = 0;
let playersJoinedGame = 0;
let gameStatesReceived = 0;
let testResults = {
  connections: 0,
  gameJoins: 0,
  gameStates: 0,
  errors: 0
};

// Create test players
const players = [];

function createTestPlayer(playerId) {
  return new Promise((resolve, reject) => {
    const socket = io(SERVER_URL, {
      transports: ['websocket', 'polling'],
      timeout: 5000
    });

    const player = {
      id: playerId,
      socket: socket,
      username: `TestPlayer_${playerId}`,
      connected: false,
      joinedGame: false
    };

    // Connection events
    socket.on('connect', () => {
      console.log(`✅ Player ${playerId} connected`);
      player.connected = true;
      connectedPlayers++;
      testResults.connections++;
      
      // Join game after connection
      setTimeout(() => {
        socket.emit('joinGame', {
          gameMode: 'classic',
          username: player.username,
          wager: 50,
          color: `#${Math.floor(Math.random()*16777215).toString(16)}`
        });
      }, 100);
    });

    socket.on('gameJoined', (data) => {
      console.log(`🎮 Player ${playerId} joined game in room ${data.roomId}`);
      player.joinedGame = true;
      player.roomId = data.roomId;
      player.playerId = data.playerId;
      playersJoinedGame++;
      testResults.gameJoins++;
      
      // Start sending input
      startSendingInput(player);
    });

    socket.on('gameState', (gameState) => {
      gameStatesReceived++;
      testResults.gameStates++;
      
      if (gameStatesReceived % 100 === 0) {
        console.log(`📊 Received ${gameStatesReceived} game state updates`);
      }
    });

    socket.on('playerJoined', (playerData) => {
      console.log(`👤 Player ${playerId} saw new player join: ${playerData.username}`);
    });

    socket.on('playerLeft', (playerData) => {
      console.log(`👋 Player ${playerId} saw player leave: ${playerData.username}`);
    });

    socket.on('error', (error) => {
      console.error(`❌ Player ${playerId} error:`, error);
      testResults.errors++;
    });

    socket.on('connect_error', (error) => {
      console.error(`❌ Player ${playerId} connection error:`, error);
      testResults.errors++;
      reject(error);
    });

    socket.on('disconnect', (reason) => {
      console.log(`🔌 Player ${playerId} disconnected: ${reason}`);
      player.connected = false;
    });

    players.push(player);
    
    // Resolve after a short delay to allow connection
    setTimeout(() => {
      if (player.connected) {
        resolve(player);
      } else {
        reject(new Error(`Player ${playerId} failed to connect`));
      }
    }, 2000);
  });
}

function startSendingInput(player) {
  // Send random input every 100ms
  const inputInterval = setInterval(() => {
    if (!player.connected || !player.joinedGame) {
      clearInterval(inputInterval);
      return;
    }

    // Random movement
    const targetAngle = Math.random() * Math.PI * 2;
    const boosting = Math.random() > 0.8; // 20% chance to boost

    player.socket.emit('playerInput', {
      targetAngle: targetAngle,
      boosting: boosting,
      timestamp: Date.now()
    });
  }, 100);

  // Store interval for cleanup
  player.inputInterval = inputInterval;
}

async function runTest() {
  console.log('\n🚀 Starting connection test...');
  
  try {
    // Create all test players
    const playerPromises = [];
    for (let i = 1; i <= TEST_PLAYERS; i++) {
      playerPromises.push(createTestPlayer(i));
    }

    // Wait for all players to connect
    await Promise.all(playerPromises);
    console.log(`\n✅ All ${TEST_PLAYERS} players connected successfully!`);

    // Wait for players to join games
    console.log('\n⏳ Waiting for players to join games...');
    await new Promise(resolve => {
      const checkInterval = setInterval(() => {
        if (playersJoinedGame >= TEST_PLAYERS) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
    });

    console.log(`\n🎮 All ${TEST_PLAYERS} players joined games successfully!`);

    // Let the test run for 10 seconds
    console.log('\n⏳ Running gameplay test for 10 seconds...');
    await new Promise(resolve => setTimeout(resolve, 10000));

    // Test server health endpoint
    console.log('\n🏥 Testing server health endpoint...');
    try {
      const response = await fetch('http://localhost:3001/health');
      const healthData = await response.json();
      console.log('📊 Server health:', healthData);
    } catch (error) {
      console.error('❌ Health check failed:', error.message);
    }

    // Print final results
    printTestResults();

  } catch (error) {
    console.error('❌ Test failed:', error);
    testResults.errors++;
  } finally {
    // Cleanup
    console.log('\n🧹 Cleaning up test players...');
    players.forEach(player => {
      if (player.inputInterval) {
        clearInterval(player.inputInterval);
      }
      if (player.socket) {
        player.socket.disconnect();
      }
    });
    
    setTimeout(() => {
      console.log('✅ Test completed');
      process.exit(0);
    }, 1000);
  }
}

function printTestResults() {
  console.log('\n📊 TEST RESULTS:');
  console.log('================');
  console.log(`✅ Successful connections: ${testResults.connections}/${TEST_PLAYERS}`);
  console.log(`🎮 Successful game joins: ${testResults.gameJoins}/${TEST_PLAYERS}`);
  console.log(`📡 Game state updates received: ${testResults.gameStates}`);
  console.log(`❌ Errors encountered: ${testResults.errors}`);
  
  const successRate = ((testResults.connections + testResults.gameJoins) / (TEST_PLAYERS * 2)) * 100;
  console.log(`📈 Overall success rate: ${successRate.toFixed(1)}%`);
  
  if (successRate >= 90) {
    console.log('🎉 TEST PASSED - Server is working correctly!');
  } else {
    console.log('⚠️  TEST FAILED - Server has issues');
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Test interrupted by user');
  players.forEach(player => {
    if (player.socket) {
      player.socket.disconnect();
    }
  });
  process.exit(0);
});

// Start the test
runTest().catch(error => {
  console.error('💥 Test crashed:', error);
  process.exit(1);
});
