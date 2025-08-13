'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Category, Difficulty } from '@/types/term';
import { Search, X, Zap, Building, Shield, Gauge, Wrench, Database } from 'lucide-react';
import UserMenu from '@/components/UserMenu';

interface SearchFiltersProps {
  query: string;
  setQuery: (query: string) => void;
  selectedCategory: Category | 'all';
  setSelectedCategory: (category: Category | 'all') => void;
  selectedDifficulty: Difficulty | 'all';
  setSelectedDifficulty: (difficulty: Difficulty | 'all') => void;
  categories: Array<{id: Category, name: string, icon: string, color: string}>;
  resultsCount: number;
}

const iconMap = {
  zap: Zap,
  building: Building,
  shield: Shield,
  gauge: Gauge,
  wrench: Wrench,
  database: Database,
};

export function SearchFilters({
  query,
  setQuery,
  selectedCategory,
  setSelectedCategory,
  selectedDifficulty,
  setSelectedDifficulty,
  categories,
  resultsCount,
}: SearchFiltersProps) {
  const difficulties = [
    { id: 'all' as const, name: 'Vše' },
    { id: '🌱' as const, name: 'Začátečník' },
    { id: '🚀' as const, name: 'Pokročilý' },
    { id: '🔥' as const, name: 'Expert' },
  ];

  return (
    <div className="bg-white border rounded-lg p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Pocket Vibe Coder Terms Library
          </h1>
          <p className="text-gray-600">
            Terminologický slovník pro Vibe Coding Summer
          </p>
          <p className="text-sm text-gray-500">
            {resultsCount} {resultsCount === 1 ? 'termín' : resultsCount < 5 ? 'termíny' : 'termínů'}
          </p>
        </div>
        <div className="flex-shrink-0">
          <UserMenu />
        </div>
      </div>
      
      <Separator />
      
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Hledat termín (např. API, frontend, databáze...)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 h-10"
        />
      </div>
      
      {/* Category Filters */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-900">Kategorie</h3>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('all')}
            className="h-8"
          >
            Vše
          </Button>
          {categories.map((category) => {
            const IconComponent = iconMap[category.icon as keyof typeof iconMap];
            return (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="h-8"
              >
                {IconComponent && <IconComponent className="w-3 h-3 mr-1" />}
                {category.name}
              </Button>
            );
          })}
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
              {difficulty.name}
            </Button>
          ))}
        </div>
      </div>
      
      {/* Active Filters */}
      {(selectedCategory !== 'all' || selectedDifficulty !== 'all' || query) && (
        <>
          <Separator />
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-900">Aktivní filtry</h3>
            <div className="flex flex-wrap gap-2">
              {query && (
                <Badge 
                  variant="secondary" 
                  className="cursor-pointer hover:bg-gray-200 transition-colors" 
                  onClick={() => setQuery('')}
                >
                  Hledání: &quot;{query}&quot; <X className="w-3 h-3 ml-1" />
                </Badge>
              )}
              {selectedCategory !== 'all' && (
                <Badge 
                  variant="secondary" 
                  className="cursor-pointer hover:bg-gray-200 transition-colors" 
                  onClick={() => setSelectedCategory('all')}
                >
                  {categories.find(c => c.id === selectedCategory)?.name} <X className="w-3 h-3 ml-1" />
                </Badge>
              )}
              {selectedDifficulty !== 'all' && (
                <Badge 
                  variant="secondary" 
                  className="cursor-pointer hover:bg-gray-200 transition-colors" 
                  onClick={() => setSelectedDifficulty('all')}
                >
                  {difficulties.find(d => d.id === selectedDifficulty)?.name} <X className="w-3 h-3 ml-1" />
                </Badge>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}