import {
  Authenticated as ConvexAuthenticated,
  AuthLoading,
  Unauthenticated as ConvexUnauthenticated,
} from "convex/react";
import React from "react";
import { Navigate } from "react-router";
import { LoadingSpinner } from "../ui/loading-spinner.tsx";
import { PageLoadingSpinner } from "../ui/page-loading-spinner.tsx";
import { ROUTES } from "@/lib/routes.ts";
import { useLocale } from "@/lib/useLocale.ts";

export function Authenticated({ children }: { children: React.ReactNode }) {
  const { generatePath } = useLocale();

  return (
    <>
      <AuthLoading>
        <PageLoadingSpinner />
      </AuthLoading>
      <ConvexUnauthenticated>
        <Navigate to={generatePath(ROUTES.signIn)} />
      </ConvexUnauthenticated>
      <ConvexAuthenticated>{children}</ConvexAuthenticated>
    </>
  );
}

export function Unauthenticated({ children }: { children: React.ReactNode }) {
  const { generatePath } = useLocale();
  return (
    <>
      <AuthLoading>
        <div className={"flex justify-center items-center h-screen"}>
          <LoadingSpinner size={36} />
        </div>
      </AuthLoading>
      <ConvexAuthenticated>
        <Navigate to={generatePath(ROUTES.inbox)} />
      </ConvexAuthenticated>
      <ConvexUnauthenticated>{children}</ConvexUnauthenticated>
    </>
  );
}

export function CatchAll() {
  const { generatePath } = useLocale();
  return (
    <>
      <AuthLoading>
        <PageLoadingSpinner />
      </AuthLoading>
      <ConvexAuthenticated>
        <Navigate to={generatePath(ROUTES.inbox)} />
      </ConvexAuthenticated>
      <ConvexUnauthenticated>
        <Navigate to={generatePath(ROUTES.signIn)} />
      </ConvexUnauthenticated>
    </>
  );
}
