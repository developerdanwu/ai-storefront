import {
  convexQuery,
  ConvexQueryClient,
  useConvexMutation,
} from "@convex-dev/react-query";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { QueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { AuthKitProvider } from "@workos-inc/authkit-react";
import { api } from "convex/_generated/api";
import type { BackendErrors } from "convex/errors";
import {
  Authenticated,
  AuthLoading,
  ConvexProviderWithAuth,
  ConvexReactClient,
  Unauthenticated,
} from "convex/react";
import { ConvexError } from "convex/values";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { match } from "ts-pattern";
import { useWorkosConvexAuth } from "~/components/auth/auth-provider";
import { Toaster } from "~/components/ui/sonner";
import { DialogStoreContextProvider, useDialogStore } from "~/lib/dialog-store";
import { useAnonymousUserId } from "~/lib/hooks/useAnonymousUserId";
import {
  githubLanguagesQuery,
  ZReturnGitHubLanguagesQuery,
} from "~/routes/git-wrapped-2025/lib/github-languages.query";
import {
  githubReposQuery,
  ZReturnGitHubReposQuery,
} from "~/routes/git-wrapped-2025/lib/github-repos.query";
import {
  githubUserQuery,
  ZGitHubUser,
} from "~/routes/git-wrapped-2025/lib/github-user.query";
import { CustomErrorBoundary } from "./custom-error-boundary";
import { GenericAlertDialog } from "./dialogs/generic-alert-dialog";
import { ThemeProvider } from "./theme-provider";
import { PageLoadingSpinner } from "./ui/page-loading-spinner";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);
const convexQueryClient = new ConvexQueryClient(convex);

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
  return (
    <>
      <Authenticated>
        <AuthenticatedProvider>{children}</AuthenticatedProvider>
      </Authenticated>
      <AuthLoading>
        <PageLoadingSpinner />
      </AuthLoading>
      <Unauthenticated>{children}</Unauthenticated>
    </>
  );
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [[queryClient, persister]] = useState(() => {
    const persister = createAsyncStoragePersister({
      storage: typeof window !== "undefined" ? window.localStorage : null,
    });

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          throwOnError: true,
          queryKeyHashFn: convexQueryClient.hashFn(),
          queryFn: convexQueryClient.queryFn(),
        },
        mutations: {
          retry: (failureCount, error) => {
            if (error instanceof ConvexError) {
              return match(error.data as BackendErrors)
                .with(
                  {
                    _tag: "NotAuthenticated",
                  },
                  () => {
                    console.log("not authenticated, retrying");
                    return failureCount < 1;
                  }
                )
                .otherwise(() => false);
            }

            return false;
          },
        },
      },
    });

    return [queryClient, persister] as const;
  });

  queryClient.setDefaultOptions;
  return (
    <CustomErrorBoundary
      wrapRenderFallback={(props) => (
        <div className="h-screen flex items-center justify-center">
          {props.children}
        </div>
      )}
    >
      <AuthKitProvider
        https={true}
        clientId={import.meta.env.VITE_WORKOS_CLIENT_ID}
        onRedirectCallback={({ state }) => {
          if (state?.returnTo) {
            navigate(state.returnTo);
          }
        }}
        // have to have custom domain to use dev mode false
        devMode={true}
      >
        <ConvexProviderWithAuth client={convex} useAuth={useWorkosConvexAuth}>
          <PersistQueryClientProvider
            client={queryClient}
            persistOptions={{
              persister,
              dehydrateOptions: {
                shouldDehydrateQuery: ({ queryKey, state }) => {
                  if (typeof queryKey[0] !== "string") {
                    return false;
                  }

                  if (
                    queryKey[0] ===
                    githubReposQuery({ username: "" }).queryKey[0]
                  ) {
                    return ZReturnGitHubReposQuery.safeParse(state.data)
                      .success;
                  }

                  if (
                    queryKey[0] ===
                    githubLanguagesQuery({ repos: [], username: "" })
                      .queryKey[0]
                  ) {
                    return ZReturnGitHubLanguagesQuery.safeParse(state.data)
                      .success;
                  }

                  if (
                    queryKey[0] ===
                    githubUserQuery({ username: "" }).queryKey[0]
                  ) {
                    return ZGitHubUser.safeParse(state.data).success;
                  }

                  return false;
                },
              },
            }}
          >
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
          </PersistQueryClientProvider>
        </ConvexProviderWithAuth>
      </AuthKitProvider>
    </CustomErrorBoundary>
  );
}
