import { createServerSideHelpers } from "@trpc/react-query/server";
import { appRouter } from "~/server/api/root";
import { prisma } from "~/server/db";
import superjson from "superjson";
import { type GetServerSidePropsContext } from "next";
import { getAuth } from "@clerk/nextjs/server";

export const generateSSRHelper = (context: GetServerSidePropsContext) => {
  const auth = getAuth(context.req);

  return createServerSideHelpers({
    router: appRouter,
    ctx: { prisma, auth },
    transformer: superjson, // optional - adds superjson serialization
  });
};
