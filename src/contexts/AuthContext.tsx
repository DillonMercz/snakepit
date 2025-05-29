import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, UserProfile, getUserProfile, createUserProfile } from '../lib/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  userProfile: UserProfile | null
  loading: boolean
  signUp: (email: string, password: string, username: string) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<boolean>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('🔐 AuthContext: Initializing...')

    // Set a timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      console.log('🔐 AuthContext: Loading timeout reached, forcing completion')
      setLoading(false)
    }, 5000) // 5 second timeout

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('🔐 AuthContext: Initial session check:', session ? 'Found' : 'None')
      clearTimeout(loadingTimeout) // Clear timeout since we got a response
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        console.log('🔐 AuthContext: Loading profile for user:', session.user.id)
        loadUserProfile(session.user.id)
      } else {
        console.log('🔐 AuthContext: No session, setting loading to false')
        setLoading(false)
      }
    }).catch((error) => {
      console.error('🔐 AuthContext: Error getting session:', error)
      clearTimeout(loadingTimeout)
      setLoading(false)
    })

    // Listen for profile refresh events
    const handleProfileRefresh = () => {
      if (user) {
        console.log('🔐 AuthContext: Profile refresh requested')
        loadUserProfile(user.id)
      }
    }

    window.addEventListener('profileRefresh', handleProfileRefresh)

    return () => {
      window.removeEventListener('profileRefresh', handleProfileRefresh)
    }

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔐 AuthContext: Auth state change:', event, session ? 'Session exists' : 'No session')
      setSession(session)
      setUser(session?.user ?? null)

      if (session?.user) {
        console.log('🔐 AuthContext: Loading profile after auth change for user:', session.user.id)
        await loadUserProfile(session.user.id)
      } else {
        console.log('🔐 AuthContext: No session after auth change, clearing profile')
        setUserProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadUserProfile = async (userId: string) => {
    try {
      console.log('🔐 AuthContext: Loading profile for user:', userId)
      let profile = await getUserProfile(userId)

      // If profile doesn't exist, create it
      if (!profile && user) {
        console.log('🔐 AuthContext: Profile not found, creating new profile')
        const username = user.user_metadata?.username || `Player${userId.slice(0, 8)}`
        profile = await createUserProfile(userId, username)
        console.log('🔐 AuthContext: New profile created:', profile?.username)
      }

      console.log('🔐 AuthContext: Setting profile:', profile?.username || 'No profile')
      setUserProfile(profile)
    } catch (error) {
      console.error('🔐 AuthContext: Error loading user profile:', error)
      // Create a fallback profile to prevent infinite loading
      const fallbackProfile: UserProfile = {
        id: userId,
        username: `Player${userId.slice(0, 8)}`,
        xrp_balance: 100,
        total_games_played: 0,
        total_wins: 0,
        total_earnings: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        audio_muted: false,
        audio_volume: 0.6
      }
      setUserProfile(fallbackProfile)
      console.log('🔐 AuthContext: Fallback profile set')
    } finally {
      console.log('🔐 AuthContext: Setting loading to false')
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, username: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username
          }
        }
      })

      if (error) {
        return { error }
      }

      // Profile will be created automatically by the database trigger
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      return { error }
    } catch (error) {
      return { error }
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUserProfile(null)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !userProfile) return false

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', user.id)

      if (error) {
        console.error('Error updating profile:', error)
        return false
      }

      // Update local state
      setUserProfile({ ...userProfile, ...updates })
      return true
    } catch (error) {
      console.error('Error updating profile:', error)
      return false
    }
  }

  const refreshProfile = async () => {
    if (user) {
      await loadUserProfile(user.id)
    }
  }

  const value: AuthContextType = {
    user,
    session,
    userProfile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    refreshProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
