import React from 'react';
import { TripFormData } from './CreateTrip';

interface PreferencesStepProps {
  data: TripFormData;
  errors: Record<string, string>;
  onChange: (updates: Partial<TripFormData>) => void;
}

const PreferencesStep: React.FC<PreferencesStepProps> = ({ data, errors, onChange }) => {
  const budgetOptions = [
    { value: 'low', label: 'Budget-Friendly', description: 'Under $100/day', icon: '💰' },
    { value: 'medium', label: 'Moderate', description: '$100-250/day', icon: '💵' },
    { value: 'high', label: 'Luxury', description: '$250+/day', icon: '💎' },
  ];

  const paceOptions = [
    { value: 'relaxed', label: 'Relaxed', description: 'Take it easy, plenty of rest time', icon: '🧘' },
    { value: 'moderate', label: 'Moderate', description: 'Balanced mix of activities and downtime', icon: '🚶' },
    { value: 'active', label: 'Active', description: 'Packed schedule, see everything', icon: '🏃' },
  ];



  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Travel Preferences</h2>
        <p className="text-gray-600">Help us personalize your trip experience</p>
      </div>

      {/* Budget Selection */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Budget Range</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {budgetOptions.map((option) => (
            <div
              key={option.value}
              onClick={() => onChange({ budget: option.value as any })}
              className={`relative cursor-pointer rounded-lg border p-4 hover:bg-gray-50 ${
                data.budget === option.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <span className="text-2xl mr-3">{option.icon}</span>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{option.label}</h4>
                  <p className="text-sm text-gray-500">{option.description}</p>
                </div>
                {data.budget === option.value && (
                  <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pace Selection */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Travel Pace</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {paceOptions.map((option) => (
            <div
              key={option.value}
              onClick={() => onChange({ pace: option.value as any })}
              className={`relative cursor-pointer rounded-lg border p-4 hover:bg-gray-50 ${
                data.pace === option.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <span className="text-2xl mr-3">{option.icon}</span>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{option.label}</h4>
                  <p className="text-sm text-gray-500">{option.description}</p>
                </div>
                {data.pace === option.value && (
                  <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PreferencesStep;
