import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const questionRouter = createTRPCRouter({
  getByTopic: publicProcedure
    .input(z.object({ name: z.string() }))
    .query(async ({ ctx, input }) => {
      const topic = await ctx.prisma.topic.findUnique({
        where: { name: input.name },
      });

      if (!topic) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return ctx.prisma.question.findMany({
        where: { topicId: topic.id },
      });
    }),
});
