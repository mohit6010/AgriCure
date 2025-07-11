import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { RecommendationService } from "@/services/recommendationService";
import type { FertilizerRecommendation } from "@/services/supabaseClient";
import { History, Trash2, Eye, Calendar, Leaf, AlertCircle, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const RecommendationHistory = () => {
  const [recommendations, setRecommendations] = useState<FertilizerRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      setIsLoading(true);
      const data = await RecommendationService.getUserRecommendations();
      setRecommendations(data);
    } catch (error) {
      console.error('Error loading recommendations:', error);
      toast({
        title: "Error",
        description: "Failed to load recommendation history",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await RecommendationService.deleteRecommendation(id);
      setRecommendations(prev => prev.filter(rec => rec.id !== id));
      toast({
        title: "Deleted",
        description: "Recommendation deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting recommendation:', error);
      toast({
        title: "Error",
        description: "Failed to delete recommendation",
        variant: "destructive"
      });
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'bg-green-100 text-green-800 border-green-200';
    if (confidence >= 80) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  if (isLoading) {
    return (
      <Card className="w-full border-0 shadow-xl">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-grass-600" />
          <span className="ml-2">Loading recommendation history...</span>
        </CardContent>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card className="w-full border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
        <CardHeader className="px-4 sm:px-6 bg-gradient-to-r from-grass-50 to-green-50 rounded-t-lg">
          <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl text-grass-800">
            <History className="h-5 w-5 sm:h-6 sm:w-6 text-grass-600" />
            <span>Fertilizer Recommendation History</span>
          </CardTitle>
          <CardDescription className="text-sm sm:text-base text-grass-700">
            Your past fertilizer recommendations and analysis results
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12 px-4 sm:px-6">
          <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Recommendations Yet</h3>
          <p className="text-gray-600 text-center max-w-md">
            You haven't generated any fertilizer recommendations yet. Use the ML Recommendations tab to get started with personalized fertilizer suggestions for your crops.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
      <CardHeader className="px-4 sm:px-6 bg-gradient-to-r from-grass-50 to-green-50 rounded-t-lg">
        <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl text-grass-800">
          <History className="h-5 w-5 sm:h-6 sm:w-6 text-grass-600" />
          <span>Fertilizer Recommendation History</span>
        </CardTitle>
        <CardDescription className="text-sm sm:text-base text-grass-700">
          Your past fertilizer recommendations and analysis results ({recommendations.length} total)
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 sm:px-6 py-6">
        <div className="space-y-4">
          {recommendations.map((recommendation, index) => (
            <div 
              key={recommendation.id}
              className="p-4 border border-gray-200 rounded-lg bg-white hover:shadow-md transition-all duration-300 hover:scale-102"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0 mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Leaf className="h-4 w-4 text-grass-600" />
                    <h4 className="font-semibold text-base sm:text-lg text-gray-800">
                      {recommendation.field_name}
                    </h4>
                    <Badge variant="secondary" className="text-xs">
                      {recommendation.field_size} {recommendation.field_size_unit}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-600">
                    <span className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(recommendation.created_at)}</span>
                    </span>
                    <span>•</span>
                    <span className="capitalize">{recommendation.crop_type}</span>
                    <span>•</span>
                    <span className="capitalize">{recommendation.soil_type} Soil</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={`${getConfidenceColor(recommendation.ml_prediction.confidence)} text-xs border`}>
                    {recommendation.ml_prediction.confidence}% Confidence
                  </Badge>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={deletingId === recommendation.id}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                      >
                        {deletingId === recommendation.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Recommendation</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this recommendation for "{recommendation.field_name}"? 
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(recommendation.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* ML Prediction */}
                <div className="p-3 bg-gradient-to-r from-grass-50 to-green-50 rounded-lg border border-grass-200">
                  <h5 className="font-medium text-sm text-grass-800 mb-1">ML Recommendation</h5>
                  <p className="text-sm font-semibold text-grass-700">
                    {recommendation.ml_prediction.fertilizer}
                  </p>
                </div>

                {/* Soil Conditions */}
                <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <h5 className="font-medium text-sm text-blue-800 mb-1">Soil Conditions</h5>
                  <div className="text-xs text-blue-700 space-y-1">
                    <div>pH: {recommendation.soil_ph}</div>
                    <div>Moisture: {recommendation.soil_moisture}%</div>
                  </div>
                </div>

                {/* NPK Levels */}
                <div className="p-3 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border border-orange-200">
                  <h5 className="font-medium text-sm text-orange-800 mb-1">NPK Levels</h5>
                  <div className="text-xs text-orange-700 space-y-1">
                    <div>N: {recommendation.nitrogen} mg/kg</div>
                    <div>P: {recommendation.phosphorus} mg/kg</div>
                    <div>K: {recommendation.potassium} mg/kg</div>
                  </div>
                </div>
              </div>

              {/* Environmental Data */}
              <div className="mt-4 pt-3 border-t border-gray-200">
                <div className="flex flex-wrap gap-4 text-xs text-gray-600">
                  <span>Temperature: {recommendation.temperature}°C</span>
                  <span>Humidity: {recommendation.humidity}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecommendationHistory;