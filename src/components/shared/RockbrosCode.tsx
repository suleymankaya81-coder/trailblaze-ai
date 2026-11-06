import { T } from "@/lib/i18n";
import { Tag } from "lucide-react";
import { activeRockbrosPromo } from "@/lib/affiliates/rockbrosPromo";

/** Small "10% off · code WELCOME10" note for ROCKBROS cards and pages; renders nothing after expiry. */
export function RockbrosCode({ className = "" }: { className?: string }) {
  const promo = activeRockbrosPromo();
  if (!promo) return null;
  return (
    <p className={`inline-flex items-center gap-1.5 rounded-full bg-accent px-2.5 py-1 text-[11px] font-semibold text-accent-foreground ${className}`}>
      <Tag className="h-3 w-3 shrink-0" aria-hidden />
      <span className="whitespace-nowrap">{promo.percentOff}% off · code <span className="font-bold tracking-wide"><T>{promo.code}</T></span></span>
    </p>
  );
}
