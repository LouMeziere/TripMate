require('dotenv').config();

const { processUserInput } = require('../../integrations/geminiAPI');
const { searchPlaces } = require('../../integrations/foursquareAPI');
const { kmeans } = require('ml-kmeans');

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
    groupedClusters[clusterIndex].push(validPlaces[i]);
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

module.exports = {
  generateTrip,
  clusterActivitiesByDistance,
  assignClustersToDays
};
