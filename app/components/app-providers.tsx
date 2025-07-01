import { ConvexQueryClient } from "@convex-dev/react-query";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConvexProviderWithAuth, ConvexReactClient } from "convex/react";
import { useWorkosConvexAuth } from "~/components/auth/auth-provider";
import { CustomErrorBoundary } from "./custom-error-boundary";
import { ThemeProvider } from "./theme-provider";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);
const convexQueryClient = new ConvexQueryClient(convex);
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryKeyHashFn: convexQueryClient.hashFn(),
      queryFn: convexQueryClient.queryFn(),
    },
  },
});

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <CustomErrorBoundary
      wrapRenderFallback={(props) => (
        <div className="h-screen flex items-center justify-center">
          {props.children}
        </div>
      )}
    >
      <ConvexProviderWithAuth client={convex} useAuth={useWorkosConvexAuth}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>{children}</ThemeProvider>
        </QueryClientProvider>
      </ConvexProviderWithAuth>
    </CustomErrorBoundary>
  );
}
