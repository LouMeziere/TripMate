import { useCallback } from 'react';
import { useTripsContext } from '../contexts/TripsContext';
import { tripAPI, Trip } from '../services/api';

// Type definitions for API operations
type CreateTripData = Omit<Trip, 'id' | 'createdAt' | 'updatedAt' | 'status'>;
type UpdateTripData = Partial<Trip>;

export const useTrips = () => {
  const { state, dispatch } = useTripsContext();

  // Fetch all trips
  const fetchTrips = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await tripAPI.getTrips();
      dispatch({ type: 'SET_TRIPS', payload: response.data });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch trips' });
      console.error('Error fetching trips:', error);
    }
  }, [dispatch]);

  // Create a new trip
  const createTrip = useCallback(async (tripData: CreateTripData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await tripAPI.createTrip(tripData);
      dispatch({ type: 'ADD_TRIP', payload: response.data });
      return response.data;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create trip' });
      console.error('Error creating trip:', error);
      throw error;
    }
  }, [dispatch]);

  // Update an existing trip
  const updateTrip = useCallback(async (id: string, tripData: UpdateTripData) => {
    try {
      const response = await tripAPI.updateTrip(id, tripData);
      dispatch({ type: 'UPDATE_TRIP', payload: response.data });
      return response.data;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update trip' });
      console.error('Error updating trip:', error);
      throw error;
    }
  }, [dispatch]);

  // Delete a trip
  const deleteTrip = useCallback(async (id: string) => {
    try {
      await tripAPI.deleteTrip(id);
      dispatch({ type: 'DELETE_TRIP', payload: id });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete trip' });
      console.error('Error deleting trip:', error);
      throw error;
    }
  }, [dispatch]);

  // Select a trip (for detailed view)
  const selectTrip = useCallback((trip: Trip | null) => {
    dispatch({ type: 'SELECT_TRIP', payload: trip });
  }, [dispatch]);

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, [dispatch]);

  // Helper functions
  const getTripsByStatus = useCallback((status: 'planned' | 'active' | 'completed') => {
    return state.trips.filter(trip => trip.status === status);
  }, [state.trips]);

  const getUpcomingTrips = useCallback(() => {
    const now = new Date();
    return state.trips
      .filter(trip => new Date(trip.startDate) > now)
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }, [state.trips]);

  const getCurrentTrips = useCallback(() => {
    const now = new Date();
    return state.trips.filter(trip => {
      const startDate = new Date(trip.startDate);
      const endDate = new Date(trip.endDate);
      return startDate <= now && endDate >= now;
    });
  }, [state.trips]);

  const getPastTrips = useCallback(() => {
    const now = new Date();
    return state.trips
      .filter(trip => new Date(trip.endDate) < now)
      .sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime());
  }, [state.trips]);

  return {
    // State
    trips: state.trips,
    loading: state.loading,
    error: state.error,
    selectedTrip: state.selectedTrip,
    
    // Actions
    fetchTrips,
    createTrip,
    updateTrip,
    deleteTrip,
    selectTrip,
    clearError,
    
    // Helper functions
    getTripsByStatus,
    getUpcomingTrips,
    getCurrentTrips,
    getPastTrips,
  };
};
