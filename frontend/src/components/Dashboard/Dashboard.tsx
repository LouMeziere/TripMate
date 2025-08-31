import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTrips } from '../../hooks/useTrips';
import TripList from './TripList';
import { Trip } from '../../services/api';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { 
    trips, 
    loading, 
    error, 
    fetchTrips, 
    deleteTrip,
    getUpcomingTrips,
    getCurrentTrips,
    getPastTrips,
    getDraftTrips,
    getActiveTrips,
    promoteDraftTrip,
    demoteTripToDraft
  } = useTrips();

  const [activeFilter, setActiveFilter] = useState<'all' | 'drafts' | 'upcoming' | 'current' | 'past'>('all');

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const handleTripSelect = (trip: Trip) => {
    // Navigate to trip details page
    navigate(`/trip/${trip.id}`);
  };

  const handleTripEdit = (trip: Trip) => {
    // TODO: Navigate to trip edit page or open edit modal
    console.log('Edit trip:', trip);
  };

  const handleTripDelete = async (tripId: string) => {
    if (window.confirm('Are you sure you want to delete this trip?')) {
      try {
        await deleteTrip(tripId);
      } catch (error) {
        console.error('Failed to delete trip:', error);
      }
    }
  };

  const handleTripPromote = async (tripId: string) => {
    if (window.confirm('Make this draft trip active?')) {
      try {
        await promoteDraftTrip(tripId);
      } catch (error) {
        console.error('Failed to promote trip:', error);
      }
    }
  };

  const handleTripDemote = async (tripId: string) => {
    if (window.confirm('Move this trip back to drafts?')) {
      try {
        await demoteTripToDraft(tripId);
      } catch (error) {
        console.error('Failed to demote trip:', error);
      }
    }
  };

  const handleCreateTrip = () => {
    navigate('/create-trip');
  };

  const getFilteredTrips = () => {
    switch (activeFilter) {
      case 'drafts':
        return getDraftTrips();
      case 'upcoming':
        return getUpcomingTrips();
      case 'current':
        return getCurrentTrips();
      case 'past':
        return getPastTrips();
      default:
        return trips;
    }
  };

  const filteredTrips = getFilteredTrips();

  const getFilterCount = (filter: string) => {
    switch (filter) {
      case 'drafts':
        return getDraftTrips().length;
      case 'upcoming':
        return getUpcomingTrips().length;
      case 'current':
        return getCurrentTrips().length;
      case 'past':
        return getPastTrips().length;
      default:
        return trips.length;
    }
  };

  const getEmptyMessage = () => {
    switch (activeFilter) {
      case 'drafts':
        return 'No draft trips yet';
      case 'upcoming':
        return 'No upcoming trips planned';
      case 'current':
        return 'No current trips';
      case 'past':
        return 'No past trips';
      default:
        return 'No trips found';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 text-left">
              My Trips
            </h1>
            <p className="text-gray-600">
              Manage and view all your travel adventures
            </p>
          </div>
          <Link 
            to="/create-trip"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center"
          >
            <span className="material-symbols-outlined text-xl mr-2">add</span>
            Plan New Trip
          </Link>
        </div>

        {/* Stats Cards */}
        {!loading && !error && trips.length > 0 && (
          <div className="flex flex-wrap gap-4 mb-6 bg-gray-50 p-4 rounded-lg shadow-sm">
            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500 flex items-center justify-between flex-1 min-w-0">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Active Trips</p>
                <p className="text-xl font-bold text-gray-900">{getActiveTrips().length}</p>
              </div>
              <span className="material-symbols-outlined text-xl text-blue-600">assignment_turned_in</span>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500 flex items-center justify-between flex-1 min-w-0">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Upcoming</p>
                <p className="text-xl font-bold text-gray-900">{getUpcomingTrips().length}</p>
              </div>
              <span className="material-symbols-outlined text-xl text-green-600">schedule</span>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-yellow-500 flex items-center justify-between flex-1 min-w-0">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Current</p>
                <p className="text-xl font-bold text-gray-900">{getCurrentTrips().length}</p>
              </div>
              <span className="material-symbols-outlined text-xl text-yellow-600">location_on</span>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-gray-500 flex items-center justify-between flex-1 min-w-0">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Completed</p>
                <p className="text-xl font-bold text-gray-900">{getPastTrips().length}</p>
              </div>
              <span className="material-symbols-outlined text-xl text-gray-600">check_circle</span>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'all', label: 'All Trips', count: trips.length },
              { key: 'drafts', label: 'Drafts', count: getFilterCount('drafts') },
              { key: 'upcoming', label: 'Upcoming', count: getFilterCount('upcoming') },
              { key: 'current', label: 'Current', count: getFilterCount('current') },
              { key: 'past', label: 'Past', count: getFilterCount('past') }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center ${
                  activeFilter === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                    activeFilter === tab.key
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Trip List */}
      <TripList
        trips={filteredTrips}
        loading={loading}
        error={error}
        emptyMessage={getEmptyMessage()}
        onTripSelect={handleTripSelect}
        onTripEdit={handleTripEdit}
        onTripDelete={handleTripDelete}
        onTripPromote={handleTripPromote}
        onTripDemote={handleTripDemote}
        onCreateTrip={handleCreateTrip}
      />
    </div>
  );
};

export default Dashboard;
