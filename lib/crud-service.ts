import { Term, CategoryInfo } from '@/types/term'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Helper function to get auth token
const getAuthToken = async (): Promise<string> => {
  try {
    // Get token from Supabase client
    const { createBrowserClient } = await import('@supabase/ssr')
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    const { data } = await supabase.auth.getSession()
    if (data.session?.access_token) {
      return data.session.access_token
    }
  } catch (error) {
    // Fallback to anon key
  }
  return supabaseKey
}

// Helper function for authenticated requests
const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}) => {
  const authToken = await getAuthToken()
  
  return fetch(url, {
    ...options,
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
}

export class CRUDService {
  // Terms CRUD operations
  static async createTerm(term: Omit<Term, 'id'>): Promise<Term> {
    const response = await makeAuthenticatedRequest(`${supabaseUrl}/rest/v1/terms`, {
      method: 'POST',
      body: JSON.stringify({
        term: term.term,
        czech_name: term.czechName,
        description: term.description,
        practical_example: term.practicalExample,
        related_terms: term.relatedTerms,
        difficulty: term.difficulty === '🌱' ? 'beginner' : term.difficulty === '🚀' ? 'intermediate' : 'advanced',
        category: term.category,
        ai_tip: term.aiTip,
        tags: term.tags,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to create term: ${error}`)
    }

    const data = await response.json()
    return {
      id: data.id,
      term: data.term,
      czechName: data.czech_name,
      description: data.description,
      practicalExample: data.practical_example,
      relatedTerms: data.related_terms,
      difficulty: data.difficulty === 'beginner' ? '🌱' : data.difficulty === 'intermediate' ? '🚀' : '🔥',
      category: data.category,
      aiTip: data.ai_tip,
      tags: data.tags,
    }
  }

  static async updateTerm(id: string, updates: Partial<Term>): Promise<Term> {
    const updateData: Record<string, unknown> = {}
    
    if (updates.term !== undefined) updateData.term = updates.term
    if (updates.czechName !== undefined) updateData.czech_name = updates.czechName
    if (updates.description !== undefined) updateData.description = updates.description
    if (updates.practicalExample !== undefined) updateData.practical_example = updates.practicalExample
    if (updates.relatedTerms !== undefined) updateData.related_terms = updates.relatedTerms
    if (updates.difficulty !== undefined) {
      updateData.difficulty = updates.difficulty === '🌱' ? 'beginner' : updates.difficulty === '🚀' ? 'intermediate' : 'advanced'
    }
    if (updates.category !== undefined) updateData.category = updates.category
    if (updates.aiTip !== undefined) updateData.ai_tip = updates.aiTip
    if (updates.tags !== undefined) updateData.tags = updates.tags

    const response = await makeAuthenticatedRequest(`${supabaseUrl}/rest/v1/terms?id=eq.${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to update term: ${error}`)
    }

    // Fetch the updated term
    const getResponse = await makeAuthenticatedRequest(`${supabaseUrl}/rest/v1/terms?id=eq.${id}`)
    const data = await getResponse.json()
    
    return {
      id: data[0].id,
      term: data[0].term,
      czechName: data[0].czech_name,
      description: data[0].description,
      practicalExample: data[0].practical_example,
      relatedTerms: data[0].related_terms,
      difficulty: data[0].difficulty === 'beginner' ? '🌱' : data[0].difficulty === 'intermediate' ? '🚀' : '🔥',
      category: data[0].category,
      aiTip: data[0].ai_tip,
      tags: data[0].tags,
    }
  }

  static async deleteTerm(id: string): Promise<void> {
    const response = await makeAuthenticatedRequest(`${supabaseUrl}/rest/v1/terms?id=eq.${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to delete term: ${error}`)
    }
  }

  // Categories CRUD operations
  static async createCategory(category: Omit<CategoryInfo, 'id'>): Promise<CategoryInfo> {
    const response = await makeAuthenticatedRequest(`${supabaseUrl}/rest/v1/categories`, {
      method: 'POST',
      body: JSON.stringify(category),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to create category: ${error}`)
    }

    return await response.json()
  }

  static async updateCategory(id: string, updates: Partial<CategoryInfo>): Promise<CategoryInfo> {
    const response = await makeAuthenticatedRequest(`${supabaseUrl}/rest/v1/categories?id=eq.${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to update category: ${error}`)
    }

    // Fetch the updated category
    const getResponse = await makeAuthenticatedRequest(`${supabaseUrl}/rest/v1/categories?id=eq.${id}`)
    const data = await getResponse.json()
    return data[0]
  }

  static async deleteCategory(id: string): Promise<void> {
    const response = await makeAuthenticatedRequest(`${supabaseUrl}/rest/v1/categories?id=eq.${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to delete category: ${error}`)
    }
  }
}