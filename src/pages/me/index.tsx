import { type GetServerSideProps, type NextPage } from "next";
import { api } from "~/utils/api";
import { useUser } from "@clerk/nextjs";
import { generateSSRHelper } from "~/server/helpers/ssrHelper";
import Link from "next/link";
import AuthLayout from "~/components/AuthLayout";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const ssr = generateSSRHelper(context);

  await ssr.exam.getExams.prefetch();

  return {
    props: {
      trpcState: ssr.dehydrate(),
    },
  };
};

const MePage: NextPage = () => {
  const { data: exams } = api.exam.getExams.useQuery();

  const user = useUser();

  return (
    <AuthLayout>
      Hello {user?.user?.fullName}
      {exams?.map((exam) => (
        <Link key={exam.id} href={`/exam/${exam.id}`}>
          <span>{exam.topicName}</span>
          <span>{exam.timestamp.toString()}</span>
          <span>{exam.status ?? "Ongoing"}</span>
        </Link>
      ))}
    </AuthLayout>
  );
};

export default MePage;
