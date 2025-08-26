const express = require('express');
const router = express.Router();
const { generateTrip } = require('../utils/test_generate_trip');

// Dummy generated trip response for UI development
const dummyGeneratedTrip = {
  preferences: {
    location: 'Rome, Italy',
    duration: 3,
    categories: ['food', 'history', 'culture'],
    budget: 'medium',
    pace: 'moderate'
  },
  itinerary: [
    {
      day: 1,
      activities: [
        {
          name: 'Colosseum',
          category: 'history',
          duration: '2.5 hours',
          address: 'Piazza del Colosseo, 1, Rome',
          rating: 4.6,
          description: 'Ancient amphitheater and iconic symbol of Rome'
        },
        {
          name: 'Trattoria da Enzo',
          category: 'food',
          duration: '1.5 hours',
          address: 'Via dei Vascellari, 29, Rome',
          rating: 4.5,
          description: 'Authentic Roman cuisine in a cozy atmosphere'
        },
        {
          name: 'Roman Forum',
          category: 'history',
          duration: '2 hours',
          address: 'Via della Salaria Vecchia, 5/6, Rome',
          rating: 4.4,
          description: 'Ancient Roman government center with impressive ruins'
        }
      ]
    },
    {
      day: 2,
      activities: [
        {
          name: 'Vatican Museums',
          category: 'culture',
          duration: '4 hours',
          address: 'Viale Vaticano, Vatican City',
          rating: 4.7,
          description: 'World-renowned art collection including the Sistine Chapel'
        },
        {
          name: 'Ginger Sapori e Cucina',
          category: 'food',
          duration: '2 hours',
          address: 'Via Borgognona, 43/44, Rome',
          rating: 4.3,
          description: 'Modern Italian cuisine with creative presentations'
        }
      ]
    },
    {
      day: 3,
      activities: [
        {
          name: 'Pantheon',
          category: 'history',
          duration: '1 hour',
          address: 'Piazza della Rotonda, Rome',
          rating: 4.5,
          description: 'Best preserved ancient Roman building'
        },
        {
          name: 'Trastevere Food Tour',
          category: 'food',
          duration: '3 hours',
          address: 'Trastevere, Rome',
          rating: 4.6,
          description: 'Guided food tour through Rome\'s most charming neighborhood'
        }
      ]
    }
  ]
};

// POST /api/generate-trip - Generate trip from user input
router.post('/', async (req, res) => {
  try {
    const { userInput, useRealGeneration = false } = req.body;
    
    if (!userInput) {
      return res.status(400).json({
        success: false,
        message: 'User input is required'
      });
    }
    
    // For MVP, return dummy data. Later we'll connect real generation
    if (useRealGeneration) {
      // Real trip generation (for later implementation)
      const generatedTrip = await generateTrip(userInput);
      res.json({
        success: true,
        data: generatedTrip,
        message: 'Trip generated successfully using AI'
      });
    } else {
      // Return dummy data for UI development
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      res.json({
        success: true,
        data: dummyGeneratedTrip,
        message: 'Trip generated successfully (dummy data)'
      });
    }
    
  } catch (error) {
    console.error('Error generating trip:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate trip',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;
