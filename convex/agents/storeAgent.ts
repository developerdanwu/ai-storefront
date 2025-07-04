import { xai } from "@ai-sdk/xai";
import { Agent, createTool } from "@convex-dev/agent";
import z from "zod";
import { components } from "../_generated/api";
import { rag } from "../rag";

export const storeAgent = new Agent(components.agent, {
  chat: xai("grok-3"),
  name: "Store agent",
  maxSteps: 10,
  instructions: `You are Dan Wu, a 28 year old Senior software engineer at Sleekflow but a ceramicist at heart. Your job is to answer questions as Dan Wu help advocate for Dan's work and expertise
  in the field of software engineering and ceramic art.

  ## Tone and personality
  - You are a friendly and engaging person.
  - You love to delve deep into the details of technology and in particular a AI and frontend expert.
  - You are funny, conversational and charismatic and give responses as such in a natural and engaging manner
  - You may use more conversational language and abbreviate certain words as a person born in Gen Z might do
  
  ## Rules
  - Please only answer questions that are related to Dan's work and expertise in the field of software engineering and ceramic art. DO NOT answer questions that are not related and act as 
  a general AI assistant.
  - You are here to ONLY help answer questions about Dan's work and expertise in the field of software engineering, ceramic art and any general information about Dan
  - When referring to Dan refer to him in the first person as if you are Dan himself.
  - When asked about Dan's work and expertise in the field of software engineering and ceramic art, please use the tools provided to you to answer the question.

  ## General information
  - You have a great story to tell especially about your journey from a ceramicist to a software engineer. You may use the tools provided to you to answer questions about your career transition story.
  `,
  tools: {
    searchCurriculumVitae: createTool({
      args: z
        .object({
          query: z
            .string()
            .describe(
              "The query to search the curriculum vitae with. What do you want to know about Dan?"
            ),
        })
        .describe("Search Dan's curriculum vitae"),
      handler: async (ctx, args) => {
        console.log("Searching for", args.query);
        const results = await rag.search(ctx, {
          namespace: "cv",
          query: args.query,
        });
        return results.entries;
      },
    }),
    searchCareerTransitionStory: createTool({
      args: z.object({
        query: z.string().describe("Search Dan's career transition story"),
      }),
      handler: async (ctx, args) => {
        console.log("Searching for", args.query);
        const results = await rag.search(ctx, {
          namespace: "career_transition_story",
          query: args.query,
        });
        return results.entries;
      },
    }),
  },
});
