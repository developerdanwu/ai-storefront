import {
  AuthLoading,
  Authenticated as ConvexAuthenticated,
  Unauthenticated as ConvexUnauthenticated,
} from "convex/react";
import React from "react";
import {
  generatePath,
  Navigate,
  useFetcher,
  useLoaderData,
  useRevalidator,
} from "react-router";
import { ROUTES } from "~/lib/routes";
import type { loader } from "~/root";
import { LoadingSpinner } from "../ui/loading-spinner";
import { PageLoadingSpinner } from "../ui/page-loading-spinner";

export function Authenticated({ children }: { children: React.ReactNode }) {
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

export function Unauthenticated({ children }: { children: React.ReactNode }) {
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
  const { submit } = useFetcher();
  const { revalidate } = useRevalidator();
  const fetchAccessToken = React.useCallback(
    async ({ forceRefreshToken }: { forceRefreshToken: boolean }) => {
      if (!accessToken) {
        return null;
      }

      if (forceRefreshToken) {
        console.log("access token expired, refreshing");
        await submit(null, {
          method: "post",
          action: "/refresh-session",
        });
        await revalidate();
      }

      return accessToken ?? null;
    },
    [accessToken, revalidate, submit]
  );

  return React.useMemo(() => {
    return {
      isLoading: false,
      isAuthenticated: true,
      fetchAccessToken,
    };
  }, [user, fetchAccessToken]);
}
