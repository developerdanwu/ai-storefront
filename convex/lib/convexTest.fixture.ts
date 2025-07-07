/// <reference types="vite/client" />

import { convexTest as originalConvexTest, type TestConvex } from "convex-test";
import { test } from "vitest";

const convexFolderModules = import.meta.glob("../**/*.*s");

import agentSchema from "../../node_modules/@convex-dev/agent/src/component/schema.js";
import ragSchema from "../../node_modules/@convex-dev/rag/src/component/schema.js";
import schema from "../schema.js";
import { createSeedDbFixture, SeedDbFixture } from "./seedDb.fixture.js";

const ragModules = import.meta.glob(
  "../../node_modules/@convex-dev/rag/src/component/**/*.ts"
);

const agentModules = import.meta.glob(
  "../../node_modules/@convex-dev/agent/src/component/**/*.ts"
);
const t = originalConvexTest(schema, convexFolderModules);
t.registerComponent("rag", ragSchema, ragModules);
t.registerComponent("agent", agentSchema, agentModules);
const seedFixture = createSeedDbFixture({ convex: t });
await seedFixture.createRagDocuments();

export const convexTest = test.extend<{
  convex: TestConvex<typeof schema>;
  seedDB: SeedDbFixture;
}>({
  seedDB: async ({}, use) => {
    await use(seedFixture);
  },
  convex: [
    async ({}, use) => {
      await use(t);
    },
    {
      auto: true,
    },
  ],
});
