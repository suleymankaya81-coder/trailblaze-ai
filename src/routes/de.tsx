import { createFileRoute, Outlet } from "@tanstack/react-router";

// German section layout. Explicit /de routes outrank the single-segment search-page route.
export const Route = createFileRoute("/de")({
  component: () => <Outlet />,
});
