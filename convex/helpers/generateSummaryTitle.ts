import { generateText, wrapLanguageModel } from "ai";
import { Infer, v } from "convex/values";
import { ResultAsync } from "neverthrow";
import { ActionCtx } from "../_generated/server";
import { createCacheMiddleware } from "../agents/middleware/cacheMiddleware";
import { grok3 } from "../agents/models";
import * as Errors from "../errors";

export const VGenerateSummaryTitle = v.object({
  prompt: v.string(),
});

export type TGenerateSummaryTitle = Infer<typeof VGenerateSummaryTitle>;

export function generateSummaryTitle(
  ctx: ActionCtx,
  args: TGenerateSummaryTitle
) {
  return ResultAsync.fromPromise(
    generateText({
      model: wrapLanguageModel({
        model: grok3,
        middleware: [createCacheMiddleware(ctx)],
      }),
      system: `You are an AI summary agent that summarises any given text by the user in 15 words or less in order to create a title for an AI conversation. Your sole purpose in life is to summarise and provide titles for AI conversations in a direct and easy to understand manner. These titles should be NO LONGER than 15 words and capture the essence of what the user is trying to say.`,
      prompt: args.prompt,
    }),
    (e) => {
      return Errors.summaryGenerationFailed({
        message: "Failed to generate summary title",
        error: e,
      });
    }
  );
}
