import React, { useState, useEffect } from 'react';
import { chatAPI } from '../../services/api';
import ChatContainer from './ChatContainer';
import ChatInput from './ChatInput';
import { Message } from './ChatMessage';

interface EmbeddedChatProps {
  tripId: string;
  tripTitle: string;
  tripContext?: any;
  className?: string;
}

const EmbeddedChat: React.FC<EmbeddedChatProps> = ({
  tripId,
  tripTitle,
  tripContext,
  className = ""
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Generate initial suggestions for trip context
  const getInitialSuggestions = () => {
    return ['Change an activity', 'Local recommendations', 'Transportation help'];
  };

  if (isInitialLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col ${className}`}>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin w-6 h-6 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading chat...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col ${className}`}>
      {/* Chat Header */}
      <div className="border-b border-gray-200 px-4 py-3 rounded-t-lg bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">AI Assistant</h3>
            
            {/* Selected Trip Indicator */}
            <div className="flex items-center mt-1">
              <span className="text-xs text-gray-600">Selected trip:</span>
              <span className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded font-medium">
                {tripTitle}
              </span>
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
    </div>
  );
};

export default EmbeddedChat;
