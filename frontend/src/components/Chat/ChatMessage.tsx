import React from 'react';
import SearchResults from './SearchResults';

export interface SearchResult {
  id: string;
  name: string;
  address: string;
  category: string;
  distance?: string;
  rating?: number;
  price?: number;
  website?: string;
  hours?: any;
}

export interface SearchResultsData {
  success: boolean;
  results: SearchResult[];
  searchQuery: string;
  searchLocation: string;
  resultCount: number;
  error?: string;
}

export interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: string;
  suggestions?: string[];
  searchResults?: SearchResultsData;
}

interface ChatMessageProps {
  message: Message;
  onSuggestionClick?: (suggestion: string) => void;
  onAddToTrip?: (place: SearchResult) => void;
  onGetDetails?: (place: SearchResult) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ 
  message, 
  onSuggestionClick, 
  onAddToTrip, 
  onGetDetails 
}) => {
  const isUser = message.type === 'user';
  const isAI = message.type === 'ai';

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className={`flex mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex ${isUser ? 'max-w-xs lg:max-w-md' : 'max-w-md lg:max-w-2xl'} ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 ${isUser ? 'ml-3' : 'mr-3'}`}>
          {isUser ? (
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">U</span>
            </div>
          ) : (
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
          )}
        </div>

        {/* Message Content */}
        <div className="flex flex-col">
          <div
            className={`px-4 py-2 rounded-lg ${
              isUser
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-900 border border-gray-200'
            }`}
          >
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          </div>

          {/* Timestamp */}
          <div className={`mt-1 text-xs text-gray-500 ${isUser ? 'text-right' : 'text-left'}`}>
            {formatTime(message.timestamp)}
          </div>

          {/* AI Suggestions */}
          {isAI && message.suggestions && message.suggestions.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {message.suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => onSuggestionClick?.(suggestion)}
                  className="px-3 py-1 text-xs bg-white border border-purple-200 text-purple-600 rounded-full hover:bg-purple-50 hover:border-purple-300 transition-colors duration-200"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {/* Search Results */}
          {isAI && message.searchResults && (
            <SearchResults 
              searchResults={message.searchResults}
              onAddToTrip={onAddToTrip}
              onGetDetails={onGetDetails}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
