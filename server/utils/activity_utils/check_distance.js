// Distance


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

// Find the nearest place to a given location from a list of places
function findNearestPlace(targetLat, targetLon, places) {
  if (!places || places.length === 0) return null;
  
  let nearestPlace = places[0];
  let nearestDistance = calculateDistance(
    targetLat, targetLon,
    nearestPlace.latitude, nearestPlace.longitude
  );
  
  for (let i = 1; i < places.length; i++) {
    const distance = calculateDistance(
      targetLat, targetLon,
      places[i].latitude, places[i].longitude
    );
    
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestPlace = places[i];
    }
  }
  
  return nearestPlace;
}

module.exports = { findNearestPlace };
