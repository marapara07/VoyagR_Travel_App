import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';

const app = express();
app.use(cors());
app.use(express.json());

const client = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

app.get('/api/health', (req, res) => {
  res.json({ ok: true, ai: Boolean(client) });
});

app.post('/api/itinerary', async (req, res) => {
  const trip = req.body;

  if (!client) {
    return res.json({ itinerary: demoItinerary(trip), mode: 'demo' });
  }

  try {
    const msg = await client.messages.create({
      model: 'claude-3-5-sonnet-latest',
      max_tokens: 1400,
      temperature: 0.7,
      messages: [{
        role: 'user',
        content: `You are Voyagr, an expert AI travel planner. Create a practical itinerary using this JSON trip data: ${JSON.stringify(trip)}.

Rules:
- Organize by day and hour.
- Respect budget, selected hotel, selected activities, distance/radius preference and whether the user wants nearby cities or whole-country exploration.
- Include estimated transport logic, reservation notes, costs, pacing, and alternatives.
- Keep it attractive but realistic.
- Format with clear headings.`
      }]
    });
    const itinerary = msg.content?.map(part => part.text || '').join('\n') || demoItinerary(trip);
    res.json({ itinerary, mode: 'claude' });
  } catch (error) {
    res.status(500).json({ itinerary: demoItinerary(trip), mode: 'fallback', error: error.message });
  }
});

function demoItinerary(trip) {
  const f = trip.form || {};
  const hotel = trip.selectedHotel?.name || 'your selected hotel';
  const cities = trip.suggestedCities || [];
  const activities = trip.selectedActivities?.length ? trip.selectedActivities : [{ title: 'local landmark walk', city: cities[0] || f.destination, price: 25 }];
  return `Claude API key not found, so this is demo mode.\n\n${f.destination || 'Destination'} itinerary\nBudget: €${f.budget || 0}\nEstimated total: €${trip.total || 0}\nBase hotel: ${hotel}\nCoverage: ${f.travelMode === 'whole-country' ? 'Whole country' : `Nearby cities within ${f.radius || 80} km`}\n\nDay 1\n09:00 Arrive, transfer to ${hotel}\n11:00 Explore ${cities[0] || f.destination} by foot\n15:00 Reserved activity: ${activities[0]?.title}\n20:00 Dinner close to the hotel\n\nDay 2\n08:30 Travel to ${cities[1] || cities[0] || 'nearby city'}\n10:30 Main viewpoints and old town route\n14:00 Optional activity based on availability\n18:00 Return or overnight depending on budget\n\nDay 3\n10:00 Slow morning and local market\n13:00 Museum, beach or food experience\n19:30 Final dinner and budget review\n\nAdd ANTHROPIC_API_KEY to .env and run npm run server to get real Claude-generated itineraries.`;
}

const port = process.env.PORT || 8787;
app.listen(port, () => console.log(`Voyagr API running on http://localhost:${port}`));
