import { ExternalLink, Ticket } from "lucide-react";
import { Empty, SectionTitle } from "./UI";

function getBookingLabel(place) {
  if (place.website) return "Check availability";
  if (["restaurants", "bars"].includes(place.category)) return "Contact page not available";
  if (["attractions", "activities"].includes(place.category)) return "Booking not required or not listed";
  return "Booking/contact page not available";
}

export default function PlacesSection({
  selectedStay,
  filteredNearbyPlaces,
  placeFilter,
  setPlaceFilter,
  money,
  favorites,
  itineraryItems,
  toggleFavorite,
  toggleItineraryItem,
}) {
  return (
    <section className="places-full">
      <div className="panel card-stack compact-activities">
        <SectionTitle
          icon={<Ticket />}
          title="Places nearby"
          subtitle={
            selectedStay
              ? `${filteredNearbyPlaces.length} places near ${selectedStay.name}.`
              : "Select a stay first to see nearby restaurants, bars and attractions."
          }
        />

        <div className="place-filters" aria-label="Place categories">
          {[
            ["all", "All"],
            ["restaurants", "Restaurants"],
            ["bars", "Bars"],
            ["attractions", "Attractions"],
            ["activities", "Activities"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={placeFilter === value ? "active" : ""}
              onClick={() => setPlaceFilter(value)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="activity-scroll-box">
          {!selectedStay ? (
            <Empty text="Choose a hotel first. Then places close to that stay will appear here." />
          ) : filteredNearbyPlaces.length ? (
            filteredNearbyPlaces.map((place) => (
              <article key={place.id} className="place-card">
                <div className="place-card-top">
                  <div>
                    <h3>{place.name}</h3>
                    <p>
                      {place.type} • {place.duration} • {place.distanceFromStay.toFixed(1)} km from stay
                    </p>
                  </div>
                  <b>{money(place.price)}</b>
                </div>

                <div className="place-details">
                  <span>🕒 {place.openingHours}</span>
                  <span>🎧 {place.guidedTours}</span>
                  <span>🌐 {place.onlineBooking}</span>
                  {place.phone && <span>☎️ {place.phone}</span>}
                </div>

                <div className="place-actions">
                  <button type="button" onClick={() => toggleFavorite(place)}>
                    {favorites.some((x) => x.id === place.id) ? "Saved" : "Add to favorites"}
                  </button>

                  <button type="button" onClick={() => toggleItineraryItem(place)}>
                    {itineraryItems.some((x) => x.id === place.id) ? "In itinerary" : "Add to itinerary"}
                  </button>

                  {place.website ? (
                    <a className="availability-link" href={place.website} target="_blank" rel="noreferrer">
                      {getBookingLabel(place)} <ExternalLink size={14} />
                    </a>
                  ) : (
                    <span className="no-booking-info">{getBookingLabel(place)}</span>
                  )}
                </div>
              </article>
            ))
          ) : (
            <Empty text="No places found near this stay. Try another hotel or a bigger radius." />
          )}
        </div>
      </div>
    </section>
  );
}
