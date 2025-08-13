export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      terms: {
        Row: {
          id: string
          term: string
          czech_name: string
          description: string
          practical_example: string
          related_terms: string[]
          difficulty: string
          category: string
          ai_tip: string | null
          tags: string[]
          learn_more: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          term: string
          czech_name: string
          description: string
          practical_example: string
          related_terms: string[]
          difficulty: string
          category: string
          ai_tip?: string | null
          tags: string[]
          learn_more?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          term?: string
          czech_name?: string
          description?: string
          practical_example?: string
          related_terms?: string[]
          difficulty?: string
          category?: string
          ai_tip?: string | null
          tags?: string[]
          learn_more?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          description: string
          icon: string
          color: string
          created_at: string
        }
        Insert: {
          id: string
          name: string
          description: string
          icon: string
          color: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          icon?: string
          color?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}