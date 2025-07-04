import { ConvexError, v } from "convex/values";
import { ok, ResultAsync } from "neverthrow";
import { components } from "../_generated/api";
import { storeAgent } from "../agents/storeAgent";
import * as Errors from "../errors";
import { createThread as createThreadHelper } from "../helpers/createThread";
import { generateSummaryTitle } from "../helpers/generateSummaryTitle";
import { anonymousAction, authedAction } from "../procedures";

export const createThread = authedAction({
  args: {
    prompt: v.string(),
  },
  handler: async (ctx, args) => {
    const { threadId } = await generateSummaryTitle(ctx, {
      userId: ctx.user._id,
      prompt: `
            summarise the prompt below to create a title
  \`\`\`
  ${args.prompt}
  \`\`\`
            `,
    })
      .andThen((x) => {
        return createThreadHelper(ctx, {
          title: x.text,
          userId: ctx.user._id,
        });
      })
      .match(
        (x) => x,
        (e) => {
          throw new ConvexError(e);
        }
      );

    return { threadId };
  },
});

export const createAnonymousThread = anonymousAction({
  args: {
    prompt: v.string(),
  },
  handler: async (ctx, args) => {
    const { threadId } = await generateSummaryTitle(ctx, {
      userId: ctx.anonymousUserId,
      prompt: `
            summarise the prompt below to create a title
  \`\`\`
  ${args.prompt}
  \`\`\`
            `,
    })
      .andThen((x) => {
        return createThreadHelper(ctx, {
          title: x.text,
          userId: ctx.anonymousUserId,
        });
      })
      .match(
        (x) => x,
        (e) => {
          throw new ConvexError(e);
        }
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
  },
  handler: async (ctx, args) => {
    return await ResultAsync.fromPromise(
      storeAgent.continueThread(ctx, {
        threadId: args.threadId,
        userId: ctx.user._id,
      }),
      (e) =>
        Errors.continueThreadFailed({
          message: "Failed to continue thread",
          error: e,
        })
    )
      .andThen((x) => {
        return ResultAsync.fromPromise(
          x.thread.streamText(
            {
              prompt: args.prompt,
              promptMessageId: args.promptMessageId,
              temperature: 0.3,
              onFinish: async (x) => {},
            },
            {
              saveStreamDeltas: { chunking: "word", throttleMs: 800 },
            }
          ),
          (e) =>
            Errors.generateAiTextFailed({
              message: "Failed to generate AI text",
            })
        )
          .andThen((streamResult) => {
            return ResultAsync.fromPromise(
              (async () => {
                let fullText = "";
                for await (const chunk of streamResult.textStream) {
                  fullText += chunk;
                }
                return fullText;
              })(),
              () =>
                Errors.generateAiTextFailed({
                  message: "Failed to generate AI text",
                })
            );
          })
          .andThen((text) => {
            return ok(text);
          });
      })
      .match(
        (x) => x,
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
  },
  handler: async (ctx, args) => {
    return await ResultAsync.fromPromise(
      storeAgent.continueThread(ctx, {
        threadId: args.threadId,
        userId: ctx.anonymousUserId,
      }),
      (e) =>
        Errors.continueThreadFailed({
          message: "Failed to continue thread",
          error: e,
        })
    )
      .andThen((x) => {
        return ResultAsync.fromPromise(
          x.thread.streamText(
            {
              prompt: args.prompt,
              promptMessageId: args.promptMessageId,
              temperature: 0.3,
              onFinish: async (x) => {},
            },
            {
              saveStreamDeltas: { chunking: "word", throttleMs: 800 },
            }
          ),
          (e) =>
            Errors.generateAiTextFailed({
              message: "Failed to generate AI text",
            })
        )
          .andThen((streamResult) => {
            return ResultAsync.fromPromise(
              (async () => {
                let fullText = "";
                for await (const chunk of streamResult.textStream) {
                  fullText += chunk;
                }
                return fullText;
              })(),
              () =>
                Errors.generateAiTextFailed({
                  message: "Failed to generate AI text",
                })
            );
          })
          .andThen((text) => {
            return ok(text);
          });
      })
      .match(
        (x) => x,
        (e) => {
          throw new ConvexError(e);
        }
      );
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
