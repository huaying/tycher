import {
  type Exam,
  type QuestionOnQuestionSet,
  type Question,
  ExamStatus,
  PrismaClient,
} from "@prisma/client";

const prisma = new PrismaClient();

type IExam = Exam & {
  questionSet: {
    questions: (QuestionOnQuestionSet & {
      question: Question;
    })[];
  };
};
async function updateScore(exam: IExam) {
  const questions = exam.questionSet.questions.map((data) => data.question);

  const score = questions.filter(
    (question, idx) =>
      question.answer === ((exam.answers as number[])[idx] ?? -1) + 1
  ).length;

  await prisma.exam.update({
    where: {
      id: exam.id,
    },
    data: {
      score,
    },
  });
}

async function calculate() {
  try {
    const exams = await prisma.exam.findMany({
      where: { score: { equals: null }, status: ExamStatus.Submitted },
      include: {
        questionSet: {
          select: {
            questions: {
              orderBy: {
                id: "asc",
              },
              include: {
                question: true,
              },
            },
          },
        },
      },
    });

    exams.forEach((exam) => void updateScore(exam));
  } catch (err) {
    console.log(err);
  }
}

void calculate();
