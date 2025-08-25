// Helper functions: proximity checks, time allocation, etc.

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

module.exports = {
	sortByProximity,
	calculateDistance
};