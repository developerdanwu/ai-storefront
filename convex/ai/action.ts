import { ConvexError, v } from "convex/values";
import { ok, ResultAsync } from "neverthrow";
import { components } from "../_generated/api";
import { internalAction } from "../_generated/server";
import { storeAgent } from "../agents/storeAgent";
import * as Errors from "../errors";
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
      (e) => {
        throw new ConvexError(e);
      }
    );
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
    await rateLimit(ctx, {
      name: "createAiThread",
      key: ctx.anonymousUserId,
    }).match(
      (x) => x,
      (e) => {
        throw new ConvexError(e);
      }
    );
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
          console.error(e);
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
    await rateLimit(ctx, {
      name: "sendAIMessage",
      key: ctx.user._id,
    }).match(
      (x) => x,
      (e) => {
        throw new ConvexError(e);
      }
    );
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

export const _generateThreadTitle = internalAction({
  args: {
    prompt: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    return await generateSummaryTitle(ctx, {
      userId: args.userId,
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
      (e) => {
        throw new ConvexError(e);
      }
    );
    const { thread } = await ResultAsync.fromPromise(
      storeAgent.continueThread(ctx, {
        threadId: args.threadId,
        userId: ctx.anonymousUserId,
      }),
      (e) =>
        Errors.continueThreadFailed({
          message: "Failed to continue thread",
          error: e,
        })
    ).match(
      (x) => x,
      (e) => {
        throw new ConvexError(e);
      }
    );
    if (!args.disableStream) {
      return ResultAsync.fromPromise(
        thread.streamText(
          {
            prompt: args.prompt,
            promptMessageId: args.promptMessageId,
            temperature: 0.3,
          },
          {
            saveStreamDeltas: { chunking: "word", throttleMs: 800 },
          }
        ),
        (e) => {
          return Errors.generateAiTextFailed({
            message: "Failed to generate AI text",
          });
        }
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
            (e) => {
              console.error("ERRORRR100", e);
              return Errors.generateAiTextFailed({
                message: "Failed to generate AI text",
              });
            }
          );
        })
        .match(
          (x) => x,
          (e) => {
            throw new ConvexError(e);
          }
        );
    } else {
      return await ResultAsync.fromPromise(
        storeAgent.continueThread(ctx, {
          threadId: args.threadId,
          userId: ctx.anonymousUserId,
        }),
        (e) =>
          Errors.continueThreadFailed({
            message: "Failed to continue thread",
          })
      )
        .andThen((x) => {
          return ResultAsync.fromPromise(
            x.thread.generateText({
              prompt: args.prompt,
              promptMessageId: args.promptMessageId,
              temperature: 0.3,
            }),
            (e) => {
              return Errors.generateAiTextFailed({
                message: "Failed to generate AI text",
              });
            }
          );
        })
        .match(
          (x) => x.text,
          (e) => {
            throw new ConvexError(e);
          }
        );
    }
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
