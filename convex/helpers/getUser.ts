import { Infer, v } from "convex/values";
import { ResultAsync } from "neverthrow";
import { QueryCtx } from "../_generated/server";
import * as Errors from "../errors";

export const VGetUserArgs = v.object({
  userId: v.id("users"),
});

export type TGetUserArgs = Infer<typeof VGetUserArgs>;

export function getUser(
  ctx: QueryCtx,
  {
    args,
  }: {
    args: TGetUserArgs;
  }
) {
  return ResultAsync.fromPromise(
    ctx.db.get(args.userId).then((r) => {
      if (!r) {
        throw Errors.userNotFound({
          message: `User with id: ${args.userId} not found`,
        });
      }
      return r;
    }),
    (e) =>
      Errors.userNotFound({
        message: `User with id: ${args.userId} not found`,
        error: e,
      })
  );
}
