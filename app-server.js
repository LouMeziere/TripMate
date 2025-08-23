// Load environment variables from a .env file (for your API keys)
require('dotenv').config();

const express = require('express');
const path = require('path');

// Import existing functions from the original code
const { processUserInput } = require('./integrations/geminiAPI');
const { searchPlaces } = require('./integrations/foursquareAPI');

// Import the kmeans clustering library
const { kmeans } = require('ml-kmeans'); 

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('frontend'));

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Copy all the existing functions from the monolithic app.js
// (I'll copy the working functions from the original file to maintain functionality)

// Main trip generation endpoint
app.post('/generate-trip', async (req, res) => {
  try {
    console.log('=== TRIP GENERATION REQUEST ===');
    console.log('Request body:', req.body);
    
    const { 
      destination, 
      days: numberOfDays, 
      userInput, 
      latitude, 
      longitude 
    } = req.body;

    // Validate required parameters
    if (!destination || !numberOfDays || !userInput) {
      return res.status(400).json({ 
        error: 'Missing required parameters: destination, days, or userInput' 
      });
    }

    console.log(`Generating ${numberOfDays}-day trip for ${destination}`);
    console.log(`User preferences: ${userInput}`);

    // Use the existing generateTrip function
    const tripData = await generateTrip(userInput);

    if (!tripData) {
      return res.status(500).json({ 
        error: 'Failed to generate trip data' 
      });
    }

    console.log('Trip generation successful');

    // Send the response
    res.json({
      success: true,
      destination: destination,
      numberOfDays: numberOfDays,
      tripData: tripData
    });

  } catch (error) {
    console.error('Error generating trip:', error);
    res.status(500).json({ 
      error: 'Failed to generate trip',
      details: error.message 
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString()
  });
});

// Start the server
const server = app.listen(PORT, () => {
  console.log(`🚀 TripMate server running on http://localhost:${PORT}`);
  console.log(`📁 Frontend served from: ${path.join(__dirname, 'frontend')}`);
  console.log(`📂 Trip outputs saved to: ${path.join(__dirname, 'output_trips')}`);
  console.log(`🛠️ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('✅ Server started successfully!');
});

// Handle server errors
server.on('error', (error) => {
  console.error('❌ Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please stop any existing servers or use a different port.`);
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Export the app
module.exports = app;
