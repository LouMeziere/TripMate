# Implementation Plan: Agentic API Response Feature

## Architecture Overview

The feature extends our existing Gemini + Foursquare integration using a structured prompt engineering approach. The AI model embeds search commands in its responses, which the backend detects and executes.

### Data Flow
```
User Message → Chat Route → Gemini API (Enhanced Prompts) → String Parsing → Foursquare API → Enhanced Response → Frontend
```

## Phase 1: Backend Search Intent System

### 1.1 Enhanced Prompt Engineering (`integrations/geminiAPI.js`)

**Objective**: Teach the AI to recognize search intents and embed structured commands

**Implementation**:
- Add search capability instructions to system prompt
- Include search command format and examples
- Integrate with existing trip context (destination, preferences)

**Search Command Format**:
```xml
<SEARCH>{"query":"restaurants","location":"Paris","limit":5}</SEARCH>
```

**Enhanced System Prompt Addition**:
```javascript
SEARCH CAPABILITY: When the user asks about finding, searching, or discovering places:
1. Include search parameters: <SEARCH>{"query":"...","location":"...","limit":5}</SEARCH>
2. Provide normal conversational response

Examples:
- "Find Italian restaurants" → <SEARCH>{"query":"Italian restaurants","location":"Paris","limit":5}</SEARCH>I'll help you find great Italian restaurants!
```

### 1.2 Search Intent Parser (`integrations/geminiAPI.js`)

**Function**: `extractSearchIntent(aiResponse)`

**Purpose**: Extract and validate search commands from AI responses

**Implementation**:
```javascript
function extractSearchIntent(aiResponse) {
  const searchMatch = aiResponse.match(/<SEARCH>(.*?)<\/SEARCH>/);
  if (searchMatch) {
    try {
      const searchData = JSON.parse(searchMatch[1]);
      const cleanResponse = aiResponse.replace(/<SEARCH>.*?<\/SEARCH>/, '').trim();
      return { hasSearch: true, searchData, cleanResponse };
    } catch (e) {
      return { hasSearch: false, cleanResponse: aiResponse };
    }
  }
  return { hasSearch: false, cleanResponse: aiResponse };
}
```

### 1.3 Foursquare Search Executor (`server/routes/chat.js`)

**Function**: `executeSearch(searchData)`

**Purpose**: Execute Foursquare API calls and format results

**Features**:
- Parameter validation and sanitization
- Error handling and fallbacks
- Result formatting for frontend consumption
- Rate limiting awareness

**Result Format**:
```javascript
{
  success: true,
  results: [{
    name: "Le Grand Véfour",
    category: "French Restaurant", 
    rating: 4.8,
    address: "17 Rue de Beaujolais, Paris",
    fsqId: "venue_id_123",
    actions: ["add_to_trip", "replace_activity", "get_details"]
  }]
}
```

## Phase 2: Frontend Integration

### 2.1 Search Result Display (`frontend/src/components/Chat/`)

**Components to Enhance**:
- `ChatMessage.tsx` - Display search results with action buttons
- `EmbeddedChat.tsx` - Handle search result callbacks
- `ChatContainer.tsx` - Manage search loading states

**Search Result Card Design**:
```tsx
<SearchResultCard
  venue={result}
  onAddToTrip={(venue, day) => handleAddToTrip(venue, day)}
  onReplaceActivity={(venue) => handleReplaceActivity(venue)}
  onGetDetails={(venue) => handleGetDetails(venue)}
/>
```

### 2.2 Loading States and Indicators

**Search Progress Indicators**:
- "🔍 Searching for restaurants..." 
- "📍 Finding places near Louvre..."
- "⭐ Getting top-rated options..."

**Implementation**: Loading states between AI response and search results display

### 2.3 Action Button Handlers

**Add to Trip**: 
- Day selector modal
- Integration with existing trip update system
- Success/failure feedback

**Replace Activity**:
- Activity selector from current itinerary
- Integration with existing replacement system
- Confirmation dialogs

**Get Details**:
- Modal with full venue information
- Hours, contact info, website, reviews
- Additional Foursquare data

## Proof of Concept Scope

**Focus**: Basic search functionality with string parsing approach
**Goal**: Validate core concept and understand Foursquare API capabilities
**Timeline**: 1-2 weeks for complete POC

### Advanced Features (Future Work)
Advanced features like context-aware searching, caching, error resilience, and deep system integration have been moved to the [Future Work document](./future_work.md). These will be implemented after the proof of concept validates the approach and we understand Foursquare API limitations.

## Implementation Priority (Proof of Concept)

### High Priority (Phase 1) - Backend Foundation

#### 1. Enhanced Prompt Engineering
**File**: `integrations/geminiAPI.js`
**Function**: `processChatMessage()`
**Estimated Time**: 1-2 hours

**Tasks**:
- [ ] Add search capability instructions to existing system prompt
- [ ] Define search command format and provide clear examples
- [ ] Integrate search instructions with existing trip context
- [ ] Test prompt modifications with various search queries
- [ ] Validate AI consistency in generating search commands
- [ ] Handle edge cases where search intent is ambiguous

**Specific Implementation**:
- Modify the `contextPrompt` construction in `processChatMessage()`
- Add conditional search instructions when `tripContext` exists
- Include examples of search command format in the prompt
- Test with queries like "find restaurants", "show me museums", "where can I get coffee"

#### 2. Search Intent Parser
**File**: `integrations/geminiAPI.js`
**Function**: `extractSearchIntent(aiResponse)`
**Estimated Time**: 2-3 hours

**Tasks**:
- [ ] Implement regex pattern matching for `<SEARCH>` tags
- [ ] Add JSON parsing and validation for search parameters
- [ ] Handle malformed or incomplete search commands gracefully
- [ ] Remove search tags from AI response text for clean display
- [ ] Add error logging for debugging search intent issues
- [ ] Update `processChatMessage()` return format to include search data

**Specific Implementation**:
- Create new function `extractSearchIntent(aiResponse)`
- Implement try-catch for JSON parsing errors
- Add validation for required fields (query, location)
- Return structured object with search data and cleaned response
- Test with various AI response formats and edge cases

#### 3. Basic Foursquare Integration
**File**: `server/routes/chat.js`
**Function**: `executeSearch(searchData)`
**Estimated Time**: 2-3 hours

**Tasks**:
- [ ] Add Foursquare API import to chat route
- [ ] Implement search parameter validation and sanitization
- [ ] Create result formatting function for frontend consumption
- [ ] Add error handling for API failures and rate limits
- [ ] Implement basic logging for search operations
- [ ] Test with various search parameters and query types

**Specific Implementation**:
- Import `searchPlaces` from existing Foursquare integration
- Validate required parameters (query, location, limit)
- Format results with name, category, rating, address, fsqId
- Handle API errors gracefully with fallback responses
- Add console logging for debugging and monitoring

#### 4. Chat Route Search Handling
**File**: `server/routes/chat.js`
**Location**: Main POST route handler
**Estimated Time**: 1-2 hours

**Tasks**:
- [ ] Integrate search execution into existing chat flow
- [ ] Add search result handling to AI response data
- [ ] Maintain backward compatibility with existing chat functionality
- [ ] Add search timing and performance logging
- [ ] Test end-to-end search flow from user message to results
- [ ] Handle concurrent chat and search operations

**Specific Implementation**:
- Check for `searchIntent` in AI response data
- Call `executeSearch()` when search intent detected
- Merge search results with AI response for frontend
- Preserve existing chat history and message storage
- Add timing logs for performance monitoring

### High Priority (Phase 2) - Frontend Integration

#### 1. Frontend Search Result Display
**Files**: `frontend/src/components/Chat/ChatMessage.tsx`, `EmbeddedChat.tsx`
**Estimated Time**: 4-5 hours

**Tasks**:
- [ ] Create `SearchResultCard` component for individual venue display
- [ ] Enhance `ChatMessage.tsx` to detect and render search results
- [ ] Add search result styling with ratings, addresses, and categories
- [ ] Implement responsive design for search result cards
- [ ] Add search result count and summary information
- [ ] Test rendering with various result set sizes (0, 1, 5+ results)

**Specific Implementation**:
- Create new component: `SearchResultCard.tsx`
- Add search result detection in `ChatMessage.tsx`
- Design card layout with venue image placeholder, name, rating, address
- Add "No results found" state handling
- Implement loading skeleton for search results
- Test with mock data of various formats

#### 2. Action Button Implementations
**Files**: Search result components and handlers
**Estimated Time**: 6-8 hours

**Tasks**:
- [ ] Implement "Add to Trip" functionality with day selection
- [ ] Create "Replace Activity" flow with activity selection
- [ ] Add "More Info" modal with detailed venue information
- [ ] Integrate with existing trip management system
- [ ] Add success/failure feedback for all actions
- [ ] Test action button workflows end-to-end

**Specific Implementation**:
- **Add to Trip**: Create day selector modal, validate trip integration
- **Replace Activity**: Create activity selector, integrate with existing replacement system
- **More Info**: Create venue details modal with hours, contact, reviews
- Add toast notifications for success/failure feedback
- Test with real trip data and various edge cases

#### 3. Loading State Management
**Files**: `EmbeddedChat.tsx`, `ChatContainer.tsx`
**Estimated Time**: 2-3 hours

**Tasks**:
- [ ] Add search loading indicators between AI response and results
- [ ] Implement progressive loading states ("Searching...", "Found X results...")
- [ ] Handle search timeouts and error states gracefully
- [ ] Add loading spinners and skeleton components
- [ ] Test loading states with various network conditions
- [ ] Ensure loading states don't interfere with chat flow

**Specific Implementation**:
- Add `isSearching` state to chat components
- Create search progress indicators with icons and text
- Implement timeout handling for long-running searches
- Add skeleton loading for search result cards
- Test with simulated slow network conditions

### Research Priority

#### 1. Document Foursquare API Capabilities and Limitations
**Estimated Time**: 4-6 hours

**Tasks**:
- [ ] Test all available search parameters (query, near, radius, limit, categories)
- [ ] Document rate limiting behavior and quotas
- [ ] Test geographic coverage for various global destinations
- [ ] Evaluate search result quality and ranking
- [ ] Test error scenarios and API reliability
- [ ] Document best practices for query formatting

**Deliverables**:
- API limitations document with specific findings
- Recommended query patterns and parameters
- Rate limiting guidelines and strategies
- Geographic coverage assessment

#### 2. Test Search Result Quality Across Different Query Types
**Estimated Time**: 3-4 hours

**Tasks**:
- [ ] Test restaurant searches with various cuisines and price points
- [ ] Test attraction searches for tourist destinations
- [ ] Test activity searches for outdoor, cultural, and entertainment venues
- [ ] Evaluate result relevance and ranking quality
- [ ] Test edge cases like very specific or very broad queries
- [ ] Document query patterns that work best

**Deliverables**:
- Query effectiveness report
- Recommended search patterns for different venue types
- Quality assessment of search results

#### 3. Validate User Experience with Basic Search Flow
**Estimated Time**: 2-3 hours

**Tasks**:
- [ ] Test complete user journey from query to result selection
- [ ] Validate search result presentation and usability
- [ ] Test action button functionality and feedback
- [ ] Evaluate loading states and error handling from user perspective
- [ ] Gather feedback on search result relevance and usefulness
- [ ] Document user experience issues and improvements

**Deliverables**:
- User experience assessment report
- List of UX improvements for future iterations
- Validation of core search workflow

## Technical Requirements (POC Scope)

### Backend Dependencies
- Existing Foursquare API integration
- Gemini API access
- Express.js chat routes

### Frontend Dependencies  
- React chat components
- Existing trip management context
- Basic modal/dialog components for actions

### API Limitations to Investigate
- Foursquare API rate limits and quotas
- Search parameter support and effectiveness
- Result quality and geographic coverage
- Response time and reliability

## Testing Strategy (POC Scope)

### Core Functionality Tests
- Search intent detection and parsing
- Foursquare API parameter handling  
- Basic search result formatting
- End-to-end search flow

### API Investigation Tests
- Rate limit behavior and recovery
- Search parameter effectiveness
- Result quality across query types
- Geographic coverage testing

### User Experience Validation
- Natural language search query handling
- Search result relevance and usefulness
- Action button functionality
- Error scenario user experience
