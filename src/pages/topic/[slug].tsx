import { type GetServerSideProps, type NextPage } from "next";
import { useRouter } from "next/navigation";
import { api } from "~/utils/api";
import { generateSSRHelper } from "~/server/helpers/ssrHelper";
import Layout from "~/components/layout";
import { Hash } from "lucide-react";
import { H1, Small } from "~/components/ui/typography";
import { Button } from "~/components/ui/button";
import { buildClerkProps } from "@clerk/nextjs/server";
import { useAuth } from "@clerk/nextjs";
import SignInLink from "~/components/sign-in/sign-in-link";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const ssr = generateSSRHelper(context);

  const slug = context.params?.slug;

  if (typeof slug !== "string") throw new Error("no slug");

  await ssr.topic.getTopic.prefetch({ name: slug });

  return {
    props: {
      ...buildClerkProps(context.req),
      trpcState: ssr.dehydrate(),
      slug,
    },
  };
};

const TopicPage: NextPage<{ slug: string }> = ({ slug }) => {
  const router = useRouter();
  const auth = useAuth();
  const { data: topic } = api.topic.getTopic.useQuery({ name: slug });
  const {
    mutate,
    isLoading: isPreparingExam,
    isSuccess: isPreparingExamSuccess,
  } = api.exam.startExam.useMutation({
    onSuccess: (exam) => router.push(`/exam/${exam.id}`),
  });

  return (
    <Layout>
      {topic && (
        <div className="mt-[152px] flex flex-col items-center justify-center">
          <div className="flex items-center gap-0.5">
            <Hash size={24} className="text-yellow-500" />
            <H1>{topic.name}</H1>
          </div>
          <div>{topic?.description}</div>

          <div className="mt-4">
            {!auth.isSignedIn ? (
              <div className="flex flex-col items-center gap-4">
                <Button size="lg" disabled>
                  開始考試
                </Button>
                <Small>
                  考試前請先
                  <SignInLink>
                    <span className="font-bold text-blue-600 underline">
                      登入
                    </span>
                  </SignInLink>
                </Small>
              </div>
            ) : isPreparingExam || isPreparingExamSuccess ? (
              <div>考試準備中...</div>
            ) : (
              <Button size="lg" onClick={() => mutate({ topicId: topic?.id })}>
                開始考試
              </Button>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
};

export default TopicPage;
