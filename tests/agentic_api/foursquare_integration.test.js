const axios = require('axios');

// Test the complete Foursquare integration (Phase 1.3)
async function testFoursquareIntegration() {
    console.log('🏢 Testing Foursquare Integration (Phase 1.3)');
    console.log('=' .repeat(60));

    const baseURL = 'http://localhost:3001/api/chat';
    
    // Test 1: Complete flow - message with search intent
    console.log('\n🔍 Test 1: Complete search flow integration');
    try {
        const response = await axios.post(baseURL, {
            message: "Find good coffee shops near Union Square in San Francisco",
            tripId: "test-trip-123",
            tripContext: {
                destination: "San Francisco, CA",
                dates: { start: "2024-02-15", end: "2024-02-17" },
                preferences: { budget: "medium", interests: ["food", "culture"] }
            },
            useRealAI: true
        });

        console.log('✅ Response Status:', response.status);
        console.log('✅ Response Structure:');
        console.log(`   - success: ${response.data.success}`);
        console.log(`   - userMessage: ${!!response.data.data.userMessage}`);
        console.log(`   - aiMessage: ${!!response.data.data.aiMessage}`);
        console.log(`   - suggestions: ${Array.isArray(response.data.data.suggestions)}`);
        console.log(`   - searchResults: ${response.data.data.searchResults !== null}`);

        if (response.data.data.searchResults) {
            const searchData = response.data.data.searchResults;
            console.log('🔍 Search Results Data:');
            console.log(`   - success: ${searchData.success}`);
            console.log(`   - resultCount: ${searchData.resultCount}`);
            console.log(`   - searchQuery: "${searchData.searchQuery}"`);
            console.log(`   - searchLocation: "${searchData.searchLocation}"`);
            
            if (searchData.results && searchData.results.length > 0) {
                console.log('📍 Sample Place Result:');
                const place = searchData.results[0];
                console.log(`   - name: "${place.name}"`);
                console.log(`   - address: "${place.address}"`);
                console.log(`   - category: "${place.category}"`);
                console.log(`   - distance: ${place.distance}`);
            }
        }

        console.log('💬 AI Response (first 150 chars):');
        console.log(`   "${response.data.data.aiMessage.content.substring(0, 150)}..."`);

    } catch (error) {
        console.log('❌ Test 1 failed:', error.message);
        if (error.response) {
            console.log('   Response status:', error.response.status);
            console.log('   Response data:', error.response.data);
        }
    }

    // Test 2: Non-search request should not trigger search
    console.log('\n💭 Test 2: Non-search request (no Foursquare call)');
    try {
        const response = await axios.post(baseURL, {
            message: "What's the weather like in San Francisco?",
            tripId: "test-trip-456",
            tripContext: {
                destination: "San Francisco, CA",
                dates: { start: "2024-02-15", end: "2024-02-17" }
            },
            useRealAI: true
        });

        console.log('✅ Response Status:', response.status);
        console.log(`✅ Search Results: ${response.data.data.searchResults === null ? 'null (correct)' : 'unexpected data'}`);
        console.log('💬 AI Response (first 100 chars):');
        console.log(`   "${response.data.data.aiMessage.content.substring(0, 100)}..."`);

    } catch (error) {
        console.log('❌ Test 2 failed:', error.message);
    }

    // Test 3: Fallback mode should not execute searches
    console.log('\n🔄 Test 3: Fallback mode (useRealAI=false)');
    try {
        const response = await axios.post(baseURL, {
            message: "Find restaurants near me",
            tripId: "test-trip-789",
            useRealAI: false
        });

        console.log('✅ Response Status:', response.status);
        console.log(`✅ Search Results: ${response.data.data.searchResults === null ? 'null (correct)' : 'unexpected data'}`);
        console.log('💬 Fallback Response:');
        console.log(`   "${response.data.data.aiMessage.content}"`);

    } catch (error) {
        console.log('❌ Test 3 failed:', error.message);
    }

    console.log('\n' + '=' .repeat(60));
    console.log('✅ Foursquare Integration Tests Complete');
    console.log('📝 Next: Phase 1.4 - Frontend Integration for displaying results');
}

// Check if server is running first
async function checkServerHealth() {
    try {
        const response = await axios.get('http://localhost:3001/api/chat/health-check');
        return true;
    } catch (error) {
        console.log('❌ Server not running on localhost:3001');
        console.log('💡 Please start the server with: npm run dev (in server directory)');
        return false;
    }
}

// Run the test
async function runTests() {
    console.log('🚀 Starting Foursquare Integration Test Suite...\n');
    
    const serverRunning = await checkServerHealth();
    if (serverRunning) {
        await testFoursquareIntegration();
    } else {
        console.log('\n⚠️  Cannot run tests - server is not accessible');
    }
}

runTests().catch(console.error);
