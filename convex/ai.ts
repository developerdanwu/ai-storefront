import { actionGeneric } from "convex/server";
import { v } from "convex/values";
import { storeAgent } from "./agents/storeAgent";
import { summaryAgent } from "./agents/summaryAgent";

export const createThread = actionGeneric({
  args: v.object({
    prompt: v.string(),
  }),
  handler: async (ctx, args) => {
    const title = await summaryAgent.generateText(
      ctx,
      {
        userId: "xxx",
      },
      {
        prompt: `
          summarise the prompt below to create a title
\`\`\`
${args.prompt}
\`\`\`
          `,
      }
    );

    const { threadId } = await storeAgent.createThread(ctx, {
      title: title.text,
      userId: "xxx",
    });

    return { threadId };
  },
});
