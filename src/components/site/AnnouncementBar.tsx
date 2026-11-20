import { T } from "@/lib/i18n";
import { ArrowUpRight } from "lucide-react";
import { isMhrBlackFridayLive } from "@/lib/affiliates/mhrBlackFriday";
import { motorhomeRepublicLink } from "@/lib/affiliates/webjet";

/**
 * Site-wide top announcement bar for the Motorhome Republic Black Friday
 * campaign. Renders only inside the campaign window (12 Nov – 2 Dec 2026)
 * and scrolls away above the sticky header. The link keeps the Webjet
 * affiliate tag via motorhomeRepublicLink().
 */
export function AnnouncementBar() {
  if (!isMhrBlackFridayLive()) return null;
  return (
    <div className="bg-forest text-off-white">
      <div className="container-page flex min-h-10 flex-wrap items-center justify-center gap-x-3 gap-y-1 py-1.5 text-center text-xs sm:text-sm">
        <p className="font-medium">
          <T>Black Friday: Cruise America & Cruise Canada motorhomes up to 35% off — ends 2 Dec.</T>
        </p>
        <a
          href={motorhomeRepublicLink()}
          target="_blank"
          rel="sponsored noopener"
          className="inline-flex items-center gap-1 rounded-full bg-off-white px-3 py-1 text-xs font-semibold text-forest transition hover:bg-sage"
        >
          <T>See the deal</T>
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}
