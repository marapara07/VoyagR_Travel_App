import { Calendar, Compass, MapPinned, Plane, Route, Wallet, Sparkles } from "lucide-react";
import { currencyOptions } from "../data/currencies";
import { Field } from "./UI";

export default function SearchPanel({
  form,
  setForm,
  currencyCode,
  setCurrencyCode,
  destinationSuggestions,
  showSuggestions,
  setShowSuggestions,
  setDestinationSuggestions,
  setMapCenter,
  searchDestinations,
  runSearch,
  isSearching,
}) {
  return (
    <form id="explore" className="panel search-panel" onSubmit={runSearch}>
      <div className="search-hero">
        <div className="hero-copy">
          <span className="eyebrow"><Sparkles size={16} /> AI route builder</span>
          <h1>Plan a greener, smarter trip in a few clicks.</h1>
          <p>
            Choose a destination, budget and travel radius. Voyagr gathers stays, nearby places,
            map pins and builds an itinerary around what you actually select.
          </p>
        </div>

        <div className="hero-card">
          <div className="hero-card-icon"><Plane /></div>
          <div>
            <b>Voyagr Compass</b>
            <span>Live map, stays, places and day-by-day planning.</span>
          </div>
        </div>
      </div>

      <div className="grid-form">
        <Field label="Destination" icon={<MapPinned />}>
          <div className="destination-autocomplete">
            <input
              value={form.destination}
              onChange={(event) => searchDestinations(event.target.value)}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Search country, city, island or region..."
            />

            {showSuggestions && destinationSuggestions.length > 0 && (
              <div className="suggestions-menu">
                {destinationSuggestions.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      setForm({ ...form, destination: item.value });
                      setMapCenter([item.lat, item.lng]);
                      setDestinationSuggestions([]);
                      setShowSuggestions(false);
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </Field>

        <Field label="Budget" icon={<Wallet />}>
          <input
            type="number"
            min="0"
            value={form.budget}
            onChange={(event) => setForm({ ...form, budget: event.target.value })}
          />
        </Field>

        <Field label="Currency" icon={<Wallet />}>
          <select
            value={currencyCode}
            onChange={(event) => setCurrencyCode(event.target.value)}
          >
            {currencyOptions.map(([code, name]) => (
              <option key={code} value={code}>
                {code} · {name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Start date" icon={<Calendar />}>
          <input
            type="date"
            value={form.startDate}
            onChange={(event) => setForm({ ...form, startDate: event.target.value })}
          />
        </Field>

        <Field label="End date" icon={<Calendar />}>
          <input
            type="date"
            value={form.endDate}
            onChange={(event) => setForm({ ...form, endDate: event.target.value })}
          />
        </Field>

        <Field label="Trip coverage" icon={<Route />}>
          <select
            value={form.travelMode}
            onChange={(event) => setForm({ ...form, travelMode: event.target.value })}
          >
            <option value="nearby">Nearby cities only</option>
            <option value="whole-country">Explore the whole country</option>
          </select>
        </Field>

        <Field label="Distance range" icon={<Compass />}>
          <div className="range-wrap">
            <input
              type="range"
              min="20"
              max="300"
              value={form.radius}
              onChange={(event) => setForm({ ...form, radius: event.target.value })}
            />
            <b>{form.radius} km</b>
          </div>
        </Field>
      </div>

      <button className="primary search-button" type="submit" disabled={isSearching}>
        {isSearching ? "Searching live places..." : "Search available options"}
      </button>
    </form>
  );
}
