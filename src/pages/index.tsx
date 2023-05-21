import { type GetServerSideProps, type NextPage } from "next";
import Link from "next/link";
import { api } from "~/utils/api";
import { Fragment } from "react";
import { generateSSRHelper } from "~/server/helpers/ssrHelper";
import Layout from "~/components/layout";

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
    <Layout>
      <div>
        {data?.map((topic) => (
          <Fragment key={topic.id}>
            <div>
              <Link href={`/topic/${topic.name}`}>{`${topic.name}`}</Link>
            </div>
          </Fragment>
        ))}
      </div>
    </Layout>
  );
};

export default Home;
