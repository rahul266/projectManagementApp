import { postRouter } from "~/server/api/routers/projects";
import { createTRPCRouter, createCallerFactory } from "~/server/api/trpc";
import { ticketsRouter } from "./routers/tickets";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  ticket:ticketsRouter
});

export const createCaller = createCallerFactory(appRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
