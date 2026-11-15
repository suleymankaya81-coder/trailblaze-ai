import { airportRentalsLink } from "@/lib/affiliates/webjet";
import { airportRentalPhoto } from "@/lib/data/servicePhotos";
import { estimatedFrom } from "@/lib/data/servicePhotos";
import { PartnerPhotoCard } from "./PartnerPhotoCard";
import { isNonRoadDestination } from "@/lib/data/destinationAccess";

export function AirportRentalsCards({ slug, airportCode }: { slug: string; airportCode?: string | null }) {
  if (isNonRoadDestination(slug)) return null;
  return <>
    {(["car", "suv"] as const).map((kind) => {
      const photo = airportRentalPhoto(kind, slug);
      return photo ? <PartnerPhotoCard key={kind} brand="Airport Rentals"
        title={`${kind === "car" ? "Standard car rentals" : "SUV rentals"}${airportCode ? ` at ${airportCode}` : ""}`}
        href={airportRentalsLink()} photo={photo} price={estimatedFrom(kind === "car" ? "standard car" : "suv", slug)}
        detail="Pick your dates and vehicle class."
        badges={[airportCode ? `Compare suppliers at ${airportCode}` : "Compare airport suppliers", "Free cancellation on many rates"]}
        cta={airportCode ? `Compare rates at ${airportCode}` : "Compare airport rates"} /> : null;
    })}
  </>;
}