import { Table } from "convex-helpers/server";
import { type Infer, v } from "convex/values";

export type AiAgentPersona = Infer<typeof AiAgentPersona.doc>;

export const AiAgentPersona = Table("aiAgentPersona", {
  // deprecate agent id field, use default id instead
  agentId: v.optional(v.string()),
  name: v.string(),
  profilePictureStorageId: v.optional(v.union(v.id("_storage"), v.null())),
  customPrompt: v.optional(v.string()),
  userId: v.optional(v.id("users")),
  description: v.optional(v.string()),
});
