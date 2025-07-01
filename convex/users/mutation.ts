import { ConvexError, v } from "convex/values";
import { ResultAsync } from "neverthrow";
import { Id } from "../_generated/dataModel";
import { internalMutation } from "../_generated/server";
import * as Errors from "../errors";
import { getAnonymousUser } from "../helpers/getAnonymousUser";
import { Users } from "../schema/users.schema";

export const _upsertFromWorkos = internalMutation({
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

export const _deleteFromWorkos = internalMutation({
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

export const _upsertAnonymousUser = internalMutation({
  args: {
    anonymousUserId: v.optional(v.string()),
  },
  async handler(ctx, args): Promise<{ userId: Id<"users"> }> {
    if (args.anonymousUserId) {
      const normalizedId = ctx.db.normalizeId("users", args.anonymousUserId);

      if (!normalizedId) {
        throw new ConvexError(
          Errors.userNotFound({
            message: "User not found",
          })
        );
      }

      const user = await getAnonymousUser(ctx, {
        anonymousUserId: normalizedId,
      }).match(
        (user) => user,
        (e) => {
          throw new ConvexError(e);
        }
      );

      return {
        userId: user._id,
      };
    }

    const newUserId = await ResultAsync.fromPromise(
      ctx.db.insert("users", {
        isAnonymous: true,
        firstName: "",
        lastName: "",
        emailVerified: false,
      }),
      () =>
        Errors.failedToCreateUser({
          message: "Failed to create anonymous user",
        })
    ).match(
      (x) => x,
      (e) => {
        throw new ConvexError(e);
      }
    );

    return {
      userId: newUserId,
    };
  },
});
