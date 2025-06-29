import { Table } from "convex-helpers/server";
import { type Infer, v } from "convex/values";

export type User = Infer<typeof Users.doc>;

export const Users = Table("users", {
  name: v.optional(v.string()),
  image: v.optional(v.string()),
  email: v.optional(v.string()),
  emailVerificationTime: v.optional(v.number()),
  phone: v.optional(v.string()),
  phoneVerificationTime: v.optional(v.number()),
  isAnonymous: v.optional(v.boolean()),
  // other "users" fields...
});
