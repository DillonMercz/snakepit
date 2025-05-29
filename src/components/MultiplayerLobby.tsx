import React, { useState, useEffect } from 'react';
import { GameMode } from '../App';
import { useAuth } from '../contexts/AuthContext';
import MultiplayerService, { GameRoom } from '../services/MultiplayerService';

interface MultiplayerLobbyProps {
  onStartGame: (gameMode: GameMode, roomId: string) => void;
  onBackToMenu: () => void;
}

const MultiplayerLobby: React.FC<MultiplayerLobbyProps> = ({ onStartGame, onBackToMenu }) => {
  const { user, userProfile } = useAuth();
  const [availableRooms, setAvailableRooms] = useState<GameRoom[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [newRoomData, setNewRoomData] = useState({
    gameMode: 'classic' as GameMode,
    maxPlayers: 8,
    wagerAmount: 50
  });

  const multiplayerService = MultiplayerService.getInstance();

  useEffect(() => {
    loadAvailableRooms();

    // Refresh rooms every 5 seconds
    const interval = setInterval(loadAvailableRooms, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadAvailableRooms = async () => {
    try {
      const rooms = await multiplayerService.getAvailableRooms();
      setAvailableRooms(rooms);
    } catch (error) {
      console.error('Error loading rooms:', error);
    }
  };

  const handleCreateRoom = async () => {
    if (!user || !userProfile) return;

    setLoading(true);
    try {
      // Initialize multiplayer service
      await multiplayerService.initializeMultiplayer(null, user.id, userProfile.username);

      // Create room
      const room = await multiplayerService.createRoom(
        newRoomData.gameMode as 'classic' | 'warfare',
        newRoomData.wagerAmount,
        newRoomData.maxPlayers
      );

      if (room) {
        // Connect to the room
        const connected = await multiplayerService.connectToRoom();
        if (connected) {
          console.log('✅ Room created and connected');
          onStartGame(newRoomData.gameMode, room.id);
        } else {
          console.error('❌ Failed to connect to created room');
        }
      }
    } catch (error) {
      console.error('Error creating room:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async (room: GameRoom) => {
    if (!user || !userProfile) return;

    setLoading(true);
    try {
      // Initialize multiplayer service
      await multiplayerService.initializeMultiplayer(null, user.id, userProfile.username);

      // Join room
      const joined = await multiplayerService.joinRoom(room.id);
      if (joined) {
        // Connect to the room
        const connected = await multiplayerService.connectToRoom();
        if (connected) {
          console.log('✅ Joined room and connected');
          onStartGame(room.gameMode, room.id);
        } else {
          console.error('❌ Failed to connect to joined room');
        }
      }
    } catch (error) {
      console.error('Error joining room:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user || !userProfile) {
    return (
      <div className="multiplayer-lobby">
        <div className="lobby-container">
          <h2 className="neon-text neon-red">Authentication Required</h2>
          <p>Please log in to access multiplayer features.</p>
          <button className="neon-button neon-cyan" onClick={onBackToMenu}>
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="multiplayer-lobby">
      <div className="lobby-container">
        <div className="lobby-header">
          <h1 className="lobby-title neon-text neon-cyan">🌐 MULTIPLAYER LOBBY</h1>
          <div className="player-info">
            <span className="neon-text neon-yellow">👤 {userProfile.username}</span>
            <span className="neon-text neon-green">💎 ${userProfile.xrp_balance.toFixed(2)}</span>
          </div>
        </div>

        <div className="lobby-content">
          <div className="lobby-actions">
            <button
              className="neon-button neon-green"
              onClick={() => setShowCreateRoom(!showCreateRoom)}
              disabled={loading}
            >
              {showCreateRoom ? '❌ Cancel' : '➕ Create Room'}
            </button>

            <button
              className="neon-button neon-cyan"
              onClick={loadAvailableRooms}
              disabled={loading}
            >
              🔄 Refresh
            </button>

            <button
              className="neon-button neon-orange"
              onClick={onBackToMenu}
            >
              ⬅️ Back to Menu
            </button>
          </div>

          {showCreateRoom && (
            <div className="create-room-form">
              <h3 className="neon-text neon-yellow">Create New Room</h3>

              <div className="form-group">
                <label className="form-label">Game Mode:</label>
                <select
                  value={newRoomData.gameMode || 'classic'}
                  onChange={(e) => setNewRoomData(prev => ({ ...prev, gameMode: e.target.value as GameMode }))}
                  className="neon-select"
                >
                  <option value="classic">🐍 Classic Mode</option>
                  <option value="warfare">⚔️ Warfare Mode</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Max Players:</label>
                <select
                  value={newRoomData.maxPlayers}
                  onChange={(e) => setNewRoomData(prev => ({ ...prev, maxPlayers: parseInt(e.target.value) }))}
                  className="neon-select"
                >
                  <option value={2}>2 Players</option>
                  <option value={4}>4 Players</option>
                  <option value={6}>6 Players</option>
                  <option value={8}>8 Players</option>
                  <option value={12}>12 Players</option>
                  <option value={16}>16 Players</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Wager Amount:</label>
                <select
                  value={newRoomData.wagerAmount}
                  onChange={(e) => setNewRoomData(prev => ({ ...prev, wagerAmount: parseInt(e.target.value) }))}
                  className="neon-select"
                >
                  <option value={10}>$10</option>
                  <option value={25}>$25</option>
                  <option value={50}>$50</option>
                  <option value={100}>$100</option>
                  <option value={250}>$250</option>
                  <option value={500}>$500</option>
                </select>
              </div>

              <button
                className="neon-button neon-green"
                onClick={handleCreateRoom}
                disabled={loading || userProfile.xrp_balance < newRoomData.wagerAmount}
              >
                {loading ? '⏳ Creating...' : '🚀 Create & Join Room'}
              </button>

              {userProfile.xrp_balance < newRoomData.wagerAmount && (
                <p className="error-text neon-text neon-red">
                  Insufficient balance for this wager amount
                </p>
              )}
            </div>
          )}

          <div className="available-rooms">
            <h3 className="neon-text neon-cyan">Available Rooms ({availableRooms.length})</h3>

            {availableRooms.length === 0 ? (
              <div className="no-rooms">
                <p className="neon-text neon-dim">No rooms available. Create one to get started!</p>
              </div>
            ) : (
              <div className="rooms-list">
                {availableRooms.map((room) => (
                  <div key={room.id} className="room-card">
                    <div className="room-header">
                      <h4 className="room-name neon-text neon-yellow">{room.name}</h4>
                      <span className={`room-mode neon-text ${room.gameMode === 'warfare' ? 'neon-red' : 'neon-green'}`}>
                        {room.gameMode === 'warfare' ? '⚔️ WARFARE' : '🐍 CLASSIC'}
                      </span>
                    </div>

                    <div className="room-info">
                      <div className="room-stat">
                        <span className="stat-label">Players:</span>
                        <span className="stat-value neon-text neon-cyan">
                          {room.currentPlayers}/{room.maxPlayers}
                        </span>
                      </div>

                      <div className="room-stat">
                        <span className="stat-label">Wager:</span>
                        <span className="stat-value neon-text neon-green">
                          ${room.wagerAmount}
                        </span>
                      </div>

                      <div className="room-stat">
                        <span className="stat-label">Created:</span>
                        <span className="stat-value neon-text neon-dim">
                          {new Date(room.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>

                    <div className="room-actions">
                      <button
                        className="neon-button neon-cyan"
                        onClick={() => handleJoinRoom(room)}
                        disabled={loading || userProfile.xrp_balance < room.wagerAmount || room.currentPlayers >= room.maxPlayers}
                      >
                        {loading ? '⏳ Joining...' : '🚪 Join Room'}
                      </button>

                      {userProfile.xrp_balance < room.wagerAmount && (
                        <span className="error-text neon-text neon-red">Insufficient balance</span>
                      )}

                      {room.currentPlayers >= room.maxPlayers && (
                        <span className="error-text neon-text neon-orange">Room Full</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiplayerLobby;
