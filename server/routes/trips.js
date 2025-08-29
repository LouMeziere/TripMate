const express = require('express');
const router = express.Router();
const { Trip, Category } = require('../models');

// Dummy trip data for development - KEEPING AS BACKUP
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
router.get('/', async (req, res) => {
  try {
    const trips = await Trip.findAll({
      include: [{ model: Category, as: 'categories' }],
      order: [['created_at', 'DESC']]
    });
    
    // Transform categories for frontend compatibility
    const transformedTrips = trips.map(trip => {
      const tripData = trip.toJSON();
      tripData.categories = tripData.categories.map(cat => cat.value);
      return tripData;
    });
    
    res.json({
      success: true,
      data: transformedTrips,
      message: 'Trips retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching trips:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve trips',
      error: error.message
    });
  }
});

// GET /api/trips/categories - Get all active categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { isActive: true },
      order: [['sortOrder', 'ASC']]
    });
    
    res.json({
      success: true,
      data: categories,
      message: 'Categories retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve categories',
      error: error.message
    });
  }
});

// GET /api/trips/:id - Get specific trip
router.get('/:id', async (req, res) => {
  try {
    const trip = await Trip.findByPk(req.params.id, {
      include: [{ model: Category, as: 'categories' }]
    });
    
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }
    
    // Transform categories for frontend compatibility
    const tripData = trip.toJSON();
    tripData.categories = tripData.categories.map(cat => cat.value);
    
    res.json({
      success: true,
      data: tripData,
      message: 'Trip retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching trip:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve trip',
      error: error.message
    });
  }
});

// POST /api/trips - Create new trip
router.post('/', async (req, res) => {
  try {
    const { categories, ...tripData } = req.body;
    
    // Create trip
    const trip = await Trip.create({
      ...tripData,
      status: tripData.status || 'draft'
    });
    
    // Associate categories if provided
    if (categories && categories.length > 0) {
      const categoryInstances = await Category.findAll({
        where: { value: categories }
      });
      await trip.addCategories(categoryInstances);
    }
    
    // Return trip with categories
    const tripWithCategories = await Trip.findByPk(trip.id, {
      include: [{ model: Category, as: 'categories' }]
    });
    
    // Transform categories for frontend compatibility
    const responseData = tripWithCategories.toJSON();
    responseData.categories = responseData.categories.map(cat => cat.value);
    
    res.status(201).json({
      success: true,
      data: responseData,
      message: 'Trip created successfully'
    });
  } catch (error) {
    console.error('Error creating trip:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create trip',
      error: error.message
    });
  }
});

// PUT /api/trips/:id - Update trip
router.put('/:id', async (req, res) => {
  try {
    const { categories, ...tripData } = req.body;
    
    const trip = await Trip.findByPk(req.params.id);
    
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }
    
    // Update trip data
    await trip.update(tripData);
    
    // Update category associations if provided
    if (categories !== undefined) {
      if (categories.length > 0) {
        const categoryInstances = await Category.findAll({
          where: { value: categories }
        });
        await trip.setCategories(categoryInstances);
      } else {
        await trip.setCategories([]);
      }
    }
    
    // Return updated trip with categories
    const updatedTrip = await Trip.findByPk(trip.id, {
      include: [{ model: Category, as: 'categories' }]
    });
    
    // Transform categories for frontend compatibility
    const responseData = updatedTrip.toJSON();
    responseData.categories = responseData.categories.map(cat => cat.value);
    
    res.json({
      success: true,
      data: responseData,
      message: 'Trip updated successfully'
    });
  } catch (error) {
    console.error('Error updating trip:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update trip',
      error: error.message
    });
  }
});

// DELETE /api/trips/:id - Delete trip
router.delete('/:id', async (req, res) => {
  try {
    const trip = await Trip.findByPk(req.params.id);
    
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }
    
    await trip.destroy();
    
    res.json({
      success: true,
      message: 'Trip deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting trip:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete trip',
      error: error.message
    });
  }
});

module.exports = router;
