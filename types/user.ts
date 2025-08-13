export type UserRole = 'admin' | 'reader'

export interface UserProfile {
  id: string
  email: string
  role: UserRole
  created_at: string
  updated_at: string
}