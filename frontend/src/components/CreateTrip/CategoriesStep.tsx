import React from 'react';
import { TripFormData } from './CreateTrip';

interface CategoriesStepProps {
  data: TripFormData;
  errors: Record<string, string>;
  onChange: (updates: Partial<TripFormData>) => void;
}

const CategoriesStep: React.FC<CategoriesStepProps> = ({ data, errors, onChange }) => {
  const categoryOptions = [
    {
      value: 'restaurants',
      label: 'Restaurants',
      description: 'Local dining and cuisine experiences',
      icon: '🍽️',
      color: 'bg-red-100 text-red-800 border-red-200'
    },
    {
      value: 'attractions',
      label: 'Tourist Attractions',
      description: 'Must-see landmarks and sights',
      icon: '🏛️',
      color: 'bg-blue-100 text-blue-800 border-blue-200'
    },
    {
      value: 'entertainment',
      label: 'Entertainment',
      description: 'Shows, concerts, and nightlife',
      icon: '🎭',
      color: 'bg-purple-100 text-purple-800 border-purple-200'
    },
    {
      value: 'shopping',
      label: 'Shopping',
      description: 'Markets, malls, and local shops',
      icon: '🛍️',
      color: 'bg-pink-100 text-pink-800 border-pink-200'
    },
    {
      value: 'outdoor',
      label: 'Outdoor Activities',
      description: 'Parks, hiking, and nature experiences',
      icon: '🌲',
      color: 'bg-green-100 text-green-800 border-green-200'
    },
    {
      value: 'museums',
      label: 'Museums & Galleries',
      description: 'Art, history, and cultural institutions',
      icon: '🎨',
      color: 'bg-indigo-100 text-indigo-800 border-indigo-200'
    },
    {
      value: 'wellness',
      label: 'Wellness & Spa',
      description: 'Relaxation and health experiences',
      icon: '🧘',
      color: 'bg-teal-100 text-teal-800 border-teal-200'
    },
    {
      value: 'sports',
      label: 'Sports & Recreation',
      description: 'Active sports and recreational activities',
      icon: '⚽',
      color: 'bg-orange-100 text-orange-800 border-orange-200'
    },
    {
      value: 'transportation',
      label: 'Transportation',
      description: 'Public transit and travel logistics',
      icon: '🚇',
      color: 'bg-gray-100 text-gray-800 border-gray-200'
    },
    {
      value: 'nightlife',
      label: 'Nightlife',
      description: 'Bars, clubs, and evening entertainment',
      icon: '🌙',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    },
    {
      value: 'cultural',
      label: 'Cultural Experiences',
      description: 'Local traditions and cultural immersion',
      icon: '🎪',
      color: 'bg-rose-100 text-rose-800 border-rose-200'
    },
    {
      value: 'beaches',
      label: 'Beaches & Water',
      description: 'Coastal activities and water sports',
      icon: '🏖️',
      color: 'bg-cyan-100 text-cyan-800 border-cyan-200'
    }
  ];

  const handleCategoryToggle = (category: string) => {
    const currentCategories = data.categories || [];
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter(c => c !== category)
      : [...currentCategories, category];
    onChange({ categories: newCategories });
  };

  const getSelectedCount = () => data.categories.length;
  const getRecommendedCount = () => Math.min(Math.max(3, Math.ceil(categoryOptions.length * 0.4)), 6);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Activity Categories</h2>
        <p className="text-gray-600">
          Choose the types of places and activities you'd like to include in your itinerary
        </p>
      </div>

      {/* Selection Guidelines */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex items-start">
          <svg className="h-5 w-5 text-blue-400 mt-0.5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="text-sm font-medium text-blue-800">Selection Tips</h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Select at least one category to continue</li>
                <li>We recommend choosing {getRecommendedCount()} categories for a balanced itinerary</li>
                <li>You can always modify your selections later</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Selection Counter */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">
          Selected: {getSelectedCount()} / {categoryOptions.length}
        </span>
        {data.categories.length > 0 && (
          <button
            type="button"
            onClick={() => onChange({ categories: [] })}
            className="text-sm text-red-600 hover:text-red-500"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categoryOptions.map((category) => (
          <div
            key={category.value}
            onClick={() => handleCategoryToggle(category.value)}
            className={`relative cursor-pointer rounded-lg border-2 p-4 hover:shadow-md transition-all ${
              data.categories.includes(category.value)
                ? `${category.color} border-current`
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <div className="flex items-start">
              <span className="text-3xl mr-3">{category.icon}</span>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 mb-1">{category.label}</h3>
                <p className="text-sm text-gray-500">{category.description}</p>
              </div>
              {data.categories.includes(category.value) && (
                <div className="absolute top-3 right-3">
                  <svg className="h-5 w-5 text-current" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Error Display */}
      {errors.categories && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800 text-sm">{errors.categories}</p>
        </div>
      )}

      {/* Selected Categories Summary */}
      {data.categories.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <h4 className="text-sm font-medium text-green-800 mb-3">
            Selected Categories ({data.categories.length}):
          </h4>
          <div className="flex flex-wrap gap-2">
            {data.categories.map((categoryValue) => {
              const category = categoryOptions.find(opt => opt.value === categoryValue);
              return (
                <span
                  key={categoryValue}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                >
                  {category?.icon} {category?.label}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCategoryToggle(categoryValue);
                    }}
                    className="ml-2 text-green-600 hover:text-green-500"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};

export default CategoriesStep;
