const express = require('express');
const router = express.Router();

const generateTrip = require('../utils/test_generate_trip.js');

// GET /api/trips - Get all user trips
router.get('/', async (req, res) => {
    const trip = await generateTrip(
        "I want to spend 2 days in Bordeaux exploring food and culture. I am travelling with my partner and we are looking for romantic places. We generally prefer a relaxed pace and a medium budget trip."
    );
  res.json({
    success: true,
    data: trip
  });
});

module.exports = router;