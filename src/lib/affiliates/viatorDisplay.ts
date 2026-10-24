/** Show only valid provider-supplied ratings and real review counts. */
export function hasViatorRating(rating: number | null | undefined, reviews: number): rating is number {
  return typeof rating === "number" && Number.isFinite(rating) && rating > 0 && rating <= 5 && Number.isInteger(reviews) && reviews > 0;
}

export function validViatorHeight(height: unknown): number | null {
  return typeof height === "number" && Number.isFinite(height) && height >= 0 && height <= 100000 ? Math.ceil(height) : null;
}