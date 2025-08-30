import React from 'react';
import { Trip } from '../../services/api';
import TripCard from './TripCard';

interface TripListProps {
  trips: Trip[];
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  onTripSelect?: (trip: Trip) => void;
  onTripEdit?: (trip: Trip) => void;
  onTripDelete?: (tripId: string) => void;
  onTripPromote?: (tripId: string) => void;
  onTripDemote?: (tripId: string) => void;
}

const TripList: React.FC<TripListProps> = ({
  trips,
  loading = false,
  error = null,
  emptyMessage = "No trips found",
  onTripSelect,
  onTripEdit,
  onTripDelete,
  onTripPromote,
  onTripDemote
}) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {/* Loading skeleton */}
        {[...Array(3)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="h-5 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                </div>
                <div className="h-6 bg-gray-300 rounded-full w-16"></div>
              </div>
            </div>
            <div className="p-4">
              <div className="h-4 bg-gray-300 rounded w-2/3 mb-3"></div>
              <div className="flex space-x-4 mb-4">
                <div className="h-4 bg-gray-300 rounded w-20"></div>
                <div className="h-4 bg-gray-300 rounded w-16"></div>
                <div className="h-4 bg-gray-300 rounded w-18"></div>
              </div>
              <div className="flex gap-1 mb-4">
                <div className="h-6 bg-gray-300 rounded w-16"></div>
                <div className="h-6 bg-gray-300 rounded w-20"></div>
                <div className="h-6 bg-gray-300 rounded w-14"></div>
              </div>
            </div>
            <div className="px-4 py-3 bg-gray-50 flex justify-between items-center">
              <div className="h-4 bg-gray-300 rounded w-20"></div>
              <div className="flex space-x-2">
                <div className="h-6 w-6 bg-gray-300 rounded"></div>
                <div className="h-6 w-6 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div className="flex flex-col items-center">
          <span className="material-symbols-outlined text-5xl text-red-400 mb-4">warning</span>
          <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Trips</h3>
          <p className="text-red-600 text-sm">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!trips || trips.length === 0) {
    return (
      <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
        <div className="flex flex-col items-center">
          <span className="material-symbols-outlined text-6xl text-gray-400 mb-4">exploring</span>
          <h3 className="text-lg font-medium text-gray-900 mb-2">{emptyMessage}</h3>
          <p className="text-gray-500 text-sm mb-6">
            Get started by creating your first trip to explore amazing destinations!
          </p>
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
            Plan Your First Trip
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {trips.map((trip) => (
        <TripCard
          key={trip.id}
          trip={trip}
          onSelect={onTripSelect}
          onDelete={onTripDelete}
          onPromote={onTripPromote}
          onDemote={onTripDemote}
        />
      ))}
    </div>
  );
};

export default TripList;
