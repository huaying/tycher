import { type GetServerSideProps, type NextPage } from "next";
import { api } from "~/utils/api";
import { generateSSRHelper } from "~/server/helpers/ssrHelper";
import { Fragment, useState } from "react";
import { ExamStatus } from "@prisma/client";
import { useRouter } from "next/router";
import Layout from "~/components/Layout";

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

  const { push } = useRouter();
  const exam = data?.exam;
  const questions = data?.questions;

  const { mutate: updateAnswers } = api.exam.updateAnswers.useMutation();
  const { mutate: endExam } = api.exam.endExam.useMutation({
    onSuccess: () => push("/me"),
  });

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

  return (
    <Layout>
      {exam?.status === ExamStatus.Submitted && (
        <div>
          Score{" "}
          {
            questions?.filter(
              (question, idx) => question.answer === (answers[idx] ?? -1) + 1
            ).length
          }
          /10
        </div>
      )}
      {questions && (
        <>
          <div>
            {questions.map((question, questionIdx) => (
              <Fragment key={question.id}>
                <div>{`${questionIdx + 1}. ${question.content}`}</div>
                <div>
                  {(question.options as string[]).map((option, optionIdx) => (
                    <div key={optionIdx}>
                      <input
                        type="radio"
                        id={`option_${questionIdx}_${optionIdx}`}
                        name={`question_${questionIdx}_options`}
                        value={optionIdx}
                        defaultChecked={answers[questionIdx] === optionIdx}
                        onChange={() =>
                          handleAnswerSelect(questionIdx, optionIdx)
                        }
                      />
                      <label
                        style={{
                          color:
                            exam?.status !== null
                              ? question.answer === optionIdx + 1
                                ? "green"
                                : answers[questionIdx] === optionIdx &&
                                  question.answer !== optionIdx + 1
                                ? "red"
                                : undefined
                              : undefined,
                        }}
                        htmlFor={`option_${questionIdx}_${optionIdx}`}
                      >
                        {option}
                      </label>
                    </div>
                  ))}
                </div>
                {exam?.status !== null && (
                  <div>
                    Answer: <div>{question.details}</div>
                  </div>
                )}
              </Fragment>
            ))}
          </div>
          {exam?.status === null && (
            <>
              <div>
                <button
                  onClick={() => {
                    endExam({
                      examId,
                      answers,
                      status: ExamStatus.Quitted,
                    });
                  }}
                >
                  Quit
                </button>
              </div>
              <div>
                <button
                  onClick={() =>
                    endExam({
                      examId,
                      answers,
                      status: ExamStatus.Submitted,
                    })
                  }
                >
                  Submit
                </button>
              </div>
            </>
          )}
        </>
      )}
    </Layout>
  );
};

export default Home;
