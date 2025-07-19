import { defineSchema } from "convex/server";
import { AiAgentPersona } from "./schema/aiAgentPersona.schema";
import { Page } from "./schema/pages.schema";
import { Users } from "./schema/users.schema";

const schema = defineSchema({
  users: Users.table
    .index("externalId", ["externalId"])
    .index("email", ["email"]),
  aiAgentPersona: AiAgentPersona.table
    .index("agentId", ["agentId"])
    .index("userId", ["userId"]),
  page: Page.table.index("slug", ["slug"]).index("userId", ["userId"]),
});

export default schema;
