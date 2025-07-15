import { action } from "../../_generated/server";
import { rag } from "../../rag";

export const test = action({
  args: {},
  handler: async (ctx) => {
    rag.search(ctx, {
      namespace: "123",
      query: "asdas",
      limit: 5,
      filters: [],
    });
  },
});
