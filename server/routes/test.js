const express = require('express');
const router = express.Router();

const { generateTrip } = require('../utils/test_generate_trip.js');

// GET /api/test - Test trip generation endpoint
router.get('/', async (req, res) => {
  try {
    const trip = await generateTrip(
      "I want to spend 2 days in Bordeaux exploring culture. I am travelling with my partner and we are looking for romantic places. We generally prefer a relaxed pace and a medium budget trip."
    );
    res.json({
      success: true,
      message: "Trip generated successfully",
      data: trip
    });
  } catch (error) {
    console.error('Error generating trip:', error);
    res.status(500).json({
      success: false,
      message: "Failed to generate trip",
      error: error.message
    });
  }
});

// GET /api/test - Test trip generation endpoint
router.get('/test3/5', async (req, res) => {
  try {
    const trip = await generateTrip(
      "I want to spend 2 days in Bordeaux exploring culture. I am travelling with my partner and we are looking for romantic places. We generally prefer a relaxed pace and a medium budget trip."
    );
    res.json({
      success: true,
      message: "You stink",
      data: trip
    });
  } catch (error) {
    console.error('Error generating trip:', error);
    res.status(500).json({
      success: false,
      message: "Failed to generate trip",
      error: error.message
    });
  }
});


// GET /api/test - Test trip generation endpoint
router.get('/:id', async (req, res) => {
  try {
    const trip = await generateTrip(
      "I want to spend 2 days in Bordeaux exploring culture. I am travelling with my partner and we are looking for romantic places. We generally prefer a relaxed pace and a medium budget trip."
    );
    res.json({
      success: true,
      message: `You smell good! ${req.params.id}`,
      data: trip
    });
  } catch (error) {
    console.error('Error generating trip:', error);
    res.status(500).json({
      success: false,
      message: "Failed to generate trip",
      error: error.message
    });
  }
});


module.exports = router;