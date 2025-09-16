import { apiService } from './apiService';

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'reported' | 'in_review' | 'assigned' | 'in_progress' | 'resolved' | 'closed' | 'rejected';
  location: {
    type: string;
    coordinates: [number, number];
  };
  address: string;
  images?: Array<{
    url: string;
    publicId: string;
  }>;
  reportedBy?: {
    id: string;
    name: string;
    avatar?: string;
  };
  assignedTo?: {
    id: string;
    name: string;
    avatar?: string;
  };
  upvotes: number;
  downvotes: number;
  netVotes: number;
  userVote?: 'upvote' | 'downvote' | null;
  comments: Array<{
    id: string;
    user: {
      id: string;
      name: string;
      avatar?: string;
    };
    text: string;
    createdAt: string;
  }>;
  resolution?: {
    description: string;
    resolvedBy?: any;
    resolvedAt: string;
    timeTaken: number;
  };
  tracking: {
    reportedAt: string;
    isWithin48Hours: boolean;
  };
  isAnonymous: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateIssueData {
  title: string;
  description: string;
  category: string;
  priority?: string;
  location: {
    coordinates: [number, number];
  };
  address: string;
  isAnonymous?: boolean;
  visibility?: 'public' | 'private';
}

export interface IssueFilters {
  page?: number;
  limit?: number;
  category?: string;
  status?: string;
  priority?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  lat?: number;
  lng?: number;
  radius?: number;
  assignedTo?: string;
  reportedBy?: string;
}

class IssueService {
  async getIssues(filters: IssueFilters = {}) {
    const response = await apiService.get('/issues', filters);
    if (response.success) {
      return response;
    }
    throw new Error(response.message || 'Failed to fetch issues');
  }

  async getIssue(id: string): Promise<Issue> {
    const response = await apiService.get(`/issues/${id}`);
    if (response.success) {
      return response.issue;
    }
    throw new Error(response.message || 'Failed to fetch issue');
  }

  async createIssue(issueData: CreateIssueData, images?: File[]) {
    const formData = new FormData();
    
    // Add issue data
    Object.entries(issueData).forEach(([key, value]) => {
      if (key === 'location') {
        formData.append('location[type]', 'Point');
        formData.append('location[coordinates]', JSON.stringify(value.coordinates));
      } else {
        formData.append(key, typeof value === 'object' ? JSON.stringify(value) : value);
      }
    });

    // Add images
    if (images) {
      images.forEach((image) => {
        formData.append('images', image);
      });
    }

    const response = await apiService.postFormData('/issues', formData);
    if (response.success) {
      return response.issue;
    }
    throw new Error(response.message || 'Failed to create issue');
  }

  async updateIssue(id: string, updateData: Partial<Issue>) {
    const response = await apiService.put(`/issues/${id}`, updateData);
    if (response.success) {
      return response.issue;
    }
    throw new Error(response.message || 'Failed to update issue');
  }

  async deleteIssue(id: string) {
    const response = await apiService.delete(`/issues/${id}`);
    if (response.success) {
      return response;
    }
    throw new Error(response.message || 'Failed to delete issue');
  }

  async voteIssue(id: string, type: 'upvote' | 'downvote') {
    const response = await apiService.post(`/issues/${id}/vote`, { type });
    if (response.success) {
      return response;
    }
    throw new Error(response.message || 'Failed to vote on issue');
  }

  async addComment(id: string, text: string) {
    const response = await apiService.post(`/issues/${id}/comments`, { text });
    if (response.success) {
      return response.comment;
    }
    throw new Error(response.message || 'Failed to add comment');
  }

  async getIssueStats() {
    const response = await apiService.get('/issues/stats');
    if (response.success) {
      return response.stats;
    }
    throw new Error(response.message || 'Failed to fetch issue statistics');
  }

  // Helper method to get category display name
  getCategoryDisplayName(category: string): string {
    const categoryMap: { [key: string]: string } = {
      road_maintenance: 'Road Maintenance',
      street_lighting: 'Street Lighting',
      water_supply: 'Water Supply',
      garbage_collection: 'Garbage Collection',
      drainage: 'Drainage',
      public_transport: 'Public Transport',
      traffic_management: 'Traffic Management',
      parks_recreation: 'Parks & Recreation',
      healthcare: 'Healthcare',
      education: 'Education',
      safety_security: 'Safety & Security',
      noise_pollution: 'Noise Pollution',
      air_pollution: 'Air Pollution',
      other: 'Other'
    };
    return categoryMap[category] || category;
  }

  // Helper method to get status display name and color
  getStatusInfo(status: string): { label: string; color: string } {
    const statusMap: { [key: string]: { label: string; color: string } } = {
      reported: { label: 'Reported', color: '#f44336' },
      in_review: { label: 'In Review', color: '#ff9800' },
      assigned: { label: 'Assigned', color: '#2196f3' },
      in_progress: { label: 'In Progress', color: '#9c27b0' },
      resolved: { label: 'Resolved', color: '#4caf50' },
      closed: { label: 'Closed', color: '#607d8b' },
      rejected: { label: 'Rejected', color: '#795548' }
    };
    return statusMap[status] || { label: status, color: '#000' };
  }

  // Helper method to get priority display info
  getPriorityInfo(priority: string): { label: string; color: string } {
    const priorityMap: { [key: string]: { label: string; color: string } } = {
      low: { label: 'Low', color: '#4caf50' },
      medium: { label: 'Medium', color: '#ff9800' },
      high: { label: 'High', color: '#f44336' },
      urgent: { label: 'Urgent', color: '#e91e63' }
    };
    return priorityMap[priority] || { label: priority, color: '#000' };
  }
}

export const issueService = new IssueService();