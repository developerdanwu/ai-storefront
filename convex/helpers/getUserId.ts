import type { Auth } from "convex/server";
import { ResultAsync } from "neverthrow";
import * as Errors from "../errors";

export function getUserId(ctx: { auth: Auth }) {
  return ResultAsync.fromPromise(
    ctx.auth.getUserIdentity().then((identity) => {
      if (!identity) {
        throw Errors.notAuthenticated({ message: "User not authenticated" });
      }
      return identity.subject; // WorkOS user ID from JWT
    }),
    () => Errors.notAuthenticated({ message: "User not authenticated" })
  );
}
