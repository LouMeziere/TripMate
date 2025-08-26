const express = require('express');
const router = express.Router();
const { processChatMessage } = require('../../integrations/geminiAPI');

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
        suggestions: ['Tell me more', 'Add to trip', 'Show alternatives']
      };
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
