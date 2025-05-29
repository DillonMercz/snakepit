import { createClient } from '@supabase/supabase-js'

// Try to get environment variables, with fallback for development
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://pldmsydujkljhuscbvfb.supabase.co'
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsZG1zeWR1amtsamh1c2NidmZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0NzI5ODMsImV4cCI6MjA2NDA0ODk4M30.vD-hgekqW1Fcq6ttVXpc9WsW16WAgttX8bfCFQ65MD8'

// Debug logging
console.log('🔧 Supabase Environment Check:')
console.log('URL:', supabaseUrl ? '✅ Found' : '❌ Missing')
console.log('Key:', supabaseAnonKey ? '✅ Found' : '❌ Missing')
console.log('Using fallback:', process.env.REACT_APP_SUPABASE_URL ? 'No' : 'Yes')

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase configuration missing!')
  throw new Error('Supabase configuration is missing.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database Types
export interface UserProfile {
  id: string
  username: string
  xrp_balance: number
  total_games_played: number
  total_wins: number
  total_earnings: number
  created_at: string
  updated_at: string
  audio_muted: boolean
  audio_volume: number
}

export interface GameSession {
  id: string
  user_id: string
  game_mode: 'classic' | 'warfare'
  wager_amount: number
  final_score: number
  final_length: number
  final_cash: number
  duration_seconds: number
  cashed_out: boolean
  created_at: string
}

export interface Leaderboard {
  id: string
  user_id: string
  username: string
  game_mode: 'classic' | 'warfare'
  high_score: number
  high_cash: number
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  user_id: string
  type: 'deposit' | 'withdrawal' | 'wager' | 'cashout'
  amount: number
  description: string
  created_at: string
}

export interface ShopItem {
  id: string
  name: string
  description: string
  category: 'skin' | 'powerup' | 'weapon' | 'cosmetic'
  price: number
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  image_url?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface UserInventory {
  id: string
  user_id: string
  item_id: string
  quantity: number
  is_equipped: boolean
  purchased_at: string
  item?: ShopItem
}

export interface Friend {
  id: string
  user_id: string
  friend_id: string
  status: 'pending' | 'accepted' | 'blocked'
  created_at: string
  updated_at: string
  friend_profile?: UserProfile
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  category: string
  requirement_type: string
  requirement_value: number
  reward_xrp: number
  is_active: boolean
  created_at: string
}

export interface UserAchievement {
  id: string
  user_id: string
  achievement_id: string
  earned_at: string
  achievement?: Achievement
}

// Auth helper functions
export const getCurrentUser = () => {
  return supabase.auth.getUser()
}

export const signUp = async (email: string, password: string, username: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username
      }
    }
  })
  return { data, error }
}

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

// User Profile functions
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    console.log('🔐 Database: Fetching user profile for:', userId)

    // Add timeout to prevent hanging
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Database query timeout')), 3000)
    })

    const queryPromise = supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    const { data, error } = await Promise.race([queryPromise, timeoutPromise])

    if (error) {
      console.error('🔐 Database: Error fetching user profile:', error)
      // If it's a "not found" error, that's expected for new users
      if (error.code === 'PGRST116') {
        console.log('🔐 Database: Profile not found (expected for new users)')
      } else if (error.code === '42P01') {
        console.log('🔐 Database: Table does not exist - please run the database schema')
      }
      return null
    }

    console.log('🔐 Database: Profile fetched successfully:', data.username)
    return data
  } catch (error) {
    console.error('🔐 Database: Exception fetching user profile:', error)
    if (error instanceof Error && error.message === 'Database query timeout') {
      console.log('🔐 Database: Query timed out - database may not be set up')
    }
    return null
  }
}

export const createUserProfile = async (userId: string, username: string): Promise<UserProfile | null> => {
  try {
    console.log('🔐 Database: Creating user profile for:', userId, 'with username:', username)

    // Use the correct column names from the UserProfile interface
    const profileData = {
      id: userId,
      username,
      xrp_balance: 100, // Starting balance
      total_games_played: 0,
      total_wins: 0,
      total_earnings: 0,
      audio_muted: false,
      audio_volume: 0.6
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .insert(profileData)
      .select()
      .single()

    if (error) {
      console.error('🔐 Database: Error creating user profile:', error)
      return null
    }

    console.log('🔐 Database: Profile created successfully:', data.username)
    return data
  } catch (error) {
    console.error('🔐 Database: Exception creating user profile:', error)
    return null
  }
}

export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>): Promise<boolean> => {
  const { error } = await supabase
    .from('user_profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)

  if (error) {
    console.error('Error updating user profile:', error)
    return false
  }

  return true
}

// Game Session functions
export const saveGameSession = async (session: Omit<GameSession, 'id' | 'created_at'>): Promise<boolean> => {
  const { error } = await supabase
    .from('game_sessions')
    .insert(session)

  if (error) {
    console.error('Error saving game session:', error)
    return false
  }

  return true
}

// Leaderboard functions
export const getLeaderboard = async (gameMode: 'classic' | 'warfare', limit: number = 10): Promise<Leaderboard[]> => {
  const { data, error } = await supabase
    .from('leaderboards')
    .select('*')
    .eq('game_mode', gameMode)
    .order('high_score', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching leaderboard:', error)
    return []
  }

  return data || []
}

export const updateLeaderboard = async (userId: string, username: string, gameMode: 'classic' | 'warfare', score: number, cash: number): Promise<boolean> => {
  // First check if user already has a leaderboard entry
  const { data: existing } = await supabase
    .from('leaderboards')
    .select('*')
    .eq('user_id', userId)
    .eq('game_mode', gameMode)
    .single()

  if (existing) {
    // Update if new score is higher
    if (score > existing.high_score || cash > existing.high_cash) {
      const { error } = await supabase
        .from('leaderboards')
        .update({
          high_score: Math.max(score, existing.high_score),
          high_cash: Math.max(cash, existing.high_cash),
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)

      if (error) {
        console.error('Error updating leaderboard:', error)
        return false
      }
    }
  } else {
    // Create new leaderboard entry
    const { error } = await supabase
      .from('leaderboards')
      .insert({
        user_id: userId,
        username,
        game_mode: gameMode,
        high_score: score,
        high_cash: cash
      })

    if (error) {
      console.error('Error creating leaderboard entry:', error)
      return false
    }
  }

  return true
}

// Transaction functions
export const addTransaction = async (transaction: Omit<Transaction, 'id' | 'created_at'>): Promise<boolean> => {
  const { error } = await supabase
    .from('transactions')
    .insert(transaction)

  if (error) {
    console.error('Error adding transaction:', error)
    return false
  }

  return true
}

export const getUserTransactions = async (userId: string, limit: number = 50): Promise<Transaction[]> => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching transactions:', error)
    return []
  }

  return data || []
}

// Secure game functions
export interface GameResult {
  success: boolean
  error?: string
  session_id?: string
  net_earnings?: number
  new_balance?: number
  wager_amount?: number
  message?: string
}

export const startGameWager = async (gameMode: 'classic' | 'warfare', wagerAmount: number): Promise<GameResult> => {
  try {
    console.log('🎮 Starting game wager:', { gameMode, wagerAmount })

    const { data, error } = await supabase.rpc('start_game_wager', {
      p_game_mode: gameMode,
      p_wager_amount: wagerAmount
    })

    if (error) {
      console.error('🎮 Error starting game wager:', error)
      return { success: false, error: error.message }
    }

    console.log('🎮 Game wager result:', data)
    return data
  } catch (error) {
    console.error('🎮 Exception starting game wager:', error)
    return { success: false, error: 'Failed to start game' }
  }
}

export const secureCashout = async (
  gameMode: 'classic' | 'warfare',
  wagerAmount: number,
  finalScore: number,
  finalLength: number,
  finalCash: number,
  durationSeconds: number
): Promise<GameResult> => {
  try {
    console.log('🎮 Processing secure cashout:', {
      gameMode,
      wagerAmount,
      finalScore,
      finalLength,
      finalCash,
      durationSeconds
    })

    const { data, error } = await supabase.rpc('secure_cashout', {
      p_game_mode: gameMode,
      p_wager_amount: wagerAmount,
      p_final_score: finalScore,
      p_final_length: finalLength,
      p_final_cash: finalCash,
      p_duration_seconds: durationSeconds
    })

    if (error) {
      console.error('🎮 Error processing cashout:', error)
      return { success: false, error: error.message }
    }

    console.log('🎮 Cashout result:', data)
    return data
  } catch (error) {
    console.error('🎮 Exception processing cashout:', error)
    return { success: false, error: 'Failed to process cashout' }
  }
}

// Shop functions
export const getShopItems = async (category?: string): Promise<ShopItem[]> => {
  try {
    let query = supabase
      .from('shop_items')
      .select('*')
      .eq('is_active', true)
      .order('price', { ascending: true })

    if (category) {
      query = query.eq('category', category)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching shop items:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Exception fetching shop items:', error)
    return []
  }
}

export const purchaseItem = async (itemId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data, error } = await supabase.rpc('purchase_shop_item', {
      p_item_id: itemId
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return data
  } catch (error) {
    console.error('Exception purchasing item:', error)
    return { success: false, error: 'Failed to purchase item' }
  }
}

// Inventory functions
export const getUserInventory = async (userId: string): Promise<UserInventory[]> => {
  try {
    const { data, error } = await supabase
      .from('user_inventory')
      .select(`
        *,
        item:shop_items(*)
      `)
      .eq('user_id', userId)
      .order('purchased_at', { ascending: false })

    if (error) {
      console.error('Error fetching user inventory:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Exception fetching user inventory:', error)
    return []
  }
}

export const equipItem = async (inventoryId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('user_inventory')
      .update({ is_equipped: true })
      .eq('id', inventoryId)

    if (error) {
      console.error('Error equipping item:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Exception equipping item:', error)
    return false
  }
}

// Friends functions
export const getUserFriends = async (userId: string): Promise<Friend[]> => {
  try {
    const { data, error } = await supabase
      .from('friends')
      .select(`
        *,
        friend_profile:user_profiles!friends_friend_id_fkey(*)
      `)
      .eq('user_id', userId)
      .eq('status', 'accepted')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching friends:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Exception fetching friends:', error)
    return []
  }
}

export const sendFriendRequest = async (friendUsername: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data, error } = await supabase.rpc('send_friend_request', {
      p_friend_username: friendUsername
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return data
  } catch (error) {
    console.error('Exception sending friend request:', error)
    return { success: false, error: 'Failed to send friend request' }
  }
}

// Achievements functions
export const getUserAchievements = async (userId: string): Promise<UserAchievement[]> => {
  try {
    const { data, error } = await supabase
      .from('user_achievements')
      .select(`
        *,
        achievement:achievements(*)
      `)
      .eq('user_id', userId)
      .order('earned_at', { ascending: false })

    if (error) {
      console.error('Error fetching user achievements:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Exception fetching user achievements:', error)
    return []
  }
}

export const getAllAchievements = async (): Promise<Achievement[]> => {
  try {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('is_active', true)
      .order('requirement_value', { ascending: true })

    if (error) {
      console.error('Error fetching achievements:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Exception fetching achievements:', error)
    return []
  }
}
