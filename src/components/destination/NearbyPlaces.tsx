import { T, useTp } from "@/lib/i18n";
import { SwipeRow, PlaceCard } from "@/components/ui-kit";
import { destinationPath } from "@/lib/routes/paths";
import type { SimilarDestination } from "@/lib/data/destinations.functions";

/**
 * Nearest places from stored coordinates (src/data/nearby.json via the loader). Renders nothing when
 * there are none — never an "empty" message. Shared by place pages and their guides.
 */
export function NearbyPlaces({ name, places, max = 6 }: { name: string; places: SimilarDestination[]; max?: number }) {
  const tp = useTp();
  const list = places.slice(0, max);
  if (!list.length) return null;
  return (
    <section aria-labelledby="nearby-title">
      <h2 id="nearby-title" className="mb-4 font-display text-2xl text-foreground md:text-3xl"><T>{`Places near ${name}`}</T></h2>
      <SwipeRow className="md:grid-cols-3 xl:grid-cols-6">
        {list.map((d) => (
          <PlaceCard key={d.slug} to={destinationPath(d.slug)} image={d.heroImage} alt={d.name} title={d.name}
            info={[d.distanceKm != null ? tp(`${d.distanceKm} km away`) : null, d.region].filter(Boolean).join(" · ")} />
        ))}
      </SwipeRow>
    </section>
  );
}
