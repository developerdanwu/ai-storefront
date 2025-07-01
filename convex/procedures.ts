import {
  customAction,
  customCtx,
  customMutation,
  customQuery,
} from "convex-helpers/server/customFunctions";
import { ConvexError, Infer, v } from "convex/values";
import { ResultAsync } from "neverthrow";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import {
  ActionCtx,
  QueryCtx,
  action,
  mutation,
  query,
} from "./_generated/server";
import * as Errors from "./errors";
import { getAnonymousUser } from "./helpers/getAnonymousUser";
import { getUser as getUserHelper } from "./helpers/getUser";
import { getUserId } from "./helpers/getUserId";
import { User, Users } from "./schema/users.schema";

const getUser = (ctx: QueryCtx) => {
  return getUserId(ctx).andThen((userId) => {
    return getUserHelper(ctx, {
      args: {
        workosUserId: userId,
      },
    });
  });
};

export const authedQuery = customQuery(query, {
  args: {},
  input: async (ctx, args) => {
    const user = await getUser(ctx).match(
      (user) => user,
      (e) => {
        throw new ConvexError(e);
      }
    );

    return {
      ctx: {
        user,
        ...ctx,
      },
      args,
    };
  },
});

export const anonymousQuery = customQuery(query, {
  args: {
    anonymousUserId: v.optional(v.string()),
  },
  input: async (ctx, args) => {
    const userIdentity = await getUserId(ctx).match(
      (userId) => userId,
      () => null
    );

    if (userIdentity) {
      throw new ConvexError(
        Errors.userAlreadyAuthenticated({
          message: "User already authenticated",
        })
      );
    }

    if (!args.anonymousUserId) {
      return {
        ctx: { ...ctx, user: null as Infer<typeof Users.doc> | null },
        args,
      };
    }

    const normalizedId = ctx.db.normalizeId("users", args.anonymousUserId);

    if (!normalizedId) {
      return {
        ctx: { ...ctx, user: null as Infer<typeof Users.doc> | null },
        args,
      };
    }

    const user = await getAnonymousUser(ctx, {
      anonymousUserId: normalizedId,
    }).match(
      (user) => user,
      (e) => null
    );

    return {
      ctx: {
        ...ctx,
        user,
      },
      args,
    };
  },
});

export const anonymousAction = customAction(action, {
  args: {
    anonymousUserId: v.optional(v.union(v.id("users"), v.null())),
  },
  input: async (
    ctx,
    args
  ): Promise<{
    ctx: ActionCtx & { anonymousUserId: Id<"users"> };
    args: { anonymousUserId?: Id<"users"> | null };
  }> => {
    const userIdentity = await getUserId(ctx).match(
      (userId) => userId,
      () => null
    );

    if (userIdentity) {
      throw new ConvexError(
        Errors.userAlreadyAuthenticated({
          message: "User already authenticated",
        })
      );
    }

    const { userId } = await ResultAsync.fromPromise(
      ctx.runMutation(internal.users.mutation._upsertAnonymousUser, {
        anonymousUserId: args.anonymousUserId,
      }),
      (e) => e
    ).match(
      (x) => x,
      (e) => {
        throw new ConvexError(e as any);
      }
    );

    return {
      ctx: {
        ...ctx,
        anonymousUserId: userId,
      },
      args,
    };
  },
});

export const authedMutation = customMutation(mutation, {
  args: {},
  input: async (ctx, args) => {
    const user = await getUser(ctx).match(
      (user) => user,
      (e) => {
        throw new ConvexError(e);
      }
    );

    return {
      ctx: {
        user,
        ...ctx,
      },
      args,
    };
  },
});

export const authedAction = customAction(
  action,
  customCtx(async (ctx) => {
    const workosUserId = await getUserId(ctx).match(
      (userId) => userId,
      (e) => {
        throw new ConvexError(e);
      }
    );
    const user: User = await ctx.runQuery(internal.users.query._getUser, {
      workosUserId,
    });
    return {
      ...ctx,
      user,
    };
  })
);
