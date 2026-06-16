import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";

import { destinations, findDestinationSlug } from "@/data/destinations";

const SearchSchema = z.object({ q: z.string().optional() });

export const Route = createFileRoute("/search")({
  validateSearch: (search) => SearchSchema.parse(search),
  loaderDeps: ({ search }) => ({ q: search.q ?? "" }),
  loader: ({ deps }) => {
    const slug = findDestinationSlug(deps.q) ?? destinations[0]!.slug;
    throw redirect({ to: "/destinations/$slug", params: { slug } });
  },
});
