import { ExternalLink, Heart, Hotel, MapPin } from "lucide-react";
import { Empty, SectionTitle } from "./UI";
import TravelMap from "./TravelMap";

const fallbackHotelImages = [
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1522798514-97ceb8c4f1c8?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=900&q=80",
];

function getStayImage(stay, index) {
  if (stay.image?.startsWith("http")) return stay.image;

  if (stay.image?.startsWith("File:")) {
    const fileName = stay.image.replace("File:", "").trim();
    return `https://commons.wikimedia.org/wiki/Special:Redirect/file/${encodeURIComponent(fileName)}`;
  }

  return fallbackHotelImages[index % fallbackHotelImages.length];
}

export default function ResultsSection({
  stays,
  isSearching,
  selectedStay,
  setSelectedStay,
  setSelectedActivities,
  setItineraryItems,
  setMapCenter,
  mapCenter,
  nearbyPlaces,
  money,
  favorites,
  toggleFavorite,
  search,
}) {
  return (
    <section className="results-booking-layout">
      <div id="stays" className="available-stays">
        <SectionTitle
          icon={<Hotel />}
          title="Available stays"
          subtitle="Real OpenStreetMap stays. Select one to build a nearby plan."
        />

        <div className="stay-list">
          {isSearching ? (
            <Empty text="Loading real places from OpenStreetMap..." />
          ) : stays.length ? (
            stays.map((stay, index) => (
              <article
                key={stay.id}
                className={`stay-card ${selectedStay?.id === stay.id ? "active" : ""}`}
                onClick={() => {
                  setSelectedStay(stay);
                  setSelectedActivities([]);
                  setItineraryItems([]);
                  setMapCenter([stay.lat, stay.lng]);
                }}
              >
                <div className="stay-image-wrap">
                  <img
                    className="stay-photo"
                    src={getStayImage(stay, index)}
                    alt={stay.name}
                    onError={(event) => {
                      event.currentTarget.src = fallbackHotelImages[index % fallbackHotelImages.length];
                    }}
                  />
                  <span className="stay-image-badge">⭐ {stay.rating}</span>
                </div>

                <div className="stay-content">
                  <div>
                    <h3>{stay.name}</h3>
                    <p><MapPin size={14} /> {stay.address}</p>
                  </div>

                  <div className="stay-meta">
                    <span>{stay.type || "stay"}</span>
                    <b>{money(stay.price)}/night</b>
                  </div>

                  <div className="stay-actions">
                    <button
                      type="button"
                      className={`favorite-stay-btn ${favorites.some((x) => x.id === stay.id) ? "active" : ""}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleFavorite(stay);
                      }}
                    >
                      <Heart size={15} /> {favorites.some((x) => x.id === stay.id) ? "Saved" : "Favorite"}
                    </button>

                    <a
                      className="book-stay-btn"
                      href={`https://www.booking.com/searchresults.html?ss=${encodeURIComponent(`${stay.name} ${search.destination}`)}`}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(event) => event.stopPropagation()}
                    >
                      Book now <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <Empty text="No stays found. Try a bigger radius or another destination." />
          )}
        </div>
      </div>

      <div id="map">
        <TravelMap
          mapCenter={mapCenter}
          stays={stays}
          nearbyPlaces={nearbyPlaces}
          money={money}
          setSelectedStay={setSelectedStay}
          setSelectedActivities={setSelectedActivities}
          setItineraryItems={setItineraryItems}
          setMapCenter={setMapCenter}
        />
      </div>
    </section>
  );
}
