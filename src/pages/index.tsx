import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";

import { api } from "~/utils/api";
import {
  SignedOut,
  useUser,
  SignInButton,
  SignedIn,
  UserButton,
} from "@clerk/nextjs";

const Home: NextPage = () => {
  const hello = api.example.hello.useQuery({ text: "from tRPC" });

  const user = useUser();
  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center">
        <SignedIn>
          <UserButton />
          {user?.user?.fullName}
        </SignedIn>
        <SignedOut>
          <SignInButton />
        </SignedOut>
      </main>
    </>
  );
};

export default Home;
