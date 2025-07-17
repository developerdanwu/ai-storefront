import { type Config } from "@react-router/dev/config";

export default {
  ssr: false,
  prerender: ["/kaolin-signup", "/kaolin-signup/thank-you"],
} satisfies Config;
