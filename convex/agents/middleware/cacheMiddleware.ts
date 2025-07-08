import { LanguageModelV1Middleware } from "ai";
import { components } from "../../_generated/api";
import { ActionCtx } from "../../_generated/server";

export function createCacheMiddleware(ctx: ActionCtx) {
  return {
    wrapGenerate: async ({ params, doGenerate }) => {
      const cacheKey = JSON.stringify(params);
      const cached = await ctx.runQuery(components.actionCache.lib.get, {
        args: cacheKey,
        name: "ai-summary-title-cache",
        ttl: null,
      });
      console.log("CACHED", cached);
      if (cached.kind === "hit") {
        return {
          ...cached.value,
        };
      }
      const { text, finishReason, providerMetadata, usage, rawCall } =
        await doGenerate();
      await ctx.runMutation(components.actionCache.lib.put, {
        args: cacheKey,
        value: { text, finishReason, providerMetadata, usage, rawCall },
        ttl: null,
        expiredEntry: undefined,
        name: "ai-summary-title-cache",
      });

      return { text, finishReason, providerMetadata, usage, rawCall };
    },
  } satisfies LanguageModelV1Middleware;
}
