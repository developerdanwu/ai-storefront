import { Infer, v } from "convex/values";
import { ResultAsync } from "neverthrow";
import { QueryCtx } from "../_generated/server";
import * as Errors from "../errors";

export const unsafe_VGetUser = v.object({
  userId: v.id("users"),
});

export type unsafe_TGetUser = Infer<typeof unsafe_VGetUser>;

export function unsafe_getUser(
  ctx: QueryCtx,
  {
    args,
  }: {
    args: unsafe_TGetUser;
  }
) {
  return ResultAsync.fromPromise(
    ctx.db.get(args.userId).then((r) => {
      if (!r) {
        throw Errors.userNotFound(`User with id: ${args.userId} not found`);
      }
      return r;
    }),
    () => Errors.userNotFound(`User with id: ${args.userId} not found`)
  );
}
