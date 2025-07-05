import { Table } from "convex-helpers/server";
import { type Infer, v } from "convex/values";

export type AiAgentPersona = Infer<typeof AiAgentPersona.doc>;

export const AiAgentPersona = Table("aiAgentPersona", {
  agentId: v.string(),
  name: v.string(),
  profilePictureStorageId: v.optional(v.union(v.id("_storage"), v.null())),
});
