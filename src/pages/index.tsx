import { type GetServerSideProps, type NextPage } from "next";
import Link from "next/link";
import { api } from "~/utils/api";
import { Fragment } from "react";
import { generateSSRHelper } from "~/server/helpers/ssrHelper";
import Layout from "~/components/layout";
import { H1, Large } from "~/components/ui/typography";
import { Hash } from "lucide-react";
import { buildClerkProps } from "@clerk/nextjs/server";
import Image from "next/image";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const ssr = generateSSRHelper(context);

  await ssr.topic.getAll.prefetch();

  return {
    props: {
      ...buildClerkProps(context.req),
      trpcState: ssr.dehydrate(),
    },
  };
};

const Home: NextPage = () => {
  const { data } = api.topic.getAll.useQuery();

  return (
    <Layout noLogo>
      <div className="mt-[152px] flex flex-col items-center justify-center">
        <Image src="/tycher.svg" width={64} height={64} alt="Logo" />
        <H1 className="mb-8 mt-4">Tycher 來考試</H1>
        <div className="flex max-w-[490px] flex-wrap justify-center gap-1 space-x-2">
          {data?.map((topic) => (
            <Fragment key={topic}>
              <Link href={`/topic/${topic}`}>
                <div className="flex items-center gap-0.5">
                  <Hash size={16} className="text-yellow-500" />
                  <Large>{topic}</Large>
                </div>
              </Link>
            </Fragment>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Home;
