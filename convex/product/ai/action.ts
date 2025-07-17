import { Agent } from "@convex-dev/agent";
import { v } from "convex/values";
import { ResultAsync } from "neverthrow";
import { components, internal } from "../../_generated/api";
import { internalAction } from "../../_generated/server";
import { createKaolinAgent } from "../../agents/kaolinAgent";
import { createPlaygroundAgent } from "../../agents/playgroundAgent";
import * as Errors from "../../errors";
import { continueAiThread } from "../../helpers/continueAiThread";
import { continueAiThreadStream } from "../../helpers/continueAiThreadStream";
import { createThread } from "../../helpers/createThread";
import { deleteAiThread } from "../../helpers/deleteAiThread";
import { authedAction } from "../../procedures";

export const createPlaygroundThread = authedAction({
  args: {
    aiAgentPersonaId: v.id("aiAgentPersona"),
    prompt: v.string(),
  },
  handler: async (ctx, args) => {
    const agentPersona = await ResultAsync.fromPromise(
      ctx.runQuery(internal.product.ai.query._getAiPersona, {
        aiAgentPersonaId: args.aiAgentPersonaId,
      }),
      (e) =>
        Errors.getAiAgentPersonaFailed({
          message: "Failed to get ai persona",
          error: e,
        })
    ).match(
      (x) => x,
      (e) => Errors.propogateConvexError(e)
    );

    const agent: Agent<any> = createPlaygroundAgent({
      name: agentPersona.name,
      instructions: agentPersona.customPrompt,
    });

    const { threadId } = await createThread(ctx, agent, {
      prompt: args.prompt,
      userId: ctx.user._id,
    }).match(
      (x) => x,
      (e) => Errors.propogateConvexError(e)
    );

    return {
      threadId,
    };
  },
});

export const continuePlaygroundThread = authedAction({
  args: {
    aiAgentPersonaId: v.id("aiAgentPersona"),
    threadId: v.string(),
    prompt: v.optional(v.string()),
    promptMessageId: v.optional(v.string()),
    disableStream: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const agentPersona = await ResultAsync.fromPromise(
      ctx.runQuery(internal.product.ai.query._getAiPersona, {
        aiAgentPersonaId: args.aiAgentPersonaId,
      }),
      (e) =>
        Errors.getAiAgentPersonaFailed({
          message: "Failed to get ai persona",
          error: e,
        })
    ).match(
      (x) => x,
      (e) => Errors.propogateConvexError(e)
    );

    const agent: Agent<any> = createPlaygroundAgent({
      name: agentPersona.name,
      instructions: agentPersona.customPrompt,
    });

    if (args.disableStream) {
      const { text } = await continueAiThread(ctx, agent, {
        threadId: args.threadId,
        prompt: args.prompt,
        promptMessageId: args.promptMessageId,
        userId: ctx.user._id,
      }).match(
        (x) => x,
        (e) => Errors.propogateConvexError(e)
      );

      return text;
    }

    const text = await continueAiThreadStream(ctx, agent, {
      threadId: args.threadId,
      prompt: args.prompt,
      promptMessageId: args.promptMessageId,
      userId: ctx.user._id,
    }).match(
      (x) => x,
      (e) => Errors.propogateConvexError(e)
    );

    return text;
  },
});

export const createKaolinThread = authedAction({
  args: {
    prompt: v.string(),
  },
  handler: async (ctx, args) => {
    const agent: Agent<any> = createKaolinAgent(components.kaolinAgent, {});

    const { threadId } = await createThread(ctx, agent, {
      prompt: args.prompt,
      userId: ctx.user._id,
    }).match(
      (x) => x,
      (e) => Errors.propogateConvexError(e)
    );

    return {
      threadId,
    };
  },
});

export const continueKaolinThread = authedAction({
  args: {
    tools: v.record(
      v.string(),
      v.object({
        name: v.string(),
        context: v.any(),
      })
    ),
    threadId: v.string(),
    prompt: v.optional(v.string()),
    promptMessageId: v.optional(v.string()),
    disableStream: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const agent: Agent<any> = createKaolinAgent(components.kaolinAgent, {});

    if (args.disableStream) {
      const { text } = await continueAiThread(ctx, agent, {
        threadId: args.threadId,
        prompt: args.prompt,
        promptMessageId: args.promptMessageId,
        userId: ctx.user._id,
      }).match(
        (x) => x,
        (e) => Errors.propogateConvexError(e)
      );

      return text;
    }

    const text = await continueAiThreadStream(ctx, agent, {
      threadId: args.threadId,
      prompt: args.prompt,
      promptMessageId: args.promptMessageId,
      userId: ctx.user._id,
    }).match(
      (x) => x,
      (e) => Errors.propogateConvexError(e)
    );

    return text;
  },
});

export const _continueKaolinThread = internalAction({
  args: {
    userId: v.id("users"),
    tools: v.record(
      v.string(),
      v.object({
        name: v.string(),
        context: v.any(),
      })
    ),
    maxSteps: v.optional(v.number()),
    threadId: v.string(),
    prompt: v.optional(v.string()),
    promptMessageId: v.optional(v.string()),
    disableStream: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const agent: Agent<any> = createKaolinAgent(components.kaolinAgent, {
      ...(args.maxSteps ? { maxSteps: args.maxSteps } : {}),
    });

    if (args.disableStream) {
      const { text } = await continueAiThread(ctx, agent, {
        threadId: args.threadId,
        prompt: args.prompt,
        promptMessageId: args.promptMessageId,
        userId: args.userId,
      }).match(
        (x) => x,
        (e) => Errors.propogateConvexError(e)
      );

      return text;
    }

    const text = await continueAiThreadStream(ctx, agent, {
      threadId: args.threadId,
      prompt: args.prompt,
      promptMessageId: args.promptMessageId,
      userId: args.userId,
    }).match(
      (x) => x,
      (e) => Errors.propogateConvexError(e)
    );

    return text;
  },
});

export const deleteKaolinThread = authedAction({
  args: {
    threadId: v.string(),
  },
  handler: async (ctx, args) => {
    const agent = createKaolinAgent(components.kaolinAgent, {});
    await deleteAiThread(ctx, agent, {
      threadId: args.threadId,
    }).match(
      (x) => x,
      (e) => Errors.propogateConvexError(e)
    );
  },
});
