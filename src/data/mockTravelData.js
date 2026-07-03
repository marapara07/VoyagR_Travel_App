export const destinations = {
  Italy: {
    center: { lat: 41.9028, lng: 12.4964, zoom: 6 },
    cities: [
      { name: 'Rome', lat: 41.9028, lng: 12.4964, distance: 0, stay: true },
      { name: 'Florence', lat: 43.7696, lng: 11.2558, distance: 270, stay: true },
      { name: 'Naples', lat: 40.8518, lng: 14.2681, distance: 225, stay: true },
      { name: 'Bologna', lat: 44.4949, lng: 11.3426, distance: 375, stay: true },
      { name: 'Venice', lat: 45.4408, lng: 12.3155, distance: 525, stay: true },
      { name: 'Milan', lat: 45.4642, lng: 9.19, distance: 575, stay: true },
      { name: 'Tivoli', lat: 41.9633, lng: 12.7989, distance: 35, stay: false },
      { name: 'Orvieto', lat: 42.7185, lng: 12.1107, distance: 120, stay: false },
      { name: 'Siena', lat: 43.3188, lng: 11.3308, distance: 235, stay: false },
      { name: 'Pompeii', lat: 40.7462, lng: 14.4989, distance: 240, stay: false }
    ],
    hotels: [
      { id: 1, name: 'Aurora Colosseum Suites', city: 'Rome', price: 118, rating: 4.8, rooms: 5, distanceKm: 1, tags: ['Breakfast', 'Rooftop', 'Metro nearby'], lat: 41.8902, lng: 12.4922 },
      { id: 2, name: 'Tuscan Studio Rooms', city: 'Florence', price: 93, rating: 4.6, rooms: 8, distanceKm: 270, tags: ['Budget smart', 'Walkable', 'Design'], lat: 43.7731, lng: 11.2560 },
      { id: 3, name: 'Canal Glow Hotel', city: 'Venice', price: 146, rating: 4.7, rooms: 3, distanceKm: 525, tags: ['Canal view', 'Romantic', 'Boutique'], lat: 45.437, lng: 12.335 }
    ],
    activities: [
      { id: 101, title: 'Colosseum night tour', city: 'Rome', price: 49, duration: '2h', slots: 12, type: 'History', distanceKm: 1, lat: 41.8902, lng: 12.4922 },
      { id: 102, title: 'Florence pasta workshop', city: 'Florence', price: 68, duration: '3h', slots: 6, type: 'Food', distanceKm: 270, lat: 43.7696, lng: 11.2558 },
      { id: 103, title: 'Venice hidden canals walk', city: 'Venice', price: 35, duration: '2.5h', slots: 10, type: 'Culture', distanceKm: 525, lat: 45.4408, lng: 12.3155 },
      { id: 104, title: 'Pompeii day trip', city: 'Pompeii', price: 79, duration: '7h', slots: 9, type: 'Day trip', distanceKm: 240, lat: 40.7462, lng: 14.4989 }
    ]
  },
  Spain: {
    center: { lat: 40.4168, lng: -3.7038, zoom: 6 },
    cities: [
      { name: 'Madrid', lat: 40.4168, lng: -3.7038, distance: 0, stay: true },
      { name: 'Toledo', lat: 39.8628, lng: -4.0273, distance: 75, stay: false },
      { name: 'Segovia', lat: 40.9429, lng: -4.1088, distance: 90, stay: false },
      { name: 'Barcelona', lat: 41.3874, lng: 2.1686, distance: 505, stay: true },
      { name: 'Valencia', lat: 39.4699, lng: -0.3763, distance: 355, stay: true },
      { name: 'Seville', lat: 37.3891, lng: -5.9845, distance: 530, stay: true },
      { name: 'Granada', lat: 37.1773, lng: -3.5986, distance: 420, stay: true }
    ],
    hotels: [
      { id: 4, name: 'Sol Market Rooms', city: 'Madrid', price: 89, rating: 4.5, rooms: 9, distanceKm: 1, tags: ['Budget', 'Metro', 'Nightlife'], lat: 40.4168, lng: -3.7038 },
      { id: 5, name: 'Gaudi Garden Hotel', city: 'Barcelona', price: 121, rating: 4.8, rooms: 7, distanceKm: 505, tags: ['Pool', 'City view', 'Modern'], lat: 41.4036, lng: 2.1744 },
      { id: 6, name: 'Seville Orange House', city: 'Seville', price: 76, rating: 4.7, rooms: 4, distanceKm: 530, tags: ['Patio', 'Authentic', 'Quiet'], lat: 37.3891, lng: -5.9845 }
    ],
    activities: [
      { id: 201, title: 'Prado and old Madrid walk', city: 'Madrid', price: 38, duration: '2h', slots: 11, type: 'Art', distanceKm: 1, lat: 40.4138, lng: -3.6921 },
      { id: 202, title: 'Tapas crawl', city: 'Madrid', price: 55, duration: '3h', slots: 8, type: 'Food', distanceKm: 2, lat: 40.415, lng: -3.707 },
      { id: 203, title: 'Sagrada Familia guided visit', city: 'Barcelona', price: 42, duration: '2h', slots: 11, type: 'Architecture', distanceKm: 505, lat: 41.4036, lng: 2.1744 },
      { id: 204, title: 'Alhambra tour', city: 'Granada', price: 64, duration: '3h', slots: 5, type: 'History', distanceKm: 420, lat: 37.1761, lng: -3.5881 }
    ]
  },
  Greece: {
    center: { lat: 37.9838, lng: 23.7275, zoom: 6 },
    cities: [
      { name: 'Athens', lat: 37.9838, lng: 23.7275, distance: 0, stay: true },
      { name: 'Aegina', lat: 37.7467, lng: 23.4275, distance: 35, stay: false },
      { name: 'Delphi', lat: 38.4800, lng: 22.4941, distance: 180, stay: false },
      { name: 'Meteora', lat: 39.7217, lng: 21.6306, distance: 355, stay: false },
      { name: 'Chania', lat: 35.5138, lng: 24.0180, distance: 320, stay: true },
      { name: 'Naxos', lat: 37.1036, lng: 25.3767, distance: 210, stay: true }
    ],
    hotels: [
      { id: 7, name: 'Acropolis Garden Stay', city: 'Athens', price: 98, rating: 4.6, rooms: 6, distanceKm: 1, tags: ['Terrace', 'Metro', 'Breakfast'], lat: 37.9715, lng: 23.7257 },
      { id: 8, name: 'Cretan Blue Rooms', city: 'Chania', price: 84, rating: 4.8, rooms: 5, distanceKm: 320, tags: ['Sea vibe', 'Boutique', 'Walkable'], lat: 35.5138, lng: 24.0180 }
    ],
    activities: [
      { id: 301, title: 'Athens mythology walk', city: 'Athens', price: 31, duration: '2h', slots: 15, type: 'Culture', distanceKm: 1, lat: 37.9715, lng: 23.7257 },
      { id: 302, title: 'Aegina island day trip', city: 'Aegina', price: 48, duration: '7h', slots: 12, type: 'Island', distanceKm: 35, lat: 37.7467, lng: 23.4275 },
      { id: 303, title: 'Crete beach hopping', city: 'Chania', price: 72, duration: '8h', slots: 8, type: 'Nature', distanceKm: 320, lat: 35.5138, lng: 24.0180 }
    ]
  }
};
