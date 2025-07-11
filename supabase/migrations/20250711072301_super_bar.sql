/*
  # User Authentication and Fertilizer Recommendations Schema

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key, references auth.users)
      - `full_name` (text)
      - `email` (text, unique)
      - `farm_location` (text)
      - `phone` (text, optional)
      - `farm_size` (numeric, optional)
      - `farm_size_unit` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `fertilizer_recommendations`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `field_name` (text)
      - `field_size` (numeric)
      - `field_size_unit` (text)
      - `crop_type` (text)
      - `soil_type` (text)
      - `soil_ph` (numeric)
      - `nitrogen` (numeric)
      - `phosphorus` (numeric)
      - `potassium` (numeric)
      - `temperature` (numeric)
      - `humidity` (numeric)
      - `soil_moisture` (numeric)
      - `ml_prediction` (jsonb)
      - `recommendations` (jsonb)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text UNIQUE NOT NULL,
  farm_location text,
  phone text,
  farm_size numeric,
  farm_size_unit text DEFAULT 'hectares',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create fertilizer_recommendations table
CREATE TABLE IF NOT EXISTS fertilizer_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  field_name text NOT NULL,
  field_size numeric NOT NULL,
  field_size_unit text NOT NULL DEFAULT 'hectares',
  crop_type text NOT NULL,
  soil_type text NOT NULL,
  soil_ph numeric NOT NULL,
  nitrogen numeric NOT NULL,
  phosphorus numeric NOT NULL,
  potassium numeric NOT NULL,
  temperature numeric NOT NULL,
  humidity numeric NOT NULL,
  soil_moisture numeric NOT NULL,
  ml_prediction jsonb NOT NULL,
  recommendations jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE fertilizer_recommendations ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create policies for fertilizer_recommendations
CREATE POLICY "Users can read own recommendations"
  ON fertilizer_recommendations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recommendations"
  ON fertilizer_recommendations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recommendations"
  ON fertilizer_recommendations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recommendations"
  ON fertilizer_recommendations
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create function to handle user profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO user_profiles (id, full_name, email)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    new.email
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();