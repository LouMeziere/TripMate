import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { chatAPI } from '../../services/api';
import ChatContainer from './ChatContainer';
import ChatInput from './ChatInput';
import { Message } from './ChatMessage';

const Chat: React.FC = () => {
  const { tripId } = useParams<{ tripId?: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load chat history when component mounts or tripId changes
  useEffect(() => {
    const loadChatHistory = async () => {
      if (!tripId) {
        setIsInitialLoading(false);
        return;
      }
      
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

    loadChatHistory();
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
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">AI Travel Assistant</h1>
            {tripId ? (
              <p className="text-sm text-gray-500">Planning assistance for Trip {tripId}</p>
            ) : (
              <p className="text-sm text-gray-500">General travel planning</p>
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
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 mx-6 mt-4 rounded-md">
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
        emptyStateMessage={
          tripId 
            ? "Ask me anything about your trip planning!" 
            : "Start a conversation to plan your perfect trip!"
        }
      />

      {/* Chat Input */}
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
  );
};

export default Chat;
