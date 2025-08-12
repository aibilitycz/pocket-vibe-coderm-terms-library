import { supabase } from './supabase'
import { Term, CategoryInfo } from '../types/term'

export class DatabaseService {
  static async getTerms(): Promise<Term[]> {
    const { data, error } = await supabase
      .from('terms')
      .select('*')
      .order('term')

    if (error) {
      console.error('Error fetching terms:', error)
      return []
    }

    return data.map(term => ({
      id: term.id,
      term: term.term,
      czechName: term.czech_name,
      description: term.description,
      practicalExample: term.practical_example,
      relatedTerms: term.related_terms,
      difficulty: term.difficulty as 'beginner' | 'intermediate' | 'advanced',
      category: term.category as Term['category'],
      aiTip: term.ai_tip,
      tags: term.tags
    }))
  }

  static async getCategories(): Promise<CategoryInfo[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name')

    if (error) {
      console.error('Error fetching categories:', error)
      return []
    }

    return data.map(category => ({
      id: category.id as CategoryInfo['id'],
      name: category.name,
      description: category.description,
      icon: category.icon,
      color: category.color
    }))
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

    return data.map(term => ({
      id: term.id,
      term: term.term,
      czechName: term.czech_name,
      description: term.description,
      practicalExample: term.practical_example,
      relatedTerms: term.related_terms,
      difficulty: term.difficulty as 'beginner' | 'intermediate' | 'advanced',
      category: term.category as Term['category'],
      aiTip: term.ai_tip,
      tags: term.tags
    }))
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

    return data.map(term => ({
      id: term.id,
      term: term.term,
      czechName: term.czech_name,
      description: term.description,
      practicalExample: term.practical_example,
      relatedTerms: term.related_terms,
      difficulty: term.difficulty as 'beginner' | 'intermediate' | 'advanced',
      category: term.category as Term['category'],
      aiTip: term.ai_tip,
      tags: term.tags
    }))
  }

  static async getTermById(id: string): Promise<Term | null> {
    const { data, error } = await supabase
      .from('terms')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching term by id:', error)
      return null
    }

    return {
      id: data.id,
      term: data.term,
      czechName: data.czech_name,
      description: data.description,
      practicalExample: data.practical_example,
      relatedTerms: data.related_terms,
      difficulty: data.difficulty as '🌱' | '🚀',
      category: data.category as Term['category'],
      aiTip: data.ai_tip,
      tags: data.tags
    }
  }
}