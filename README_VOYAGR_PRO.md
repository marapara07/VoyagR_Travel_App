# Voyagr Pro redesign

This version includes:

- redesigned glassmorphism green/yellow UI
- professional hero/search section
- improved sticky navbar with account dropdown
- polished collapsible sidebar
- larger map with smaller inner margins
- hotel cards with images, favorite button and Booking.com redirect
- Places nearby availability/contact buttons
- itinerary rendering with numbered days and bullet points
- localStorage fallback for saved trips/bookings when Firestore rules block writes

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Firestore rules for cloud save

Use these rules while testing:

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /trips/{tripId} {
      allow read, write: if request.auth != null;
    }
    match /bookings/{bookingId} {
      allow read, write: if request.auth != null;
    }
    match /users/{userId} {
      allow read, write: if request.auth != null;
    }
  }
}
```
