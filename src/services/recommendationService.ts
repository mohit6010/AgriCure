import { supabase } from './supabaseClient';
import type { FertilizerRecommendation } from './supabaseClient';
import { AuthService } from './authService';

export interface RecommendationInput {
  fieldName: string;
  fieldSize: number;
  fieldSizeUnit: string;
  cropType: string;
  soilType: string;
  soilPH: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  temperature: number;
  humidity: number;
  soilMoisture: number;
  mlPrediction: {
    fertilizer: string;
    confidence: number;
  };
  recommendations: any;
}

export class RecommendationService {
  static async saveRecommendation(input: RecommendationInput): Promise<FertilizerRecommendation> {
    const user = await AuthService.getCurrentUser();
    if (!user) throw new Error('No authenticated user');

    const { data, error } = await supabase
      .from('fertilizer_recommendations')
      .insert({
        user_id: user.id,
        field_name: input.fieldName,
        field_size: input.fieldSize,
        field_size_unit: input.fieldSizeUnit,
        crop_type: input.cropType,
        soil_type: input.soilType,
        soil_ph: input.soilPH,
        nitrogen: input.nitrogen,
        phosphorus: input.phosphorus,
        potassium: input.potassium,
        temperature: input.temperature,
        humidity: input.humidity,
        soil_moisture: input.soilMoisture,
        ml_prediction: input.mlPrediction,
        recommendations: input.recommendations,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getUserRecommendations(): Promise<FertilizerRecommendation[]> {
    const user = await AuthService.getCurrentUser();
    if (!user) throw new Error('No authenticated user');

    const { data, error } = await supabase
      .from('fertilizer_recommendations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async deleteRecommendation(id: string): Promise<void> {
    const user = await AuthService.getCurrentUser();
    if (!user) throw new Error('No authenticated user');

    const { error } = await supabase
      .from('fertilizer_recommendations')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
  }

  static async getRecommendationById(id: string): Promise<FertilizerRecommendation | null> {
    const user = await AuthService.getCurrentUser();
    if (!user) throw new Error('No authenticated user');

    const { data, error } = await supabase
      .from('fertilizer_recommendations')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) throw error;
    return data;
  }
}