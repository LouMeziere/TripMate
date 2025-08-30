# Implementation Plan: Draft Trip Feature

## Architecture Overview

The draft trip feature extends our existing trip management system by adding a draft status field to the dummy data structure and creating UI separation between draft and active trips. This approach requires minimal changes to the current in-memory data system while providing clear user workflow distinction.

### Data Flow
```
Create Trip Form → Create Draft Trip → Navigate to Trip Details → Customize & Plan → Promote to Active Trip → Dashboard Organization
```

## Milestone 1: Backend Draft Trip Foundation

### 1. Dummy Data Structure Enhancement

**Objective**: Add draft status support to existing dummy trip data

**Implementation**:
- Add `isDraft` boolean field to dummy trip objects (default: false)
- Update existing dummy trips to include `isDraft: false`
- Update trip creation endpoints to support draft mode

**Dummy Data Updates**:
```javascript
// Update existing dummyTrips array in server/routes/trips.js
const dummyTrips = [
  {
    id: '1',
    title: 'Romantic Paris Getaway',
    // ... existing fields
    isDraft: false,  // Add to all existing trips
  },
  // ... other trips
];
```

**API Endpoint Updates**:
- `POST /api/trips` - Add optional `isDraft` parameter
- `GET /api/trips` - Add `isDraft` filter parameter
- `PUT /api/trips/:id/promote` - New endpoint for draft promotion

### 2. Trip Service Layer Updates

**Function**: Trip creation and management services

**Purpose**: Handle draft-specific business logic with dummy data

**Implementation**:
```javascript
// Create draft trip (add to dummyTrips array)
function createDraftTrip(tripData) {
  const newTrip = {
    id: String(dummyTrips.length + 1),
    ...tripData,
    isDraft: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  dummyTrips.push(newTrip);
  return newTrip;
}

// Promote draft to active trip (update in dummyTrips array)
function promoteDraftTrip(tripId) {
  const tripIndex = dummyTrips.findIndex(t => t.id === tripId);
  if (tripIndex === -1) throw new Error('Trip not found');
  if (!dummyTrips[tripIndex].isDraft) throw new Error('Trip is not a draft');
  
  dummyTrips[tripIndex] = {
    ...dummyTrips[tripIndex],
    isDraft: false,
    promotedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  return dummyTrips[tripIndex];
}
```

### 3. API Route Enhancements

**Files**: `server/routes/trips.js`

**New Endpoints**:
- `POST /api/trips/draft` - Create new draft trip
- `PUT /api/trips/:id/promote` - Promote draft to active
- `GET /api/trips/drafts` - Get user's draft trips (filter dummyTrips)
- `GET /api/trips/active` - Get user's active trips (filter dummyTrips)

**Enhanced Endpoints**:
- `GET /api/trips` - Add `isDraft` query parameter for filtering
- `PUT /api/trips/:id` - Maintain draft status during updates
- `DELETE /api/trips/:id` - Handle draft deletion from dummyTrips array

## Milestone 2: Frontend Draft Trip Management

### 1. Trip Context and State Management

**Files**: `frontend/src/contexts/TripsContext.tsx`, `frontend/src/hooks/useTrips.ts`

**Enhancements**:
- Add draft trip state management
- Create separate draft and active trip arrays
- Add draft-specific CRUD operations
- Implement promotion functionality
- **Coordinate with create trip component integration**

**State Structure**:
```typescript
interface TripsState {
  activeTrips: Trip[];
  draftTrips: Trip[];
  isLoading: boolean;
  error: string | null;
}

interface TripsActions {
  createDraftTrip: (tripData: TripData) => Promise<Trip>; // All trips start as drafts
  promoteDraftTrip: (tripId: string) => Promise<Trip>;
  getDraftTrips: () => Promise<Trip[]>;
  getActiveTrips: () => Promise<Trip[]>;
  updateDraftTrip: (tripId: string, updates: Partial<TripData>) => Promise<Trip>;
}
```

### 2. Trip Creation Flow Updates

**Files**: `frontend/src/components/CreateTrip/CreateTrip.tsx`

**Note**: This component will be handled by another team member to implement the new flow where "Create Trip" always creates a draft and navigates to trip details page.

**Expected Behavior After Their Implementation**:
- "Create Trip" button calls the draft creation API endpoint
- User is navigated to trip details page after creation
- Success message explains the draft creation process
- No dual creation options (simplified to single "Create Trip" button)

**API Integration Required**:
```typescript
// Expected call from create trip component
const draftTrip = await createDraftTrip(formData);
navigate(`/trips/${draftTrip.id}`);
```

### 3. Service Layer Integration

**Files**: `frontend/src/services/api.ts`

**New API Functions**:
```typescript
export const tripApi = {
  // All trips start as drafts from create trip form
  createTrip: (tripData: TripData) => api.post('/trips/draft', tripData),
  promoteDraft: (tripId: string) => api.put(`/trips/${tripId}/promote`),
  getDrafts: () => api.get('/trips/drafts'),
  getActive: () => api.get('/trips/active'),
  updateTrip: (tripId: string, updates: Partial<TripData>) => 
    api.put(`/trips/${tripId}`, updates)
};
```

## Milestone 3: Dashboard Tab System Implementation

### 1. Dashboard Component Restructure

**Files**: `frontend/src/components/Dashboard/Dashboard.tsx`

**Implementation**:
- Add tab navigation system (Drafts, Upcoming, Current, Past)
- Create tab content components for each trip status
- Add draft trip count indicators
- Implement tab state management

**Tab Structure**:
```tsx
<DashboardTabs>
  <Tab value="drafts" label={`Drafts (${draftCount})`} />
  <Tab value="upcoming" label={`Upcoming (${upcomingCount})`} />
  <Tab value="current" label={`Current (${currentCount})`} />
  <Tab value="past" label={`Past (${pastCount})`} />
</DashboardTabs>

<TabContent value="drafts">
  <TripsGrid 
    trips={draftTrips} 
    onPromote={handlePromoteDraft} // Pass promotion handler for draft trips
  />
</TabContent>
```

### 2. Trip Status Categorization Logic

**Function**: Categorize trips by status and draft state

**Implementation**:
```typescript
function categorizeTrips(trips: Trip[]) {
  const now = new Date();
  
  return {
    drafts: trips.filter(trip => trip.isDraft),
    upcoming: trips.filter(trip => 
      !trip.isDraft && trip.startDate > now
    ),
    current: trips.filter(trip => 
      !trip.isDraft && trip.startDate <= now && trip.endDate >= now
    ),
    past: trips.filter(trip => 
      !trip.isDraft && trip.endDate < now
    )
  };
}
```

### 3. Enhanced Trip Card Component

**Files**: `frontend/src/components/Dashboard/TripCard.tsx`

**Enhancements to Existing Component**:
- Add draft status detection and visual indicators
- Show "Draft" badge instead of status when `trip.isDraft` is true
- Replace "View Details" with "Continue Planning" for draft trips
- Add optional quick promotion button for draft trips
- Apply subtle visual distinction (border color, background, etc.)

**Component Structure Updates**:
```tsx
// Add draft-specific props
interface TripCardProps {
  trip: Trip;
  onSelect?: (trip: Trip) => void;
  onDelete?: (tripId: string) => void;
  onPromote?: (tripId: string) => void; // New prop for draft promotion
}

// Enhanced status badge logic
const getStatusDisplay = () => {
  if (trip.isDraft) {
    return (
      <span className="absolute top-4 right-4 px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
        Draft
      </span>
    );
  }
  return (
    <span className={`absolute top-4 right-4 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(trip.status)}`}>
      {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
    </span>
  );
};

// Enhanced actions section
const getActionButton = () => {
  if (trip.isDraft) {
    return (
      <button
        onClick={() => onSelect?.(trip)}
        className="text-orange-600 hover:text-orange-800 text-sm font-medium transition-colors"
      >
        Continue Planning
      </button>
    );
  }
  return (
    <button
      onClick={() => onSelect?.(trip)}
      className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
    >
      View Details
    </button>
  );
};
```

## Milestone 4: Trip Details Enhancement and Promotion System

### 1. Draft Trip Details View

**Files**: Trip details component files

**Enhancements**:
- Add draft status indicator in trip header
- Display "Make Active Trip" promotion button prominently
- Show helpful messaging about draft status and next steps
- Maintain full feature parity with active trips (chat, activities, etc.)
- Add draft-specific help text and guidance

**Header Enhancement**:
```tsx
<TripHeader>
  {trip.isDraft && (
    <DraftIndicator>
      <DraftBadge>Draft Trip</DraftBadge>
      <DraftMessage>Customize your trip and make it active when ready!</DraftMessage>
    </DraftIndicator>
  )}
  <TripTitle>{trip.title}</TripTitle>
  {trip.isDraft && (
    <PromoteButton variant="primary" onClick={handlePromoteTrip}>
      Make Active Trip
    </PromoteButton>
  )}
</TripHeader>
```

### 2. Promotion Confirmation System

**Component**: `PromoteTripModal.tsx`

**Features**:
- Confirmation dialog for trip promotion
- Explanation of promotion effects
- Preview of where trip will appear (Upcoming/Current)
- Option to cancel or confirm promotion

**Modal Content**:
```tsx
<PromoteTripModal>
  <ModalHeader>Make Trip Active</ModalHeader>
  <ModalContent>
    <p>This will move "{trip.title}" from Drafts to your {getTargetStatus(trip)} trips.</p>
    <p>The trip will become visible on your main dashboard.</p>
  </ModalContent>
  <ModalActions>
    <Button variant="outline" onClick={onCancel}>Cancel</Button>
    <Button variant="primary" onClick={onConfirm}>Make Active</Button>
  </ModalActions>
</PromoteTripModal>
```

### 3. Success Feedback and Navigation

**Implementation**:
- Toast notifications for successful promotion
- Automatic navigation to appropriate trip status tab
- Success animation and visual feedback
- Update trip counts and dashboard state

**Success Flow**:
```typescript
async function handlePromoteTrip(tripId: string) {
  try {
    const promotedTrip = await promoteDraftTrip(tripId);
    showSuccessToast('Trip promoted successfully!');
    updateTripsState();
    navigateToTab(getTargetTab(promotedTrip));
  } catch (error) {
    showErrorToast('Failed to promote trip');
  }
}
```

## Implementation Priority

### Milestone 1 Priority (Backend Foundation)
**Estimated Time**: 1 day

**Critical Path**:
1. Dummy data structure updates (add isDraft field)
2. API endpoint creation and testing  
3. Draft trip service layer implementation
4. Backend testing with draft trip CRUD operations

### Milestone 2 Priority (Frontend State Management)
**Estimated Time**: 2-3 days

**Critical Path**:
1. Trip context updates for draft state management
2. API service integration for draft operations
3. **Coordinate with create trip team** - Ensure API endpoints are ready
4. Frontend state testing and validation

**Dependencies**:
- Create trip component updates (handled by other team member)
- Backend API endpoints must be completed first

### Milestone 3 Priority (Dashboard Implementation)
**Estimated Time**: 2-3 days

**Critical Path**:
1. Dashboard tab system implementation
2. Trip categorization logic and testing
3. Enhanced trip card component updates (add draft support)
4. Tab navigation and state management

### Milestone 4 Priority (Promotion System)
**Estimated Time**: 1-2 days

**Critical Path**:
1. Trip details view enhancement
2. Promotion modal and confirmation flow
3. Success feedback and navigation
4. End-to-end promotion testing

## Technical Requirements

### Backend Dependencies
- Existing dummy trip data structure
- Trip CRUD API routes
- Express.js server setup

### Frontend Dependencies
- React trip management components
- Existing dashboard and trip details views
- Trip context and state management
- Modal/dialog component library

### Data Considerations
- In-memory dummy data persistence during server session
- Future database migration compatibility
- Consistent data structure across frontend/backend

## Testing Strategy

### Backend Testing
- Draft trip CRUD operations with dummy data
- Promotion endpoint functionality
- Dummy data filtering and manipulation
- API parameter validation

### Frontend Testing
- Draft trip state management
- Tab navigation and filtering
- Promotion flow user experience
- Component integration testing

### End-to-End Testing
- Complete draft trip lifecycle
- Dashboard tab functionality
- Trip promotion workflow
- Error handling and edge cases

## Success Metrics

- Users successfully create and manage draft trips
- Clear understanding of draft vs. active trip distinction
- Smooth promotion workflow with high success rate
- Reduced clutter on main dashboard
- Increased trip planning engagement and completion rates
