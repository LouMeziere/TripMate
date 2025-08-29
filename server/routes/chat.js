const express = require('express');
const router = express.Router();
const { processChatMessage } = require('../../integrations/geminiAPI');
const { searchPlaces } = require('../../integrations/foursquareAPI');

// Execute search using Foursquare API based on search intent
async function executeSearch(searchIntent) {
  try {
    console.log('🔍 Executing search:', searchIntent);
    
    // Prepare Foursquare API parameters
    const searchParams = {
      query: searchIntent.query,
      near: searchIntent.location,
      limit: searchIntent.limit || 5
    };
    
    // Call Foursquare API
    const places = await searchPlaces(searchParams);
    
    console.log(`✅ Found ${places.length} places for query: ${searchIntent.query}`);
    
    // Format results for frontend consumption
    const formattedResults = places.map(place => ({
      id: place.fsq_id,
      name: place.name,
      address: place.location?.formatted_address || 'Address not available',
      category: place.categories?.[0]?.name || 'General',
      distance: place.distance ? `${Math.round(place.distance)}m` : null,
      rating: place.rating || null,
      price: place.price || null,
      website: place.website || null,
      hours: place.hours || null
    }));
    
    return {
      success: true,
      results: formattedResults,
      searchQuery: searchIntent.query,
      searchLocation: searchIntent.location,
      resultCount: formattedResults.length
    };
    
  } catch (error) {
    console.error('❌ Search execution failed:', error.message);
    return {
      success: false,
      error: error.message,
      results: [],
      searchQuery: searchIntent.query,
      searchLocation: searchIntent.location,
      resultCount: 0
    };
  }
}

// In-memory chat history storage (in production, use a database)
let chatHistory = {};

// POST /api/chat - Send chat message and get AI response
router.post('/', async (req, res) => {
  try {
    const { message, tripId, tripContext, useRealAI = true } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }
    
    // Initialize chat history for trip if doesn't exist
    if (tripId && !chatHistory[tripId]) {
      chatHistory[tripId] = [];
    }
    
    // Store user message
    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };
    
    if (tripId) {
      chatHistory[tripId].push(userMessage);
    }
    
    // Get chat history for context
    const currentHistory = tripId ? chatHistory[tripId] : [];
    
    // Generate AI response using Gemini
    let aiResponseData;
    
    if (useRealAI) {
      aiResponseData = await processChatMessage(message, tripContext, currentHistory);
    } else {
      // Fallback dummy response for testing
      aiResponseData = {
        success: true,
        response: "I'm here to help with your trip planning! What would you like to know?",
        suggestions: ['Tell me more', 'Add to trip', 'Show alternatives'],
        searchIntent: null,
        searchError: null
      };
    }
    
    // Execute search if AI detected search intent
    let searchResults = null;
    if (aiResponseData.searchIntent) {
      console.log('🔍 Search intent detected, executing search...');
      searchResults = await executeSearch(aiResponseData.searchIntent);
    }
    
    // Store AI response
    const aiMessage = {
      id: (Date.now() + 1).toString(),
      type: 'ai',
      content: aiResponseData.response,
      timestamp: new Date().toISOString(),
      suggestions: aiResponseData.suggestions || [],
      searchResults: searchResults
    };
    
    if (tripId) {
      chatHistory[tripId].push(aiMessage);
    }
    
    res.json({
      success: true,
      data: {
        userMessage,
        aiMessage,
        suggestions: aiMessage.suggestions,
        searchResults: searchResults
      },
      message: 'Chat message processed successfully'
    });
    
  } catch (error) {
    console.error('Error processing chat message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process chat message',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// GET /api/chat/:tripId - Get chat history for trip
router.get('/:tripId', (req, res) => {
  const { tripId } = req.params;
  
  const history = chatHistory[tripId] || [];
  
  res.json({
    success: true,
    data: history,
    message: 'Chat history retrieved successfully'
  });
});

// DELETE /api/chat/:tripId - Clear chat history for trip
router.delete('/:tripId', (req, res) => {
  const { tripId } = req.params;
  
  if (chatHistory[tripId]) {
    delete chatHistory[tripId];
  }
  
  res.json({
    success: true,
    message: 'Chat history cleared successfully'
  });
});

// GET /api/chat/health-check - Server health check
router.get('/health-check', (req, res) => {
  res.json({
    success: true,
    message: 'Chat API is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
