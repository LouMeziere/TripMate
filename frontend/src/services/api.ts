import axios from 'axios';

// API base configuration
const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3001/api',
  timeout: 10000,
});

// Request interceptor for debugging
api.interceptors.request.use((config) => {
  console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error(`❌ API Error: ${error.response?.status} ${error.config?.url}`, error.response?.data);
    
    // Handle network errors
    if (!error.response) {
      error.message = 'Network Error: Please check your internet connection';
    } else if (error.response.status >= 500) {
      error.message = 'Server Error: Please try again later';
    } else if (error.response.status === 404) {
      error.message = 'Resource not found';
    } else if (error.response.status === 401) {
      error.message = 'Authentication required';
    }
    
    return Promise.reject(error);
  }
);

export interface Trip {
  id: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  travelers: number;
  budget: 'low' | 'medium' | 'high';
  pace: 'relaxed' | 'moderate' | 'active';
  categories: string[];
  status: 'planned' | 'active' | 'completed';
  isDraft: boolean;
  createdAt: string;
  updatedAt: string;
  promotedAt?: string;
  demotedAt?: string;
  itinerary: {
    day: number;
    activities: {
      name: string;
      category: string;
      duration: string;
      address: string;
      rating: number;
      description?: string;
      scheduledTime?: string;
      tel?: string;
      email?: string;
      price?: number;
    }[];
  }[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

// Trip API functions
export const tripAPI = {
  // Get all trips
  getTrips: async (): Promise<ApiResponse<Trip[]>> => {
    const response = await api.get('/trips');
    return response.data;
  },

  // Get specific trip
  getTrip: async (id: string): Promise<ApiResponse<Trip>> => {
    const response = await api.get(`/trips/${id}`);
    return response.data;
  },

  // Create new trip
  createTrip: async (tripData: Omit<Trip, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'isDraft' | 'promotedAt' | 'demotedAt'>): Promise<ApiResponse<Trip>> => {
    const response = await api.post('/trips', tripData);
    return response.data;
  },

  // Update a trip
  updateTrip: async (tripId: string, updates: Partial<Trip>): Promise<ApiResponse<Trip>> => {
    try {
      const response = await api.put(`/trips/tripId/${tripId}`, updates);
      return response.data;
    } catch (error) {
      console.error('Trips API updateTrip error:', error);
      throw error;
    }
  },

  // Replace an activity in a trip
  replaceActivity: async (
    tripId: string, 
    dayNumber: number, 
    activityIndex: number, 
    newActivity: {
      name: string;
      category: string;
      address: string;
      rating?: number;
      description?: string;
    }
  ): Promise<ApiResponse<Trip>> => {
    try {
      const response = await api.post(`/trips/tripId/${tripId}/replace-activity`, {
        dayNumber,
        activityIndex,
        newActivity
      });
      return response.data;
    } catch (error) {
      console.error('Trips API replaceActivity error:', error);
      throw error;
    }
  },

  // Delete trip
  deleteTrip: async (id: string): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/trips/tripId/${id}`);
    return response.data;
  },

  // Get draft trips
  getDraftTrips: async (): Promise<ApiResponse<Trip[]>> => {
    const response = await api.get('/trips/drafts');
    return response.data;
  },

  // Get active trips
  getActiveTrips: async (): Promise<ApiResponse<Trip[]>> => {
    const response = await api.get('/trips/active');
    return response.data;
  },

  // Create draft trip
  createDraftTrip: async (tripData: Omit<Trip, 'id' | 'createdAt' | 'updatedAt' | 'isDraft' | 'status' | 'promotedAt' | 'demotedAt'>): Promise<ApiResponse<Trip>> => {
    try {
      const response = await api.post('/trips/draft', tripData);
      return response.data;
    } catch (error) {
      console.error('Trips API createDraftTrip error:', error);
      throw error;
    }
  },

  // Promote draft trip to active
  promoteDraftTrip: async (tripId: string): Promise<ApiResponse<Trip>> => {
    try {
      const response = await api.put(`/trips/tripId/${tripId}/promote`);
      return response.data;
    } catch (error) {
      console.error('Trips API promoteDraftTrip error:', error);
      throw error;
    }
  },

  // Demote active trip to draft
  demoteTripToDraft: async (tripId: string): Promise<ApiResponse<Trip>> => {
    try {
      const response = await api.put(`/trips/tripId/${tripId}/demote`);
      return response.data;
    } catch (error) {
      console.error('Trips API demoteTripToDraft error:', error);
      throw error;
    }
  },

  // Generate trip from user input
  generateTrip: async (userInput: string, useRealGeneration = false): Promise<ApiResponse<any>> => {
    const response = await api.post('/generate-trip', { userInput, useRealGeneration });
    return response.data;
  }
};

// Chat API functions
export const chatAPI = {
  // Send chat message with trip context
  sendMessage: async (message: string, tripId?: string, tripContext?: any, useRealAI = true): Promise<ApiResponse<any>> => {
    try {
      const response = await api.post('/chat', { 
        message, 
        tripId, 
        tripContext, 
        useRealAI 
      });
      return response.data;
    } catch (error) {
      console.error('Chat API sendMessage error:', error);
      throw error;
    }
  },

  // Get chat history
  getChatHistory: async (tripId: string): Promise<ApiResponse<any[]>> => {
    try {
      const response = await api.get(`/chat/${tripId}`);
      return response.data;
    } catch (error) {
      console.error('Chat API getChatHistory error:', error);
      throw error;
    }
  },

  // Clear chat history
  clearChatHistory: async (tripId: string): Promise<ApiResponse<null>> => {
    try {
      const response = await api.delete(`/chat/${tripId}`);
      return response.data;
    } catch (error) {
      console.error('Chat API clearChatHistory error:', error);
      throw error;
    }
  }
};

export default api;
