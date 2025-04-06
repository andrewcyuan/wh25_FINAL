'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createClient } from "@/utils/supabase/client";

// Types
interface Video {
  name: string;
  url: string;
  created_at: string;
}

interface VideoUploadProps {
  className?: string;
  title?: string;
  showTitle?: boolean;
  maxFileSize?: number; // in bytes
  allowedFileTypes?: string[];
}

export default function VideoUpload({ 
  className = '',
  title = 'Farm Videos',
  showTitle = true,
  maxFileSize = 524288000, // 500MB default
  allowedFileTypes = ['video/mp4', 'video/webm', 'video/ogg']
}: VideoUploadProps) {
  const [supabase] = useState(() => createClient());
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentVideo, setCurrentVideo] = useState<string | null>(null);
  const [storedVideos, setStoredVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadAreaRef = useRef<HTMLDivElement>(null);
  
  // Initialize Supabase bucket
  const initializeBucket = useCallback(async () => {
    try {
      console.log('Initializing video storage bucket via API...');
      
      // Call the API route to check/create the bucket
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
      
      setStoredVideos(videos);
    } catch (error) {
      console.error('Error loading videos:', error);
      setError('Failed to load videos. Please try refreshing the page.');
    } finally {
      setIsLoading(false);
    }
  }, [initializeBucket]);
  
  useEffect(() => {
    loadStoredVideos();
  }, [loadStoredVideos]);
  
  // Handle file upload
  const handleUpload = async (file: File) => {
    try {
      setError(null);
      setUploadProgress(0);
      
      // Validate file size
      if (file.size > maxFileSize) {
        throw new Error(`File size exceeds ${Math.round(maxFileSize / 1048576)}MB limit`);
      }
      
      // Validate file type
      if (!allowedFileTypes.includes(file.type)) {
        throw new Error(`Please upload a valid video file (${allowedFileTypes.map(type => type.split('/')[1]).join(', ')})`);
      }
      
      // Create a unique filename to avoid conflicts
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const fileName = `${timestamp}-${file.name}`;
      
      console.log(`Starting upload of file: ${fileName}`);
      
      // Get a signed URL for upload from our API route (which uses the service role key)
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
      
      const { signedUrl, token, publicUrl } = await signedUrlResponse.json();
      
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
      
      console.log('Video uploaded successfully to signed URL');
      
      // Add to stored videos
      setStoredVideos(prev => [...prev, {
        name: fileName,
        url: publicUrl,
        created_at: new Date().toISOString()
      }]);
      
      setUploadProgress(100);
      setCurrentVideo(publicUrl);
      
    } catch (error) {
      console.error('Error uploading video:', error);
      setUploadProgress(0);
      setError(error instanceof Error ? error.message : 'Failed to upload video. Please try again.');
    }
  };
  
  // Handle file deletion
  const handleDelete = async (fileName: string) => {
    try {
      setError(null);
      const { error: deleteError } = await supabase.storage
        .from('videos')
        .remove([fileName]);
        
      if (deleteError) throw deleteError;
      
      setStoredVideos(prev => prev.filter(video => video.name !== fileName));
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
  
  return (
    <div className={`space-y-8 ${className}`}>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      <section className="video-upload bg-white rounded-lg shadow-md">
        {!currentVideo ? (
          <div
            ref={uploadAreaRef}
            className={`upload-area p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors duration-200
              ${isDragging ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-green-400'}`}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={allowedFileTypes.join(',')}
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
            />
            <div className="upload-prompt">
              <p className="text-gray-600 mb-4">
                Drag and drop your video here or click to browse
              </p>
              <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors duration-200">
                Choose Video
              </button>
            </div>
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="mt-4 w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="video-preview p-4">
            <video controls className="w-full rounded-lg" src={currentVideo} />
            <div className="flex justify-between items-center mt-4">
              <button
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors duration-200"
                onClick={() => setCurrentVideo(null)}
              >
                Upload New Video
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors duration-200"
                onClick={() => currentVideo && handleDelete(currentVideo.split('/').pop()!)}
              >
                Delete Video
              </button>
            </div>
          </div>
        )}
      </section>
      
      <section className="video-list">
        {showTitle && <h2 className="text-xl font-semibold text-gray-800 mb-4">{title}</h2>}
        {isLoading ? (
          <p className="text-gray-600">Loading videos...</p>
        ) : storedVideos.length === 0 ? (
          <p className="text-gray-600">No videos uploaded yet</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {storedVideos.map((video) => (
              <div key={video.name} className="video-card bg-white rounded-lg shadow-md overflow-hidden">
                <video
                  className="w-full h-48 object-cover"
                  src={video.url}
                  onClick={() => setCurrentVideo(video.url)}
                />
                <div className="p-4">
                  <p className="text-sm text-gray-600 mb-2">
                    Uploaded on {formatDate(video.created_at)}
                  </p>
                  <div className="flex justify-between items-center">
                    <button
                      className="text-green-600 hover:text-green-700 text-sm font-medium"
                      onClick={() => setCurrentVideo(video.url)}
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
        )}
      </section>
    </div>
  );
} 