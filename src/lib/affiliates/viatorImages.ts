/** Prefer a large provider photo, but retain valid smaller provider variants. */
export function viatorProductImage(images?: { isCover?: boolean; variants: { width: number; url: string }[] }[]): string | null {
  const ordered = [...(images ?? [])].sort((a, b) => Number(!!b.isCover) - Number(!!a.isCover));
  for (const image of ordered) {
    const variant = image.variants.filter((v) => v.url.startsWith("https://")).sort((a, b) => b.width - a.width)[0];
    if (variant) return variant.url;
  }
  return null;
}