import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTrips } from '../../hooks/useTrips';
import { Trip } from '../../services/api';
import EmbeddedChat, { EmbeddedChatRef } from '../Chat/EmbeddedChat';

const TripDetails: React.FC = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const { trips, loading, fetchTrips } = useTrips();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [expandedActivities, setExpandedActivities] = useState<Set<string>>(new Set());
  const [hasFetchedTrips, setHasFetchedTrips] = useState(false);
  const chatRef = useRef<EmbeddedChatRef>(null);

  // Fetch trips if they haven't been loaded yet, or mark as fetched if already available
  useEffect(() => {
    if (trips.length === 0 && !loading && !hasFetchedTrips) {
      setHasFetchedTrips(true);
      fetchTrips();
    } else if (trips.length > 0 && !hasFetchedTrips) {
      // Trips are already loaded (e.g., navigating from dashboard), mark as fetched
      setHasFetchedTrips(true);
    }
  }, [trips.length, loading, fetchTrips, hasFetchedTrips]);

  useEffect(() => {
    if (tripId && hasFetchedTrips && !loading) {
      // Only check for trip after we've attempted to fetch AND loading is complete
      if (trips.length > 0) {
        const foundTrip = trips.find(t => t.id === tripId);
        if (foundTrip) {
          setTrip(foundTrip);
        } else {
          // Trip not found after loading is complete, redirect to dashboard
          console.warn(`Trip with ID ${tripId} not found`);
          navigate('/dashboard');
        }
      } else {
        // No trips available after loading is complete
        console.warn('No trips available after loading');
        navigate('/dashboard');
      }
    }
  }, [tripId, trips, loading, hasFetchedTrips, navigate]);

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
  }; 

  const renderActivityDetails = (activity: any) => {
    const activityId = `${activity.name}-${activity.address}`;
    const isExpanded = expandedActivities.has(activityId);

    if (!isExpanded) return null;

    return (
      <div className="border-t border-gray-200 bg-gray-50 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left side - Description & Address */}
          <div>
            <div className="flex items-center mb-3">
              <span className="material-symbols-outlined text-xl text-blue-600 mr-2">info</span>
              <h5 className="font-semibold text-gray-800">Details</h5>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
              <div>
                <h6 className="font-medium text-gray-700 mb-2">Description</h6>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {activity.description}
                </p>
              </div>
              <div>
                <h6 className="font-medium text-gray-700 mb-2">Address</h6>
                <div className="flex items-start text-gray-600 text-sm">
                  <span className="material-symbols-outlined text-base mr-2 text-blue-500 mt-0.5">location_on</span>
                  <span>{activity.address}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Price & Contact */}
          <div>
            <div className="flex items-center mb-3">
              <span className="material-symbols-outlined text-xl text-green-600 mr-2">local_offer</span>
              <h5 className="font-semibold text-gray-800">Pricing & Contact</h5>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
              {activity.price !== undefined ? (
                <div className="flex items-center p-2 bg-green-50 rounded-lg">
                  <span className="text-green-600 mr-2">💵</span>
                  <div className="text-center flex-1">
                    <span className="font-medium text-gray-800 block">Price Level:</span>
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
                <div className="text-sm text-gray-500 text-center">Price information not available</div>
              )}
              
              {activity.tel ? (
                <div className="flex items-center p-2 hover:bg-gray-50 rounded-lg">
                  <span className="text-blue-600 mr-2">📞</span>
                  <div className="text-center flex-1">
                    <span className="font-medium text-gray-800 block">Phone:</span>
                    <div>
                      <a href={`tel:${activity.tel}`} className="text-blue-600 hover:underline font-medium">
                        {activity.tel}
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500 text-center">Phone number not available</div>
              )}
              
              {activity.email && (
                <div className="flex items-center p-2 hover:bg-gray-50 rounded-lg">
                  <span className="text-blue-600 mr-2">✉️</span>
                  <div className="text-center flex-1">
                    <span className="font-medium text-gray-800 block">Email:</span>
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
        
        {/* Change Activity Button */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">Want to explore other options for this time slot?</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleChangeActivity(activity);
              }}
              className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors flex items-center space-x-2"
            >
              <span className="material-symbols-outlined text-sm">sync_alt</span>
              <span>Change Activity</span>
            </button>
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

  // Show loading state while initial data is being fetched
  if (loading || (!hasFetchedTrips)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading trip details...</p>
        </div>
      </div>
    );
  }

  // Show not found state only after loading is complete
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
            <h1 className="text-3xl font-bold text-gray-900 mb-[40px]">{trip.title}</h1>
            <p className="text-gray-600 flex items-center mb-2">
              <span className="material-symbols-outlined text-base mr-1">location_on</span>
              {trip.destination}
            </p>
            {/* Travel Dates section - inline, no box */}
            <div className="flex items-center text-gray-600 text-sm mb-[40px]">
              <span className="material-symbols-outlined text-base mr-1 text-blue-500">date_range</span>
              <span className="font-medium mr-1">Travel Dates:</span>
              <span className="text-gray-800">{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
            </div>
          </div>
          <div className="flex space-x-3">
            <Link
              to={`/chat/${trip.id}`}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
            >
              <span className="material-symbols-outlined text-sm mr-2">chat</span>
              Full Chat
            </Link>
          </div>
        </div>

        {/* Trip Summary */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 bg-blue-50 rounded-lg px-4 py-3">
                <span className="material-symbols-outlined text-2xl text-blue-500">calendar_month</span>
                <div>
                  <p className="text-xs text-blue-700 font-medium uppercase tracking-wide">Duration</p>
                  <p className="text-xl font-bold text-gray-900">{getDurationDays()} days</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-green-50 rounded-lg px-4 py-3">
                <span className="material-symbols-outlined text-2xl text-green-600">attach_money</span>
                <div>
                  <p className="text-xs text-green-700 font-medium uppercase tracking-wide">Budget</p>
                  <p className="text-xl font-bold text-gray-900">{getBudgetLabel(trip.budget)}</p>
                </div>
              </div>
              {/* Categories section, only in left column */}
              {trip.categories && trip.categories.length > 0 && (
                <div className="bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 mt-2">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="material-symbols-outlined text-2xl text-blue-500">label</span>
                    <p className="text-xs font-medium text-blue-700 uppercase tracking-wide">Categories</p>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {trip.categories.map((category, idx) => {
                      const colors = [
                        'bg-blue-100 text-blue-800',
                        'bg-green-100 text-green-800',
                        'bg-yellow-100 text-yellow-800',
                        'bg-purple-100 text-purple-800',
                        'bg-pink-100 text-pink-800',
                        'bg-red-100 text-red-800',
                        'bg-indigo-100 text-indigo-800',
                        'bg-amber-100 text-amber-800',
                      ];
                      const color = colors[idx % colors.length];
                      return (
                        <span
                          key={category}
                          className={`px-3 py-2 rounded-full font-medium text-sm ${color}`}
                        >
                          {category}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            {/* Right column */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 bg-purple-50 rounded-lg px-4 py-3">
                <span className="material-symbols-outlined text-2xl text-purple-600">group</span>
                <div>
                  <p className="text-xs text-purple-700 font-medium uppercase tracking-wide">Travelers</p>
                  <p className="text-xl font-bold text-gray-900">{trip.travelers}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-yellow-50 rounded-lg px-4 py-3">
                <span className="material-symbols-outlined text-2xl text-yellow-600">bolt</span>
                <div>
                  <p className="text-xs text-yellow-700 font-medium uppercase tracking-wide">Pace</p>
                  <p className="text-xl font-bold text-gray-900">{getPaceLabel(trip.pace)}</p>
                </div>
              </div>
            </div>
            {/* Categories now only in left column */}
            {/* Travel Dates moved above summary card */}
          </div>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Trip Details */}
        <div className="lg:col-span-2 space-y-8">

          {/* Itinerary */}
          <div>
            
            {trip.itinerary && trip.itinerary.length > 0 ? (
              <div className="space-y-6">
                {trip.itinerary.map((dayPlan) => (
                  <div key={dayPlan.day} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
                    
                    {/* Day Header */}
                    <div className="bg-blue-50 border-b border-blue-100 px-6 py-4">
                      <div className="flex items-center">
                        <div className="p-2 bg-blue-100 border border-blue-200 rounded-full mr-3">
                          <span className="material-symbols-outlined text-2xl text-blue-700">today</span>
                        </div>
                        <div className="flex flex-col">
                          <h3 className="text-lg font-semibold text-gray-900">Day {dayPlan.day}</h3>
                          <p className="text-blue-600 text-sm font-medium">{getDateForDay(dayPlan.day)}</p>
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
                              {/* Timeline connector removed */}
                              
                              <div className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden">
                                <div 
                                  className="flex items-start p-4 cursor-pointer"
                                  onClick={() => toggleActivityExpansion(activityId)}
                                >
                                  {/* Time indicator */}
                                  <div className="flex flex-col items-center mr-4 min-w-[4rem]">
                                    <div className="bg-blue-50 text-blue-700 border border-blue-200 rounded-lg px-3 py-2 text-sm font-semibold">
                                      {activity.scheduledTime || '09:00'}
                                    </div>
                                    <div className="text-xs text-blue-600 mt-2 font-medium bg-blue-50 px-2 py-1 rounded-full border border-blue-200">
                                      {activity.duration || '2h'}
                                    </div>
                                  </div>
                                  
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-gray-900 text-lg mb-3 hover:text-blue-600 transition-colors">
                                          {activity.name}
                                        </h4>
                                        <div className="text-center mt-4">
                                          <button 
                                            onClick={() => toggleActivityExpansion(activityId)}
                                            className="text-gray-400 hover:text-gray-600 text-sm font-medium transition-colors"
                                          >
                                            {isExpanded ? 'Show less details' : 'Tap to explore more about this activity'}
                                          </button>
                                        </div>
                                      </div>
                                      
                                      <div className="ml-4 flex flex-col items-end space-y-2">
                                        {/* Price and Rating moved to right side */}
                                        <div className="flex items-center space-x-2">
                                          {activity.price !== undefined && (
                                            <div className="flex items-center px-2 py-1 bg-green-50 text-green-700 rounded-full border border-green-200">
                                              <span className="text-xs font-medium">{'$'.repeat(activity.price)}</span>
                                            </div>
                                          )}
                                          {activity.rating && (
                                            <div className="flex items-center px-2 py-1 bg-yellow-50 text-yellow-700 rounded-full border border-yellow-200">
                                              <span className="material-symbols-outlined text-xs mr-1 text-yellow-600">star</span>
                                              <span className="text-xs font-medium">{activity.rating}</span>
                                            </div>
                                          )}
                                        </div>
                                        
                                        <div className="flex items-center space-x-2">
                                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                            {activity.category}
                                          </span>
                                        </div>
                                        
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
