import { defineSchema } from "convex/server";
import { AiAgentPersona } from "./schema/aiAgentPersona.schema";
import { Users } from "./schema/users.schema";

const schema = defineSchema({
  users: Users.table
    .index("externalId", ["externalId"])
    .index("email", ["email"]),
  aiAgentPersona: AiAgentPersona.table.index("agentId", ["agentId"]),
});

export default schema;
