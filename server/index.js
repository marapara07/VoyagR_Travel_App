import "dotenv/config";
import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import { GoogleGenAI } from "@google/genai";

const app = express();

app.use(cors());
app.use(express.json({ limit: "2mb" }));

const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  : null;

app.get("/api/health", (req, res) => {
  res.json({ ok: true, ai: Boolean(ai), provider: "gemini" });
});

app.post("/api/itinerary", async (req, res) => {
  const trip = req.body;

  if (!ai) {
    return res.json({
      itinerary: demoItinerary(trip),
      mode: "demo",
      provider: "gemini",
    });
  }

  try {
    const prompt = `
You are VoyagR, an expert AI travel planner.

Create a beautiful, practical itinerary using this trip data:
${JSON.stringify(trip, null, 2)}

Rules:
- Organize the itinerary by day and hour.
- Use the selected stay as the base location.
- Use only the selected itinerary items when possible.
- Respect budget, dates, distance range, travel coverage and pacing.
- Include transport logic between places.
- Include reservation notes and availability notes when useful.
- Avoid generic filler.
- Format clearly with headings:
  TRIP OVERVIEW
  DAY 1
  DAY 2
  COST SUMMARY
  PRACTICAL NOTES
- Keep it realistic, elegant and useful.
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const itinerary =
      response.text ||
      response.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("\n") ||
      demoItinerary(trip);

    res.json({
      itinerary,
      mode: "gemini",
      provider: "gemini",
    });
  } catch (error) {
    console.error("Gemini itinerary failed:", error);
    res.status(500).json({
      itinerary: demoItinerary(trip),
      mode: "fallback",
      provider: "gemini",
      error: error.message,
    });
  }
});

app.get("/api/geocode", async (req, res) => {
  try {
    const q = req.query.q;

    if (!q) {
      return res.status(400).json({ error: "Missing query parameter q" });
    }

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        q
      )}&limit=8&addressdetails=1`,
      {
        headers: {
          "User-Agent": "VoyagR Travel App",
        },
      }
    );

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Geocoding failed:", error);
    res.status(500).json({ error: "Geocoding failed", details: error.message });
  }
});

app.post("/api/places", async (req, res) => {
  try {
    const { lat, lng, radiusKm } = req.body;

    if (!lat || !lng) {
      return res.status(400).json({ error: "Missing lat/lng" });
    }

    const radius = Math.min(Number(radiusKm || 80) * 1000, 50000);

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

        node["amenity"~"bar|pub"](around:${radius},${lat},${lng});
        way["amenity"~"bar|pub"](around:${radius},${lat},${lng});
        relation["amenity"~"bar|pub"](around:${radius},${lat},${lng});

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

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Overpass failed ${response.status}: ${text.slice(0, 200)}`);
    }

    const data = await response.json();
    res.json(data.elements || []);
  } catch (error) {
    console.error("Places search failed:", error);
    res.status(500).json({
      error: "Places search failed",
      details: error.message,
    });
  }
});

function demoItinerary(trip) {
  const destination = trip.destination || trip.search?.destination || "Destination";
  const hotel = trip.selectedStay?.name || "your selected hotel";
  const days = trip.days || 3;
  const activities = trip.itineraryItems?.length
    ? trip.itineraryItems
    : [{ name: "local landmark walk", price: 25 }];

  const lines = [
    "Gemini API key not found, so this is demo mode.",
    "",
    `${destination} itinerary`,
    `Base hotel: ${hotel}`,
    `Estimated total: ${trip.total || 0}`,
    "",
  ];

  for (let day = 1; day <= days; day++) {
    const first = activities[(day - 1) % activities.length];
    const second = activities[day % activities.length];

    lines.push(`DAY ${day}`);
    lines.push(`09:00 Breakfast near ${hotel}`);
    lines.push(`11:00 Visit ${first?.name || "a nearby place"}`);
    lines.push("13:30 Lunch or coffee nearby");
    lines.push(`16:00 Continue with ${second?.name || "a local attraction"}`);
    lines.push("20:00 Dinner close to the stay");
    lines.push("");
  }

  lines.push("Add GEMINI_API_KEY to Render Environment Variables to get real Gemini-generated itineraries.");

  return lines.join("\n");
}

const port = process.env.PORT || 8787;

app.listen(port, () => {
  console.log(`Voyagr API running on http://localhost:${port}`);
});