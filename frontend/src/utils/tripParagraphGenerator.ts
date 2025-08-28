import { TripFormData } from '../components/CreateTrip/CreateTrip';

/**
 * Converts structured trip form data into a natural language paragraph
 * that can be sent to the backend for trip generation
 */
export function convertFormDataToParagraph(formData: TripFormData): string {
  const {
    destination,
    startDate,
    endDate,
    travelers,
    budget,
    pace,
    categories
  } = formData;

  // Helper function to format dates nicely
  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // Helper function to calculate trip duration
  const getTripDuration = (): string => {
    if (!startDate || !endDate) return '';
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 1 ? '1 day' : `${diffDays} days`;
  };

  // Helper function to format travelers
  const getTravelersText = (): string => {
    if (travelers === 1) return 'solo';
    if (travelers === 2) return 'with my partner';
    return `with a group of ${travelers} people`;
  };

  // Helper function to format budget
  const getBudgetText = (): string => {
    const budgetMap = {
      low: 'budget-friendly',
      medium: 'moderate',
      high: 'luxury'
    };
    return budgetMap[budget] || 'moderate';
  };

  // Helper function to format pace
  const getPaceText = (): string => {
    const paceMap = {
      relaxed: 'relaxed pace',
      moderate: 'moderate pace', 
      active: 'active and packed schedule'
    };
    return paceMap[pace] || 'moderate pace';
  };

  // Helper function to derive interests from categories
  const getInterestsFromCategories = (): string => {
    if (!categories || categories.length === 0) return '';
    
    // Map categories to interest-like descriptions
    const categoryToInterestMap: Record<string, string> = {
      'restaurants': 'culinary adventures',
      'attractions': 'cultural experiences and sightseeing',
      'entertainment': 'entertainment and shows',
      'shopping': 'shopping experiences',
      'outdoor': 'nature and outdoor activities',
      'museums': 'art and cultural institutions',
      'wellness': 'relaxation and wellness',
      'sports': 'sports and recreational activities',
      'transportation': 'local transportation experiences',
      'nightlife': 'nightlife and evening entertainment',
      'cultural': 'cultural experiences and traditions',
      'beaches': 'beach activities and water sports'
    };

    const derivedInterests = categories
      .map(cat => categoryToInterestMap[cat])
      .filter(Boolean)
      .slice(0, 3); // Limit to 3 main interests for readability
    
    if (derivedInterests.length === 0) return '';
    
    if (derivedInterests.length === 1) {
      return ` I'm particularly interested in ${derivedInterests[0]}.`;
    } else if (derivedInterests.length === 2) {
      return ` I'm particularly interested in ${derivedInterests[0]} and ${derivedInterests[1]}.`;
    } else {
      const lastInterest = derivedInterests.pop();
      return ` I'm particularly interested in ${derivedInterests.join(', ')}, and ${lastInterest}.`;
    }
  };

  // Helper function to format categories
  const getCategoriesText = (): string => {
    if (!categories || categories.length === 0) return '';
    
    const categoryMap: Record<string, string> = {
      restaurants: 'dining at local restaurants',
      attractions: 'visiting tourist attractions',
      entertainment: 'entertainment and shows',
      shopping: 'shopping experiences',
      outdoor: 'outdoor activities',
      museums: 'museums and galleries',
      sports: 'sports activities',
      wellness: 'wellness and spa treatments',
      tours: 'guided tours',
      transportation: 'local transportation experiences'
    };

    const mappedCategories = categories.map(cat => categoryMap[cat] || cat);
    
    if (mappedCategories.length === 1) {
      return ` Please focus on ${mappedCategories[0]}.`;
    } else if (mappedCategories.length === 2) {
      return ` Please focus on ${mappedCategories[0]} and ${mappedCategories[1]}.`;
    } else {
      const lastCategory = mappedCategories.pop();
      return ` Please focus on ${mappedCategories.join(', ')}, and ${lastCategory}.`;
    }
  };

  // Build the paragraph
  let paragraph = `I would like to plan a trip to ${destination}`;
  
  // Add duration if we have dates
  const duration = getTripDuration();
  if (duration) {
    paragraph += ` for ${duration}`;
  }
  
  // Add dates if available
  if (startDate && endDate) {
    paragraph += `, from ${formatDate(startDate)} to ${formatDate(endDate)}`;
  }
  
  // Add travelers info
  paragraph += `. I am traveling ${getTravelersText()}`;
  
  // Add budget and pace
  paragraph += ` with a ${getBudgetText()} budget in mind and prefer a ${getPaceText()}`;
  
  // Add interests derived from categories
  const interestsText = getInterestsFromCategories();
  if (interestsText) {
    paragraph += `.${interestsText}`;
  } else {
    paragraph += '.';
  }
  
  // Add categories
  const categoriesText = getCategoriesText();
  if (categoriesText) {
    paragraph += categoriesText;
  }
  
  return paragraph;
}

// Example usage and test function
export function testParagraphGeneration() {
  const sampleFormData: TripFormData = {
    destination: 'Tokyo',
    startDate: '2025-09-15',
    endDate: '2025-09-22',
    travelers: 2,
    budget: 'medium',
    pace: 'moderate',
    interests: [],
    categories: ['restaurants', 'museums', 'attractions']
  };

  const paragraph = convertFormDataToParagraph(sampleFormData);
  console.log('Generated paragraph:', paragraph);
  return paragraph;
}
