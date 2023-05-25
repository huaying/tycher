import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { z } from "zod";

export const topicRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const topics = await ctx.prisma.topic.findMany({ select: { name: true } });
    return topics.map((topic) => topic.name);
  }),
  getTopic: publicProcedure
    .input(z.object({ name: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.topic.findUnique({
        where: { name: input.name },
        select: { name: true, description: true, id: true },
      });
    }),
});
