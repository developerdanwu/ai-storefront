import { faker } from "@faker-js/faker";
import { TestConvex } from "convex-test";
import { components, internal } from "../_generated/api.js";
import schema from "../schema.js";
import { User } from "../schema/users.schema.js";

export type SeedDbFixture = ReturnType<typeof createSeedDbFixture>;

export function createSeedDbFixture({
  convex,
}: {
  convex: TestConvex<typeof schema>;
}) {
  return {
    async createAnonymousUser(overrides?: Partial<User>) {
      return convex.run((ctx) =>
        ctx.db.insert("users", {
          isAnonymous: true,
          email: faker.internet.email(),
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          emailVerified: true,
          profilePictureUrl: faker.image.avatar(),
          ...overrides,
        })
      );
    },
    async createExternalUser(overrides?: Partial<User>) {
      return convex.run((ctx) =>
        ctx.db.insert("users", {
          isAnonymous: true,
          email: faker.internet.email(),
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          emailVerified: true,
          profilePictureUrl: faker.image.avatar(),
          ...overrides,
        })
      );
    },
    async createRagDocuments() {
      await convex.action(internal.ai.actionsNode.addCVEmbeddings);
      await convex.action(
        internal.ai.actionsNode.addSoftwareEngineeringJourneyEmbeddings
      );
    },
    async createAiThread(args: {
      defaultSystemPrompt?: string;
      parentThreadIds?: Array<string>;
      summary?: string;
      title?: string;
      userId?: string;
    }) {
      return convex.mutation(components.agent.threads.createThread, args);
    },
  };
}
