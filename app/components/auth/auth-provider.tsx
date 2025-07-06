import {
  AuthLoading,
  Authenticated as ConvexAuthenticated,
  Unauthenticated as ConvexUnauthenticated,
  Unauthenticated,
  useConvexAuth,
} from "convex/react";
import { jwtDecode } from "jwt-decode";
import React, { useEffect } from "react";
import { generatePath, Navigate, useLoaderData } from "react-router";
import { useAnonymousUserId } from "~/lib/hooks/useAnonymousUserId";
import { ROUTES } from "~/lib/routes";
import type { loader } from "~/root";
import { useRefreshSession } from "~/routes/refresh-session";
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
  const { submit, data, state } = useRefreshSession();
  const refreshedToken = data?.accessToken ?? accessToken ?? null;
  const fetchAccessToken = React.useCallback(
    async ({ forceRefreshToken }: { forceRefreshToken: boolean }) => {
      console.log("fetching access token", forceRefreshToken);
      if (forceRefreshToken) {
        await submit({ method: "post", action: "/refresh-session" });
      }
      return refreshedToken;
    },
    [refreshedToken, submit]
  );
  useEffect(() => {
    function isTokenExpired(token: string): boolean {
      try {
        const decoded: { exp: number } = jwtDecode(token);
        const now = Date.now() / 1000; // in seconds
        return decoded.exp < now;
      } catch {
        // If can't decode, treat as expired
        return true;
      }
    }

    if (refreshedToken) {
      const interval = setInterval(async () => {
        if (isTokenExpired(refreshedToken)) {
          console.log("token expired, refreshing");
          await submit({ method: "post", action: "/refresh-session" });
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, []);

  return React.useMemo(() => {
    return {
      isLoading: state === "submitting",
      isAuthenticated: !!user,
      fetchAccessToken,
    };
  }, [user, fetchAccessToken, state]);
}
