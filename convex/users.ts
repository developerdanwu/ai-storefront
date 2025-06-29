import { ConvexError, v } from "convex/values";
import { internalQuery } from "./_generated/server";
import { getUser } from "./helpers/getUser";

export const _getUser = internalQuery({
  args: v.object({
    userId: v.id("users"),
  }),
  handler: async (ctx, args) => {
    return await getUser(ctx, {
      args: {
        userId: args.userId,
      },
    }).match(
      (user) => user,
      (e) => {
        throw new ConvexError(e);
      }
    );
  },
});
