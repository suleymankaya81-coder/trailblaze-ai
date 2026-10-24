import { useEffect, useRef, useState, type ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/** Preserve the image slot without substituting an unrelated place or product. */
export function SafeImage({ src, alt = "", className, ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  const ref = useRef<HTMLImageElement>(null);
  const [failedSrc, setFailedSrc] = useState<string>();
  useEffect(() => {
    const image = ref.current;
    if (image?.complete && image.naturalWidth === 0) setFailedSrc(String(src));
  }, [src]);
  if (!src || failedSrc === src) return <span role={alt ? "img" : undefined} aria-label={alt ? `${alt} — photo unavailable` : undefined} aria-hidden={alt ? undefined : true} className={cn("block bg-muted", className)} style={props.style} />;
  return <img {...props} ref={ref} src={src} alt={alt} className={className} onError={() => setFailedSrc(String(src))} />;
}