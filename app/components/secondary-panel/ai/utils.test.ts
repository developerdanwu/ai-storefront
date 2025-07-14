import type { Id } from "convex/_generated/dataModel";
import { describe, expect, it } from "vitest";
import { getActiveAgentId } from "./utils";

describe("getActiveAgentId", () => {
  // Mock agent IDs for testing
  const mockAgentId1 = "agent1" as Id<"aiAgentPersona">;
  const mockAgentId2 = "agent2" as Id<"aiAgentPersona">;
  const mockAgentId3 = "agent3" as Id<"aiAgentPersona">;

  it("should return the activeAgentId when it exists in availableAgentIds", () => {
    const result = getActiveAgentId({
      availableAgentIds: [mockAgentId1, mockAgentId2],
      activeAgentId: mockAgentId2,
    });

    expect(result).toBe(mockAgentId2);
  });

  it("should return the first available agent when activeAgentId is null", () => {
    const result = getActiveAgentId({
      availableAgentIds: [mockAgentId1, mockAgentId2, mockAgentId3],
      activeAgentId: null,
    });

    expect(result).toBe(mockAgentId1);
  });

  it("should return undefined when availableAgentIds is empty and activeAgentId is null", () => {
    const result = getActiveAgentId({
      availableAgentIds: [],
      activeAgentId: null,
    });

    expect(result).toBeUndefined();
  });

  it("should return undefined when availableAgentIds is empty even if activeAgentId is provided", () => {
    const result = getActiveAgentId({
      availableAgentIds: [],
      activeAgentId: mockAgentId1,
    });

    expect(result).toBeUndefined();
  });

  it("should return the first available agent when activeAgentId is not in availableAgentIds", () => {
    const result = getActiveAgentId({
      availableAgentIds: [mockAgentId1, mockAgentId2],
      activeAgentId: mockAgentId3, // This ID is not in the available list
    });

    expect(result).toBe(mockAgentId1);
  });
});
