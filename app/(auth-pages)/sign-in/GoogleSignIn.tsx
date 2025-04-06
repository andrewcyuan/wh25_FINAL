"use client";
import { FormMessage } from "@/components/form-message";
import { supabase } from "@/lib/supabase";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";

// Component that uses useSearchParams
function GoogleSignInContent() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [error, setError] = useState<{ error: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const errorParam = searchParams?.get("error");
    if (errorParam) {
      setError({ error: errorParam });
    } else {
      setError(null);
    }
  }, [searchParams]);

  const handleGoogleSignIn = async () => {
    try {
      const redirectPath = pathname.includes('sign-up') ? '/onboarding' : '/dashboard';
      const redirectUrl = `${window.location.origin}/auth/callback?next=${redirectPath}`;
  
      console.log("Redirecting to:", redirectUrl); // Debugging log
  
      setIsLoading(true);
      setError(null);
  
      const { data, error: signInError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl, // Ensure the correct redirect URL is set 
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          scopes: 'email profile',
        },
      });
  
      if (signInError) {
        console.error('Sign in error:', signInError);
        setError({ error: signInError.message });
        return;
      }
  
    } catch (err) {
      console.error('Unexpected error:', err);
      setError({ error: 'An unexpected error occurred' });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <button
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 dark:text-white dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg className="h-3 w-3 md:h-5 md:w-5" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        <div className="text-xs md:text-sm">

        {isLoading ? 'Signing in...' : 'Sign in with Google'}
        </div>
      </button>
      {error && <FormMessage message={error} />}
    </div>
  );
}

// Main component with Suspense boundary
export default function GoogleSignInButton() {
  return (
    <Suspense fallback={<div className="space-y-4">
      <button
        disabled
        className="w-full flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 dark:text-white dark:border-gray-600 dark:bg-gray-700 opacity-70"
      >
        <svg className="h-5 w-5 opacity-60" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Loading...
      </button>
    </div>}>
      <GoogleSignInContent />
    </Suspense>
  );
}
