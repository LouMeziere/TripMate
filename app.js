// Load environment variables from a .env file (for your API keys)
require('dotenv').config();

const fs = require('fs');


const path = require('path');
const { processUserInput } = require('./integrations/geminiAPI');
const { searchPlaces } = require('./integrations/foursquareAPI');

// Import the kmeans clustering library
const { kmeans } = require('ml-kmeans'); // <-- FIXED: Use destructuring to get kmeans function
//const { calculateDistance } = require('./utils/distanceCalculator');



/**
 * ================================
 * Function: generateTrip
 * ================================
 * This is the main function.
 * 1. Takes the user's text input.
 * 2. Converts it to structured preferences using Gemini.
 * 3. Calls Foursquare for each category.
 * 4. Builds a daily itinerary.
 */

async function generateTrip(userInput) {
  try {
    // Step 1: Use Gemini to process the user input
    const tripPreferences = await processUserInput(userInput);

    // Step 2: For each category, search for places
    const placesPromises = tripPreferences.categories.map((category) =>
      searchPlaces({
        query: category,
        near: tripPreferences.location,
        limit: 5,
        sort: 'RATING',
      })
    );

    const placesResults = await Promise.all(placesPromises);

    // Step 3: Flatten all places into a single array
    const allPlaces = placesResults.flat();

    // Step 4: Cluster activities by distance
    const clusters = clusterActivitiesByDistance(allPlaces, tripPreferences.duration);

    // Step 5: Assign clusters to days
    const itinerary = assignClustersToDays(clusters);

    return {
      preferences: tripPreferences,
      itinerary,
    };
  } catch (error) {
    console.error('Error generating trip:', error.message);
    throw error;
  }
}

// Cluster activities by distance
function clusterActivitiesByDistance(places, numDays) {
  // Filter out places that don't have valid coordinates
  const validPlaces = places.filter(place => 
    place && 
    typeof place.latitude === 'number' && 
    typeof place.longitude === 'number'
  );

  if (validPlaces.length === 0) {
    console.warn('No valid places with coordinates found!');
    return [];
  }

  const coordinates = validPlaces.map((place) => [place.latitude, place.longitude]);

  // Perform K-Means clustering
  const { clusters } = kmeans(coordinates, numDays);

  // Group places by cluster
  const groupedClusters = Array.from({ length: numDays }, () => []);
  clusters.forEach((clusterIndex, i) => {
    groupedClusters[clusterIndex].push(places[i]);
  });

  return groupedClusters;
}

// Assign clusters to days
function assignClustersToDays(clusters) {
  return clusters.map((cluster, dayIndex) => ({
    day: dayIndex + 1,
    activities: cluster,
  }));
}

/**
 * ================================
 * Function: test
 * ================================
 * This function just tests the flow end-to-end with an example input.
 */
async function test() {
  try {
    const trip = await generateTrip(
      "I want to spend 2 days in Bordeaux exploring food and culture. I am travelling with my partner and we are looking for romantic places. We generally prefer a relaxed pace and a medium budget trip."
    );
    console.log(JSON.stringify(trip, null, 2));
  } catch (error) {
    console.error('Test Error:', error.message);
  }
}


// Run test
test();

module.exports = { generateTrip };