'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import { User, Session } from '@supabase/supabase-js'
import type { UserProfile } from '@/types/user'

type AuthContextType = {
  user: User | null
  session: Session | null
  userProfile: UserProfile | null
  loading: boolean
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  userProfile: null,
  loading: true,
  signUp: async () => ({ error: null }),
  signIn: async () => ({ error: null }),
  signOut: async () => {},
  refreshProfile: async () => {},
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createBrowserSupabaseClient()

  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      
      const response = await fetch(`${supabaseUrl}/rest/v1/user_profiles?select=*&id=eq.${userId}`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data && data.length > 0) {
          setUserProfile(data[0])
        } else {
          // Try to create profile if it doesn't exist
          try {
            const userData = await supabase.auth.getUser()
            if (userData.data.user) {
              await createUserProfileManually(userData.data.user.id, userData.data.user.email || '')
              // Retry fetching after creation
              const retryResponse = await fetch(`${supabaseUrl}/rest/v1/user_profiles?select=*&id=eq.${userId}`, {
                headers: {
                  'apikey': supabaseKey,
                  'Authorization': `Bearer ${supabaseKey}`,
                  'Content-Type': 'application/json'
                }
              })
              if (retryResponse.ok) {
                const retryData = await retryResponse.json()
                if (retryData && retryData.length > 0) {
                  setUserProfile(retryData[0])
                  return
                }
              }
            }
          } catch (createError) {
            // Silent fallback
          }
          setUserProfile(null)
        }
      } else {
        setUserProfile(null)
      }
    } catch (error) {
      setUserProfile(null)
    }
  }, [])

  const refreshProfile = async () => {
    if (user) {
      await fetchUserProfile(user.id)
    }
  }

  useEffect(() => {
    // Set a timeout to prevent hanging
    const timeoutId = setTimeout(() => {
      setLoading(false)
    }, 5000) // 5 second timeout

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      clearTimeout(timeoutId)
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        await fetchUserProfile(session.user.id)
      } else {
        setUserProfile(null)
      }
      
      setLoading(false)
    }).catch(() => {
      clearTimeout(timeoutId)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        await fetchUserProfile(session.user.id)
      } else {
        setUserProfile(null)
      }
      
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase, fetchUserProfile])

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    
    // If user creation succeeded but profile creation might have failed,
    // try to create the profile manually
    if (!error && data.user) {
      try {
        await createUserProfileManually(data.user.id, data.user.email || email)
      } catch (profileError) {
        // Don't fail signup if profile creation fails
      }
    }
    
    return { error }
  }

  const createUserProfileManually = async (userId: string, email: string) => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    
    const role = email === 'ondrej.svec@aibility.cz' ? 'admin' : 'reader'
    
    // Get the user's JWT token for authenticated requests
    let authToken = supabaseKey
    try {
      const { data } = await supabase.auth.getSession()
      if (data.session?.access_token) {
        authToken = data.session.access_token
      }
    } catch (error) {
      // Use anon key as fallback
    }
    
    const response = await fetch(`${supabaseUrl}/rest/v1/user_profiles`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        id: userId,
        email: email,
        role: role
      })
    })
    
    if (!response.ok) {
      throw new Error(`Failed to create profile: ${response.status}`)
    }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const value = {
    user,
    session,
    userProfile,
    loading,
    signUp,
    signIn,
    signOut,
    refreshProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}