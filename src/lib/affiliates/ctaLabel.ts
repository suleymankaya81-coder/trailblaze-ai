// Action-oriented button text per offer type. Never mentions prices or discounts we cannot verify.
export function offerCtaLabel(category: string | null | undefined, place?: string | null): string {
  const near = place ? ` near ${place}` : "";
  switch (category) {
    case "stay": return `See stays${near}`;
    case "rv_rental": return "Find campervans & RVs from $150/day";
    case "car_rental": return "Compare car rental rates";
    case "activity": return place ? `See tours in ${place}` : "See tour times";
    case "esim": return "Get your US eSIM";
    case "gear_rental": return "Reserve rental gear";
    case "gear_purchase": return "Shop this gear";
    default: return "Open partner site";
  }
}
