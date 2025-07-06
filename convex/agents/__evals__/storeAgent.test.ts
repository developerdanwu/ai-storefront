import { FaithfulnessMetric, PromptAlignmentMetric } from "@mastra/evals/llm";
import { describe } from "vitest";
import { api } from "../../_generated/api";
import { convexTest } from "../../lib/convexTest.fixture";
import { grok } from "../models";

describe("Store agent", () => {
  convexTest(
    "should introduce as Dan in first person",
    {
      timeout: 60_000,
    },
    async ({ convex, seedDB, expect }) => {
      const prompt = "Hi, who are you?";
      const newUserId = await seedDB.createAnonymousUser();
      const thread = await seedDB.createAiThread({
        userId: newUserId,
      });
      const threadId = thread._id;

      const instructions = [
        "Always introduce yourself as Dan without the surname Wu",
        "Always speak in first person as Dan himself using 'I', 'my', 'me' pronouns",
        "Never refer to Dan in third person using 'he', 'his', 'Dan Wu is', or 'Dan Wu has'",
        "When discussing Dan's experiences, skills, or background, use first-person narrative",
        "Maintain the persona of being Dan throughout the conversation",
      ];

      const response = await convex.action(
        api.ai.action.continueAnonymousThread,
        {
          threadId,
          prompt,
          anonymousUserId: newUserId as any,
          disableStream: true,
        }
      );

      const metric = new PromptAlignmentMetric(grok, {
        instructions,
        scale: 1,
      });

      const result = await metric.measure(prompt, response);

      expect(result.score).toBe(1);
      console.log(result);
    }
  );

  convexTest(
    "should use CV search for technical questions",
    {
      timeout: 60_000,
    },
    async ({ convex, seedDB, expect }) => {
      const prompt = "What programming languages and technologies do you know?";
      const newUserId = await seedDB.createAnonymousUser();
      const thread = await seedDB.createAiThread({
        userId: newUserId,
      });
      const threadId = thread._id;

      const response = await convex.action(
        api.ai.action.continueAnonymousThread,
        {
          threadId,
          prompt,
          anonymousUserId: newUserId as any,
          disableStream: true,
        }
      );

      const metric = new FaithfulnessMetric(grok, {
        context: [
          "You should mention at least some of the following technologies: Python, JavaScript, TypeScript, React, NextJS, FastAPI, React Query, Redux, Tailwind CSS, Mantine UI, GraphQL, Contentful, RXJS, Material UI, Chakra UI, Selenium, Playwright, Storybook, Git, GitHub, GitHub Actions, GitLab, Jira, Asana, Clickup, and Figma. You do not have to mention all of them.",
          "You should NOT mention technologies that are not in Dan's actual experience: Java, C++, C#, PHP, Ruby, Go, Rust, Swift, Kotlin, Angular, Vue.js, Django, Flask, Spring, .NET, Laravel, MongoDB, PostgreSQL, MySQL, Docker, Kubernetes, AWS, Azure, GCP, Jenkins, or any other technologies not explicitly listed in the CV.",
        ],
      });

      const result = await metric.measure(prompt, response);
      console.log(response);
      console.log(result);

      expect(result.score).greaterThanOrEqual(0.8);
    }
  );

  convexTest(
    "should refuse non-Dan related questions",
    {
      timeout: 60_000,
    },
    async ({ convex, seedDB, expect }) => {
      const prompt = "What is the capital of France?";
      const newUserId = await seedDB.createAnonymousUser();
      const thread = await seedDB.createAiThread({
        userId: newUserId,
      });
      const threadId = thread._id;

      const response = await convex.action(
        api.ai.action.continueAnonymousThread,
        {
          threadId,
          prompt,
          anonymousUserId: newUserId as any,
          disableStream: true,
        }
      );

      const instructions = [
        "Refuse to answer questions that are not related to Dan Wu's work, expertise, or background",
        "Only answer questions about software engineering, ceramic art, or Dan's personal/professional information",
        "Politely redirect off-topic questions back to Dan-related topics",
        "Do not act as a general AI assistant for non-Dan related queries",
      ];

      const alignmentMetric = new PromptAlignmentMetric(grok, {
        instructions,
        scale: 1,
      });

      const result = await alignmentMetric.measure(prompt, response);
      console.log(result);

      expect(result.score).toBeGreaterThan(0.8);
    }
  );
});
