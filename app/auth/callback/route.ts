import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const next = requestUrl.searchParams.get('next') ?? '/dashboard'
    const origin = requestUrl.origin

    if (!code) {
      console.error('No code provided in callback')
      return NextResponse.redirect(`${origin}/sign-in?error=${encodeURIComponent('No authorization code provided')}`)
    }
    // Create a Supabase client
    const supabase = await createClient()

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Auth error:', error)
      return NextResponse.redirect(
        `${origin}/sign-in?error=${encodeURIComponent(error.message)}`
      )
    }

    if (!data.user) {
      console.error('No user data received')
      return NextResponse.redirect(
        `${origin}/sign-in?error=${encodeURIComponent('No user data received')}`
      )
    }

    // Check if user has completed onboarding
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('first_name')
      .eq('user_id', data.user.id)
      .single();

    // If profileError is a 'not found' error, that's okay - it means the user hasn't completed onboarding
    let redirectPath = next;
    
    // If the user doesn't have a profile yet or first_name is null, send them to onboarding
    if (!profileData || !profileData.first_name) {
      redirectPath = '/onboarding';
    }

    // Let Supabase handle setting the cookies via its built-in cookie management
    return NextResponse.redirect(`${origin}${redirectPath}`)
  } catch (error) {
    console.error('Callback error:', error)
    const origin = new URL(request.url).origin
    return NextResponse.redirect(
      `${origin}/sign-in?error=${encodeURIComponent('An unexpected error occurred')}`
    )
  }
}
