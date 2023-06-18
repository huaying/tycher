import { type GetStaticProps, type InferGetStaticPropsType } from "next";
import { useRouter } from "next/navigation";
import { api } from "~/utils/api";
import { generateSSGHelper } from "~/server/helpers/ssrHelper";
import Layout from "~/components/layout";
import { Hash } from "lucide-react";
import { H1, Large, Small } from "~/components/ui/typography";
import { Button } from "~/components/ui/button";
import { useAuth } from "@clerk/nextjs";
import SignInLink from "~/components/sign-in/sign-in-link";
import { Topic } from "@prisma/client";

export const getStaticPaths = async () => {
  const ssg = generateSSGHelper();
  const topics = await ssg.topic.getAll.fetch();
  const paths = topics.map((topic) => ({
    params: { slug: topic.slug },
  }));

  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const ssg = generateSSGHelper();
  const slug = params?.slug;

  if (typeof slug !== "string") throw new Error("no slug");

  await ssg.topic.getTopic.prefetch({ slug });

  return {
    props: { slug, trpcState: ssg.dehydrate() },
  };
};

const TopicPage = ({ slug }: { slug: string }) => {
  const router = useRouter();
  const auth = useAuth();
  const { data: topic } = api.topic.getTopic.useQuery({ slug });
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
        <div className="mx-8 mt-[96px] flex flex-col items-center justify-center">
          <div className="flex items-center gap-0.5">
            <Hash size={24} className="text-yellow-500" />
            <H1>{topic.name}</H1>
          </div>
          {topic?.description && (
            <Large className="mt-8 max-w-md text-muted-foreground">
              {topic?.description}
            </Large>
          )}
          <div className="mt-8">
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
