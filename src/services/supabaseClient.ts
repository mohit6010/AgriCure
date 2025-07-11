import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database tables
export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  farm_location?: string;
  phone?: string;
  farm_size?: number;
  farm_size_unit?: string;
  created_at: string;
  updated_at: string;
}

export interface FertilizerRecommendation {
  id: string;
  user_id: string;
  field_name: string;
  field_size: number;
  field_size_unit: string;
  crop_type: string;
  soil_type: string;
  soil_ph: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  temperature: number;
  humidity: number;
  soil_moisture: number;
  ml_prediction: {
    fertilizer: string;
    confidence: number;
  };
  recommendations: any;
  created_at: string;
}