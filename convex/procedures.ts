import {
  customAction,
  customCtx,
  customMutation,
  customQuery,
} from "convex-helpers/server/customFunctions";
import { ConvexError } from "convex/values";
import { internal } from "./_generated/api";
import { action, mutation, query, QueryCtx } from "./_generated/server";
import { unsafe_getUser } from "./helpers/getUser";
import { getUserId } from "./helpers/getUserId";
import { User } from "./schema/users.schema";

const getUser = (ctx: QueryCtx) => {
  return getUserId(ctx).andThen((userId) => {
    return unsafe_getUser(ctx, {
      args: {
        userId,
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
    const userId = await getUserId(ctx).match(
      (userId) => userId,
      (e) => {
        throw new ConvexError(e);
      }
    );
    const user: User = await ctx.runQuery(internal.users._getUser, {
      userId,
    });
    return {
      ...ctx,
      user,
    };
  })
);
