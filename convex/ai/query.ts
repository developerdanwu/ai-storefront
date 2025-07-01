import { vStreamArgs } from "@convex-dev/agent";
import { paginationOptsValidator } from "convex/server";
import { ConvexError, v } from "convex/values";
import { getAiThreadMessages } from "../helpers/getAiThreadMessages";
import { getAiThreads } from "../helpers/getAiThreads";
import { anonymousQuery, authedQuery } from "../procedures";

export const getThreads = authedQuery({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    return getAiThreads(ctx, {
      userId: ctx.user._id,
      paginationOpts: args.paginationOpts,
    }).match(
      (x) => x,
      (e) => {
        throw new ConvexError(e);
      }
    );
  },
});

export const getAnonymousThreads = anonymousQuery({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    if (!ctx.user) {
      return null;
    }

    return getAiThreads(ctx, {
      userId: ctx.user._id,
      paginationOpts: args.paginationOpts,
    }).match(
      (x) => x,
      (e) => {
        throw new ConvexError(e);
      }
    );
  },
});

export const getMessages = authedQuery({
  args: {
    threadId: v.string(),
    paginationOpts: paginationOptsValidator,
    streamArgs: vStreamArgs,
  },
  handler: async (ctx, args) => {
    return getAiThreadMessages(ctx, {
      threadId: args.threadId,
      paginationOpts: args.paginationOpts,
      streamArgs: args.streamArgs,
    }).match(
      (x) => x,
      (e) => {
        throw new ConvexError(e);
      }
    );
  },
});
