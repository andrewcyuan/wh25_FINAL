import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import { findSimilarForumContent } from '@/utils/db/vectorSearch';
import { createClient as cc } from '@/utils/supabase/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const { prompt, userQuery } = await request.json();
    
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Find similar forum content using vector similarity search
    let forumContext = '';
    if (userQuery) {
      console.log('Performing vector similarity search for query:', userQuery);
      const similarForumContent = await findSimilarForumContent(userQuery);
      
      if (similarForumContent) {
        console.log('Found similar forum content:', similarForumContent);
        forumContext = `
        RELEVANT AGRICULTURAL FORUM DISCUSSION:
        ${similarForumContent}
        `;
      } else {
        console.log('No similar forum content found');
      }
    }

    // Combine the original prompt with the forum context
    const enhancedPrompt = forumContext ? `${prompt}\n\n${forumContext}` : prompt;

    // Initialize Google Generative AI with API key
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    });

    // Get videos to add as context
    const baseUrl = process.env.VERCEL_URL || `http://${request.headers.get('host')}` || 'http://localhost:3000';
    
    // Define type for video objects
    interface VideoInfo {
      name: string;
      url: string;
      created_at: string;
    }
    
    let userVideos: VideoInfo[] = [];
    try {
      // Initialize Supabase client with service role key for storage access
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          auth: {
            persistSession: false,
            autoRefreshToken: false
          }
        }
      );
      
      // Use direct API access instead of fetch to avoid auth issues
      const sb = await cc();
      const {data: u, error: userError} = await sb.auth.getUser();
      const user = u.user;
      
      if (userError || !user) {
        console.log('No authenticated user found:', userError);
        throw new Error('User authentication failed');
      }
      
      // Get the current videos array for the user
      const { data: userData, error: fetchError } = await sb
        .from('user_profiles')
        .select('videos')
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (fetchError) {
        console.error('Error fetching user profile:', fetchError);
        throw new Error('Failed to fetch user profile');
      }
      
      // Create or update the videos array
      const currentVideos = userData?.videos || [];
      
      // List videos from storage using service role client
      const { data: storageVideos, error: listError } = await supabase.storage
        .from('videos')
        .list();
      
      if (listError) {
        console.error('Error listing videos:', listError);
        throw new Error('Failed to list videos');
      }
      
      // Get the public URLs for all videos
      const videoURLs = await Promise.all(
        storageVideos.map(async (file: { name: string; created_at: string }) => {
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
      const filteredVideoURLs = videoURLs.filter((video: { name: string }) => 
        currentVideos.includes(video.name)
      );
      
      userVideos = filteredVideoURLs;
    } catch (error) {
      console.error('Error fetching videos:', error);
      userVideos = [];
    }

    console.log("Verify Videos:", userVideos)
    
    // Process videos and add them as context
    let videoContext = [];
    
    if (userVideos && userVideos.length > 0) {
      console.log(`Found ${userVideos.length} videos to add as context`);
      
      // Process up to 2 videos (to avoid hitting API limits)
      const videosToProcess = userVideos.slice(0, 2);
      
      for (const video of videosToProcess) {
        try {
          console.log(`Processing video: ${video.name}, URL: ${video.url}`);
          
          // Download the video data
          console.log(`Downloading video from ${video.url}`);
          const response = await fetch(video.url);
          if (!response.ok) {
            throw new Error(`Failed to fetch video: ${response.status} ${response.statusText}`);
          }
          
          // Get the array buffer from the response
          const arrayBuffer = await response.arrayBuffer();
          
          // Convert to base64
          const base64Data = Buffer.from(arrayBuffer).toString('base64');
          console.log(`Successfully converted video to base64, size: ${base64Data.length} characters`);
          
          // Add the video to the context using base64 data
          videoContext.push({
            inlineData: {
              mimeType: "video/mp4",
              data: base64Data
            }
          });
          
          console.log(`Added video ${video.name} to context using base64 data`);
          
        } catch (error) {
          console.error(`Error processing video ${video.name}:`, error);
          // Continue with other videos
        }
      }
    }
    
    // Generate content using the model with video context
    const contentItems = [
      { text: enhancedPrompt },
      ...videoContext
    ];
    const result = await model.generateContent(contentItems);
    const response = result.response;
    const text = response.text();
    
    return NextResponse.json({ response: text });
  } catch (error) {
    console.error('Error generating AI response:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI response', details: (error as Error).message },
      { status: 500 }
    );
  }
}
