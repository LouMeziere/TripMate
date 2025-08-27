import React from 'react';
import ChatMessage, { Message } from './ChatMessage';

interface ChatContainerProps {
  messages: Message[];
  isLoading?: boolean;
  onSuggestionClick?: (suggestion: string) => void;
  emptyStateMessage?: string;
  disableAutoScroll?: boolean;
  initialSuggestions?: string[];
}

const ChatContainer: React.FC<ChatContainerProps> = ({
  messages,
  isLoading = false,
  onSuggestionClick,
  emptyStateMessage = "Start a conversation to plan your perfect trip!",
  initialSuggestions = ["Plan a trip", "Travel tips", "Budget advice"]
}) => {
  // Empty state
  if (messages.length === 0 && !isLoading) {
    return (
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
          <p className="text-gray-600 mb-4">
            {emptyStateMessage}
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {initialSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => onSuggestionClick?.(suggestion)}
                className="px-3 py-1 text-sm bg-purple-50 text-purple-600 border border-purple-200 rounded-full hover:bg-purple-100 transition-colors duration-200"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-hidden">
      <div className="h-full overflow-y-auto p-4 space-y-1">
        {messages.map((message, index) => (
          <div key={message.id}>
            <ChatMessage 
              message={message} 
              onSuggestionClick={onSuggestionClick}
            />
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
  );
};

export default ChatContainer;
