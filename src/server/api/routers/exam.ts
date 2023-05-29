import {
  type Exam,
  ExamStatus,
  type Question,
  type Topic,
  QuestionOnQuestionSet,
} from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const examRouter = createTRPCRouter({
  getExams: protectedProcedure
    .input(
      z.object({
        status: z.nativeEnum(ExamStatus).nullable(),
        page: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      const PAGE_SIZE = 10;
      const queryExams = async (
        userId: string,
        page: number,
        status: ExamStatus | null
      ) => {
        const offset = (page - 1) * PAGE_SIZE;

        if (status === null) {
          return await ctx.prisma.$queryRaw<
            (Pick<Exam, "id" | "score" | "updatedAt"> & { topicName: string })[]
          >`
            SELECT Exam.id, Exam.score, Exam.updatedAt, Topic.name as topicName
              FROM Exam 
              JOIN QuestionSet ON Exam.questionSetId = QuestionSet.id
              JOIN Topic ON QuestionSet.topicId = Topic.id
              WHERE Exam.userId = ${userId} AND Exam.status IS NULL 
              ORDER BY Exam.updatedAt DESC
              LIMIT ${PAGE_SIZE + 1} OFFSET ${offset}
            `;
        }

        return await ctx.prisma.$queryRaw<
          (Pick<Exam, "id" | "score" | "updatedAt"> & { topicName: string })[]
        >`
            SELECT Exam.id, Exam.score, Exam.updatedAt, Topic.name as topicName
              FROM Exam 
              JOIN QuestionSet ON Exam.questionSetId = QuestionSet.id
              JOIN Topic ON QuestionSet.topicId = Topic.id
              WHERE Exam.userId = ${userId} AND Exam.status = ${status} 
              ORDER BY Exam.updatedAt DESC
              LIMIT ${PAGE_SIZE + 1} OFFSET ${offset}
          `;
      };

      const exams = await queryExams(ctx.auth.userId, input.page, input.status);

      return {
        exams: exams.slice(0, PAGE_SIZE),
        hasNext: exams.length > PAGE_SIZE,
      };
    }),
  getById: protectedProcedure
    .input(z.object({ examId: z.number() }))
    .query(async ({ ctx, input }) => {
      const exam = await ctx.prisma.exam.findFirst({
        where: { id: input.examId, userId: ctx.auth.userId },
        select: {
          answers: true,
          status: true,
          questionSetId: true,
        },
      });

      if (!exam) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Exam not found. Exam ID: ${input.examId}`,
        });
      }

      const topicName = (
        await ctx.prisma.$queryRaw<Topic[]>`
            SELECT Topic.name 
            FROM Topic 
            JOIN QuestionSet 
            ON Topic.id = QuestionSet.topicId
            WHERE QuestionSet.id = ${exam.questionSetId} LIMIT 1
        `
      )?.[0]?.name;

      const questions = await ctx.prisma.$queryRaw<Question[]>`
          SELECT Question.* 
            FROM Question 
            JOIN QuestionOnQuestionSet 
            ON Question.id = QuestionOnQuestionSet.questionId
            WHERE QuestionOnQuestionSet.questionSetId = ${exam.questionSetId}
        `;

      return {
        topicName,
        exam: {
          status: exam.status,
          answers: exam.answers,
        },
        questions: questions.map((question) =>
          exam.status === null
            ? { content: question.content, options: question.options }
            : {
                content: question.content,
                options: question.options,
                answer: question.answer,
                details: question.details,
              }
        ),
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
          select: {
            id: true,
          },
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
      const exam:
        | (Exam & {
            questionSet: {
              questions: (QuestionOnQuestionSet & {
                question: Question;
              })[];
            };
          })
        | null = await ctx.prisma.exam.findFirst({
        where: { id: input.examId },
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

      if (exam === null) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const questions = exam.questionSet.questions.map((data) => data.question);
      const score = questions.filter(
        (question, idx) =>
          question.answer === ((exam.answers as number[])[idx] ?? -1) + 1
      ).length;

      const updated = await ctx.prisma.exam.updateMany({
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
          score,
        },
      });

      if (updated.count === 1) {
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
