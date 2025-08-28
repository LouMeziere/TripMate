/**
 * MILESTONE 1 TEST: State Tracking System
 * Testing the replacement state management in geminiAPI.js
 */

const { processChatMessage } = require('./integrations/geminiAPI');

// Mock trip context for testing
const mockTripContext = {
  id: 'test-trip-1',
  destination: 'Bordeaux',
  itinerary: [
    {
      day: 1,
      activities: [
        {
          name: "Musée d'Aquitaine",
          category: 'culture',
          scheduledTime: 'morning',
          duration: '2h',
          address: 'Bordeaux, France'
        },
        {
          name: "Place de la Bourse",
          category: 'sightseeing',
          scheduledTime: 'afternoon',
          duration: '1h',
          address: 'Bordeaux, France'
        }
      ]
    }
  ]
};

// Test scenarios for Milestone 1
const testScenarios = [
  {
    name: 'Step 1: User wants to change an activity',
    message: 'I want to change an activity',
    expectedState: {
      action: 'replace',
      current_activity: null,
      replacement_activity: null,
      confirmation: false
    }
  },
  {
    name: 'Step 2: User specifies which activity to change',
    message: "Musée d'Aquitaine",
    initialState: { action: 'replace', current_activity: null, replacement_activity: null, confirmation: false },
    expectedState: {
      action: 'replace',
      current_activity: "Musée d'Aquitaine",
      replacement_activity: null,
      confirmation: false
    }
  },
  {
    name: 'Step 3: User specifies replacement activity',
    message: 'with Grand Théâtre de Bordeaux',
    initialState: { action: 'replace', current_activity: "Musée d'Aquitaine", replacement_activity: null, confirmation: false },
    expectedState: {
      action: 'replace',
      current_activity: "Musée d'Aquitaine",
      replacement_activity: 'Grand Théâtre de Bordeaux',
      confirmation: false
    }
  },
  {
    name: 'Step 4: AI confirms replacement (should be detected in response)',
    message: 'yes, that sounds good',
    initialState: { action: 'replace', current_activity: "Musée d'Aquitaine", replacement_activity: 'Grand Théâtre de Bordeaux', confirmation: false },
    expectedState: {
      action: 'replace',
      current_activity: "Musée d'Aquitaine", 
      replacement_activity: 'Grand Théâtre de Bordeaux',
      confirmation: true
    }
  }
];

async function runMilestone1Tests() {
  console.log('🧪 MILESTONE 1 TESTING: State Tracking System');
  console.log('='.repeat(50));
  
  for (let i = 0; i < testScenarios.length; i++) {
    const scenario = testScenarios[i];
    console.log(`\n${i + 1}. ${scenario.name}`);
    console.log(`   Input: "${scenario.message}"`);
    
    try {
      // Use provided initial state or default empty state
      const initialState = scenario.initialState || {
        current_activity: null,
        replacement_activity: null,
        action: null,
        confirmation: false
      };
      
      console.log(`   Initial State:`, initialState);
      
      // Call processChatMessage with mock data
      const result = await processChatMessage(
        scenario.message,
        mockTripContext,
        [], // empty chat history
        { ...initialState } // clone initial state
      );
      
      console.log(`   AI Response: "${result.response}"`);
      console.log(`   Final State:`, result.replacementState);
      
      // Check if state matches expected
      const actualState = result.replacementState;
      const expected = scenario.expectedState;
      
      const stateMatches = 
        actualState.action === expected.action &&
        actualState.current_activity === expected.current_activity &&
        actualState.replacement_activity === expected.replacement_activity &&
        actualState.confirmation === expected.confirmation;
      
      if (stateMatches) {
        console.log(`   ✅ PASS: State updated correctly`);
      } else {
        console.log(`   ❌ FAIL: State mismatch`);
        console.log(`      Expected:`, expected);
        console.log(`      Actual:`, actualState);
      }
      
    } catch (error) {
      console.log(`   ❌ ERROR: ${error.message}`);
    }
    
    console.log('-'.repeat(40));
  }
  
  console.log('\n🎯 Milestone 1 testing completed!');
  console.log('Next step: Review results and fix any issues before proceeding to Milestone 2');
}

// Run the tests
runMilestone1Tests().catch(console.error);
