import { useLocalStorage } from "usehooks-ts";

export function useAnonymousUserId() {
  return useLocalStorage<string | null>("anonymous-user-id", null);
}
