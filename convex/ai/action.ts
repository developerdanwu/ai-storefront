import { ConvexError, v } from "convex/values";
import { ok, ResultAsync } from "neverthrow";
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
