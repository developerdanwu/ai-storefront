import {
  AuthLoading,
  Authenticated as ConvexAuthenticated,
  Unauthenticated as ConvexUnauthenticated,
  Unauthenticated,
  useConvexAuth,
} from "convex/react";
import React from "react";
import {
  generatePath,
  Navigate,
  useLoaderData,
  useNavigation,
} from "react-router";
import { useAnonymousUserId } from "~/lib/hooks/useAnonymousUserId";
import { ROUTES } from "~/lib/routes";
import type { loader } from "~/root";
import { LoadingSpinner } from "../ui/loading-spinner";
import { PageLoadingSpinner } from "../ui/page-loading-spinner";

export function Authenticated({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useConvexAuth();

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

export function AuthenticatedWithRedirect({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AuthLoading>
        <PageLoadingSpinner />
      </AuthLoading>
      <ConvexUnauthenticated>
        <Navigate to={generatePath(ROUTES.home)} />
      </ConvexUnauthenticated>
      <ConvexAuthenticated>{children}</ConvexAuthenticated>
    </>
  );
}

export function UnauthenticatedWithRedirect({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AuthLoading>
        <div className={"flex justify-center items-center h-screen"}>
          <LoadingSpinner size={36} />
        </div>
      </AuthLoading>
      <ConvexAuthenticated>
        <Navigate to={generatePath(ROUTES.chat)} />
      </ConvexAuthenticated>
      <ConvexUnauthenticated>{children}</ConvexUnauthenticated>
    </>
  );
}

export function AnonymousUser({
  children,
  fallback = null,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const [anonymousUserId] = useAnonymousUserId();

  return (
    <Unauthenticated>{anonymousUserId ? children : fallback}</Unauthenticated>
  );
}

export function CatchAll() {
  return (
    <>
      <AuthLoading>
        <PageLoadingSpinner />
      </AuthLoading>
      <ConvexAuthenticated>
        <Navigate to={generatePath(ROUTES.chat)} />
      </ConvexAuthenticated>
      <ConvexUnauthenticated>
        <Navigate to={generatePath(ROUTES.home)} />
      </ConvexUnauthenticated>
    </>
  );
}

export function useWorkosConvexAuth() {
  const { user, accessToken } = useLoaderData<typeof loader>();
  const { state } = useNavigation();
  const isLoading = state === "loading";
  console.log("isLoading", isLoading);
  const fetchAccessToken = React.useCallback(
    async ({ forceRefreshToken }: { forceRefreshToken: boolean }) => {
      console.log("fetching access token", forceRefreshToken);

      return accessToken ?? null;
    },
    []
  );

  return React.useMemo(() => {
    return {
      isLoading,
      isAuthenticated: !!user,
      fetchAccessToken,
    };
  }, [user, fetchAccessToken, isLoading]);
}
