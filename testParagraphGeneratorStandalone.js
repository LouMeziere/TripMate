// Simple standalone test for the paragraph generator
// Run with: node testParagraphGeneratorStandalone.js

// The main function (copied from tripParagraphGenerator.ts)
function convertFormDataToParagraph(formData) {
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
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // Helper function to calculate trip duration
  const getTripDuration = () => {
    if (!startDate || !endDate) return '';
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 1 ? '1 day' : `${diffDays} days`;
  };

  // Helper function to format travelers
  const getTravelersText = () => {
    if (travelers === 1) return 'solo';
    if (travelers === 2) return 'with my partner';
    return `with a group of ${travelers} people`;
  };

  // Helper function to format budget
  const getBudgetText = () => {
    const budgetMap = {
      low: 'budget-friendly',
      medium: 'moderate',
      high: 'luxury'
    };
    return budgetMap[budget] || 'moderate';
  };

  // Helper function to format pace
  const getPaceText = () => {
    const paceMap = {
      relaxed: 'relaxed pace',
      moderate: 'moderate pace', 
      active: 'active and packed schedule'
    };
    return paceMap[pace] || 'moderate pace';
  };

  // Helper function to derive interests from categories
  const getInterestsFromCategories = () => {
    if (!categories || categories.length === 0) return '';
    
    // Map categories to interest-like descriptions
    const categoryToInterestMap = {
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
  const getCategoriesText = () => {
    if (!categories || categories.length === 0) return '';
    
    const categoryMap = {
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
  
  // Add a nice closing
  paragraph += ' Please help me create an amazing itinerary that matches these preferences.';

  return paragraph;
}

// Test cases
function runTests() {
  console.log('='.repeat(80));
  console.log('🧪 TESTING TRIP PARAGRAPH GENERATOR');
  console.log('='.repeat(80));

  // Test 1: Complete trip to Tokyo
  console.log('\n📍 TEST 1: Complete Trip to Tokyo');
  const tokyoTrip = {
    destination: 'Tokyo',
    startDate: '2025-09-15',
    endDate: '2025-09-22',
    travelers: 2,
    budget: 'medium',
    pace: 'moderate',
    interests: [],
    categories: ['restaurants', 'museums', 'attractions']
  };
  console.log('Input:', JSON.stringify(tokyoTrip, null, 2));
  console.log('\n📝 Generated paragraph:');
  console.log(`"${convertFormDataToParagraph(tokyoTrip)}"`);

  // Test 2: Solo luxury trip to Paris
  console.log('\n' + '='.repeat(80));
  console.log('\n📍 TEST 2: Solo Luxury Trip to Paris');
  const parisTrip = {
    destination: 'Paris',
    startDate: '2025-12-20',
    endDate: '2025-12-27',
    travelers: 1,
    budget: 'high',
    pace: 'relaxed',
    interests: [],
    categories: ['museums', 'shopping', 'wellness']
  };
  console.log('Input:', JSON.stringify(parisTrip, null, 2));
  console.log('\n📝 Generated paragraph:');
  console.log(`"${convertFormDataToParagraph(parisTrip)}"`);

  // Test 3: Budget group trip to Barcelona
  console.log('\n' + '='.repeat(80));
  console.log('\n📍 TEST 3: Budget Group Trip to Barcelona');
  const barcelonaTrip = {
    destination: 'Barcelona',
    startDate: '2025-07-10',
    endDate: '2025-07-14',
    travelers: 6,
    budget: 'low',
    pace: 'active',
    interests: [],
    categories: ['outdoor', 'entertainment', 'attractions']
  };
  console.log('Input:', JSON.stringify(barcelonaTrip, null, 2));
  console.log('\n📝 Generated paragraph:');
  console.log(`"${convertFormDataToParagraph(barcelonaTrip)}"`);

  // Test 4: Minimal data weekend trip
  console.log('\n' + '='.repeat(80));
  console.log('\n📍 TEST 4: Minimal Data Weekend Trip');
  const minimalTrip = {
    destination: 'San Francisco',
    startDate: '2025-09-21',
    endDate: '2025-09-22',
    travelers: 2,
    budget: 'medium',
    pace: 'moderate',
    interests: [],
    categories: []
  };
  console.log('Input:', JSON.stringify(minimalTrip, null, 2));
  console.log('\n📝 Generated paragraph:');
  console.log(`"${convertFormDataToParagraph(minimalTrip)}"`);

  console.log('\n' + '='.repeat(80));
  console.log('✅ ALL TESTS COMPLETED!');
  console.log('='.repeat(80));
}

// Run the tests
if (require.main === module) {
  runTests();
}

module.exports = { convertFormDataToParagraph, runTests };
