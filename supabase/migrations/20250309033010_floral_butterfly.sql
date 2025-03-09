/*
  # Create roles and user profiles tables

  1. New Tables
    - `roles`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `created_at` (timestamp)
    
    - `user_profiles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `role_id` (uuid, references roles)
      - `assigned_collector_id` (uuid, references user_profiles, nullable)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
*/

-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  role_id uuid REFERENCES roles NOT NULL,
  assigned_collector_id uuid REFERENCES user_profiles(id),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policies for roles table
CREATE POLICY "Allow read access to authenticated users for roles"
  ON roles
  FOR SELECT
  TO authenticated
  USING (true);

-- Policies for user_profiles table
CREATE POLICY "Users can read their own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admin can read all profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      INNER JOIN roles r ON r.id = up.role_id
      WHERE up.user_id = auth.uid() AND r.name = 'Admin'
    )
  );

-- Insert default roles
INSERT INTO roles (name) VALUES
  ('Admin'),
  ('Collector'),
  ('RetailUser')
ON CONFLICT (name) DO NOTHING;