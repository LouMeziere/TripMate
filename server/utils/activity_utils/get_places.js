/* There are two types of activities that are retrieved: meals and other activities
*/

const { searchPlaces } = require('../../../integrations/foursquareAPI');

// Define keywords for types of meals and types of places where you eat
const mealKeywords = ['breakfast', 'lunch', 'dinner'];
const foodKeywords = ['restaurant','cafe','bar','food','bistro','brasserie','pizzeria','bakery','coffee','diner','pub','grill','eatery','steakhouse','sushi','pizza','burger','sandwich','snack','wine','cocktail','buffet','canteen','kitchen','deli','patissier','salad','ice cream','gelato','creperie','tea','chocolat','tapas','brewery','gastropub','rotisserie','meat','noodle','ramen','wok','pasta','shawarma','kebab','taverne','tavern','tortilla','tortilleria','boulangerie','fromagerie','cheese','charcuterie','rotisserie','boulanger','patisserie','pâtisserie','glacier','traiteur','épicerie','epicerie','foodtruck','food truck','food court','salle à manger','salle a manger','cuisine','cuisines','caterer','catering','buffet','cafeteria','cafétéria','lunch','dégustation','degustation','déguster','deguster','dégustez','degustez','dégustations','degustations','dégustant','degustant','dégustée','degustee','dégustées','degustees','dégusteur','degusteur','dégusteurs','degusteurs','dégustatrice','degustatrice','dégustatrices','degustatrices','dégusté','deguste','dégustés','degustes','dégustée','degustee','dégustées','degustees','dégusteur','degusteur','dégusteurs','degusteurs','dégustatrice','degustatrice','dégustatrices','degustatrices','dégusté','deguste','dégustés','degustes','dégustée','degustee','dégustées','degustees','dégusteur','degusteur','dégusteurs','degusteurs','dégustatrice','degustatrice','dégustatrices','degustatrices'];

// Helper function to assign unique IDs to places
function assignUniqueIds(places) {
  return places.map(place => ({
    ...place,
    uniqueId: place.fsq_place_id || place.id || place._id || place.name || `unknown_${Math.random().toString(36).substring(7)}`
  }));
}

async function getRestaurants(tripPreferences) {
// Always query Foursquare with 'breakfast', 'lunch', 'dinner'
  let allPlaces = [];
  let mealPlaces = {};
  for (const meal of mealKeywords) {
    console.log(`Searching for ${meal} places...`);
    const params = {
      query: meal,
      near: tripPreferences.location,
      limit: 10
    };
    try {
      const places = await searchPlaces(params);
      console.log(`Found ${places.length} ${meal} places`);
      // Assign unique IDs to places
      const placesWithIds = assignUniqueIds(places);
      mealPlaces[meal] = placesWithIds;
      allPlaces = allPlaces.concat(placesWithIds);
    } catch (e) {
      console.error(`Error searching for ${meal}:`, e.message);
      mealPlaces[meal] = [];
      continue;
    }
  }

  console.log('findRestaurants returning:', { totalPlaces: allPlaces.length, mealPlaces: Object.keys(mealPlaces).map(k => `${k}: ${mealPlaces[k].length}`) });
  return { allPlaces, mealPlaces};
}

function isFoodRelated(place) {
  const name = (place.name || '').toLowerCase();
  const categories = (place.categories || []).map(cat => (cat.name || '').toLowerCase());
  return foodKeywords.some(keyword => name.includes(keyword) || categories.some(cat => cat.includes(keyword)));
}







async function getActivities(tripPreferences) {
  // Step 3: For each other category, treat as activity/interest
  const activityCategories = tripPreferences.categories.filter(
    cat => !mealKeywords.includes(cat.toLowerCase())
  );
  console.log('STEP 3: activityCategories', activityCategories);
  let activityPlaces = {};
  let allActivityPlaces = []; // Create a separate array for activity places
  // Foursquare food/restaurant category IDs to exclude (examples: 13065 = Restaurant, 13099 = Food Court, 13145 = Café)
  const foodCategoryIds = '13065,13099,13145';
  
  for (const activity of activityCategories) {
    const params = {
      query: activity,
      near: tripPreferences.location,
      limit: 10,
      exclude_fsq_category_ids: foodCategoryIds
    };
    try {
      let places = await searchPlaces(params);
      // Post-filter out food-related places
      places = places.filter(place => !isFoodRelated(place));
      // Assign unique IDs to places
      const placesWithIds = assignUniqueIds(places);
      activityPlaces[activity] = placesWithIds;
      allActivityPlaces = allActivityPlaces.concat(placesWithIds);
    } catch (e) {
      activityPlaces[activity] = [];
      continue;
    }
  }
  console.log('STEP 3: activityPlaces', activityPlaces);
  return { activityPlaces, allActivityPlaces };
}



module.exports = {
  foodKeywords,
  isFoodRelated,
  getRestaurants,
  getActivities,
  assignUniqueIds
};