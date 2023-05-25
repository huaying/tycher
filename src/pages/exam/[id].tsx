import { type GetServerSideProps, type NextPage } from "next";
import { api } from "~/utils/api";
import { generateSSRHelper } from "~/server/helpers/ssrHelper";
import { Fragment, useState } from "react";
import { ExamStatus } from "@prisma/client";
import { useRouter } from "next/router";
import Layout from "~/components/layout";
import { H1, Large, P } from "~/components/ui/typography";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Label } from "~/components/ui/label";
import { cn } from "~/lib/utils";
import { Badge } from "~/components/ui/badge";
import { Hash } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import Footer from "~/components/footer";

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
      <div className="mx-auto mt-10 flex max-w-[550px] flex-col px-3">
        <div className="mb-8 flex items-center gap-0.5">
          <Hash size={28} className="text-yellow-500" />
          <H1>{data?.topicName}</H1>
        </div>
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
            <div className="flex flex-col">
              {questions.map((question, questionIdx) => (
                <div key={questionIdx}>
                  <P>{`${questionIdx + 1}. ${question.content}`}</P>
                  <div className="flex flex-col py-2">
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
                                  "font-bold text-green-600",
                                exam?.status !== null &&
                                  answers[questionIdx] === optionIdx &&
                                  question.answer !== optionIdx + 1 &&
                                  "font-bold text-red-600"
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
                      <div className="mt-2 text-sm">{question.details}</div>
                    </div>
                  )}
                  {questionIdx < questions.length - 1 && (
                    <Separator className="my-4" />
                  )}
                </div>
              ))}
            </div>
            {exam?.status === null && (
              <div className="flex justify-end gap-3">
                <Button
                  variant="secondary"
                  onClick={() => {
                    endExam({
                      examId,
                      answers,
                      status: ExamStatus.Quitted,
                    });
                  }}
                >
                  Quit
                </Button>
                <Button
                  onClick={() =>
                    endExam({
                      examId,
                      answers,
                      status: ExamStatus.Submitted,
                    })
                  }
                >
                  Submit
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default Home;
