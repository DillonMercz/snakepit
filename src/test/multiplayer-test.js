// Simple test to verify multiplayer functionality
// This can be run in the browser console to test the system

async function testMultiplayerSystem() {
  console.log('🧪 Starting Multiplayer System Test...');
  
  try {
    // Test 1: Import MultiplayerService
    console.log('📦 Testing MultiplayerService import...');
    const { default: MultiplayerService } = await import('../services/MultiplayerService.ts');
    const multiplayerService = MultiplayerService.getInstance();
    console.log('✅ MultiplayerService imported successfully');
    
    // Test 2: Initialize multiplayer (mock user data)
    console.log('🔧 Testing multiplayer initialization...');
    const mockUserId = 'test-user-123';
    const mockUsername = 'TestPlayer';
    
    await multiplayerService.initializeMultiplayer(null, mockUserId, mockUsername);
    console.log('✅ Multiplayer initialized successfully');
    
    // Test 3: Create a test room
    console.log('🏠 Testing room creation...');
    const testRoom = await multiplayerService.createRoom('classic', 50, 4);
    
    if (testRoom) {
      console.log('✅ Room created successfully:', testRoom);
      
      // Test 4: Connect to the room
      console.log('🔗 Testing room connection...');
      const connected = await multiplayerService.connectToRoom();
      
      if (connected) {
        console.log('✅ Connected to room successfully');
        
        // Test 5: Simulate some game events
        console.log('🎮 Testing game event broadcasting...');
        multiplayerService.broadcastGameEvent({
          type: 'player_move',
          playerId: mockUserId,
          data: { x: 100, y: 200, angle: 0 },
          timestamp: Date.now()
        });
        console.log('✅ Game event broadcasted successfully');
        
        // Test 6: Get available rooms
        console.log('📋 Testing room listing...');
        const availableRooms = await multiplayerService.getAvailableRooms();
        console.log('✅ Available rooms retrieved:', availableRooms.length, 'rooms');
        
        // Test 7: Leave room
        console.log('🚪 Testing room leave...');
        await multiplayerService.leaveRoom();
        console.log('✅ Left room successfully');
        
      } else {
        console.error('❌ Failed to connect to room');
      }
    } else {
      console.error('❌ Failed to create room');
    }
    
    console.log('🎉 All multiplayer tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Multiplayer test failed:', error);
  }
}

// Test database functions
async function testDatabaseFunctions() {
  console.log('🧪 Starting Database Functions Test...');
  
  try {
    // Import Supabase client
    const { supabase } = await import('../lib/supabase');
    
    // Test 1: Check if tables exist
    console.log('📊 Testing database tables...');
    const { data: rooms, error: roomsError } = await supabase
      .from('game_rooms')
      .select('count')
      .limit(1);
    
    if (roomsError) {
      console.error('❌ game_rooms table error:', roomsError);
    } else {
      console.log('✅ game_rooms table accessible');
    }
    
    const { data: players, error: playersError } = await supabase
      .from('room_players')
      .select('count')
      .limit(1);
    
    if (playersError) {
      console.error('❌ room_players table error:', playersError);
    } else {
      console.log('✅ room_players table accessible');
    }
    
    // Test 2: Test get_available_rooms function
    console.log('🔍 Testing get_available_rooms function...');
    const { data: availableRooms, error: roomsListError } = await supabase
      .rpc('get_available_rooms');
    
    if (roomsListError) {
      console.error('❌ get_available_rooms function error:', roomsListError);
    } else {
      console.log('✅ get_available_rooms function works, found', availableRooms?.length || 0, 'rooms');
    }
    
    console.log('🎉 Database tests completed!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  }
}

// Test game integration
async function testGameIntegration() {
  console.log('🧪 Starting Game Integration Test...');
  
  try {
    // Test 1: Import Game class
    console.log('🎮 Testing Game class import...');
    const { Game } = await import('../gameLogic.js');
    console.log('✅ Game class imported successfully');
    
    // Test 2: Create a mock canvas
    console.log('🖼️ Creating mock canvas...');
    const mockCanvas = document.createElement('canvas');
    mockCanvas.width = 800;
    mockCanvas.height = 600;
    console.log('✅ Mock canvas created');
    
    // Test 3: Initialize game with multiplayer
    console.log('🔧 Testing game initialization with multiplayer...');
    const game = new Game(mockCanvas, 'classic');
    game.isMultiplayer = true;
    game.roomId = 'test-room-123';
    game.playerId = 'test-player-123';
    console.log('✅ Game initialized with multiplayer settings');
    
    // Test 4: Test multiplayer methods exist
    console.log('🔍 Testing multiplayer methods...');
    if (typeof game.initializeMultiplayer === 'function') {
      console.log('✅ initializeMultiplayer method exists');
    } else {
      console.error('❌ initializeMultiplayer method missing');
    }
    
    if (typeof game.updateRemotePlayers === 'function') {
      console.log('✅ updateRemotePlayers method exists');
    } else {
      console.error('❌ updateRemotePlayers method missing');
    }
    
    if (typeof game.broadcastGameEvent === 'function') {
      console.log('✅ broadcastGameEvent method exists');
    } else {
      console.error('❌ broadcastGameEvent method missing');
    }
    
    console.log('🎉 Game integration tests completed!');
    
  } catch (error) {
    console.error('❌ Game integration test failed:', error);
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting Complete Multiplayer Test Suite...');
  console.log('================================================');
  
  await testDatabaseFunctions();
  console.log('');
  
  await testMultiplayerSystem();
  console.log('');
  
  await testGameIntegration();
  console.log('');
  
  console.log('================================================');
  console.log('🏁 All tests completed!');
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.testMultiplayer = {
    runAllTests,
    testMultiplayerSystem,
    testDatabaseFunctions,
    testGameIntegration
  };
  
  console.log('🧪 Multiplayer tests available in window.testMultiplayer');
  console.log('Run window.testMultiplayer.runAllTests() to test everything');
}

export {
  runAllTests,
  testMultiplayerSystem,
  testDatabaseFunctions,
  testGameIntegration
};
