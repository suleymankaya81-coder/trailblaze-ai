/** Collect capped public API responses without losing later records. */
export async function collectPages<T>(read: (from: number, to: number) => Promise<T[]>, pageSize = 1000): Promise<T[]> {
  const all: T[] = [];
  for (let from = 0; ; from += pageSize) {
    const page = await read(from, from + pageSize - 1);
    all.push(...page);
    if (page.length < pageSize) return all;
  }
}