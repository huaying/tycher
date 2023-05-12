import { type Question } from "@prisma/client";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const questionRouter = createTRPCRouter({
  getByTopic: publicProcedure
    .input(z.object({ name: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.$queryRaw<Question[]>`SELECT Question.
      * FROM Question RIGHT JOIN Topic ON Question.topicId = Topic.id WHERE Topic.name = ${input.name} LIMIT 10;`;
    }),
});
