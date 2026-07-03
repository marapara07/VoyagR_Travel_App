import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./styles.css";

import {
  auth,
  db,
  googleProvider,
  facebookProvider,
  appleProvider,
} from "./firebase";

import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";

import { addDoc, collection, doc, serverTimestamp, setDoc } from "firebase/firestore";

import Navbar from "./components/Navbar";
import TripSidebar from "./components/TripSidebar";
import SearchPanel from "./components/SearchPanel";
import ResultsSection from "./components/ResultsSection";
import PlacesSection from "./components/PlacesSection";
import ItinerarySection from "./components/ItinerarySection";
import SaveReserveSection from "./components/SaveReserveSection";
import AccountPage from "./components/AccountPage";

import {
  distanceKm,
  estimateDays,
  fallbackItinerary,
  fetchOverpassData,
  geocodeDestination,
  normalizePlaces,
} from "./utils/travelUtils";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});



function App() {
  const [user, setUser] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState("planner");

  const [form, setForm] = useState({
    destination: "Italy",
    budget: 1000,
    startDate: "",
    endDate: "",
    travelMode: "nearby",
    radius: 120,
  });

  const [search, setSearch] = useState({ ...form });
  const [mapCenter, setMapCenter] = useState([41.9028, 12.4964]);
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currencyCode, setCurrencyCode] = useState("EUR");

  const [stays, setStays] = useState([]);
  const [places, setPlaces] = useState([]);
  const [selectedStay, setSelectedStay] = useState(null);
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [placeFilter, setPlaceFilter] = useState("all");
  const [favorites, setFavorites] = useState([]);
  const [itineraryItems, setItineraryItems] = useState([]);
  const [itinerary, setItinerary] = useState("");
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(null);
  const [saveStatus, setSaveStatus] = useState("");

  function money(value) {
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currencyCode,
        maximumFractionDigits: 0,
      }).format(Number(value || 0));
    } catch {
      return `${currencyCode} ${Number(value || 0).toLocaleString("en-US")}`;
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        return;
      }

      const appUser = {
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || "Traveler",
        email: firebaseUser.email,
        photoURL: firebaseUser.photoURL,
      };

      setUser(appUser);

      await setDoc(
        doc(db, "users", firebaseUser.uid),
        {
          ...appUser,
          lastLoginAt: serverTimestamp(),
        },
        { merge: true }
      );
    });

    return () => unsubscribe();
  }, []);

  async function loginWithGoogle() {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error(error);
      alert("Google login failed. Try again.");
    }
  }

  async function loginWithFacebook() {
    try {
      await signInWithPopup(auth, facebookProvider);
    } catch (error) {
      console.error(error);
      alert("Facebook login failed. Try again.");
    }
  }

  async function loginWithApple() {
    try {
      await signInWithPopup(auth, appleProvider);
    } catch (error) {
      console.error(error);
      alert("Apple login failed. Try again.");
    }
  }

  async function loginWithEmail(email, password) {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error(error);
      alert("Email login failed. Check your email and password.");
    }
  }

  async function registerWithEmail(email, password) {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error(error);
      alert("Could not create account.");
    }
  }

  async function resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent.");
    } catch (error) {
      console.error(error);
      alert("Could not send reset email.");
    }
  }

  async function logout() {
    await signOut(auth);
    setUser(null);
  }

  const days = estimateDays(search.startDate, search.endDate);
  const activityTotal = itineraryItems.reduce((sum, item) => sum + item.price, 0);
  const stayTotal = selectedStay ? selectedStay.price * days : 0;
  const total = stayTotal + activityTotal;
  const remaining = Number(search.budget) - total;

  const nearbyPlaces = selectedStay
    ? places
        .map((place) => ({
          ...place,
          distanceFromStay: distanceKm(
            selectedStay.lat,
            selectedStay.lng,
            place.lat,
            place.lng
          ),
        }))
        .filter((place) => place.distanceFromStay <= 15)
        .sort((a, b) => a.distanceFromStay - b.distanceFromStay)
    : [];

  const filteredNearbyPlaces =
    placeFilter === "all"
      ? nearbyPlaces
      : nearbyPlaces.filter((place) => place.category === placeFilter);

  async function searchDestinations(value) {
  setForm({ ...form, destination: value });

  if (value.length < 2) {
    setDestinationSuggestions([]);
    return;
  }

  try {
    const response = await fetch(
      `https://voyagr-travel-app.onrender.com/api/geocode?q=${encodeURIComponent(value)}`
    );

    const data = await response.json();

    setDestinationSuggestions(
      data.map((item) => ({
        label: item.display_name,
        value: item.display_name,
        lat: Number(item.lat),
        lng: Number(item.lon),
      }))
    );

    setShowSuggestions(true);
  } catch {
    setDestinationSuggestions([]);
  }
}

  async function runSearch(event) {
    event?.preventDefault();

    setHasSearched(true);
    setIsSearching(true);
    setSearch({ ...form });
    setSelectedStay(null);
    setSelectedActivities([]);
    setFavorites([]);
    setItineraryItems([]);
    setItinerary("");
    setBooking(null);
    setShowSuggestions(false);

    try {
      const center = await geocodeDestination(form.destination);
      setMapCenter(center);

      const elements = await fetchOverpassData(center[0], center[1], form.radius);
      const normalized = normalizePlaces(elements);

      setStays(normalized.hotels);
      setPlaces(normalized.nearby);
    } catch {
      setStays([]);
      setPlaces([]);
    } finally {
      setIsSearching(false);
    }
  }

  async function toggleFavorite(item) {
    const alreadySaved = favorites.some((x) => x.id === item.id);

    setFavorites((items) =>
      alreadySaved ? items.filter((x) => x.id !== item.id) : [...items, item]
    );

    if (!user || alreadySaved) return;

    try {
      await addDoc(collection(db, "favorites"), {
        userId: user.uid,
        userName: user.name,
        userEmail: user.email,
        itemId: item.id,
        item,
        type: item.category ? "place" : "stay",
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error(error);
    }
  }

  function toggleItineraryItem(item) {
    setItineraryItems((items) =>
      items.some((x) => x.id === item.id)
        ? items.filter((x) => x.id !== item.id)
        : [...items, item]
    );
  }

  async function generateItinerary() {
    setLoading(true);

    const payload = {
      destination: search.destination,
      budget: search.budget,
      currency: currencyCode,
      startDate: search.startDate,
      endDate: search.endDate,
      days,
      radius: search.radius,
      travelMode: search.travelMode,
      selectedStay,
      favorites,
      itineraryItems,
      selectedActivities: itineraryItems,
      total,
      remaining,
    };

    try {
      const response = await fetch("https://voyagr-travel-app.onrender.com/api/itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await response.json();
      setItinerary(json.itinerary || fallbackItinerary(payload));
    } catch {
      setItinerary(fallbackItinerary(payload));
    } finally {
      setLoading(false);
    }
  }

  async function saveTrip() {
    if (!user) {
      await loginWithGoogle();
      return;
    }

    setSaveStatus("Saving...");

    try {
      await addDoc(collection(db, "savedTrips"), {
        userId: user.uid,
        userName: user.name,
        userEmail: user.email,
        search,
        currency: currencyCode,
        selectedStay,
        favorites,
        itineraryItems,
        itinerary,
        totals: {
          stayTotal,
          activityTotal,
          total,
          remaining,
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setSaveStatus("Trip saved to My saved trips.");
    } catch (error) {
      console.error(error);
      setSaveStatus("Could not save trip.");
    }
  }

  async function reserve() {
    if (!user) {
      await loginWithGoogle();
      return;
    }

    if (!selectedStay) {
      alert("Select a stay first.");
      return;
    }

    const code = `VOY-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    try {
      await addDoc(collection(db, "bookings"), {
        userId: user.uid,
        userName: user.name,
        userEmail: user.email,
        bookingCode: code,
        destination: search.destination,
        currency: currencyCode,
        selectedStay,
        itineraryItems,
        favorites,
        itinerary,
        totals: {
          stayTotal,
          activityTotal,
          total,
          remaining,
        },
        status: "draft",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setBooking({ code });
      alert(`Booking draft created: ${code}`);
    } catch (error) {
      console.error(error);
      alert("Could not create booking draft.");
    }
  }

  async function saveItinerary() {
    if (!user) {
      await loginWithGoogle();
      return;
    }

    if (!itinerary) {
      alert("Generate an itinerary first.");
      return;
    }

    try {
      await addDoc(collection(db, "itineraries"), {
        userId: user.uid,
        userName: user.name,
        userEmail: user.email,
        destination: search.destination,
        selectedStay,
        itineraryItems,
        itinerary,
        currency: currencyCode,
        totals: {
          stayTotal,
          activityTotal,
          total,
          remaining,
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      alert("Itinerary saved.");
    } catch (error) {
      console.error(error);
      alert("Could not save itinerary.");
    }
  }

  return (
    <div className="app-shell">
      <Navbar
        user={user}
        loginWithGoogle={loginWithGoogle}
        loginWithFacebook={loginWithFacebook}
        loginWithApple={loginWithApple}
        loginWithEmail={loginWithEmail}
        registerWithEmail={registerWithEmail}
        resetPassword={resetPassword}
        logout={logout}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />

      {currentPage === "account" ? (
        <AccountPage
          user={user}
          favorites={favorites}
          booking={booking}
          currentTrip={{
            search,
            selectedStay,
            favorites,
            itineraryItems,
            itinerary,
            totals: { stayTotal, activityTotal, total, remaining },
          }}
          money={money}
          setCurrentPage={setCurrentPage}
        />
      ) : (
        <div className={`app-layout ${isSidebarCollapsed ? "sidebar-collapsed" : ""}`}>
          <TripSidebar
            search={search}
            selectedStay={selectedStay}
            favorites={favorites}
            itineraryItems={itineraryItems}
            stayTotal={stayTotal}
            activityTotal={activityTotal}
            total={total}
            remaining={remaining}
            money={money}
            user={user}
            isCollapsed={isSidebarCollapsed}
            onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />

          <main className="layout only-search">
            <SearchPanel
              form={form}
              setForm={setForm}
              currencyCode={currencyCode}
              setCurrencyCode={setCurrencyCode}
              destinationSuggestions={destinationSuggestions}
              showSuggestions={showSuggestions}
              setShowSuggestions={setShowSuggestions}
              setDestinationSuggestions={setDestinationSuggestions}
              setMapCenter={setMapCenter}
              searchDestinations={searchDestinations}
              runSearch={runSearch}
              isSearching={isSearching}
            />

            {hasSearched && (
              <>
                <ResultsSection
                  stays={stays}
                  isSearching={isSearching}
                  selectedStay={selectedStay}
                  setSelectedStay={setSelectedStay}
                  setSelectedActivities={setSelectedActivities}
                  setItineraryItems={setItineraryItems}
                  setMapCenter={setMapCenter}
                  mapCenter={mapCenter}
                  nearbyPlaces={nearbyPlaces}
                  money={money}
                  favorites={favorites}
                  toggleFavorite={toggleFavorite}
                  search={search}
                />

                <PlacesSection
                  selectedStay={selectedStay}
                  filteredNearbyPlaces={filteredNearbyPlaces}
                  placeFilter={placeFilter}
                  setPlaceFilter={setPlaceFilter}
                  money={money}
                  favorites={favorites}
                  itineraryItems={itineraryItems}
                  toggleFavorite={toggleFavorite}
                  toggleItineraryItem={toggleItineraryItem}
                />

                <ItinerarySection
                  generateItinerary={generateItinerary}
                  loading={loading}
                  selectedStay={selectedStay}
                  itineraryItems={itineraryItems}
                  itinerary={itinerary}
                  setItinerary={setItinerary}
                  setItineraryItems={setItineraryItems}
                  saveTrip={saveTrip}
                  saveItinerary={saveItinerary}
                />

                <SaveReserveSection
                  saveTrip={saveTrip}
                  reserve={reserve}
                  saveStatus={saveStatus}
                  selectedStay={selectedStay}
                  booking={booking}
                />
              </>
            )}
          </main>
        </div>
      )}
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);