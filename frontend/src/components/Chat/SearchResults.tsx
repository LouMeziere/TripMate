import React from 'react';
import { SearchResultsData, SearchResult } from './ChatMessage';

interface SearchResultsProps {
  searchResults: SearchResultsData;
  onAddToTrip?: (place: SearchResult) => void;
  onGetDetails?: (place: SearchResult) => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({ 
  searchResults, 
  onAddToTrip, 
  onGetDetails 
}) => {
  if (!searchResults.success || searchResults.results.length === 0) {
    return (
      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-center">
          <svg className="w-4 h-4 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span className="text-sm text-yellow-800">
            {searchResults.error || 'No places found for your search.'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3">
      {/* Search Info Header */}
      <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center text-sm text-blue-800">
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">
            Found {searchResults.resultCount} places for "{searchResults.searchQuery}" 
            near {searchResults.searchLocation}
          </span>
        </div>
      </div>

      {/* Places Grid */}
      <div className="space-y-2">
        {searchResults.results.map((place, index) => (
          <div key={place.id || index} className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
            {/* Place Header */}
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1 min-w-0">
                <h4 className="text-base font-medium text-gray-900 truncate text-left">{place.name}</h4>
                <p className="text-sm text-gray-600 mt-1 text-left">{place.category}</p>
              </div>
              {place.distance && (
                <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full flex-shrink-0">
                  {place.distance}
                </span>
              )}
            </div>

            {/* Address */}
            <div className="flex items-start mb-2">
              <svg className="w-4 h-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-gray-600 flex-1 text-left">{place.address}</p>
            </div>

            {/* Rating and Price */}
            <div className="flex items-center gap-4 mb-3">
              {place.rating && (
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">{place.rating}/5</span>
                  <span className="text-xs text-gray-500 ml-1">(Reviews)</span>
                </div>
              )}
              {place.price && (
                <div className="flex items-center">
                  <span className="text-sm font-medium text-green-600">
                    {'$'.repeat(place.price)}
                  </span>
                  <span className="text-xs text-gray-500 ml-1">Price Level</span>
                </div>
              )}
              {!place.rating && !place.price && (
                <span className="text-xs text-gray-400">No rating available</span>
              )}
            </div>

            {/* Website */}
            {place.website && (
              <div className="mb-2">
                <a 
                  href={place.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 underline flex items-center text-left"
                >
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.559-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.559.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clipRule="evenodd" />
                  </svg>
                  Visit Website
                </a>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 mt-2">
              {onGetDetails && (
                <button
                  onClick={() => onGetDetails(place)}
                  className="flex-1 px-2 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-md hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center"
                >
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Details
                </button>
              )}
              {onAddToTrip && (
                <button
                  onClick={() => onAddToTrip(place)}
                  className="flex-1 px-2 py-1.5 bg-purple-100 text-purple-700 text-xs rounded-md hover:bg-purple-200 transition-colors duration-200 flex items-center justify-center"
                >
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Add to Trip
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchResults;
