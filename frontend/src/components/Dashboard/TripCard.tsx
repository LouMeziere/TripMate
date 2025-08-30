import React from 'react';
import { Trip } from '../../services/api';

interface TripCardProps {
  trip: Trip;
  onSelect?: (trip: Trip) => void;
  onDelete?: (tripId: string) => void;
}

const TripCard: React.FC<TripCardProps> = ({ trip, onSelect, onDelete }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getDurationDays = () => {
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned':
        return 'bg-blue-100 text-blue-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getBudgetIcon = (budget: string) => {
    switch (budget) {
      case 'low':
        return '$';
      case 'medium':
        return '$$';
      case 'high':
        return '$$$';
      default:
        return '$';
    }
  };

  const isUpcoming = () => {
    return new Date(trip.startDate) > new Date();
  };

  const isCurrent = () => {
    const now = new Date();
    return new Date(trip.startDate) <= now && new Date(trip.endDate) >= now;
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 relative">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{trip.title}</h3>
            <p className="text-gray-600 text-sm flex items-center">
              <span className="material-symbols-outlined text-base mr-1">location_on</span>
              {trip.destination}
            </p>
          </div>
        </div>
        <span className={`absolute top-4 right-4 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(trip.status)}`}>
          {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
        </span>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Dates */}
        <div className="flex items-center mb-3">
          <span className="material-symbols-outlined text-base mr-2 text-gray-400">calendar_month</span>
          <span className="text-sm text-gray-600">
            {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
          </span>
          <span className="ml-2 text-xs text-gray-500">
            ({getDurationDays()} day{getDurationDays() !== 1 ? 's' : ''})
          </span>
        </div>

        {/* Trip Details */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            {/* Travelers */}
            <span className="flex items-center">
              <span className="material-symbols-outlined text-base mr-1">group</span>
              {trip.travelers} {trip.travelers === 1 ? 'traveler' : 'travelers'}
            </span>

            {/* Budget */}
            <span className="flex items-center">
              <span className="text-green-600 font-medium mr-1">{getBudgetIcon(trip.budget)}</span>
              {trip.budget}
            </span>

            {/* Pace */}
            <span className="flex items-center">
              <span className="material-symbols-outlined text-base mr-1">bolt</span>
              {trip.pace}
            </span>
          </div>
        </div>

        {/* Categories */}
        {trip.categories && trip.categories.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {trip.categories.slice(0, 3).map((category) => (
                <span
                  key={category}
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
                >
                  {category}
                </span>
              ))}
              {trip.categories.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                  +{trip.categories.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Status Indicators */}
        {isCurrent() && (
          <div className="mb-4 p-2 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-700 text-sm font-medium">🌟 Currently on this trip!</p>
          </div>
        )}

        {isUpcoming() && (
          <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-blue-700 text-sm">
              ✈️ Starts in {Math.ceil((new Date(trip.startDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 py-3 bg-gray-50 flex justify-between items-center">
        <button
          onClick={() => onSelect?.(trip)}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
        >
          View Details
        </button>
        
        <div className="flex space-x-2">
          {onDelete && (
            <button
              onClick={() => onDelete(trip.id)}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
              title="Delete trip"
            >
              <span className="material-symbols-outlined text-base">delete</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TripCard;
