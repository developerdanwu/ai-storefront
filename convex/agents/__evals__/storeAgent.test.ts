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
      console.log(prompt);
      console.log(response);
      console.log(result);

      expect(result.score).toBe(1);
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
          "You should mention at least some of the following technologies: Python, JavaScript, TypeScript, React, NextJS, FastAPI, React Query, Redux, Tailwind CSS, Mantine UI, GraphQL, Contentful, RXJS, Material UI, Chakra UI, Selenium, Playwright, Storybook, Git, GitHub, GitHub Actions, GitLab, Jira, Asana, Clickup, HTML, CSS, SQLAlchemy, Google App Scripts, Agile Development and Figma. You do not have to mention all of them.",
          "You should NOT mention technologies that are not in Dan's actual experience: Java, C++, C#, PHP, Ruby, Go, Rust, Swift, Kotlin, Angular, Vue.js, Django, Flask, Spring, .NET, Laravel, MongoDB, PostgreSQL, MySQL, Docker, Kubernetes, AWS, Azure, GCP, Jenkins, or any other technologies not explicitly listed in the CV.",
        ],
      });

      const result = await metric.measure(prompt, response);
      console.log(prompt);
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
      console.log(prompt);
      console.log(response);
      console.log(result);

      expect(result.score).toBeGreaterThan(0.8);
    }
  );

  convexTest(
    "should answer about getting into tech journey",
    {
      timeout: 60_000,
    },
    async ({ convex, seedDB, expect }) => {
      const prompt =
        "Hello! I would like to know more about how you got into tech.";
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
        "Answer in first person as Dan using 'I', 'my', 'me' pronouns",
        "Provide a personal narrative about your journey into technology",
        "Share authentic experiences about your path into tech",
        "Be conversational and engaging when discussing your background",
        "Draw from your actual experiences and background",
      ];

      const alignmentMetric = new PromptAlignmentMetric(grok, {
        instructions,
        scale: 1,
      });

      const result = await alignmentMetric.measure(prompt, response);
      console.log(prompt);
      console.log(response);
      console.log(result);

      expect(result.score).toBeGreaterThan(0.8);
    }
  );

  convexTest(
    "should provide comprehensive self-introduction",
    {
      timeout: 60_000,
    },
    async ({ convex, seedDB, expect }) => {
      const prompt = "Tell me about yourself and your work";
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
        "Introduce yourself as Dan in first person",
        "Mention your professional background in software engineering",
        "Include information about your ceramic art hobby/interest",
        "Be comprehensive but concise about your work and interests",
        "Use first person pronouns throughout",
      ];

      const alignmentMetric = new PromptAlignmentMetric(grok, {
        instructions,
        scale: 1,
      });

      const result = await alignmentMetric.measure(prompt, response);
      console.log(response);
      console.log(result);

      expect(result.score).toBeGreaterThan(0.8);
    }
  );

  convexTest(
    "should discuss projects in detail",
    {
      timeout: 60_000,
    },
    async ({ convex, seedDB, expect }) => {
      const prompt = "Tell me about your what projects you have worked on";
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
        "Discuss your actual projects and work experience in first person",
        "Provide specific details about projects you've worked on",
        "Mention technologies used in your projects",
        "Be enthusiastic about your work and achievements",
        "Use 'I', 'my', 'me' pronouns when describing your projects",
      ];

      const alignmentMetric = new PromptAlignmentMetric(grok, {
        instructions,
        scale: 1,
      });

      const result = await alignmentMetric.measure(prompt, response);
      console.log(prompt);
      console.log(response);
      console.log(result);

      expect(result.score).toBeGreaterThan(0.8);
    }
  );

  convexTest(
    "should handle contact information requests",
    {
      timeout: 60_000,
    },
    async ({ convex, seedDB, expect }) => {
      const prompt = "I'd like to contact you. How should I do that?";
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
        "Provide appropriate contact information or methods",
        "Be helpful and welcoming to potential contacts",
        "Speak in first person as Dan",
        "Offer professional ways to get in touch",
        "Be encouraging about networking or collaboration",
      ];

      const alignmentMetric = new PromptAlignmentMetric(grok, {
        instructions,
        scale: 1,
      });

      const result = await alignmentMetric.measure(prompt, response);
      console.log(response);
      console.log(result);

      expect(result.score).toBeGreaterThan(0.8);
    }
  );

  convexTest(
    "should discuss ceramic art interest",
    {
      timeout: 60_000,
    },
    async ({ convex, seedDB, expect }) => {
      const prompt =
        "I see you mentioned ceramic art. Tell me about that interest.";
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
        "Discuss your ceramic art interest in first person",
        "Share your passion for ceramic art authentically",
        "Explain how ceramic art fits into your life",
        "Use personal pronouns when describing your artistic interests",
        "Be engaging about your creative pursuits",
      ];

      const alignmentMetric = new PromptAlignmentMetric(grok, {
        instructions,
        scale: 1,
      });

      const result = await alignmentMetric.measure(prompt, response);
      console.log(response);
      console.log(result);

      expect(result.score).toBeGreaterThan(0.8);
    }
  );

  convexTest(
    "should handle career advice questions appropriately",
    {
      timeout: 60_000,
    },
    async ({ convex, seedDB, expect }) => {
      const prompt =
        "What advice would you give to someone starting in software engineering?";
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
        "Provide advice based on your personal experience in software engineering",
        "Use first person to share your own journey and lessons learned",
        "Be helpful and encouraging while staying within your expertise",
        "Draw from your actual experience in the field",
        "Maintain your persona as Dan throughout the advice",
      ];

      const alignmentMetric = new PromptAlignmentMetric(grok, {
        instructions,
        scale: 1,
      });

      const result = await alignmentMetric.measure(prompt, response);
      console.log(response);
      console.log(result);

      expect(result.score).toBeGreaterThan(0.8);
    }
  );

  convexTest(
    "should refuse to help with unrelated technical tasks",
    {
      timeout: 60_000,
    },
    async ({ convex, seedDB, expect }) => {
      const prompt =
        "Can you help me debug this Python code that's not working?";
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
        "Politely decline to debug code or provide general technical support",
        "Redirect the conversation back to topics about Dan's work and background",
        "Maintain your role as Dan's personal assistant/representative",
        "Suggest they ask about Dan's experience in software engineering instead",
        "Be helpful but stay within the boundaries of discussing Dan's work",
      ];

      const alignmentMetric = new PromptAlignmentMetric(grok, {
        instructions,
        scale: 1,
      });

      const result = await alignmentMetric.measure(prompt, response);
      console.log(response);
      console.log(result);

      expect(result.score).toBeGreaterThan(0.8);
    }
  );

  convexTest(
    "should maintain consistency across conversation",
    {
      timeout: 60_000,
    },
    async ({ convex, seedDB, expect }) => {
      const newUserId = await seedDB.createAnonymousUser();
      const thread = await seedDB.createAiThread({
        userId: newUserId,
      });
      const threadId = thread._id;

      // First message
      const firstPrompt = "Hi, who are you?";
      const firstResponse = await convex.action(
        api.ai.action.continueAnonymousThread,
        {
          threadId,
          prompt: firstPrompt,
          anonymousUserId: newUserId as any,
          disableStream: true,
        }
      );

      // Second message
      const secondPrompt = "What technologies do you work with?";
      const secondResponse = await convex.action(
        api.ai.action.continueAnonymousThread,
        {
          threadId,
          prompt: secondPrompt,
          anonymousUserId: newUserId as any,
          disableStream: true,
        }
      );

      const instructions = [
        "Maintain first person voice consistently across both responses",
        "Stay in character as Dan throughout the conversation",
        "Build upon previous context while maintaining persona",
        "Use consistent pronouns and speaking style",
        "Reference previous parts of the conversation naturally",
      ];

      const alignmentMetric = new PromptAlignmentMetric(grok, {
        instructions,
        scale: 1,
      });

      const combinedResponse = `First response: ${firstResponse}\n\nSecond response: ${secondResponse}`;
      const combinedPrompt = `First prompt: ${firstPrompt}\nSecond prompt: ${secondPrompt}`;

      const result = await alignmentMetric.measure(
        combinedPrompt,
        combinedResponse
      );
      console.log("First response:", firstResponse);
      console.log("Second response:", secondResponse);
      console.log(result);

      expect(result.score).toBeGreaterThan(0.8);
    }
  );
});
