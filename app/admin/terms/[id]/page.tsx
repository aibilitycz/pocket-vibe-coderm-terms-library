'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { DatabaseService } from '@/lib/database'
import { CRUDService } from '@/lib/crud-service'
import { Term, CategoryInfo } from '@/types/term'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  ArrowLeft,
  Edit,
  Trash2,
  Settings,
  Eye,
  AlertCircle,
  Hash,
  BookOpen
} from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'

export default function ViewTermPage() {
  // ALL HOOKS FIRST
  const { userProfile } = useAuth()
  const params = useParams()
  const router = useRouter()
  const termId = params?.id as string
  
  const [term, setTerm] = useState<Term | null>(null)
  const [category, setCategory] = useState<CategoryInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadTerm = async () => {
      if (!termId) return
      
      try {
        setLoading(true)
        const [termData, categoriesData] = await Promise.all([
          DatabaseService.getTermById(termId),
          DatabaseService.getCategories()
        ])

        if (!termData) {
          setError('Termín nebyl nalezen')
          return
        }

        setTerm(termData)
        
        const termCategory = categoriesData.find(c => c.id === termData.category)
        setCategory(termCategory || null)
      } catch (err) {
        console.error('Error loading term:', err)
        setError('Chyba při načítání termínu')
      } finally {
        setLoading(false)
      }
    }

    loadTerm()
  }, [termId])

  const handleDelete = async () => {
    if (!term) return
    
    if (!confirm(`Opravdu chcete smazat termín "${term.term}"?`)) return

    try {
      await CRUDService.deleteTerm(term.id)
      router.push('/admin/terms')
    } catch (error) {
      console.error('Error deleting term:', error)
      alert('Chyba při mazání termínu')
    }
  }

  const difficultyLabels = {
    '🌱': 'Začátečník',
    '🚀': 'Pokročilý', 
    '🔥': 'Expert'
  }

  // CONDITIONAL RETURNS AFTER HOOKS
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin h-8 w-8 border-2 border-gray-300 border-t-gray-900 rounded-full mx-auto"></div>
          <p className="text-gray-600">Načítám termín...</p>
        </div>
      </div>
    )
  }

  if (error || !term) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Chyba</h1>
          <p className="text-gray-600 mb-4">{error || 'Termín nebyl nalezen'}</p>
          <Link href="/admin/terms">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zpět na seznam
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white border rounded-lg p-6 space-y-6">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <Link href="/admin/terms">
                  <Button variant="outline" size="sm">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Správa termínů
                  </Button>
                </Link>
                <Settings className="w-6 h-6 text-gray-600" />
              </div>
              <div className="flex items-center space-x-3">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                  {term.term}
                </h1>
                <Badge variant="secondary" className="text-sm">
                  {difficultyLabels[term.difficulty]}
                </Badge>
              </div>
              <p className="text-xl text-gray-700 font-medium">
                {term.czechName}
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Link href={`/admin/terms/${term.id}/edit`}>
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4 mr-2" />
                  Upravit
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleDelete}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Smazat
              </Button>
            </div>
          </div>
          
          <Separator />
        </div>

        {/* Term Content */}
        <div className="mt-8 space-y-6">
          {/* Basic Information */}
          <div className="bg-white border rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <BookOpen className="w-5 h-5 mr-2" />
              Popis
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {term.description}
            </p>
          </div>

          {/* Practical Example */}
          <div className="bg-white border rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Praktický příklad</h2>
            <p className="text-gray-700 leading-relaxed">
              {term.practicalExample}
            </p>
          </div>

          {/* AI Tip */}
          {term.aiTip && (
            <div className="bg-white border rounded-lg p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">AI Tip</h2>
              <p className="text-gray-700 leading-relaxed">
                {term.aiTip}
              </p>
            </div>
          )}

          {/* Metadata */}
          <div className="bg-white border rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Metadata</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-500">Kategorie</h3>
                <p className="text-gray-900">
                  {category ? category.name : term.category}
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-500">Obtížnost</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-900">{difficultyLabels[term.difficulty]}</span>
                </div>
              </div>

              {term.tags.length > 0 && (
                <div className="space-y-2 md:col-span-2">
                  <h3 className="text-sm font-medium text-gray-500 flex items-center">
                    <Hash className="w-4 h-4 mr-1" />
                    Štítky
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {term.tags.map(tag => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-500">ID</h3>
                <p className="text-gray-600 font-mono text-sm">
                  {term.id}
                </p>
              </div>
            </div>
          </div>

          {/* Related Terms */}
          {term.relatedTerms.length > 0 && (
            <div className="bg-white border rounded-lg p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Související termíny</h2>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">ID souvisejících termínů:</p>
                <div className="flex flex-wrap gap-2">
                  {term.relatedTerms.map(relatedId => (
                    <Badge key={relatedId} variant="outline" className="font-mono text-xs">
                      {relatedId}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <Link href="/" target="_blank">
              <Button variant="outline">
                <Eye className="w-4 h-4 mr-2" />
                Zobrazit na webu
              </Button>
            </Link>
            <Link href={`/admin/terms/${term.id}/edit`}>
              <Button>
                <Edit className="w-4 h-4 mr-2" />
                Upravit termín
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}