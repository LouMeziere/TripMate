/**
 * Trip data formatting utility
 * Transforms complex Foursquare data to simple trip format
 */

// Simple function to transform complex Foursquare data to simple format
function transformToSimpleFormat(complexTrip) {
  return {
    title: `Trip to ${complexTrip.preferences?.location || 'Unknown'}`,
    destination: complexTrip.preferences?.location || 'Unknown',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + (complexTrip.preferences?.duration || 3) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    travelers: complexTrip.preferences?.travelers || 1,
    budget: complexTrip.preferences?.budget || 'medium',
    pace: complexTrip.preferences?.pace || 'moderate',
    categories: complexTrip.preferences?.categories || ['general'],
    status: 'planned',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    itinerary: complexTrip.itinerary.map(day => ({
      day: day.day,
      activities: day.activities.map(activity => ({
        name: activity.name || 'Unknown Activity',
        category: activity.type || activity.category || 'activity',
        duration: activity.duration || '1-2 hours',
        address: activity.location?.formatted_address || activity.address || 'Address not available',
        rating: activity.rating || 4.0,
        description: activity.description || `${activity.categories?.[0]?.name || 'Popular'} location`,
        ...(activity.tel && { tel: activity.tel }),
        price: activity.price?.tier || 2,
        scheduledTime: activity.time
      }))
    }))
  };
}

module.exports = {
  transformToSimpleFormat
};
