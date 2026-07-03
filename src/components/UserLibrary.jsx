import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { Empty, SectionTitle } from "./UI";
import { Archive, CalendarCheck2, Heart } from "lucide-react";

function readLocalArray(key, userId) {
  try {
    return JSON.parse(localStorage.getItem(`${key}:${userId}`)) || [];
  } catch {
    return [];
  }
}

export default function UserLibrary({ activePanel, user, favorites, booking, money }) {
  const [savedTrips, setSavedTrips] = useState([]);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    async function loadUserData() {
      if (!user || !activePanel) return;

      const localTrips = readLocalArray("voyagrTrips", user.uid);
      const localBookings = readLocalArray("voyagrBookings", user.uid);

      try {
        const tripsQuery = query(collection(db, "trips"), where("userId", "==", user.uid));
        const bookingsQuery = query(collection(db, "bookings"), where("userId", "==", user.uid));

        const tripsSnapshot = await getDocs(tripsQuery);
        const bookingsSnapshot = await getDocs(bookingsQuery);

        setSavedTrips([
          ...tripsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
          ...localTrips,
        ]);

        setBookings([
          ...bookingsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
          ...localBookings,
        ]);
      } catch {
        setSavedTrips(localTrips);
        setBookings(localBookings);
      }
    }

    loadUserData();
  }, [activePanel, user]);

  if (!activePanel) return null;

  if (!user) {
    return (
      <section id="user-library" className="panel user-library">
        <Empty text="Log in first to see your saved travel board." />
      </section>
    );
  }

  return (
    <section id="user-library" className="panel user-library">
      {activePanel === "favorites" && (
        <>
          <SectionTitle icon={<Heart />} title="Favorites" subtitle="Hotels and places you saved while building your trip." />
          <div className="library-grid">
            {favorites.length ? (
              favorites.map((item) => (
                <div className="library-card" key={item.id}>
                  <h3>{item.name}</h3>
                  <p>{item.address || item.category || "Saved item"}</p>
                  {item.price && <b>{money(item.price)}</b>}
                </div>
              ))
            ) : (
              <Empty text="No favorites saved yet." />
            )}
          </div>
        </>
      )}

      {activePanel === "bookings" && (
        <>
          <SectionTitle icon={<CalendarCheck2 />} title="My bookings" subtitle="Booking drafts created from selected travel plans." />
          <div className="library-grid">
            {booking && (
              <div className="library-card featured-library-card">
                <h3>Current booking draft</h3>
                <p>Code: {booking.code}</p>
              </div>
            )}

            {bookings.length ? (
              bookings.map((item) => (
                <div className="library-card" key={item.id || item.bookingCode}>
                  <h3>{item.selectedStay?.name || "Booking draft"}</h3>
                  <p>Code: {item.bookingCode || item.code || "No code"}</p>
                  <b>{money(item.total || 0)}</b>
                </div>
              ))
            ) : !booking ? (
              <Empty text="No booking drafts yet." />
            ) : null}
          </div>
        </>
      )}

      {activePanel === "savedTrips" && (
        <>
          <SectionTitle icon={<Archive />} title="My saved trips" subtitle="Trips saved to your Voyagr account." />
          <div className="library-grid">
            {savedTrips.length ? (
              savedTrips.map((trip) => (
                <div className="library-card" key={trip.id || trip.createdAtLocal}>
                  <h3>{trip.search?.destination || "Saved trip"}</h3>
                  <p>{trip.search?.startDate || "No start date"} → {trip.search?.endDate || "No end date"}</p>
                  <b>{money(trip.totals?.total || 0)}</b>
                </div>
              ))
            ) : (
              <Empty text="No saved trips yet. Press Save trip after building a plan." />
            )}
          </div>
        </>
      )}
    </section>
  );
}
