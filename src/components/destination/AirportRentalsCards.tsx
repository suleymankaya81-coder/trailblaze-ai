import { airportRentalsLink } from "@/lib/affiliates/webjet";
import { airportRentalPhoto } from "@/lib/data/servicePhotos";
import { estimatedFrom } from "@/lib/data/servicePhotos";
import { PartnerPhotoCard } from "./PartnerPhotoCard";

export function AirportRentalsCards({ slug, airportCode }: { slug: string; airportCode?: string | null }) {
  return <>
    {(["car", "suv"] as const).map((kind) => {
      const photo = airportRentalPhoto(kind, slug);
      return photo ? <PartnerPhotoCard key={kind} brand="Airport Rentals"
        title={`${kind === "car" ? "Standard car rentals" : "SUV rentals"}${airportCode ? ` at ${airportCode}` : ""}`}
        href={airportRentalsLink()} photo={photo} price={estimatedFrom(kind === "car" ? "standard car" : "suv")}
        detail="Pick your dates and vehicle class."
        badges={[airportCode ? `Compare suppliers at ${airportCode}` : "Compare airport suppliers", "Free cancellation on many rates"]}
        cta={airportCode ? `Compare rates at ${airportCode}` : "Compare airport rates"} /> : null;
    })}
  </>;
}