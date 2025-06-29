import { Infer, v } from "convex/values";
import { ResultAsync } from "neverthrow";
import { ActionCtx } from "../_generated/server";
import { summaryAgent } from "../agents/summaryAgent";
import * as Errors from "../errors";

export const VGenerateSummaryTitle = v.object({
  prompt: v.string(),
});

export type TGenerateSummaryTitle = Infer<typeof VGenerateSummaryTitle>;

export function generateSummaryTitle(ctx: ActionCtx, args: TGenerateSummaryTitle) {
  return ResultAsync.fromPromise(
    summaryAgent.generateText(
      ctx,
      {},
      {
        prompt: args.prompt,
      }
    ),
    (e) =>
      Errors.summaryGenerationFailed({
        message: "Failed to generate summary title",
        error: e,
      })
  );
}
