// Import the axios HTTP client library to make API requests
const axios = require('axios');

// Load environment variables from a .env file (for your API keys)
require('dotenv').config();

// Load your API key from environment variables
const FOURSQUARE_API_KEY = process.env.FOURSQUARE_API_KEY;


/**
 * ================================
 * Function: searchPlaces
 * ================================
 * This calls the Foursquare Places API with search parameters.
 * Example: search for "coffee shops" near "Paris".
 */
async function searchPlaces(params) {
    try {
      const response = await axios.get(
        'https://places-api.foursquare.com/places/search',
        {
          headers: {
            'X-Places-Api-Version': '2025-06-17',
            'Accept': 'application/json',
            'Authorization': `Bearer ${FOURSQUARE_API_KEY}`
          },
          params // your query params (e.g. query, near, radius)
        }
      );
  
      // Return the list of places found
      return response.data.results;
  
    } catch (error) {
      console.error('Foursquare API Error:', error.message);
      throw error;
    }
  }

module.exports = { searchPlaces };
