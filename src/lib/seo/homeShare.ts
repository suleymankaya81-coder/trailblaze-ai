import { SITE_ORIGIN } from "@/config/site";
import dolomitesShare from "@/assets/seo/dolomites-share.jpg.asset.json";

// Same photograph as the first homepage collage panel, cropped to 1200 × 630.
// Photo: kallerna, CC BY-SA 4.0. Crop retains that licence.
// https://commons.wikimedia.org/wiki/File:Faloria_Cortina_d%27Ampezzo_10.jpg
const SOURCE = "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/36/Faloria_Cortina_d%27Ampezzo_10.jpg/1920px-Faloria_Cortina_d%27Ampezzo_10.jpg";

/** Only tag this rendition while the same photo is actually displayed. */
export function homeShareMeta(places: readonly { countryCode?: string | null; heroImage: string }[]) {
  const scene = ["it", "us", "es"].map((country) => places.find((place) => place.countryCode === country)).find((place) => place);
  if (scene?.heroImage !== SOURCE) return [];
  const image = dolomitesShare.url.startsWith("https://") ? dolomitesShare.url : `${SITE_ORIGIN}${dolomitesShare.url}`;
  return [
    { property: "og:image", content: image },
    { name: "twitter:image", content: image },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:image:type", content: "image/jpeg" },
    { property: "og:image:alt", content: "Dolomites, Italy — photo: kallerna, CC BY-SA 4.0 (cropped)" },
    { name: "twitter:image:alt", content: "Dolomites, Italy — photo: kallerna, CC BY-SA 4.0 (cropped)" },
  ];
}