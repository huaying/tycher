import { type GetServerSideProps, type NextPage } from "next";
import { api } from "~/utils/api";
import { useUser } from "@clerk/nextjs";
import { generateSSRHelper } from "~/server/helpers/ssrHelper";
import Layout from "~/components/layout";
import { H2 } from "~/components/ui/typography";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { ExamStatus } from "@prisma/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import { useRouter } from "next/router";
import { Hash } from "lucide-react";
import { buildClerkProps } from "@clerk/nextjs/server";
import { extractSingleQuery } from "~/utils/query";

const statusString = ["ongoing", "submitted", "quitted"] as const;

type StatusString = (typeof statusString)[number];

const stringToStatus = (str: string | undefined) => {
  const _map: { [k: string]: ExamStatus | null } = {
    ongoing: null,
    submitted: ExamStatus.Submitted,
    quitted: ExamStatus.Quitted,
  };

  return _map[str ?? "ongoing"] ?? null;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const ssr = generateSSRHelper(context);

  const page = Number(extractSingleQuery(context.query?.page)) || 1;
  const rawStatus = extractSingleQuery(context.params?.status);
  const status = statusString.includes(rawStatus as StatusString)
    ? rawStatus
    : statusString[0];

  await ssr.exam.getExams.prefetch({ status: stringToStatus(status), page });

  return {
    props: {
      ...buildClerkProps(context.req),
      page,
      status,
      trpcState: ssr.dehydrate(),
    },
  };
};

interface ExamTableProps {
  status: StatusString;
  page: number;
  btnStr?: string;
  scored?: boolean;
}

const ExamTable = ({
  status,
  btnStr = "繼續",
  scored,
  page,
}: ExamTableProps) => {
  const router = useRouter();
  const { data } = api.exam.getExams.useQuery({
    status: stringToStatus(status),
    page,
  });
  const exams = data?.exams;
  const hasNext = data?.hasNext;

  const table = (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="p-2">考試項目</TableHead>
          <TableHead className="p-2">時間</TableHead>
          {scored && <TableHead className="p-2">成績</TableHead>}
          <TableHead className="p-2 text-right"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {exams?.map((exam) => (
          <TableRow key={exam.id} className="hover:bg-inherit">
            <TableCell className="p-2">
              <div className="flex items-center">
                <Hash size={14} className="text-yellow-500" />
                <div className="font-black leading-4">{exam.topicName}</div>
              </div>
            </TableCell>
            <TableCell className="p-2">
              {format(exam.updatedAt, "yyyy-MM-dd HH:mm:ss")}
            </TableCell>
            {scored && <TableCell className="p-2">{exam.score}/10</TableCell>}
            <TableCell className="p-2 text-right">
              <Button
                size="sm"
                variant="outline"
                onClick={() => void router.push(`/exam/${exam.id}`)}
              >
                {btnStr}
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <>
      {table}
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          disabled={page === 1}
          onClick={() => void router.replace(`/me/${status}?page=${page - 1}`)}
        >
          前一頁
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={!hasNext}
          onClick={() => void router.replace(`/me/${status}?page=${page + 1}`)}
        >
          下一頁
        </Button>
      </div>
    </>
  );
};

const MePage: NextPage<{ page: number; status: string }> = ({
  page,
  status,
}) => {
  const router = useRouter();
  const user = useUser();

  return (
    <Layout>
      <div className="mx-auto mt-10 flex max-w-[550px] flex-col px-3">
        <H2>Hello! {user?.user?.fullName}</H2>
        <Tabs
          value={status}
          onValueChange={(value) =>
            void router.replace(`/me/${value as StatusString}`)
          }
        >
          <TabsList className="mt-10 grid w-full grid-cols-3">
            <TabsTrigger value="ongoing">做答中</TabsTrigger>
            <TabsTrigger value="submitted">已提交</TabsTrigger>
            <TabsTrigger value="quitted">已放棄</TabsTrigger>
          </TabsList>
          <TabsContent value="ongoing">
            <ExamTable status="ongoing" page={page} />
          </TabsContent>
          <TabsContent value="submitted">
            <ExamTable status="submitted" btnStr="查看" scored page={page} />
          </TabsContent>
          <TabsContent value="quitted">
            <ExamTable status="quitted" btnStr="查看" page={page} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default MePage;
