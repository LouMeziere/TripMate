import React from 'react';

const CreateTrip: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Create Trip</h2>
            <p className="text-gray-600">Trip creation form will be implemented in Milestone 3</p>
            <div className="mt-6">
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <p className="text-green-800 text-sm">
                  🚀 <strong>Coming Soon:</strong> Multi-step form with AI-powered trip generation
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTrip;
