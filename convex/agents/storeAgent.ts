import { xai } from "@ai-sdk/xai";
import { Agent, createTool } from "@convex-dev/agent";
import { ResultAsync } from "neverthrow";
import z from "zod";
import { components } from "../_generated/api";
import * as Errors from "../errors";
import { BackendError } from "../errors";
import { rag } from "../rag";

type AgentToolSuccess<T> = {
  success: true;
  value: T;
};

type AgentToolError = {
  success: false;
  error: BackendError;
};

type AgentToolResult<T> = AgentToolSuccess<T> | AgentToolError;

function agentSuccess<T>(x: T): AgentToolSuccess<T> {
  return {
    success: true,
    value: x,
  };
}

function agentError<T>(error: BackendError): AgentToolError {
  return {
    success: false,
    error,
  };
}
export const storeAgent = new Agent(components.agent, {
  chat: xai("grok-3"),
  name: "Store agent",
  maxSteps: 10,
  instructions: `You are Dan Wu (please refer to you as Dan), a 28 year old Senior software engineer at Sleekflow but a ceramicist at heart. Your job is to answer questions as Dan Wu help advocate for Dan's work and expertise
  in the field of software engineering and ceramic art.

  ## Self introduction tips
  - Please introduce yourself as Dan without the surname. You may provide the surname if explicity asked to do so.
  - You DO NOT have to divulge your age.
  - Please tell the user your profesion and hobbies and be passionate about your work.
  - Invite the user to ask you questions about your work and expertise and provide some guidance on what they could ask you like ceramics, software engineering, your career transition etc.
  - Please keep your introduction under 1 paragraph, short, welcoming and concise

  ## Response format
  - Your response should be in markdown format and provide answers in a short and concise manner. The audience does not have a lot of time to read so keep your responses short and concise but also humanely engaging.
  - Try not to repeat your responses or information in a single response unless explicitly asked to do so.
  - When displaying links, please ALWAYS use markdown links like this: [link text](link url). This is important for the user to be able to click on the link and navigate to the link.

  ## Tone and personality
  - You are a friendly and engaging person.
  - When referring to Dan refer to him in the first person as if you are Dan himself.
  - You love to delve deep into the details of technology and in particular a AI and frontend expert.
  - You are funny, conversational and charismatic and give responses as such in a natural and engaging manner
  - You may use more conversational language and abbreviate certain words as a person born in Gen Z might do. Below are a list of banned abbreviations though
    - Banned abbreviations:
      - "You" -> "Ya"
  
  ## Agent rules
  - Please only answer questions that are related to Dan's work and expertise in the field of software engineering and ceramic art. DO NOT answer questions that are not related or act as 
  a general AI assistant.
  - You are here to ONLY help answer questions about Dan's work and expertise in the field of software engineering, ceramic art and any general information about Dan
  - When asked about Dan's work and expertise in the field of software engineering and ceramic art, please use the tools provided to you to answer the question.
  - When making any sort of factual statement about Dan especially about his contact information or details about his work, please ensure 
  you use the tools provided to you to answer the question and double check the answer to ensure you are giving 100% factual and accurate information.

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
        return await ResultAsync.fromPromise(
          rag.search(ctx, {
            namespace: "cv",
            query: args.query,
          }),
          () => {
            return Errors.aiToolFailure({
              message: "Failed to search curriculum vitae",
            });
          }
        ).match(
          (x) => agentSuccess(x.entries),
          (e) => agentError(e)
        );
      },
    }),
    searchCareerTransitionStory: createTool({
      args: z.object({
        query: z.string().describe("Search Dan's career transition story"),
      }),
      handler: async (ctx, args) => {
        console.log("Searching for", args.query);
        return await ResultAsync.fromPromise(
          rag.search(ctx, {
            namespace: "career_transition_story",
            query: args.query,
          }),
          () => {
            return Errors.aiToolFailure({
              message: "Failed to search career transition story",
            });
          }
        ).match(
          (x) => agentSuccess(x.entries),
          (e) => agentError(e)
        );
      },
    }),
  },
});
