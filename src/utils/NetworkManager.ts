import { io, Socket } from 'socket.io-client';

interface InputData {
  targetAngle?: number;
  boosting?: boolean;
  shooting?: boolean;
  timestamp?: number;
}

interface GameData {
  gameMode: string;
  username: string;
  wager: number;
  color: string;
}

interface FinalStats {
  balance: number;
  kills?: number;
  timeAlive?: number;
  [key: string]: any;
}

class NetworkManager {
  public socket: Socket | null = null;
  public connected: boolean = false;
  public roomId: string | null = null;
  public playerId: string | null = null;
  public gameMode: string | null = null;
  public serverUrl: string;

  // Callbacks
  public onGameStateUpdate: ((gameState: any) => void) | null = null;
  public onGameJoined: ((data: any) => void) | null = null;
  public onPlayerJoined: ((playerData: any) => void) | null = null;
  public onPlayerLeft: ((playerData: any) => void) | null = null;
  public onConnectionError: ((error: any) => void) | null = null;
  public onDisconnected: ((reason: any) => void) | null = null;

  // Input buffering for smooth gameplay
  private inputBuffer: InputData[] = [];
  private lastInputSent: number = 0;
  private inputSendRate: number = 1000 / 30; // Send input 30 times per second
  private networkMonitor: NodeJS.Timeout | null = null;

  constructor() {
    this.serverUrl = this.getServerUrl();
  }

  getServerUrl() {
    // Try to detect if we're in development or production
    const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    if (isDevelopment) {
      // In development, try to connect to local server
      return 'http://localhost:3001';
    } else {
      // In production, you might want to use a different URL
      // For now, assume same host different port
      return `http://${window.location.hostname}:3001`;
    }
  }

  static getServerUrl() {
    // Static version for external access
    const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    if (isDevelopment) {
      return 'http://localhost:3001';
    } else {
      return `http://${window.location.hostname}:3001`;
    }
  }

  connect(): Promise<void> {
    if (this.socket && this.connected) {
      console.log('Already connected to server');
      return Promise.resolve();
    }

    return new Promise<void>((resolve, reject) => {
      console.log(`Connecting to multiplayer server: ${this.serverUrl}`);

      this.socket = io(this.serverUrl, {
        transports: ['websocket', 'polling'],
        timeout: 10000,
        forceNew: true
      });

      this.socket.on('connect', () => {
        console.log('✅ Connected to multiplayer server');
        this.connected = true;
        resolve();
      });

      this.socket.on('disconnect', (reason) => {
        console.log('❌ Disconnected from server:', reason);
        this.connected = false;
        this.roomId = null;
        this.playerId = null;
        if (this.onDisconnected) {
          this.onDisconnected(reason);
        }
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ Connection error:', error);
        this.connected = false;
        if (this.onConnectionError) {
          this.onConnectionError(error);
        }
        reject(error);
      });

      this.socket.on('gameJoined', (data: any) => {
        console.log('🎮 Joined game:', data);
        this.roomId = data.roomId;
        this.playerId = data.playerId;
        this.gameMode = data.gameMode;

        if (this.onGameJoined) {
          this.onGameJoined(data);
        }
      });

      this.socket.on('gameState', (gameState: any) => {
        if (this.onGameStateUpdate) {
          this.onGameStateUpdate(gameState);
        }
      });

      this.socket.on('playerJoined', (playerData: any) => {
        console.log('👤 Player joined:', playerData.username);
        if (this.onPlayerJoined) {
          this.onPlayerJoined(playerData);
        }
      });

      this.socket.on('playerLeft', (playerData: any) => {
        console.log('👋 Player left:', playerData.username);
        if (this.onPlayerLeft) {
          this.onPlayerLeft(playerData);
        }
      });

      // Set connection timeout
      setTimeout(() => {
        if (!this.connected) {
          reject(new Error('Connection timeout'));
        }
      }, 10000);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.connected = false;
    this.roomId = null;
    this.playerId = null;
  }

  joinGame(gameData: GameData): void {
    if (!this.connected || !this.socket) {
      throw new Error('Not connected to server');
    }

    const { gameMode = 'classic', username, wager = 1, color } = gameData;

    console.log(`🎯 Joining ${gameMode} game as ${username} with $${wager} wager`);

    this.socket.emit('joinGame', {
      gameMode,
      username,
      wager,
      color
    });
  }

  sendPlayerInput(inputData: InputData): void {
    if (!this.connected || !this.socket || !this.roomId) {
      return;
    }

    const now = Date.now();

    // Buffer input to avoid overwhelming the server
    this.inputBuffer.push({
      ...inputData,
      timestamp: now
    });

    // Send buffered input at controlled rate
    if (now - this.lastInputSent >= this.inputSendRate) {
      if (this.inputBuffer.length > 0) {
        // Send the most recent input
        const latestInput = this.inputBuffer[this.inputBuffer.length - 1];
        this.socket.emit('playerInput', latestInput);
        this.inputBuffer = [];
        this.lastInputSent = now;
      }
    }
  }

  sendChatMessage(message: string): void {
    if (!this.connected || !this.socket) {
      return;
    }

    this.socket.emit('chatMessage', {
      message,
      timestamp: Date.now()
    });
  }

  requestCashout(finalStats: FinalStats): void {
    if (!this.connected || !this.socket) {
      return;
    }

    this.socket.emit('playerCashout', {
      ...finalStats,
      timestamp: Date.now()
    });
  }

  // Utility methods
  isConnected() {
    return this.connected && this.socket && this.socket.connected;
  }

  getConnectionStatus() {
    return {
      connected: this.connected,
      roomId: this.roomId,
      playerId: this.playerId,
      gameMode: this.gameMode,
      serverUrl: this.serverUrl
    };
  }

  // Ping measurement for latency monitoring
  measurePing(): Promise<number> {
    return new Promise<number>((resolve) => {
      if (!this.connected || !this.socket) {
        resolve(-1);
        return;
      }

      const startTime = Date.now();
      this.socket.emit('ping', startTime);

      this.socket.once('pong', (timestamp: number) => {
        const latency = Date.now() - timestamp;
        resolve(latency);
      });

      // Timeout after 5 seconds
      setTimeout(() => resolve(-1), 5000);
    });
  }

  // Auto-reconnection logic
  enableAutoReconnect() {
    if (!this.socket) return;

    this.socket.on('disconnect', (reason) => {
      if (reason === 'io server disconnect') {
        // Server disconnected us, don't auto-reconnect
        return;
      }

      console.log('🔄 Attempting to reconnect...');

      // Try to reconnect after a delay
      setTimeout(() => {
        if (!this.connected) {
          this.connect().catch(error => {
            console.error('Reconnection failed:', error);
          });
        }
      }, 2000);
    });
  }

  // Network quality monitoring
  startNetworkMonitoring() {
    if (!this.connected) return;

    this.networkMonitor = setInterval(async () => {
      const ping = await this.measurePing();

      if (ping > 200) {
        console.warn(`⚠️ High latency detected: ${ping}ms`);
      } else if (ping === -1) {
        console.error('❌ Network connectivity issues');
      }
    }, 5000);
  }

  stopNetworkMonitoring() {
    if (this.networkMonitor) {
      clearInterval(this.networkMonitor);
      this.networkMonitor = null;
    }
  }
}

// Singleton instance
const networkManager = new NetworkManager();

export default networkManager;
