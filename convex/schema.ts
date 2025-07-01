import { defineSchema } from "convex/server";
import { Users } from "./schema/users.schema";

const schema = defineSchema({
  users: Users.table
    .index("externalId", ["externalId"])
    .index("email", ["email"]),
});

export default schema;
