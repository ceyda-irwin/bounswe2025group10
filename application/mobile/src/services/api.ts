import axios from 'axios';
import { storage } from '../utils/storage';
import { Platform } from 'react-native';

// Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  username: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  token?: {
    access: string;
    refresh: string;
  };
  data?: {
    email: string;
    username: string;
  };
}

// API Configuration
// Use the deployed backend for all requests
const API_URL = 'https://134-209-253-215.sslip.io';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add token to requests if it exists
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await storage.getToken();
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
      console.log('Making request to:', config.url, 'with headers:', config.headers);
      return config;
    } catch (error) {
      console.error('Error in request interceptor:', error);
      return Promise.reject(error);
    }
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    console.log('Response received:', response.status, response.config.url);
    return response;
  },
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response error:', {
        status: error.response.status,
        data: error.response.data,
        url: error.config?.url
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Request setup error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Authentication Services
export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/login/', credentials);
    return response.data;
  },

  signup: async (credentials: SignupCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/signup/', credentials);
    return response.data;
  },

  getUserInfo: async (): Promise<any> => {
    const response = await api.get('/me/');
    return response.data;
  },

  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await api.post('/jwt/refresh/', { refresh: refreshToken });
    return response.data;
  },

  fakeLogin: async (): Promise<AuthResponse> => {
    const response = await axios.post(`${API_URL}/fake-login/`);
    return response.data;
  },
};

export const wasteService = {
  getUserWastes: async (): Promise<any> => {
    const response = await api.get('/api/waste/get/');
    return response.data;
  },
  addUserWaste: async (waste_type: string, amount: number): Promise<any> => {
    const response = await api.post('/api/waste/', { waste_type, amount });
    return response.data;
  },
};

export const tipService = {
  getTips: async (): Promise<any> => {
    // Fetch 3 random tips from the backend
    const response = await api.get('/api/tips/get_recent_tips');
    return response.data;
  },
};

export const challengeService = {
  getChallenges: async (): Promise<any> => {
    const response = await api.get('/api/challenges/');
    return response.data;
  },
  createChallenge: async (challengeData: any): Promise<any> => {
    const response = await api.post('/api/challenges/', challengeData);
    return response.data;
  },
  contributeToChallenge: async (challengeId: number, amount: number, waste_type: string): Promise<any> => {
    const response = await api.post(`/api/challenges/${challengeId}/contribute/`, { 
      amount,
      waste_type 
    });
    return response.data;
  }
};

export default api; 