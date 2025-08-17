import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Trip } from '../services/api';

// Types for the trips context
interface TripsState {
  trips: Trip[];
  loading: boolean;
  error: string | null;
  selectedTrip: Trip | null;
}

type TripsAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_TRIPS'; payload: Trip[] }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_TRIP'; payload: Trip }
  | { type: 'UPDATE_TRIP'; payload: Trip }
  | { type: 'DELETE_TRIP'; payload: string }
  | { type: 'SELECT_TRIP'; payload: Trip | null };

// Initial state
const initialState: TripsState = {
  trips: [],
  loading: false,
  error: null,
  selectedTrip: null,
};

// Reducer function
const tripsReducer = (state: TripsState, action: TripsAction): TripsState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_TRIPS':
      return { ...state, trips: action.payload, loading: false, error: null };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'ADD_TRIP':
      return { 
        ...state, 
        trips: [...state.trips, action.payload],
        error: null 
      };
    
    case 'UPDATE_TRIP':
      return {
        ...state,
        trips: state.trips.map(trip => 
          trip.id === action.payload.id ? action.payload : trip
        ),
        selectedTrip: state.selectedTrip?.id === action.payload.id ? action.payload : state.selectedTrip,
        error: null
      };
    
    case 'DELETE_TRIP':
      return {
        ...state,
        trips: state.trips.filter(trip => trip.id !== action.payload),
        selectedTrip: state.selectedTrip?.id === action.payload ? null : state.selectedTrip,
        error: null
      };
    
    case 'SELECT_TRIP':
      return { ...state, selectedTrip: action.payload };
    
    default:
      return state;
  }
};

// Context creation
const TripsContext = createContext<{
  state: TripsState;
  dispatch: React.Dispatch<TripsAction>;
} | undefined>(undefined);

// Provider component
interface TripsProviderProps {
  children: ReactNode;
}

export const TripsProvider: React.FC<TripsProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(tripsReducer, initialState);

  return (
    <TripsContext.Provider value={{ state, dispatch }}>
      {children}
    </TripsContext.Provider>
  );
};

// Custom hook to use the trips context
export const useTripsContext = () => {
  const context = useContext(TripsContext);
  if (context === undefined) {
    throw new Error('useTripsContext must be used within a TripsProvider');
  }
  return context;
};
