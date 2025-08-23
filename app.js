// Load environment variables from a .env file (for your API keys)
require('dotenv').config();

const { processUserInput } = require('./integrations/geminiAPI');
const { searchPlaces } = require('./integrations/foursquareAPI');

// Import the kmeans clustering library
const { kmeans } = require('ml-kmeans'); 
console.log(typeof kmeans);
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

    // Step 2: Calculate dynamic limit based on trip duration and filtering needs
    const dynamicLimit = calculateVenueLimit(tripPreferences.duration, tripPreferences.categories.length);
    console.log(`Trip duration: ${tripPreferences.duration} days, requesting ${dynamicLimit} venues per category`);

    // Step 3: For each category, search for places with dynamic limit
    const placesPromises = tripPreferences.categories.map((category) =>
      searchPlaces({
        query: category,
        near: tripPreferences.location,
        limit: dynamicLimit,
      })
    );

    const placesResults = await Promise.all(placesPromises);

    // Step 3: Flatten all places into a single array
    const allPlaces = placesResults.flat();

    // Step 4: Create balanced itinerary by activity type and location
    const itinerary = createBalancedItinerary(allPlaces, tripPreferences.duration);

    return {
      preferences: tripPreferences,
      itinerary,
    };
  } catch (error) {
    console.error('Error generating trip:', error.message);
    throw error;
  }
}

// Calculate dynamic venue limit based on trip duration and filtering requirements
function calculateVenueLimit(tripDuration, numCategories) {
  // Base calculation: more days = more venues needed
  // Account for venue losses due to:
  // 1. Geographic clustering (some venues may be in wrong clusters)
  // 2. Day-of-week availability (venues closed on certain days)
  // 3. Duplicate prevention (venues used on previous days)
  // 4. Meal type requirements (need multiple restaurants for different meals)
  
  // Base venues needed per day per category
  const baseVenuesPerDayPerCategory = 2; // Conservative estimate
  
  // Buffer multiplier to account for filtering losses
  const filteringBuffer = 2.5; // Account for 60% loss due to clustering, availability, duplicates
  
  // Trip duration multiplier (longer trips need proportionally more variety)
  const durationMultiplier = Math.min(tripDuration * 0.8, 3); // Cap at 3x for very long trips
  
  // Calculate base requirement
  const baseLimit = Math.ceil(tripDuration * baseVenuesPerDayPerCategory * durationMultiplier);
  
  // Apply filtering buffer
  const bufferedLimit = Math.ceil(baseLimit * filteringBuffer);
  
  // Set reasonable bounds (API limits and practical constraints)
  const minLimit = 8;  // Minimum for basic variety
  const maxLimit = 25; // Maximum to avoid API rate limits and excessive data
  
  const finalLimit = Math.max(minLimit, Math.min(maxLimit, bufferedLimit));
  
  console.log(`Venue limit calculation: ${tripDuration} days × ${baseVenuesPerDayPerCategory} base × ${durationMultiplier.toFixed(1)} duration × ${filteringBuffer} buffer = ${finalLimit} venues per category`);
  
  return finalLimit;
}

// Create a realistic daily itinerary: breakfast, activity, lunch, activity, dinner
function createBalancedItinerary(places, numDays) {
  console.log(`Creating itinerary for ${places.length} places over ${numDays} days`);
  
  // Use the opening hours data that's already provided
  const placesWithInfo = places.map(place => ({
    ...place,
    // Use provided opening hours or intelligent defaults based on venue type
    typicalOpenTime: place.typicalOpenTime || getTypicalOpenTime(place.hours, place.categories),
    typicalCloseTime: place.typicalCloseTime || getTypicalCloseTime(place.hours, place.categories),
    isRestaurant: isRestaurant(place.categories)
  }));
  
  console.log('Sample place with hours:', placesWithInfo[0]);
  console.log('Raw hours data for first place:', placesWithInfo[0].hours);
  
  // Separate restaurants from activities
  const restaurants = placesWithInfo.filter(place => place.isRestaurant);
  const activities = placesWithInfo.filter(place => !place.isRestaurant);
  
  console.log(`Restaurants: ${restaurants.length}, Activities: ${activities.length}`);
  
  // Use geographical clustering for multi-day trips
  const clusteredVenues = clusterVenuesGeographically(placesWithInfo, numDays);
  
  // Create a master list to track used venues across all days
  const usedVenues = new Set();
  
  // Create daily schedules with optimized routing
  const days = [];
  
  for (let day = 1; day <= numDays; day++) {
    const dayCluster = clusteredVenues[day - 1] || [];
    
    // Calculate the actual date for this day of the trip (starting today)
    const tripDate = new Date();
    tripDate.setDate(tripDate.getDate() + (day - 1));
    const dayOfWeek = tripDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    
    console.log(`Day ${day} planning for: ${tripDate.toDateString()} (${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek]})`);
    
    // Filter venues that are actually open on this day
    const openClusterRestaurants = dayCluster.filter(place => 
      place.isRestaurant && isVenueOpenOnDay(place, dayOfWeek)
    );
    const openClusterActivities = dayCluster.filter(place => 
      !place.isRestaurant && isVenueOpenOnDay(place, dayOfWeek)
    );
    
    // Fallback to all venues if cluster is too small, but still filter by day availability
    const availableRestaurants = openClusterRestaurants.length >= 3 ? 
      openClusterRestaurants : 
      restaurants.filter(place => isVenueOpenOnDay(place, dayOfWeek));
    const availableActivities = openClusterActivities.length >= 2 ? 
      openClusterActivities : 
      activities.filter(place => isVenueOpenOnDay(place, dayOfWeek));
    
    console.log(`Available venues for ${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek]}: ${availableRestaurants.length} restaurants, ${availableActivities.length} activities`);
    
    const dailySchedule = createOptimizedDailySchedule(
      availableRestaurants,
      availableActivities, 
      usedVenues,
      day,
      dayOfWeek
    );
    
    days.push({
      day: day,
      schedule: dailySchedule
    });
  }
  
  return days;
}

// Create a daily schedule ensuring no venue is used twice across the entire trip
function createDailyScheduleNoDuplicates(restaurants, activities, usedVenues, dayNumber) {
  const schedule = [];
  let lastLocation = null;
  let currentTime = 8; // Start at 8 AM
  
  // Helper function to find available (unused) venues
  const getAvailableVenues = (venueList) => {
    return venueList.filter(venue => !usedVenues.has(venue.fsq_place_id));
  };
  
  // Helper function to mark venue as used
  const markAsUsed = (venue) => {
    if (venue) {
      usedVenues.add(venue.fsq_place_id);
    }
  };
  
  // 1. Breakfast - find available restaurants that open early
  const availableRestaurants = getAvailableVenues(restaurants);
  const breakfastOptions = availableRestaurants.filter(r => r.typicalOpenTime <= 9);
  let breakfast = null;
  
  if (breakfastOptions.length > 0) {
    breakfast = findNearestPlace(lastLocation, breakfastOptions);
  } else if (availableRestaurants.length > 0) {
    breakfast = availableRestaurants[0]; // Take first available restaurant
  }
  
  if (breakfast) {
    const breakfastTime = Math.max(currentTime, breakfast.typicalOpenTime);
    const breakfastDuration = getActivityDuration(breakfast.categories, 'breakfast');
    
    schedule.push({
      time: formatTime(breakfastTime),
      type: 'breakfast',
      place: breakfast,
      actualOpenTime: breakfast.typicalOpenTime,
      duration: `${breakfastDuration} minutes`,
      endTime: formatTime(breakfastTime + breakfastDuration / 60)
    });
    
    lastLocation = breakfast;
    markAsUsed(breakfast);
    currentTime = breakfastTime + (breakfastDuration / 60) + 0.5; // Add 30min travel buffer
  }
  
  // 2. Morning Activity - find available activities
  const availableActivities = getAvailableVenues(activities);
  if (availableActivities.length > 0) {
    const morningActivity = findNearestPlace(lastLocation, availableActivities);
    const activityTime = Math.max(currentTime, morningActivity.typicalOpenTime);
    const activityDuration = getActivityDuration(morningActivity.categories, 'activity');
    
    schedule.push({
      time: formatTime(activityTime),
      type: 'activity',
      place: morningActivity,
      actualOpenTime: morningActivity.typicalOpenTime,
      duration: `${activityDuration} minutes`,
      endTime: formatTime(activityTime + activityDuration / 60)
    });
    
    lastLocation = morningActivity;
    markAsUsed(morningActivity);
    currentTime = activityTime + (activityDuration / 60) + 0.5; // Add travel buffer
  }
  
  // 3. Lunch - available restaurants open by lunch time
  const availableForLunch = getAvailableVenues(restaurants).filter(r => r.typicalOpenTime <= 13);
  let lunch = null;
  
  if (availableForLunch.length > 0) {
    lunch = findNearestPlace(lastLocation, availableForLunch);
  } else {
    const stillAvailable = getAvailableVenues(restaurants);
    if (stillAvailable.length > 0) {
      lunch = stillAvailable[0];
    }
  }
  
  if (lunch) {
    const lunchTime = Math.max(currentTime, lunch.typicalOpenTime, 12); // Ensure lunch is at least at noon
    const lunchDuration = getActivityDuration(lunch.categories, 'lunch');
    
    schedule.push({
      time: formatTime(lunchTime),
      type: 'lunch', 
      place: lunch,
      actualOpenTime: lunch.typicalOpenTime,
      duration: `${lunchDuration} minutes`,
      endTime: formatTime(lunchTime + lunchDuration / 60)
    });
    
    lastLocation = lunch;
    markAsUsed(lunch);
    currentTime = lunchTime + (lunchDuration / 60) + 0.5; // Add travel buffer
  }
  
  // 4. Afternoon Activity - available activities
  const availableAfternoonActivities = getAvailableVenues(activities);
  if (availableAfternoonActivities.length > 0) {
    const afternoonActivity = findNearestPlace(lastLocation, availableAfternoonActivities);
    const activityTime = Math.max(currentTime, afternoonActivity.typicalOpenTime);
    const activityDuration = getActivityDuration(afternoonActivity.categories, 'activity');
    
    schedule.push({
      time: formatTime(activityTime),
      type: 'activity',
      place: afternoonActivity,
      actualOpenTime: afternoonActivity.typicalOpenTime,
      duration: `${activityDuration} minutes`,
      endTime: formatTime(activityTime + activityDuration / 60)
    });
    
    lastLocation = afternoonActivity;
    markAsUsed(afternoonActivity);
    currentTime = activityTime + (activityDuration / 60) + 0.5; // Add travel buffer
  }
  
  // 5. Dinner - available restaurants for dinner
  const availableForDinner = getAvailableVenues(restaurants).filter(r => 
    r.typicalOpenTime <= 19 && r.typicalCloseTime >= 20
  );
  let dinner = null;
  
  if (availableForDinner.length > 0) {
    dinner = findNearestPlace(lastLocation, availableForDinner);
  } else {
    const stillAvailableRestaurants = getAvailableVenues(restaurants);
    if (stillAvailableRestaurants.length > 0) {
      dinner = stillAvailableRestaurants[0];
    }
  }
  
  if (dinner) {
    const dinnerTime = Math.max(currentTime, dinner.typicalOpenTime, 18); // Ensure dinner is at least at 6 PM
    const dinnerDuration = getActivityDuration(dinner.categories, 'dinner');
    
    schedule.push({
      time: formatTime(dinnerTime),
      type: 'dinner',
      place: dinner,
      actualOpenTime: dinner.typicalOpenTime,
      duration: `${dinnerDuration} minutes`,
      endTime: formatTime(dinnerTime + dinnerDuration / 60)
    });
    
    markAsUsed(dinner);
  }
  
  console.log(`Day ${dayNumber}: Used ${schedule.length} venues, Total used so far: ${usedVenues.size}`);
  
  return schedule;
}

// Create a daily schedule: breakfast, activity, lunch, activity, dinner
function createDailySchedule(restaurants, activities, dayNumber) {
  const schedule = [];
  let lastLocation = null;
  
  // 1. Breakfast - find restaurants that open early
  const breakfastOptions = restaurants.filter(r => r.typicalOpenTime <= 9);
  let breakfast = null;
  
  if (breakfastOptions.length > 0) {
    breakfast = findNearestPlace(lastLocation, breakfastOptions);
  } else if (restaurants.length > 0) {
    breakfast = restaurants[0]; // Take first available restaurant
  }
  
  if (breakfast) {
    const breakfastTime = Math.max(8, breakfast.typicalOpenTime);
    schedule.push({
      time: formatTime(breakfastTime),
      type: 'breakfast',
      place: breakfast,
      actualOpenTime: breakfast.typicalOpenTime
    });
    lastLocation = breakfast;
    removeFromArray(restaurants, breakfast);
  }
  
  // 2. Morning Activity - find activities that are open
  if (activities.length > 0) {
    const morningActivity = findNearestPlace(lastLocation, activities);
    const activityTime = Math.max(10, morningActivity.typicalOpenTime);
    
    schedule.push({
      time: formatTime(activityTime),
      type: 'activity',
      place: morningActivity,
      actualOpenTime: morningActivity.typicalOpenTime
    });
    lastLocation = morningActivity;
    removeFromArray(activities, morningActivity);
  }
  
  // 3. Lunch - restaurants open by lunch time
  const lunchOptions = restaurants.filter(r => r.typicalOpenTime <= 13);
  let lunch = null;
  
  if (lunchOptions.length > 0) {
    lunch = findNearestPlace(lastLocation, lunchOptions);
  } else if (restaurants.length > 0) {
    lunch = restaurants[0];
  }
  
  if (lunch) {
    const lunchTime = Math.max(12, lunch.typicalOpenTime);
    schedule.push({
      time: formatTime(lunchTime),
      type: 'lunch', 
      place: lunch,
      actualOpenTime: lunch.typicalOpenTime
    });
    lastLocation = lunch;
    removeFromArray(restaurants, lunch);
  }
  
  // 4. Afternoon Activity
  if (activities.length > 0) {
    const afternoonActivity = findNearestPlace(lastLocation, activities);
    const activityTime = Math.max(15, afternoonActivity.typicalOpenTime);
    
    schedule.push({
      time: formatTime(activityTime),
      type: 'activity',
      place: afternoonActivity,
      actualOpenTime: afternoonActivity.typicalOpenTime
    });
    lastLocation = afternoonActivity;
    removeFromArray(activities, afternoonActivity);
  }
  
  // 5. Dinner - restaurants that are open for dinner
  const dinnerOptions = restaurants.filter(r => 
    r.typicalOpenTime <= 19 && r.typicalCloseTime >= 20
  );
  let dinner = null;
  
  if (dinnerOptions.length > 0) {
    dinner = findNearestPlace(lastLocation, dinnerOptions);
  } else if (restaurants.length > 0) {
    dinner = restaurants[0];
  }
  
  if (dinner) {
    const dinnerTime = Math.max(19, dinner.typicalOpenTime);
    schedule.push({
      time: formatTime(dinnerTime),
      type: 'dinner',
      place: dinner,
      actualOpenTime: dinner.typicalOpenTime
    });
    removeFromArray(restaurants, dinner);
  }
  
  return schedule;
}

// Helper function to format time properly
function formatTime(hour) {
  // Handle fractional hours by converting to hours and minutes
  const totalMinutes = Math.round(hour * 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  let displayHour;
  let period;
  
  if (hours === 0) {
    displayHour = 12;
    period = 'AM';
  } else if (hours < 12) {
    displayHour = hours;
    period = 'AM';
  } else if (hours === 12) {
    displayHour = 12;
    period = 'PM';
  } else {
    displayHour = hours - 12;
    period = 'PM';
  }
  
  if (minutes === 0) {
    return `${displayHour}:00 ${period}`;
  } else {
    return `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`;
  }
}

// Get realistic duration for activities based on venue type and meal type
function getActivityDuration(categories, activityType) {
  if (!categories || categories.length === 0) {
    return getDefaultDuration(activityType);
  }
  
  const categoryName = categories[0].name.toLowerCase();
  
  // Meal durations
  if (activityType === 'breakfast') {
    if (categoryName.includes('bakery')) return 15; // Quick pastry pickup
    if (categoryName.includes('cafe')) return 30; // Leisurely coffee
    return 45; // Full breakfast
  }
  
  if (activityType === 'lunch') {
    if (categoryName.includes('salad') || categoryName.includes('fast')) return 30;
    if (categoryName.includes('bistro') || categoryName.includes('cafe')) return 60;
    return 90; // Full restaurant lunch
  }
  
  if (activityType === 'dinner') {
    if (categoryName.includes('bar') || categoryName.includes('wine')) return 120; // Drinks + light food
    if (categoryName.includes('bistro')) return 90;
    return 120; // Full dinner experience
  }
  
  // Activity durations
  if (activityType === 'activity') {
    // Museums and cultural sites need substantial time
    if (categoryName.includes('museum')) return 180; // 3 hours for museum
    if (categoryName.includes('gallery')) return 120; // 2 hours for gallery
    if (categoryName.includes('historic') || categoryName.includes('cultural')) return 150; // 2.5 hours
    
    // Entertainment venues
    if (categoryName.includes('cinema') || categoryName.includes('theater')) return 150; // 2.5 hours including show
    if (categoryName.includes('opera')) return 180; // 3 hours for opera/concert
    
    // Outdoor and leisure activities
    if (categoryName.includes('park') || categoryName.includes('garden')) return 90; // 1.5 hours walking
    if (categoryName.includes('market') || categoryName.includes('shopping')) return 120; // 2 hours browsing
    
    // Cafés as activities (coffee break)
    if (categoryName.includes('cafe')) return 45; // Coffee and pastry break
    
    // Art and cultural spaces
    if (categoryName.includes('art') || categoryName.includes('public art')) return 60; // 1 hour viewing
    
    return 90; // Default 1.5 hours for other activities
  }
  
  return getDefaultDuration(activityType);
}

// Default durations when category doesn't match
function getDefaultDuration(activityType) {
  switch (activityType) {
    case 'breakfast': return 45; // 45 minutes
    case 'lunch': return 90; // 1.5 hours
    case 'dinner': return 120; // 2 hours
    case 'activity': return 90; // 1.5 hours
    default: return 60; // 1 hour
  }
}
function findNearestPlace(currentLocation, availablePlaces) {
  if (!currentLocation || availablePlaces.length === 0) {
    return availablePlaces[0] || null;
  }
  
  let nearest = availablePlaces[0];
  let minDistance = calculateDistance(
    currentLocation.latitude, currentLocation.longitude,
    nearest.latitude, nearest.longitude
  );
  
  for (let i = 1; i < availablePlaces.length; i++) {
    const distance = calculateDistance(
      currentLocation.latitude, currentLocation.longitude,
      availablePlaces[i].latitude, availablePlaces[i].longitude
    );
    
    if (distance < minDistance) {
      minDistance = distance;
      nearest = availablePlaces[i];
    }
  }
  
  return nearest;
}

// Helper function to remove item from array
function removeFromArray(array, item) {
  const index = array.indexOf(item);
  if (index > -1) {
    array.splice(index, 1);
  }
}

// Check if place is a restaurant/food place
function isRestaurant(categories) {
  const foodKeywords = ['restaurant', 'cafe', 'food', 'dining', 'bar', 'bistro', 'bakery', 'pizzeria'];
  return categories.some(cat => 
    foodKeywords.some(keyword => cat.name.toLowerCase().includes(keyword))
  );
}

// Check if activity is better for morning
function isMorningActivity(categories, openTime) {
  const morningKeywords = ['museum', 'gallery', 'cultural', 'historic', 'church', 'cathedral'];
  const hasKeyword = categories.some(cat => 
    morningKeywords.some(keyword => cat.name.toLowerCase().includes(keyword))
  );
  return hasKeyword || openTime <= 10;
}

// Check if activity is better for afternoon
function isAfternoonActivity(categories, openTime) {
  const afternoonKeywords = ['park', 'garden', 'outdoor', 'shopping', 'market', 'entertainment'];
  const hasKeyword = categories.some(cat => 
    afternoonKeywords.some(keyword => cat.name.toLowerCase().includes(keyword))
  );
  return hasKeyword || openTime > 10;
}

// Get typical opening time (in hours, 24h format)
function getTypicalOpenTime(hours, categories) {
  console.log('Processing hours data:', JSON.stringify(hours, null, 2));
  
  if (!hours) {
    console.log('No hours data available, using category-based default');
    return getDefaultOpenTimeByCategory(categories);
  }
  
  // Try different possible formats
  let openTimes = [];
  
  // Format 1: hours.regular array
  if (hours.regular && Array.isArray(hours.regular)) {
    console.log('Found regular hours format');
    openTimes = hours.regular
      .filter(day => day.open)
      .map(day => {
        const timeStr = day.open;
        console.log('Parsing time string:', timeStr);
        if (timeStr) {
          // Handle different time formats: "09:00", "9:00", "0900"
          const hour = parseInt(timeStr.replace(':', '').substring(0, 2));
          console.log('Parsed hour:', hour);
          return hour;
        }
        return null;
      })
      .filter(hour => hour !== null);
  }
  
  // Format 2: hours.display (sometimes venues have display format)
  if (openTimes.length === 0 && hours.display) {
    console.log('Trying display format:', hours.display);
    // Try to extract opening time from display string
    const timeMatch = hours.display.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)?/i);
    if (timeMatch) {
      let hour = parseInt(timeMatch[1]);
      const isPM = timeMatch[3] && timeMatch[3].toLowerCase() === 'pm';
      if (isPM && hour !== 12) hour += 12;
      if (!isPM && hour === 12) hour = 0;
      openTimes = [hour];
      console.log('Extracted hour from display:', hour);
    }
  }
  
  // Format 3: Fallback - assign typical hours based on venue type
  if (openTimes.length === 0) {
    console.log('No parseable hours found, using category-based default');
    return getDefaultOpenTimeByCategory(categories);
  }
  
  const avgOpenTime = openTimes.reduce((sum, time) => sum + time, 0) / openTimes.length;
  console.log('Calculated average opening time:', avgOpenTime);
  return Math.round(avgOpenTime);
}

// Get realistic opening times based on venue category
function getDefaultOpenTimeByCategory(categories) {
  if (!categories || categories.length === 0) return 9;
  
  const categoryName = categories[0].name.toLowerCase();
  
  // Bakeries and cafes open early
  if (categoryName.includes('bakery') || categoryName.includes('cafe')) {
    return 7; // 7 AM
  }
  
  // Bars open later
  if (categoryName.includes('bar') || categoryName.includes('wine')) {
    return 16; // 4 PM
  }
  
  // Restaurants vary by type
  if (categoryName.includes('restaurant')) {
    if (categoryName.includes('breakfast') || categoryName.includes('brunch')) {
      return 8; // 8 AM
    }
    return 11; // 11 AM for lunch restaurants
  }
  
  // Museums and cultural sites
  if (categoryName.includes('museum') || categoryName.includes('gallery') || 
      categoryName.includes('cultural') || categoryName.includes('historic')) {
    return 10; // 10 AM
  }
  
  // Entertainment venues
  if (categoryName.includes('cinema') || categoryName.includes('theater') || 
      categoryName.includes('entertainment')) {
    return 14; // 2 PM
  }
  
  // Parks and outdoor spaces
  if (categoryName.includes('park') || categoryName.includes('garden') || 
      categoryName.includes('outdoor')) {
    return 6; // 6 AM (always open)
  }
  
  // Default for everything else
  return 9; // 9 AM
}

// Get typical closing time (in hours, 24h format)
function getTypicalCloseTime(hours, categories) {
  if (!hours) {
    return getDefaultCloseTimeByCategory(categories);
  }
  
  let closeTimes = [];
  
  // Format 1: hours.regular array
  if (hours.regular && Array.isArray(hours.regular)) {
    closeTimes = hours.regular
      .filter(day => day.close)
      .map(day => {
        const timeStr = day.close;
        if (timeStr) {
          const hour = parseInt(timeStr.replace(':', '').substring(0, 2));
          return hour;
        }
        return null;
      })
      .filter(hour => hour !== null);
  }
  
  // Format 2: hours.display fallback
  if (closeTimes.length === 0 && hours.display) {
    // Try to extract closing time from display string (look for second time)
    const times = hours.display.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)?/gi);
    if (times && times.length > 1) {
      const timeMatch = times[1].match(/(\d{1,2}):?(\d{2})?\s*(am|pm)?/i);
      if (timeMatch) {
        let hour = parseInt(timeMatch[1]);
        const isPM = timeMatch[3] && timeMatch[3].toLowerCase() === 'pm';
        if (isPM && hour !== 12) hour += 12;
        if (!isPM && hour === 12) hour = 0;
        closeTimes = [hour];
      }
    }
  }
  
  if (closeTimes.length === 0) return getDefaultCloseTimeByCategory(categories);
  
  const avgCloseTime = closeTimes.reduce((sum, time) => sum + time, 0) / closeTimes.length;
  return Math.round(avgCloseTime);
}

// Get realistic closing times based on venue category
function getDefaultCloseTimeByCategory(categories) {
  if (!categories || categories.length === 0) return 18;
  
  const categoryName = categories[0].name.toLowerCase();
  
  // Bakeries close mid-afternoon
  if (categoryName.includes('bakery')) {
    return 15; // 3 PM
  }
  
  // Cafes close in evening
  if (categoryName.includes('cafe')) {
    return 19; // 7 PM
  }
  
  // Bars stay open late
  if (categoryName.includes('bar') || categoryName.includes('wine')) {
    return 24; // Midnight or later
  }
  
  // Restaurants
  if (categoryName.includes('restaurant')) {
    return 22; // 10 PM
  }
  
  // Museums and cultural sites
  if (categoryName.includes('museum') || categoryName.includes('gallery')) {
    return 17; // 5 PM
  }
  
  // Entertainment venues
  if (categoryName.includes('cinema') || categoryName.includes('theater')) {
    return 23; // 11 PM
  }
  
  // Parks (always open)
  if (categoryName.includes('park') || categoryName.includes('garden')) {
    return 22; // 10 PM (sunset)
  }
  
  // Default
  return 18; // 6 PM
}

// Get typical closing time (in hours, 24h format)
function getTypicalCloseTime(hours) {
  if (!hours) {
    return 18;
  }
  
  let closeTimes = [];
  
  // Format 1: hours.regular array
  if (hours.regular && Array.isArray(hours.regular)) {
    closeTimes = hours.regular
      .filter(day => day.close)
      .map(day => {
        const timeStr = day.close;
        if (timeStr) {
          const hour = parseInt(timeStr.replace(':', '').substring(0, 2));
          return hour;
        }
        return null;
      })
      .filter(hour => hour !== null);
  }
  
  // Format 2: hours.display fallback
  if (closeTimes.length === 0 && hours.display) {
    // Try to extract closing time from display string (look for second time)
    const times = hours.display.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)?/gi);
    if (times && times.length > 1) {
      const timeMatch = times[1].match(/(\d{1,2}):?(\d{2})?\s*(am|pm)?/i);
      if (timeMatch) {
        let hour = parseInt(timeMatch[1]);
        const isPM = timeMatch[3] && timeMatch[3].toLowerCase() === 'pm';
        if (isPM && hour !== 12) hour += 12;
        if (!isPM && hour === 12) hour = 0;
        closeTimes = [hour];
      }
    }
  }
  
  if (closeTimes.length === 0) return 18;
  
  const avgCloseTime = closeTimes.reduce((sum, time) => sum + time, 0) / closeTimes.length;
  return Math.round(avgCloseTime);
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

// Geographical clustering for multi-day trips
function clusterVenuesGeographically(venues, numDays) {
  if (numDays === 1 || venues.length <= numDays) {
    // For single day or few venues, return all venues for each day
    return Array(numDays).fill(venues);
  }
  
  // Prepare data for K-means clustering
  const coordinates = venues.map(venue => [venue.latitude, venue.longitude]);
  
  try {
    // Use K-means to cluster venues into numDays groups
    const result = kmeans(coordinates, numDays, {
      initialization: 'kmeans++',
      maxIterations: 100
    });
    
    // Organize venues by cluster
    const clusters = Array(numDays).fill(null).map(() => []);
    
    result.clusters.forEach((clusterIndex, venueIndex) => {
      if (clusterIndex < numDays) {
        clusters[clusterIndex].push(venues[venueIndex]);
      }
    });
    
    // Ensure each cluster has a reasonable number of venues
    const minVenuesPerDay = Math.floor(venues.length / numDays);
    
    // Redistribute if clusters are too uneven
    for (let i = 0; i < clusters.length; i++) {
      if (clusters[i].length < minVenuesPerDay && venues.length > numDays * 2) {
        // Find the largest cluster and move some venues
        const largestCluster = clusters.reduce((max, cluster, idx) => 
          cluster.length > clusters[max].length ? idx : max, 0
        );
        
        if (clusters[largestCluster].length > minVenuesPerDay + 2) {
          const movedVenues = clusters[largestCluster].splice(-2);
          clusters[i].push(...movedVenues);
        }
      }
    }
    
    console.log('Geographic clustering results:');
    clusters.forEach((cluster, index) => {
      console.log(`Day ${index + 1}: ${cluster.length} venues`);
    });
    
    return clusters;
  } catch (error) {
    console.error('Clustering failed, using round-robin distribution:', error.message);
    
    // Fallback: Round-robin distribution
    const clusters = Array(numDays).fill(null).map(() => []);
    venues.forEach((venue, index) => {
      clusters[index % numDays].push(venue);
    });
    
    return clusters;
  }
}

// Create optimized daily schedule with nearest-neighbor routing
function createOptimizedDailySchedule(restaurants, activities, usedVenues, dayNumber, dayOfWeek) {
  const schedule = [];
  let currentTime = 8; // Start at 8 AM
  
  // Helper function to find available (unused) venues
  const getAvailableVenues = (venueList) => {
    return venueList.filter(venue => !usedVenues.has(venue.fsq_place_id));
  };
  
  // Select venues for the day using nearest-neighbor approach
  const selectedVenues = selectVenuesForDay(restaurants, activities, usedVenues);
  
  if (selectedVenues.length === 0) {
    console.log(`No available venues for day ${dayNumber} (${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek]})`);
    return schedule;
  }
  
  // Optimize the route using nearest-neighbor traveling salesman approach
  const optimizedRoute = optimizeRouteNearestNeighbor(selectedVenues);
  
  // Build schedule following the optimized route
  return buildScheduleFromRoute(optimizedRoute, currentTime, usedVenues);
}

// Select venues for a day ensuring variety and availability
function selectVenuesForDay(restaurants, activities, usedVenues) {
  const availableRestaurants = restaurants.filter(r => !usedVenues.has(r.fsq_place_id));
  const availableActivities = activities.filter(a => !usedVenues.has(a.fsq_place_id));
  
  const selectedVenues = [];
  
  // Always try to select breakfast restaurant (early opening)
  const breakfastPlaces = availableRestaurants.filter(r => r.typicalOpenTime <= 8);
  if (breakfastPlaces.length > 0) {
    selectedVenues.push({ ...breakfastPlaces[0], scheduledType: 'breakfast' });
  } else if (availableRestaurants.length > 0) {
    // Fallback: any restaurant that can serve breakfast
    selectedVenues.push({ ...availableRestaurants[0], scheduledType: 'breakfast' });
  }
  
  // Select 1-2 activities based on availability
  const maxActivities = Math.min(2, availableActivities.length);
  for (let i = 0; i < maxActivities; i++) {
    selectedVenues.push({ ...availableActivities[i], scheduledType: 'activity' });
  }
  
  // Select lunch restaurant (avoid breakfast place)
  const lunchPlaces = availableRestaurants.filter(r => 
    r.typicalOpenTime <= 14 && !selectedVenues.some(v => v.fsq_place_id === r.fsq_place_id)
  );
  if (lunchPlaces.length > 0) {
    selectedVenues.push({ ...lunchPlaces[0], scheduledType: 'lunch' });
  }
  
  // Select dinner restaurant (avoid breakfast and lunch places)
  const dinnerPlaces = availableRestaurants.filter(r => 
    !selectedVenues.some(v => v.fsq_place_id === r.fsq_place_id)
  );
  if (dinnerPlaces.length > 0) {
    selectedVenues.push({ ...dinnerPlaces[0], scheduledType: 'dinner' });
  }
  
  return selectedVenues;
}

// Optimize route using nearest-neighbor algorithm (simplified TSP)
function optimizeRouteNearestNeighbor(venues) {
  if (venues.length <= 1) return venues;
  
  // Separate by type to maintain meal timing
  const breakfast = venues.filter(v => v.scheduledType === 'breakfast');
  const activities = venues.filter(v => v.scheduledType === 'activity');
  const lunch = venues.filter(v => v.scheduledType === 'lunch');
  const dinner = venues.filter(v => v.scheduledType === 'dinner');
  
  let route = [];
  
  // Start with breakfast
  if (breakfast.length > 0) {
    route.push(breakfast[0]);
  }
  
  // Optimize activity order using nearest-neighbor
  if (activities.length > 0) {
    const optimizedActivities = optimizeActivityOrder(activities, route[route.length - 1]);
    route.push(...optimizedActivities);
  }
  
  // Add lunch after activities
  if (lunch.length > 0) {
    route.push(lunch[0]);
  }
  
  // Add any remaining activities
  const remainingActivities = activities.filter(a => !route.includes(a));
  if (remainingActivities.length > 0) {
    const optimizedRemaining = optimizeActivityOrder(remainingActivities, route[route.length - 1]);
    route.push(...optimizedRemaining);
  }
  
  // End with dinner
  if (dinner.length > 0) {
    route.push(dinner[0]);
  }
  
  return route;
}

// Optimize activity order using nearest-neighbor algorithm
function optimizeActivityOrder(activities, startLocation) {
  if (activities.length <= 1) return activities;
  
  const unvisited = [...activities];
  const route = [];
  let currentLocation = startLocation || activities[0];
  
  while (unvisited.length > 0) {
    let nearestIndex = 0;
    let minDistance = Infinity;
    
    // Find nearest unvisited activity
    for (let i = 0; i < unvisited.length; i++) {
      const distance = calculateDistance(
        currentLocation.latitude, currentLocation.longitude,
        unvisited[i].latitude, unvisited[i].longitude
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        nearestIndex = i;
      }
    }
    
    // Add nearest activity to route
    const nearestActivity = unvisited.splice(nearestIndex, 1)[0];
    route.push(nearestActivity);
    currentLocation = nearestActivity;
  }
  
  return route;
}

// Build schedule from optimized route
function buildScheduleFromRoute(route, startTime, usedVenues) {
  const schedule = [];
  let currentTime = startTime;
  
  route.forEach((venue, index) => {
    // Mark venue as used
    usedVenues.add(venue.fsq_place_id);
    
    // Determine appropriate time based on venue type with proper meal timing
    if (venue.scheduledType === 'breakfast') {
      // For breakfast, respect venue opening time but prefer morning hours
      const venueOpenTime = venue.typicalOpenTime || 7;
      const earliestBreakfast = Math.max(currentTime, 7); // Don't start before 7 AM
      currentTime = Math.max(earliestBreakfast, venueOpenTime); // Must respect venue opening time
      // Only limit to 9 AM if venue actually opens before 9 AM
      if (venueOpenTime <= 9) {
        currentTime = Math.min(currentTime, 9);
      }
    } else if (venue.scheduledType === 'lunch') {
      // For lunch, respect venue opening time and lunch timing
      const venueOpenTime = venue.typicalOpenTime || 11;
      const earliestLunch = Math.max(currentTime, 11.5); // Lunch not before 11:30 AM
      currentTime = Math.max(earliestLunch, venueOpenTime); // Must respect venue opening time
      currentTime = Math.min(currentTime, 15); // Lunch not after 3 PM
    } else if (venue.scheduledType === 'dinner') {
      // For dinner, respect venue opening time and dinner timing
      const venueOpenTime = venue.typicalOpenTime || 17;
      const earliestDinner = Math.max(currentTime, 18); // Dinner not before 6 PM
      currentTime = Math.max(earliestDinner, venueOpenTime); // Must respect venue opening time
      currentTime = Math.min(currentTime, 21); // Dinner not after 9 PM
    } else {
      // Activity - ensure venue is open and reasonable timing
      currentTime = Math.max(currentTime, venue.typicalOpenTime || 10);
    }
    
    // Calculate duration
    const duration = getActivityDuration(venue.categories, venue.scheduledType);
    const endTime = currentTime + duration / 60;
    
    schedule.push({
      time: formatTime(currentTime),
      type: venue.scheduledType,
      place: venue,
      actualOpenTime: venue.typicalOpenTime,
      duration: `${duration} minutes`,
      endTime: formatTime(endTime)
    });
    
    // Update current time with buffer for travel
    currentTime = endTime + 0.5; // 30-minute buffer
  });
  
  return schedule;
}

// Check if a venue is open on a specific day of the week
function isVenueOpenOnDay(venue, dayOfWeek) {
  // dayOfWeek: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  
  // If no detailed hours data, use intelligent category-based defaults
  if (!venue.hours || !venue.hours.regular || !Array.isArray(venue.hours.regular)) {
    return getDefaultAvailabilityByCategory(venue.categories, dayOfWeek);
  }
  
  // Check if venue has hours for this specific day
  const todayHours = venue.hours.regular.find(dayHours => {
    // Foursquare uses different day numbering: 1 = Monday, 2 = Tuesday, ..., 7 = Sunday
    const foursquareDayMap = {
      0: 7, // Sunday
      1: 1, // Monday  
      2: 2, // Tuesday
      3: 3, // Wednesday
      4: 4, // Thursday
      5: 5, // Friday
      6: 6  // Saturday
    };
    
    return dayHours.day === foursquareDayMap[dayOfWeek];
  });
  
  if (!todayHours) {
    console.log(`${venue.name} has no hours listed for ${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek]}, using category defaults`);
    return getDefaultAvailabilityByCategory(venue.categories, dayOfWeek);
  }
  
  // Check if venue has opening time (if no open time, likely closed)
  if (!todayHours.open || !todayHours.close) {
    console.log(`${venue.name} appears to be closed on ${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek]} (no open/close times)`);
    return false;
  }
  
  console.log(`${venue.name} is open on ${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek]}: ${todayHours.open} - ${todayHours.close}`);
  return true;
}

// Get default availability based on venue category and day of week
function getDefaultAvailabilityByCategory(categories, dayOfWeek) {
  if (!categories || categories.length === 0) return true;
  
  const primaryCategory = categories[0].name.toLowerCase();
  
  // Museums often closed on Mondays
  if (primaryCategory.includes('museum') || primaryCategory.includes('gallery')) {
    if (dayOfWeek === 1) { // Monday
      console.log('Museum/Gallery: typically closed on Monday');
      return false;
    }
    return true;
  }
  
  // Many restaurants closed on Sundays or Mondays
  if (primaryCategory.includes('restaurant') || primaryCategory.includes('bistro')) {
    if (dayOfWeek === 0 || dayOfWeek === 1) { // Sunday or Monday
      console.log('Restaurant: may be closed on Sunday/Monday, but allowing as fallback');
      return true; // Allow as fallback, but with lower priority
    }
    return true;
  }
  
  // Bars and nightlife often closed on Sundays/Mondays  
  if (primaryCategory.includes('bar') || primaryCategory.includes('nightlife')) {
    if (dayOfWeek === 0 || dayOfWeek === 1) { // Sunday or Monday
      console.log('Bar: may be closed on Sunday/Monday');
      return false;
    }
    return true;
  }
  
  // Government buildings, banks typically closed weekends
  if (primaryCategory.includes('government') || primaryCategory.includes('bank')) {
    if (dayOfWeek === 0 || dayOfWeek === 6) { // Sunday or Saturday
      console.log('Government/Bank: typically closed on weekends');
      return false;
    }
    return true;
  }
  
  // Default: assume open
  return true;
}

// Generate clean, formatted trip output file
function generateCleanTripOutput(trip, filename = null) {
  const fs = require('fs');
  const path = require('path');
  
  // Create filename if not provided
  if (!filename) {
    const date = new Date().toISOString().split('T')[0];
    const time = new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
    filename = `trip_${date}_${time}.md`;
  }
  
  // Ensure filename ends with .md
  if (!filename.endsWith('.md')) {
    filename += '.md';
  }
  
  const outputPath = path.join(__dirname, 'output_trips', filename);
  
  // Generate clean markdown content
  let content = '';
  
  // Header
  content += `# 🌟 Trip to ${trip.preferences.location || 'Your Destination'}\n\n`;
  content += `**Generated on:** ${new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })}\n\n`;
  
  // Trip Overview
  content += `## 📋 Trip Overview\n\n`;
  content += `- **Destination:** ${trip.preferences.location || 'Not specified'}\n`;
  content += `- **Duration:** ${trip.preferences.duration || 'Not specified'} ${trip.preferences.duration === 1 ? 'day' : 'days'}\n`;
  content += `- **Travel Style:** ${trip.preferences.pace || 'Not specified'} pace\n`;
  content += `- **Budget Level:** ${trip.preferences.budget || 'Not specified'}\n`;
  content += `- **Interests:** ${trip.preferences.categories ? trip.preferences.categories.join(', ') : 'General exploration'}\n`;
  content += `- **Travel Companions:** ${trip.preferences.companionType || 'Not specified'}\n\n`;
  
  // Daily Itinerary
  content += `## 🗓️ Daily Itinerary\n\n`;
  
  trip.itinerary.forEach((day, index) => {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date();
    const dayOfWeek = dayNames[(today.getDay() + index) % 7];
    
    content += `### Day ${day.day} - ${dayOfWeek}\n\n`;
    
    day.schedule.forEach((activity, actIndex) => {
      const icon = getActivityIcon(activity.type);
      content += `#### ${icon} ${activity.time} - ${activity.endTime}\n`;
      content += `**${formatActivityType(activity.type)}:** ${activity.place.name}\n\n`;
      
      // Location details
      if (activity.place.location && activity.place.location.formatted_address) {
        content += `📍 **Address:** ${activity.place.location.formatted_address}\n`;
      }
      
      // Categories
      if (activity.place.categories && activity.place.categories.length > 0) {
        const categoryNames = activity.place.categories.map(cat => cat.name).join(', ');
        content += `🏷️ **Type:** ${categoryNames}\n`;
      }
      
      // Duration
      content += `⏱️ **Duration:** ${activity.duration}\n`;
      
      // Contact info
      if (activity.place.tel) {
        content += `📞 **Phone:** ${activity.place.tel}\n`;
      }
      
      if (activity.place.website) {
        content += `🌐 **Website:** ${activity.place.website}\n`;
      }
      
      // Opening hours info
      if (activity.place.typicalOpenTime && activity.place.typicalCloseTime) {
        const openTime = formatTime(activity.place.typicalOpenTime);
        const closeTime = formatTime(activity.place.typicalCloseTime);
        content += `🕐 **Typical Hours:** ${openTime} - ${closeTime}\n`;
      }
      
      // Rating or distance
      if (activity.place.distance) {
        content += `📏 **Distance from center:** ${activity.place.distance}m\n`;
      }
      
      content += `\n`;
      
      // Add travel time note if not the last activity
      if (actIndex < day.schedule.length - 1) {
        content += `*🚶 Travel time to next location included in schedule*\n\n`;
      }
    });
    
    content += `---\n\n`;
  });
  
  // Trip Tips
  content += `## 💡 Trip Tips\n\n`;
  content += `- All times include 30-minute travel buffers between activities\n`;
  content += `- Venues are scheduled according to their opening hours\n`;
  content += `- Activities are optimized for minimal travel distance\n`;
  content += `- Call ahead to confirm opening hours and availability\n`;
  content += `- Consider booking popular restaurants and attractions in advance\n\n`;
  
  // Footer
  content += `---\n`;
  content += `*Generated by TripMate - Your AI Travel Planning Assistant*\n`;
  
  // Write file
  try {
    fs.writeFileSync(outputPath, content, 'utf8');
    console.log(`\n✅ Clean trip output saved to: ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error('❌ Error saving trip output:', error.message);
    return null;
  }
}

// Helper function to get activity icons
function getActivityIcon(type) {
  const icons = {
    'breakfast': '🥐',
    'lunch': '🍽️', 
    'dinner': '🍷',
    'activity': '🎯',
    'museum': '🏛️',
    'restaurant': '🍴',
    'cafe': '☕',
    'bar': '🍻',
    'shopping': '🛍️',
    'park': '🌳',
    'entertainment': '🎭',
    'culture': '🎨'
  };
  return icons[type] || '📍';
}

// Helper function to format activity types
function formatActivityType(type) {
  const formatted = {
    'breakfast': 'Breakfast',
    'lunch': 'Lunch', 
    'dinner': 'Dinner',
    'activity': 'Activity'
  };
  return formatted[type] || type.charAt(0).toUpperCase() + type.slice(1);
}

/**
 * ================================
 * Express Server Setup
 * ================================
 */

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('frontend'));

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Main trip generation endpoint
app.post('/generate-trip', async (req, res) => {
  try {
    console.log('=== TRIP GENERATION REQUEST ===');
    console.log('Request body:', req.body);
    
    const { 
      destination, 
      days: numberOfDays, 
      userInput, 
      latitude, 
      longitude 
    } = req.body;

    // Validate required parameters
    if (!destination || !numberOfDays || !userInput) {
      return res.status(400).json({ 
        error: 'Missing required parameters: destination, days, or userInput' 
      });
    }

    console.log(`Generating ${numberOfDays}-day trip for ${destination}`);
    console.log(`User preferences: ${userInput}`);

    // Use the existing generateTrip function
    const tripData = await generateTrip(userInput);

    if (!tripData) {
      return res.status(500).json({ 
        error: 'Failed to generate trip data' 
      });
    }

    console.log('Trip generation successful');

    // Generate clean output file if needed
    try {
      generateCleanTripOutput(tripData, `${destination.toLowerCase().replace(/\s+/g, '_')}_${numberOfDays}day_trip.md`);
    } catch (outputError) {
      console.error('Error generating output file:', outputError.message);
    }

    // Send the response
    res.json({
      success: true,
      destination: destination,
      numberOfDays: numberOfDays,
      tripData: tripData
    });

  } catch (error) {
    console.error('Error generating trip:', error);
    res.status(500).json({ 
      error: 'Failed to generate trip',
      details: error.message 
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString()
  });
});

// Start the server
const server = app.listen(PORT, () => {
  console.log(`🚀 TripMate server running on http://localhost:${PORT}`);
  console.log(`📁 Frontend served from: ${path.join(__dirname, 'frontend')}`);
  console.log(`📂 Trip outputs saved to: ${path.join(__dirname, 'output_trips')}`);
  console.log(`🛠️ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('✅ Server started successfully!');
});

// Handle server errors
server.on('error', (error) => {
  console.error('❌ Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please stop any existing servers or use a different port.`);
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Export the app
module.exports = app;