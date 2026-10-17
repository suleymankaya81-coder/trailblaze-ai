export type TravelAnswer = { question: string; answer: string; sourceUrl: string };
type PilotGuide = {
  checkedOn: string;
  reservation: { headline: string; note: string; sourceUrl: string };
  answers: TravelAnswer[];
};

// Editorial suggestions are explicitly distinguished from official access rules.
export const destinationAnswers: Record<string, PilotGuide> = {
  yellowstone: {
    checkedOn: "2026-10-17",
    reservation: {
      headline: "Entry pass, separate stay reservations",
      note: "Yellowstone does not require a vehicle entry reservation, but an entrance pass is required. Lodging, campsites and overnight backcountry trips have separate booking or permit rules. Check seasonal road access before choosing your dates.",
      sourceUrl: "https://www.nps.gov/yell/planyourvisit/permitsandreservations.htm",
    },
    answers: [
      { question: "How many days should I spend in Yellowstone?", answer: "MiniaLife suggests three days for the geothermal basins, canyon and northern range in this itinerary. This is our planning suggestion, not an NPS-recommended duration. Yellowstone is large; allow extra time for driving, wildlife delays and seasonal road closures.", sourceUrl: "https://www.nps.gov/yell/planyourvisit/parkroads.htm" },
      { question: "Which Yellowstone sights fit a three-day trip?", answer: "Our suggested sequence pairs Old Faithful with Grand Prismatic Spring on day one, the Grand Canyon of the Yellowstone with Hayden Valley on day two, and Mammoth Hot Springs with Lamar Valley on day three. Adjust the order to your lodging and open roads; the airport map is an arrival route, not this full sightseeing circuit.", sourceUrl: "https://www.nps.gov/yell/planyourvisit/placestogo.htm" },
      { question: "Do I need a reservation to enter Yellowstone?", answer: "NPS does not require a vehicle reservation to enter Yellowstone. An entrance pass is required. Book lodging and campsites separately, and check permit requirements for overnight backcountry stays and other permitted activities.", sourceUrl: "https://www.nps.gov/yell/planyourvisit/permitsandreservations.htm" },
    ],
  },
  "grand-canyon": {
    checkedOn: "2026-10-17",
    reservation: {
      headline: "South Rim entry and separate bookings",
      note: "Grand Canyon National Park does not require an entry reservation or timed entry; an entrance pass is required. Lodging and campgrounds have separate booking arrangements, and overnight backcountry trips require permits. Check current shuttle schedules and trail closures for your dates.",
      sourceUrl: "https://www.nps.gov/grca/planyourvisit/permitsandreservations.htm",
    },
    answers: [
      { question: "How many days should I spend at the Grand Canyon?", answer: "MiniaLife suggests three days for this South Rim itinerary: viewpoints and geology, a rim walk or a hike suited to your ability, and Desert View Drive. This is an editorial suggestion, not an NPS minimum. It does not include the North Rim or a rim-to-rim hike.", sourceUrl: "https://www.nps.gov/grca/planyourvisit/placestogo.htm" },
      { question: "What can I see in three days at the South Rim?", answer: "Start with Mather Point and Yavapai Geology Museum. Use a second day for the Trail of Time and, only if conditions and fitness permit, part of Bright Angel Trail. Visit Grandview Point and Desert View on the third day. Check trail alerts, weather and shuttle schedules before setting out.", sourceUrl: "https://www.nps.gov/grca/planyourvisit/gettingaround.htm" },
      { question: "Does Grand Canyon entry require a reservation?", answer: "NPS does not require entry reservations or timed entry at Grand Canyon National Park. An entrance pass is required. Lodging, campsites and overnight backcountry permits are separate; booking a stay does not replace the entrance pass.", sourceUrl: "https://www.nps.gov/grca/planyourvisit/permitsandreservations.htm" },
    ],
  },
  moab: {
    checkedOn: "2026-10-17",
    reservation: {
      headline: "Arches: no timed entry in 2026",
      note: "NPS says Arches does not require advance timed-entry reservations in 2026, although congestion can temporarily restrict vehicle access. Devils Garden Campground and Fiery Furnace hikes still require reservations or permits. Canyonlands has separate fees and activity permits; recheck both parks for your travel dates, especially for later seasons.",
      sourceUrl: "https://www.nps.gov/arch/planyourvisit/index.htm",
    },
    answers: [
      { question: "How many days should I spend in Moab?", answer: "MiniaLife suggests three days for Arches, Canyonlands' Island in the Sky and nearby scenic drives. This is our suggested duration, not an official park recommendation. The Needles and other Canyonlands districts involve separate, longer drives and are not covered by the Island in the Sky day.", sourceUrl: "https://www.nps.gov/cany/planyourvisit/basicinfo.htm" },
      { question: "How should I split a three-day Moab trip?", answer: "Our plan uses one day for Delicate Arch and the Windows Section in Arches, a separate day for Mesa Arch and Grand View Point in Canyonlands' Island in the Sky, and a third day for the nearby scenic-drive stops below. Adjust hikes for heat and ability; do not treat all Canyonlands districts as one connected drive.", sourceUrl: "https://www.nps.gov/cany/planyourvisit/islandinthesky.htm" },
      { question: "Do Arches and Canyonlands need timed-entry reservations?", answer: "For 2026, NPS says Arches does not require advance timed-entry reservations; congestion may still cause temporary vehicle diversions. Canyonlands does not require timed entry. Entrance fees, campground bookings and activity permits are separate. Recheck the official rules for your dates rather than assuming future years will be the same.", sourceUrl: "https://www.nps.gov/arch/planyourvisit/index.htm" },
    ],
  },
};

export function getDestinationAnswers(slug: string): PilotGuide | null {
  return Object.prototype.hasOwnProperty.call(destinationAnswers, slug) ? destinationAnswers[slug] : null;
}