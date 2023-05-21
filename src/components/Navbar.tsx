import React from "react";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function Navbar() {
  return (
    <header className="flex items-center">
      <div>Tchyer</div>
      <div className="ml-auto flex items-center gap-4">
        <SignedIn>
          <Link href="/me">My Exam</Link>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
        <SignedOut>
          <Link href="/sign-in">Sign In</Link>
        </SignedOut>
      </div>
    </header>
  );
}
