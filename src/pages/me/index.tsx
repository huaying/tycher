import { type GetServerSideProps, type NextPage } from "next";
import { api } from "~/utils/api";
import { useUser } from "@clerk/nextjs";
import { generateSSRHelper } from "~/server/helpers/ssrHelper";
import Link from "next/link";
import Layout from "~/components/layout";
import { H2 } from "~/components/ui/typography";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { useState } from "react";
import { ExamStatus } from "@prisma/client";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const ssr = generateSSRHelper(context);

  await ssr.exam.getExams.prefetch({ status: null, page: 1 });

  return {
    props: {
      trpcState: ssr.dehydrate(),
    },
  };
};

type StatusString = "Ongoing" | "Submitted" | "Quitted";
const stringToStatus = (str: StatusString) =>
  ({
    Ongoing: null,
    Submitted: ExamStatus.Submitted,
    Quitted: ExamStatus.Quitted,
  }[str]);

const MePage: NextPage = () => {
  const [status, setStatus] = useState<StatusString>("Ongoing");
  const [page, setPage] = useState(1);
  const { data } = api.exam.getExams.useQuery({
    status: stringToStatus(status),
    page,
  });
  const exams = data?.exams;
  const hasNext = data?.hasNext;
  const user = useUser();

  return (
    <Layout>
      <div className="mx-auto mt-10 flex max-w-[550px] flex-col px-3">
        <H2>Hello! {user?.user?.fullName}</H2>
        <Tabs
          value={status}
          onValueChange={(value) => setStatus(value as StatusString)}
        >
          <TabsList className="mt-10 grid w-full grid-cols-3">
            <TabsTrigger value="Ongoing">做答中</TabsTrigger>
            <TabsTrigger value="Submitted">已提交</TabsTrigger>
            <TabsTrigger value="Quitted">已放棄</TabsTrigger>
          </TabsList>
          <TabsContent value="Ongoing">
            <div>
              {exams?.map((exam) => (
                <Link key={exam.id} href={`/exam/${exam.id}`}>
                  <div>
                    <span>{exam.topicName}</span>
                    <span>{format(exam.timestamp, "yyyy-MM-dd HH:mm:ss")}</span>
                  </div>
                </Link>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="Submitted">
            <div>
              {exams?.map((exam) => (
                <Link key={exam.id} href={`/exam/${exam.id}`}>
                  <div>
                    <span>{exam.topicName}</span>
                    <span>{format(exam.timestamp, "yyyy-MM-dd HH:mm:ss")}</span>
                  </div>
                </Link>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="Quitted">
            <div>
              {exams?.map((exam) => (
                <Link key={exam.id} href={`/exam/${exam.id}`}>
                  <div>
                    <span>{exam.topicName}</span>
                    <span>{format(exam.timestamp, "yyyy-MM-dd HH:mm:ss")}</span>
                  </div>
                </Link>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default MePage;
