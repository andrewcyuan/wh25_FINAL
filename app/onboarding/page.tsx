'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from "@/utils/supabase/client";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormMessage } from '@/components/form-message';

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [formState, setFormState] = useState({
    firstName: '',
    lastName: '',
    city: '',
    state: '',
    country: '',
    plotSize: '',
    latitude: null as number | null,
    longitude: null as number | null,
  });

  useEffect(() => {
    // Check if user is authenticated
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      
      if (error || !data.session) {
        router.push('/');
        return;
      }
      
      setUserId(data.session.user.id);
      
      // Check if user has already completed onboarding
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', data.session.user.id)
        .single();
      
      if (profileData && profileData.first_name) {
        // User has already completed onboarding, redirect to dashboard
        router.push('/dashboard');
      }
    };

    checkSession();

    // Get geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormState(prev => ({
            ...prev,
            longitude: position.coords.longitude,
            latitude: position.coords.latitude,
          }));
        },
        (error) => {
          console.error('Error getting geolocation:', error);
          setError('Unable to get your location. Please enter your address correctly so we can approximate your coordinates.');
        }
      );
    }
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!userId) {
        throw new Error('User not authenticated');
      }

      // Validate form data
      if (!formState.firstName || !formState.lastName || !formState.city || !formState.state || !formState.country) {
        throw new Error('Please fill out all required fields');
      }

      // Parse plot size to float
      const plotSize = parseFloat(formState.plotSize);
      if (isNaN(plotSize)) {
        throw new Error('Plot size must be a valid number');
      }

      // Submit data to Supabase
      const { data, error: insertError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: userId,  
          first_name: formState.firstName,
          last_name: formState.lastName,
          full_name: `${formState.firstName} ${formState.lastName}`,
          city: formState.city,
          state: formState.state,
          country: formState.country,
          longitude: formState.longitude,
          latitude: formState.latitude,
          plot_size: plotSize,
          onboarding_complete: true,
          created_at: new Date().toISOString()
        })
        .select();

      if (insertError) {
        throw new Error(insertError.message);
      }

      setSuccess(true);
      
      // Redirect to dashboard after successful onboarding
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-green-900/30 dark:to-gray-900 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center text-green-700 dark:text-green-400 mb-2">Welcome to FarmFlight</h1>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
            Let's set up your farm profile to get started with remote crop management.
          </p>

          {success ? (
            <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 p-4 rounded-md mb-6">
              Profile created successfully! Redirecting to your dashboard...
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formState.firstName}
                    onChange={handleInputChange}
                    placeholder="Johnny"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formState.lastName}
                    onChange={handleInputChange}
                    placeholder="Appleseed"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    name="city"
                    value={formState.city}
                    onChange={handleInputChange}
                    placeholder="City..."
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    name="state"
                    value={formState.state}
                    onChange={handleInputChange}
                    placeholder="State..."
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    name="country"
                    value={formState.country}
                    onChange={handleInputChange}
                    placeholder="United States"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="plotSize">Farm Plot Size (in acres) *</Label>
                <Input
                  id="plotSize"
                  name="plotSize"
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={formState.plotSize}
                  onChange={handleInputChange}
                  placeholder="100"
                  required
                />
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
                <h3 className="text-base font-medium text-blue-700 dark:text-blue-400 mb-2">Location Data</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  We'll use your address to determine your farm's coordinates. This helps us provide accurate weather and satellite data.
                </p>
                {formState.latitude && formState.longitude ? (
                  <p className="text-sm text-green-600 dark:text-green-400">
                    ✓ Location detected: {formState.latitude.toFixed(4)}, {formState.longitude.toFixed(4)}
                  </p>
                ) : (
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">
                    Attempting to detect your location...
                  </p>
                )}
              </div>

              {error && <FormMessage message={{ error }} />}

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Setting up your profile...' : 'Complete Setup & Continue to Dashboard'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
