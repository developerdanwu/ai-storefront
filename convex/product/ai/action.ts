import { Agent } from "@convex-dev/agent";
import { v } from "convex/values";
import { ResultAsync } from "neverthrow";
import { internal } from "../../_generated/api";
import { createPlaygroundAgent } from "../../agents/playgroundAgent";
import * as Errors from "../../errors";
import { generateSummaryTitle } from "../../helpers/generateSummaryTitle";
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

    const { threadId } = await generateSummaryTitle(ctx, {
      prompt: args.prompt,
    })
      .andThen(({ text }) => {
        return ResultAsync.fromPromise(
          agent.createThread(ctx, {
            title: text,
            userId: ctx.user._id,
          }),
          (e) =>
            Errors.createThreadFailed({
              message: "Failed to create thread",
              error: e,
            })
        );
      })
      .match(
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

    const { thread } = await ResultAsync.fromPromise(
      agent.continueThread(ctx, {
        threadId: args.threadId,
        userId: ctx.user._id,
      }),
      (e) =>
        Errors.continueThreadFailed({
          message: "Failed to continue thread",
          error: e,
        })
    ).match(
      (x) => x,
      (e) => Errors.propogateConvexError(e)
    );

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
            return Errors.generateAiTextFailed({
              message: "Failed to generate AI text",
              error: e,
            });
          }
        );
      })
      .match(
        (x) => x,
        (e) => Errors.propogateConvexError(e)
      );
  },
});
