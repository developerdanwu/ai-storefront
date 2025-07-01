import { Infer, v } from "convex/values";
import { ResultAsync } from "neverthrow";
import { ActionCtx } from "../_generated/server";
import { summaryAgent } from "../agents/summaryAgent";
import * as Errors from "../errors";

export const VGenerateSummaryTitle = v.object({
  prompt: v.string(),
  userId: v.optional(v.string()),
  threadId: v.optional(v.string()),
});

export type TGenerateSummaryTitle = Infer<typeof VGenerateSummaryTitle>;

export function generateSummaryTitle(
  ctx: ActionCtx,
  args: TGenerateSummaryTitle
) {
  return ResultAsync.fromPromise(
    summaryAgent.generateText(
      ctx,
      {
        userId: args.userId,
        threadId: args.threadId,
      },
      {
        prompt: args.prompt,
      }
    ),
    (e) => {
      console.error("ERRORRR", e);
      return Errors.summaryGenerationFailed({
        message: "Failed to generate summary title",
      });
    }
  );
}
