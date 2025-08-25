// Main trip generation logic
const { sortByProximity } = require('./activityUtils');

// Generate a trip object based on user input
async function generateTrip(userInput, processUserInput, searchPlaces) {
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
		try {
			const places = await searchPlaces(params);
			allPlaces = allPlaces.concat(places);
		} catch (e) {
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

module.exports = {
	generateTrip,
	createBalancedItinerary,
	groupPlacesByType
};

