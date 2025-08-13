import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'
import { config } from 'dotenv'

// Load environment variables from .env.local
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function migrateData() {
  try {
    // Load existing data
    const categoriesPath = join(process.cwd(), 'data', 'categories.json')
    const termsPath = join(process.cwd(), 'data', 'terms.json')
    
    const categoriesData = JSON.parse(readFileSync(categoriesPath, 'utf8'))
    const termsData = JSON.parse(readFileSync(termsPath, 'utf8'))

    console.log('Starting data migration...')

    // Insert categories
    console.log('Inserting categories...')
    const { error: categoriesError } = await supabase
      .from('categories')
      .upsert(categoriesData)

    if (categoriesError) {
      console.error('Error inserting categories:', categoriesError)
      return
    }

    console.log(`Successfully inserted ${categoriesData.length} categories`)

    // Transform and insert terms
    console.log('Inserting terms...')
    
    // Map emoji difficulties to database string values  
    const difficultyMap: { [key: string]: string } = {
      '🌱': 'beginner',
      '🚀': 'intermediate',
      '🔥': 'advanced',
      'beginner': 'beginner', // Keep existing strings
      'intermediate': 'intermediate',
      'advanced': 'advanced'
    }
    
    const transformedTerms = termsData.map((term: any) => ({
      id: term.id,
      term: term.term,
      czech_name: term.czechName,
      description: term.description,
      practical_example: term.practicalExample,
      related_terms: term.relatedTerms || [],
      difficulty: difficultyMap[term.difficulty] || 'beginner', // Default to beginner string
      category: term.category,
      ai_tip: term.aiTip || null,
      tags: term.tags || [],
      learn_more: term.learnMore || null
    }))

    const { error: termsError } = await supabase
      .from('terms')
      .upsert(transformedTerms)

    if (termsError) {
      console.error('Error inserting terms:', termsError)
      return
    }

    console.log(`Successfully inserted ${transformedTerms.length} terms`)
    console.log('Data migration completed successfully!')

  } catch (error) {
    console.error('Migration failed:', error)
  }
}

migrateData()