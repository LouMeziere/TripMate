const express = require('express');
const router = express.Router();
const { processChatMessage } = require('../../integrations/geminiAPI');
const { searchPlaces } = require('../../integrations/foursquareAPI');
const { transformToSimpleFormat } = require('../utils/tripJSONFormatter');

// In-memory chat history storage (in production, use a database)
let chatHistory = {};

// In-memory replacement state storage per trip
let replacementStates = {};

/**
 * Execute activity replacement by calling Foursquare and updating trip data
 */
async function executeActivityReplacement(replacementState, tripContext) {
  try {
    console.log('🚀 Executing replacement:', replacementState);
    
    // Step 1: Search for the new activity using Foursquare
    let searchQuery = replacementState.replacement_activity;
    
    // Convert general categories to specific Foursquare queries
    const categoryMappings = {
      'outdoorsy': 'parks,outdoor recreation,hiking',
      'cultural': 'museums,galleries,cultural sites', 
      'romantic': 'romantic restaurants,scenic viewpoints,wine bars',
      'food': 'restaurants,cafes,food experiences',
      'active': 'fitness,sports,outdoor activities',
      'relaxing': 'spas,gardens,peaceful places'
    };
    
    if (categoryMappings[searchQuery.toLowerCase()]) {
      searchQuery = categoryMappings[searchQuery.toLowerCase()];
    }
    
    console.log(`🔍 Searching for: "${searchQuery}" (original: "${replacementState.replacement_activity}")`);
    
    const searchResults = await searchPlaces({
      query: searchQuery,
      near: tripContext.destination,
      limit: 1
    });
    
    if (!searchResults || searchResults.length === 0) {
      throw new Error(`Could not find "${replacementState.replacement_activity}" in ${tripContext.destination}`);
    }
    
    const newVenue = searchResults[0];
    console.log('🎯 Found venue:', newVenue.name);
    
    // Step 2: Find the original trip in dummyTrips array and modify it directly
    const tripsModule = require('./trips');
    const originalTrip = tripsModule.dummyTrips.find(trip => trip.id === tripContext.id);
    
    if (!originalTrip) {
      throw new Error(`Could not find trip with ID ${tripContext.id}`);
    }
    
    // Step 3: Find and replace the activity directly in the original trip data
    let activityFound = false;
    
    if (originalTrip.itinerary) {
      for (let day of originalTrip.itinerary) {
        for (let i = 0; i < day.activities.length; i++) {
          const activity = day.activities[i];
          if (activity.name === replacementState.current_activity) {
            
            // Create new activity object with preserved timing
            const newActivity = {
              name: newVenue.name,
              category: newVenue.categories?.[0]?.name.toLowerCase() || 'activity',
              address: newVenue.location?.formatted_address || 'Address not available',
              rating: newVenue.rating || 4.0,
              description: `${newVenue.categories?.[0]?.name || 'Popular'} venue in ${tripContext.destination}`,
              price: newVenue.price?.tier || 2,
              // Preserve original timing and duration
              scheduledTime: activity.scheduledTime,
              duration: activity.duration
            };
            
            // DIRECTLY REPLACE the activity in the original trip data
            day.activities[i] = newActivity;
            activityFound = true;
            
            console.log(`✅ Replaced "${replacementState.current_activity}" with "${newActivity.name}" on day ${day.day} in ORIGINAL trip data`);
            break;
          }
        }
        if (activityFound) break;
      }
    }
    
    if (!activityFound) {
      throw new Error(`Could not find activity "${replacementState.current_activity}" in itinerary`);
    }
    
    // Update the timestamp
    originalTrip.updatedAt = new Date().toISOString();
    
    // Return the modified original trip (not a copy)
    return originalTrip;
    
  } catch (error) {
    console.error('❌ Replacement failed:', error.message);
    throw error;
  }
}

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
    
    console.log(`🎯 Chat request for trip ${tripId} with message: "${message}"`);
    console.log(`📊 Trip context provided: ${!!tripContext}`);
    
    // If tripId is provided but no tripContext, fetch the trip data
    let actualTripContext = tripContext;
    if (tripId && !tripContext) {
      console.log(`🔍 Fetching trip context for tripId: ${tripId}`);
      const tripsModule = require('./trips');
      const trip = tripsModule.dummyTrips.find(t => t.id === tripId);
      if (trip) {
        actualTripContext = trip;
        console.log(`✅ Found trip: ${trip.title} with ${trip.itinerary?.length || 0} days`);
      } else {
        console.log(`❌ Trip ${tripId} not found`);
      }
    }
    
    // Initialize chat history for trip if doesn't exist
    if (tripId && !chatHistory[tripId]) {
      chatHistory[tripId] = [];
    }

    // Initialize replacement state for trip if doesn't exist
    if (tripId && !replacementStates[tripId]) {
      replacementStates[tripId] = {
        current_activity: null,
        replacement_activity: null,
        action: null,
        confirmation: false
      };
    }

    // Get current replacement state
    const currentReplacementState = tripId ? replacementStates[tripId] : null;
    console.log(`🔄 Current replacement state:`, currentReplacementState);
    
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
      console.log(`🤖 Calling processChatMessage with:`, {
        message,
        tripContext: !!actualTripContext,
        historyLength: currentHistory.length,
        replacementState: currentReplacementState
      });
      
      aiResponseData = await processChatMessage(message, actualTripContext, currentHistory, currentReplacementState);
      
      console.log(`🤖 processChatMessage returned:`, {
        hasResponse: !!aiResponseData.response,
        hasReplacementState: !!aiResponseData.replacementState,
        stateValues: aiResponseData.replacementState
      });
    } else {
      // Fallback dummy response for testing
      aiResponseData = {
        success: true,
        response: "I'm here to help with your trip planning! What would you like to know?",
        suggestions: ['Tell me more', 'Add to trip', 'Show alternatives'],
        replacementState: currentReplacementState
      };
    }

    // Update replacement state if it was modified
    if (tripId && aiResponseData.replacementState) {
      replacementStates[tripId] = aiResponseData.replacementState;
    }

    // Check if replacement is ready to trigger
    let updatedTripContext = actualTripContext;
    let replacementExecuted = false;
    let executionError = null;
    
    console.log('🔍 Checking replacement trigger conditions:');
    console.log('  - replacementState exists:', !!aiResponseData.replacementState);
    console.log('  - current_activity:', aiResponseData.replacementState?.current_activity);
    console.log('  - replacement_activity:', aiResponseData.replacementState?.replacement_activity);
    console.log('  - confirmation:', aiResponseData.replacementState?.confirmation);
    
    if (aiResponseData.replacementState && 
        aiResponseData.replacementState.current_activity && 
        aiResponseData.replacementState.replacement_activity && 
        aiResponseData.replacementState.confirmation) {
      
      console.log('🚀 Replacement trigger detected!');
      
      try {
        console.log('🚀 About to execute replacement with state:', aiResponseData.replacementState);
        console.log('🚀 Trip context:', { id: actualTripContext?.id, destination: actualTripContext?.destination });
        
        updatedTripContext = await executeActivityReplacement(aiResponseData.replacementState, actualTripContext);
        replacementExecuted = true;
        
        // Reset replacement state after successful replacement
        if (tripId) {
          replacementStates[tripId] = {
            current_activity: null,
            replacement_activity: null,
            action: null,
            confirmation: false
          };
        }
        
        console.log('✅ Replacement completed and persisted to original trip data');
        
      } catch (error) {
        console.error('❌ Replacement execution failed:', error.message);
        console.error('❌ Error stack:', error.stack);
        executionError = error.message;
      }
    }
    
    // Store AI response
    const aiMessage = {
      id: (Date.now() + 1).toString(),
      type: 'ai',
      content: aiResponseData.response,
      timestamp: new Date().toISOString(),
      suggestions: aiResponseData.suggestions || []
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
        ...(replacementExecuted && { updatedTrip: updatedTripContext }),
        replacementState: aiResponseData.replacementState,
        debugInfo: {
          triggerConditions: {
            hasReplacementState: !!aiResponseData.replacementState,
            currentActivity: aiResponseData.replacementState?.current_activity,
            replacementActivity: aiResponseData.replacementState?.replacement_activity,
            confirmation: aiResponseData.replacementState?.confirmation,
            allConditionsMet: !!(
              aiResponseData.replacementState && 
              aiResponseData.replacementState.current_activity && 
              aiResponseData.replacementState.replacement_activity && 
              aiResponseData.replacementState.confirmation
            )
          },
          execution: {
            attempted: !!(
              aiResponseData.replacementState && 
              aiResponseData.replacementState.current_activity && 
              aiResponseData.replacementState.replacement_activity && 
              aiResponseData.replacementState.confirmation
            ),
            successful: replacementExecuted,
            error: executionError
          }
        }
      },
      message: replacementExecuted ? 
        'Chat message processed and activity replacement completed' : 
        'Chat message processed successfully'
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

module.exports = router;
