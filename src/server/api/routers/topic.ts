import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { z } from "zod";

export const topicRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.topic.findMany();
  }),
  getTopic: publicProcedure
    .input(z.object({ name: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.topic.findUnique({ where: { name: input.name } });
    }),
});
