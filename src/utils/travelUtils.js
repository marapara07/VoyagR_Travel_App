import { destinations } from "../data/mockTravelData";

export function estimateDays(start, end) {
  if (!start || !end) return 4;
  const days = Math.ceil((new Date(end) - new Date(start)) / 86400000) + 1;
  return Number.isFinite(days) && days > 0 ? days : 4;
}

export function distanceKm(aLat, aLng, bLat, bLng) {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;

  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((aLat * Math.PI) / 180) *
      Math.cos((bLat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

export async function geocodeDestination(destination) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      destination
    )}&limit=1`
  );

  const json = await response.json();

  if (!json.length) {
    const fallback = destinations[destination]?.center || {
      lat: 41.9028,
      lng: 12.4964,
    };

    return [fallback.lat, fallback.lng];
  }

  return [Number(json[0].lat), Number(json[0].lon)];
}

export async function fetchOverpassData(lat, lng, radiusKm) {
  const radius = Math.min(Number(radiusKm) * 1000, 50000);

  const query = `
    [out:json][timeout:25];
    (
      node["tourism"~"hotel|hostel|guest_house|apartment"](around:${radius},${lat},${lng});
      way["tourism"~"hotel|hostel|guest_house|apartment"](around:${radius},${lat},${lng});
      relation["tourism"~"hotel|hostel|guest_house|apartment"](around:${radius},${lat},${lng});

      node["tourism"~"attraction|museum|viewpoint|gallery|theme_park|zoo"](around:${radius},${lat},${lng});
      way["tourism"~"attraction|museum|viewpoint|gallery|theme_park|zoo"](around:${radius},${lat},${lng});
      relation["tourism"~"attraction|museum|viewpoint|gallery|theme_park|zoo"](around:${radius},${lat},${lng});

      node["amenity"~"restaurant|cafe|bar|pub|fast_food"](around:${radius},${lat},${lng});
      way["amenity"~"restaurant|cafe|bar|pub|fast_food"](around:${radius},${lat},${lng});
      relation["amenity"~"restaurant|cafe|bar|pub|fast_food"](around:${radius},${lat},${lng});

      node["leisure"~"park|water_park|sports_centre|fitness_centre"](around:${radius},${lat},${lng});
      way["leisure"~"park|water_park|sports_centre|fitness_centre"](around:${radius},${lat},${lng});
      relation["leisure"~"park|water_park|sports_centre|fitness_centre"](around:${radius},${lat},${lng});
    );
    out center tags 160;
  `;

  const response = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    body: query,
  });

  const json = await response.json();
  return json.elements || [];
}

export function normalizePlaces(elements) {
  const hotels = [];
  const nearby = [];

  elements.forEach((element, index) => {
    const lat = element.lat || element.center?.lat;
    const lng = element.lon || element.center?.lon;
    const name = element.tags?.name;

    if (!lat || !lng || !name) return;

    const tourismType = element.tags?.tourism;
    const amenityType = element.tags?.amenity;
    const leisureType = element.tags?.leisure;

    const basePlace = {
      id: `${element.type}-${element.id}`,
      name,
      lat,
      lng,
      address:
        element.tags?.["addr:street"] ||
        element.tags?.["addr:city"] ||
        tourismType ||
        amenityType ||
        leisureType ||
        "Real OpenStreetMap location",
      website: element.tags?.website || element.tags?.["contact:website"] || "",
      phone: element.tags?.phone || element.tags?.["contact:phone"] || "",
      openingHours: element.tags?.opening_hours || "Opening hours not listed",
      image:element.tags?.image || element.tags?.wikimedia_commons || element.tags?.["contact:image"] ||
  "",
    };

    if (["hotel", "hostel", "guest_house", "apartment"].includes(tourismType)) {
      hotels.push({
        ...basePlace,
        rating: (4 + Math.random()).toFixed(1),
        price: 55 + ((index * 17) % 120),
      });
      return;
    }

    let category = "activities";

    if (
      amenityType === "restaurant" ||
      amenityType === "cafe" ||
      amenityType === "fast_food"
    ) {
      category = "restaurants";
    } else if (amenityType === "bar" || amenityType === "pub") {
      category = "bars";
    } else if (tourismType) {
      category = "attractions";
    }

    nearby.push({
      ...basePlace,
      category,
      type: tourismType || amenityType || leisureType || "activity",
      price:
        category === "restaurants"
          ? 25 + ((index * 5) % 45)
          : 10 + ((index * 7) % 45),
      duration:
        category === "restaurants"
          ? "1h 30m"
          : category === "bars"
          ? "1h"
          : ["1h", "2h", "3h"][index % 3],
      guidedTours:
        tourismType === "museum" ||
        tourismType === "attraction" ||
        tourismType === "gallery"
          ? "Guided tours may be available"
          : "No guided tour info",
      onlineBooking:
        element.tags?.website || element.tags?.["contact:website"]
          ? "Online info available"
          : "Online booking not listed",
      availability:
        element.tags?.opening_hours
          ? `Usually available: ${element.tags.opening_hours}`
          : "Availability not listed online",
    });
  });

  return {
    hotels: hotels.slice(0, 14),
    nearby: nearby.slice(0, 40),
  };
}

export function fallbackItinerary({
  destination,
  days,
  selectedStay,
  itineraryItems,
  total,
}) {
  const chosen = itineraryItems.length
    ? itineraryItems
    : [{ name: "Local walk", duration: "1h", category: "activity" }];

  const dayNames = [
    "FIRST DAY",
    "SECOND DAY",
    "THIRD DAY",
    "FOURTH DAY",
    "FIFTH DAY",
    "SIXTH DAY",
    "SEVENTH DAY",
    "EIGHTH DAY",
    "NINTH DAY",
    "TENTH DAY",
  ];

  const lines = [
    `Voyagr itinerary for ${destination}`,
    `Base stay: ${selectedStay?.name || "Selected stay"}`,
    `Trip length: ${days} days`,
    `Estimated cost: ${total}`,
    ``,
  ];

  for (let day = 1; day <= days; day++) {
    const first = chosen[(day - 1) % chosen.length];
    const second = chosen[day % chosen.length];
    const third = chosen[(day + 1) % chosen.length];
    const title = dayNames[day - 1] || `DAY ${day}`;

    lines.push(`${day}. ${title}`);

    if (day === 1) {
      lines.push(`- 14:00 Check-in at ${selectedStay?.name || "your selected hotel"}`);
      lines.push(`- 15:30 Get settled and walk around ${selectedStay?.address || destination}`);
    } else {
      lines.push(`- 09:30 Breakfast near ${selectedStay?.name || "your stay"}`);
    }

    lines.push(`- 11:00 Visit ${first?.name || "a nearby place"}`);
    lines.push(`- 13:30 Lunch or coffee nearby`);
    lines.push(`- 16:00 Continue with ${second?.name || "a local attraction"}`);
    lines.push(`- 19:30 Evening plan: ${third?.name || "walk around the city center"}`);
    lines.push(``);
  }

  lines.push(`This itinerary uses only the places added by the user and adapts to the selected dates.`);

  return lines.join("\n");
}
