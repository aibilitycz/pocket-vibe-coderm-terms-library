import { createClient } from '@supabase/supabase-js'
import { Term, CategoryInfo } from '../types/term'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Simple supabase client for database operations
const supabase = createClient(supabaseUrl, supabaseKey)

// Helper function to map database difficulty strings to emoji difficulties
const mapDifficultyToEmoji = (difficulty: string): '🌱' | '🚀' | '🔥' => {
  const difficultyMap: { [key: string]: '🌱' | '🚀' | '🔥' } = {
    'beginner': '🌱',
    'intermediate': '🚀',
    'advanced': '🔥'
  }
  return difficultyMap[difficulty] || '🌱'
}

// Helper function to transform database term to frontend term
const transformTerm = (dbTerm: Record<string, unknown>): Term => ({
  id: dbTerm.id,
  term: dbTerm.term,
  czechName: dbTerm.czech_name,
  description: dbTerm.description,
  practicalExample: dbTerm.practical_example,
  relatedTerms: dbTerm.related_terms,
  difficulty: mapDifficultyToEmoji(dbTerm.difficulty),
  category: dbTerm.category as Term['category'],
  aiTip: dbTerm.ai_tip,
  tags: dbTerm.tags
})

export class DatabaseService {
  static async testConnection(): Promise<boolean> {
    try {
      const directUrl = `${supabaseUrl}/rest/v1/terms?select=id&limit=1`
      
      const response = await fetch(directUrl, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      })
      
      return response.ok
    } catch (err) {
      return false
    }
  }

  static async getTerms(): Promise<Term[]> {
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/terms?select=*&order=term`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        return []
      }

      const data = await response.json()
      return data.map(transformTerm)
    } catch (err) {
      return []
    }
  }

  static async getCategories(): Promise<CategoryInfo[]> {
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/categories?select=*&order=name`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        return []
      }

      const data = await response.json()
      return data.map((category: Record<string, unknown>) => ({
        id: category.id as CategoryInfo['id'],
        name: category.name,
        description: category.description,
        icon: category.icon,
        color: category.color
      }))
    } catch (err) {
      return []
    }
  }

  static async searchTerms(query: string): Promise<Term[]> {
    const { data, error } = await supabase
      .from('terms')
      .select('*')
      .or(`term.ilike.%${query}%,czech_name.ilike.%${query}%,description.ilike.%${query}%`)
      .order('term')

    if (error) {
      console.error('Error searching terms:', error)
      return []
    }

    return data.map(transformTerm)
  }

  static async getTermsByCategory(category: string): Promise<Term[]> {
    const { data, error } = await supabase
      .from('terms')
      .select('*')
      .eq('category', category)
      .order('term')

    if (error) {
      console.error('Error fetching terms by category:', error)
      return []
    }

    return data.map(transformTerm)
  }

  static async getTermById(id: string): Promise<Term | null> {
    // First try to get by ID
    let { data, error } = await supabase
      .from('terms')
      .select('*')
      .eq('id', id)
      .single()

    // If not found by ID, try to get by term name (for user-friendly URLs)
    if (error && error.code === 'PGRST116') {
      const result = await supabase
        .from('terms')
        .select('*')
        .eq('term', id)
        .single()
      data = result.data
      error = result.error
    }

    if (error) {
      console.error('Error fetching term:', error)
      return null
    }

    if (!data) {
      return null
    }

    return transformTerm(data)
  }
}