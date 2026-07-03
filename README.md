# AI Travel Planner

A clean green/yellow React + Vite travel planning website with mock hotel/activity availability, budget filtering, distance/radius logic, OpenStreetMap preview, reservation draft and Claude AI itinerary generation.

## Run

```bash
npm install
cp .env.example .env
npm run start:full
```

Open the Vite URL, usually `http://localhost:5173`.

## Claude API key

Create an Anthropic Console account, add billing/credits if required, go to API Keys, create a key, copy it once, then paste it in `.env`:

```bash
ANTHROPIC_API_KEY=sk-ant-your-key-here
PORT=8787
```

Then restart the project:

```bash
npm run start:full
```

## What works now

- Press Enter inside the search form or click Search available options.
- Hotels and activities are filtered by destination, budget and distance range.
- Nearby mode limits results by radius.
- Whole-country mode opens the full list.
- The map preview uses OpenStreetMap and does not need an API key.
- Claude generation goes through the Express backend, so the API key is not exposed in React.

## Real application next steps

- Replace mock data with Amadeus, Booking/Expedia affiliate APIs or your own provider database.
- Replace the simple map iframe with Mapbox, Google Maps or Leaflet route polylines.
- Add authentication and saved trips with Supabase/Firebase.
- Add Stripe payments and real booking records.
