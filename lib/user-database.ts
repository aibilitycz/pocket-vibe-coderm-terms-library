import { supabase } from './supabase'
import type { UserProfile, UserRole } from '@/types/user'

export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) {
    console.error('Error fetching user profile:', error)
    return null
  }

  return data
}

export async function getAllUserProfiles(): Promise<UserProfile[]> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching user profiles:', error)
    return []
  }

  return data || []
}

export async function updateUserRole(userId: string, newRole: UserRole): Promise<boolean> {
  const { error } = await supabase
    .from('user_profiles')
    .update({ role: newRole })
    .eq('id', userId)

  if (error) {
    console.error('Error updating user role:', error)
    return false
  }

  return true
}

export async function isCurrentUserAdmin(): Promise<boolean> {
  const profile = await getCurrentUserProfile()
  return profile?.role === 'admin'
}

export async function createUserProfile(userId: string, email: string): Promise<boolean> {
  const adminEmail = process.env.ADMIN_EMAIL
  const role: UserRole = email === adminEmail ? 'admin' : 'reader'
  
  const { error } = await supabase
    .from('user_profiles')
    .insert({
      id: userId,
      email,
      role
    })

  if (error) {
    console.error('Error creating user profile:', error)
    return false
  }

  return true
}