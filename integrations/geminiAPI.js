
const axios = require('axios'); // Import the axios HTTP client library to make API requests
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') }); // Load environment variables from a .env file 

// Load your API key from environment variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;


/**
∏ * Function: processUserInput
 * ================================
 * This function takes the raw user input (free text)
 * and sends it to the Gemini API to convert it to a structured JSON object.
 * Example: "I want 2 days in Paris, relaxed pace" --> { categories, location, duration, pace, budget }
 */
async function processUserInput(userInput) {
    try {
      // Make a POST request to Gemini API with your prompt
      const response = await axios.post(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
        {
          contents: [{
            parts: [{
              text: `Return ONLY a JSON object (no backticks, no markdown) for this trip request: "${userInput}". 
              Format: {
                "categories": [], 
                "location": "city name",
                "duration": number,
                "pace": "low/medium/high pace",
                "budget": "low/medium/high"
              }`
            }]
          }]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': GEMINI_API_KEY
          }
        }
      );
  
      // Extract the generated text from the API response
      let generatedText = response.data.candidates[0].content.parts[0].text;
  
      // Clean up any formatting Gemini might add (like ```json)
      generatedText = generatedText
        .replace(/```json/g, '') // Remove ```json if present
        .replace(/```/g, '')     // Remove any other ```
        .replace(/\n/g, '')      // Remove newlines
        .trim();                 // Trim spaces
  
      // Extract the JSON object from the response text
      const start = generatedText.indexOf('{');
      const end = generatedText.lastIndexOf('}') + 1;
      const jsonStr = generatedText.slice(start, end);
  
      // Parse the JSON string into a real JS object and return it
      return JSON.parse(jsonStr);
  
    } catch (error) {
      console.error('Gemini API Error:', error.message);
  
      // If something goes wrong, return a fallback example
      return {
        categories: ["food", "culture", "nature"],
        location: "Montreal",
        duration: 3,
        pace: "high",
        budget: "high"
      };
    }
  }

/**
 * Function: processChatMessage
 * ============================
 * This function handles chat conversations with context about the user's trip.
 * It maintains conversation flow and provides helpful travel advice.
 */
async function processChatMessage(message, tripContext = null, chatHistory = []) {
  try {
    // Build context for the AI
    let contextPrompt = "You are a helpful travel assistant. Provide concise, friendly advice about travel planning, destinations, activities, and trip logistics.";
    
    if (tripContext) {
      contextPrompt += ` The user is planning a trip to ${tripContext.destination}`;
      if (tripContext.startDate && tripContext.endDate) {
        contextPrompt += ` from ${tripContext.startDate} to ${tripContext.endDate}`;
      }
      if (tripContext.travelers) {
        contextPrompt += ` for ${tripContext.travelers} ${tripContext.travelers === 1 ? 'traveler' : 'travelers'}`;
      }
      if (tripContext.budget) {
        contextPrompt += ` with a ${tripContext.budget} budget`;
      }
      if (tripContext.categories && tripContext.categories.length > 0) {
        contextPrompt += ` interested in: ${tripContext.categories.join(', ')}`;
      }
      
      // Include detailed itinerary if available
      if (tripContext.itinerary && tripContext.itinerary.length > 0) {
        contextPrompt += `\n\nCurrent itinerary:`;
        tripContext.itinerary.forEach(day => {
          contextPrompt += `\nDay ${day.day}:`;
          day.activities.forEach(activity => {
            const time = activity.scheduledTime || 'morning';
            const duration = activity.duration || '2h';
            contextPrompt += `\n- ${time} (${duration}): ${activity.name} - ${activity.category}`;
            if (activity.address) {
              contextPrompt += ` at ${activity.address}`;
            }
          });
        });
      }
      
      contextPrompt += `. Use this context to provide relevant travel advice.`;
    }
    
    // Add recent chat history for context (last 5 messages)
    if (chatHistory.length > 0) {
      const recentHistory = chatHistory.slice(-5);
      contextPrompt += "\n\nRecent conversation:";
      recentHistory.forEach(msg => {
        contextPrompt += `\n${msg.type}: ${msg.content}`;
      });
    }
    
    // Handle specific conversation flows
    if (tripContext && message.toLowerCase().includes('change an activity')) {
      contextPrompt += `\n\nThe user wants to modify their itinerary. Look at their current activities above and ask which specific one they want to change. Mention 2-3 actual activities from their itinerary as examples. Keep your response under 3 sentences.`;
    }
    
    // Handle when user mentions a specific activity name (like "Louvre", "museum", etc.)
    if (tripContext && tripContext.itinerary && (message.toLowerCase().includes('louvre') || message.toLowerCase().includes('museum') || message.toLowerCase().includes('restaurant') || message.toLowerCase().includes('tour'))) {
      contextPrompt += `\n\nThe user is mentioning a specific activity. Look at their itinerary to find the activity they're referring to and suggest replacements that work for the same time slot and duration. Provide 2-3 specific alternative suggestions.`;
    }
    
    contextPrompt += `\n\nUser question: ${message}\n\nRespond helpfully and conversationally in plain text only. Do not use any markdown formatting including **, *, _, -, •, or any other special characters for formatting. Use simple line breaks and regular text only. Keep responses under 200 words.`;

    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
      {
        contents: [{
          parts: [{
            text: contextPrompt
          }]
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': GEMINI_API_KEY
        }
      }
    );

    // Extract the generated response
    const generatedText = response.data.candidates[0].content.parts[0].text;
    
    return {
      success: true,
      response: generatedText.trim(),
      suggestions: generateSuggestions(message, tripContext)
    };

  } catch (error) {
    console.error('Gemini Chat API Error:', error.message);
    
    // Fallback response
    return {
      success: false,
      response: "I'm having trouble connecting right now, but I'd love to help you plan your trip! Could you try asking again?",
      suggestions: ['Tell me about your destination', 'Help with activities', 'Budget advice']
    };
  }
}

/**
 * Helper function to generate contextual suggestions
 */
function generateSuggestions(message, tripContext) {
  const suggestions = [];
  
  if (!tripContext) {
    // No trip selected - general travel planning suggestions
    suggestions.push('Plan a trip', 'Travel tips', 'Budget advice');
  } else {
    // Trip selected - trip management suggestions
    suggestions.push('Change an activity', 'Local recommendations', 'Transportation help');
    
    // Add contextual suggestions based on message content
    if (message.toLowerCase().includes('activity')) {
      suggestions.push('See similar activities', 'Check opening hours');
    } else if (message.toLowerCase().includes('restaurant') || message.toLowerCase().includes('food')) {
      suggestions.push('More restaurants', 'Dietary options');
    } else if (message.toLowerCase().includes('budget') || message.toLowerCase().includes('cost')) {
      suggestions.push('Save money tips', 'Free activities');
    }
  }
  
  return suggestions.slice(0, 3); // Limit to 3 suggestions
}

module.exports = { processUserInput, processChatMessage };
