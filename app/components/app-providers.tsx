import {
  convexQuery,
  ConvexQueryClient,
  useConvexMutation,
} from "@convex-dev/react-query";
import {
  focusManager,
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { api } from "convex/_generated/api";
import { ConvexProviderWithAuth, ConvexReactClient } from "convex/react";
import React, { useEffect } from "react";
import { useLoaderData, useRevalidator } from "react-router";
import { toast } from "sonner";
import { useWorkosConvexAuth } from "~/components/auth/auth-provider";
import { Toaster } from "~/components/ui/sonner";
import { DialogStoreContextProvider, useDialogStore } from "~/lib/dialog-store";
import { useAnonymousUserId } from "~/lib/hooks/useAnonymousUserId";
import type { loader } from "~/root";
import { CustomErrorBoundary } from "./custom-error-boundary";
import { GenericAlertDialog } from "./dialogs/generic-alert-dialog";
import { ThemeProvider } from "./theme-provider";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);
const convexQueryClient = new ConvexQueryClient(convex);
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      throwOnError: true,
      queryKeyHashFn: convexQueryClient.hashFn(),
      queryFn: convexQueryClient.queryFn(),
    },
  },
});

function AuthenticatedProvider({ children }: { children: React.ReactNode }) {
  const [anonymousUserId, setAnonymousUserId] = useAnonymousUserId();
  const dialogStore = useDialogStore();
  const { data: needMigration } = useQuery(
    convexQuery(api.ai.query.needMigration, {
      anonymousUserId: anonymousUserId,
    })
  );
  const migrateMutation = useMutation({
    mutationKey: ["migrate-anonymous-user"],
    mutationFn: useConvexMutation(api.users.mutation.migrateAnonymousUser),
    onSuccess: (result: {
      totalThreadsMigrated: number;
      totalThreadsProcessed: number;
    }) => {
      toast.success(
        `Successfully migrated ${result.totalThreadsMigrated} out of ${result.totalThreadsProcessed} threads`
      );
      setAnonymousUserId(null);
      dialogStore.trigger.closeAlertDialog();
    },
    onError: (error) => {
      console.error("Failed to migrate threads:", error);
      toast.error("Failed to migrate threads");
    },
  });

  useEffect(() => {
    if (needMigration && anonymousUserId) {
      dialogStore.trigger.openAlertDialog({
        confirmButtonMutationKeys: [["migrate-anonymous-user"]],
        title: "Anonymous chats detected",
        disableCloseOnConfirm: true,
        description:
          "There are anonymous chats that are associated with this browser that can be migrated to your logged in account. Would you like to keep them?",
        cancelText: "No thanks",
        confirmText: "Migrate please",
        onCancel: () => {
          setAnonymousUserId(null);
          dialogStore.trigger.closeAlertDialog();
        },
        onConfirm: () => {
          migrateMutation.mutate({
            anonymousUserId: anonymousUserId,
          });
        },
      });
    }
  }, [
    needMigration,
    anonymousUserId,
    migrateMutation,
    dialogStore,
    setAnonymousUserId,
  ]);

  return <>{children}</>;
}

function BaseProviders({ children }: { children: React.ReactNode }) {
  const { user } = useLoaderData<typeof loader>();

  if (user) {
    return <AuthenticatedProvider>{children}</AuthenticatedProvider>;
  }

  return <>{children}</>;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  const { revalidate } = useRevalidator();
  // revalidate login state on focus change
  useEffect(() => {
    const unsubscribe = focusManager.subscribe(async () => {
      await revalidate();
    });

    return () => {
      unsubscribe();
    };
  }, [revalidate]);

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
          <ThemeProvider>
            <DialogStoreContextProvider>
              <BaseProviders>
                {children}
                <GenericAlertDialog />
                <Toaster />
                <ReactQueryDevtools initialIsOpen={false} />
              </BaseProviders>
            </DialogStoreContextProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </ConvexProviderWithAuth>
    </CustomErrorBoundary>
  );
}
