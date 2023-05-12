import { type Exam, ExamStatus, type Question } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const examRouter = createTRPCRouter({
  getExams: protectedProcedure.query(async ({ ctx }) => {
    const exams = await ctx.prisma.$queryRaw<(Exam & { topicName: string })[]>`
      SELECT Exam.*, Topic.name as topicName
        FROM Exam 
        JOIN QuestionSet ON Exam.questionSetId = QuestionSet.id
        JOIN Topic ON QuestionSet.topicId = Topic.id
        WHERE Exam.userId = ${ctx.auth.userId}
    `;

    return exams;
  }),
  getById: protectedProcedure
    .input(z.object({ examId: z.number() }))
    .query(async ({ ctx, input }) => {
      const exam = await ctx.prisma.exam.findFirst({
        where: { id: input.examId, userId: ctx.auth.userId },
      });

      if (!exam) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Exam not found. Exam ID: ${input.examId}`,
        });
      }

      const questions = await ctx.prisma.$queryRaw<Question[]>`
          SELECT Question.* 
            FROM Question 
            JOIN QuestionOnQuestionSet 
            ON Question.id = QuestionOnQuestionSet.questionId
            WHERE QuestionOnQuestionSet.questionSetId = ${exam.questionSetId}
        `;

      return {
        exam,
        questions,
      };
    }),
  startExam: protectedProcedure
    .input(
      z.object({
        topicId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.auth.userId;

      return await ctx.prisma.$transaction(async (tx) => {
        const questionSet = await tx.questionSet.create({
          data: {
            topicId: input.topicId,
          },
        });

        await tx.$executeRaw`
          INSERT INTO QuestionOnQuestionSet (questionId, questionSetId) 
            (SELECT DISTINCT Question.id, ${questionSet.id}
              FROM Question 
              JOIN Topic 
              ON Question.topicId = ${input.topicId} 
              ORDER BY RAND() LIMIT 10
            );
        `;

        return await tx.exam.create({
          data: { userId, questionSetId: questionSet.id },
        });
      });
    }),
  endExam: protectedProcedure
    .input(
      z.object({
        examId: z.number(),
        status: z.nativeEnum(ExamStatus),
        answers: z.number().nullable().array(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      console.log(input);

      const exams = await ctx.prisma.exam.updateMany({
        where: {
          id: input.examId,
          userId: ctx.auth.userId,
          status: {
            equals: null,
          },
        },
        data: {
          answers: input.answers,
          status: input.status,
        },
      });

      if (exams.count === 1) {
        return {
          examId: input.examId,
        };
      }

      throw new TRPCError({ code: "NOT_FOUND" });
    }),
  updateAnswers: protectedProcedure
    .input(
      z.object({
        examId: z.number(),
        answers: z.number().nullable().array(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.exam.updateMany({
        where: { id: input.examId, userId: ctx.auth.userId },
        data: {
          answers: input.answers,
        },
      });
    }),
});
