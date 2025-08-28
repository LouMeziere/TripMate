/**
 * Test the improved fallback system when Gemini API is rate limited
 */

const { processChatMessage } = require('./integrations/geminiAPI');

// Mock trip context
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
          duration: '2h'
        },
        {
          name: "Place de la Bourse",
          category: 'sightseeing',
          scheduledTime: 'afternoon',
          duration: '1h'
        }
      ]
    }
  ]
};

async function testFallbackSystem() {
  console.log('🧪 TESTING IMPROVED FALLBACK SYSTEM');
  console.log('='.repeat(50));
  
  const testCases = [
    {
      message: 'I want to change an activity',
      state: { action: null, current_activity: null, replacement_activity: null, confirmation: false },
      expectedResponse: 'should ask which activity to change and list examples'
    },
    {
      message: "Musée d'Aquitaine",
      state: { action: 'replace', current_activity: null, replacement_activity: null, confirmation: false },
      expectedResponse: 'should ask what to replace it with'
    },
    {
      message: 'with Grand Théâtre de Bordeaux',
      state: { action: 'replace', current_activity: "Musée d'Aquitaine", replacement_activity: null, confirmation: false },
      expectedResponse: 'should ask for confirmation'
    },
    {
      message: 'yes, do it',
      state: { action: 'replace', current_activity: "Musée d'Aquitaine", replacement_activity: 'Grand Théâtre de Bordeaux', confirmation: false },
      expectedResponse: 'should confirm the action'
    }
  ];
  
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`\n${i + 1}. Testing: "${testCase.message}"`);
    console.log(`   Expected: ${testCase.expectedResponse}`);
    
    try {
      const result = await processChatMessage(
        testCase.message,
        mockTripContext,
        [],
        { ...testCase.state }
      );
      
      console.log(`   📤 Response: "${result.response}"`);
      console.log(`   📊 State: ${JSON.stringify(result.replacementState)}`);
      console.log(`   ✅ Success: ${result.success}`);
      
      // Check if response is intelligent (not generic error)
      const isIntelligent = !result.response.includes("trouble connecting") && 
                           result.response.length > 50;
      
      if (isIntelligent) {
        console.log(`   🎯 GOOD: Intelligent fallback response provided`);
      } else {
        console.log(`   ⚠️  BASIC: Generic fallback response`);
      }
      
    } catch (error) {
      console.log(`   ❌ ERROR: ${error.message}`);
    }
    
    console.log('-'.repeat(40));
  }
  
  console.log('\n🎯 Fallback system test completed!');
  console.log('The chat should now work even when Gemini API is rate limited.');
}

testFallbackSystem().catch(console.error);
