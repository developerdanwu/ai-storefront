import { authTables } from "@convex-dev/auth/server";
import { defineSchema } from "convex/server";
import { Users } from "./schema/users.schema";

const schema = defineSchema({
  ...authTables,
  users: Users.table.index("email", ["email"]),
});

export default schema;
