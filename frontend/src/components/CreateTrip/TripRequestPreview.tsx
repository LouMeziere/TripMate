import React from 'react';
import { TripFormData } from './CreateTrip';
import { convertFormDataToParagraph } from '../../utils/tripParagraphGenerator';

interface TripRequestPreviewProps {
  formData: TripFormData;
  userAdditions: string[];
  isInteractive: boolean; // false for steps 1-3, true for step 4
  currentAddition: string;
  onAdditionChange: (value: string) => void;
  onAddRequest: () => void;
  onRemoveAddition: (index: number) => void;
  onClearAll: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const TripRequestPreview: React.FC<TripRequestPreviewProps> = ({
  formData,
  userAdditions,
  isInteractive,
  currentAddition,
  onAdditionChange,
  onAddRequest,
  onRemoveAddition,
  onClearAll,
  isCollapsed,
  onToggleCollapse,
}) => {
  const hasContent = formData.destination || formData.startDate || formData.endDate;

  if (isCollapsed) {
    return (
      /* Collapsed Preview - Vertical Strip */
      <div className="bg-gradient-to-b from-blue-50 to-indigo-50 border border-blue-200 rounded-lg shadow-sm h-80 w-12 flex flex-col items-center justify-between py-3 relative">
        {/* Document Icon */}
        <div className="w-6 h-6 bg-blue-100 rounded-md flex items-center justify-center">
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        
        {/* Vertical Text */}
        <div className="flex flex-col items-center space-y-1 flex-1 justify-center">
          {['P', 'R', 'E', 'V', 'I', 'E', 'W'].map((letter, index) => (
            <span 
              key={index} 
              className="text-xs font-medium text-blue-800"
            >
              {letter}
            </span>
          ))}
        </div>
        
        {/* Expand Button */}
        <button
          onClick={onToggleCollapse}
          className="text-blue-600 hover:text-blue-800 p-1 rounded-md hover:bg-blue-100 transition-colors"
          title="Expand preview"
        >
          <svg className="w-3 h-3 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    /* Expanded Preview - Chat-like Design */
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm h-[600px] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <button
          onClick={onToggleCollapse}
          className="text-blue-600 hover:text-blue-800 p-1 rounded-md hover:bg-blue-100 transition-colors"
          title="Collapse preview"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-blue-900">
              {'Current Trip Request'}
            </h3>
            <p className="text-sm text-blue-600">
              {isInteractive 
                ? 'Review and customize your trip' 
                : 'Updates as you fill out the form'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Main Trip Request Section */}
        {hasContent ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="mb-2">
              <span className="text-sm font-medium text-blue-900">Your Trip Request</span>
            </div>
            <p className="text-sm text-gray-800 leading-relaxed">
              {convertFormDataToParagraph(formData)}
            </p>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-sm text-gray-500">
              Start filling out your trip details to see your personalized request
            </p>
          </div>
        )}

        {/* User Additions Section - Only show if there are additions */}
        {userAdditions.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-green-900">Additional Requests</span>
              {isInteractive && (
                <button
                  onClick={onClearAll}
                  className="text-xs text-red-600 hover:text-red-800 font-medium"
                >
                  Clear All
                </button>
              )}
            </div>
            <div className="space-y-2">
              {userAdditions.map((addition, index) => (
                <div key={index} className="flex items-start justify-between group">
                  <p className="text-sm text-gray-800 flex-1 pr-2">
                    {addition}
                  </p>
                  {isInteractive && (
                    <button
                      onClick={() => onRemoveAddition(index)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-red-500 hover:text-red-700 flex-shrink-0"
                      title="Remove this request"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Helper Text - Only show when no additions and interactive */}
        {userAdditions.length === 0 && isInteractive && hasContent && (
          <div className="text-center py-4">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <p className="text-sm text-gray-500">Add any special requests or preferences below</p>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4">
        {isInteractive ? (
          /* Interactive Input for Step 4 */
          <div className="space-y-3">
            <div className="flex space-x-3">
              <div className="flex-1">
                <textarea
                  value={currentAddition}
                  onChange={(e) => onAdditionChange(e.target.value)}
                  placeholder="Add specific places to visit, or any other preferences..."
                  className="w-full text-sm border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={2}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      onAddRequest();
                    }
                  }}
                />
              </div>
              <button
                onClick={onAddRequest}
                disabled={!currentAddition.trim()}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors self-start ${
                  currentAddition.trim()
                    ? 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-gray-500">Press Enter to add, Shift+Enter for new line</p>
          </div>
        ) : (
          /* Locked Input for Steps 1-3 */
          <div className="space-y-3">
            <div className="relative">
              <div className="flex space-x-3">
                <div className="flex-1 relative">
                  <textarea
                    value=""
                    placeholder="Additional requests can be added in the Review step..."
                    className="w-full text-sm border border-gray-300 rounded-lg p-3 bg-gray-50 text-gray-500 cursor-not-allowed resize-none"
                    rows={2}
                    disabled
                  />
                  {/* Lock overlay */}
                  <div className="absolute inset-0 bg-gray-100 bg-opacity-50 rounded-lg flex items-center justify-center">
                    <div className="bg-white rounded-full p-2 shadow-sm">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <button
                  disabled
                  className="px-4 py-2 rounded-lg font-medium text-sm bg-gray-200 text-gray-400 cursor-not-allowed self-start"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Available in Review Step</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TripRequestPreview;
