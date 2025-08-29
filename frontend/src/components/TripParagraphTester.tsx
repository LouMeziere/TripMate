import React, { useState } from 'react';
import { convertFormDataToParagraph } from '../utils/tripParagraphGenerator';
import { TripFormData } from '../components/CreateTrip/CreateTrip';

const TripParagraphTester: React.FC = () => {
  const [formData, setFormData] = useState<TripFormData>({
    destination: 'Tokyo',
    startDate: '2025-09-15',
    endDate: '2025-09-22',
    travelers: 2,
    budget: 'medium',
    pace: 'moderate',
    interests: [],
    categories: ['restaurants', 'museums', 'attractions']
  });

  const [generatedParagraph, setGeneratedParagraph] = useState('');

  const handleGenerate = () => {
    const paragraph = convertFormDataToParagraph(formData);
    setGeneratedParagraph(paragraph);
    console.log('Generated paragraph:', paragraph);
  };

  const handleInputChange = (field: keyof TripFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCategoryToggle = (category: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const categoryOptions = ['restaurants', 'attractions', 'entertainment', 'shopping', 'outdoor', 'museums', 'sports', 'wellness', 'tours', 'transportation'];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Trip Paragraph Generator Tester</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Trip Details</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Destination</label>
            <input
              type="text"
              value={formData.destination}
              onChange={(e) => handleInputChange('destination', e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Date</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Travelers</label>
            <input
              type="number"
              min="1"
              value={formData.travelers}
              onChange={(e) => handleInputChange('travelers', parseInt(e.target.value))}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Budget</label>
            <select
              value={formData.budget}
              onChange={(e) => handleInputChange('budget', e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="low">Budget-Friendly</option>
              <option value="medium">Moderate</option>
              <option value="high">Luxury</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Pace</label>
            <select
              value={formData.pace}
              onChange={(e) => handleInputChange('pace', e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="relaxed">Relaxed</option>
              <option value="moderate">Moderate</option>
              <option value="active">Active</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Categories</label>
            <div className="flex flex-wrap gap-2">
              {categoryOptions.map(category => (
                <button
                  key={category}
                  onClick={() => handleCategoryToggle(category)}
                  className={`px-3 py-1 text-sm rounded-full border ${
                    formData.categories.includes(category)
                      ? 'bg-green-100 border-green-300 text-green-800'
                      : 'bg-gray-100 border-gray-300 text-gray-600'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Generate Paragraph
          </button>
        </div>

        {/* Generated Output */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Generated Paragraph</h3>
          <div className="bg-gray-50 border border-gray-200 rounded-md p-4 min-h-[200px]">
            {generatedParagraph ? (
              <p className="text-gray-700 leading-relaxed italic">
                "{generatedParagraph}"
              </p>
            ) : (
              <p className="text-gray-500">Click "Generate Paragraph" to see the result</p>
            )}
          </div>
          
          {generatedParagraph && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <p className="text-sm text-blue-700">
                ✅ This paragraph is ready to be sent to your backend API for trip generation!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TripParagraphTester;
