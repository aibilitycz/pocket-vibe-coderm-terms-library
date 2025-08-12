export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export type Category = 
  | 'vibe-coding'
  | 'architecture' 
  | 'security'
  | 'performance'
  | 'tools'
  | 'data';

export interface Term {
  id: string;
  term: string; // anglický termín
  czechName: string; // český název/překlad
  description: string; // jednoduché vysvětlení (2-3 věty)
  practicalExample: string; // praktický příklad z Vibe Coding
  relatedTerms: string[]; // ID souvisejících termínů
  difficulty: Difficulty;
  category: Category;
  aiTip?: string; // jak o tom mluvit s AI
  tags: string[]; // pro lepší vyhledávání
}

export interface CategoryInfo {
  id: Category;
  name: string;
  description: string;
  icon: string;
  color: string;
}