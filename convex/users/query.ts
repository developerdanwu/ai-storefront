import { ConvexError, v } from "convex/values";
import { internalQuery } from "../_generated/server";
import { getAnonymousUser } from "../helpers/getAnonymousUser";
import { getUser } from "../helpers/getUser";

export const _getUser = internalQuery({
  args: {
    workosUserId: v.string(),
  },
  handler: async (ctx, args) => {
    return await getUser(ctx, {
      args: {
        workosUserId: args.workosUserId,
      },
    }).match(
      (user) => user,
      (e) => {
        throw new ConvexError(e);
      }
    );
  },
});

export const _getAnonymousUser = internalQuery({
  args: {
    anonymousUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await getAnonymousUser(ctx, {
      anonymousUserId: args.anonymousUserId,
    });
  },
});
