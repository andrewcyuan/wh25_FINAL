import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// POST handler to add a video to the user's videos column
export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const { videoFileName } = await request.json();
    
    if (!videoFileName) {
      return NextResponse.json(
        { error: 'Video filename is required' },
        { status: 400 }
      );
    }

    console.log("ADDVIDEO: video file name", videoFileName);
        
    const supabase = await createClient();
    
    const {data: u , error: userError} = await supabase.auth.getUser();
    const user = u.user;
    if (userError || !user) {
      return NextResponse.json(
        { error: "User error no user"},
        { status: 500}
      )
    }
    
    // Get the current videos array for the user
    console.log('[API DEBUG] Fetching videos for user ID:', user.id);
    const { data: userData, error: fetchError } = await supabase
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

    console.log("Current Videos:", currentVideos)

    const updatedVideos = [...currentVideos, videoFileName];

    console.log("Updated Videos:", updatedVideos)
    
    // Update the user's profile with the new videos array
    console.log('[API DEBUG] Updating videos for user ID:', user.id);
    console.log('[API DEBUG] New videos array:', updatedVideos);
    
    const { data, error: updateError } = await supabase
        .from('user_profiles')
        .update({ videos: updatedVideos })
        .eq('user_id', user.id)
        .select();
    
    if (data) {
      console.log('[API DEBUG] Update successful, returned data:', data);
    }
    
    if (updateError) {
      console.error('Error updating user profile:', updateError);
      return NextResponse.json(
        { error: 'Failed to update user profile' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      message: 'Video added to user profile successfully',
      videos: updatedVideos
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
