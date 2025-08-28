# Activity Replacement Implementation Plan

## Overview
Implement a state-driven activity replacement system that tracks conversation progress and automatically triggers replacements when all conditions are met.

## Core Concept
Maintain a `replacement` object throughout the chat conversation:
```javascript
{
  current_activity: string,      // "Musée d'Aquitaine"
  replacement_activity: string,  // "Grand Théâtre de Bordeaux"
  action: string,               // "replace"
  confirmation: boolean         // true when ready to execute
}
```

## Implementation Milestones

### Milestone 1: State Tracking System
**File:** `integrations/geminiAPI.js`
- [ ] Add replacement state object to chat context
- [ ] Create helper functions to detect activity mentions in user messages
- [ ] Create helper functions to detect replacement confirmations in AI responses
- [ ] Update `processChatMessage` to maintain replacement state

**Acceptance Criteria:**
- Replacement object gets populated as conversation progresses
- `current_activity` set when user mentions an activity to change
- `replacement_activity` set when user picks an alternative
- `confirmation` set to true when AI confirms the replacement

### Milestone 2: Automatic Trigger System
**File:** `server/routes/chat.js`
- [ ] Add replacement trigger detection logic
- [ ] Implement Foursquare API call for new activity details
- [ ] Integrate with existing JSON transformation utilities
- [ ] Update trip itinerary with new activity
- [ ] Reset replacement state after successful replacement

**Acceptance Criteria:**
- Trigger activates when replacement object is complete
- Foursquare API successfully retrieves new activity data
- Trip JSON gets updated with new activity in correct position
- Old activity is completely replaced (same time slot, same day)

### Milestone 3: Frontend Integration
**File:** `frontend/src/components/Chat/EmbeddedChat.tsx`
- [ ] Handle trip update callbacks from chat
- [ ] Pass updated trip data to parent TripDetails component
- [ ] Ensure day cards re-render with new activity

**Acceptance Criteria:**
- Day cards automatically update when replacement occurs
- New activity appears in same time slot as old activity
- UI reflects changes immediately without page refresh

### Milestone 4: Error Handling & Edge Cases
**Files:** Multiple
- [ ] Handle Foursquare API failures gracefully
- [ ] Handle cases where activity name doesn't match exactly
- [ ] Handle cases where replacement activity isn't found
- [ ] Add logging for debugging replacement flow
- [ ] Add user feedback for failed replacements

**Acceptance Criteria:**
- System gracefully handles API failures
- Clear error messages for users when replacements fail
- Partial replacement states are cleaned up properly

## Conversation Flow Examples

### Success Flow
```
User: "Change an activity"
AI: "Which activity would you like to change? For example..."
State: { current_activity: null, replacement_activity: null, action: "replace", confirmation: false }

User: "Musée d'Aquitaine"  
AI: "Okay, let's replace the Musée d'Aquitaine. Here are alternatives..."
State: { current_activity: "Musée d'Aquitaine", replacement_activity: null, action: "replace", confirmation: false }

User: "with Grand Théâtre de Bordeaux"
AI: "Great choice! So, we've replaced the Musée d'Aquitaine with Grand Théâtre de Bordeaux..."
State: { current_activity: "Musée d'Aquitaine", replacement_activity: "Grand Théâtre de Bordeaux", action: "replace", confirmation: true }

🚀 TRIGGER: All fields complete → Execute replacement
```

### Alternative Flows
- User changes mind mid-conversation → Reset state
- User asks for more alternatives → Keep current state, don't confirm yet
- User mentions multiple activities → Handle disambiguation

## Technical Implementation Details

### Detection Patterns
**Current Activity Detection:**
- Look for activity names from trip itinerary in user messages
- Handle partial matches and variations
- Prioritize exact matches

**Replacement Activity Detection:**
- Look for "with [activity name]" patterns
- Handle "let's try [activity]" patterns
- Extract activity names from user choices

**Confirmation Detection:**
- AI responses containing "replaced [old] with [new]"
- AI responses confirming the change
- Set confirmation: true when AI acknowledges replacement

### Data Flow
1. **Chat Message** → `processChatMessage()` → Update replacement state
2. **State Complete** → `chat.js` → Trigger replacement logic
3. **Foursquare API** → Get new activity details
4. **JSON Transform** → Convert to trip format
5. **Update Trip** → Replace activity in itinerary
6. **Frontend Update** → Re-render day cards

### Integration Points
- **Foursquare API:** Use existing `searchNearbyActivities()` function
- **JSON Transform:** Use existing `transformToSimpleFormat()` function  
- **Trip Updates:** Modify existing trip data structure
- **Frontend State:** Use existing trip update callbacks

## Testing Strategy

### Unit Tests
- [ ] Test replacement state updates with various conversation inputs
- [ ] Test activity name detection and matching
- [ ] Test Foursquare API integration
- [ ] Test JSON transformation

### Integration Tests  
- [ ] Test complete conversation flows
- [ ] Test frontend updates after replacement
- [ ] Test error handling scenarios

### Manual Testing
- [ ] Test with real conversation examples
- [ ] Test with different activity types and names
- [ ] Test with various AI response patterns

## Success Metrics
- Replacement triggered automatically when conversation concludes
- Day cards update immediately without user intervention
- System works with natural conversation flow (no rigid commands)
- Error handling provides clear feedback to users
- Performance: Replacement completes within 2-3 seconds

## Future Enhancements
- Support for multiple activity replacements in one conversation
- Support for time slot changes during replacement
- Integration with user preferences for better suggestions
- Undo functionality for replacements
- Persistent storage of trip changes
