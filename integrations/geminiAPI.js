
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
 * Helper function to find activity mentioned in user message
 */
function findActivityInMessage(message, tripContext) {
  console.log('🔍 findActivityInMessage called with:', message);
  console.log('Trip context has itinerary?', !!tripContext?.itinerary);
  
  if (!tripContext?.itinerary) return null;
  
  const lowerMessage = message.toLowerCase();
  console.log('Lower message:', lowerMessage);
  
  // Look for activity names mentioned in the message
  for (const day of tripContext.itinerary) {
    if (day.activities) {
      for (let actIndex = 0; actIndex < day.activities.length; actIndex++) {
        const activity = day.activities[actIndex];
        if (activity.name) {
          const activityLower = activity.name.toLowerCase();
          console.log(`Checking activity: "${activity.name}" -> "${activityLower}"`);
          console.log(`Message includes it? ${lowerMessage.includes(activityLower)}`);
          
          if (lowerMessage.includes(activityLower)) {
            console.log(`✅ Found activity: ${activity.name} on day ${day.day}`);
            return {
              ...activity,
              day: day.day,
              position: actIndex
            };
          }
        }
      }
    }
  }
  
  console.log('❌ No activity found in message');
  return null;
}

/**
 * Helper function to detect replacement activity from user message
 */
function findReplacementActivity(message) {
  const lowerMessage = message.toLowerCase();
  
  // Look for patterns like "with [activity name]" or "let's try [activity name]"
  const patterns = [
    /with\s+([^,.!?]+)/i,
    /let'?s try\s+([^,.!?]+)/i,
    /how about\s+([^,.!?]+)/i,
    /what about\s+([^,.!?]+)/i,
    /try\s+([^,.!?]+)/i,
    /something\s+([^,.!?]+)/i,           // "something cultural"
    /want\s+something\s+([^,.!?]+)/i,    // "I want something cultural"
    /prefer\s+([^,.!?]+)/i,              // "I prefer cultural"
    /instead\s+of.*?([^,.!?]+)/i         // "instead of X, Y"
  ];
  
  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match) {
      console.log(`🎯 Replacement activity pattern matched: "${pattern}" -> "${match[1].trim()}"`);
      return match[1].trim();
    }
  }
  
  console.log('❌ No replacement activity found in message');
  return null;
}

/**
 * Helper function to update replacement state based on user message
 */
function updateReplacementState(message, tripContext, replacementState, chatHistory) {
  console.log('🔄 updateReplacementState called with:');
  console.log('  - message:', message);
  console.log('  - tripContext exists:', !!tripContext);
  console.log('  - replacementState:', replacementState);
  
  const lowerMessage = message.toLowerCase();
  
  // Step 1: Detect if user wants to change an activity
  if (lowerMessage.includes('change an activity') || 
      lowerMessage.includes('change activity') ||
      lowerMessage.includes('replace an activity') ||
      lowerMessage.includes('replace activity')) {
    replacementState.action = 'replace';
    console.log('🔄 User wants to change an activity');
    return;
  }
  
  // Step 1b: Alternative - if they mention replacing a specific activity directly
  if ((lowerMessage.includes('replace') || lowerMessage.includes('change')) && !replacementState.action) {
    const activityMentioned = findActivityInMessage(message, tripContext);
    if (activityMentioned) {
      replacementState.action = 'replace';
      replacementState.current_activity = activityMentioned.name;
      console.log(`🎯 Direct replacement detected: ${activityMentioned.name}`);
      return;
    }
  }
  
  // Step 2: Detect if user specifies which activity to change
  if (replacementState.action === 'replace' && !replacementState.current_activity) {
    const activityMentioned = findActivityInMessage(message, tripContext);
    if (activityMentioned) {
      replacementState.current_activity = activityMentioned.name;
      console.log(`🎯 Current activity identified: ${activityMentioned.name}`);
      return;
    }
  }
  
  // Step 3: Detect if user specifies replacement activity
  if (replacementState.current_activity && !replacementState.replacement_activity) {
    const replacementActivity = findReplacementActivity(message);
    if (replacementActivity) {
      replacementState.replacement_activity = replacementActivity;
      console.log(`✨ Replacement activity identified: ${replacementActivity}`);
      return;
    }
  }
  
  // Step 4: Handle confirmation responses
  if (replacementState.current_activity) {
    if (lowerMessage.includes('yes') || 
        lowerMessage.includes('sounds good') || 
        lowerMessage.includes('that works') ||
        lowerMessage.includes('replace it') ||
        lowerMessage.includes('do it')) {
      replacementState.confirmation = true;
      console.log('✅ User confirmed replacement');
      
      // If no specific replacement was mentioned, use a generic cultural activity
      if (!replacementState.replacement_activity) {
        replacementState.replacement_activity = 'cultural activity';
        console.log('🎯 Using default replacement: cultural activity');
      }
      return;
    }
  }
}

/**
 * Helper function to detect if AI response confirms a replacement
 */
function detectReplacementConfirmation(aiResponse, replacementState) {
  const lowerResponse = aiResponse.toLowerCase();
  
  // Look for confirmation patterns
  const confirmationPatterns = [
    /we'?ve replaced/i,
    /so,?\s+we'?ve replaced/i,
    /replaced.*with/i,
    /great choice.*replaced/i,
    /perfect.*replaced/i
  ];
  
  for (const pattern of confirmationPatterns) {
    if (pattern.test(aiResponse)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Function: processChatMessage
 * ============================
 * This function handles chat conversations with context about the user's trip.
 * It maintains conversation flow and provides helpful travel advice.
 * Now includes replacement state tracking for activity changes.
 */
async function processChatMessage(message, tripContext = null, chatHistory = [], replacementState = null) {
  console.log('🤖 processChatMessage called with:');
  console.log('  - message:', message);
  console.log('  - tripContext exists:', !!tripContext);
  console.log('  - chatHistory length:', chatHistory.length);
  console.log('  - replacementState:', replacementState);
  
  try {
    // Initialize replacement state if not provided
    if (!replacementState) {
      replacementState = {
        current_activity: null,
        replacement_activity: null,
        action: null,
        confirmation: false
      };
    }

    console.log('Current replacement state:', replacementState);

    // Update replacement state based on user message
    updateReplacementState(message, tripContext, replacementState, chatHistory);
    
    console.log('Updated replacement state after user message:', replacementState);
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

    // Handle replacement flow based on current state
    if (replacementState.current_activity && replacementState.replacement_activity && !replacementState.confirmation) {
      contextPrompt += `\n\nIMPORTANT: The user has chosen to replace "${replacementState.current_activity}" with "${replacementState.replacement_activity}". You MUST now ask for explicit confirmation using this exact format: "Should I replace ${replacementState.current_activity} with ${replacementState.replacement_activity} for your itinerary?" This confirmation is required to proceed with the change.`;
    }
    
    contextPrompt += `\n\nUser question: ${message}\n\nIMPORTANT TRIP CHANGE GUIDELINES:
- When a user wants to ADD, DELETE, SWAP, or REPLACE any activity in their trip, you MUST always ask for explicit confirmation before proceeding
- Always restate the specific change you're about to make with key details (activity name, time, day)
- Use phrases like "Should I replace [current activity] with [new activity] for [time] on day [X]?" or "Would you like me to swap out [activity] with [new option]?"
- Never make trip changes without getting a clear "yes" or confirmation from the user first
- This ensures the user knows exactly what change is being made

Respond helpfully and conversationally in plain text only. Do not use any markdown formatting including **, *, _, -, •, or any other special characters for formatting. Use simple line breaks and regular text only. Keep responses under 200 words.`;

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
    
    // Check if AI response confirms a replacement
    if (replacementState.current_activity && replacementState.replacement_activity && !replacementState.confirmation) {
      if (detectReplacementConfirmation(generatedText, replacementState)) {
        replacementState.confirmation = true;
        console.log('🤖 AI confirmed replacement in response');
      }
    }
    
    console.log('Final replacement state after AI response:', replacementState);
    
    return {
      success: true,
      response: generatedText.trim(),
      suggestions: generateSuggestions(message, tripContext),
      replacementState: replacementState // Include replacement state in response
    };

  } catch (error) {
    console.error('Gemini Chat API Error:', error.message);
    
    // Check if it's a rate limit error (429)
    let fallbackResponse;
    if (error.response?.status === 429) {
      console.log('🚫 Rate limit detected - using intelligent fallback');
      fallbackResponse = generateIntelligentFallback(message, tripContext, replacementState);
    } else {
      fallbackResponse = "I'm having trouble connecting right now, but I'd love to help you plan your trip! Could you try asking again?";
    }
    
    return {
      success: false,
      response: fallbackResponse,
      suggestions: generateSuggestions(message, tripContext),
      replacementState: replacementState || {
        current_activity: null,
        replacement_activity: null,
        action: null,
        confirmation: false
      }
    };
  }
}

/**
 * Generate intelligent fallback responses when Gemini API is rate limited
 */
function generateIntelligentFallback(message, tripContext, replacementState) {
  const lowerMessage = message.toLowerCase();
  
  // Handle replacement flow specifically
  if (replacementState?.action === 'replace') {
    
    // Step 1: User wants to change activity
    if (!replacementState.current_activity) {
      if (tripContext?.itinerary) {
        const activities = tripContext.itinerary.flatMap(day => 
          day.activities.map(act => act.name)
        ).slice(0, 3);
        return `I'd be happy to help you change an activity! Which one would you like to replace? For example: ${activities.join(', ')}.`;
      }
      return "Which activity would you like to change? Please tell me the name of the activity you'd like to replace.";
    }
    
    // Step 2: User specified current activity, need replacement
    if (replacementState.current_activity && !replacementState.replacement_activity) {
      return `Got it! Let's replace ${replacementState.current_activity}. What would you like to replace it with? You can suggest a specific place or just tell me what type of activity you prefer (like 'something cultural' or 'outdoor activity').`;
    }
    
    // Step 3: Both activities specified, need confirmation
    if (replacementState.current_activity && replacementState.replacement_activity && !replacementState.confirmation) {
      return `Perfect! Should I replace ${replacementState.current_activity} with ${replacementState.replacement_activity} in your itinerary?`;
    }
  }
  
  // General responses based on message content
  if (lowerMessage.includes('change') || lowerMessage.includes('replace')) {
    return "I can help you change activities in your trip! Just tell me which activity you'd like to replace.";
  }
  
  if (lowerMessage.includes('yes') || lowerMessage.includes('sounds good') || lowerMessage.includes('do it')) {
    return "Great! I'll make that change for you.";
  }
  
  if (lowerMessage.includes('restaurant') || lowerMessage.includes('food')) {
    return "I'd love to help with restaurant recommendations! What type of cuisine or dining experience are you looking for?";
  }
  
  if (lowerMessage.includes('museum') || lowerMessage.includes('culture')) {
    return "Cultural activities are wonderful! Are you looking for museums, galleries, historical sites, or something else?";
  }
  
  // Default fallback
  return "I'm here to help with your trip planning! Feel free to ask about activities, restaurants, transportation, or anything else about your trip.";
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
