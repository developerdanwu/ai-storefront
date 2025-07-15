import { vStreamArgs } from "@convex-dev/agent";
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { errAsync, ok, ResultAsync } from "neverthrow";
import { components } from "../../_generated/api";
import { internalQuery } from "../../_generated/server";
import { createPlaygroundAgent } from "../../agents/playgroundAgent";
import { createStoreAgent } from "../../agents/storeAgent";
import * as Errors from "../../errors";
import { getAiThreadMessages } from "../../helpers/getAiThreadMessages";
import { getAiThreads } from "../../helpers/getAiThreads";
import { authedQuery } from "../../procedures";

export const getAiPersonas = authedQuery({
  args: {},
  handler: async (ctx) => {
    return ResultAsync.fromPromise(
      ctx.db
        .query("aiAgentPersona")
        .withIndex("userId", (q) => q.eq("userId", ctx.user._id))
        .collect(),
      (e) =>
        Errors.getAiAgentPersonaFailed({
          message: "Failed to get ai agent personas",
          error: e,
        })
    ).match(
      (x) => x,
      (e) => Errors.propogateConvexError(e)
    );
  },
});

export const _getAiPersona = internalQuery({
  args: {
    aiAgentPersonaId: v.id("aiAgentPersona"),
  },
  handler: async (ctx, args) => {
    return ResultAsync.fromPromise(ctx.db.get(args.aiAgentPersonaId), (e) =>
      Errors.getAiAgentPersonaFailed({
        message: "Failed to get ai persona",
        error: e,
      })
    )
      .andThen((x) => {
        if (!x) {
          return errAsync(
            Errors.aiAgentPersonaNotFound({
              message: "Ai agent persona not found",
            })
          );
        }
        return ok(x);
      })
      .match(
        (x) => x,
        (e) => Errors.propogateConvexError(e)
      );
  },
});

export const getPlaygroundThreads = authedQuery({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    return ResultAsync.fromPromise(
      ctx.runQuery(components.playgroundAgent.threads.listThreadsByUserId, {
        userId: ctx.user._id,
        paginationOpts: args.paginationOpts,
      }),
      (e) =>
        Errors.getAiThreadsFailed({
          message: "Failed to get playground threads",
          error: e,
        })
    ).match(
      (x) => x,
      (e) => Errors.propogateConvexError(e)
    );
  },
});

export const getPlaygroundThreadMessages = authedQuery({
  args: {
    threadId: v.string(),
    paginationOpts: paginationOptsValidator,
    streamArgs: vStreamArgs,
  },
  handler: async (ctx, args) => {
    const agent = createPlaygroundAgent({
      name: "Playground Agent",
    });
    return ResultAsync.fromPromise(
      agent.listMessages(ctx, {
        threadId: args.threadId,
        paginationOpts: args.paginationOpts,
      }),
      (e) =>
        Errors.getAiThreadMessagesFailed({
          message: "Failed to get playground thread messages",
          error: e,
        })
    )
      .andThen((messages) => {
        return ResultAsync.fromPromise(
          agent.syncStreams(ctx, {
            threadId: args.threadId,
            streamArgs: args.streamArgs,
          }),
          (e) =>
            Errors.getAiThreadMessagesFailed({
              message: "Failed to sync streams",
              error: e,
            })
        ).andThen((streams) => {
          return ok({ ...messages, streams });
        });
      })
      .match(
        (x) => x,
        (e) => Errors.propogateConvexError(e)
      );
  },
});

export const getKaolinThreads = authedQuery({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    return getAiThreads(ctx, components.kaolinAgent, {
      userId: ctx.user._id,
      paginationOpts: args.paginationOpts,
    }).match(
      (x) => x,
      (e) => Errors.propogateConvexError(e)
    );
  },
});

export const getKaolinThreadMessages = authedQuery({
  args: {
    threadId: v.string(),
    paginationOpts: paginationOptsValidator,
    streamArgs: vStreamArgs,
  },
  handler: async (ctx, args) => {
    return getAiThreadMessages(ctx, createStoreAgent(components.kaolinAgent), {
      threadId: args.threadId,
      paginationOpts: args.paginationOpts,
      streamArgs: args.streamArgs,
      userId: ctx.user._id,
    }).match(
      (x) => x,
      (e) => Errors.propogateConvexError(e)
    );
  },
});
