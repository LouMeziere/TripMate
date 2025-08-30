const { processChatMessage } = require('../../integrations/geminiAPI');

// Test the integration of search intent parsing with processChatMessage
async function testSearchIntentIntegration() {
    console.log('🔍 Testing Search Intent Integration (Phase 1.2)');
    console.log('=' .repeat(60));

    // Mock trip context
    const mockTripContext = {
        destination: "San Francisco, CA",
        dates: {
            start: "2024-02-15",
            end: "2024-02-17"
        },
        preferences: {
            budget: "medium",
            interests: ["museums", "food"]
        }
    };

    // Test 1: Search request should return search intent
    console.log('\n📍 Test 1: Search request generates search intent');
    try {
        const result1 = await processChatMessage("Find good museums near Union Square", mockTripContext);
        
        console.log('✅ Response format validation:');
        console.log(`   - success: ${result1.success}`);
        console.log(`   - has response: ${!!result1.response}`);
        console.log(`   - has suggestions: ${Array.isArray(result1.suggestions)}`);
        console.log(`   - has searchIntent: ${result1.searchIntent !== null}`);
        console.log(`   - has searchError: ${result1.searchError !== null}`);
        
        if (result1.searchIntent) {
            console.log('🔍 Search Intent Data:');
            console.log(`   - query: "${result1.searchIntent.query}"`);
            console.log(`   - location: "${result1.searchIntent.location}"`);
            console.log(`   - limit: ${result1.searchIntent.limit}`);
        }
        
        console.log('💬 Clean Response (first 150 chars):');
        console.log(`   "${result1.response.substring(0, 150)}..."`);
        
    } catch (error) {
        console.log('❌ Test 1 failed:', error.message);
    }

    // Test 2: Non-search request should not return search intent
    console.log('\n💭 Test 2: Non-search request without search intent');
    try {
        const result2 = await processChatMessage("How much should I budget for food?", mockTripContext);
        
        console.log('✅ Response format validation:');
        console.log(`   - success: ${result2.success}`);
        console.log(`   - has response: ${!!result2.response}`);
        console.log(`   - searchIntent is null: ${result2.searchIntent === null}`);
        console.log(`   - searchError is null: ${result2.searchError === null}`);
        
        console.log('💬 Response (first 150 chars):');
        console.log(`   "${result2.response.substring(0, 150)}..."`);
        
    } catch (error) {
        console.log('❌ Test 2 failed:', error.message);
    }

    // Test 3: Location-based search with trip context
    console.log('\n🌍 Test 3: Location-based search using trip context');
    try {
        const result3 = await processChatMessage("What are some good restaurants for dinner tonight?", mockTripContext);
        
        console.log('✅ Response format validation:');
        console.log(`   - success: ${result3.success}`);
        console.log(`   - has searchIntent: ${result3.searchIntent !== null}`);
        
        if (result3.searchIntent) {
            console.log('🔍 Search Intent Data:');
            console.log(`   - query: "${result3.searchIntent.query}"`);
            console.log(`   - location: "${result3.searchIntent.location}"`);
            console.log(`   - uses trip destination: ${result3.searchIntent.location.includes('San Francisco')}`);
        }
        
        console.log('💬 Clean Response (first 150 chars):');
        console.log(`   "${result3.response.substring(0, 150)}..."`);
        
    } catch (error) {
        console.log('❌ Test 3 failed:', error.message);
    }

    console.log('\n' + '=' .repeat(60));
    console.log('✅ Search Intent Integration Tests Complete');
    console.log('📝 Next: Phase 1.3 - Basic Foursquare Integration');
}

// Run the test
testSearchIntentIntegration().catch(console.error);
