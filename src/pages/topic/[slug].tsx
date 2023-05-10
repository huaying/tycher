import { GetServerSideProps, type NextPage } from "next";
import Head from "next/head";

import { api } from "~/utils/api";
import {
  SignedOut,
  useUser,
  SignInButton,
  SignedIn,
  UserButton,
} from "@clerk/nextjs";
import { Fragment } from "react";
import { generateSSRHelper } from "~/server/helpers/ssrHelper";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const ssr = generateSSRHelper();

  const slug = context.params?.slug;

  if (typeof slug !== "string") throw new Error("no slug");

  await ssr.question.getByTopic.prefetch({ name: slug });

  return {
    props: {
      trpcState: ssr.dehydrate(),
      slug,
    },
  };
};

const Home: NextPage<{ slug: string }> = ({ slug }) => {
  const { data } = api.question.getByTopic.useQuery({ name: slug });
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
          <div>
            {data?.map((question, idx) => (
              <Fragment key={question.id}>
                <div>{`${idx} ${question.content}`}</div>
                <div>
                  {(question.options as string[]).map((option) => (
                    <div>{option}</div>
                  ))}
                </div>
              </Fragment>
            ))}
          </div>
        </SignedIn>
        <SignedOut>
          <SignInButton />
        </SignedOut>
      </main>
    </>
  );
};

export default Home;
