import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { chatAPI } from '../../services/api';
import { useTrips } from '../../hooks/useTrips';
import ChatContainer from './ChatContainer';
import ChatInput from './ChatInput';
import AddToTripModal from './AddToTripModal';
import Toast from './Toast';
import { Message, SearchResult } from './ChatMessage';

interface EmbeddedChatProps {
  tripId: string;
  tripTitle: string;
  tripContext?: any;
  className?: string;
}

export interface EmbeddedChatRef {
  sendMessage: (message: string) => void;
}

const EmbeddedChat = forwardRef<EmbeddedChatRef, EmbeddedChatProps>(({
  tripId,
  tripTitle,
  tripContext,
  className = ""
}, ref) => {
  const { trips, updateTrip } = useTrips();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Add to Trip Modal state
  const [isAddToTripModalOpen, setIsAddToTripModalOpen] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<SearchResult | null>(null);
  
  // Toast notification state
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
    isVisible: boolean;
  }>({ message: '', type: 'success', isVisible: false });

  // Load chat history when component mounts
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        setIsInitialLoading(true);
        const response = await chatAPI.getChatHistory(tripId);
        if (response.success) {
          setMessages(response.data);
        }
      } catch (error) {
        console.error('Failed to load chat history:', error);
        setError('Failed to load chat history');
      } finally {
        setIsInitialLoading(false);
      }
    };

    if (tripId) {
      loadChatHistory();
    }
  }, [tripId]);

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
      // Send message to API
      const response = await chatAPI.sendMessage(messageContent, tripId, false);
      
      if (response.success && response.data.aiMessage) {
        // Add a delay to make the response feel more natural
        await new Promise(resolve => setTimeout(resolve, 1500)); // 1.5 second delay
        
        // Add AI response to chat
        setMessages(prev => [...prev, response.data.aiMessage]);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setError('Failed to send message. Please try again.');
      
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
      console.log('Opening add to trip modal for place:', place);
      setSelectedPlace(place);
      setIsAddToTripModalOpen(true);
    } catch (error) {
      console.error('Error opening add to trip modal:', error);
      showToast('Error opening add to trip dialog. Please try again.', 'error');
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

      showToast(`Added "${place.name}" to Day ${day} of your trip!`, 'success');
      
    } catch (error) {
      console.error('Error adding place to trip:', error);
      throw error;
    }
  };

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    sendMessage: handleSendMessage
  }));

  // Generate initial suggestions for trip context
  const getInitialSuggestions = () => {
    return ['Change an activity', 'Local recommendations', 'Transportation help'];
  };

  if (isInitialLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col ${className}`}>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading chat...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col ${className}`}>
      {/* Chat Header */}
      <div className="border-b border-gray-200 px-4 py-4 rounded-t-lg bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">AI Assistant</h3>
              
              {/* Selected Trip Indicator */}
              <div className="flex items-center mt-1">
                <span className="text-xs text-gray-600">Trip:</span>
                <span className="ml-1 px-2 py-0.5 bg-white/70 text-blue-800 text-xs rounded font-medium border border-blue-200">
                  {tripTitle}
                </span>
              </div>
            </div>
          </div>
          
          {messages.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('Clear chat history?')) {
                  chatAPI.clearChatHistory(tripId).then(() => {
                    setMessages([]);
                  });
                }
              }}
              className="text-xs text-gray-500 hover:text-red-600 transition-colors bg-white/50 px-2 py-1 rounded border border-gray-200"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-3 py-2 mx-4 mt-2 text-sm">
          <div className="flex">
            <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Chat Container - takes up remaining space */}
      <ChatContainer
        messages={messages}
        isLoading={isLoading}
        onSuggestionClick={handleSuggestionClick}
        onAddToTrip={handleAddToTrip}
        onGetDetails={handleGetDetails}
        initialSuggestions={getInitialSuggestions()}
        emptyStateMessage="Ask me about modifying your trip or any travel questions!"
      />

      {/* Chat Input */}
      <div className="rounded-b-lg">
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          placeholder="Ask about this trip..."
        />
      </div>
      
      {/* Add to Trip Modal */}
      {selectedPlace && (
        <AddToTripModal
          isOpen={isAddToTripModalOpen}
          onClose={() => {
            setIsAddToTripModalOpen(false);
            setSelectedPlace(null);
          }}
          place={selectedPlace}
          tripId={tripId}
          tripTitle={tripTitle}
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
});

EmbeddedChat.displayName = 'EmbeddedChat';

export default EmbeddedChat;
