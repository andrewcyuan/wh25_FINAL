'use client'

import Link from 'next/link'

export default function AuthError() {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="w-full max-w-sm space-y-8 px-4">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold text-destructive">Authentication Error</h1>
          <p className="text-gray-500">There was a problem authenticating your account.</p>
        </div>
        <div className="space-y-4">
          <Link
            href="/sign-in"
            className="w-full flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Return to Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}
