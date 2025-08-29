import React, { useState, useEffect } from 'react';
import { chatAPI } from '../../services/api';
import ChatMessage, { Message } from '../Chat/ChatMessage';
import ChatInput from '../Chat/ChatInput';
import { TripFormData } from './CreateTrip';

interface CreateTripChatProps {
  tripId: string;
  currentStep: number;
  formData: TripFormData;
  onUserPreferences?: (preferences: string[]) => void;
}

const CreateTripChat: React.FC<CreateTripChatProps> = ({ tripId, currentStep, formData, onUserPreferences }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRequestExpanded, setIsRequestExpanded] = useState(false);
  const [userAdditions, setUserAdditions] = useState<string>('');
  
  const isDisabled = currentStep < 4;

  // Load chat history when component mounts (only if not disabled)
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
      } finally {
        setIsInitialLoading(false);
      }
    };

    if (!isDisabled) {
      loadChatHistory();
    } else {
      setIsInitialLoading(false);
    }
  }, [tripId, isDisabled]);

  const handleSendMessage = async (messageContent: string) => {
    if (!messageContent.trim() || isDisabled) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: messageContent,
      type: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await chatAPI.sendMessage(tripId, messageContent);
      
      if (response.success) {
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          content: response.data.message,
          type: 'ai',
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error: any) {
      console.warn('Chat API failed, but user message is still saved:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate the base trip request (read-only)
  const baseTripRequest = React.useMemo(() => {
    let paragraph = '';
    
    if (currentStep >= 1 && formData.destination) {
      paragraph = `I would like to plan a trip to ${formData.destination}`;
      
      if (formData.startDate && formData.endDate) {
        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const duration = diffDays === 1 ? '1 day' : `${diffDays} days`;
        
        const formatDate = (dateString: string): string => {
          const date = new Date(dateString);
          return date.toLocaleDateString('en-US', { 
            month: 'long', 
            day: 'numeric', 
            year: 'numeric' 
          });
        };
        
        paragraph += ` for ${duration}, from ${formatDate(formData.startDate)} to ${formatDate(formData.endDate)}`;
      }
      
      if (formData.travelers) {
        const getTravelersText = (): string => {
          if (formData.travelers === 1) return 'solo';
          if (formData.travelers === 2) return 'with my partner';
          return `with a group of ${formData.travelers} people`;
        };
        
        paragraph += `. I am traveling ${getTravelersText()}`;
      }
    }
    
    if (currentStep >= 2 && formData.budget && formData.pace) {
      const getBudgetText = (): string => {
        const budgetMap = {
          low: 'budget-friendly',
          medium: 'moderate',
          high: 'luxury'
        };
        return budgetMap[formData.budget] || 'moderate';
      };
      
      const getPaceText = (): string => {
        const paceMap = {
          relaxed: 'relaxed pace',
          moderate: 'moderate pace', 
          active: 'active and packed schedule'
        };
        return paceMap[formData.pace] || 'moderate pace';
      };
      
      if (paragraph) {
        paragraph += ` with a ${getBudgetText()} budget in mind and prefer a ${getPaceText()}.`;
      }
    }
    
    if (currentStep >= 3 && formData.categories && formData.categories.length > 0) {
      const categoryMap: Record<string, string> = {
        restaurants: 'dining at local restaurants',
        attractions: 'visiting tourist attractions',
        entertainment: 'entertainment and shows',
        shopping: 'shopping experiences',
        outdoor: 'outdoor activities',
        museums: 'museums and galleries',
        sports: 'sports activities',
        wellness: 'wellness and spa treatments',
        nightlife: 'nightlife experiences',
        cultural: 'cultural experiences',
        beaches: 'beach activities',
        transportation: 'local transportation experiences'
      };

      const mappedCategories = formData.categories.map(cat => categoryMap[cat] || cat);
      
      if (mappedCategories.length === 1) {
        paragraph += ` Please focus on ${mappedCategories[0]}.`;
      } else if (mappedCategories.length === 2) {
        paragraph += ` Please focus on ${mappedCategories[0]} and ${mappedCategories[1]}.`;
      } else {
        const lastCategory = mappedCategories.pop();
        paragraph += ` Please focus on ${mappedCategories.join(', ')}, and ${lastCategory}.`;
      }
    }
    
    return paragraph || 'Start filling out your trip details to see your request being built...';
  }, [currentStep, formData]);

  // Function to add current chat context to user additions
  const addToTripRequest = () => {
    if (messages.length > 0) {
      const lastUserMessage = messages.filter(msg => msg.type === 'user').pop();
      const lastAiMessage = messages.filter(msg => msg.type === 'ai').pop();
      
      if (lastUserMessage) {
        const addition = lastAiMessage ? 
          `${lastUserMessage.content} (AI suggested: ${lastAiMessage.content})` : 
          lastUserMessage.content;
        
        const newAdditions = userAdditions ? 
          `${userAdditions} ${addition}` : 
          addition;
        
        setUserAdditions(newAdditions);
        
        // Update parent component
        if (onUserPreferences) {
          onUserPreferences([newAdditions]);
        }
      }
    }
  };

  const clearUserAdditions = () => {
    setUserAdditions('');
    if (onUserPreferences) {
      onUserPreferences([]);
    }
  };

  if (isDisabled) {
    return (
      <div className="h-full">
        <div className="bg-gray-50 rounded-lg shadow-sm border border-gray-200 h-full flex flex-col">
          <div className="p-4 border-b border-gray-200 bg-gray-100">
            <h3 className="text-lg font-medium text-gray-600">Trip Request Builder</h3>
            <p className="text-sm text-gray-500">
              Complete the form to build your trip request
            </p>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-4">
              <div className="text-sm text-gray-600 mb-3">
                Your trip request is being built as you fill out the form:
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="text-sm text-gray-800 leading-relaxed">
                  {baseTripRequest}
                </div>
              </div>
              
              <div className="text-xs text-gray-500 italic">
                Chat will be enabled in the review step where you can add additional preferences.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Trip Planning Assistant</h3>
          <p className="text-sm text-gray-500">
            Add additional preferences or ask questions about your trip
          </p>
        </div>
        
        {/* Collapsible Trip Request Section */}
        <div className="border-b border-gray-200">
          <button
            onClick={() => setIsRequestExpanded(!isRequestExpanded)}
            className="w-full p-3 text-left hover:bg-gray-50 flex items-center justify-between"
          >
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-700">Current Trip Request</span>
              <span className="ml-2 text-xs text-gray-500">(Read-only)</span>
            </div>
            <svg 
              className={`w-4 h-4 text-gray-500 transform transition-transform ${isRequestExpanded ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {isRequestExpanded && (
            <div className="p-3 bg-gray-50 border-t border-gray-200">
              <div className="text-sm text-gray-800 leading-relaxed bg-white p-3 rounded border">
                {baseTripRequest}
              </div>
            </div>
          )}
          
          {/* User Additions Section */}
          {userAdditions && (
            <div className="p-3 bg-blue-50 border-t border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-800">Your Additional Preferences</span>
                <button
                  onClick={clearUserAdditions}
                  className="text-xs text-red-600 hover:text-red-500"
                >
                  Clear
                </button>
              </div>
              <div className="text-sm text-blue-800 leading-relaxed bg-white p-3 rounded border border-blue-200">
                {userAdditions}
              </div>
            </div>
          )}
        </div>
        
        {/* Chat Area */}
        <div className="flex-1 min-h-0">
          {isInitialLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg 
                    className="w-8 h-8 text-purple-500" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  AI Travel Assistant
                </h3>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-hidden">
              <div className="h-full overflow-y-auto p-4 space-y-1">
                {messages.map((message) => (
                  <div key={message.id}>
                    <ChatMessage message={message} />
                  </div>
                ))}

                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex justify-start mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                        <svg 
                          className="w-5 h-5 text-white" 
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path 
                            fillRule="evenodd" 
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" 
                            clipRule="evenodd" 
                          />
                        </svg>
                      </div>
                      <div className="bg-gray-100 border border-gray-200 rounded-lg px-4 py-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Add to Request Button */}
        {messages.length > 0 && (
          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <button
              onClick={addToTripRequest}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Add Last Exchange to Trip Request
            </button>
          </div>
        )}
        
        {/* Chat Input */}
        <div className="border-t border-gray-200">
          <ChatInput
            onSendMessage={handleSendMessage}
            disabled={isLoading}
            placeholder="Ask for recommendations or travel advice..."
          />
        </div>
      </div>
    </div>
  );
};

export default CreateTripChat;
