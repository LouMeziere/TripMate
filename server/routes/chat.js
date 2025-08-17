const express = require('express');
const router = express.Router();

// Dummy chat responses for UI development
const dummyResponses = [
  "I'd be happy to help you plan your trip! What destination are you considering?",
  "That sounds like an amazing trip! Based on your preferences, I can suggest some great activities.",
  "I found several excellent restaurants that match your taste. Would you like me to add them to your itinerary?",
  "I've updated your trip to include that activity. Your itinerary now has 8 activities across 3 days.",
  "The weather looks perfect for your travel dates! I can recommend some outdoor activities if you're interested.",
  "I can help you adjust your budget. Would you like me to suggest some free or low-cost alternatives?",
  "That's a great question! Let me find some family-friendly options that would work well for your group."
];

// Dummy chat history storage
let chatHistory = {};

// POST /api/chat - Send chat message and get AI response
router.post('/', async (req, res) => {
  try {
    const { message, tripId, useRealAI = false } = req.body;
    
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
    
    // Generate AI response
    let aiResponse;
    
    if (useRealAI) {
      // Real AI integration (for later implementation)
      // const aiResponse = await processUserInput(message);
      aiResponse = "Real AI integration coming soon!";
    } else {
      // Return dummy response for UI development
      // Simulate thinking delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Pick a random response or contextual one
      const isGreeting = message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi');
      const isAboutFood = message.toLowerCase().includes('food') || message.toLowerCase().includes('restaurant');
      const isAboutActivities = message.toLowerCase().includes('activity') || message.toLowerCase().includes('do');
      
      if (isGreeting) {
        aiResponse = dummyResponses[0];
      } else if (isAboutFood) {
        aiResponse = dummyResponses[2];
      } else if (isAboutActivities) {
        aiResponse = dummyResponses[1];
      } else {
        aiResponse = dummyResponses[Math.floor(Math.random() * dummyResponses.length)];
      }
    }
    
    // Store AI response
    const aiMessage = {
      id: (Date.now() + 1).toString(),
      type: 'ai',
      content: aiResponse,
      timestamp: new Date().toISOString(),
      suggestions: ['Tell me more', 'Add to trip', 'Show alternatives']
    };
    
    if (tripId) {
      chatHistory[tripId].push(aiMessage);
    }
    
    res.json({
      success: true,
      data: {
        userMessage,
        aiMessage,
        suggestions: aiMessage.suggestions
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

module.exports = router;
