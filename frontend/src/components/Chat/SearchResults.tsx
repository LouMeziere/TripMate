import React from 'react';
import { SearchResultsData, SearchResult } from './ChatMessage';

interface SearchResultsProps {
  searchResults: SearchResultsData;
  onAddToTrip?: (place: SearchResult) => void;
  onReplaceActivity?: (place: SearchResult) => void;
  onGetDetails?: (place: SearchResult) => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({ 
  searchResults, 
  onAddToTrip,
  onReplaceActivity,
  onGetDetails 
}) => {
  // Defensive checks
  if (!searchResults) {
    return null;
  }

  if (!searchResults.success || !searchResults.results || searchResults.results.length === 0) {
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
    <div className="mt-3 max-w-full overflow-hidden">
      {/* Search Info Header */}
      <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
        <div className="flex items-center text-xs text-blue-800">
          <svg className="w-3 h-3 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
          <span className="font-medium truncate">
            {searchResults.resultCount} places near {searchResults.searchLocation}
          </span>
        </div>
      </div>

      {/* Places Grid */}
      <div className="space-y-1.5">
        {searchResults.results.map((place, index) => {
          // Ensure place has required data
          if (!place || typeof place !== 'object') {
            return null;
          }
          
          return (
            <div key={place.id || index} className="bg-white border border-gray-200 rounded-md p-2 hover:shadow-sm transition-shadow max-w-full overflow-hidden">
              {/* Place Header */}
              <div className="flex justify-between items-start mb-1 min-w-0">
                <div className="flex-1 min-w-0 pr-2">
                  <h4 
                    className="text-sm font-medium text-gray-900 text-left leading-tight"
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      wordBreak: 'break-word'
                    }}
                  >
                    {place.name || 'Unknown Place'}
                  </h4>
                  <p className="text-xs text-gray-600 text-left truncate">
                    {place.category || 'General'}
                  </p>
                </div>
                {place.distance && (
                  <span className="ml-2 px-1.5 py-0.5 bg-gray-100 text-gray-700 text-xs rounded flex-shrink-0">
                    {place.distance}
                  </span>
                )}
              </div>

              {/* Address */}
              <div className="flex items-start mb-1 min-w-0">
                <svg className="w-3 h-3 text-gray-400 mr-1 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <p 
                  className="text-xs text-gray-600 flex-1 text-left leading-tight min-w-0"
                  style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    wordBreak: 'break-word'
                  }}
                >
                  {place.address || 'Address not available'}
                </p>
              </div>

            {/* Rating and Price */}
            <div className="flex items-center gap-3 mb-1.5">
              {place.rating && (
                <div className="flex items-center">
                  <svg className="w-3 h-3 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-xs font-medium text-gray-700">{place.rating}/5</span>
                </div>
              )}
              {place.price && (
                <div className="flex items-center">
                  <span className="text-xs font-medium text-green-600">
                    {'$'.repeat(place.price)}
                  </span>
                </div>
              )}
            </div>

            {/* Website */}
            {place.website && (
              <div className="mb-1.5 min-w-0">
                <a 
                  href={place.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-800 underline flex items-center text-left truncate max-w-full"
                  title={place.website}
                >
                  <svg className="w-3 h-3 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.559-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.559.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clipRule="evenodd" />
                  </svg>
                  <span className="truncate">Website</span>
                </a>
              </div>
            )}

            {/* Action Buttons */}
              <div className="flex gap-1 justify-stretch mt-2">
                {onGetDetails && (
                  <button
                    onClick={() => onGetDetails(place)}
                    className="flex-1 h-8 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center"
                    title="More details"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12,2C6.48,2 2,6.48 2,12C2,17.52 6.48,22 12,22C17.52,22 22,17.52 22,12C22,6.48 17.52,2 12,2ZM13,17H11V11H13V17ZM13,9H11V7H13V9Z"/>
                    </svg>
                  </button>
                )}
                {onAddToTrip && (
                  <button
                    onClick={() => onAddToTrip(place)}
                    className="flex-1 h-8 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors duration-200 flex items-center justify-center"
                    title="Add to trip"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"/>
                    </svg>
                  </button>
                )}
                {onReplaceActivity && (
                  <button
                    onClick={() => onReplaceActivity(place)}
                    className="flex-1 h-8 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors duration-200 flex items-center justify-center"
                    title="Replace activity"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12,6V9L16,5L12,1V4A8,8 0 0,0 4,12C4,13.57 4.46,15.03 5.24,16.26L6.7,14.8C6.25,13.97 6,13 6,12A6,6 0 0,1 12,6M18.76,7.74L17.3,9.2C17.74,10.04 18,11 18,12A6,6 0 0,1 12,18V15L8,19L12,23V20A8,8 0 0,0 20,12C20,10.43 19.54,8.97 18.76,7.74Z"/>
                    </svg>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SearchResults;
