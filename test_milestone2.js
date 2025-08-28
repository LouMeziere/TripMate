/**
 * MILESTONE 2 TEST: Automatic Trigger System
 * Testing the complete replacement flow including Foursquare API and trip updates
 */

const axios = require('axios');

// Mock trip data for testing (simulating the backend)
const mockTrip = {
  id: 'test-trip-1',
  title: 'Test Trip to Bordeaux',
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

// Simulate the conversation flow that should trigger replacement
async function testCompleteReplacementFlow() {
  console.log('🧪 MILESTONE 2 TESTING: Automatic Trigger System');
  console.log('='.repeat(50));
  
  const baseUrl = 'http://localhost:3001/api/chat';
  const tripId = 'test-trip-1';
  
  console.log('\n🎭 Simulating complete replacement conversation...');
  
  const conversationSteps = [
    {
      step: 1,
      message: 'I want to change an activity',
      description: 'User initiates replacement'
    },
    {
      step: 2,
      message: "Musée d'Aquitaine", 
      description: 'User specifies current activity'
    },
    {
      step: 3,
      message: 'with Grand Théâtre de Bordeaux',
      description: 'User specifies replacement activity'
    },
    {
      step: 4,
      message: 'yes, replace it',
      description: 'User confirms replacement (should trigger)'
    }
  ];
  
  try {
    // Clear any existing chat history
    try {
      await axios.delete(`${baseUrl}/${tripId}`);
    } catch (e) {
      // Ignore if doesn't exist
    }
    
    let finalResult = null;
    
    for (const step of conversationSteps) {
      console.log(`\n${step.step}. ${step.description}`);
      console.log(`   💬 User: "${step.message}"`);
      
      try {
        const response = await axios.post(baseUrl, {
          message: step.message,
          tripId: tripId,
          tripContext: mockTrip,
          useRealAI: false // Use fallback responses to avoid API limits
        });
        
        const data = response.data.data;
        
        console.log(`   🤖 AI: "${data.aiMessage.content}"`);
        console.log(`   📊 Replacement State:`, data.replacementState);
        
        if (data.debugInfo) {
          console.log(`   🔍 Debug Info:`);
          console.log(`      Trigger Conditions:`, data.debugInfo.triggerConditions);
          console.log(`      Execution:`, data.debugInfo.execution);
        }
        
        if (data.updatedTrip) {
          console.log(`   🎯 REPLACEMENT TRIGGERED!`);
          console.log(`   ✅ Trip Updated:`, {
            id: data.updatedTrip.id,
            activityCount: data.updatedTrip.itinerary[0].activities.length,
            newActivity: data.updatedTrip.itinerary[0].activities[0].name
          });
          finalResult = data.updatedTrip;
        }
        
      } catch (error) {
        console.log(`   ❌ Request failed: ${error.message}`);
        if (error.response?.data) {
          console.log(`   📝 Error details:`, error.response.data);
        }
      }
      
      console.log('-'.repeat(40));
    }
    
    // Verify the final result
    console.log('\n🔍 FINAL VERIFICATION:');
    if (finalResult) {
      const firstActivity = finalResult.itinerary[0].activities[0];
      console.log(`✅ Replacement successful!`);
      console.log(`   Original: "Musée d'Aquitaine"`);
      console.log(`   New: "${firstActivity.name}"`);
      console.log(`   Timing preserved: ${firstActivity.scheduledTime} (${firstActivity.duration})`);
      
      if (firstActivity.name !== "Musée d'Aquitaine") {
        console.log(`✅ MILESTONE 2 PASS: Activity was successfully replaced`);
      } else {
        console.log(`❌ MILESTONE 2 FAIL: Activity was not replaced`);
      }
    } else {
      console.log(`❌ MILESTONE 2 FAIL: No replacement was triggered`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Test individual components first
async function testIndividualComponents() {
  console.log('\n🔧 Testing individual components...');
  
  // Test 1: Check if server is running
  try {
    const response = await axios.get('http://localhost:3001/api/chat/test-ping', {
      timeout: 2000
    });
    console.log('✅ Server is running');
  } catch (error) {
    console.log('❌ Server is not running. Please start it with: npm start');
    console.log('   Cannot proceed with Milestone 2 tests without server');
    return false;
  }
  
  return true;
}

async function runMilestone2Tests() {
  console.log('🚀 Starting Milestone 2 tests...\n');
  
  const serverRunning = await testIndividualComponents();
  if (!serverRunning) {
    return;
  }
  
  await testCompleteReplacementFlow();
  
  console.log('\n🎯 Milestone 2 testing completed!');
  console.log('If successful, the replacement should have been triggered and persisted');
}

// Run the tests
runMilestone2Tests().catch(console.error);
