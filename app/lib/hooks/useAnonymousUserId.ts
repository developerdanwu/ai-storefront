import type { Id } from "convex/_generated/dataModel";
import { useLocalStorage } from "usehooks-ts";

export function useAnonymousUserId() {
  return useLocalStorage<Id<"users"> | null>("anonymous-user-id", null);
}
