import React from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";

function RecenterMap({ center }) {
  const map = useMap();

  React.useEffect(() => {
    map.flyTo(center, 13, { duration: 0.8 });
  }, [center, map]);

  return null;
}

function FixMapSize() {
  const map = useMap();

  React.useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => clearTimeout(timer);
  }, [map]);

  return null;
}

export default function TravelMap({
  mapCenter,
  stays,
  nearbyPlaces,
  money,
  setSelectedStay,
  setSelectedActivities,
  setItineraryItems,
  setMapCenter,
}) {
  return (
    <div className="real-map">
      <MapContainer center={mapCenter} zoom={13} scrollWheelZoom>
        <FixMapSize />
        <RecenterMap center={mapCenter} />

        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {stays.map((stay) => (
          <Marker
            key={stay.id}
            position={[stay.lat, stay.lng]}
            eventHandlers={{
              click: () => {
                setSelectedStay(stay);
                setSelectedActivities([]);
                setItineraryItems([]);
                setMapCenter([stay.lat, stay.lng]);
              },
            }}
          >
            <Popup>
              <b>{stay.name}</b>
              <br />
              {money(stay.price)}/night
            </Popup>
          </Marker>
        ))}

        {nearbyPlaces.map((place) => (
          <Marker key={place.id} position={[place.lat, place.lng]}>
            <Popup>
              <b>{place.name}</b>
              <br />
              {place.category}
              <br />
              {place.distanceFromStay.toFixed(1)} km from stay
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
