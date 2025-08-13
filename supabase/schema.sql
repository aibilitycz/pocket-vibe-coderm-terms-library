-- Create categories table
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create terms table
CREATE TABLE terms (
  id TEXT PRIMARY KEY,
  term TEXT NOT NULL,
  czech_name TEXT NOT NULL,
  description TEXT NOT NULL,
  practical_example TEXT NOT NULL,
  related_terms TEXT[] DEFAULT '{}',
  difficulty TEXT NOT NULL CHECK (difficulty IN ('🌱', '🚀')),
  category TEXT NOT NULL REFERENCES categories(id),
  ai_tip TEXT,
  tags TEXT[] DEFAULT '{}',
  learn_more TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_terms_category ON terms(category);
CREATE INDEX idx_terms_difficulty ON terms(difficulty);
CREATE INDEX idx_terms_tags ON terms USING GIN(tags);
CREATE INDEX idx_terms_term_search ON terms USING GIN(to_tsvector('english', term || ' ' || czech_name || ' ' || description));

-- Create RLS policies (Row Level Security)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE terms ENABLE ROW LEVEL SECURITY;

-- Allow public read access to all tables
CREATE POLICY "Allow public read access on categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow public read access on terms" ON terms FOR SELECT USING (true);

-- Allow authenticated users to insert/update/delete
CREATE POLICY "Allow authenticated insert on categories" ON categories FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated insert on terms" ON terms FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update on categories" ON categories FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated update on terms" ON terms FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated delete on categories" ON categories FOR DELETE TO authenticated USING (true);
CREATE POLICY "Allow authenticated delete on terms" ON terms FOR DELETE TO authenticated USING (true);

-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_terms_updated_at BEFORE UPDATE ON terms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();