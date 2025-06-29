import { vStreamArgs } from "@convex-dev/agent";
import { paginationOptsValidator } from "convex/server";
import { ConvexError, v } from "convex/values";
import { ok, ResultAsync } from "neverthrow";
import * as Errors from "./errors";
import { createThread as createThreadHelper } from "./helpers/createThread";
import { generateSummaryTitle } from "./helpers/generateSummaryTitle";
import { getAiThreadMessages } from "./helpers/getAiThreadMessages";
import { getAiThreads } from "./helpers/getAiThreads";
import { sendAiMessage } from "./helpers/sendAiMessage";
import { authedAction, authedQuery } from "./procedures";

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

export const sendMessage = authedAction({
  args: {
    threadId: v.string(),
    prompt: v.string(),
  },
  handler: async (ctx, args) => {
    const { thread } = await sendAiMessage(ctx, {
      threadId: args.threadId,
      userId: ctx.user._id,
      prompt: args.prompt,
    }).match(
      (x) => x,
      (e) => {
        throw new ConvexError(e);
      }
    );

    return { threadId: thread.threadId };
  },
});

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
