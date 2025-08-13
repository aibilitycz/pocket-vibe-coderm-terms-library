-- Fix authentication setup
-- Run this script in Supabase SQL Editor

-- 1. Create user roles type (safe to run multiple times)
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'reader');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create user profiles table (safe to run multiple times)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  role user_role DEFAULT 'reader',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enable RLS on user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 4. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can read all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON user_profiles;

-- 5. Create user profiles policies
CREATE POLICY "Users can read all profiles" ON user_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert their own profile" ON user_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON user_profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Admins can update any profile" ON user_profiles FOR UPDATE TO authenticated USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 6. Create robust function to create user profile on signup
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Create user profile with error handling
    INSERT INTO public.user_profiles (id, email, role)
    VALUES (
        NEW.id, 
        NEW.email,
        CASE 
            WHEN NEW.email = 'ondrej.svec@aibility.cz' THEN 'admin'::user_role
            ELSE 'reader'::user_role
        END
    );
    RETURN NEW;
EXCEPTION
    WHEN others THEN
        -- Log error but don't fail user creation
        RAISE WARNING 'Failed to create user profile for %: %', NEW.email, SQLERRM;
        RETURN NEW;
END;
$$;

-- 7. Drop and recreate trigger for user profile creation
DROP TRIGGER IF EXISTS create_user_profile_trigger ON auth.users;
CREATE TRIGGER create_user_profile_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION create_user_profile();

-- 8. Test the function by checking if it exists
SELECT proname FROM pg_proc WHERE proname = 'create_user_profile';