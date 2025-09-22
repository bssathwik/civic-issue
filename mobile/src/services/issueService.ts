import { apiClient } from './api';
import * as ImagePicker from 'expo-image-picker';

// Types for issues (matching backend response format)
export interface Issue {
  _id: string;
  id?: string; // Alternative field for compatibility
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'reported' | 'in_review' | 'assigned' | 'in_progress' | 'resolved' | 'closed' | 'rejected';
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  address: string;
  images?: {
    url: string;
    publicId?: string;
  }[] | string[];
  reportedBy: {
    _id: string;
    name: string;
    email?: string;
    avatar?: string;
  } | null; // Can be null for anonymous reports
  assignedTo?: {
    _id: string;
    name: string;
    avatar?: string;
  } | null;
  upvotes: number;
  upvoteCount?: number; // Backend compatibility
  votesCount?: number; // Alternative naming
  downvotes: number;
  downvoteCount?: number; // Backend compatibility
  netVotes?: number;
  userVote?: 'upvote' | 'downvote' | 'up' | 'down' | null;
  comments?: {
    _id: string;
    user: {
      _id: string;
      name: string;
      avatar?: string;
    };
    text: string;
    createdAt: string;
  }[];
  resolution?: {
    description?: string;
    resolvedBy?: string;
    resolvedAt?: string;
    resolutionImages?: {
      url: string;
      publicId?: string;
    }[];
    timeTaken?: number; // in hours
  };
  tracking?: {
    reportedAt?: string;
    reviewedAt?: string;
    assignedAt?: string;
    inProgressAt?: string;
    resolvedAt?: string;
    closedAt?: string;
    isWithin48Hours?: boolean;
  };
  isAnonymous?: boolean;
  visibility?: 'public' | 'private';
  createdAt: string;
  created_at?: string; // Alternative naming
  updatedAt: string;
  updated_at?: string; // Alternative naming
  acknowledgedAt?: string; // Mobile friendly field
}

export interface CreateIssueData {
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  address: string;
  images?: string[];
  isAnonymous?: boolean;
  visibility?: 'public' | 'private';
}

export interface IssueFilters {
  category?: string;
  priority?: string;
  status?: string;
  location?: string;
  userId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  latitude?: number;
  longitude?: number;
  radius?: number;
}

// Issue categories (matching backend validation)
export const ISSUE_CATEGORIES = [
  { id: 'road_maintenance', label: 'Road Maintenance', icon: 'car-outline' },
  { id: 'street_lighting', label: 'Street Lighting', icon: 'bulb-outline' },
  { id: 'water_supply', label: 'Water Supply', icon: 'water-outline' },
  { id: 'garbage_collection', label: 'Garbage Collection', icon: 'trash-outline' },
  { id: 'drainage', label: 'Drainage', icon: 'water-outline' },
  { id: 'public_transport', label: 'Public Transport', icon: 'bus-outline' },
  { id: 'traffic_management', label: 'Traffic Management', icon: 'car-sport-outline' },
  { id: 'parks_recreation', label: 'Parks & Recreation', icon: 'leaf-outline' },
  { id: 'healthcare', label: 'Healthcare', icon: 'medical-outline' },
  { id: 'education', label: 'Education', icon: 'school-outline' },
  { id: 'safety_security', label: 'Safety & Security', icon: 'shield-outline' },
  { id: 'noise_pollution', label: 'Noise Pollution', icon: 'volume-high-outline' },
  { id: 'air_pollution', label: 'Air Pollution', icon: 'cloudy-outline' },
  { id: 'other', label: 'Other', icon: 'ellipsis-horizontal-outline' },
];

// Issue priorities
export const ISSUE_PRIORITIES = [
  { id: 'low', label: 'Low', color: '#4CAF50' },
  { id: 'medium', label: 'Medium', color: '#FF9800' },
  { id: 'high', label: 'High', color: '#F44336' },
  { id: 'urgent', label: 'Urgent', color: '#9C27B0' },
];

// Issue statuses (matching backend enum values)
export const ISSUE_STATUSES = [
  { id: 'reported', label: 'Reported', color: '#FF9800' },
  { id: 'in_review', label: 'In Review', color: '#2196F3' },
  { id: 'assigned', label: 'Assigned', color: '#9C27B0' },
  { id: 'in_progress', label: 'In Progress', color: '#3F51B5' },
  { id: 'resolved', label: 'Resolved', color: '#4CAF50' },
  { id: 'closed', label: 'Closed', color: '#607D8B' },
  { id: 'rejected', label: 'Rejected', color: '#F44336' },
];

class IssueService {
  // Helper to upload image (simplified for now)
  async uploadImage(imageUri: string): Promise<string> {
    try {
      // For now, return the local URI
      // TODO: Implement actual upload to backend
      console.log('Image upload not implemented yet, using local URI:', imageUri);
      return imageUri;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }

  // Helper to select and process image
  async selectImage(): Promise<string | null> {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Permission to access media library is required!');
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        return result.assets[0].uri;
      }
      
      return null;
    } catch (error) {
      console.error('Error selecting image:', error);
      throw error;
    }
  }

  // Helper to take photo
  async takePhoto(): Promise<string | null> {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Permission to access camera is required!');
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        return result.assets[0].uri;
      }
      
      return null;
    } catch (error) {
      console.error('Error taking photo:', error);
      throw error;
    }
  }

  // Get all issues
  async getIssues(filters?: IssueFilters): Promise<{ success: boolean; data: Issue[]; message?: string }> {
    try {
      const response = await apiClient.getIssues(filters);
      return response;
    } catch (error: any) {
      console.error('Error fetching issues:', error);
      return {
        success: false,
        data: [],
        message: error.message || 'Failed to fetch issues'
      };
    }
  }

  // Get my issues
  async getMyIssues(): Promise<{ success: boolean; data: Issue[]; message?: string }> {
    try {
      const response = await apiClient.getMyIssues();
      return response;
    } catch (error: any) {
      console.error('Error fetching my issues:', error);
      return {
        success: false,
        data: [],
        message: error.message || 'Failed to fetch your issues'
      };
    }
  }

  // Get nearby issues
  async getNearbyIssues(latitude: number, longitude: number, radius: number = 10): Promise<{ success: boolean; data: Issue[]; message?: string }> {
    try {
      const response = await apiClient.getNearbyIssues(latitude, longitude, radius);
      return response;
    } catch (error: any) {
      console.error('Error fetching nearby issues:', error);
      return {
        success: false,
        data: [],
        message: error.message || 'Failed to fetch nearby issues'
      };
    }
  }

  // Get issue by ID
  async getIssueById(id: string): Promise<{ success: boolean; data?: Issue; message?: string }> {
    try {
      const response = await apiClient.getIssueById(id);
      return response;
    } catch (error: any) {
      console.error('Error fetching issue:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch issue details'
      };
    }
  }

  // Create new issue
  async createIssue(issueData: CreateIssueData): Promise<{ success: boolean; data?: Issue; message?: string }> {
    try {
      // Upload images if any
      const uploadedImages: string[] = [];
      if (issueData.images && issueData.images.length > 0) {
        for (const imageUri of issueData.images) {
          try {
            const uploadedUrl = await this.uploadImage(imageUri);
            uploadedImages.push(uploadedUrl);
          } catch (uploadError) {
            console.error('Failed to upload image:', uploadError);
            // Continue with other images
          }
        }
      }

      const payload = {
        title: issueData.title,
        description: issueData.description,
        category: issueData.category,
        priority: issueData.priority,
        location: issueData.location,
        address: issueData.address,
        images: uploadedImages,
        isAnonymous: issueData.isAnonymous || false,
        visibility: issueData.visibility || 'public'
      };

      const response = await apiClient.createIssue(payload);
      return response;
    } catch (error: any) {
      console.error('Error creating issue:', error);
      return {
        success: false,
        message: error.message || 'Failed to create issue'
      };
    }
  }

  // Update issue
  async updateIssue(id: string, updateData: Partial<CreateIssueData>): Promise<{ success: boolean; data?: Issue; message?: string }> {
    try {
      const response = await apiClient.updateIssue(id, updateData);
      return response;
    } catch (error: any) {
      console.error('Error updating issue:', error);
      return {
        success: false,
        message: error.message || 'Failed to update issue'
      };
    }
  }

  // Delete issue
  async deleteIssue(id: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await apiClient.deleteIssue(id);
      return response;
    } catch (error: any) {
      console.error('Error deleting issue:', error);
      return {
        success: false,
        message: error.message || 'Failed to delete issue'
      };
    }
  }

  // Upvote issue
  async upvoteIssue(id: string): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const response = await apiClient.upvoteIssue(id);
      return response;
    } catch (error: any) {
      console.error('Error upvoting issue:', error);
      return {
        success: false,
        message: error.message || 'Failed to upvote issue'
      };
    }
  }

  // Downvote issue
  async downvoteIssue(id: string): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const response = await apiClient.downvoteIssue(id);
      return response;
    } catch (error: any) {
      console.error('Error downvoting issue:', error);
      return {
        success: false,
        message: error.message || 'Failed to downvote issue'
      };
    }
  }

  // Get issues by status
  async getIssuesByStatus(status: string): Promise<{ success: boolean; data: Issue[]; message?: string }> {
    try {
      const response = await apiClient.getIssuesByStatus(status);
      return response;
    } catch (error: any) {
      console.error('Error fetching issues by status:', error);
      return {
        success: false,
        data: [],
        message: error.message || 'Failed to fetch issues'
      };
    }
  }

  // Get issues by category
  async getIssuesByCategory(category: string): Promise<{ success: boolean; data: Issue[]; message?: string }> {
    try {
      const response = await apiClient.getIssuesByCategory(category);
      return response;
    } catch (error: any) {
      console.error('Error fetching issues by category:', error);
      return {
        success: false,
        data: [],
        message: error.message || 'Failed to fetch issues'
      };
    }
  }

  // Helper methods for UI
  getCategoryById(id: string) {
    return ISSUE_CATEGORIES.find(cat => cat.id === id);
  }

  getPriorityById(id: string) {
    return ISSUE_PRIORITIES.find(priority => priority.id === id);
  }

  getStatusById(id: string) {
    return ISSUE_STATUSES.find(status => status.id === id);
  }

  getPriorityColor(priority: string): string {
    const priorityObj = this.getPriorityById(priority);
    return priorityObj?.color || '#757575';
  }

  getStatusColor(status: string): string {
    const statusObj = this.getStatusById(status);
    return statusObj?.color || '#757575';
  }
}

// Export singleton instance
export const issueService = new IssueService();
export default issueService;
