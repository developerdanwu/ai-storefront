import { ConvexError, v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";
import { getUser } from "./helpers/getUser";
import { Users } from "./schema/users.schema";

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

export const upsertFromWorkos = internalMutation({
  args: Users.withoutSystemFields,
  async handler(ctx, args) {
    const user = await ctx.db
      .query("users")
      .withIndex("externalId", (q) => q.eq("externalId", args.externalId))
      .first();

    if (user === null) {
      return await ctx.db.insert("users", args);
    }
    await ctx.db.patch(user._id, args);

    return user._id;
  },
});

export const deleteFromWorkos = internalMutation({
  args: { externalId: v.string() },
  async handler(ctx, { externalId }) {
    const user = await ctx.db
      .query("users")
      .withIndex("externalId", (q) => q.eq("externalId", externalId))
      .first();

    if (user !== null) {
      await ctx.db.delete(user._id);
    } else {
      console.warn(
        `Can't delete user, there is none for user ID: ${externalId}`
      );
    }
  },
});
