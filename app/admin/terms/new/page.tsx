'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { DatabaseService } from '@/lib/database'
import { CRUDService } from '@/lib/crud-service'
import { Term, CategoryInfo } from '@/types/term'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  ArrowLeft,
  Save,
  Plus,
  X,
  AlertCircle,
  Settings
} from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'

export default function NewTermPage() {
  // ALL HOOKS FIRST
  const { userProfile } = useAuth()
  const router = useRouter()
  const [categories, setCategories] = useState<CategoryInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    term: '',
    czechName: '',
    description: '',
    practicalExample: '',
    relatedTerms: [] as string[],
    difficulty: '🌱' as Term['difficulty'],
    category: '' as string,
    aiTip: '',
    tags: [] as string[]
  })
  const [newTag, setNewTag] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await DatabaseService.getCategories()
        setCategories(categoriesData)
        if (categoriesData.length > 0 && !formData.category) {
          setFormData(prev => ({ ...prev, category: categoriesData[0].id }))
        }
      } catch (error) {
        console.error('Error loading categories:', error)
      }
    }

    loadCategories()
  }, [formData.category])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.term.trim()) {
      newErrors.term = 'Anglický termín je povinný'
    }
    if (!formData.czechName.trim()) {
      newErrors.czechName = 'Český název je povinný'
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Popis je povinný'
    }
    if (!formData.practicalExample.trim()) {
      newErrors.practicalExample = 'Praktický příklad je povinný'
    }
    if (!formData.category) {
      newErrors.category = 'Kategorie je povinná'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      await CRUDService.createTerm({
        term: formData.term.trim(),
        czechName: formData.czechName.trim(),
        description: formData.description.trim(),
        practicalExample: formData.practicalExample.trim(),
        relatedTerms: formData.relatedTerms,
        difficulty: formData.difficulty,
        category: formData.category as Term['category'],
        aiTip: formData.aiTip.trim(),
        tags: formData.tags
      })

      router.push('/admin/terms')
    } catch (error) {
      console.error('Error creating term:', error)
      alert('Chyba při vytváření termínu')
    } finally {
      setLoading(false)
    }
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const difficulties = [
    { id: '🌱' as const, name: 'Začátečník', emoji: '🌱' },
    { id: '🚀' as const, name: 'Pokročilý', emoji: '🚀' },
    { id: '🔥' as const, name: 'Expert', emoji: '🔥' },
  ]

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
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                Nový termín
              </h1>
              <p className="text-gray-600">
                Přidat nový termín do slovníku
              </p>
            </div>
          </div>
          
          <Separator />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="bg-white border rounded-lg p-6 space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Základní informace</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900">
                    Anglický termín *
                  </label>
                  <Input
                    value={formData.term}
                    onChange={(e) => setFormData(prev => ({ ...prev, term: e.target.value }))}
                    placeholder="např. API"
                    className={errors.term ? 'border-red-500' : ''}
                  />
                  {errors.term && (
                    <p className="text-red-600 text-sm flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.term}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900">
                    Český název *
                  </label>
                  <Input
                    value={formData.czechName}
                    onChange={(e) => setFormData(prev => ({ ...prev, czechName: e.target.value }))}
                    placeholder="např. Aplikační programové rozhraní"
                    className={errors.czechName ? 'border-red-500' : ''}
                  />
                  {errors.czechName && (
                    <p className="text-red-600 text-sm flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.czechName}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">
                  Popis *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Podrobný popis termínu..."
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.description && (
                  <p className="text-red-600 text-sm flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.description}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">
                  Praktický příklad *
                </label>
                <textarea
                  value={formData.practicalExample}
                  onChange={(e) => setFormData(prev => ({ ...prev, practicalExample: e.target.value }))}
                  placeholder="Praktický příklad použití..."
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.practicalExample ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.practicalExample && (
                  <p className="text-red-600 text-sm flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.practicalExample}
                  </p>
                )}
              </div>
            </div>

            <Separator />

            {/* Category and Difficulty */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Kategorizace</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900">
                    Kategorie *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.category ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Vyberte kategorii</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="text-red-600 text-sm flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.category}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900">
                    Úroveň obtížnosti
                  </label>
                  <div className="flex gap-2">
                    {difficulties.map(difficulty => (
                      <Button
                        key={difficulty.id}
                        type="button"
                        variant={formData.difficulty === difficulty.id ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFormData(prev => ({ ...prev, difficulty: difficulty.id }))}
                        className="flex items-center"
                      >
                        <span className="mr-1">{difficulty.emoji}</span>
                        {difficulty.name}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Tags */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Štítky</h2>
              
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Přidat štítek"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag} variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTag(tag)}
                        className="h-auto p-0 w-4 h-4 hover:bg-transparent"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            {/* AI Tip */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">AI Tip (volitelný)</h2>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">
                  Tip pro práci s AI
                </label>
                <textarea
                  value={formData.aiTip}
                  onChange={(e) => setFormData(prev => ({ ...prev, aiTip: e.target.value }))}
                  placeholder="Tip jak používat tento termín s AI nástroji..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <Link href="/admin/terms">
              <Button variant="outline" disabled={loading}>
                Zrušit
              </Button>
            </Link>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {loading ? 'Ukládám...' : 'Vytvořit termín'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}