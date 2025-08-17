import React from 'react';
import { TripFormData } from './CreateTrip';

interface BasicInfoStepProps {
  data: TripFormData;
  errors: Record<string, string>;
  onChange: (updates: Partial<TripFormData>) => void;
}

const BasicInfoStep: React.FC<BasicInfoStepProps> = ({ data, errors, onChange }) => {
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Basic Information</h2>
        <p className="text-gray-600">Let's start with the essentials for your trip</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Destination */}
        <div>
          <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-2">
            Destination *
          </label>
          <input
            type="text"
            id="destination"
            value={data.destination}
            onChange={(e) => onChange({ destination: e.target.value })}
            placeholder="Where would you like to go?"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.destination ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.destination && (
            <p className="mt-1 text-sm text-red-600">{errors.destination}</p>
          )}
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
              Start Date *
            </label>
            <input
              type="date"
              id="startDate"
              value={data.startDate}
              min={today}
              onChange={(e) => onChange({ startDate: e.target.value })}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.startDate ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.startDate && (
              <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
            )}
          </div>

          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
              End Date *
            </label>
            <input
              type="date"
              id="endDate"
              value={data.endDate}
              min={data.startDate || today}
              onChange={(e) => onChange({ endDate: e.target.value })}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.endDate ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.endDate && (
              <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
            )}
          </div>
        </div>

        {/* Number of Travelers */}
        <div>
          <label htmlFor="travelers" className="block text-sm font-medium text-gray-700 mb-2">
            Number of Travelers *
          </label>
          <select
            id="travelers"
            value={data.travelers}
            onChange={(e) => onChange({ travelers: parseInt(e.target.value) })}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.travelers ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => (
              <option key={num} value={num}>
                {num} {num === 1 ? 'traveler' : 'travelers'}
              </option>
            ))}
          </select>
          {errors.travelers && (
            <p className="mt-1 text-sm text-red-600">{errors.travelers}</p>
          )}
        </div>

        {/* Trip Duration Display */}
        {data.startDate && data.endDate && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-blue-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm text-blue-800">
                Trip Duration: {Math.ceil((new Date(data.endDate).getTime() - new Date(data.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BasicInfoStep;
