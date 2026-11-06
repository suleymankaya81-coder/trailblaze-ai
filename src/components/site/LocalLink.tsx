import { forwardRef } from "react";
import { Link as RouterLink } from "@tanstack/react-router";
import { useLocale } from "@/lib/i18n";
import { fillParams, localTarget } from "@/lib/i18n/localPath";

/** Drop-in Link: on a German page, points to the German version when one exists. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const LocalLinkImpl = forwardRef<HTMLAnchorElement, any>(function LocalLink(props, ref) {
  const locale = useLocale();
  const { to, params, ...rest } = props;
  if (typeof to === "string") {
    const target = localTarget(fillParams(to, typeof params === "object" ? params : undefined), locale);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (target) return <RouterLink ref={ref} {...rest} to={target as any} />;
  }
  return <RouterLink ref={ref} {...props} />;
});

export const Link = LocalLinkImpl as unknown as typeof RouterLink;
