'use client';

import { useEffect, useState } from 'react';
import { signOutAction } from "@/app/actions";
import { Button } from "./ui/button";
import { createClient } from "@/utils/supabase/client";
import { ThemeSwitcher } from "@/components/theme-switcher";
import ProfileButtonClient from "./profile-button-client";
import GoogleSignInButton from "@/app/(auth-pages)/sign-in/GoogleSignIn";
import type { User } from '@supabase/supabase-js';
import { usePathname } from 'next/navigation';

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    const checkAuthState = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };

    // Check auth state on initial load and homepage visits 
    checkAuthState();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user || null);
    });

    return () => subscription?.unsubscribe();
  }, [pathname]); // Re-run effect when route changes

  return user ? (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <ProfileButtonClient userEmail={user.email || ""} />
      </div>
      <form action={signOutAction} className="flex items-center gap-2">
        <Button type="submit" variant={"outline"}>
          Sign out
        </Button>
        <ThemeSwitcher />
      </form>
    </div>
  ) : (
    <GoogleSignInButton />
  );
}
