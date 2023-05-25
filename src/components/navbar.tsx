import React from "react";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Large } from "./ui/typography";
import SignInLink from "./sign-in/sign-in-link";
import Image from "next/image";

export default function Navbar({ noLogo }: { noLogo?: boolean }) {
  return (
    <header className="m-3 flex h-[36px] items-center">
      {!noLogo && (
        <Link href="/">
          <div className="flex items-center gap-1">
            <Image src="/tycher.svg" width={28} height={28} alt="Logo" />
            <Large>Tycher來考試</Large>
          </div>
        </Link>
      )}
      <div className="ml-auto flex items-center gap-4">
        <SignedIn>
          <Link href="/me">
            <Large>我的考試</Large>
          </Link>
          <div className="h-[32px] w-[32px] rounded-full">
            <UserButton afterSignOutUrl="/" />
          </div>
        </SignedIn>
        <SignedOut>
          <SignInLink>
            <Button size="sm">登入</Button>
          </SignInLink>
        </SignedOut>
      </div>
    </header>
  );
}
