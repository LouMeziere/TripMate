import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrips } from '../../hooks/useTrips';
import { tripAPI } from '../../services/api';
import { convertFormDataToParagraph } from '../../utils/tripParagraphGenerator';
import StepIndicator from './StepIndicator';
import BasicInfoStep from './BasicInfoStep';
import PreferencesStep from './PreferencesStep';
import CategoriesStep from './CategoriesStep';
import ReviewStep from './ReviewStep';
import TripRequestPreview from './TripRequestPreview';

export interface TripFormData {
  // Basic Info (Step 1)
  destination: string;
  startDate: string;
  endDate: string;
  travelers: number;
  
  // Preferences (Step 2)
  budget: 'low' | 'medium' | 'high';
  pace: 'relaxed' | 'moderate' | 'active';
  interests: string[];
  
  // Categories (Step 3)
  categories: string[];
  
  // User additions (Step 4)
  userAdditions?: string[];
  
  // Generated content will be added in review step
  title?: string;
  itinerary?: any[];
}

const INITIAL_FORM_DATA: TripFormData = {
  destination: '',
  startDate: '',
  endDate: '',
  travelers: 1,
  budget: 'medium',
  pace: 'moderate',
  interests: [],
  categories: [],
};

const CreateTrip: React.FC = () => {
  const navigate = useNavigate();
  const { createDraftTrip } = useTrips();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<TripFormData>(INITIAL_FORM_DATA);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isPreviewCollapsed, setIsPreviewCollapsed] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false); // Local loading state
  
  // User additions state
  const [userAdditions, setUserAdditions] = useState<string[]>([]);
  const [currentAddition, setCurrentAddition] = useState('');

  const totalSteps = 4;

  // Auto-expand preview when reaching step 4
  useEffect(() => {
    if (currentStep === 4) {
      setIsPreviewCollapsed(false);
    }
  }, [currentStep]);

  // Form validation for each step
  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};

    switch (step) {
      case 1: // Basic Info
        if (!formData.destination.trim()) {
          errors.destination = 'Destination is required';
        }
        if (!formData.startDate) {
          errors.startDate = 'Start date is required';
        }
        if (!formData.endDate) {
          errors.endDate = 'End date is required';
        }
        if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
          errors.endDate = 'End date must be after start date';
        }
        if (formData.travelers < 1 || formData.travelers > 20) {
          errors.travelers = 'Number of travelers must be between 1 and 20';
        }
        break;
      
      case 2: // Preferences
        // No validation needed for preferences step anymore
        break;
      
      case 3: // Categories
        if (formData.categories.length === 0) {
          errors.categories = 'Please select at least one category';
        }
        break;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleStepClick = (step: number) => {
    setCurrentStep(step);
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleFormDataChange = (updates: Partial<TripFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    // Clear related errors when user updates data
    const updatedFields = Object.keys(updates);
    const clearedErrors = { ...formErrors };
    updatedFields.forEach(field => {
      delete clearedErrors[field];
    });
    setFormErrors(clearedErrors);
  };

  // User additions handler functions
  const handleAddToRequest = () => {
    if (currentAddition.trim()) {
      setUserAdditions(prev => [...prev, currentAddition.trim()]);
      setCurrentAddition('');
    }
  };

  const removeAddition = (index: number) => {
    setUserAdditions(prev => prev.filter((_, i) => i !== index));
  };

  const clearAllAdditions = () => {
    setUserAdditions([]);
  };

  const handleSubmit = async () => {
    setIsGenerating(true); // Start loading
    try {
      // Generate natural language paragraph from form data
      let tripDescription = convertFormDataToParagraph(formData);
      
      // Add user additions if any
      if (userAdditions.length > 0) {
        const additionalRequests = userAdditions.join(' ');
        tripDescription += ` Additional requests: ${additionalRequests}`;
      }
      
      // Call backend to generate trip using the paragraph
      const response = await tripAPI.generateTrip(tripDescription, true); // Use real AI generation
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to generate trip');
      }
      
      // Create trip data structure from the generated response
      const tripData = {
        title: `${formData.destination} Adventure`,
        destination: formData.destination,
        startDate: formData.startDate,
        endDate: formData.endDate,
        travelers: formData.travelers,
        budget: formData.budget,
        pace: formData.pace,
        categories: formData.categories,
        userAdditions: userAdditions,
        itinerary: response.data.itinerary || [],
      };

      // Create the trip as a draft - this will add it to the context automatically
      const newTrip = await createDraftTrip(tripData);
      
      // Add a small delay to ensure the context has updated
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Navigate to the newly created trip detail page
      navigate(`/trip/${newTrip.id}`);
    } catch (error) {
      console.error('Failed to create trip:', error);
      setFormErrors({ submit: 'Failed to create trip. Please try again.' });
    } finally {
      setIsGenerating(false); // Stop loading
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <BasicInfoStep
            data={formData}
            errors={formErrors}
            onChange={handleFormDataChange}
          />
        );
      case 2:
        return (
          <PreferencesStep
            data={formData}
            errors={formErrors}
            onChange={handleFormDataChange}
          />
        );
      case 3:
        return (
          <CategoriesStep
            data={formData}
            errors={formErrors}
            onChange={handleFormDataChange}
          />
        );
      case 4:
        return (
          <ReviewStep
            data={formData}
            errors={formErrors}
            onSubmit={handleSubmit}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Trip</h1>
        <p className="mt-2 text-gray-600">
          Plan your perfect adventure with our AI-powered trip generator
        </p>
      </div>

      {/* Step Indicator - Full Width */}
      <div className="mb-8">
        <StepIndicator currentStep={currentStep} totalSteps={totalSteps} onStepClick={handleStepClick} />
      </div>

      {/* Main Content - Conditional Layout */}
      {currentStep < 4 ? (
        /* Steps 1-3: Dynamic Layout with Collapsible Sidebar */
        <div className={`grid grid-cols-1 gap-6 max-w-6xl mx-auto ${
          isPreviewCollapsed ? 'lg:grid-cols-[1fr_60px]' : 'lg:grid-cols-[2fr_1fr]'
        }`}>
          {/* Form Content */}
          <div className="order-1">
            <div className={`bg-white shadow-lg rounded-lg mb-6 ${
              isPreviewCollapsed ? 'mx-auto' : ''
            }`}>
              <div className="px-6 py-8">
                {renderStep()}
              </div>

              {/* Navigation Buttons */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between rounded-b-lg">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  className={`px-4 py-2 text-sm font-medium rounded-md ${
                    currentStep === 1
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Back
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Next
                </button>
              </div>
            </div>

            {/* Error Display */}
            {formErrors.submit && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-800 text-sm">{formErrors.submit}</p>
              </div>
            )}
          </div>

          {/* Trip Request Preview - New Component */}
          <div className="order-2">
            <div className="sticky top-4">
              <TripRequestPreview
                formData={formData}
                userAdditions={userAdditions}
                isInteractive={false} // Locked for steps 1-3
                currentAddition={currentAddition}
                onAdditionChange={setCurrentAddition}
                onAddRequest={handleAddToRequest}
                onRemoveAddition={removeAddition}
                onClearAll={clearAllAdditions}
                isCollapsed={isPreviewCollapsed}
                onToggleCollapse={() => setIsPreviewCollapsed(!isPreviewCollapsed)}
              />
            </div>
          </div>
        </div>
      ) : (
        /* Step 4: Layout with Interactive Trip Request Preview */
        <div className={`grid grid-cols-1 gap-6 max-w-7xl mx-auto lg:grid-cols-[2fr_1fr]`}>
          {/* Form Content */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow-lg rounded-lg mb-6">
              <div className="px-6 py-8">
                {renderStep()}
              </div>

              {/* Navigation Buttons */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between rounded-b-lg">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  className={`px-4 py-2 text-sm font-medium rounded-md ${
                    currentStep === 1
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Back
                </button>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isGenerating}
                  className={`px-4 py-2 text-sm font-medium rounded-md flex items-center space-x-2 ${
                    isGenerating
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500'
                  }`}
                >
                  {isGenerating && (
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  <span>{isGenerating ? 'Generating Trip...' : 'Generate Draft'}</span>
                </button>
              </div>
            </div>

            {/* Error Display */}
            {formErrors.submit && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-800 text-sm">{formErrors.submit}</p>
              </div>
            )}
          </div>

          {/* Interactive Trip Request Preview */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <TripRequestPreview
                formData={formData}
                userAdditions={userAdditions}
                isInteractive={true} // Interactive for step 4
                currentAddition={currentAddition}
                onAdditionChange={setCurrentAddition}
                onAddRequest={handleAddToRequest}
                onRemoveAddition={removeAddition}
                onClearAll={clearAllAdditions}
                isCollapsed={isPreviewCollapsed}
                onToggleCollapse={() => setIsPreviewCollapsed(!isPreviewCollapsed)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateTrip;
