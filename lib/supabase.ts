import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side Supabase client (legacy - keeping for existing code)
export const supabase = createClient(supabaseUrl, supabaseKey)

// Browser client for client components
export const createBrowserSupabaseClient = () => {
  return createBrowserClient(supabaseUrl, supabaseKey)
}