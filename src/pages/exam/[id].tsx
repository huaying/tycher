import { type GetServerSideProps, type NextPage } from "next";
import Head from "next/head";

import { api } from "~/utils/api";
import {
  SignedOut,
  useUser,
  SignInButton,
  SignedIn,
  UserButton,
} from "@clerk/nextjs";
import { generateSSRHelper } from "~/server/helpers/ssrHelper";
import { Fragment, useEffect, useState } from "react";
import { ExamStatus } from "@prisma/client";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const ssr = generateSSRHelper(context);

  const id = context.params?.id;

  if (typeof id !== "string" || Number.isNaN(id)) throw new Error("no examId");

  const examId = Number(id);

  await ssr.exam.getById.prefetch({ examId });

  return {
    props: {
      trpcState: ssr.dehydrate(),
      examId,
    },
  };
};

const Home: NextPage<{ examId: number }> = ({ examId }) => {
  const { data } = api.exam.getById.useQuery({ examId });

  const exam = data?.exam;
  const questions = data?.questions;

  const { mutate: updateAnswers } = api.exam.updateAnswers.useMutation();
  const { mutate: endExam } = api.exam.endExam.useMutation();

  const [answers, setAnwsers] = useState<(number | null)[]>(
    (exam?.answers as (number | null)[] | undefined) ??
      new Array(questions?.length ?? 0).fill(null)
  );

  const handleAnswerSelect = (questionIdx: number, optionIdx: number) => {
    const updated = [...answers];
    updated[questionIdx] = optionIdx;
    setAnwsers(updated);
    updateAnswers({ examId, answers: updated });
  };

  const user = useUser();

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center">
        <SignedIn>
          <UserButton />
          {user?.user?.fullName}
          {questions && (
            <>
              <div>
                {questions.map((question, questionIdx) => (
                  <Fragment key={question.id}>
                    <div>{`${questionIdx + 1}. ${question.content}`}</div>
                    <div>
                      {(question.options as string[]).map(
                        (option, optionIdx) => (
                          <div key={optionIdx}>
                            <input
                              type="radio"
                              id={`option_${questionIdx}_${optionIdx}`}
                              name={`question_${questionIdx}_options`}
                              value={optionIdx}
                              defaultChecked={
                                answers[questionIdx] === optionIdx
                              }
                              onChange={() =>
                                handleAnswerSelect(questionIdx, optionIdx)
                              }
                            />
                            <label
                              htmlFor={`option_${questionIdx}_${optionIdx}`}
                            >
                              {option}
                            </label>
                          </div>
                        )
                      )}
                    </div>
                  </Fragment>
                ))}
              </div>
              <div>
                <button
                  onClick={() => {
                    endExam({ examId, answers, status: ExamStatus.Quitted });
                  }}
                >
                  Quit
                </button>
              </div>
              <div>
                <button
                  onClick={() =>
                    endExam({ examId, answers, status: ExamStatus.Submitted })
                  }
                >
                  Submit
                </button>
              </div>
            </>
          )}
        </SignedIn>
        <SignedOut>
          <SignInButton />
        </SignedOut>
      </main>
    </>
  );
};

export default Home;
