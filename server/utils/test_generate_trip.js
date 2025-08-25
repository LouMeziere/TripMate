
const { processUserInput } = require('../../integrations/geminiAPI');
const { minutesToTimeString, typicalTimes} = require('./activity_utils/check_opening_hours');
const { findNearestPlace } = require('./activity_utils/check_distance');
const { getRestaurants, getActivities } = require('./activity_utils/get_places');



// Helper function to find an unused meal place
function findUnusedMealPlace(mealPlaces, mealType, usedActivityPlaceIds, lastActivity = null) {
  if (!mealPlaces[mealType] || !mealPlaces[mealType].length) {
    return null;
  }
  
  // Get available places
  const availablePlaces = mealPlaces[mealType].filter(place => 
    !usedActivityPlaceIds.has(place.uniqueId)
  );
  
  if (availablePlaces.length === 0) return null;
  
  let selectedPlace;
  
  // If we have a last activity and it has coordinates, find the nearest place
  if (lastActivity && lastActivity.latitude && lastActivity.longitude) {
    selectedPlace = findNearestPlace(
      lastActivity.latitude, 
      lastActivity.longitude, 
      availablePlaces
    );
  } else {
    // Fallback to first available place
    selectedPlace = availablePlaces[0];
  }
  
  if (selectedPlace) {
    usedActivityPlaceIds.add(selectedPlace.uniqueId);
    return { 
      ...selectedPlace, 
      time: minutesToTimeString(typicalTimes[mealType]), 
      type: mealType 
    };
  }
  
  return null;
}




// Helper function to find an unused activity place with fallback categories
function findUnusedActivityPlace(activityPlaces, activityCategories, preferredCategoryIndex, usedActivityPlaceIds, lastActivity = null) {
  for (let offset = 0; offset < activityCategories.length; offset++) {
    const categoryIndex = (preferredCategoryIndex + offset) % activityCategories.length;
    const categoryName = activityCategories[categoryIndex];
    
    if (activityPlaces[categoryName] && activityPlaces[categoryName].length) {
      // Get available places in this category
      const availablePlaces = activityPlaces[categoryName].filter(place => 
        !usedActivityPlaceIds.has(place.uniqueId)
      );
      
      if (availablePlaces.length > 0) {
        let selectedPlace;
        
        // If we have a last activity and it has coordinates, find the nearest place
        if (lastActivity && lastActivity.latitude && lastActivity.longitude) {
          selectedPlace = findNearestPlace(
            lastActivity.latitude, 
            lastActivity.longitude, 
            availablePlaces
          );
        } else {
          // Fallback to first available place
          selectedPlace = availablePlaces[0];
        }
        
        if (selectedPlace) {
          usedActivityPlaceIds.add(selectedPlace.uniqueId);
          const timeSlot = preferredCategoryIndex === 0 ? 'activity1' : 'activity2';
          return { 
            ...selectedPlace, 
            time: minutesToTimeString(typicalTimes[timeSlot]), 
            type: categoryName 
          };
        }
      }
    }
  }
  return null;
}

// Helper function to plan a single day
function planSingleDay(dayNumber, mealPlaces, activityPlaces, activityCategories, usedActivityPlaceIds) {
  console.log(`Starting day ${dayNumber} planning...`);
  const dayActivities = [];

  // 1. Add breakfast (08:00)
  console.log('Looking for breakfast places...');
  const breakfast = findUnusedMealPlace(mealPlaces, 'breakfast', usedActivityPlaceIds);
  if (breakfast) {
    console.log('Added breakfast:', breakfast.name || 'Unknown name');
    dayActivities.push(breakfast);
  } else {
    console.log('No breakfast places found');
  }

  // 2. Add first activity (10:00) - consider distance from breakfast
  if (activityCategories.length > 0) {
    const lastActivity = dayActivities[dayActivities.length - 1];
    const activity1 = findUnusedActivityPlace(activityPlaces, activityCategories, 0, usedActivityPlaceIds, lastActivity);
    if (activity1) dayActivities.push(activity1);
  }

  // 3. Add lunch (12:30) - consider distance from first activity
  const lastActivityBeforeLunch = dayActivities[dayActivities.length - 1];
  const lunch = findUnusedMealPlace(mealPlaces, 'lunch', usedActivityPlaceIds, lastActivityBeforeLunch);
  if (lunch) dayActivities.push(lunch);

  // 4. Add second activity (14:00) - consider distance from lunch
  if (activityCategories.length > 1) {
    const lastActivityBeforeSecond = dayActivities[dayActivities.length - 1];
    const activity2 = findUnusedActivityPlace(activityPlaces, activityCategories, 1, usedActivityPlaceIds, lastActivityBeforeSecond);
    if (activity2) dayActivities.push(activity2);
  }

  // 5. Add dinner (19:00) - consider distance from second activity
  const lastActivityBeforeDinner = dayActivities[dayActivities.length - 1];
  const dinner = findUnusedMealPlace(mealPlaces, 'dinner', usedActivityPlaceIds, lastActivityBeforeDinner);
  if (dinner) dayActivities.push(dinner);

  // Keep the chronological order for proper meal timing
  // Distance optimization already happened during selection
  console.log(`Day ${dayNumber} final activities:`, dayActivities.length);
  if (dayActivities.length > 0) {
    console.log(`Day ${dayNumber} chronological order:`, dayActivities.map(a => `${a.name} (${a.time})`).join(' → '));
  }
  
  return dayActivities;
}




async function generateTrip(userInput) {
  // Step 1: Parse user input into structured preferences
  const tripPreferences = await processUserInput(userInput);

  // Step 2: Always call Foursquare for 'breakfast', 'lunch', 'dinner' activities
  const { allPlaces, mealPlaces } = await getRestaurants(tripPreferences);

  // Step 3: Call Foursquare for other activity/interest which include any activities except meal related
  const { activityPlaces, allActivityPlaces } = await getActivities(tripPreferences);
  
  // Get activity categories for later use
  const activityCategories = Object.keys(activityPlaces);

  // Step 4: Plan the day as breakfast, activity, lunch, activity, dinner
  const numDays = tripPreferences.duration;
  const days = Array.from({ length: numDays }, (_, i) => ({
    day: i + 1,
    activities: []
  }));

  // Track used activity place IDs to avoid repeats
  const usedActivityPlaceIds = new Set();

  // Plan each day of the trip
  for (let dayIndex = 0; dayIndex < numDays; dayIndex++) {
    const dayNumber = dayIndex + 1;
    days[dayIndex].activities = planSingleDay(
      dayNumber, 
      mealPlaces, 
      activityPlaces, 
      activityCategories, 
      usedActivityPlaceIds
    );
  }

  console.log('Final itinerary days:', days.map(d => ({ day: d.day, activityCount: d.activities.length })));
  return {
    preferences: tripPreferences,
    itinerary: days
  };
}








// Test function to print a sample trip with only important info
if (require.main === module) {
  (async () => {
    const userInput = "I want to spend 2 days in Bordeaux exploring culture. I am travelling with my partner and we are looking for romantic places. We generally prefer a relaxed pace and a medium budget trip.";
    try {
      const trip = await generateTrip(userInput);
      console.log('=== ITINERARY SUMMARY ===');
      trip.itinerary.forEach(day => {
        console.log(`Day ${day.day}:`);
        day.activities.forEach(activity => {
          const name = activity.name || (activity.venue && activity.venue.name) || 'Unknown';
          const time = activity.time ? ` at ${activity.time}` : '';
          console.log(`  - ${activity.type || 'activity'}: ${name}${time}`);
        });
      });
      console.log('========================');
    } catch (error) {
      console.error('Test Error:', error.message);
    }
  })();
}

module.exports = {
  generateTrip,
  findUnusedMealPlace,
  findUnusedActivityPlace,
  planSingleDay
};