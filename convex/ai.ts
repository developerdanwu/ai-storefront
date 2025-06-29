import { v } from "convex/values";
import { storeAgent } from "./agents/storeAgent";
import { summaryAgent } from "./agents/summaryAgent";
import { authedAction } from "./procedures";

export const createThread = authedAction({
  args: v.object({
    prompt: v.string(),
  }),
  handler: async (ctx, args) => {
    const title = await summaryAgent.generateText(
      ctx,
      {
        userId: ctx.user._id,
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
      userId: ctx.user._id,
    });

    return { threadId };
  },
});
