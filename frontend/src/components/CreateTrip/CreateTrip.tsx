import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrips } from '../../hooks/useTrips';
import { tripAPI } from '../../services/api';
import { convertFormDataToParagraph } from '../../utils/tripParagraphGenerator';
import StepIndicator from './StepIndicator';
import BasicInfoStep from './BasicInfoStep';
import PreferencesStep from './PreferencesStep';
import CategoriesStep from './CategoriesStep';
import ReviewStep from './ReviewStep';
import CreateTripChat from './CreateTripChat';

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
  const { createTrip, loading } = useTrips();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<TripFormData>(INITIAL_FORM_DATA);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [userPreferences, setUserPreferences] = useState<string[]>([]); // Store chat preferences

  const totalSteps = 4;

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

  const handleUserPreferences = (preferences: string[]) => {
    setUserPreferences(preferences);
  };

  const handleSubmit = async () => {
    try {
      // Generate natural language paragraph from form data
      let tripDescription = convertFormDataToParagraph(formData);
      
      // Add user preferences from chat if any
      if (userPreferences.length > 0) {
        const additionalPreferences = userPreferences.join(' ');
        tripDescription += ` Additionally: ${additionalPreferences}`;
      }
      
      console.log('Generated trip description:', tripDescription);
      
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
        status: 'planned' as const,
        itinerary: response.data.itinerary || [],
      };

      const newTrip = await createTrip(tripData);
      console.log('Trip created successfully:', newTrip);
      
      // Navigate to dashboard or trip detail
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to create trip:', error);
      setFormErrors({ submit: 'Failed to create trip. Please try again.' });
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
            loading={loading}
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
        /* Steps 1-3: Centered Layout with Compact Trip Request */
        <div className="max-w-4xl mx-auto">
          {/* Form Content */}
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
                onClick={handleNext}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Next
              </button>
            </div>
          </div>

          {/* Compact Trip Request Display */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-semibold text-blue-900">Your Trip Request Preview</h3>
            </div>
            <div className="bg-gray-50 rounded-md p-4 border border-blue-100">
              <p className="text-gray-700 text-sm leading-relaxed">
                {currentStep >= 1 && formData.destination ? 
                  convertFormDataToParagraph(formData) : 
                  "Fill out the form above to see your trip request preview..."
                }
              </p>
            </div>
          </div>

          {/* Error Display */}
          {formErrors.submit && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-800 text-sm">{formErrors.submit}</p>
            </div>
          )}
        </div>
      ) : (
        /* Step 4: Two Column Layout with Full Chat */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Trip Creation Form */}
          <div className="lg:col-span-2">
            {/* Form Content */}
            <div className="bg-white shadow-lg rounded-lg">
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
                  disabled={loading}
                  className={`px-4 py-2 text-sm font-medium rounded-md ${
                    loading
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500'
                  }`}
                >
                  {loading ? 'Creating Trip...' : 'Create Trip'}
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

          {/* Right Column - Create Trip Chat */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 h-[700px]">
              <CreateTripChat 
                tripId={`draft-${Date.now()}`}
                currentStep={currentStep}
                formData={formData}
                onUserPreferences={handleUserPreferences}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateTrip;
