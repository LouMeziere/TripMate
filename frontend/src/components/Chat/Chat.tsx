import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { chatAPI } from '../../services/api';
import { useTrips } from '../../hooks/useTrips';
import ChatContainer from './ChatContainer';
import ChatInput from './ChatInput';
import AddToTripModal from './AddToTripModal';
import Toast from './Toast';
import { Message, SearchResult } from './ChatMessage';

const Chat: React.FC = () => {
  const { tripId } = useParams<{ tripId?: string }>();
  const { trips, updateTrip } = useTrips();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tripContext, setTripContext] = useState<any>(null);
  const [selectedTripTitle, setSelectedTripTitle] = useState<string | null>(null);
  
  // Add to Trip Modal state
  const [isAddToTripModalOpen, setIsAddToTripModalOpen] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<SearchResult | null>(null);
  
  // Toast notification state
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
    isVisible: boolean;
  }>({ message: '', type: 'success', isVisible: false });

  // Load trip context and chat history when component mounts or tripId changes
  useEffect(() => {
    const loadChatData = async () => {
      if (!tripId) {
        setSelectedTripTitle(null); // No trip selected
        setIsInitialLoading(false);
        return;
      }
      
      try {
        setIsInitialLoading(true);
        
        // Load trip context first
        const currentTrip = trips.find((trip: any) => trip.id === tripId);
        if (currentTrip) {
          setSelectedTripTitle(currentTrip.title); // Set trip title
          setTripContext({
            destination: currentTrip.destination,
            startDate: currentTrip.startDate,
            endDate: currentTrip.endDate,
            travelers: currentTrip.travelers,
            budget: currentTrip.budget,
            pace: currentTrip.pace,
            categories: currentTrip.categories,
            itinerary: currentTrip.itinerary // Include the complete itinerary
          });
        } else {
          setSelectedTripTitle(null);
        }
        
        // Load chat history
        try {
          const response = await chatAPI.getChatHistory(tripId);
          if (response?.success && Array.isArray(response.data)) {
            setMessages(response.data);
          } else {
            console.warn('Invalid chat history response:', response);
            setMessages([]); // fallback to empty array
          }
        } catch (historyError) {
          console.error('Failed to load chat history:', historyError);
          // Don't set error state for history loading failure, just use empty messages
          setMessages([]);
        }
      } catch (error) {
        console.error('Failed to load chat data:', error);
        setError('Failed to load chat data');
      } finally {
        setIsInitialLoading(false);
      }
    };

    loadChatData();
  }, [tripId, trips]);

  const handleSendMessage = async (messageContent: string) => {
    if (!messageContent.trim()) return;

    // Create user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: messageContent,
      timestamp: new Date().toISOString()
    };

    // Add user message to chat immediately
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      // Send message to API with trip context
      const response = await chatAPI.sendMessage(messageContent, tripId, tripContext, true);
      
      if (response?.success && response?.data?.aiMessage) {
        // Create AI message with search results if they exist
        const aiMessage: Message = {
          ...response.data.aiMessage,
          searchResults: response.data.searchResults || null
        };
        
        // Add AI response to chat
        setMessages(prev => [...prev, aiMessage]);
      } else {
        console.error('Invalid response structure:', response);
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      
      // More specific error handling
      let errorMessage = 'Failed to send message. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('Network Error') || error.message.includes('timeout')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else if (error.message.includes('500')) {
          errorMessage = 'Server error. Please try again in a moment.';
        }
      }
      
      setError(errorMessage);
      
      // Remove the user message since sending failed
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  // Utility function to show toast notifications
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type, isVisible: true });
  };

  // Utility function to calculate trip duration in days
  const getTripDays = () => {
    if (!tripContext?.startDate || !tripContext?.endDate) return 1;
    const start = new Date(tripContext.startDate);
    const end = new Date(tripContext.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Handle adding a place to the trip
  const handleAddToTrip = (place: SearchResult) => {
    try {
      if (!tripId) {
        showToast('No trip selected. Please select a trip first.', 'error');
        return;
      }
      
      console.log('Opening add to trip modal for place:', place);
      setSelectedPlace(place);
      setIsAddToTripModalOpen(true);
    } catch (error) {
      console.error('Error opening add to trip modal:', error);
      showToast('Error opening add to trip dialog. Please try again.', 'error');
    }
  };

  // Handle actually adding the place to a specific day
  const handleAddPlaceToDay = async (day: number, place: SearchResult) => {
    if (!tripId || !tripContext) {
      throw new Error('No trip selected');
    }

    try {
      // Find the current trip
      const currentTrip = trips.find(trip => trip.id === tripId);
      if (!currentTrip) {
        throw new Error('Trip not found');
      }

      // Create the new activity from the search result
      const newActivity = {
        name: place.name,
        category: place.category || 'general',
        duration: '2 hours', // Default duration
        address: place.address,
        rating: place.rating || 0,
        description: `Added from search results`,
        scheduledTime: '', // Will be set automatically or by user later
        tel: '',
        email: '',
        price: place.price || 0
      };

      // Clone the current itinerary
      const updatedItinerary = [...currentTrip.itinerary];
      
      // Find or create the day
      let dayPlan = updatedItinerary.find(d => d.day === day);
      if (!dayPlan) {
        // Create new day if it doesn't exist
        dayPlan = { day, activities: [] };
        updatedItinerary.push(dayPlan);
        updatedItinerary.sort((a, b) => a.day - b.day);
      } else {
        // Make sure we're working with a copy
        const dayIndex = updatedItinerary.findIndex(d => d.day === day);
        updatedItinerary[dayIndex] = {
          ...dayPlan,
          activities: [...dayPlan.activities, newActivity]
        };
      }

      // If we created a new day, add the activity to it
      if (!dayPlan.activities.includes(newActivity)) {
        dayPlan.activities = [...dayPlan.activities, newActivity];
      }

      // Update the trip with the new itinerary
      const updatedTrip = {
        ...currentTrip,
        itinerary: updatedItinerary
      };

      await updateTrip(tripId, updatedTrip);
      
      // Update local trip context
      setTripContext({
        ...tripContext,
        itinerary: updatedItinerary
      });

      showToast(`Added "${place.name}" to Day ${day} of your trip!`, 'success');
      
    } catch (error) {
      console.error('Error adding place to trip:', error);
      throw error;
    }
  };

  // Handle getting more details about a place
  const handleGetDetails = (place: SearchResult) => {
    try {
      console.log('Getting details for place:', place);
      // TODO: Implement details view/modal
      // For now, just show basic info
      if (place?.name && place?.address && place?.category) {
        alert(`Details for ${place.name}:\n${place.address}\nCategory: ${place.category}`);
      } else {
        alert('Place details are not fully available.');
      }
    } catch (error) {
      console.error('Error getting place details:', error);
      alert('Error getting place details. Please try again.');
    }
  };

  // Generate initial suggestions based on trip context
  const getInitialSuggestions = () => {
    if (!tripContext) {
      return ['Plan a trip', 'Travel tips', 'Budget advice'];
    } else {
      return ['Change an activity', 'Local recommendations', 'Transportation help'];
    }
  };

  if (isInitialLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col h-[calc(100vh-6rem)]">
        {/* Chat Header */}
        <div className="border-b border-gray-200 px-4 py-3 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">AI Travel Assistant</h1>
              
              {/* Selected Trip Indicator */}
              <div className="flex items-center mt-2">
                <span className="text-sm font-medium text-gray-700">Selected trip:</span>
                <span className="ml-2 px-2 py-1 rounded-md text-sm">
                  {selectedTripTitle ? (
                    <span className="bg-blue-100 text-blue-800 font-medium">
                      {selectedTripTitle}
                    </span>
                  ) : (
                    <span className="bg-gray-100 text-gray-600">
                      None
                    </span>
                  )}
                </span>
              </div>
              
              {tripId && tripContext ? (
                <p className="text-sm text-gray-500 mt-1">
                  Planning assistance for {tripContext.destination} • {tripContext.travelers} {tripContext.travelers === 1 ? 'traveler' : 'travelers'} • {tripContext.budget} budget
                </p>
              ) : tripId ? (
                <p className="text-sm text-gray-500 mt-1">Planning assistance for Trip {tripId}</p>
              ) : (
                <p className="text-sm text-gray-500 mt-1">General travel planning</p>
              )}
            </div>
            
            {tripId && messages.length > 0 && (
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to clear this chat history?')) {
                    chatAPI.clearChatHistory(tripId).then(() => {
                      setMessages([]);
                    });
                  }
                }}
                className="text-sm text-gray-500 hover:text-red-600 transition-colors"
              >
                Clear History
              </button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 mx-4 mt-3 rounded-md">
            <div className="flex">
              <svg className="w-5 h-5 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Chat Container */}
        <ChatContainer
          messages={messages}
          isLoading={isLoading}
          onSuggestionClick={handleSuggestionClick}
          onAddToTrip={handleAddToTrip}
          onGetDetails={handleGetDetails}
          initialSuggestions={getInitialSuggestions()}
          emptyStateMessage={
            tripId 
              ? "Ask me anything about your trip planning!" 
              : "Start a conversation to plan your perfect trip!"
          }
        />

        {/* Chat Input */}
        <div className="rounded-b-lg">
          <ChatInput
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            placeholder={
              tripId 
                ? "Ask about your trip..." 
                : "Ask me anything about travel planning..."
            }
          />
        </div>
      </div>
      
      {/* Add to Trip Modal */}
      {tripId && selectedPlace && (
        <AddToTripModal
          isOpen={isAddToTripModalOpen}
          onClose={() => {
            setIsAddToTripModalOpen(false);
            setSelectedPlace(null);
          }}
          place={selectedPlace}
          tripId={tripId}
          tripTitle={selectedTripTitle || 'Your Trip'}
          tripDays={getTripDays()}
          onAddToTrip={handleAddPlaceToDay}
        />
      )}
      
      {/* Toast Notifications */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />
    </div>
  );
};

export default Chat;
