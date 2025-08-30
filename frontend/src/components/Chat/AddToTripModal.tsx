import React, { useState } from 'react';
import { SearchResult } from './ChatMessage';

interface AddToTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  place: SearchResult | null;
  tripId: string;
  tripTitle: string;
  tripDays: number;
  onAddToTrip: (day: number, place: SearchResult) => Promise<void>;
}

const AddToTripModal: React.FC<AddToTripModalProps> = ({
  isOpen,
  onClose,
  place,
  tripId,
  tripTitle,
  tripDays,
  onAddToTrip
}) => {
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !place) return null;

  const handleSubmit = async () => {
    if (!place || selectedDay < 1 || selectedDay > tripDays) return;
    
    setIsSubmitting(true);
    try {
      await onAddToTrip(selectedDay, place);
      onClose();
    } catch (error) {
      console.error('Failed to add to trip:', error);
      // Error handling is done in parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Add to Trip</h2>
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
          {/* Place Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">{place.name}</h3>
            <p className="text-sm text-gray-600 mb-1">{place.category}</p>
            <p className="text-sm text-gray-500">{place.address}</p>
            {place.rating && (
              <div className="flex items-center mt-2">
                <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-sm font-medium text-gray-700">{place.rating}/5</span>
              </div>
            )}
          </div>

          {/* Trip Info */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Adding to:</h4>
            <p className="text-gray-900 font-medium">{tripTitle}</p>
          </div>

          {/* Day Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Day
            </label>
            <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
              {Array.from({ length: tripDays }, (_, i) => i + 1).map((day) => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  disabled={isSubmitting}
                  className={`p-3 rounded-lg border transition-colors ${
                    selectedDay === day
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300 hover:bg-blue-50'
                  } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Day {day}
                </button>
              ))}
            </div>
          </div>
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
            disabled={isSubmitting || !selectedDay}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                Adding...
              </>
            ) : (
              'Add to Trip'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddToTripModal;
