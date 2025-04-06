import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export const updateSession = async (request: NextRequest) => {
  try {
    // Create an unmodified response
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            // Set cookie on the request (for the current pass through middleware)
            request.cookies.set({
              name,
              value,
              ...options,
            });
            
            // Set cookie on the response (for the browser)
            response.cookies.set({
              name,
              value,
              ...options,
            });
          },
          remove(name: string, options: any) {
            request.cookies.set({
              name,
              value: '',
              ...options,
              maxAge: 0,
            });
            
            response.cookies.set({
              name,
              value: '',
              ...options,
              maxAge: 0,
            });
          },
        },
      },
    );

    const startsWithAny = (original: string, hitlist: string[]): boolean => {
        for(const hitword of hitlist) {
          if (original.startsWith(hitword)) return true;
        }
        return false;
    }

    // This will refresh session if expired - required for Server Components
    // https://supabase.com/docs/guides/auth/server-side/nextjs
    const { data: { user } } = await supabase.auth.getUser();

    // Skip middleware for API routes
    if (request.nextUrl.pathname.startsWith('/api')) {
      return response;
    }

    // avoid pages under development
    if (startsWithAny(request.nextUrl.pathname, [
      '/consultant',
      '/communities'
    ])) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // social graph only works for users
    if (!user && request.nextUrl.pathname.startsWith("/socialgraph")) {
      return NextResponse.redirect(new URL("/sign-in", request.url))
    }

    // Check if user is authenticated and get their profile
    if (user) {
      // Get user profile
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!request.nextUrl.pathname.startsWith('/onboarding') && 
          (userProfile === null || userProfile.onboarding_complete === false)) {
        return NextResponse.redirect(new URL('/onboarding', request.url));
      }

      if (request.nextUrl.pathname === '/onboarding' && 
          userProfile?.onboarding_complete === true) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }

    // protected routes
    if (request.nextUrl.pathname.startsWith("/protected") && !user) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    //the default homepage is dashboard
    if (request.nextUrl.pathname === "/" && user) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return response;
  } catch (e) {
    // If you are here, a Supabase client could not be created!
    // This is likely because you have not set up environment variables.
    // Check out http://localhost:3000 for Next Steps.
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }
};
