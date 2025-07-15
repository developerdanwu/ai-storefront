import { vStreamArgs } from "@convex-dev/agent";
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { ResultAsync } from "neverthrow";
import { components } from "../_generated/api";
import { query } from "../_generated/server";
import { createStoreAgent } from "../agents/storeAgent";
import * as Errors from "../errors";
import { getAiThreadMessages } from "../helpers/getAiThreadMessages";
import { getAiThreads } from "../helpers/getAiThreads";
import { searchAiThreads } from "../helpers/searchAiThreads";
import { anonymousQuery, authedQuery } from "../procedures";

export const getThreads = authedQuery({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    return getAiThreads(ctx, components.agent, {
      userId: ctx.user._id,
      paginationOpts: args.paginationOpts,
    }).match(
      (x) => x,
      (e) => Errors.propogateConvexError(e)
    );
  },
});

export const searchThreads = authedQuery({
  args: {
    query: v.string(),
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    return searchAiThreads(ctx, createStoreAgent(components.agent), {
      userId: ctx.user._id,
      query: args.query,
      limit: args.limit,
    }).match(
      (x) => x,
      (e) => Errors.propogateConvexError(e)
    );
  },
});

export const getAnonymousThreads = anonymousQuery({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    if (!ctx.user) {
      return {
        continueCursor: "",
        page: [],
        cursor: null,
        isDone: true,
        pageStatus: null,
        splitCursor: null,
      };
    }

    return getAiThreads(ctx, components.agent, {
      userId: ctx.user._id,
      paginationOpts: args.paginationOpts,
    }).match(
      (x) => x,
      (e) => Errors.propogateConvexError(e)
    );
  },
});

export const searchAnonymousThreads = anonymousQuery({
  args: {
    query: v.string(),
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    return searchAiThreads(ctx, createStoreAgent(components.agent), {
      userId: ctx.user._id,
      query: args.query,
      limit: args.limit,
    }).match(
      (x) => x,
      (e) => Errors.propogateConvexError(e)
    );
  },
});

export const getThreadMessages = authedQuery({
  args: {
    threadId: v.string(),
    paginationOpts: paginationOptsValidator,
    streamArgs: vStreamArgs,
  },
  handler: async (ctx, args) => {
    return getAiThreadMessages(ctx, createStoreAgent(components.agent), {
      threadId: args.threadId,
      paginationOpts: args.paginationOpts,
      streamArgs: args.streamArgs,
      userId: ctx.user._id,
    }).match(
      (x) => x,
      (e) => {
        Errors.propogateConvexError(e);
      }
    );
  },
});

export const getAnonymousThreadMessages = anonymousQuery({
  args: {
    threadId: v.string(),
    paginationOpts: paginationOptsValidator,
    streamArgs: vStreamArgs,
  },
  handler: async (ctx, args) => {
    return getAiThreadMessages(ctx, createStoreAgent(components.agent), {
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

export const needMigration = authedQuery({
  args: {
    anonymousUserId: v.optional(v.union(v.id("users"), v.null())),
  },
  handler: async (ctx, args) => {
    if (!args.anonymousUserId) {
      return false;
    }

    return await getAiThreads(ctx, components.agent, {
      userId: args.anonymousUserId,
      paginationOpts: {
        numItems: 1,
        cursor: null,
      },
    }).match(
      (x) => !!x,
      (e) => Errors.propogateConvexError(e)
    );
  },
});

export const getAiAgentProfile = query({
  args: {},
  handler: async (ctx) => {
    const agentPersona = await ResultAsync.fromPromise(
      ctx.db
        .query("aiAgentPersona")
        .withIndex("agentId", (q) => q.eq("agentId", "store_agent"))
        .unique(),
      (e) =>
        Errors.aiAgentPersonaNotFound({
          message: "Ai agent persona not found",
        })
    ).match(
      (x) => x,
      (e) => Errors.propogateConvexError(e)
    );
    let profilePicUrl: null | string = null;
    if (agentPersona?.profilePictureStorageId) {
      profilePicUrl = await ResultAsync.fromPromise(
        ctx.storage.getUrl(agentPersona.profilePictureStorageId),
        () => null
      ).match(
        (x) => x,
        () => null
      );
    }

    return {
      ...agentPersona,
      url: profilePicUrl,
    };
  },
});
