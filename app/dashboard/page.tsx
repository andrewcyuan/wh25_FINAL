'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import FarmChatbot from '@/components/FarmChatbot';
import { createClient } from "@/utils/supabase/client";
import ActionModal from '@/components/ActionModal';
import WeatherForecastChart from '@/components/WeatherForecastChart';

const MAX_FILE_SIZE = 524288000; // 500MB
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];

interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  city: string;
  state: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  plot_size: number | null;
}

export default function DashboardPage() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [forecastData, setForecastData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [irrigationModalOpen, setIrrigationModalOpen] = useState(false);
  const [seederModalOpen, setSeederModalOpen] = useState(false);

  // Modal states
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentVideo, setCurrentVideo] = useState<string | null>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Video upload refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadAreaRef = useRef<HTMLDivElement>(null);

  const [selectedVideos, setSelectedVideos] = useState<number[]>([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: userData, error } = await supabase.auth.getUser();
        if (error) throw error;

        if (userData.user) {
          const { data: profileData, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', userData.user.id)
            .single();

          if (profileError) {
            console.error('Error fetching profile:', profileError);
          } else if (profileData) {
            setProfile(profileData);
            
            // Fetch weather data
            try {
              const weatherResponse = await fetch(`/api/weather?lat=${profileData.latitude || 42.0564}&long=${profileData.longitude || -87.6818}`);
              const weatherJson = await weatherResponse.json();
              setWeatherData(weatherJson);
              
              // Fetch extended forecast data
              const forecastResponse = await fetch(`/api/forecast?lat=${profileData.latitude || 42.0564}&long=${profileData.longitude || -87.6818}`);
              const forecastJson = await forecastResponse.json();
              setForecastData(forecastJson);
            } catch (weatherError) {
              console.error('Error fetching weather data:', weatherError);
            }
          }
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [supabase]);

  // Fetch videos from API
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setIsLoadingVideos(true);
        const response = await fetch('/api/videos');
        if (!response.ok) {
          throw new Error('Failed to fetch videos');
        }
        const data = await response.json();
        setVideos(data);
      } catch (error) {
        console.error('Error fetching videos:', error);
      } finally {
        setIsLoadingVideos(false);
      }
    };

    fetchVideos();
  }, []);

  // Initialize Supabase bucket
  const initializeBucket = useCallback(async () => {
    try {
      console.log('Initializing video storage bucket via API...');
      
      const response = await fetch('/api/videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to initialize storage bucket');
      }
      
      const result = await response.json();
      console.log('Bucket initialization result:', result.message);
      
    } catch (error) {
      console.error('Error initializing bucket:', error);
      setError('Failed to initialize storage. Please try refreshing the page.');
    }
  }, []);
  
  // Initialize stored videos
  const loadStoredVideos = useCallback(async () => {
    try {
      await initializeBucket();
      
      console.log('Loading stored videos from API...');
      const response = await fetch('/api/videos', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load videos');
      }
      
      const videos = await response.json();
      console.log('Videos loaded successfully:', videos.length);
      
      setVideos(videos);
    } catch (error) {
      console.error('Error loading videos:', error);
      setError('Failed to load videos. Please try refreshing the page.');
    } finally {
      setIsLoadingVideos(false);
    }
  }, [initializeBucket]);

  // Load videos on mount
  useEffect(() => {
    loadStoredVideos();
  }, [loadStoredVideos]);
  
  // Handle file upload
  const handleUpload = async (file: File) => {
    try {
      setError(null);
      setUploadProgress(0);
      
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        throw new Error(`File size exceeds ${Math.round(MAX_FILE_SIZE / 1048576)}MB limit`);
      }
      
      // Validate file type
      if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
        throw new Error(`Please upload a valid video file (${ALLOWED_VIDEO_TYPES.map(type => type.split('/')[1]).join(', ')})`);
      }
      
      // Create a unique filename to avoid conflicts
      const timestamp = Date.now();
      const fileName = `${timestamp}-${file.name}`;
      
      console.log(`Starting upload of file: ${fileName}`);
      
      // Get a signed URL for upload from our API route
      const signedUrlResponse = await fetch('/api/videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          getUploadUrl: true,
          filename: fileName
        })
      });
      
      if (!signedUrlResponse.ok) {
        const errorData = await signedUrlResponse.json();
        throw new Error(errorData.error || 'Failed to get upload URL');
      }
      
      const { signedUrl, publicUrl } = await signedUrlResponse.json();
      
      console.log('Received signed upload URL, proceeding with upload...');
      
      // Upload directly to the signed URL
      const uploadResponse = await fetch(signedUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
          'x-upsert': 'true'
        },
        body: file
      });
      
      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.statusText}`);
      }
      
      // Add to stored videos
      const newVideo = {
        name: fileName,
        url: publicUrl,
        created_at: new Date().toISOString()
      };
      setVideos(prev => [...prev, newVideo]);
      
      // write to user's videos column
      const resp = await fetch("/api/addVideo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          videoFileName: fileName
        })
      })
      if(!resp.ok) {
        throw new Error("There was a problem adding the video to your video column");
      }

      // set upload progress to 100
      setUploadProgress(80);
      
      // Automatically process the video
      console.log('Starting automatic video analysis...');
      
      // Prepare the analysis prompt
      const analysisPrompt = `Please analyze this drone footage video for potential issues like crop health, pests, or irrigation needs based on the visual data.`;
      
      // Send to chat endpoint for processing
      const analysisResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: analysisPrompt,
          videos: [{ url: publicUrl, name: fileName }]
        })
      });
      
      if (!analysisResponse.ok) {
        throw new Error('Failed to analyze video');
      }
      
      const analysisResult = await analysisResponse.json();
      console.log('Analysis complete:', analysisResult);
      
      // Show success message
      setError(`Video uploaded and analyzed successfully! Check the AI Farm Assistant for results.`);
      setUploadProgress(100);
      setTimeout(() => setError(null), 5000); // Clear message after 5 seconds
      
    } catch (error) {
      console.error('Error uploading/analyzing video:', error);
      setUploadProgress(0);
      setError(error instanceof Error ? error.message : 'Failed to upload/analyze video. Please try again.');
    }
  };
  
  // Handle file deletion
  const handleDelete = async (fileName: string) => {
    try {

      const response = await fetch("/api/deleteVideo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName: fileName
        })
      })
      if (!response.ok) {
        throw new Error("delete video issue")
      }

      setError(null);
      
      setVideos(prev => prev.filter(video => video.name !== fileName));
      if (currentVideo?.includes(fileName)) {
        setCurrentVideo(null);
      }
    } catch (error) {
      console.error('Error deleting video:', error);
      setError('Failed to delete video. Please try again.');
    }
  };
  
  // Handle drag and drop
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleUpload(files[0]);
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 dark:text-gray-400">Loading your farm dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-4">
      <div className="mx-auto px-6 w-[98%] max-w-none">
        <div className="mb-6 pt-8">
          <h1 className="text-3xl text-center font-bold mb-2">Welcome, {profile?.first_name}!</h1>
          <p className="text-gray-600 dark:text-gray-400 text-center">Here's the current status of your farming operations.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Farm Location Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Farm Location
            </h2>
            <div className="text-gray-700 dark:text-gray-300">
              <p className="mb-1"><span className="font-medium">City:</span> {profile?.city}</p>
              <p className="mb-1"><span className="font-medium">State:</span> {profile?.state}</p>
              <p className="mb-1"><span className="font-medium">Country:</span> {profile?.country}</p>
              <p className="mb-1"><span className="font-medium">Coordinates:</span> {profile?.latitude?.toFixed(4)}, {profile?.longitude?.toFixed(4)}</p>
              <p className="mt-3 font-medium">Total Plot Size: <span className="text-green-600 dark:text-green-400">{profile?.plot_size} acres</span></p>
            </div>
          </div>

          {/* Weather Data Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
              Current Weather
            </h2>
            <div className="flex items-center">
              {weatherData?.icon && (
                <img 
                  src={weatherData.icon} 
                  alt={weatherData.condition} 
                  className="w-12 h-12 mr-3 rounded-xl object-fit p-1" 
                />
              )}
              <div>
                <div className="text-3xl font-bold">
                  {weatherData?.temperature ?? '--'}{weatherData?.temperatureUnit ?? '°F'}
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  {weatherData?.condition ?? 'Weather data unavailable'}
                </div>
                {weatherData && (
                  <div className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                    Wind: {weatherData.wind} {weatherData.windDirection}
                  </div>
                )}
              </div>
            </div>
            {weatherData?.detailedForecast && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm">
                {weatherData.detailedForecast}
              </div>
            )}
          </div>

          {/* Weather Forecast Chart */}
          <WeatherForecastChart forecastData={forecastData} />
        </div>

        {/* Remote Operation Controls */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">Remote Operations</h2>
          <div className="grid grid-cols-1 gap-4 mb-4">
            <div className="p-6 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-lg hover:bg-yellow-200 dark:hover:bg-yellow-800/50 transition-colors">
              <div className="flex items-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <div className="text-left">
                  <span className="text-xl font-semibold block">Scan Drone Footage of Crops</span>
                  <span className="text-sm">Analyze crop health and status with AI-powered imaging</span>
                </div>
              </div>
              {/* Video Selection */}
              <div className="mt-4 border-t pt-3">
                {error && (
                  <div className={`px-4 py-3 rounded relative mb-4 ${
                    error.includes('successfully') 
                      ? 'bg-green-100 border border-green-400 text-green-700'
                      : 'bg-red-100 border border-red-400 text-red-700'
                  }`} role="alert">
                    <span className="block sm:inline">{error}</span>
                  </div>
                )}

                {isLoadingVideos ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-700 mx-auto"></div>
                    <p className="mt-2 text-yellow-700">Loading videos...</p>
                  </div>
                ) : (
                  <>
                    {/* Upload area */}
                    <div
                      ref={uploadAreaRef}
                      className={`upload-area p-6 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors duration-200
                        ${isDragging ? 'border-yellow-500 bg-yellow-50' : 'border-yellow-300 hover:border-yellow-400'}`}
                      onDragEnter={handleDragEnter}
                      onDragOver={handleDragEnter}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept={ALLOWED_VIDEO_TYPES.join(',')}
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
                      />
                      <div className="upload-prompt">
                        <p className="text-yellow-700 mb-4">
                          Drag and drop your drone footage here or click to browse.<br/>
                          <span className="text-sm">Videos will be automatically analyzed upon upload.</span>
                        </p>
                        <button className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors duration-200">
                          Choose Video
                        </button>
                      </div>
                      {uploadProgress > 0 && (
                        <div className="mt-4">
                          <div className="w-full h-2 bg-yellow-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-yellow-500 transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                          <p className="text-sm text-yellow-700 mt-2">
                            {uploadProgress === 100 
                              ? 'Done!' 
                              : `Analyzing: ${uploadProgress}%`}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Video List */}
                    {videos.length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-lg font-medium mb-3">Previous Footage</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {videos.map((video) => (
                            <div key={video.name} className="video-card bg-white rounded-lg shadow-sm overflow-hidden border border-yellow-200">
                              <video
                                className="w-full h-32 object-cover cursor-pointer"
                                src={video.url}
                                onClick={() => window.open(video.url, '_blank')}
                              />
                              <div className="p-3">
                                <p className="text-sm text-gray-600 mb-2">
                                  Uploaded on {formatDate(video.created_at)}
                                </p>
                                <div className="flex justify-between items-center">
                                  <button
                                    className="text-yellow-600 hover:text-yellow-700 text-sm font-medium"
                                    onClick={() => window.open(video.url, '_blank')}
                                  >
                                    View
                                  </button>
                                  <button
                                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                                    onClick={() => handleDelete(video.name)}
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button 
              className="p-4 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors"
              onClick={() => setIrrigationModalOpen(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Start Irrigation
            </button>
            <button 
              className="p-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-800/50 transition-colors"
              onClick={() => setSeederModalOpen(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Deploy Seeder
            </button>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">AI Farm Assistant — Powered by Gemini</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Get personalized farming advice, crop management recommendations, and answers to your agricultural questions based on your farm's data.
          </p>
          <FarmChatbot userProfile={profile} weatherData={weatherData} />
        </div>

        {/* Modals */}
        <ActionModal
          isOpen={irrigationModalOpen}
          title="Start Irrigation"
          description={
            <div className="space-y-5">
              <p className="text-lg">To begin the irrigation process:</p>
              <div className="flex items-center space-x-5">
                <img src="/assets/drone.png" alt="Irrigation Drone" className="w-32 h-32 object-contain" />
                <div>
                  <p className="font-semibold text-lg">1. Prepare your FarmFlight irrigation drone</p>
                  <p className="text-base">Ensure the drone is fully charged and the water tank is filled.</p>
                </div>
              </div>
              <p className="font-semibold text-lg">2. Launch sequence</p>
              <p className="text-base">After closing this dialog, the drone will automatically:</p>
              <ul className="list-disc pl-6 space-y-2 text-base">
                <li>Take off from its charging station</li>
                <li>Survey your field to identify dry areas</li>
                <li>Distribute water based on soil moisture readings</li>
                <li>Return to base once irrigation is complete</li>
              </ul>
              <p className="italic text-base mt-3">Irrigation patterns are optimized based on current weather forecasts and soil data.</p>
            </div>
          }
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
          color="blue"
          onClose={() => setIrrigationModalOpen(false)}
        />

        <ActionModal
          isOpen={seederModalOpen}
          title="Deploy Seeder"
          description={
            <div className="space-y-5">
              <p className="text-lg">To begin the automated seeding process:</p>
              <div className="flex items-center space-x-5">
                <img src="/assets/drone.png" alt="Seeder Drone" className="w-32 h-32 object-contain" />
                <div>
                  <p className="font-semibold text-lg">1. Prepare your FarmFlight seeder drone</p>
                  <p className="text-base">Ensure the drone is fully charged and the seed hopper is loaded with your selected crop seeds.</p>
                </div>
              </div>
              <p className="font-semibold text-lg">2. Launch sequence</p>
              <p className="text-base">After closing this dialog, the drone will automatically:</p>
              <ul className="list-disc pl-6 space-y-2 text-base">
                <li>Take off from its charging station</li>
                <li>Follow pre-programmed planting patterns</li>
                <li>Distribute seeds at optimal depth and spacing</li>
                <li>Return to base once seeding is complete</li>
              </ul>
              <p className="italic text-base mt-3">Seeding process typically takes 30-45 minutes and is optimized for your soil conditions.</p>
            </div>
          }
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
          color="green"
          onClose={() => setSeederModalOpen(false)}
        />
      </div>
    </div>
  );
}
