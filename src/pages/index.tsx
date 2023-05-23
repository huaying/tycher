import { type GetServerSideProps, type NextPage } from "next";
import Link from "next/link";
import { api } from "~/utils/api";
import { Fragment } from "react";
import { generateSSRHelper } from "~/server/helpers/ssrHelper";
import Layout from "~/components/layout1";
import { H1, Large } from "~/components/ui/typography";
import { Hash } from "lucide-react";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const ssr = generateSSRHelper(context);

  await ssr.topic.getAll.prefetch();

  return {
    props: {
      trpcState: ssr.dehydrate(),
    },
  };
};

const Home: NextPage = () => {
  const { data } = api.topic.getAll.useQuery();

  return (
    <Layout noLogo>
      <div className="mt-[152px] flex flex-col items-center justify-center">
        <H1 className="mb-8">Tycher 來考試</H1>
        <div className="flex max-w-[490px] flex-wrap justify-center gap-1 space-x-2">
          {data?.map((topic) => (
            <Fragment key={topic.id}>
              <Link href={`/topic/${topic.name}`}>
                <div className="flex items-center gap-0.5">
                  <Hash size={16} className="text-yellow-500" />
                  <Large>{topic.name}</Large>
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
