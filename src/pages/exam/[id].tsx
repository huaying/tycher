import { type GetServerSideProps, type NextPage } from "next";
import { api } from "~/utils/api";
import { generateSSRHelper } from "~/server/helpers/ssrHelper";
import { Fragment, useState } from "react";
import { ExamStatus } from "@prisma/client";
import { useRouter } from "next/router";
import Layout from "~/components/layout1";
import { Large, P } from "~/components/ui/typography";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Label } from "~/components/ui/label";
import { cn } from "~/lib/utils";
import { Badge } from "~/components/ui/badge";

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
      <div className="mx-auto mt-3 flex max-w-[550px] flex-col">
        {exam?.status === ExamStatus.Submitted && (
          <Large className="my-3">
            Score{" "}
            {
              questions?.filter(
                (question, idx) => question.answer === (answers[idx] ?? -1) + 1
              ).length
            }
            /10
          </Large>
        )}
        {questions && (
          <>
            <div className="flex flex-col gap-5">
              {questions.map((question, questionIdx) => (
                <div key={question.id}>
                  <P>{`${questionIdx + 1}. ${question.content}`}</P>
                  <div className="flex flex-col gap-3 py-3">
                    <RadioGroup>
                      {(question.options as string[]).map(
                        (option, optionIdx) => (
                          <div
                            key={optionIdx}
                            className="flex items-center space-x-2"
                          >
                            <RadioGroupItem
                              value={`${optionIdx}`}
                              id={`option_${questionIdx}_${optionIdx}`}
                              checked={answers[questionIdx] === optionIdx}
                              onClick={() => {
                                exam?.status === null &&
                                  handleAnswerSelect(questionIdx, optionIdx);
                              }}
                            />
                            <Label
                              htmlFor={`option_${questionIdx}_${optionIdx}`}
                              className={cn(
                                exam?.status !== null &&
                                  question.answer === optionIdx + 1 &&
                                  "text-green-600",
                                exam?.status !== null &&
                                  answers[questionIdx] === optionIdx &&
                                  question.answer !== optionIdx + 1 &&
                                  "text-red-600"
                              )}
                            >
                              {option}
                            </Label>
                          </div>
                        )
                      )}
                    </RadioGroup>
                  </div>
                  {exam?.status !== null && (
                    <div className="py-2">
                      <Badge variant="outline">解答</Badge>
                      <div className="mt-2">{question.details}</div>
                    </div>
                  )}
                </div>
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
      </div>
    </Layout>
  );
};

export default Home;
