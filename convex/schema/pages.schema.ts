import { Table } from "convex-helpers/server";
import { type Infer, v } from "convex/values";

export type Page = Infer<typeof Page.doc>;

export const Page = Table("page", {
  name: v.string(),
  slug: v.string(),
  userId: v.optional(v.id("users")),
});
