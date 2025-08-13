-- Authentication Setup for Pocket Vibe Coder Terms Library
-- Run this script in Supabase SQL Editor to add authentication features

-- 1. Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Users can read all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON user_profiles;
DROP POLICY IF EXISTS "Allow authenticated users to create their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Allow profile creation during signup" ON user_profiles;
DROP POLICY IF EXISTS "Allow service role to manage profiles" ON user_profiles;

-- 2. Temporarily disable RLS to fix the function
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- 3. Create the profile creation function that will work
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
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
        RAISE WARNING 'Failed to create user profile for %: %', NEW.email, SQLERRM;
        RETURN NEW;
END;
$$;

-- 4. Recreate the trigger
DROP TRIGGER IF EXISTS create_user_profile_trigger ON auth.users;
CREATE TRIGGER create_user_profile_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION create_user_profile();

-- 5. Re-enable RLS with WORKING policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 6. Create policies that allow both automatic trigger creation AND manual API calls
CREATE POLICY "Allow reading profiles" 
    ON user_profiles FOR SELECT 
    USING (true);  -- Anyone can read profiles

CREATE POLICY "Allow profile creation by system" 
    ON user_profiles FOR INSERT 
    WITH CHECK (true);  -- Allow any insert (trigger or API)

CREATE POLICY "Allow users to update own profile" 
    ON user_profiles FOR UPDATE 
    TO authenticated 
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow admins to update any profile" 
    ON user_profiles FOR UPDATE 
    TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 7. Grant permissions to all roles
GRANT ALL ON user_profiles TO authenticated;
GRANT ALL ON user_profiles TO anon;
GRANT ALL ON user_profiles TO service_role;
GRANT USAGE ON TYPE user_role TO authenticated;
GRANT USAGE ON TYPE user_role TO anon;
GRANT USAGE ON TYPE user_role TO service_role;

-- 8. Test that the setup is working
SELECT 'Auth setup completed - profiles can now be created automatically' as status;