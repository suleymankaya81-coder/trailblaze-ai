import { airportRentalsLink } from "@/lib/affiliates/webjet";
import { airportRentalPhoto } from "@/lib/data/servicePhotos";
import { PartnerPhotoCard } from "./PartnerPhotoCard";

export function AirportRentalsCards({ slug, airportCode }: { slug: string; airportCode?: string | null }) {
  return <>
    {(["car", "suv"] as const).map((kind) => {
      const photo = airportRentalPhoto(kind, slug);
      return photo ? <PartnerPhotoCard key={kind} brand="Airport Rentals"
        title={`${kind === "car" ? "Standard car rentals" : "SUV rentals"}${airportCode ? ` at ${airportCode}` : ""}`}
        href={airportRentalsLink()} photo={photo}
        detail="Choose your pickup location, dates and vehicle class on Airport Rentals. Check live prices and availability there." /> : null;
    })}
  </>;
}