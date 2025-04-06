import { EnvVarWarning } from "@/components/env-var-warning";
import HeaderAuth from "@/components/header-auth";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import Link from "next/link";
import "./globals.css";
import HeaderLogo from "@/components/header-logo";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "FarmFlight",
  description: "FarmFlight - Unlimited Insights + Remote Crop Management",
};

// Updated font configuration with proper display settings
const geistSans = Geist({
  subsets: ["latin"],
  display: "fallback", // Changed from "swap" to "fallback" for better performance
  adjustFontFallback: true, // Helps with font fallback behavior
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground flex flex-col min-h-screen">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <nav className="w-full flex justify-center border-b border-b-gray-400 h-16 z-10">
            <div className="w-full max-w-5xl flex flex-row justify-between items-center p-3 px-5 text-sm">
              <div className="flex flex-row md:gap-12 gap-5 align-center justify-start">
                <HeaderLogo />
                <div className="flex flex-row items-center md:text-base text-sm md:gap-9 gap-3">
                </div>
              </div>
              {!hasEnvVars ? <EnvVarWarning /> : <HeaderAuth />}
            </div>
          </nav>

          <main className="flex-grow w-full flex flex-col items-center">
            <div className="w-full flex flex-col items-center">
              <div className="w-full">
                {children}
              </div>
            </div>
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
