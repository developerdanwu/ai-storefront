import type { LinksFunction } from "react-router";
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import { AppProviders } from "~/components/app-providers";
import { PageLoadingSpinner } from "./components/ui/page-loading-spinner";
import "./tailwind.css";

export const links: LinksFunction = () => [
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export function HydrateFallback() {
  return <PageLoadingSpinner />;
}

export default function App() {
  return (
    <AppProviders>
      <Outlet />
    </AppProviders>
  );
}
