import { Agent } from "@convex-dev/agent";
import { Infer, v } from "convex/values";
import { ResultAsync } from "neverthrow";
import { QueryCtx } from "../_generated/server";
import * as Errors from "../errors";

export const VSearchThreadsHandlerArgs = v.object({
  userId: v.string(),
  query: v.string(),
  limit: v.number(),
});

export type TSearchThreadsHandlerArgs = Infer<typeof VSearchThreadsHandlerArgs>;

export const VSearchThreadsHandlerReturn = v.object({
  threads: v.array(
    v.object({
      id: v.string(),
      name: v.string(),
    })
  ),
});

export function searchAiThreads<TAgent extends Agent<any>>(
  ctx: QueryCtx,
  agent: TAgent,
  args: TSearchThreadsHandlerArgs
) {
  return ResultAsync.fromPromise(agent.searchThreadTitles(ctx, args), (e) => {
    return Errors.getAiThreadsFailed({
      message: "Failed to get AI threads",
    });
  });
}
