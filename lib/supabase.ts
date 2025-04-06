'use client'

import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Use the default cookie handling provided by Supabase
export const supabase = createBrowserClient(
  supabaseUrl,
  supabaseAnonKey
)
