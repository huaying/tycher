import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { z } from "zod";

export const topicRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.topic.findMany({ select: { name: true, slug: true } });
  }),
  getTopic: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.topic.findUnique({
        where: { slug: input.slug },
        select: { name: true, description: true, id: true },
      });
    }),
});
