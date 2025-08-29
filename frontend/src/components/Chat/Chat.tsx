import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { chatAPI } from '../../services/api';
import { useTrips } from '../../hooks/useTrips';
import ChatContainer from './ChatContainer';
import ChatInput from './ChatInput';
import { Message, SearchResult } from './ChatMessage';

const Chat: React.FC = () => {
  const { tripId } = useParams<{ tripId?: string }>();
  const { trips } = useTrips();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tripContext, setTripContext] = useState<any>(null);
  const [selectedTripTitle, setSelectedTripTitle] = useState<string | null>(null);

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
        const response = await chatAPI.getChatHistory(tripId);
        if (response.success) {
          setMessages(response.data);
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
      
      if (response.success && response.data.aiMessage) {
        // Create AI message with search results if they exist
        const aiMessage: Message = {
          ...response.data.aiMessage,
          searchResults: response.data.searchResults
        };
        
        // Add AI response to chat
        setMessages(prev => [...prev, aiMessage]);
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

  // Handle adding a place to the trip
  const handleAddToTrip = (place: SearchResult) => {
    console.log('Adding place to trip:', place);
    // TODO: Implement trip addition functionality
    // For now, just show a notification or update state
    alert(`Added "${place.name}" to your trip! (Feature coming soon)`);
  };

  // Handle getting more details about a place
  const handleGetDetails = (place: SearchResult) => {
    console.log('Getting details for place:', place);
    // TODO: Implement details view/modal
    // For now, just show basic info
    alert(`Details for ${place.name}:\n${place.address}\nCategory: ${place.category}`);
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
    </div>
  );
};

export default Chat;
