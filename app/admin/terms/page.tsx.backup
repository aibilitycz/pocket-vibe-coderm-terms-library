'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { DatabaseService } from '@/lib/database'
import { CRUDService } from '@/lib/crud-service'
import { Term, CategoryInfo } from '@/types/term'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  Settings,
  ArrowLeft,
  Filter,
  MoreVertical
} from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'

export default function AdminTermsPage() {
  const { userProfile } = useAuth()
  const [terms, setTerms] = useState<Term[]>([])
  const [categories, setCategories] = useState<CategoryInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')

  // Check if user is admin
  if (userProfile?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Přístup zamítnut</h1>
          <p className="text-gray-600 mb-4">Nemáte oprávnění k přístupu do admin rozhraní.</p>
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zpět na hlavní stránku
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        const [termsData, categoriesData] = await Promise.all([
          DatabaseService.getTerms(),
          DatabaseService.getCategories(),
        ])
        setTerms(termsData)
        setCategories(categoriesData)
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleDeleteTerm = async (termId: string) => {
    if (!confirm('Opravdu chcete smazat tento termín?')) return

    try {
      await CRUDService.deleteTerm(termId)
      setTerms(prev => prev.filter(term => term.id !== termId))
    } catch (error) {
      console.error('Error deleting term:', error)
      alert('Chyba při mazání termínu')
    }
  }

  // Filter terms based on search and filters
  const filteredTerms = terms.filter(term => {
    const matchesSearch = searchQuery === '' || 
      term.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      term.czechName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      term.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || term.category === selectedCategory
    const matchesDifficulty = selectedDifficulty === 'all' || term.difficulty === selectedDifficulty

    return matchesSearch && matchesCategory && matchesDifficulty
  })

  const difficulties = [
    { id: 'all', name: 'Vše', emoji: '' },
    { id: '🌱', name: 'Začátečník', emoji: '🌱' },
    { id: '🚀', name: 'Pokročilý', emoji: '🚀' },
    { id: '🔥', name: 'Expert', emoji: '🔥' },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin h-8 w-8 border-2 border-gray-300 border-t-gray-900 rounded-full mx-auto"></div>
          <p className="text-gray-600">Načítám termíny...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white border rounded-lg p-6 space-y-6">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <Link href="/admin">
                  <Button variant="outline" size="sm">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Admin
                  </Button>
                </Link>
                <Settings className="w-6 h-6 text-gray-600" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                Správa termínů
              </h1>
              <p className="text-gray-600">
                Upravit existující termíny
              </p>
              <p className="text-sm text-gray-500">
                {filteredTerms.length} {filteredTerms.length === 1 ? 'termín' : filteredTerms.length < 5 ? 'termíny' : 'termínů'}
              </p>
            </div>
            <Link href="/admin/terms/new">
              <Button className="flex items-center">
                <Plus className="w-4 h-4 mr-2" />
                Nový termín
              </Button>
            </Link>
          </div>
          
          <Separator />
          
          {/* Search and Filters */}
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Hledat termín (např. API, frontend, databáze...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10"
              />
            </div>
            
            {/* Category Filters */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-900 flex items-center">
                <Filter className="w-4 h-4 mr-2" />
                Kategorie
              </h3>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCategory === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory('all')}
                  className="h-8"
                >
                  Vše
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className="h-8"
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Difficulty Filters */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-900">Úroveň obtížnosti</h3>
              <div className="flex flex-wrap gap-2">
                {difficulties.map((difficulty) => (
                  <Button
                    key={difficulty.id}
                    variant={selectedDifficulty === difficulty.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedDifficulty(difficulty.id)}
                    className="h-8"
                  >
                    {difficulty.emoji && <span className="mr-1">{difficulty.emoji}</span>}
                    {difficulty.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Terms List */}
        <div className="mt-8">
          {filteredTerms.length === 0 ? (
            <div className="text-center py-16 border rounded-lg bg-gray-50">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Žádné termíny nebyly nalezeny
              </h3>
              <p className="text-gray-600 max-w-md mx-auto mb-4">
                Zkuste změnit vyhledávací kritéria nebo upravit filtry pro zobrazení výsledků
              </p>
              <Link href="/admin/terms/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Přidat první termín
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTerms.map((term) => {
                const category = categories.find(c => c.id === term.category)
                return (
                  <div key={term.id} className="bg-white border rounded-lg p-6 hover:shadow-sm transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {term.term}
                          </h3>
                          <span className="text-gray-500">•</span>
                          <span className="text-gray-700 font-medium">
                            {term.czechName}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {term.difficulty}
                          </Badge>
                        </div>
                        
                        <p className="text-gray-600 mb-3 line-clamp-2">
                          {term.description}
                        </p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          {category && (
                            <span className="flex items-center">
                              <span className="mr-1">{category.name}</span>
                            </span>
                          )}
                          {term.tags.length > 0 && (
                            <span>
                              {term.tags.slice(0, 3).join(', ')}
                              {term.tags.length > 3 && '...'}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <Link href={`/admin/terms/${term.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Link href={`/admin/terms/${term.id}/edit`}>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteTerm(term.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}