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
  createdAt: string;
  updatedAt: string;
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
  createTrip: async (tripData: Omit<Trip, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<ApiResponse<Trip>> => {
    const response = await api.post('/trips', tripData);
    return response.data;
  },

  // Update trip
  updateTrip: async (id: string, tripData: Partial<Trip>): Promise<ApiResponse<Trip>> => {
    const response = await api.put(`/trips/${id}`, tripData);
    return response.data;
  },

  // Delete trip
  deleteTrip: async (id: string): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/trips/${id}`);
    return response.data;
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
    const response = await api.post('/chat', { 
      message, 
      tripId, 
      tripContext, 
      useRealAI 
    });
    return response.data;
  },

  // Get chat history
  getChatHistory: async (tripId: string): Promise<ApiResponse<any[]>> => {
    const response = await api.get(`/chat/${tripId}`);
    return response.data;
  },

  // Clear chat history
  clearChatHistory: async (tripId: string): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/chat/${tripId}`);
    return response.data;
  }
};

export default api;
