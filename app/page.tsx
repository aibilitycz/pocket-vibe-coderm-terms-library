'use client';

import { useState, useEffect } from 'react';
import { Term, CategoryInfo } from '@/types/term';
import { TermCard } from '@/components/TermCard';
import { SearchFilters } from '@/components/SearchFilters';
import { useSearch } from '@/hooks/useSearch';
import { Search } from 'lucide-react';

export default function Home() {
  const [terms, setTerms] = useState<Term[]>([]);
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [termsResponse, categoriesResponse] = await Promise.all([
          fetch('/data/terms.json'),
          fetch('/data/categories.json'),
        ]);
        
        const termsData = await termsResponse.json();
        const categoriesData = await categoriesResponse.json();
        
        setTerms(termsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const {
    query,
    setQuery,
    selectedCategory,
    setSelectedCategory,
    selectedDifficulty,
    setSelectedDifficulty,
    filteredTerms,
  } = useSearch(terms);

  const getRelatedTerms = (term: Term): Term[] => {
    return term.relatedTerms
      .map(relatedId => terms.find(t => t.id === relatedId))
      .filter((t): t is Term => t !== undefined);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin h-8 w-8 border-2 border-gray-300 border-t-gray-900 rounded-full mx-auto"></div>
          <p className="text-gray-600">Načítám terminologický slovník...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <SearchFilters
          query={query}
          setQuery={setQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedDifficulty={selectedDifficulty}
          setSelectedDifficulty={setSelectedDifficulty}
          categories={categories}
          resultsCount={filteredTerms.length}
        />
        
        <div className="mt-8">
          {filteredTerms.length === 0 ? (
            <div className="text-center py-16 border rounded-lg bg-gray-50">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Žádné termíny nebyly nalezeny
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Zkuste změnit vyhledávací kritéria nebo upravit filtry pro zobrazení výsledků
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredTerms.map((term) => (
                <TermCard
                  key={term.id}
                  term={term}
                  relatedTerms={getRelatedTerms(term)}
                />
              ))}
            </div>
          )}
        </div>
        
        <footer className="mt-16 pt-8 border-t text-center text-gray-500 text-sm">
          <p>
            Vytvořeno pro{' '}
            <a 
              href="https://aibility.cz/vibecodingsummer/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-900 hover:text-gray-700 underline font-medium"
            >
              Vibe Coding Summer 2025
            </a>
            {' '}• Aibility
          </p>
        </footer>
      </div>
    </div>
  );
}
