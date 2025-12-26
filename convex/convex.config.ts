import cache from "@convex-dev/action-cache/convex.config";
import agent from "@convex-dev/agent/convex.config";
import rag from "@convex-dev/rag/convex.config";
import rateLimiter from "@convex-dev/rate-limiter/convex.config";
import resend from "@convex-dev/resend/convex.config";
import workflow from "@convex-dev/workflow/convex.config";
import workOSAuthKit from "@convex-dev/workos-authkit/convex.config";
import { defineApp } from "convex/server";

const app = defineApp();
app.use(agent);
app.use(workflow);
app.use(rag);
app.use(cache);
app.use(rateLimiter);
app.use(resend);
app.use(workOSAuthKit);
export default app;
