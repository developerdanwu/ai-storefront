import { vStreamArgs } from "@convex-dev/agent";
import { paginationOptsValidator } from "convex/server";
import { ConvexError, v } from "convex/values";
import { storeAgent } from "../agents/storeAgent";
import { getAiThreadMessages } from "../helpers/getAiThreadMessages";
import { getAiThreads } from "../helpers/getAiThreads";
import { anonymousQuery, authedMutation, authedQuery } from "../procedures";

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

export const test = authedMutation({
  args: {},
  handler: async (ctx) => {
    const test = await storeAgent.updateThreadMetadata(ctx, {
      threadId: "test",
      patch: {
        userId: "s",
      },
    });
  },
});

export const needMigration = authedQuery({
  args: {
    anonymousUserId: v.optional(v.union(v.id("users"), v.null())),
  },
  handler: async (ctx, args) => {
    if (!args.anonymousUserId) {
      return false;
    }

    return await getAiThreads(ctx, {
      userId: args.anonymousUserId,
      paginationOpts: {
        numItems: 1,
        cursor: null,
      },
    }).match(
      (x) => !!x,
      (e) => {
        throw new ConvexError(e);
      }
    );
  },
});
