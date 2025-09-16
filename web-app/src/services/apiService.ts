import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    
    // Set up axios defaults
    axios.defaults.baseURL = baseURL;
    
    // Add request interceptor to include auth token
    axios.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    axios.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          this.setToken(null);
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  setToken(token: string | null) {
    this.token = token;
  }

  async get(endpoint: string, params?: any) {
    try {
      const response = await axios.get(endpoint, { params });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async post(endpoint: string, data?: any) {
    try {
      const response = await axios.post(endpoint, data);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async put(endpoint: string, data?: any) {
    try {
      const response = await axios.put(endpoint, data);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async delete(endpoint: string) {
    try {
      const response = await axios.delete(endpoint);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async postFormData(endpoint: string, formData: FormData) {
    try {
      const response = await axios.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const message = error.response.data?.message || 'An error occurred';
      return new Error(message);
    } else if (error.request) {
      // The request was made but no response was received
      return new Error('Network error. Please check your connection.');
    } else {
      // Something happened in setting up the request that triggered an Error
      return new Error('An unexpected error occurred');
    }
  }
}

export const apiService = new ApiService(API_BASE_URL);