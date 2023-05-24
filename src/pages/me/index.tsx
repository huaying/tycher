import { type GetServerSideProps, type NextPage } from "next";
import { api } from "~/utils/api";
import { useUser } from "@clerk/nextjs";
import { generateSSRHelper } from "~/server/helpers/ssrHelper";
import Layout from "~/components/layout";
import { H2 } from "~/components/ui/typography";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { useState } from "react";
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

interface ExamTableProps {
  status: StatusString;
  btnStr?: string;
  scored?: boolean;
}
const ExamTable = ({ status, btnStr = "繼續", scored }: ExamTableProps) => {
  const router = useRouter();
  const [page, setPage] = useState(1);
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
              {format(exam.timestamp, "yyyy-MM-dd HH:mm:ss")}
            </TableCell>
            {scored && <TableCell className="p-2">??</TableCell>}
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
          onClick={() => setPage((page) => page - 1)}
          disabled={page === 1}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((page) => page + 1)}
          disabled={!hasNext}
        >
          Next
        </Button>
      </div>
    </>
  );
};

const MePage: NextPage = () => {
  const [status, setStatus] = useState<StatusString>("Ongoing");
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
            <ExamTable status={status} />
          </TabsContent>
          <TabsContent value="Submitted">
            <ExamTable status={status} btnStr="查看" />
          </TabsContent>
          <TabsContent value="Quitted">
            <ExamTable status={status} btnStr="查看" />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default MePage;
