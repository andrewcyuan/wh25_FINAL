"use client";

import React from "react";
import { Button } from "./ui/button";

interface ProfileButtonProps {
  userEmail: string;
}

export default function ProfileButton({ userEmail }: ProfileButtonProps) {
  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="rounded-full flex items-center justify-center h-8 w-8 p-0 bg-primary/10 hover:bg-primary/20"
      >
        <span className="text-sm font-medium">
          {userEmail.charAt(0).toUpperCase()}
        </span>
      </Button>
    </>
  );
}
