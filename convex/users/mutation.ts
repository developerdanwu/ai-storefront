import { ConvexError, v } from "convex/values";
import { ok, ResultAsync } from "neverthrow";
import { components } from "../_generated/api";
import { Id } from "../_generated/dataModel";
import { internalMutation } from "../_generated/server";
import { createStoreAgent } from "../agents/storeAgent";
import * as Errors from "../errors";
import { getAnonymousUser } from "../helpers/getAnonymousUser";
import { authedMutation } from "../procedures";
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
    anonymousUserId: v.optional(v.union(v.id("users"), v.null())),
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

export const migrateAnonymousUser = authedMutation({
  args: {
    anonymousUserId: v.id("users"),
  },
  returns: v.object({
    totalThreadsMigrated: v.number(),
    totalThreadsProcessed: v.number(),
  }),
  handler: async (ctx, args) => {
    const { anonymousUserId } = args;
    const authenticatedUserId = ctx.user._id;

    let cursor: string | null = null;
    let totalProcessed = 0;
    let migratedCount = 0;
    let hasMore = true;

    // Paginate through all threads for the anonymous user
    while (hasMore) {
      const threadsPage: {
        continueCursor: string;
        isDone: boolean;
        page: Array<{
          _creationTime: number;
          _id: string;
          status: "active" | "archived";
          summary?: string;
          title?: string;
          userId?: string;
        }>;
      } = await ctx.runQuery(components.agent.threads.listThreadsByUserId, {
        userId: anonymousUserId,
        paginationOpts: {
          numItems: 50, // Process 50 threads at a time
          cursor: cursor,
        },
      });

      // Update each thread's userId to the authenticated user's ID
      for (const thread of threadsPage.page) {
        await ResultAsync.fromPromise(
          createStoreAgent(components.agent).updateThreadMetadata(ctx, {
            threadId: thread._id,
            patch: {
              userId: authenticatedUserId,
            },
          }),
          (e) => {
            return Errors.threadMigrationFailed({
              message: `Failed to migrate thread ${thread._id}`,
            });
          }
        )
          .andThen((x) => {
            migratedCount++;
            return ok(x);
          })
          .match(
            (x) => x,
            (e) => {
              throw new ConvexError(e);
            }
          );

        totalProcessed++;
      }

      // Check if there are more pages
      hasMore = !threadsPage.isDone;
      cursor = threadsPage.continueCursor;
    }

    return {
      totalThreadsMigrated: migratedCount,
      totalThreadsProcessed: totalProcessed,
    };
  },
});
