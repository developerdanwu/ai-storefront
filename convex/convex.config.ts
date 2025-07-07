import cache from "@convex-dev/action-cache/convex.config";
import agent from "@convex-dev/agent/convex.config";
import rag from "@convex-dev/rag/convex.config";
import rateLimiter from "@convex-dev/rate-limiter/convex.config";
import workflow from "@convex-dev/workflow/convex.config";
import { defineApp } from "convex/server";

const app = defineApp();
app.use(agent);
app.use(workflow);
app.use(rag);
app.use(cache);
app.use(rateLimiter);
export default app;
