import { supabase } from '../lib/supabase'
import { RealtimeChannel } from '@supabase/supabase-js'

export interface PlayerState {
  id: string
  username: string
  x: number
  y: number
  angle: number
  segments: Array<{ x: number; y: number; health?: number; maxHealth?: number }>
  color: string
  alive: boolean
  cashBalance: number
  boost: number
  size: number
  wager: number
  isInvincible?: boolean
  lastUpdate: number
}

export interface GameRoom {
  id: string
  name: string
  gameMode: 'classic' | 'warfare'
  maxPlayers: number
  currentPlayers: number
  wagerAmount: number
  status: 'waiting' | 'playing' | 'finished'
  createdAt: string
  hostId: string
}

export interface GameEvent {
  type: 'player_move' | 'player_death' | 'food_collected' | 'coin_collected' | 'weapon_fired' | 'player_joined' | 'player_left' | 'player_shoot'
  playerId: string
  data: any
  timestamp: number
}

export class MultiplayerService {
  private static instance: MultiplayerService
  private channel: RealtimeChannel | null = null
  private currentRoom: GameRoom | null = null
  private playerId: string | null = null
  private gameInstance: any = null
  private updateInterval: NodeJS.Timeout | null = null

  private constructor() {}

  static getInstance(): MultiplayerService {
    if (!MultiplayerService.instance) {
      MultiplayerService.instance = new MultiplayerService()
    }
    return MultiplayerService.instance
  }

  // Initialize multiplayer for a game instance
  async initializeMultiplayer(gameInstance: any, userId: string, username: string) {
    console.log('🌐 Initializing multiplayer service...')
    this.gameInstance = gameInstance
    this.playerId = userId

    // Set up the game instance for multiplayer (only if gameInstance is provided)
    if (gameInstance) {
      gameInstance.playerId = userId
      gameInstance.isMultiplayer = true
    }

    console.log('✅ Multiplayer service initialized')
    return true
  }

  // Set the game instance (public method)
  setGameInstance(gameInstance: any) {
    this.gameInstance = gameInstance
    if (gameInstance && this.playerId) {
      gameInstance.playerId = this.playerId
      gameInstance.isMultiplayer = true
    }
  }

  // Create a new game room
  async createRoom(gameMode: 'classic' | 'warfare', wagerAmount: number, maxPlayers: number = 8): Promise<GameRoom | null> {
    try {
      console.log('🏠 Creating new game room...', { gameMode, wagerAmount, maxPlayers })

      const roomData = {
        name: `${gameMode.toUpperCase()} Room`,
        game_mode: gameMode,
        max_players: maxPlayers,
        current_players: 1,
        wager_amount: wagerAmount,
        status: 'waiting',
        host_id: this.playerId,
        created_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('game_rooms')
        .insert(roomData)
        .select()
        .single()

      if (error) {
        console.error('❌ Error creating room:', error)
        return null
      }

      this.currentRoom = {
        id: data.id,
        name: data.name,
        gameMode: data.game_mode,
        maxPlayers: data.max_players,
        currentPlayers: data.current_players,
        wagerAmount: data.wager_amount,
        status: data.status,
        createdAt: data.created_at,
        hostId: data.host_id
      }

      console.log('✅ Room created:', this.currentRoom)
      return this.currentRoom
    } catch (error) {
      console.error('❌ Error creating room:', error)
      return null
    }
  }

  // Join an existing room
  async joinRoom(roomId: string): Promise<boolean> {
    try {
      console.log('🚪 Joining room:', roomId)

      // Get room info
      const { data: roomData, error: roomError } = await supabase
        .from('game_rooms')
        .select('*')
        .eq('id', roomId)
        .single()

      if (roomError || !roomData) {
        console.error('❌ Room not found:', roomError)
        return false
      }

      // Check if room is full
      if (roomData.current_players >= roomData.max_players) {
        console.error('❌ Room is full')
        return false
      }

      // Update room player count
      const { error: updateError } = await supabase
        .from('game_rooms')
        .update({ current_players: roomData.current_players + 1 })
        .eq('id', roomId)

      if (updateError) {
        console.error('❌ Error updating room:', updateError)
        return false
      }

      this.currentRoom = {
        id: roomData.id,
        name: roomData.name,
        gameMode: roomData.game_mode,
        maxPlayers: roomData.max_players,
        currentPlayers: roomData.current_players + 1,
        wagerAmount: roomData.wager_amount,
        status: roomData.status,
        createdAt: roomData.created_at,
        hostId: roomData.host_id
      }

      console.log('✅ Joined room:', this.currentRoom)
      return true
    } catch (error) {
      console.error('❌ Error joining room:', error)
      return false
    }
  }

  // Connect to real-time channel for the current room
  async connectToRoom(): Promise<boolean> {
    if (!this.currentRoom) {
      console.error('❌ No current room to connect to')
      return false
    }

    try {
      console.log('🔗 Connecting to real-time channel for room:', this.currentRoom.id)

      // Create channel for this room
      this.channel = supabase.channel(`game_room_${this.currentRoom.id}`)

      // Listen for player state updates
      this.channel.on('broadcast', { event: 'player_state' }, (payload) => {
        this.handlePlayerStateUpdate(payload)
      })

      // Listen for game events
      this.channel.on('broadcast', { event: 'game_event' }, (payload) => {
        this.handleGameEvent(payload)
      })

      // Subscribe to the channel
      this.channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Connected to real-time channel')

          // Start sending player updates
          this.startPlayerUpdates()

          // Announce player joined
          this.broadcastGameEvent({
            type: 'player_joined',
            playerId: this.playerId!,
            data: { username: this.gameInstance?.player?.username || 'Unknown' },
            timestamp: Date.now()
          })
        } else {
          console.error('❌ Failed to subscribe to channel:', status)
        }
      })

      // Return true immediately as subscription is async
      return true
    } catch (error) {
      console.error('❌ Error connecting to room:', error)
      return false
    }
  }

  // Start sending player position updates
  private startPlayerUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
    }

    this.updateInterval = setInterval(() => {
      if (this.gameInstance?.player && this.channel) {
        const playerState: PlayerState = {
          id: this.playerId!,
          username: this.gameInstance.player.username || 'Unknown',
          x: this.gameInstance.player.x,
          y: this.gameInstance.player.y,
          angle: this.gameInstance.player.angle,
          segments: this.gameInstance.player.segments,
          color: this.gameInstance.player.color,
          alive: this.gameInstance.player.alive,
          cashBalance: this.gameInstance.cashBalance || 0,
          boost: this.gameInstance.player.boost,
          size: this.gameInstance.player.size,
          wager: this.gameInstance.player.wager || 50,
          isInvincible: this.gameInstance.player.isInvincible?.() || false,
          lastUpdate: Date.now()
        }

        this.channel.send({
          type: 'broadcast',
          event: 'player_state',
          payload: playerState
        })
      }
    }, 50) // Send updates 20 times per second
  }

  // Handle incoming player state updates
  private handlePlayerStateUpdate(payload: any) {
    if (!this.gameInstance || payload.payload.id === this.playerId) {
      return // Don't process our own updates
    }

    const playerState: PlayerState = payload.payload

    // Find existing remote player or create new one
    let remotePlayer = this.gameInstance.remotePlayers.find((p: any) => p.id === playerState.id)

    if (!remotePlayer) {
      // Create new remote player
      remotePlayer = {
        id: playerState.id,
        username: playerState.username,
        x: playerState.x,
        y: playerState.y,
        angle: playerState.angle,
        segments: playerState.segments,
        color: playerState.color,
        alive: playerState.alive,
        cashBalance: playerState.cashBalance,
        boost: playerState.boost,
        size: playerState.size,
        wager: playerState.wager,
        isInvincible: playerState.isInvincible,
        segmentDistance: 15, // Default segment distance
        isPlayer: false
      }

      this.gameInstance.remotePlayers.push(remotePlayer)
      console.log('👤 New player joined:', playerState.username)
    } else {
      // Update existing player
      remotePlayer.targetX = playerState.x
      remotePlayer.targetY = playerState.y
      remotePlayer.angle = playerState.angle
      remotePlayer.segments = playerState.segments
      remotePlayer.alive = playerState.alive
      remotePlayer.cashBalance = playerState.cashBalance
      remotePlayer.boost = playerState.boost
      remotePlayer.isInvincible = playerState.isInvincible
    }
  }

  // Handle game events
  private handleGameEvent(payload: any) {
    const event: GameEvent = payload.payload
    console.log('🎮 Game event received:', event)

    switch (event.type) {
      case 'player_joined':
        console.log(`👋 ${event.data.username} joined the game`)
        break
      case 'player_left':
        console.log(`👋 Player left the game`)
        // Remove player from remote players
        if (this.gameInstance) {
          this.gameInstance.remotePlayers = this.gameInstance.remotePlayers.filter(
            (p: any) => p.id !== event.playerId
          )
        }
        break
      case 'player_death':
        console.log(`💀 Player died:`, event.data)
        // Mark remote player as dead
        if (this.gameInstance) {
          const deadPlayer = this.gameInstance.remotePlayers.find((p: any) => p.id === event.playerId)
          if (deadPlayer) {
            deadPlayer.alive = false
          }
        }
        break
      case 'player_shoot':
        console.log(`🔫 Player shot:`, event.data)
        // Handle remote player shooting
        if (this.gameInstance && event.data.projectile) {
          this.gameInstance.projectiles.push(event.data.projectile)
        }
        break
      case 'coin_collected':
        console.log(`💰 Coin collected:`, event.data)
        // Remove coin from game world
        if (this.gameInstance && event.data.coinId) {
          const coin = this.gameInstance.coins.find((c: any) => c.id === event.data.coinId)
          if (coin) {
            coin.collected = true
          }
        }
        break
      // Add more event handlers as needed
    }
  }

  // Broadcast a game event
  broadcastGameEvent(event: GameEvent) {
    if (this.channel) {
      this.channel.send({
        type: 'broadcast',
        event: 'game_event',
        payload: event
      })
    }
  }

  // Leave the current room
  async leaveRoom() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = null
    }

    if (this.channel) {
      // Announce player leaving
      this.broadcastGameEvent({
        type: 'player_left',
        playerId: this.playerId!,
        data: {},
        timestamp: Date.now()
      })

      await this.channel.unsubscribe()
      this.channel = null
    }

    if (this.currentRoom) {
      // Update room player count
      try {
        await supabase
          .from('game_rooms')
          .update({ current_players: Math.max(0, this.currentRoom.currentPlayers - 1) })
          .eq('id', this.currentRoom.id)
      } catch (error) {
        console.error('❌ Error updating room on leave:', error)
      }
    }

    this.currentRoom = null
    console.log('👋 Left room')
  }

  // Get current room info
  getCurrentRoom(): GameRoom | null {
    return this.currentRoom
  }

  // Get available rooms
  async getAvailableRooms(): Promise<GameRoom[]> {
    try {
      // Use the database function for better performance and accuracy
      const { data, error } = await supabase
        .rpc('get_available_rooms')

      if (error) {
        console.error('❌ Error fetching rooms:', error)
        return []
      }

      return data.map((room: any) => ({
        id: room.room_id,
        name: room.room_name,
        gameMode: room.game_mode,
        maxPlayers: room.max_players,
        currentPlayers: room.current_players,
        wagerAmount: room.wager_amount,
        status: 'waiting',
        createdAt: room.created_at,
        hostId: room.host_username // Note: this is username, not ID
      }))
    } catch (error) {
      console.error('❌ Error fetching rooms:', error)
      return []
    }
  }

  // Cleanup
  cleanup() {
    this.leaveRoom()
    this.gameInstance = null
    this.playerId = null
  }
}

export default MultiplayerService
