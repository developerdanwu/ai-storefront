import { ConvexError, v } from "convex/values";
import { components } from "../_generated/api";
import { internalAction } from "../_generated/server";
import { createStoreAgent } from "../agents/storeAgent";
import * as Errors from "../errors";
import { continueAiThread } from "../helpers/continueAiThread";
import { continueAiThreadStream } from "../helpers/continueAiThreadStream";
import { createThread as createThreadHelper } from "../helpers/createThread";
import { generateSummaryTitle } from "../helpers/generateSummaryTitle";
import { rateLimit } from "../helpers/rateLimit";
import { anonymousAction, authedAction } from "../procedures";

export const createThread = authedAction({
  args: {
    prompt: v.string(),
  },
  handler: async (ctx, args) => {
    await rateLimit(ctx, {
      name: "createAiThread",
      key: ctx.user._id,
    }).match(
      (x) => x,
      (e) => Errors.propogateConvexError(e)
    );

    const { threadId } = await createThreadHelper(
      ctx,
      createStoreAgent(components.agent),
      {
        prompt: args.prompt,
        userId: ctx.user._id,
      }
    ).match(
      (x) => x,
      (e) => Errors.propogateConvexError(e)
    );

    return { threadId };
  },
});

export const createAnonymousThread = anonymousAction({
  args: {
    prompt: v.string(),
  },
  handler: async (ctx, args) => {
    await rateLimit(ctx, {
      name: "createAiThread",
      key: ctx.anonymousUserId,
    }).match(
      (x) => x,
      (e) => {
        throw new ConvexError(e);
      }
    );
    const { threadId } = await createThreadHelper(
      ctx,
      createStoreAgent(components.agent),
      {
        prompt: args.prompt,
        userId: ctx.anonymousUserId,
      }
    ).match(
      (x) => x,
      (e) => Errors.propogateConvexError(e)
    );

    return {
      threadId: threadId,
      userId: ctx.anonymousUserId,
    };
  },
});

export const continueThread = authedAction({
  args: {
    threadId: v.string(),
    prompt: v.optional(v.string()),
    promptMessageId: v.optional(v.string()),
    disableStream: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await rateLimit(ctx, {
      name: "sendAIMessage",
      key: ctx.user._id,
    }).match(
      (x) => x,
      (e) => Errors.propogateConvexError(e)
    );

    if (args.disableStream) {
      return continueAiThread(ctx, createStoreAgent(components.agent), {
        threadId: args.threadId,
        prompt: args.prompt,
        promptMessageId: args.promptMessageId,
        userId: ctx.user._id,
      });
    }

    return continueAiThreadStream(ctx, createStoreAgent(components.agent), {
      threadId: args.threadId,
      prompt: args.prompt,
      promptMessageId: args.promptMessageId,
      userId: ctx.user._id,
    });
  },
});

export const _generateThreadTitle = internalAction({
  args: {
    prompt: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    return await generateSummaryTitle(ctx, {
      prompt: args.prompt,
    }).match(
      (x) => x.text,
      (e) => {
        throw new ConvexError(e);
      }
    );
  },
});

export const continueAnonymousThread = anonymousAction({
  args: {
    threadId: v.string(),
    prompt: v.string(),
    promptMessageId: v.optional(v.string()),
    disableStream: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await rateLimit(ctx, {
      name: "sendAIMessage",
      key: ctx.anonymousUserId,
    }).match(
      (x) => x,
      (e) => Errors.propogateConvexError(e)
    );

    if (args.disableStream) {
      const { text } = await continueAiThread(
        ctx,
        createStoreAgent(components.agent),
        {
          threadId: args.threadId,
          prompt: args.prompt,
          promptMessageId: args.promptMessageId,
          userId: ctx.anonymousUserId,
        }
      ).match(
        (x) => x,
        (e) => Errors.propogateConvexError(e)
      );
      return text;
    }

    const text = await continueAiThreadStream(
      ctx,
      createStoreAgent(components.agent),
      {
        threadId: args.threadId,
        prompt: args.prompt,
        promptMessageId: args.promptMessageId,
        userId: ctx.anonymousUserId,
      }
    ).match(
      (x) => x,
      (e) => Errors.propogateConvexError(e)
    );

    return text;
  },
});

export const deleteAiThread = authedAction({
  args: {
    threadId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.runAction(components.agent.threads.deleteAllForThreadIdSync, {
      threadId: args.threadId,
    });
  },
});

export const deleteAnonymousAiThread = anonymousAction({
  args: {
    threadId: v.string(),
  },
  handler: async (ctx, args) => {
    const thread = await ctx.runQuery(components.agent.threads.getThread, {
      threadId: args.threadId,
    });

    if (thread?.userId !== ctx.anonymousUserId) {
      throw new ConvexError(
        Errors.aiThreadNotFound({ message: "Thread not found" })
      );
    }

    await ctx.runAction(components.agent.threads.deleteAllForThreadIdSync, {
      threadId: args.threadId,
    });
  },
});
