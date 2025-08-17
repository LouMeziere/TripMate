const express = require('express');
const router = express.Router();

// Dummy trip data for development
const dummyTrips = [
  {
    id: '1',
    title: 'Romantic Paris Getaway',
    destination: 'Paris, France',
    startDate: '2025-09-15',
    endDate: '2025-09-20',
    travelers: 2,
    budget: 'medium',
    pace: 'relaxed',
    categories: ['food', 'culture', 'romance'],
    status: 'planned',
    createdAt: '2025-08-10T10:00:00Z',
    updatedAt: '2025-08-10T10:00:00Z',
    itinerary: [
      {
        day: 1,
        activities: [
          {
            name: 'Eiffel Tower',
            category: 'landmark',
            duration: '2 hours',
            address: 'Champ de Mars, Paris',
            rating: 4.5
          },
          {
            name: 'Seine River Cruise',
            category: 'activity',
            duration: '1.5 hours',
            address: 'Port de la Bourdonnais, Paris',
            rating: 4.3
          }
        ]
      },
      {
        day: 2,
        activities: [
          {
            name: 'Louvre Museum',
            category: 'culture',
            duration: '3 hours',
            address: 'Rue de Rivoli, Paris',
            rating: 4.6
          },
          {
            name: 'Le Comptoir du Relais',
            category: 'food',
            duration: '2 hours',
            address: '9 Carrefour de l\'Odéon, Paris',
            rating: 4.4
          }
        ]
      }
    ]
  },
  {
    id: '2',
    title: 'Tokyo Adventure',
    destination: 'Tokyo, Japan',
    startDate: '2025-10-01',
    endDate: '2025-10-07',
    travelers: 1,
    budget: 'high',
    pace: 'active',
    categories: ['food', 'culture', 'technology'],
    status: 'active',
    createdAt: '2025-08-05T14:30:00Z',
    updatedAt: '2025-08-05T14:30:00Z',
    itinerary: [
      {
        day: 1,
        activities: [
          {
            name: 'Senso-ji Temple',
            category: 'culture',
            duration: '2 hours',
            address: 'Asakusa, Tokyo',
            rating: 4.4
          },
          {
            name: 'Tsukiji Outer Market',
            category: 'food',
            duration: '3 hours',
            address: 'Tsukiji, Tokyo',
            rating: 4.5
          }
        ]
      }
    ]
  },
  {
    id: '3',
    title: 'London History Tour',
    destination: 'London, UK',
    startDate: '2025-07-20',
    endDate: '2025-07-25',
    travelers: 4,
    budget: 'low',
    pace: 'moderate',
    categories: ['history', 'culture', 'museums'],
    status: 'completed',
    createdAt: '2025-06-15T09:15:00Z',
    updatedAt: '2025-07-26T16:20:00Z',
    itinerary: [
      {
        day: 1,
        activities: [
          {
            name: 'Tower of London',
            category: 'history',
            duration: '3 hours',
            address: 'Tower Hill, London',
            rating: 4.3
          },
          {
            name: 'British Museum',
            category: 'culture',
            duration: '4 hours',
            address: 'Great Russell St, London',
            rating: 4.7
          }
        ]
      }
    ]
  }
];

// GET /api/trips - Get all user trips
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: dummyTrips,
    message: 'Trips retrieved successfully'
  });
});

// GET /api/trips/:id - Get specific trip
router.get('/:id', (req, res) => {
  const trip = dummyTrips.find(t => t.id === req.params.id);
  
  if (!trip) {
    return res.status(404).json({
      success: false,
      message: 'Trip not found'
    });
  }
  
  res.json({
    success: true,
    data: trip,
    message: 'Trip retrieved successfully'
  });
});

// POST /api/trips - Create new trip
router.post('/', (req, res) => {
  const newTrip = {
    id: String(dummyTrips.length + 1),
    ...req.body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'planned'
  };
  
  dummyTrips.push(newTrip);
  
  res.status(201).json({
    success: true,
    data: newTrip,
    message: 'Trip created successfully'
  });
});

// PUT /api/trips/:id - Update trip
router.put('/:id', (req, res) => {
  const tripIndex = dummyTrips.findIndex(t => t.id === req.params.id);
  
  if (tripIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Trip not found'
    });
  }
  
  dummyTrips[tripIndex] = {
    ...dummyTrips[tripIndex],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  
  res.json({
    success: true,
    data: dummyTrips[tripIndex],
    message: 'Trip updated successfully'
  });
});

// DELETE /api/trips/:id - Delete trip
router.delete('/:id', (req, res) => {
  const tripIndex = dummyTrips.findIndex(t => t.id === req.params.id);
  
  if (tripIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Trip not found'
    });
  }
  
  dummyTrips.splice(tripIndex, 1);
  
  res.json({
    success: true,
    message: 'Trip deleted successfully'
  });
});

module.exports = router;
