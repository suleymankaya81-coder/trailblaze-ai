import { createServerFn } from "@tanstack/react-start";
import { isShopCategory, type ShopCategoryFile } from "./gearShop.categories";

// Load one compact category file on the server so the browser never bundles all products.
const loaders: Record<string, () => Promise<{ default: unknown }>> = {
  camping: () => import("@/data/gear-categories/camping.json"),
  hiking: () => import("@/data/gear-categories/hiking.json"),
  cycling: () => import("@/data/gear-categories/cycling.json"),
  lights: () => import("@/data/gear-categories/lights.json"),
  apparel: () => import("@/data/gear-categories/apparel.json"),
  eyewear: () => import("@/data/gear-categories/eyewear.json"),
  bags: () => import("@/data/gear-categories/bags.json"),
};

export const getShopCategory = createServerFn({ method: "GET" })
  .inputValidator((d: { key: string }) => d)
  .handler(async ({ data }): Promise<ShopCategoryFile | null> => {
    if (!isShopCategory(data.key)) return null;
    return (await loaders[data.key]()).default as ShopCategoryFile;
  });
