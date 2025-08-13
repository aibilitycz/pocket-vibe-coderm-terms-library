-- Create user roles type
CREATE TYPE user_role AS ENUM ('admin', 'reader');

-- Create user profiles table
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  role user_role DEFAULT 'reader',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE terms ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can read all profiles" ON user_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert their own profile" ON user_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON user_profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Admins can update any profile" ON user_profiles FOR UPDATE TO authenticated USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Allow public read access to all tables
CREATE POLICY "Allow public read access on categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow public read access on terms" ON terms FOR SELECT USING (true);

-- Allow admin users to insert/update/delete terms and categories
CREATE POLICY "Allow admin insert on categories" ON categories FOR INSERT TO authenticated WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);
CREATE POLICY "Allow admin insert on terms" ON terms FOR INSERT TO authenticated WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);
CREATE POLICY "Allow admin update on categories" ON categories FOR UPDATE TO authenticated USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);
CREATE POLICY "Allow admin update on terms" ON terms FOR UPDATE TO authenticated USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);
CREATE POLICY "Allow admin delete on categories" ON categories FOR DELETE TO authenticated USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);
CREATE POLICY "Allow admin delete on terms" ON terms FOR DELETE TO authenticated USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

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

-- Function to create user profile on signup
-- Note: Replace 'ADMIN_EMAIL_PLACEHOLDER' with actual admin email when setting up
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_profiles (id, email, role)
    VALUES (
        NEW.id, 
        NEW.email,
        CASE 
            WHEN NEW.email = 'ADMIN_EMAIL_PLACEHOLDER' THEN 'admin'::user_role
            ELSE 'reader'::user_role
        END
    );
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Trigger to create user profile on signup
CREATE TRIGGER create_user_profile_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION create_user_profile();