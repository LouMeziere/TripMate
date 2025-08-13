
const axios = require('axios'); // Import the axios HTTP client library to make API requests
require('dotenv').config(); // Load environment variables from a .env file 

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

  module.exports = { processUserInput };
