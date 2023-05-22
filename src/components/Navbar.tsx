import React from "react";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Large } from "./ui/typography";

export default function Navbar({ noLogo }: { noLogo?: boolean }) {
  return (
    <header className="m-3 flex items-center">
      {!noLogo && (
        <Link href="/">
          <Large>Tycher來考試</Large>
        </Link>
      )}
      <div className="ml-auto flex items-center gap-4">
        <SignedIn>
          <Link href="/me">
            <Large>我的考試</Large>
          </Link>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
        <SignedOut>
          <Link href="/sign-in">
            <Button size="sm">登入</Button>
          </Link>
        </SignedOut>
      </div>
    </header>
  );
}
