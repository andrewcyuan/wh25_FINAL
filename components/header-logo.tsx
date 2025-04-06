// components/header-logo.tsx
'use client';

import Link from 'next/link';

export default function HeaderLogo() {

  return (
    <div className="flex gap-3 items-center font-semibold text-xl">
      {/* <Link href="/" className="hover:underline">
        <Image src="/assets/logo/logo_500.png" alt="Logo" width={50} height={50} className="h-full p-1 aspect-square"/>
      </Link> */}
      <Link href="/">
        <img
          src="/assets/logo/logo_500.png"
          alt="Logo"
          className="hidden md:block w-32 h-20 object-contain" // Hide on mobile (< 768px), show on medium screens and up
        />
      </Link>
    </div>
  );
}