import React from 'react';
import { TripFormData } from './CreateTrip';

interface ReviewStepProps {
  data: TripFormData;
  errors: Record<string, string>;
  onSubmit: () => void;
  loading: boolean;
}

const ReviewStep: React.FC<ReviewStepProps> = ({ data, errors, onSubmit, loading }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTripDuration = () => {
    if (!data.startDate || !data.endDate) return 0;
    return Math.ceil((new Date(data.endDate).getTime() - new Date(data.startDate).getTime()) / (1000 * 60 * 60 * 24));
  };

  const getBudgetLabel = (budget: string) => {
    switch (budget) {
      case 'low': return 'Budget-Friendly (Under $100/day)';
      case 'medium': return 'Moderate ($100-250/day)';
      case 'high': return 'Luxury ($250+/day)';
      default: return budget;
    }
  };

  const getPaceLabel = (pace: string) => {
    switch (pace) {
      case 'relaxed': return 'Relaxed - Take it easy';
      case 'moderate': return 'Moderate - Balanced mix';
      case 'active': return 'Active - Packed schedule';
      default: return pace;
    }
  };

  const getInterestLabel = (interest: string) => {
    const interestMap: Record<string, string> = {
      'culture': 'Culture & History',
      'food': 'Food & Dining',
      'nature': 'Nature & Outdoors',
      'adventure': 'Adventure Sports',
      'relaxation': 'Relaxation & Spa',
      'nightlife': 'Nightlife & Entertainment',
      'shopping': 'Shopping',
      'art': 'Art & Museums',
      'architecture': 'Architecture',
      'photography': 'Photography',
    };
    return interestMap[interest] || interest;
  };

  const getCategoryLabel = (category: string) => {
    const categoryMap: Record<string, string> = {
      'restaurants': 'Restaurants',
      'attractions': 'Tourist Attractions',
      'entertainment': 'Entertainment',
      'shopping': 'Shopping',
      'outdoor': 'Outdoor Activities',
      'museums': 'Museums & Galleries',
      'wellness': 'Wellness & Spa',
      'sports': 'Sports & Recreation',
      'transportation': 'Transportation',
      'nightlife': 'Nightlife',
      'cultural': 'Cultural Experiences',
      'beaches': 'Beaches & Water',
    };
    return categoryMap[category] || category;
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Your Trip</h2>
        <p className="text-gray-600">
          Please review your trip details before we generate your personalized itinerary
        </p>
      </div>

      {/* Trip Overview Card */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <svg className="h-8 w-8 text-blue-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <h3 className="text-xl font-bold text-gray-900">{data.destination} Adventure</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Duration:</span>
            <p className="text-gray-900">{getTripDuration()} days</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Travelers:</span>
            <p className="text-gray-900">{data.travelers} {data.travelers === 1 ? 'person' : 'people'}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Budget:</span>
            <p className="text-gray-900">{getBudgetLabel(data.budget)}</p>
          </div>
        </div>
      </div>

      {/* Detailed Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <svg className="h-5 w-5 text-gray-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Trip Details
          </h4>
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-700">Destination:</span>
              <p className="text-gray-900">{data.destination}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">Start Date:</span>
              <p className="text-gray-900">{formatDate(data.startDate)}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">End Date:</span>
              <p className="text-gray-900">{formatDate(data.endDate)}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">Travel Pace:</span>
              <p className="text-gray-900">{getPaceLabel(data.pace)}</p>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <svg className="h-5 w-5 text-gray-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            Interests
          </h4>
          <div className="flex flex-wrap gap-2">
            {data.interests.map((interest) => (
              <span
                key={interest}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {getInterestLabel(interest)}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <svg className="h-5 w-5 text-gray-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          Activity Categories ({data.categories.length})
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {data.categories.map((category) => (
            <span
              key={category}
              className="inline-flex items-center px-3 py-2 rounded-md text-sm font-medium bg-green-100 text-green-800 border border-green-200"
            >
              {getCategoryLabel(category)}
            </span>
          ))}
        </div>
      </div>

      {/* Next Steps Preview */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
        <h4 className="text-lg font-medium text-amber-900 mb-3 flex items-center">
          <svg className="h-5 w-5 text-amber-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          What Happens Next?
        </h4>
        <div className="space-y-2 text-sm text-amber-800">
          <p>• We'll create a personalized itinerary based on your preferences</p>
          <p>• You'll be able to view and modify your trip on the dashboard</p>
          <p>• Use our AI chat assistant to make further adjustments</p>
          <p>• Add, remove, or rearrange activities as needed</p>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-center pt-6">
        <button
          type="button"
          onClick={onSubmit}
          disabled={loading}
          className={`px-8 py-3 text-lg font-medium rounded-lg flex items-center ${
            loading
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 shadow-lg hover:shadow-xl transition-all'
          }`}
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating Your Trip...
            </>
          ) : (
            <>
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create My Trip
            </>
          )}
        </button>
      </div>

      {/* Error Display */}
      {errors.submit && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800 text-sm">{errors.submit}</p>
        </div>
      )}
    </div>
  );
};

export default ReviewStep;
