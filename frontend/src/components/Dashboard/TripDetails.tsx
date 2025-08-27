import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTrips } from '../../hooks/useTrips';
import { Trip } from '../../services/api';
import EmbeddedChat, { EmbeddedChatRef } from '../Chat/EmbeddedChat';

const TripDetails: React.FC = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const { trips, loading } = useTrips();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [expandedActivities, setExpandedActivities] = useState<Set<string>>(new Set());
  const chatRef = useRef<EmbeddedChatRef>(null);

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

  const getDateForDay = (dayNumber: number): string => {
    if (!trip?.startDate) return `Day ${dayNumber}`;
    
    const startDate = new Date(trip.startDate);
    const targetDate = new Date(startDate);
    targetDate.setDate(startDate.getDate() + (dayNumber - 1));
    
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    };
    
    const formattedDate = targetDate.toLocaleDateString('en-US', options);
    return formattedDate;
  };

  const toggleActivityExpansion = (activityId: string) => {
    const newExpanded = new Set(expandedActivities);
    if (newExpanded.has(activityId)) {
      newExpanded.delete(activityId);
    } else {
      newExpanded.add(activityId);
    }
    setExpandedActivities(newExpanded);
  };

  const handleChangeActivity = (activity: any) => {
    if (chatRef.current) {
      const message = `I want to change the activity "${activity.name}" in my itinerary. What would you suggest as alternatives?`;
      chatRef.current.sendMessage(message);
    }
  };  const renderActivityDetails = (activity: any) => {
    const activityId = `${activity.name}-${activity.address}`;
    const isExpanded = expandedActivities.has(activityId);

    if (!isExpanded) return null;

    return (
      <div className="border-t border-gray-200 bg-gray-50 p-4">
        <div className="grid grid-cols-1 gap-6">
          {/* Contact & Price */}
          <div>
            <h5 className="font-semibold text-gray-800 mb-3 flex items-center">
              <span className="mr-2">💰</span>
              Contact & Price
            </h5>
            <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
              {activity.price !== undefined ? (
                <div className="flex items-center p-2 bg-green-50 rounded-lg">
                  <span className="text-green-600 mr-2">💵</span>
                  <div>
                    <span className="font-medium text-gray-800">Price Level:</span>
                    <div className="text-green-700 font-semibold">
                      {'$'.repeat(activity.price)} ({
                        activity.price === 1 ? 'Budget-friendly' : 
                        activity.price === 2 ? 'Moderate' : 
                        activity.price === 3 ? 'Expensive' : 'Very Expensive'
                      })
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500">Price information not available</div>
              )}
              
              {activity.tel ? (
                <div className="flex items-center p-2 hover:bg-gray-50 rounded-lg">
                  <span className="text-blue-600 mr-2">📞</span>
                  <div>
                    <span className="font-medium text-gray-800">Phone:</span>
                    <div>
                      <a href={`tel:${activity.tel}`} className="text-blue-600 hover:underline font-medium">
                        {activity.tel}
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500">Phone number not available</div>
              )}
              
              {activity.email && (
                <div className="flex items-center p-2 hover:bg-gray-50 rounded-lg">
                  <span className="text-blue-600 mr-2">✉️</span>
                  <div>
                    <span className="font-medium text-gray-800">Email:</span>
                    <div>
                      <a href={`mailto:${activity.email}`} className="text-blue-600 hover:underline font-medium">
                        {activity.email}
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
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
              <div className="space-y-8">
                {trip.itinerary.map((dayPlan) => (
                  <div key={dayPlan.day} className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                    {/* Day Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full w-12 h-12 flex items-center justify-center mr-4">
                            <span className="text-white font-bold text-lg">{dayPlan.day}</span>
                          </div>
                          <div className="text-white">
                            <h3 className="text-xl font-bold">Day {dayPlan.day}</h3>
                            <p className="text-blue-100 text-sm">{getDateForDay(dayPlan.day)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Activities */}
                    <div className="p-6">
                      <div className="space-y-4">
                        {dayPlan.activities.map((activity, index) => {
                          const activityId = `${activity.name}-${activity.address}`;
                          const isExpanded = expandedActivities.has(activityId);
                          
                          return (
                            <div key={index} className="group relative">
                              {/* Timeline connector */}
                              {index < dayPlan.activities.length - 1 && (
                                <div className="absolute left-6 top-16 w-0.5 h-8 bg-gradient-to-b from-blue-300 to-blue-200"></div>
                              )}
                              
                              <div className="bg-white rounded-lg border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all duration-200 overflow-hidden">
                                <div 
                                  className="flex items-start p-4 cursor-pointer"
                                  onClick={() => toggleActivityExpansion(activityId)}
                                >
                                  {/* Time indicator */}
                                  <div className="flex flex-col items-center mr-4 min-w-[4rem]">
                                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl px-3 py-2 text-sm font-semibold shadow-sm">
                                      {activity.scheduledTime || '09:00'}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-2 font-medium bg-gray-100 px-2 py-1 rounded-full">
                                      {activity.duration || '2h'}
                                    </div>
                                  </div>
                                  
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-blue-700 transition-colors">
                                          {activity.name}
                                        </h4>
                                        <p className="text-gray-600 text-sm leading-relaxed mb-3">
                                          {activity.description}
                                        </p>
                                        <div className="flex items-center text-gray-500 text-sm">
                                          <span className="material-symbols-outlined text-base mr-2 text-blue-500">location_on</span>
                                          <span className="truncate">{activity.address}</span>
                                        </div>
                                      </div>
                                      
                                      <div className="ml-6 flex flex-col items-end space-y-2">
                                        <div className="flex items-center space-x-2">
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleChangeActivity(activity);
                                            }}
                                            className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors duration-200 flex items-center space-x-1"
                                          >
                                            <span className="material-symbols-outlined text-sm">sync_alt</span>
                                            <span>Change</span>
                                          </button>
                                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200">
                                            {activity.category}
                                          </span>
                                        </div>
                                        {activity.rating && (
                                          <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-full border border-yellow-200">
                                            <span className="material-symbols-outlined text-sm mr-1 text-yellow-600">star</span>
                                            <span className="text-sm font-semibold text-yellow-700">{activity.rating}</span>
                                          </div>
                                        )}
                                        <button 
                                          className="flex items-center text-gray-400 hover:text-blue-600 transition-colors"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <span className="material-symbols-outlined text-lg">
                                            {isExpanded ? 'expand_less' : 'expand_more'}
                                          </span>
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Expanded Content */}
                                {renderActivityDetails(activity)}
                              </div>
                            </div>
                          );
                        })}
                      </div>
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
              ref={chatRef}
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
