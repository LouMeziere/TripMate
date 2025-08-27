import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTrips } from '../../hooks/useTrips';
import { Trip } from '../../services/api';
import EmbeddedChat from '../Chat/EmbeddedChat';

const TripDetails: React.FC = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const { trips, loading } = useTrips();
  const [trip, setTrip] = useState<Trip | null>(null);

  useEffect(() => {
    if (tripId && trips.length > 0) {
      const foundTrip = trips.find(t => t.id === tripId);
      if (foundTrip) {
        setTrip(foundTrip);
      } else {
        // Trip not found, redirect to dashboard
        navigate('/dashboard');
      }
    }
  }, [tripId, trips, navigate]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDurationDays = () => {
    if (!trip) return 0;
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getBudgetLabel = (budget: string) => {
    switch (budget) {
      case 'low': return 'Budget-Friendly';
      case 'medium': return 'Moderate';
      case 'high': return 'Luxury';
      default: return budget;
    }
  };

  const getPaceLabel = (pace: string) => {
    switch (pace) {
      case 'relaxed': return 'Relaxed';
      case 'moderate': return 'Moderate';
      case 'active': return 'Active';
      default: return pace;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Trip Not Found</h1>
          <p className="text-gray-600 mb-6">The trip you're looking for doesn't exist.</p>
          <Link 
            to="/dashboard"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="mr-4 p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">{trip.title}</h1>
            <p className="text-gray-600 flex items-center mt-1">
              <span className="material-symbols-outlined text-base mr-1">location_on</span>
              {trip.destination}
            </p>
          </div>
          <div className="flex space-x-3">
            <Link
              to={`/chat/${trip.id}`}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
            >
              <span className="material-symbols-outlined text-sm mr-2">chat</span>
              Full Chat
            </Link>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center">
              <span className="material-symbols-outlined text-sm mr-2">edit</span>
              Edit Trip
            </button>
          </div>
        </div>

        {/* Trip Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Duration</p>
              <p className="text-xl font-bold text-gray-900">{getDurationDays()} days</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Travelers</p>
              <p className="text-xl font-bold text-gray-900">{trip.travelers}</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Budget</p>
              <p className="text-xl font-bold text-gray-900">{getBudgetLabel(trip.budget)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Pace</p>
              <p className="text-xl font-bold text-gray-900">{getPaceLabel(trip.pace)}</p>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-blue-200">
            <p className="text-sm font-medium text-gray-600 mb-2">Dates</p>
            <p className="text-gray-900">
              {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Trip Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Categories */}
          {trip.categories && trip.categories.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Categories</h2>
              <div className="flex flex-wrap gap-2">
                {trip.categories.map((category) => (
                  <span
                    key={category}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md font-medium"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Itinerary */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Itinerary</h2>
            
            {trip.itinerary && trip.itinerary.length > 0 ? (
              <div className="space-y-6">
                {trip.itinerary.map((dayPlan) => (
                  <div key={dayPlan.day} className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                        {dayPlan.day}
                      </span>
                      Day {dayPlan.day}
                    </h3>
                    
                    <div className="space-y-4">
                      {dayPlan.activities.map((activity, index) => (
                        <div key={index} className="flex items-start p-4 bg-gray-50 rounded-lg">
                          {/* Time indicator */}
                          <div className="flex flex-col items-center mr-4">
                            <div className="bg-blue-600 text-white rounded-lg px-2 py-1 text-xs font-medium min-w-[3rem] text-center">
                              {activity.scheduledTime || '09:00'}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {activity.duration || '2h'}
                            </div>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900">{activity.name}</h4>
                                <p className="text-gray-600 text-sm mt-1">{activity.description}</p>
                                <p className="text-gray-500 text-sm mt-1 flex items-center">
                                  <span className="material-symbols-outlined text-sm mr-1">location_on</span>
                                  {activity.address}
                                </p>
                              </div>
                              <div className="ml-4 text-right">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {activity.category}
                                </span>
                                {activity.rating && (
                                  <p className="text-sm text-gray-500 flex items-center mt-1">
                                    <span className="material-symbols-outlined text-sm mr-1 text-yellow-500">star</span>
                                    {activity.rating}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <span className="material-symbols-outlined text-4xl text-gray-400 mb-4">event_note</span>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Itinerary Yet</h3>
                <p className="text-gray-600 mb-4">This trip doesn't have a detailed itinerary yet.</p>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Generate Itinerary
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Embedded Chat */}
        <div className="lg:col-span-1">
          <div className="sticky top-4">
            <EmbeddedChat 
              tripId={trip.id}
              tripTitle={trip.title}
              tripContext={{
                destination: trip.destination,
                startDate: trip.startDate,
                endDate: trip.endDate,
                travelers: trip.travelers,
                budget: trip.budget,
                pace: trip.pace,
                categories: trip.categories,
                itinerary: trip.itinerary // Include the complete itinerary
              }}
              className="h-[800px]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripDetails;
