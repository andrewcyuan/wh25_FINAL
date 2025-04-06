// import { SupabaseClient } from '@supabase/supabase-js';
export interface SupabaseClient {
    storage: {
      from: (bucket: string) => {
        upload: (path: string, file: File, options?: any) => Promise<{ data: any; error: any; }>;
        getPublicUrl: (path: string) => { data: { publicUrl: string; }; };
        remove: (paths: string[]) => Promise<{ data: any; error: any; }>;
        list: () => Promise<{ data: Array<{ name: string; created_at: string }>; error: any }>;
        download: (path: string) => Promise<{ data: Blob | null; error: any; }>;
      };
      listBuckets: () => Promise<{ data: Array<{ name: string; created_at: string }>; error: any }>;
      createBucket: (name: string, options?: any) => Promise<{ data: any; error: any; }>;
    };
  }
// Supabase configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Initialize Supabase client
let supabaseClient: SupabaseClient | null = null;

/**
 * Initialize the Supabase client
 * @returns boolean indicating if initialization was successful
 */
export function initSupabase(): boolean {
  try {
    console.log('Initializing Supabase with URL:', SUPABASE_URL);
    
    // Check if supabase object exists
    if (typeof (window as any).supabase === 'undefined') {
      console.error('Supabase library not loaded. Make sure the script is included in your HTML.');
      return false;
    }
    
    // Create Supabase client
    supabaseClient = (window as any).supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    
    // Test the connection
    console.log('Testing Supabase connection...');
    if (supabaseClient) {
      supabaseClient.storage.listBuckets().then(
        ({ data, error }) => {
          if (error) {
            console.error('Error testing Supabase connection:', error);
          } else {
            console.log('Supabase connection successful. Available buckets:', data);
            
            // Check if videos bucket exists
            const videosBucket = data.find(bucket => 
              bucket.name.toLowerCase() === 'videos' || 
              bucket.name === 'videos'
            );
            
            if (!videosBucket) {
              console.warn('Videos bucket not found during initialization. Will attempt to create it when needed.');
            } else {
              console.log('Videos bucket found during initialization:', videosBucket);
            }
          }
        }
      );
    }
    
    console.log('Supabase client initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing Supabase client:', error);
    return false;
  }
}

/**
 * Upload a video file to Supabase storage
 * @param file The video file to upload
 * @returns Promise with the public URL of the uploaded video
 */
export async function uploadVideo(file: File): Promise<string> {
  if (!supabaseClient) {
    throw new Error('Supabase client not initialized');
  }
  
  try {
    console.log('Starting video upload...');
    
    // Create a unique filename
    const timestamp = new Date().getTime();
    const filename = `${timestamp}-${file.name}`;
    console.log('Generated filename:', filename);
    
    // Check if the videos bucket exists
    console.log('Checking if videos bucket exists...');
    const { data: buckets, error: bucketsError } = await supabaseClient.storage.listBuckets();
    
    if (bucketsError) {
      console.error('Error checking buckets:', bucketsError);
      throw new Error(`Failed to check storage buckets: ${bucketsError.message}`);
    }
    
    console.log('Available buckets:', buckets);
    
    // Check for bucket with case-insensitive comparison
    const videosBucket = buckets.find(bucket => 
      bucket.name.toLowerCase() === 'videos' || 
      bucket.name === 'videos'
    );
    
    if (!videosBucket) {
      console.error('Videos bucket not found. Available buckets:', buckets.map(b => b.name));
      
      // Try to create the bucket if it doesn't exist
      console.log('Attempting to create videos bucket...');
      const { data: newBucket, error: createError } = await supabaseClient.storage.createBucket('videos', {
        public: true
      });
      
      if (createError) {
        console.error('Error creating bucket:', createError);
        throw new Error(`Could not find or create videos bucket. Error: ${createError.message}`);
      }
      
      console.log('Successfully created videos bucket:', newBucket);
    } else {
      console.log('Videos bucket found:', videosBucket);
    }
    
    console.log('Uploading file to Supabase storage...');
    
    // Use the Supabase client to upload the file
    const { data, error } = await supabaseClient.storage
      .from('videos')
      .upload(filename, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.error('Upload error:', error);
      throw new Error(`Upload failed: ${error.message}`);
    }
    
    console.log('Upload successful:', data);
    
    // Get public URL
    const { data: { publicUrl } } = supabaseClient.storage
      .from('videos')
      .getPublicUrl(filename);
    
    console.log('Public URL:', publicUrl);
    
    return publicUrl;
  } catch (error) {
    console.error('Error in uploadVideo:', error);
    throw error;
  }
}

/**
 * Delete a video from Supabase storage
 * @param filename The filename of the video to delete
 * @returns Promise indicating success or failure
 */
export async function deleteVideo(filename: string): Promise<void> {
  if (!supabaseClient) {
    throw new Error('Supabase client not initialized');
  }
  
  try {
    // Delete from Supabase Storage using the client
    const { error } = await supabaseClient.storage
      .from('videos')
      .remove([filename]);
    
    if (error) {
      console.error('Delete error:', error);
      throw new Error(`Delete failed: ${error.message}`);
    }
    
    console.log('Video deleted successfully');
  } catch (error) {
    console.error('Error deleting video:', error);
    throw error;
  }
}

/**
 * List all videos in the videos bucket
 * @returns Promise with an array of video objects
 */
export async function listVideos(): Promise<Array<{ name: string; url: string; created_at: string }>> {
  if (!supabaseClient) {
    throw new Error('Supabase client not initialized');
  }
  
  try {
    console.log('Listing videos from Supabase storage...');
    
    // List files in the videos bucket
    const { data, error } = await supabaseClient.storage
      .from('videos')
      .list();
    
    if (error) {
      console.error('Error listing videos:', error);
      throw new Error(`Failed to list videos: ${error.message}`);
    }
    
    console.log('Videos listed successfully:', data);
    
    // Map the files to include public URLs
    const videos = data.map(file => {
      const { data: { publicUrl } } = supabaseClient!.storage
        .from('videos')
        .getPublicUrl(file.name);
      
      return {
        name: file.name,
        url: publicUrl,
        created_at: file.created_at
      };
    });
    
    return videos;
  } catch (error) {
    console.error('Error in listVideos:', error);
    throw error;
  }
}

/**
 * Rename a video in Supabase storage
 * @param oldName The current name of the video
 * @param newName The new name for the video
 * @returns A promise that resolves when the video is renamed
 */
export async function renameVideo(oldName: string, newName: string): Promise<void> {
  if (!supabaseClient) {
    throw new Error('Supabase client not initialized');
  }
  
  try {
    console.log(`Renaming video from ${oldName} to ${newName}`);
    
    // Get the video data
    const { data: videoData, error: getError } = await supabaseClient.storage
      .from('videos')
      .download(oldName);
    
    if (getError) {
      throw getError;
    }
    
    if (!videoData) {
      throw new Error('Video not found');
    }
    
    // Convert Blob to File
    const file = new File([videoData], newName, { type: videoData.type });
    
    // Upload the video with the new name
    const { error: uploadError } = await supabaseClient.storage
      .from('videos')
      .upload(newName, file, {
        upsert: true
      });
    
    if (uploadError) {
      throw uploadError;
    }
    
    // Delete the old video
    const { error: deleteError } = await supabaseClient.storage
      .from('videos')
      .remove([oldName]);
    
    if (deleteError) {
      throw deleteError;
    }
    
    console.log(`Video renamed successfully from ${oldName} to ${newName}`);
  } catch (error) {
    console.error('Error renaming video:', error);
    throw error;
  }
} 