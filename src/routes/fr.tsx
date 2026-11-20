import { createFileRoute, Outlet } from "@tanstack/react-router";

// French section layout. Explicit /fr routes outrank the single-segment search-page route.
export const Route = createFileRoute("/fr")({
  component: () => <Outlet />,
});
