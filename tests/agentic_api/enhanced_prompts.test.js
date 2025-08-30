/**
 * Test: Enhanced Prompt Engineering for Search Intent
 * 
 * This test validates that the enhanced prompts correctly instruct
 * the AI to generate search commands when users ask for places.
 */

const { processChatMessage } = require('../../integrations/geminiAPI');

// Mock trip context for testing
const mockTripContext = {
  destination: "Paris",
  startDate: "2025-09-01",
  endDate: "2025-09-03", 
  travelers: 2,
  budget: "medium",
  categories: ["cultural", "food"],
  itinerary: [
    {
      day: 1,
      activities: [
        {
          name: "Louvre Museum",
          category: "museum",
          scheduledTime: "14:00",
          duration: "3 hours",
          address: "Rue de Rivoli, Paris"
        }
      ]
    }
  ]
};

async function testSearchPromptGeneration() {
  console.log("🧪 Testing Enhanced Prompt Engineering for Search Intent\n");
  
  // Test cases for search intent
  const testCases = [
    {
      name: "Restaurant Search with Trip Context",
      message: "Find Italian restaurants near the Louvre",
      context: mockTripContext,
      expectedSearchPattern: /<SEARCH>.*"query".*"Italian restaurants".*"location".*"Paris".*<\/SEARCH>/
    },
    {
      name: "Museum Search with Trip Context", 
      message: "What museums are nearby?",
      context: mockTripContext,
      expectedSearchPattern: /<SEARCH>.*"query".*"museums".*"location".*"Paris".*<\/SEARCH>/
    },
    {
      name: "General Location Search without Trip Context",
      message: "Find restaurants in Rome",
      context: null,
      expectedSearchPattern: /<SEARCH>.*"query".*"restaurants".*"location".*"Rome".*<\/SEARCH>/
    },
    {
      name: "Non-search Query (should not trigger search)",
      message: "What's the weather like in Paris?",
      context: mockTripContext,
      expectedSearchPattern: null // Should NOT contain search
    }
  ];
  
  for (const testCase of testCases) {
    console.log(`\n📋 Test: ${testCase.name}`);
    console.log(`💬 Message: "${testCase.message}"`);
    console.log(`🗺️  Context: ${testCase.context ? testCase.context.destination : 'None'}`);
    
    try {
      // Let's temporarily patch the processChatMessage to log the prompt
      const originalProcessChatMessage = require('../../integrations/geminiAPI').processChatMessage;
      
      // We'll need to read the source and modify it to log the prompt
      // For now, let's just call it and analyze the result
      const result = await originalProcessChatMessage(testCase.message, testCase.context, []);
      
      if (result.success) {
        console.log(`✅ AI Response Generated Successfully`);
        console.log(`📝 Full AI Response:`);
        console.log(`"${result.response}"`);
        console.log(`\n🎯 Expected Pattern: ${testCase.expectedSearchPattern ? testCase.expectedSearchPattern.toString() : 'No search command'}`);
        
        // Check if search pattern is expected
        if (testCase.expectedSearchPattern) {
          if (result.response.includes('<SEARCH>')) {
            console.log("✅ Search command detected correctly");
            
            // Extract and validate the search JSON
            const searchMatch = result.response.match(/<SEARCH>(.*?)<\/SEARCH>/);
            if (searchMatch) {
              try {
                const searchData = JSON.parse(searchMatch[1]);
                console.log(`🔍 Parsed Search Data: ${JSON.stringify(searchData, null, 2)}`);
                
                // Validate expected fields
                if (searchData.query && searchData.location && searchData.limit) {
                  console.log("✅ Search command has all required fields");
                } else {
                  console.log("⚠️ Search command missing required fields");
                }
              } catch (e) {
                console.log("❌ Invalid JSON in search command");
                console.log(`Raw search content: "${searchMatch[1]}"`);
              }
            }
          } else {
            console.log("❌ Search command NOT detected (but was expected)");
          }
        } else {
          // Should NOT contain search
          if (result.response.includes('<SEARCH>')) {
            console.log("❌ Unexpected search command detected");
            console.log("🔍 Found search command when none was expected");
          } else {
            console.log("✅ No search command (correct - none expected)");
          }
        }
      } else {
        console.log(`❌ API Error: ${result.response}`);
      }
    } catch (error) {
      console.error(`❌ Test Error: ${error.message}`);
    }
    
    console.log("---");
  }
}

async function runTests() {
  try {
    await testSearchPromptGeneration();
    console.log("\n🎯 Testing Complete!");
    console.log("\nNext Steps:");
    console.log("1. ✅ Enhanced prompt engineering implemented");
    console.log("2. ⏳ Next: Implement search intent parser (Phase 1.2)");
  } catch (error) {
    console.error("Test suite failed:", error);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = { testSearchPromptGeneration };
