import React from 'react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, totalSteps }) => {
  const steps = [
    { number: 1, title: 'Basic Info', description: 'Destination & dates' },
    { number: 2, title: 'Preferences', description: 'Budget & interests' },
    { number: 3, title: 'Categories', description: 'Activity types' },
    { number: 4, title: 'Review', description: 'Confirm & create' },
  ];

  return (
    <nav aria-label="Progress">
      <ol className="flex items-center justify-between">
        {steps.map((step, stepIdx) => (
          <li key={step.number} className={`relative ${stepIdx !== steps.length - 1 ? 'flex-1' : ''}`}>
            {/* Step Connector */}
            {stepIdx !== steps.length - 1 && (
              <div
                className={`absolute top-4 left-8 right-0 h-0.5 ${
                  step.number < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                }`}
                aria-hidden="true"
              />
            )}

            {/* Step Content */}
            <div className="relative flex items-start">
              <span className="flex h-9 items-center">
                <span
                  className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-semibold ${
                    step.number < currentStep
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : step.number === currentStep
                      ? 'border-blue-600 bg-white text-blue-600'
                      : 'border-gray-300 bg-white text-gray-500'
                  }`}
                >
                  {step.number < currentStep ? (
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    step.number
                  )}
                </span>
              </span>
              <span className="ml-4 min-w-0 flex flex-col">
                <span
                  className={`text-sm font-medium ${
                    step.number <= currentStep ? 'text-blue-600' : 'text-gray-500'
                  }`}
                >
                  {step.title}
                </span>
                <span className="text-sm text-gray-500">{step.description}</span>
              </span>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default StepIndicator;
