import { ConvexError, v } from "convex/values";
import { ok, ResultAsync } from "neverthrow";
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
      .andThen((x) => {
        return ResultAsync.fromPromise(
          x.thread.generateText({
            prompt: args.prompt,
          }),
          (e) =>
            Errors.generateAiTextFailed({
              message: "Failed to generate AI text",
              error: e,
            })
        ).andThen(() => ok(x));
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
      .andThen((x) => {
        return ResultAsync.fromPromise(
          x.thread.generateText({
            prompt: args.prompt,
          }),
          (e) => {
            console.error("ERRORRR", e);
            return Errors.generateAiTextFailed({
              message: "Failed to generate AI text",
            });
          }
        ).andThen(() => ok(x));
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
