/**
 * Simple Prompt Logger Test
 * 
 * This test logs the full context prompt being sent to the AI
 * so we can see if there are duplicate search instructions.
 */

const { processChatMessage } = require('./integrations/geminiAPI');

// Mock trip context
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

async function testPromptWithLogging(message, tripContext = null, chatHistory = []) {
  console.log(`\n🧪 Testing prompt for: "${message}"`);
  console.log(`📍 Trip Context: ${tripContext ? tripContext.destination : 'None'}\n`);
  
  try {
    // We'll temporarily modify the processChatMessage function to capture the prompt
    // For now, let's just call it to see if it works without errors
    const result = await processChatMessage(message, tripContext, chatHistory);
    
    console.log("✅ Function executed successfully");
    console.log("� Response:", result.substring(0, 200) + "...");
    
    return { success: true };

  } catch (error) {
    console.error('Error calling processChatMessage:', error.message);
    return { success: false, error: error.message };
  }
}

async function runPromptTests() {
  console.log("🧪 Prompt Logging Test (Using Real Function)\n");
  
  // Test with trip context
  await testPromptWithLogging("Find Italian restaurants", mockTripContext);
  
  // Test without trip context
  await testPromptWithLogging("Find restaurants in Rome", null);
}

if (require.main === module) {
  runPromptTests();
}
