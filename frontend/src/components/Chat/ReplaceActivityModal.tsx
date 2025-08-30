import React, { useState } from 'react';
import { SearchResult } from './ChatMessage';

interface Activity {
  name: string;
  category: string;
  duration: string;
  address: string;
  rating: number;
  description?: string;
  scheduledTime?: string;
}

interface DayPlan {
  day: number;
  activities: Activity[];
}

interface ReplaceActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  place: SearchResult | null;
  tripId: string;
  tripTitle: string;
  itinerary: DayPlan[];
  onReplaceActivity: (dayNumber: number, activityIndex: number, place: SearchResult) => Promise<void>;
}

const ReplaceActivityModal: React.FC<ReplaceActivityModalProps> = ({
  isOpen,
  onClose,
  place,
  tripId,
  tripTitle,
  itinerary,
  onReplaceActivity
}) => {
  const [selectedActivity, setSelectedActivity] = useState<{
    dayNumber: number;
    activityIndex: number;
    activity: Activity;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !place) return null;

  const handleSubmit = async () => {
    if (!selectedActivity || !place) return;
    
    setIsSubmitting(true);
    try {
      await onReplaceActivity(
        selectedActivity.dayNumber, 
        selectedActivity.activityIndex, 
        place
      );
      onClose();
    } catch (error) {
      console.error('Failed to replace activity:', error);
      // Error handling is done in parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dayNumber: number) => {
    // This would ideally use the actual trip start date
    return `Day ${dayNumber}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Replace Activity</h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* New Place Info */}
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="text-sm font-medium text-green-800 mb-2">Replacing with:</h3>
            <div className="space-y-1">
              <h4 className="font-medium text-gray-900">{place.name}</h4>
              <p className="text-sm text-gray-600">{place.category}</p>
              <p className="text-sm text-gray-500">{place.address}</p>
              {place.rating && (
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">{place.rating}/5</span>
                </div>
              )}
            </div>
          </div>

          {/* Trip Info */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Trip:</h4>
            <p className="text-gray-900 font-medium">{tripTitle}</p>
          </div>

          {/* Activity Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Activity to Replace
            </label>
            
            {itinerary.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No activities in your itinerary yet.</p>
                <p className="text-sm mt-1">Try adding this place to your trip instead!</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-64 overflow-y-auto">
                {itinerary.map((dayPlan) => (
                  <div key={dayPlan.day} className="border border-gray-200 rounded-lg p-4">
                    <h5 className="font-medium text-gray-900 mb-3">
                      {formatDate(dayPlan.day)}
                    </h5>
                    
                    {dayPlan.activities.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">No activities planned</p>
                    ) : (
                      <div className="space-y-2">
                        {dayPlan.activities.map((activity, activityIndex) => (
                          <button
                            key={activityIndex}
                            onClick={() => setSelectedActivity({
                              dayNumber: dayPlan.day,
                              activityIndex,
                              activity
                            })}
                            disabled={isSubmitting}
                            className={`w-full text-left p-3 rounded-lg border transition-colors ${
                              selectedActivity?.dayNumber === dayPlan.day && 
                              selectedActivity?.activityIndex === activityIndex
                                ? 'bg-red-50 border-red-300 ring-2 ring-red-200'
                                : 'bg-white border-gray-200 hover:border-red-200 hover:bg-red-50'
                            } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <h6 className="font-medium text-gray-900 truncate">
                                  {activity.name}
                                </h6>
                                <p className="text-sm text-gray-600 mt-1">
                                  {activity.category} • {activity.duration}
                                </p>
                                {activity.scheduledTime && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    {activity.scheduledTime}
                                  </p>
                                )}
                              </div>
                              {selectedActivity?.dayNumber === dayPlan.day && 
                               selectedActivity?.activityIndex === activityIndex && (
                                <div className="ml-3 text-red-600">
                                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected Activity Preview */}
          {selectedActivity && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="text-sm font-medium text-red-800 mb-2">Will replace:</h4>
              <div className="space-y-1">
                <p className="font-medium text-gray-900">{selectedActivity.activity.name}</p>
                <p className="text-sm text-gray-600">
                  {formatDate(selectedActivity.dayNumber)} • {selectedActivity.activity.category}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedActivity}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                Replacing...
              </>
            ) : (
              'Replace Activity'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReplaceActivityModal;
