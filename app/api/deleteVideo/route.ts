import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// Initialize Supabase client with service role key to bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false, // Don't persist the session
      autoRefreshToken: false, // Don't auto refresh the token
    },
  }
);

export async function POST(request: NextRequest) {
  const body = await request.json();

  const fileName = body.fileName;

  const { error: deleteError } = await supabase.storage
    .from("videos")
    .remove([fileName]);

  if (deleteError) {
    return NextResponse.json(
        {error: "Error with deleting from supabase"},
        {status: 500}
    );
  }

  return NextResponse.json(
    { message: "File deleted successfully" }
  )
}
