import { type GetServerSideProps, type NextPage } from "next";
import Link from "next/link";
import { api } from "~/utils/api";
import { Fragment } from "react";
import { generateSSRHelper } from "~/server/helpers/ssrHelper";
import Layout from "~/components/layout";
import { H1, H2, Large } from "~/components/ui/typography";
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
  const { data: topics } = api.topic.getAll.useQuery();

  return (
    <Layout noLogo>
      <div className="flex justify-center px-8 lg:mt-[96px]">
        <div className="flex w-full max-w-[1140px] flex-col items-center lg:items-start">
          <div className="flex max-w-lg flex-col sm:flex-col-reverse">
            <div className="mt-3 ">
              <Image
                src="/tycher.svg"
                width={48}
                height={48}
                alt="Logo"
                className="flex sm:hidden lg:flex"
              />
              <H1 className="mb-4 mt-4">Tycher 來考試</H1>
              <Large className="mb-1 text-muted-foreground">
                {"It's your knowledge. 你的知識， 你的考試。"}
              </Large>
              <Large className="mb-8 text-muted-foreground">
                {"> 請點擊以下任意主題進入考試"}
              </Large>
              <div className="flex  flex-wrap gap-1">
                {topics?.map((topic) => (
                  <Fragment key={topic.slug}>
                    <Link href={`/topic/${topic.slug}`}>
                      <div className="flex items-center gap-0.5">
                        <Hash size={16} className="text-yellow-500" />
                        <Large>{topic.name}</Large>
                      </div>
                    </Link>
                  </Fragment>
                ))}
              </div>
            </div>
            <div className="w-full lg:hidden">
              <Image src="/hero-city.svg" width={800} height={600} alt="Hero" />
            </div>
          </div>
        </div>
        <div className="absolute right-0 hidden w-1/2 lg:flex">
          <Image src="/hero-city.svg" width={800} height={600} alt="Hero" />
        </div>
      </div>
    </Layout>
  );
};

export default Home;
