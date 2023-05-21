import { type GetServerSideProps, type NextPage } from "next";
import { useRouter } from "next/navigation";
import { api } from "~/utils/api";
import { generateSSRHelper } from "~/server/helpers/ssrHelper";
import Layout from "~/components/layout";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const ssr = generateSSRHelper(context);

  const slug = context.params?.slug;

  if (typeof slug !== "string") throw new Error("no slug");

  await ssr.topic.getTopic.prefetch({ name: slug });

  return {
    props: {
      trpcState: ssr.dehydrate(),
      slug,
    },
  };
};

const TopicPage: NextPage<{ slug: string }> = ({ slug }) => {
  const router = useRouter();
  const { data: topic } = api.topic.getTopic.useQuery({ name: slug });
  const { mutate, isLoading: isPreparingExam } = api.exam.startExam.useMutation(
    {
      onSuccess: (exam) => router.push(`/exam/${exam.id}`),
    }
  );

  return (
    <Layout>
      {topic && (
        <>
          <div>{topic?.name}</div>
          <div>{topic?.description}</div>
          {isPreparingExam ? (
            <div>Preparing</div>
          ) : (
            <button onClick={() => mutate({ topicId: topic?.id })}>
              start
            </button>
          )}
        </>
      )}
    </Layout>
  );
};

export default TopicPage;
