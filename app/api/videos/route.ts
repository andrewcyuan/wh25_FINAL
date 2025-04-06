import { createClient } from '@supabase/supabase-js';
import { createClient as cc } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// Initialize Supabase client with service role key to bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false, // Don't persist the session
      autoRefreshToken: false // Don't auto refresh the token
    }
  }
);

console.log('API Route: Supabase initialized with SERVICE ROLE KEY');

// GET handler to fetch videos
export async function GET(request: NextRequest) {
  try {
    console.log('API Route: Fetching videos using service role key...');
    
    // Check if videos bucket exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('Error checking buckets:', bucketsError);
      return NextResponse.json(
        { error: 'Failed to check storage buckets' },
        { status: 500 }
      );
    }
    
    // Find videos bucket (case insensitive)
    const videosBucket = buckets.find(bucket => 
      bucket.name.toLowerCase() === 'videos'
    );
    
    if (!videosBucket) {
      // Create videos bucket if it doesn't exist
      const { error: createError } = await supabase.storage.createBucket('videos', {
        public: true
      });
      
      if (createError) {
        console.error('Error creating bucket:', createError);
        return NextResponse.json(
          { error: 'Failed to create videos bucket' },
          { status: 500 }
        );
      }
    }
    
    // Extract auth token from request headers
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    
    // Initialize Supabase client with the token
    const sb = await cc();
    
    // If token is provided, set it for the session
    if (token) {
      await sb.auth.setSession({ access_token: token, refresh_token: '' });
    }
    
    // Get the user
    const {data: u, error: userError} = await sb.auth.getUser();
    const user = u.user;
    if (userError || !user) {
      return NextResponse.json(
        { error: "User authentication failed"},
        { status: 401}
      )
    }
    // Get the current videos array for the user

    const { data: userData, error: fetchError } = await sb
      .from('user_profiles')
      .select('videos')
      .eq('user_id', user.id)
      .maybeSingle(); // Use maybeSingle instead of single to handle no rows case
    if (fetchError) {
      console.error('Error fetching user profile:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch user profile' },
        { status: 500 }
      );
    }
    // Create or update the videos array
    const currentVideos = userData?.videos || [];

    // List videos from storage
    const { data: videos, error: listError } = await supabase.storage
      .from('videos')
      .list();
    
    if (listError) {
      console.error('Error listing videos:', listError);
      return NextResponse.json(
        { error: 'Failed to list videos' },
        { status: 500 }
      );
    }
    
    // Get the public URLs for all videos
    const videoURLs = await Promise.all(
      videos.map(async (file) => {
        const { data: { publicUrl } } = supabase.storage
          .from('videos')
          .getPublicUrl(file.name);
          
        return {
          name: file.name,
          url: publicUrl,
          created_at: file.created_at
        };
      })
    );

    // Filter videos to only include those in currentVideos array
    const filteredVideoURLs = videoURLs.filter(video => 
      currentVideos.includes(video.name)
    );
    
    return NextResponse.json(filteredVideoURLs);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// POST handler to validate bucket existence or get an upload URL
export async function POST(request: NextRequest) {
  try {
    // Parse the request body if it exists
    let requestData = null;
    try {
      requestData = await request.json();
    } catch (e) {
      // No body or invalid JSON, which is fine for basic bucket check
    }
    
    // Check if requesting a signed URL for upload
    if (requestData?.getUploadUrl) {
      const filename = requestData.filename;
      if (!filename) {
        return NextResponse.json(
          { error: 'Filename is required for upload URL' },
          { status: 400 }
        );
      }
      
      console.log('API Route: Generating signed upload URL for:', filename);
      
      // First ensure bucket exists
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        console.error('Error checking buckets:', bucketsError);
        return NextResponse.json(
          { error: 'Failed to check storage buckets' },
          { status: 500 }
        );
      }
      
      // Find videos bucket (case insensitive)
      const videosBucket = buckets.find(bucket => 
        bucket.name.toLowerCase() === 'videos'
      );
      
      if (!videosBucket) {
        // Create videos bucket if it doesn't exist
        const { error: createError } = await supabase.storage.createBucket('videos', {
          public: true
        });
        
        if (createError) {
          console.error('Error creating bucket:', createError);
          return NextResponse.json(
            { error: 'Failed to create videos bucket' },
            { status: 500 }
          );
        }
      }
      
      // Generate signed URL for upload
      const { data, error } = await supabase.storage
        .from('videos')
        .createSignedUploadUrl(filename);
      
      if (error) {
        console.error('Error generating upload URL:', error);
        return NextResponse.json(
          { error: 'Failed to generate upload URL' },
          { status: 500 }
        );
      }
      
      // Return the signed URL and other details
      const { data: { publicUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(filename);
      
      return NextResponse.json({
        ...data,
        publicUrl,
        message: 'Upload URL generated successfully'
      });
    }
    
    // Default behavior - just check if bucket exists
    console.log('API Route: Checking for videos bucket existence...');
    
    // Check if videos bucket exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('Error checking buckets:', bucketsError);
      return NextResponse.json(
        { error: 'Failed to check storage buckets' },
        { status: 500 }
      );
    }
    
    // Find videos bucket (case insensitive)
    const videosBucket = buckets.find(bucket => 
      bucket.name.toLowerCase() === 'videos'
    );
    
    if (!videosBucket) {
      // Create videos bucket if it doesn't exist
      const { error: createError } = await supabase.storage.createBucket('videos', {
        public: true
      });
      
      if (createError) {
        console.error('Error creating bucket:', createError);
        return NextResponse.json(
          { error: 'Failed to create videos bucket' },
          { status: 500 }
        );
      }
      
      return NextResponse.json({ message: 'Videos bucket created successfully' });
    }
    
    return NextResponse.json({ message: 'Videos bucket exists' });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
