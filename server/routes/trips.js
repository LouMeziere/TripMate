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
    isDraft: false,
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
            address: 'Champ de Mars, 5 Avenue Anatole France, 75007 Paris',
            rating: 4.5,
            description: 'Iconic iron lattice tower and symbol of Paris',
            tel: '+33 8 92 70 12 39',
            price: 3,
            scheduledTime: '09:00'
          },
          {
            name: 'Seine River Cruise',
            category: 'activity',
            duration: '1.5 hours',
            address: 'Port de la Bourdonnais, 75007 Paris',
            rating: 4.3,
            description: 'Scenic boat cruise along the Seine River with commentary',
            tel: '+33 1 42 25 96 10',
            price: 2,
            scheduledTime: '14:30'
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
            address: 'Rue de Rivoli, 75001 Paris',
            rating: 4.6,
            description: 'World\'s largest art museum featuring the Mona Lisa and Venus de Milo',
            tel: '+33 1 40 20 50 50',
            email: 'info@louvre.fr',
            price: 2,
            scheduledTime: '10:00'
          },
          {
            name: 'Le Comptoir du Relais',
            category: 'food',
            duration: '2 hours',
            address: '9 Carrefour de l\'Odéon, 75006 Paris',
            rating: 4.4,
            description: 'Traditional French bistro with seasonal menu and wine selection',
            tel: '+33 1 44 27 07 97',
            price: 3,
            scheduledTime: '19:30'
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
    isDraft: false,
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
            rating: 4.4,
            description: 'Ancient Buddhist temple with traditional architecture',
            price: 1,
            scheduledTime: '09:00'
          },
          {
            name: 'Tsukiji Outer Market',
            category: 'food',
            duration: '3 hours',
            address: 'Tsukiji, Tokyo',
            rating: 4.5,
            description: 'Famous fish market with fresh sushi and street food',
            tel: '+81 3-3542-1111',
            price: 2,
            scheduledTime: '11:30'
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
    isDraft: false,
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
  let filteredTrips = dummyTrips;
  
  // Add isDraft filter parameter
  if (req.query.isDraft !== undefined) {
    const isDraft = req.query.isDraft === 'true';
    filteredTrips = dummyTrips.filter(trip => trip.isDraft === isDraft);
  }
  
  res.json({
    success: true,
    data: filteredTrips,
    message: 'Trips retrieved successfully'
  });
});

// GET /api/trips/drafts - Get user's draft trips (MUST come before /:id)
router.get('/drafts', (req, res) => {
  const draftTrips = dummyTrips.filter(trip => trip.isDraft === true);
  res.json({
    success: true,
    data: draftTrips,
    message: 'Draft trips retrieved successfully'
  });
});

// GET /api/trips/active - Get user's active trips (MUST come before /:id)
router.get('/active', (req, res) => {
  const activeTrips = dummyTrips.filter(trip => trip.isDraft === false);
  res.json({
    success: true,
    data: activeTrips,
    message: 'Active trips retrieved successfully'
  });
});

// GET /api/trips/tripId/:id - Get specific trip
router.get('/tripId/:id', (req, res) => {
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
    isDraft: req.body.isDraft || false, // Add optional isDraft parameter
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

// PUT /api/trips/tripId/:id - Update trip
router.put('/tripId/:id', (req, res) => {
  const tripIndex = dummyTrips.findIndex(t => t.id === req.params.id);
  
  if (tripIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Trip not found'
    });
  }
  
  // Maintain draft status during updates (don't allow changing isDraft via PUT)
  const { isDraft, ...updateData } = req.body;
  
  dummyTrips[tripIndex] = {
    ...dummyTrips[tripIndex],
    ...updateData,
    updatedAt: new Date().toISOString()
  };
  
  res.json({
    success: true,
    data: dummyTrips[tripIndex],
    message: 'Trip updated successfully'
  });
});

// DELETE /api/trips/tripId/:id - Delete trip
router.delete('/tripId/:id', (req, res) => {
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

// POST /api/trips/tripId/:id/replace-activity - Replace activity in trip
router.post('/tripId/:id/replace-activity', (req, res) => {
  const tripIndex = dummyTrips.findIndex(t => t.id === req.params.id);
  
  if (tripIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Trip not found'
    });
  }
  
  const { dayNumber, activityIndex, newActivity } = req.body;
  
  if (!dayNumber || activityIndex === undefined || !newActivity) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: dayNumber, activityIndex, and newActivity'
    });
  }
  
  const trip = dummyTrips[tripIndex];
  const dayPlan = trip.itinerary.find(day => day.day === dayNumber);
  
  if (!dayPlan) {
    return res.status(404).json({
      success: false,
      message: `Day ${dayNumber} not found in trip itinerary`
    });
  }
  
  if (activityIndex < 0 || activityIndex >= dayPlan.activities.length) {
    return res.status(400).json({
      success: false,
      message: `Invalid activity index ${activityIndex} for day ${dayNumber}`
    });
  }
  
  // Create the new activity with default fields
  const activityToReplace = {
    name: newActivity.name,
    category: newActivity.category,
    duration: '2 hours', // Default duration
    address: newActivity.address,
    rating: newActivity.rating || 4.0,
    description: newActivity.description || `Visit ${newActivity.name}`,
    tel: '', // Could be enhanced with phone number from API
    price: 2, // Default price level
    scheduledTime: dayPlan.activities[activityIndex].scheduledTime || '10:00' // Keep original time or default
  };
  
  // Replace the activity
  dayPlan.activities[activityIndex] = activityToReplace;
  
  // Update trip timestamp
  trip.updatedAt = new Date().toISOString();
  
  res.json({
    success: true,
    data: trip,
    message: `Activity replaced successfully on day ${dayNumber}`
  });
});

// NEW DRAFT TRIP ENDPOINTS

// POST /api/trips/draft - Create new draft trip
router.post('/draft', (req, res) => {
  try {
    const draftTrip = createDraftTrip(req.body);
    res.status(201).json({
      success: true,
      data: draftTrip,
      message: 'Draft trip created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create draft trip',
      error: error.message
    });
  }
});

// PUT /api/trips/tripId/:id/promote - Promote draft to active
router.put('/tripId/:id/promote', (req, res) => {
  try {
    const promotedTrip = promoteDraftTrip(req.params.id);
    res.json({
      success: true,
      data: promotedTrip,
      message: 'Trip promoted to active successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// PUT /api/trips/tripId/:id/demote - Demote active trip to draft
router.put('/tripId/:id/demote', (req, res) => {
  try {
    const demotedTrip = demoteTripToDraft(req.params.id);
    res.json({
      success: true,
      data: demotedTrip,
      message: 'Trip demoted to draft successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Draft Trip Service Functions

// Create draft trip (add to dummyTrips array)
function createDraftTrip(tripData) {
  const newTrip = {
    id: String(dummyTrips.length + 1),
    ...tripData,
    isDraft: true,
    status: 'planned', // Default status for new drafts
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  dummyTrips.push(newTrip);
  return newTrip;
}

// Promote draft to active trip (update in dummyTrips array)
function promoteDraftTrip(tripId) {
  const tripIndex = dummyTrips.findIndex(t => t.id === tripId);
  if (tripIndex === -1) throw new Error('Trip not found');
  if (!dummyTrips[tripIndex].isDraft) throw new Error('Trip is not a draft');
  
  dummyTrips[tripIndex] = {
    ...dummyTrips[tripIndex],
    isDraft: false,
    promotedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  return dummyTrips[tripIndex];
}

// Demote active trip to draft (update in dummyTrips array)
function demoteTripToDraft(tripId) {
  const tripIndex = dummyTrips.findIndex(t => t.id === tripId);
  if (tripIndex === -1) throw new Error('Trip not found');
  if (dummyTrips[tripIndex].isDraft) throw new Error('Trip is already a draft');
  
  dummyTrips[tripIndex] = {
    ...dummyTrips[tripIndex],
    isDraft: true,
    demotedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  return dummyTrips[tripIndex];
}

module.exports = router;
