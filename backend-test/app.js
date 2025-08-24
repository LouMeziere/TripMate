const gemini = require('./integrations/geminiAPI');
const processUserInput = gemini.processUserInput;
const { searchPlaces } = require('./integrations/foursquareAPI');

// Import the kmeans clustering library
const { kmeans } = require('ml-kmeans'); 
console.log(typeof kmeans);
//const { calculateDistance } = require('./utils/distanceCalculator');




    // Step 4: Create balanced itinerary by activity type and location
// Generate a trip object based on user input
async function generateTrip(userInput) {
  // Step 1: Parse user input into structured preferences
  const tripPreferences = await processUserInput(userInput);

  // Step 2: Search for places using Foursquare API
  // We'll use the categories and location from preferences
  let allPlaces = [];
  for (const category of tripPreferences.categories) {
    const params = {
      query: category,
      near: tripPreferences.location,
      limit: 10 // You can adjust this as needed
    };
    console.log('Foursquare API params:', params);
    try {
      const places = await searchPlaces(params);
      console.log('Foursquare API results for', category, ':', places);
      allPlaces = allPlaces.concat(places);
    } catch (e) {
      console.error('Foursquare API error for', category, ':', e.message, e.response && e.response.data);
      continue;
    }
  }

  // Step 3: Create balanced itinerary by activity type and location
  const itinerary = createBalancedItinerary(allPlaces, tripPreferences.duration);

  return {
    preferences: tripPreferences,
    itinerary
  };
}


// Create a balanced itinerary by activity type and location
function createBalancedItinerary(places, numDays) {
  // Group places by activity type
  const groupedByType = groupPlacesByType(places);
  
  // Calculate target activities per day
  const totalPlaces = places.length;
  const targetPerDay = Math.ceil(totalPlaces / numDays);
  
  // Initialize days
  const days = Array.from({ length: numDays }, (_, index) => ({
    day: index + 1,
    activities: []
  }));
  
  // Distribute activities evenly across days, ensuring variety
  const activityTypes = Object.keys(groupedByType);
  let currentDay = 0;
  
  // Round-robin distribution to ensure variety
  for (const activityType of activityTypes) {
    const placesOfType = groupedByType[activityType];
    
    for (const place of placesOfType) {
      // Add to current day if it's not full
      if (days[currentDay].activities.length < targetPerDay) {
        days[currentDay].activities.push(place);
      } else {
        // Move to next day
        currentDay = (currentDay + 1) % numDays;
        days[currentDay].activities.push(place);
      }
    }
  }
  
  // Sort activities within each day by geographical proximity
  days.forEach(day => {
    if (day.activities.length > 1) {
      day.activities = sortByProximity(day.activities);
    }
  });
  
  return days;
}

// Group places by their primary activity type
function groupPlacesByType(places) {
  const grouped = {};
  
  places.forEach(place => {
    // Get the primary category
    const primaryCategory = place.categories[0];
    const categoryName = primaryCategory ? primaryCategory.name : 'Other';
    
    if (!grouped[categoryName]) {
      grouped[categoryName] = [];
    }
    grouped[categoryName].push(place);
  });
  
  return grouped;
}

  // ...existing code...
// Sort activities by geographical proximity using a simple nearest neighbor approach
function sortByProximity(activities) {
  if (activities.length <= 1) return activities;
  
  const sorted = [activities[0]]; // Start with first activity
  const remaining = activities.slice(1);
  
  while (remaining.length > 0) {
    const lastActivity = sorted[sorted.length - 1];
    let nearestIndex = 0;
    let nearestDistance = calculateDistance(
      lastActivity.latitude, 
      lastActivity.longitude,
      remaining[0].latitude, 
      remaining[0].longitude
    );
    
    // Find nearest remaining activity
    for (let i = 1; i < remaining.length; i++) {
      const distance = calculateDistance(
        lastActivity.latitude, 
        lastActivity.longitude,
        remaining[i].latitude, 
        remaining[i].longitude
      );
      
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = i;
      }
    }
    
    // Add nearest activity to sorted list and remove from remaining
    sorted.push(remaining[nearestIndex]);
    remaining.splice(nearestIndex, 1);
  }
  
  return sorted;
}



// Calculate distance between two points using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in kilometers
  return distance;
}



async function test() {
  try {
    const trip = await generateTrip(
      "I want to spend 2 days in Bordeaux exploring food and culture. I am travelling with my partner and we are looking for romantic places. We generally prefer a relaxed pace and a medium budget trip."
    );
    console.log('=== TRIP PREFERENCES ===');
    console.log(JSON.stringify(trip.preferences, null, 2));
    console.log('========================');
    console.log('=== ITINERARY ===');
    console.log(JSON.stringify(trip.itinerary, null, 2));
    console.log('========================');
  } catch (error) {
    console.error('Test Error:', error.message);
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  test();
}