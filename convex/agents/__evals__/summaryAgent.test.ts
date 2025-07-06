import { PromptAlignmentMetric } from "@mastra/evals/llm";
import { describe } from "vitest";
import { internal } from "../../_generated/api";
import { convexTest } from "../../lib/convexTest.fixture";
import { grok } from "../models";

describe("Summary agent", () => {
  convexTest(
    "should summarize the conversation",
    {
      timeout: 60_000,
    },
    async ({ convex, seedDB, expect }) => {
      const newUserId = await seedDB.createAnonymousUser();
      const prompt = "Hi, who are you?";
      const title = await convex.action(
        internal.ai.action._generateThreadTitle,
        {
          prompt,
          userId: newUserId,
        }
      );

      const metric = new PromptAlignmentMetric(grok, {
        instructions: [
          "The generated title should be 15 words or less",
          `The generated title should be relevant to the input prompt: '${prompt}'`,
        ],
      });

      const result = await metric.measure(prompt, title);
      console.log(title, result);
      expect(result.score).toBe(1);
    }
  );
});
