import React from 'react';
import { useParams } from 'react-router-dom';

const Chat: React.FC = () => {
  const { tripId } = useParams<{ tripId?: string }>();

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">AI Assistant</h2>
            {tripId && (
              <p className="text-sm text-gray-500 mb-4">Chat for Trip ID: {tripId}</p>
            )}
            <p className="text-gray-600">Chat interface will be implemented in Milestone 4</p>
            <div className="mt-6">
              <div className="bg-purple-50 border border-purple-200 rounded-md p-4">
                <p className="text-purple-800 text-sm">
                  🤖 <strong>Coming Soon:</strong> AI-powered trip planning assistant
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
