import React, { useState, useEffect } from 'react';
import { chatAPI } from '../../services/api';
import ChatContainer from './ChatContainer';
import ChatInput from './ChatInput';
import { Message } from './ChatMessage';
import { TripFormData } from '../CreateTrip/CreateTrip';

interface CreateTripChatProps {
  formData: TripFormData;
  currentStep: number;
  className?: string;
}

const CreateTripChat: React.FC<CreateTripChatProps> = ({
  formData,
  currentStep,
  className = ""
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize with a welcome message based on the current step
  useEffect(() => {
    const getWelcomeMessage = (): Message => {
      let content = "👋 Hi! I'm your AI travel assistant. I'm here to help you plan the perfect trip!";
      
      switch (currentStep) {
        case 1:
          content += " Start by telling me where you'd like to go and when. I can help with destination ideas, best times to visit, or answer any questions!";
          break;
        case 2:
          content += " Great job on the basic info! Now let's talk about your travel preferences. I can help you decide on budget considerations or travel pace based on your destination.";
          break;
        case 3:
          content += " Perfect! Now let's choose activity categories. I can suggest the best categories for your destination or help you understand what each category includes.";
          break;
        case 4:
          content += " Excellent! You're almost ready to create your trip. I can help answer any final questions or provide insights about what to expect next.";
          break;
        default:
          break;
      }

      return {
        id: `welcome-${Date.now()}`,
        type: 'ai',
        content,
        timestamp: new Date().toISOString()
      };
    };

    // Set welcome message when component mounts or step changes
    if (messages.length === 0) {
      setMessages([getWelcomeMessage()]);
    }
  }, [currentStep]);

  const getTripContext = () => {
    const stepContexts = {
      1: "The user is currently on the basic information step of trip planning.",
      2: "The user is currently setting their travel preferences (budget and pace).",
      3: "The user is currently selecting activity categories for their trip.",
      4: "The user is reviewing their trip details before creation."
    };

    return {
      currentStep,
      stepDescription: stepContexts[currentStep as keyof typeof stepContexts] || "The user is planning a trip.",
      destination: formData.destination || 'not specified yet',
      startDate: formData.startDate || 'not specified yet',
      endDate: formData.endDate || 'not specified yet',
      travelers: formData.travelers || 1,
      budget: formData.budget || 'not specified yet',
      pace: formData.pace || 'not specified yet',
      categories: formData.categories || [],
      isCreatingTrip: true
    };
  };

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
      // Send message to API with trip planning context
      const response = await chatAPI.sendMessage(
        messageContent, 
        "create-trip-assistant", // Special ID for create trip context
        getTripContext(),
        true
      );
      
      if (response.success && response.data.aiMessage) {
        // Add a delay to make the response feel more natural
        await new Promise(resolve => setTimeout(resolve, 1000));
        
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

  const getSuggestions = () => {
    switch (currentStep) {
      case 1:
        return [
          "What's the best time to visit Japan?",
          "Suggest a destination for a romantic getaway",
          "I need help choosing dates for my trip"
        ];
      case 2:
        return [
          "What budget should I expect for this destination?",
          "Help me choose between relaxed vs active pace",
          "What's included in a moderate budget?"
        ];
      case 3:
        return [
          "What categories are best for first-time visitors?",
          "Explain the difference between categories",
          "Recommend categories for my destination"
        ];
      case 4:
        return [
          "What happens after I create my trip?",
          "Can I modify my trip later?",
          "How detailed will my itinerary be?"
        ];
      default:
        return [];
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col ${className}`}>
      {/* Chat Header */}
      <div className="border-b border-gray-200 px-4 py-3 rounded-t-lg bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Trip Planning Assistant</h3>
            <p className="text-xs text-gray-500">
              Step {currentStep} of 4 • Ask me anything about trip planning!
            </p>
          </div>
          
          {messages.length > 1 && (
            <button
              onClick={() => {
                if (window.confirm('Clear chat history?')) {
                  setMessages(messages.slice(0, 1)); // Keep welcome message
                }
              }}
              className="text-xs text-gray-400 hover:text-red-600 transition-colors"
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
        emptyStateMessage="Ask me about destinations, travel tips, or anything about planning your trip!"
      />

      {/* Chat Input */}
      <div className="rounded-b-lg">
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          placeholder="Ask about trip planning..."
        />
      </div>
    </div>
  );
};

export default CreateTripChat;
