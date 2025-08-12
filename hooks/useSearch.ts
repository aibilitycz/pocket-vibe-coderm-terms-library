import { useState, useMemo } from 'react';
import Fuse from 'fuse.js';
import { Term, Category } from '@/types/term';

export function useSearch(terms: Term[]) {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'🌱' | '🚀' | 'all'>('all');

  const fuse = useMemo(() => {
    const options = {
      keys: [
        { name: 'term', weight: 0.3 },
        { name: 'czechName', weight: 0.3 },
        { name: 'description', weight: 0.2 },
        { name: 'tags', weight: 0.1 },
        { name: 'practicalExample', weight: 0.1 },
      ],
      threshold: 0.3,
      includeScore: true,
    };
    return new Fuse(terms, options);
  }, [terms]);

  const filteredTerms = useMemo(() => {
    let results = terms;

    // Filter by category
    if (selectedCategory !== 'all') {
      results = results.filter(term => term.category === selectedCategory);
    }

    // Filter by difficulty
    if (selectedDifficulty !== 'all') {
      results = results.filter(term => term.difficulty === selectedDifficulty);
    }

    // Search by query
    if (query.trim()) {
      const searchResults = fuse.search(query);
      const searchedTerms = searchResults.map(result => result.item);
      
      // Keep only terms that also match category/difficulty filters
      results = results.filter(term => 
        searchedTerms.some(searchedTerm => searchedTerm.id === term.id)
      );
    }

    return results;
  }, [terms, query, selectedCategory, selectedDifficulty, fuse]);

  return {
    query,
    setQuery,
    selectedCategory,
    setSelectedCategory,
    selectedDifficulty,
    setSelectedDifficulty,
    filteredTerms,
  };
}