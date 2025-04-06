"use client";
import { FormMessage } from "@/components/form-message";
import { supabase } from "@/lib/supabase";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";

// Component that uses useSearchParams
function HomepageGoogleSignInContent() {
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

      console.log("Supabase OAuth Response:", data);
      console.log("Supabase OAuth Error:", signInError);
  
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
        className="w-full flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-white hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed bg-green-500"
      >
        {isLoading ? 'Signing in...' : 'Sign in With Google to View Crop Analytics'}
      </button>
      {error && <FormMessage message={error} />}
    </div>
  );
}

// Main component with Suspense boundary 
export default function HomepageGoogleSignInButton() {
  return (
    <Suspense fallback={<div className="space-y-4">
      <button
        disabled
        className="w-full flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-white bg-primary opacity-70"
      >
        Loading...
      </button>
    </div>}>
      <HomepageGoogleSignInContent />
    </Suspense>
  );
}
