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
        if (formData.interests.length === 0) {
          errors.interests = 'Please select at least one interest';
        }
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

  const handleSubmit = async () => {
    try {
      // Generate natural language paragraph from form data
      const tripDescription = convertFormDataToParagraph(formData);
      console.log('Generated trip description:', tripDescription);
      
      // Call backend to generate trip using the paragraph
      const response = await tripAPI.generateTrip(tripDescription, false); // Set to true for real AI generation
      
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
    <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Trip</h1>
          <p className="mt-2 text-gray-600">
            Plan your perfect adventure with our AI-powered trip generator
          </p>
        </div>

        {/* Step Indicator */}
        <StepIndicator currentStep={currentStep} totalSteps={totalSteps} onStepClick={handleStepClick} />

        {/* Form Content */}
        <div className="mt-8 bg-white shadow-lg rounded-lg">
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

            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Next
              </button>
            ) : (
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
            )}
          </div>
        </div>

        {/* Error Display */}
        {formErrors.submit && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800 text-sm">{formErrors.submit}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateTrip;
