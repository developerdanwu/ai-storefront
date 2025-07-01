import { ok } from "neverthrow";
import { TableNames } from "../_generated/dataModel";
import { QueryCtx } from "../_generated/server";

export function normalizeId<T extends TableNames>(
  ctx: QueryCtx,
  table: T,
  id: string
) {
  return ok(ctx.db.normalizeId(table, id));
}
