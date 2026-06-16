export type Stay = {
  id: string;
  name: string;
  category: "Campground" | "Glamping" | "RV Park" | "Tiny House" | "Cabin" | "Lodge";
  image: string;
  description: string;
  why: string;
  pricePerNight: number;
};

export type Rental = {
  id: string;
  type: "RV" | "Campervan" | "Bike" | "Kayak" | "Gear";
  name: string;
  image: string;
  pricePerDay: number;
  blurb: string;
};

export type Activity = {
  id: string;
  name: string;
  image: string;
  blurb: string;
  duration: string;
};

export type Essential = {
  id: string;
  name: string;
  image: string;
  blurb: string;
  price: number;
};

export type Destination = {
  slug: string;
  name: string;
  region: string;
  tagline: string;
  heroImage: string;
  gallery: string[];
  aliases: string[];
  bestSeason: string;
  scenicScore: number; // 0-10
  campingScore: number; // 0-10
  avgDailyBudget: number; // USD per person
  tripDurationDays: string; // "3-5"
  stays: Stay[];
  rentals: Rental[];
  activities: Activity[];
  essentials: Essential[];
  similar: string[]; // slugs
};

// Stable Unsplash photo URLs (real photography, no AI)
const img = (id: string, w = 1600) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

const commonRentals: Rental[] = [
  {
    id: "rv-1",
    type: "RV",
    name: "Class C Motorhome — Sleeps 4",
    image: img("photo-1469854523086-cc02fe5d8800"),
    pricePerDay: 245,
    blurb: "Full kitchen, queen bed, fits scenic byways without stress.",
  },
  {
    id: "van-1",
    type: "Campervan",
    name: "Sprinter Adventure Van",
    image: img("photo-1532274402911-5a369e4c4bb5"),
    pricePerDay: 189,
    blurb: "Off-grid solar, fold-out bed, parks almost anywhere.",
  },
  {
    id: "bike-1",
    type: "Bike",
    name: "Mountain Bike Day Rental",
    image: img("photo-1485965120184-e220f721d03e"),
    pricePerDay: 65,
    blurb: "Full-suspension trail bike with helmet & repair kit.",
  },
  {
    id: "kayak-1",
    type: "Kayak",
    name: "Touring Kayak (Single)",
    image: img("photo-1463693396721-8ca0cfa2b3b5"),
    pricePerDay: 55,
    blurb: "Stable lake-ready kayak, paddle & PFD included.",
  },
  {
    id: "gear-1",
    type: "Gear",
    name: "Two-Person Tent + Bedding Kit",
    image: img("photo-1504280390367-361c6d9f38f4"),
    pricePerDay: 35,
    blurb: "Skip the airline fees — picked up at the trailhead.",
  },
];

const commonEssentials: Essential[] = [
  {
    id: "e1",
    name: "Insulated 32oz Bottle",
    image: img("photo-1602143407151-7111542de6e8"),
    blurb: "Stays cold 24h on the trail.",
    price: 38,
  },
  {
    id: "e2",
    name: "Merino Base Layer",
    image: img("photo-1556909114-44e3e9699e2b"),
    blurb: "Warm at dawn, breathable by noon.",
    price: 89,
  },
  {
    id: "e3",
    name: "Headlamp 400 Lumen",
    image: img("photo-1551649001-7a2482d98d05"),
    blurb: "Hands-free for setting up after dark.",
    price: 45,
  },
  {
    id: "e4",
    name: "Pocket First-Aid Kit",
    image: img("photo-1603398938378-e54eab446dde"),
    blurb: "The one thing you'll wish you packed.",
    price: 28,
  },
  {
    id: "e5",
    name: "Packable Down Jacket",
    image: img("photo-1551028719-00167b16eac5"),
    blurb: "Shockingly warm. Fits in its own pocket.",
    price: 165,
  },
];

export const destinations: Destination[] = [
  {
    slug: "yellowstone",
    name: "Yellowstone National Park",
    region: "Wyoming, Montana & Idaho",
    tagline: "Geysers, bison herds and an alpine wonderland carved by a supervolcano.",
    heroImage: img("photo-1576176539998-0237d1ac6a85"),
    gallery: [img("photo-1551632811-561732d1e306"), img("photo-1469854523086-cc02fe5d8800")],
    aliases: ["yellowstone national park", "yellow stone"],
    bestSeason: "Late June – September",
    scenicScore: 10,
    campingScore: 9,
    avgDailyBudget: 165,
    tripDurationDays: "5–7 days",
    stays: [
      {
        id: "ys-1",
        name: "Madison Campground",
        category: "Campground",
        image: img("photo-1504280390367-361c6d9f38f4"),
        description: "Riverside sites between Old Faithful and the west entrance.",
        why: "Best base for early-morning geyser visits before the crowds.",
        pricePerNight: 32,
      },
      {
        id: "ys-2",
        name: "Under Canvas Yellowstone",
        category: "Glamping",
        image: img("photo-1517824806704-9040b037703b"),
        description: "Safari-style tents with king beds and wood stoves.",
        why: "Sleep under dark skies without giving up the hot shower.",
        pricePerNight: 449,
      },
      {
        id: "ys-3",
        name: "Fishing Bridge RV Park",
        category: "RV Park",
        image: img("photo-1533873984035-25970ab07461"),
        description: "Full hookups inside the park near Yellowstone Lake.",
        why: "The only in-park spot with sewer hookups for big rigs.",
        pricePerNight: 99,
      },
      {
        id: "ys-4",
        name: "Old Faithful Lodge Cabins",
        category: "Cabin",
        image: img("photo-1510798831971-661eb04b3739"),
        description: "Rustic cabins steps from the geyser basin.",
        why: "Walk to Old Faithful at sunrise — pure magic.",
        pricePerNight: 189,
      },
    ],
    rentals: commonRentals,
    activities: [
      {
        id: "y-a1",
        name: "Lamar Valley Wildlife Safari",
        image: img("photo-1521651201144-634f700b36ef"),
        blurb: "Sunrise tour to spot wolves, bison and grizzlies.",
        duration: "Half day",
      },
      {
        id: "y-a2",
        name: "Grand Prismatic Boardwalk",
        image: img("photo-1533873984035-25970ab07461"),
        blurb: "Hike the overlook for the iconic rainbow shot.",
        duration: "2 hrs",
      },
      {
        id: "y-a3",
        name: "Yellowstone River Fly-Fishing",
        image: img("photo-1499267233122-66de8c11d997"),
        blurb: "Guided wade trips for cutthroat trout.",
        duration: "Full day",
      },
    ],
    essentials: commonEssentials,
    similar: ["glacier", "grand-canyon", "yosemite"],
  },
  {
    slug: "yosemite",
    name: "Yosemite National Park",
    region: "Sierra Nevada, California",
    tagline: "Granite cathedrals, waterfalls and the most photographed valley in America.",
    heroImage: img("photo-1502786129293-79981df4e689"),
    gallery: [img("photo-1500916434205-0c77489c6cf7"), img("photo-1473625247510-8ceb1760943f")],
    aliases: ["yosemite valley", "yosemite national park"],
    bestSeason: "May – early October",
    scenicScore: 10,
    campingScore: 8,
    avgDailyBudget: 175,
    tripDurationDays: "3–5 days",
    stays: [
      {
        id: "yo-1",
        name: "Upper Pines Campground",
        category: "Campground",
        image: img("photo-1504280390367-361c6d9f38f4"),
        description: "Valley-floor tent sites in view of Half Dome.",
        why: "Walk to Mirror Lake at golden hour.",
        pricePerNight: 36,
      },
      {
        id: "yo-2",
        name: "AutoCamp Yosemite",
        category: "Glamping",
        image: img("photo-1520637836862-4d197d17c50a"),
        description: "Airstreams and luxury tents at the park's edge.",
        why: "Design-forward stay 30 min from the valley.",
        pricePerNight: 379,
      },
      {
        id: "yo-3",
        name: "Evergreen Lodge Cabins",
        category: "Cabin",
        image: img("photo-1464822759023-fed622ff2c3b"),
        description: "Hand-built cabins in a private pine forest.",
        why: "The hot tub at night, the hike in the morning.",
        pricePerNight: 295,
      },
      {
        id: "yo-4",
        name: "Indian Flat RV Park",
        category: "RV Park",
        image: img("photo-1533873984035-25970ab07461"),
        description: "Full hookups on the Merced River.",
        why: "Easy in-out for the Highway 140 entrance.",
        pricePerNight: 79,
      },
    ],
    rentals: commonRentals,
    activities: [
      {
        id: "yo-a1",
        name: "Mist Trail to Vernal Falls",
        image: img("photo-1545569310-c733a2a23a40"),
        blurb: "The Yosemite hike — get soaked, get the photo.",
        duration: "Half day",
      },
      {
        id: "yo-a2",
        name: "Glacier Point Sunset",
        image: img("photo-1469474968028-56623f02e42e"),
        blurb: "Drive to the best view in the park.",
        duration: "2 hrs",
      },
      {
        id: "yo-a3",
        name: "Tuolumne Meadows Loop",
        image: img("photo-1500382017468-9049fed747ef"),
        blurb: "High-country wildflowers and granite domes.",
        duration: "Full day",
      },
    ],
    essentials: commonEssentials,
    similar: ["yellowstone", "lake-tahoe", "grand-canyon"],
  },
  {
    slug: "grand-canyon",
    name: "Grand Canyon",
    region: "Northern Arizona",
    tagline: "A mile-deep cut through the desert that rearranges your sense of scale.",
    heroImage: img("photo-1474044159687-1ee9f3a51722"),
    gallery: [img("photo-1502780402662-acc01917cf04"), img("photo-1469474968028-56623f02e42e")],
    aliases: ["grand canyon", "grand canyon national park"],
    bestSeason: "March – May, September – November",
    scenicScore: 10,
    campingScore: 8,
    avgDailyBudget: 140,
    tripDurationDays: "3–4 days",
    stays: [
      {
        id: "gc-1",
        name: "Mather Campground",
        category: "Campground",
        image: img("photo-1504280390367-361c6d9f38f4"),
        description: "Shaded sites a short walk from the South Rim shuttle.",
        why: "No-car access to the rim at sunrise.",
        pricePerNight: 28,
      },
      {
        id: "gc-2",
        name: "Under Canvas Grand Canyon",
        category: "Glamping",
        image: img("photo-1517824806704-9040b037703b"),
        description: "Star-view tents on 160 private acres.",
        why: "Dark-sky stargazing with a king bed waiting.",
        pricePerNight: 399,
      },
      {
        id: "gc-3",
        name: "Trailer Village RV Park",
        category: "RV Park",
        image: img("photo-1533873984035-25970ab07461"),
        description: "The only full-hookup spot inside the park.",
        why: "Walk to the rim from your rig.",
        pricePerNight: 89,
      },
      {
        id: "gc-4",
        name: "Bright Angel Lodge Cabin",
        category: "Cabin",
        image: img("photo-1510798831971-661eb04b3739"),
        description: "Historic rim-edge cabins.",
        why: "Sunrise from your front porch.",
        pricePerNight: 179,
      },
    ],
    rentals: commonRentals,
    activities: [
      {
        id: "gc-a1",
        name: "South Kaibab Trail Day Hike",
        image: img("photo-1502780402662-acc01917cf04"),
        blurb: "Drop below the rim to Ooh Aah Point.",
        duration: "3–5 hrs",
      },
      {
        id: "gc-a2",
        name: "Colorado River Rafting",
        image: img("photo-1530541930197-ff16ac917b0e"),
        blurb: "Single-day smooth-water float from Glen Canyon.",
        duration: "Full day",
      },
      {
        id: "gc-a3",
        name: "Desert View Watchtower Drive",
        image: img("photo-1469474968028-56623f02e42e"),
        blurb: "25-mile scenic drive with the park's best overlooks.",
        duration: "Half day",
      },
    ],
    essentials: commonEssentials,
    similar: ["moab", "yellowstone", "yosemite"],
  },
  {
    slug: "lake-tahoe",
    name: "Lake Tahoe",
    region: "California / Nevada",
    tagline: "Alpine clarity, 72 miles of shoreline and four-season escapes.",
    heroImage: img("photo-1506905925346-21bda4d32df4"),
    gallery: [img("photo-1500382017468-9049fed747ef"), img("photo-1464822759023-fed622ff2c3b")],
    aliases: ["tahoe", "lake tahoe"],
    bestSeason: "June – September, December – March",
    scenicScore: 9,
    campingScore: 9,
    avgDailyBudget: 195,
    tripDurationDays: "3–5 days",
    stays: [
      {
        id: "lt-1",
        name: "D.L. Bliss State Park",
        category: "Campground",
        image: img("photo-1504280390367-361c6d9f38f4"),
        description: "Granite-rimmed sites above Emerald Bay.",
        why: "Wake up to the bluest water in California.",
        pricePerNight: 45,
      },
      {
        id: "lt-2",
        name: "Coachland RV Park",
        category: "RV Park",
        image: img("photo-1533873984035-25970ab07461"),
        description: "Full hookups in Truckee.",
        why: "10 min to north shore, 20 to ski lifts.",
        pricePerNight: 95,
      },
      {
        id: "lt-3",
        name: "Tahoe Tiny on the Pines",
        category: "Tiny House",
        image: img("photo-1518780664697-55e3ad937233"),
        description: "Architect-designed tiny on a private lot.",
        why: "Cozy with a real fireplace and lake views.",
        pricePerNight: 245,
      },
      {
        id: "lt-4",
        name: "Lakeside Cabin Retreat",
        category: "Cabin",
        image: img("photo-1464822759023-fed622ff2c3b"),
        description: "Classic A-frame steps from the water.",
        why: "Private dock and morning kayak ready to go.",
        pricePerNight: 389,
      },
    ],
    rentals: commonRentals,
    activities: [
      {
        id: "lt-a1",
        name: "Emerald Bay Kayak Tour",
        image: img("photo-1463693396721-8ca0cfa2b3b5"),
        blurb: "Paddle to Fannette Island and back.",
        duration: "Half day",
      },
      {
        id: "lt-a2",
        name: "Mt. Tallac Summit Hike",
        image: img("photo-1500382017468-9049fed747ef"),
        blurb: "Strenuous all-day climb with a payoff view.",
        duration: "Full day",
      },
      {
        id: "lt-a3",
        name: "East Shore Bike Path",
        image: img("photo-1485965120184-e220f721d03e"),
        blurb: "Paved, family-friendly, gorgeous.",
        duration: "2–3 hrs",
      },
    ],
    essentials: commonEssentials,
    similar: ["yosemite", "yellowstone", "glacier"],
  },
  {
    slug: "moab",
    name: "Moab & Arches",
    region: "Southeastern Utah",
    tagline: "Red rock, slickrock and arches lit gold at sunset.",
    heroImage: img("photo-1518684079-3c830dcef090"),
    gallery: [img("photo-1502780402662-acc01917cf04"), img("photo-1469474968028-56623f02e42e")],
    aliases: ["moab", "arches", "arches national park"],
    bestSeason: "March – May, September – October",
    scenicScore: 9,
    campingScore: 8,
    avgDailyBudget: 150,
    tripDurationDays: "4–6 days",
    stays: [
      {
        id: "mo-1",
        name: "Devils Garden Campground",
        category: "Campground",
        image: img("photo-1504280390367-361c6d9f38f4"),
        description: "Inside Arches, surrounded by sandstone fins.",
        why: "The only in-park campground — book early.",
        pricePerNight: 25,
      },
      {
        id: "mo-2",
        name: "Under Canvas Moab",
        category: "Glamping",
        image: img("photo-1517824806704-9040b037703b"),
        description: "Tents with views of the La Sal mountains.",
        why: "Stargazing from your bed in dark-sky country.",
        pricePerNight: 379,
      },
      {
        id: "mo-3",
        name: "Moab Valley RV Resort",
        category: "RV Park",
        image: img("photo-1533873984035-25970ab07461"),
        description: "Full hookups, pool, walking distance to town.",
        why: "Best basecamp for both parks plus the brewery.",
        pricePerNight: 89,
      },
      {
        id: "mo-4",
        name: "Red Cliffs Lodge",
        category: "Lodge",
        image: img("photo-1510798831971-661eb04b3739"),
        description: "River-side cabins below towering red walls.",
        why: "Movies were shot here for good reason.",
        pricePerNight: 265,
      },
    ],
    rentals: commonRentals,
    activities: [
      {
        id: "mo-a1",
        name: "Delicate Arch Sunset Hike",
        image: img("photo-1518684079-3c830dcef090"),
        blurb: "The shot you've seen — earn it on foot.",
        duration: "3 hrs",
      },
      {
        id: "mo-a2",
        name: "Colorado River Rafting",
        image: img("photo-1530541930197-ff16ac917b0e"),
        blurb: "Half-day class II–III through Westwater.",
        duration: "Half day",
      },
      {
        id: "mo-a3",
        name: "Slickrock Mountain Biking",
        image: img("photo-1485965120184-e220f721d03e"),
        blurb: "The trail that put Moab on the map.",
        duration: "Half day",
      },
    ],
    essentials: commonEssentials,
    similar: ["grand-canyon", "yellowstone", "glacier"],
  },
  {
    slug: "glacier",
    name: "Glacier National Park",
    region: "Northwest Montana",
    tagline: "Going-to-the-Sun Road, turquoise lakes and the wild crown of the Rockies.",
    heroImage: img("photo-1510328329472-4cf06fc20a36"),
    gallery: [img("photo-1469474968028-56623f02e42e"), img("photo-1500382017468-9049fed747ef")],
    aliases: ["glacier", "glacier national park"],
    bestSeason: "Late June – mid-September",
    scenicScore: 10,
    campingScore: 9,
    avgDailyBudget: 155,
    tripDurationDays: "4–6 days",
    stays: [
      {
        id: "gl-1",
        name: "Many Glacier Campground",
        category: "Campground",
        image: img("photo-1504280390367-361c6d9f38f4"),
        description: "Wildlife-rich valley on the park's east side.",
        why: "Wake to grizzlies on the hillside (from a safe distance).",
        pricePerNight: 30,
      },
      {
        id: "gl-2",
        name: "Under Canvas Glacier",
        category: "Glamping",
        image: img("photo-1517824806704-9040b037703b"),
        description: "Luxury tents 10 minutes from West Glacier.",
        why: "Hot showers after a day on the trail.",
        pricePerNight: 429,
      },
      {
        id: "gl-3",
        name: "St. Mary KOA",
        category: "RV Park",
        image: img("photo-1533873984035-25970ab07461"),
        description: "Full hookups at the east entrance.",
        why: "Best launch for Going-to-the-Sun Road.",
        pricePerNight: 99,
      },
      {
        id: "gl-4",
        name: "Lake McDonald Lodge",
        category: "Lodge",
        image: img("photo-1510798831971-661eb04b3739"),
        description: "Historic Swiss-style lodge on the lake.",
        why: "Sip coffee on the porch over still water.",
        pricePerNight: 289,
      },
    ],
    rentals: commonRentals,
    activities: [
      {
        id: "gl-a1",
        name: "Highline Trail",
        image: img("photo-1510328329472-4cf06fc20a36"),
        blurb: "Walk a cliff-ledge classic with mountain-goat company.",
        duration: "Full day",
      },
      {
        id: "gl-a2",
        name: "Going-to-the-Sun Road Drive",
        image: img("photo-1469474968028-56623f02e42e"),
        blurb: "America's most scenic 50 miles.",
        duration: "Full day",
      },
      {
        id: "gl-a3",
        name: "Lake McDonald Kayak",
        image: img("photo-1463693396721-8ca0cfa2b3b5"),
        blurb: "Glide over rainbow-colored stones.",
        duration: "2 hrs",
      },
    ],
    essentials: commonEssentials,
    similar: ["yellowstone", "lake-tahoe", "yosemite"],
  },
];

export const tripIdeas: Record<string, string> = {
  "rv adventure": "yellowstone",
  "rv road trip": "yellowstone",
  "glamping weekend": "moab",
  "tiny house escape": "lake-tahoe",
  "colorado": "moab",
  "national parks": "yellowstone",
};

export const findDestinationSlug = (query: string): string | null => {
  const q = query.trim().toLowerCase();
  if (!q) return null;
  // exact slug
  const bySlug = destinations.find((d) => d.slug === q);
  if (bySlug) return bySlug.slug;
  // alias / contains
  const byAlias = destinations.find(
    (d) =>
      d.aliases.some((a) => a === q || a.includes(q) || q.includes(a)) ||
      d.name.toLowerCase().includes(q),
  );
  if (byAlias) return byAlias.slug;
  // trip idea map
  for (const [k, v] of Object.entries(tripIdeas)) {
    if (q.includes(k) || k.includes(q)) return v;
  }
  return null;
};

export const getDestination = (slug: string) =>
  destinations.find((d) => d.slug === slug) ?? null;
