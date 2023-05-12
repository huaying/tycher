import React, { type ReactNode } from "react";
import Layout from "./Layout";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <Layout>
      <SignedIn>
        <UserButton />
        <Link href="/me">My Exam</Link>
        {children}
      </SignedIn>
      <SignedOut>
        <SignInButton />
      </SignedOut>
    </Layout>
  );
}
