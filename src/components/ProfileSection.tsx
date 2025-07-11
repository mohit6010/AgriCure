import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { AuthService } from "@/services/authService";
import type { UserProfile } from "@/services/supabaseClient";
import { User, Save, Loader2 } from "lucide-react";

const ProfileSection = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    farm_location: '',
    phone: '',
    farm_size: '',
    farm_size_unit: 'hectares'
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const userProfile = await AuthService.getUserProfile();
      if (userProfile) {
        setProfile(userProfile);
        setFormData({
          full_name: userProfile.full_name || '',
          email: userProfile.email || '',
          farm_location: userProfile.farm_location || '',
          phone: userProfile.phone || '',
          farm_size: userProfile.farm_size?.toString() || '',
          farm_size_unit: userProfile.farm_size_unit || 'hectares'
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const updates = {
        full_name: formData.full_name,
        farm_location: formData.farm_location,
        phone: formData.phone,
        farm_size: formData.farm_size ? parseFloat(formData.farm_size) : null,
        farm_size_unit: formData.farm_size_unit
      };

      await AuthService.updateUserProfile(updates);
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });

      // Reload profile to get updated data
      await loadProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full border-0 shadow-xl">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-grass-600" />
          <span className="ml-2">Loading profile...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
      <CardHeader className="px-4 sm:px-6 bg-gradient-to-r from-grass-50 to-green-50 rounded-t-lg">
        <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl text-grass-800">
          <User className="h-5 w-5 sm:h-6 sm:w-6 text-grass-600" />
          <span>Profile Settings</span>
        </CardTitle>
        <CardDescription className="text-sm sm:text-base text-grass-700">
          Manage your personal information and farm details
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 sm:px-6 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 border-b pb-2">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-sm sm:text-base font-medium text-gray-700">
                  Full Name *
                </Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => handleChange("full_name", e.target.value)}
                  required
                  className="transition-all duration-300 focus:ring-2 focus:ring-grass-500 focus:border-grass-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm sm:text-base font-medium text-gray-700">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  disabled
                  className="bg-gray-100 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500">Email cannot be changed</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm sm:text-base font-medium text-gray-700">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="e.g., +91 9876543210"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className="transition-all duration-300 focus:ring-2 focus:ring-grass-500 focus:border-grass-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="farm_location" className="text-sm sm:text-base font-medium text-gray-700">
                  Farm Location
                </Label>
                <Input
                  id="farm_location"
                  placeholder="e.g., Mumbai, Maharashtra"
                  value={formData.farm_location}
                  onChange={(e) => handleChange("farm_location", e.target.value)}
                  className="transition-all duration-300 focus:ring-2 focus:ring-grass-500 focus:border-grass-500"
                />
              </div>
            </div>
          </div>

          {/* Farm Information */}
          <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 border-b pb-2">
              Farm Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="farm_size" className="text-sm sm:text-base font-medium text-gray-700">
                  Total Farm Size
                </Label>
                <Input
                  id="farm_size"
                  type="number"
                  step="0.1"
                  placeholder="e.g., 5.5"
                  value={formData.farm_size}
                  onChange={(e) => handleChange("farm_size", e.target.value)}
                  className="transition-all duration-300 focus:ring-2 focus:ring-grass-500 focus:border-grass-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="farm_size_unit" className="text-sm sm:text-base font-medium text-gray-700">
                  Unit
                </Label>
                <Select onValueChange={(value) => handleChange("farm_size_unit", value)} value={formData.farm_size_unit}>
                  <SelectTrigger className="transition-all duration-300 focus:ring-2 focus:ring-grass-500 focus:border-grass-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hectares">Hectares</SelectItem>
                    <SelectItem value="acres">Acres</SelectItem>
                    <SelectItem value="bigha">Bigha</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Profile Stats */}
          {profile && (
            <div className="space-y-4 p-4 bg-gradient-to-r from-grass-50 to-green-50 rounded-lg border border-grass-200">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">Account Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Member since:</span>
                  <span className="ml-2 font-medium">
                    {new Date(profile.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Last updated:</span>
                  <span className="ml-2 font-medium">
                    {new Date(profile.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <Button 
              type="submit" 
              disabled={isSaving}
              className="bg-gradient-to-r from-grass-600 to-green-600 hover:from-grass-700 hover:to-green-700 text-sm sm:text-base px-6 py-2 sm:py-3 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
            >
              {isSaving ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Save className="h-4 w-4" />
                  <span>Save Changes</span>
                </div>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProfileSection;