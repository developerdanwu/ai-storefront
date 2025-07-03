import { paginationOptsValidator } from "convex/server";
import { Infer, v } from "convex/values";
import { ResultAsync } from "neverthrow";
import { components } from "../_generated/api";
import { QueryCtx } from "../_generated/server";
import * as Errors from "../errors";

export const VSearchThreadsHandlerArgs = v.object({
  userId: v.string(),
  query: v.string(),
  paginationOpts: paginationOptsValidator,
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

export function searchAiThreads(
  ctx: QueryCtx,
  args: TSearchThreadsHandlerArgs
) {
  return ResultAsync.fromPromise(
    ctx.runQuery(components.agent.threads.searchThreadTitles, args),
    (e) => {
      console.log("ERROR", e);
      return Errors.getAiThreadsFailed({
        message: "Failed to get AI threads",
      });
    }
  );
}
