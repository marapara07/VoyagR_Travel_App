import { useEffect, useMemo, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  Archive,
  ArrowLeft,
  ArrowUpDown,
  CalendarCheck2,
  Edit3,
  ExternalLink,
  Heart,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { db } from "../firebase";
import { Empty, SectionTitle } from "./UI";

function readLocalArray(key, userId) {
  try {
    return JSON.parse(localStorage.getItem(`${key}:${userId}`)) || [];
  } catch {
    return [];
  }
}

function writeLocalArray(key, userId, value) {
  try {
    localStorage.setItem(`${key}:${userId}`, JSON.stringify(value));
  } catch {
    // Local storage is optional.
  }
}

function makeItemId(prefix = "item") {
  return `${prefix}-${globalThis.crypto?.randomUUID?.() || Date.now().toString(36)}`;
}

function bookingSearchUrl(item) {
  const query = encodeURIComponent(
    `${item?.name || item?.selectedStay?.name || "hotel"} ${item?.address || item?.selectedStay?.address || ""}`
  );
  return `https://www.booking.com/searchresults.html?ss=${query}`;
}

function normalizeLocalItems(items, source) {
  return items.map((item, index) => ({
    ...item,
    id: item.id || item.bookingCode || item.createdAtLocal || `${source}-${index}`,
    source,
  }));
}

export default function AccountPage({
  user,
  favorites,
  booking,
  currentTrip,
  money,
  setCurrentPage,
}) {
  const [activeTab, setActiveTab] = useState("favorites");
  const [cloudFavorites, setCloudFavorites] = useState([]);
  const [savedTrips, setSavedTrips] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [editingTripId, setEditingTripId] = useState(null);
  const [editingBookingId, setEditingBookingId] = useState(null);
  const [manualEvent, setManualEvent] = useState({ name: "", time: "10:00", price: 0 });

  useEffect(() => {
  if (!user) return;

  setLoading(true);
  setNotice("");

  const localTrips = normalizeLocalItems(
    readLocalArray("voyagrTrips", user.uid),
    "local"
  );

  const localBookings = normalizeLocalItems(
    readLocalArray("voyagrBookings", user.uid),
    "local"
  );

  const tripsQuery = query(
    collection(db, "savedTrips"),
    where("userId", "==", user.uid)
  );

  const bookingsQuery = query(
    collection(db, "bookings"),
    where("userId", "==", user.uid)
  );

  const unsubscribeTrips = onSnapshot(
    tripsQuery,
    (snapshot) => {
      setSavedTrips([
        ...snapshot.docs.map((item) => ({
          id: item.id,
          source: "cloud",
          ...item.data(),
        })),
        ...localTrips,
      ]);

      setLoading(false);
    },
    (error) => {
      console.error(error);
      setSavedTrips(localTrips);
      setNotice("Cloud trips could not be loaded. Showing local saved trips.");
      setLoading(false);
    }
  );

  const unsubscribeBookings = onSnapshot(
    bookingsQuery,
    (snapshot) => {
      setBookings([
        ...snapshot.docs.map((item) => ({
          id: item.id,
          source: "cloud",
          ...item.data(),
        })),
        ...localBookings,
      ]);

      setLoading(false);
    },
    (error) => {
      console.error(error);
      setBookings(localBookings);
      setNotice("Cloud bookings could not be loaded. Showing local bookings.");
      setLoading(false);
    }
  );

  return () => {
    unsubscribeTrips();
    unsubscribeBookings();
  };
}, [user]);

 
  const allFavorites = useMemo(() => {
    const merged = [...favorites, ...cloudFavorites];
    const unique = new Map();

    merged.forEach((item) => {
      if (!item?.id && !item?.name) return;
      unique.set(item.id || item.name, item);
    });

    return Array.from(unique.values());
  }, [favorites, cloudFavorites]);

  async function updateTrip(tripId, updates) {
    const trip = savedTrips.find((item) => item.id === tripId);
    if (!trip) return;

    const nextTrips = savedTrips.map((item) => (item.id === tripId ? { ...item, ...updates } : item));
    setSavedTrips(nextTrips);

    if (trip.source === "cloud") {
      try {
        await updateDoc(doc(db, "savedTrips", tripId), updates);
        setNotice("Saved trip updated.");
      } catch (error) {
        console.error(error);
        setNotice("The trip was edited on screen, but cloud sync failed. Check Firestore rules.");
      }
      return;
    }

    writeLocalArray(
      "voyagrTrips",
      user.uid,
      nextTrips.filter((item) => item.source === "local").map(({ source, ...rest }) => rest)
    );
    setNotice("Saved trip updated locally.");
  }

  async function deleteTrip(tripId) {
    const trip = savedTrips.find((item) => item.id === tripId);
    const nextTrips = savedTrips.filter((item) => item.id !== tripId);
    setSavedTrips(nextTrips);

    if (trip?.source === "cloud") {
      try {
        await deleteDoc(doc(db, "savedTrips", tripId));
        setNotice("Saved trip deleted.");
      } catch (error) {
        console.error(error);
        setNotice("Removed from screen, but cloud delete failed. Check Firestore rules.");
      }
      return;
    }

    writeLocalArray(
      "voyagrTrips",
      user.uid,
      nextTrips.filter((item) => item.source === "local").map(({ source, ...rest }) => rest)
    );
    setNotice("Saved trip deleted locally.");
  }

  async function updateBooking(bookingId, updates) {
    const existing = bookings.find((item) => item.id === bookingId);
    if (!existing) return;

    const nextBookings = bookings.map((item) => (item.id === bookingId ? { ...item, ...updates } : item));
    setBookings(nextBookings);

    if (existing.source === "cloud") {
      try {
        await updateDoc(doc(db, "bookings", bookingId), updates);
        setNotice("Booking draft updated.");
      } catch (error) {
        console.error(error);
        setNotice("Booking edited on screen, but cloud sync failed. Check Firestore rules.");
      }
      return;
    }

    writeLocalArray(
      "voyagrBookings",
      user.uid,
      nextBookings.filter((item) => item.source === "local").map(({ source, ...rest }) => rest)
    );
    setNotice("Booking draft updated locally.");
  }

  async function deleteBooking(bookingId) {
    const existing = bookings.find((item) => item.id === bookingId);
    const nextBookings = bookings.filter((item) => item.id !== bookingId);
    setBookings(nextBookings);

    if (existing?.source === "cloud") {
      try {
        await deleteDoc(doc(db, "bookings", bookingId));
        setNotice("Booking draft deleted.");
      } catch (error) {
        console.error(error);
        setNotice("Removed from screen, but cloud delete failed. Check Firestore rules.");
      }
      return;
    }

    writeLocalArray(
      "voyagrBookings",
      user.uid,
      nextBookings.filter((item) => item.source === "local").map(({ source, ...rest }) => rest)
    );
    setNotice("Booking draft deleted locally.");
  }

  function moveTripEvent(trip, index, direction) {
    const items = [...(trip.itineraryItems || [])];
    const target = index + direction;
    if (target < 0 || target >= items.length) return;

    [items[index], items[target]] = [items[target], items[index]];
    updateTrip(trip.id, { itineraryItems: items });
  }

  function removeTripEvent(trip, eventId) {
    updateTrip(trip.id, {
      itineraryItems: (trip.itineraryItems || []).filter((item) => item.id !== eventId),
    });
  }

  function addTripEvent(trip) {
    if (!manualEvent.name.trim()) return;

    const item = {
      id: makeItemId("manual-event"),
      name: manualEvent.name.trim(),
      duration: manualEvent.time,
      price: Number(manualEvent.price || 0),
      category: "custom",
      address: "Added manually",
    };

    updateTrip(trip.id, { itineraryItems: [...(trip.itineraryItems || []), item] });
    setManualEvent({ name: "", time: "10:00", price: 0 });
  }

  function addCurrentSelectionToTrip(trip) {
    const currentItems = currentTrip.itineraryItems || [];
    if (!currentItems.length) {
      setNotice("Add places to the current itinerary first, then attach them to a saved trip.");
      return;
    }

    const existingIds = new Set((trip.itineraryItems || []).map((item) => item.id));
    const merged = [
      ...(trip.itineraryItems || []),
      ...currentItems.filter((item) => !existingIds.has(item.id)),
    ];

    updateTrip(trip.id, { itineraryItems: merged });
  }

  if (!user) {
    return (
      <main className="account-page-shell">
        <section className="panel account-hero">
          <Empty text="Log in first to open your Voyagr account." />
        </section>
      </main>
    );
  }

  return (
    <main className="account-page-shell">
      <section className="account-hero panel">
        <div>
          <button className="back-to-planner" type="button" onClick={() => setCurrentPage("planner")}>
            <ArrowLeft size={18} /> Back to planner
          </button>
          <span className="sidebar-kicker"></span>
          <h1>Your travel cockpit</h1>
          <p>
            Open favorites, edit saved trips, reorder itinerary events, and manage booking drafts from one polished command center.
          </p>
        </div>

        <div className="account-profile-card">
          {user.photoURL ? <img src={user.photoURL} alt="" /> : <Heart size={36} />}
          <h3>{user.name}</h3>
          <p>{user.email}</p>
        </div>
      </section>

      <section className="account-tabs panel">
        {[
          ["favorites", "Favorites", Heart],
          ["bookings", "My bookings", CalendarCheck2],
          ["savedTrips", "My saved trips", Archive],
        ].map(([value, label, Icon]) => (
          <button
            key={value}
            type="button"
            className={activeTab === value ? "active" : ""}
            onClick={() => setActiveTab(value)}
          >
            <Icon size={18} /> {label}
          </button>
        ))}
      </section>

      {notice && <div className="account-notice">{notice}</div>}
      {loading && <div className="account-notice">Loading your saved travel data...</div>}

      {activeTab === "favorites" && (
        <section className="panel account-section">
          <SectionTitle icon={<Heart />} title="Favorites" subtitle="Everything you marked while exploring. Open links, revisit places, or book a stay." />
          <div className="account-card-grid">
            {allFavorites.length ? (
              allFavorites.map((item) => (
                <article className="account-card" key={item.id || item.name}>
                  <span className="account-card-tag">{item.category || item.type || item.favoriteType || "saved"}</span>
                  <h3>{item.name}</h3>
                  <p>{item.address || "Saved item"}</p>
                  {item.price ? <b>{money(item.price)}</b> : null}
                  <div className="account-card-actions">
                    {item.website ? (
                      <a href={item.website} target="_blank" rel="noreferrer"><ExternalLink size={16} /> Open page</a>
                    ) : (
                      <a href={bookingSearchUrl(item)} target="_blank" rel="noreferrer"><ExternalLink size={16} /> Search booking</a>
                    )}
                  </div>
                </article>
              ))
            ) : (
              <Empty text="No favorites yet. Go back to the planner and press Favorite on hotels or places." />
            )}
          </div>
        </section>
      )}

      {activeTab === "bookings" && (
        <section className="panel account-section">
          <SectionTitle icon={<CalendarCheck2 />} title="My bookings" subtitle="Booking drafts are editable before you finalize anything externally." />
          <div className="account-card-grid">
            {booking && (
              <article className="account-card featured-library-card">
                <span className="account-card-tag">current draft</span>
                <h3>Current booking draft</h3>
                <p>Code: {booking.code}</p>
              </article>
            )}

            {bookings.length ? bookings.map((item) => (
              <article className="account-card" key={item.id || item.bookingCode}>
                <span className="account-card-tag">{item.status || "draft"}</span>
                <h3>{item.selectedStay?.name || "Booking draft"}</h3>
                <p>Code: {item.bookingCode || item.code || "No code"}</p>
                <b>{money(item.totals?.total || item.total || 0)}</b>

                {editingBookingId === item.id ? (
                  <div className="booking-editor">
                    <label>
                      Status
                      <select
                        value={item.status || "draft"}
                        onChange={(event) => updateBooking(item.id, { status: event.target.value })}
                      >
                        <option value="draft">Draft</option>
                        <option value="in-review">In review</option>
                        <option value="ready-to-book">Ready to book</option>
                        <option value="archived">Archived</option>
                      </select>
                    </label>
                    <button type="button" onClick={() => setEditingBookingId(null)}><Save size={16} /> Done</button>
                  </div>
                ) : null}

                <div className="account-card-actions">
                  <button type="button" onClick={() => setEditingBookingId(editingBookingId === item.id ? null : item.id)}><Edit3 size={16} /> Edit</button>
                  <a href={bookingSearchUrl(item.selectedStay || item)} target="_blank" rel="noreferrer"><ExternalLink size={16} /> Continue</a>
                  <button type="button" className="danger-action" onClick={() => deleteBooking(item.id)}><Trash2 size={16} /> Delete</button>
                </div>
              </article>
            )) : !booking ? (
              <Empty text="No booking drafts yet. Select a hotel and press Reserve selected plan." />
            ) : null}
          </div>
        </section>
      )}

      {activeTab === "savedTrips" && (
        <section className="panel account-section">
          <SectionTitle icon={<Archive />} title="My saved trips" subtitle="Edit your itinerary list, change order, add custom events, or remove stops." />
          <div className="saved-trip-stack">
            {savedTrips.length ? savedTrips.map((trip) => (
              <article className="saved-trip-editor" key={trip.id || trip.createdAtLocal}>
                <div className="saved-trip-topline">
                  <div>
                    <span className="account-card-tag">{trip.source === "cloud" ? "cloud" : "local"}</span>
                    <h3>{trip.search?.destination || "Saved trip"}</h3>
                    <p>{trip.search?.startDate || "No start date"} → {trip.search?.endDate || "No end date"}</p>
                  </div>
                  <b>{money(trip.totals?.total || 0)}</b>
                </div>

                <div className="account-card-actions">
                  <button type="button" onClick={() => setEditingTripId(editingTripId === trip.id ? null : trip.id)}>
                    {editingTripId === trip.id ? <X size={16} /> : <Edit3 size={16} />} {editingTripId === trip.id ? "Close editor" : "Edit trip"}
                  </button>
                  <button type="button" onClick={() => addCurrentSelectionToTrip(trip)}><Plus size={16} /> Add current itinerary</button>
                  <button type="button" className="danger-action" onClick={() => deleteTrip(trip.id)}><Trash2 size={16} /> Delete trip</button>
                </div>

                {editingTripId === trip.id && (
                  <div className="trip-event-editor">
                    <div className="manual-event-row">
                      <input
                        value={manualEvent.name}
                        onChange={(event) => setManualEvent({ ...manualEvent, name: event.target.value })}
                        placeholder="Add custom event, e.g. Sunset walk"
                      />
                      <input
                        type="time"
                        value={manualEvent.time}
                        onChange={(event) => setManualEvent({ ...manualEvent, time: event.target.value })}
                      />
                      <input
                        type="number"
                        value={manualEvent.price}
                        onChange={(event) => setManualEvent({ ...manualEvent, price: event.target.value })}
                        placeholder="Price"
                      />
                      <button type="button" onClick={() => addTripEvent(trip)}><Plus size={16} /> Add</button>
                    </div>

                    {(trip.itineraryItems || []).length ? (
                      <div className="event-list">
                        {(trip.itineraryItems || []).map((item, index) => (
                          <div className="event-row" key={item.id || `${item.name}-${index}`}>
                            <span className="event-index">{index + 1}</span>
                            <div>
                              <h4>{item.name}</h4>
                              <p>{item.category || item.type || "event"} · {item.duration || "flexible"}</p>
                            </div>
                            <div className="event-row-actions">
                              <button type="button" onClick={() => moveTripEvent(trip, index, -1)} disabled={index === 0}><ArrowUpDown size={15} /> Up</button>
                              <button type="button" onClick={() => moveTripEvent(trip, index, 1)} disabled={index === (trip.itineraryItems || []).length - 1}><ArrowUpDown size={15} /> Down</button>
                              <button type="button" className="danger-action" onClick={() => removeTripEvent(trip, item.id)}><Trash2 size={15} /> Remove</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Empty text="No itinerary events saved inside this trip yet. Add current itinerary or add a custom event." />
                    )}
                  </div>
                )}
              </article>
            )) : (
              <Empty text="No saved trips yet. Build a plan, then press Save trip." />
            )}
          </div>
        </section>
      )}
    </main>
  );
}
