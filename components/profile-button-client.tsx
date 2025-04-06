"use client";

import React from "react";
import ProfileButton from "./profile-button";

interface ProfileButtonClientProps {
  userEmail: string;
}

export default function ProfileButtonClient({ userEmail }: ProfileButtonClientProps) {
  return <ProfileButton userEmail={userEmail} />;
}
