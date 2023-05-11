import { createTRPCRouter } from "~/server/api/trpc";
import { questionRouter } from "./routers/question";
import { topicRouter } from "./routers/topic";
import { examRouter } from "./routers/exam";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  question: questionRouter,
  topic: topicRouter,
  exam: examRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
