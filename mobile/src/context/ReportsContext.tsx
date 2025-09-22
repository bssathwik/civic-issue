import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiClient } from '../services/api';

// Enhanced interface for Issue data from backend (matching updated interface)
interface Issue {
  _id: string;
  id?: string; // Alternative field for compatibility  
  issueNumber?: string; // Issue tracking number
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

// Backward compatibility interface
interface LocalReport {
  id: number;
  type: string;
  description: string;
  photo: string | null;
  location: string;
  latitude: number;
  longitude: number;
}

interface ReportsContextProps {
  // Issues from backend
  issues: Issue[];
  myIssues: Issue[];
  nearbyIssues: Issue[];
  
  // Loading states
  isLoading: boolean;
  isRefreshing: boolean;
  
  // Legacy reports for backward compatibility
  reports: LocalReport[];
  
  // CRUD operations
  fetchIssues: (filters?: any) => Promise<void>;
  fetchMyIssues: () => Promise<void>;
  fetchNearbyIssues: (latitude: number, longitude: number, radius?: number) => Promise<void>;
  fetchIssuesByStatus: (status: string) => Promise<void>;
  fetchIssuesByCategory: (category: string) => Promise<void>;
  createIssue: (issueData: any) => Promise<{ success: boolean; data?: Issue; message: string }>;
  updateIssue: (id: string, issueData: any) => Promise<{ success: boolean; data?: Issue; message: string }>;
  deleteIssue: (id: string) => Promise<{ success: boolean; message: string }>;
  
  // Voting operations
  upvoteIssue: (id: string) => Promise<{ success: boolean; message: string }>;
  downvoteIssue: (id: string) => Promise<{ success: boolean; message: string }>;
  
  // Legacy methods for backward compatibility
  addReport: (report: LocalReport) => void;
  
  // Refresh methods
  refreshData: () => Promise<void>;
}

const ReportsContext = createContext<ReportsContextProps | undefined>(undefined);

export const ReportsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Backend data states
  const [issues, setIssues] = useState<Issue[]>([]);
  const [myIssues, setMyIssues] = useState<Issue[]>([]);
  const [nearbyIssues, setNearbyIssues] = useState<Issue[]>([]);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Legacy local reports for backward compatibility
  const [reports, setReports] = useState<LocalReport[]>([]);

  // Fetch all issues
  const fetchIssues = useCallback(async (filters?: any) => {
    try {
      setIsLoading(true);
      const response = await apiClient.getIssues(filters);
      if (response.success) {
        setIssues(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching issues:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch my issues
  const fetchMyIssues = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getMyIssues();
      if (response.success) {
        setMyIssues(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching my issues:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch nearby issues
  const fetchNearbyIssues = useCallback(async (latitude: number, longitude: number, radius: number = 10) => {
    try {
      setIsLoading(true);
      const response = await apiClient.getNearbyIssues(latitude, longitude, radius);
      if (response.success) {
        setNearbyIssues(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching nearby issues:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch issues by status
  const fetchIssuesByStatus = useCallback(async (status: string) => {
    try {
      setIsLoading(true);
      const response = await apiClient.getIssuesByStatus(status);
      if (response.success) {
        setIssues(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching issues by status:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch issues by category
  const fetchIssuesByCategory = useCallback(async (category: string) => {
    try {
      setIsLoading(true);
      const response = await apiClient.getIssuesByCategory(category);
      if (response.success) {
        setIssues(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching issues by category:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create new issue
  const createIssue = useCallback(async (issueData: any): Promise<{ success: boolean; data?: Issue; message: string }> => {
    try {
      setIsLoading(true);
      const response = await apiClient.createIssue(issueData);
      
      if (response.success) {
        // Update local state - only add to general issues list
        // Don't add to myIssues here as it will be fetched by fetchMyIssues() when user navigates
        setIssues(prevIssues => [response.data, ...prevIssues]);
        
        return {
          success: true,
          data: response.data,
          message: 'Issue reported successfully!'
        };
      }
      
      return {
        success: false,
        message: response.message || 'Failed to report issue'
      };
    } catch (error: any) {
      console.error('Error creating issue:', error);
      return {
        success: false,
        message: error.message || 'Failed to report issue'
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update issue
  const updateIssue = useCallback(async (id: string, issueData: any): Promise<{ success: boolean; data?: Issue; message: string }> => {
    try {
      setIsLoading(true);
      const response = await apiClient.updateIssue(id, issueData);
      
      if (response.success) {
        // Update local state
        const updateIssueInArray = (prevIssues: Issue[]) =>
          prevIssues.map(issue => issue._id === id ? { ...issue, ...response.data } : issue);
        
        setIssues(updateIssueInArray);
        setMyIssues(updateIssueInArray);
        setNearbyIssues(updateIssueInArray);
        
        return {
          success: true,
          data: response.data,
          message: 'Issue updated successfully!'
        };
      }
      
      return {
        success: false,
        message: response.message || 'Failed to update issue'
      };
    } catch (error: any) {
      console.error('Error updating issue:', error);
      return {
        success: false,
        message: error.message || 'Failed to update issue'
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Delete issue
  const deleteIssue = useCallback(async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
      setIsLoading(true);
      const response = await apiClient.deleteIssue(id);
      
      if (response.success) {
        // Update local state
        const removeIssueFromArray = (prevIssues: Issue[]) =>
          prevIssues.filter(issue => issue._id !== id);
        
        setIssues(removeIssueFromArray);
        setMyIssues(removeIssueFromArray);
        setNearbyIssues(removeIssueFromArray);
        
        return {
          success: true,
          message: 'Issue deleted successfully!'
        };
      }
      
      return {
        success: false,
        message: response.message || 'Failed to delete issue'
      };
    } catch (error: any) {
      console.error('Error deleting issue:', error);
      return {
        success: false,
        message: error.message || 'Failed to delete issue'
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Upvote issue
  const upvoteIssue = useCallback(async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiClient.upvoteIssue(id);
      
      if (response.success) {
        // Update local state
        const updateVote = (prevIssues: Issue[]) =>
          prevIssues.map(issue => 
            issue._id === id 
              ? { 
                  ...issue, 
                  upvotes: response.data.upvotes,
                  downvotes: response.data.downvotes,
                  userVote: response.data.userVote
                }
              : issue
          );
        
        setIssues(updateVote);
        setMyIssues(updateVote);
        setNearbyIssues(updateVote);
        
        return {
          success: true,
          message: 'Vote registered successfully!'
        };
      }
      
      return {
        success: false,
        message: response.message || 'Failed to vote'
      };
    } catch (error: any) {
      console.error('Error upvoting issue:', error);
      return {
        success: false,
        message: error.message || 'Failed to vote'
      };
    }
  }, []);

  // Downvote issue
  const downvoteIssue = useCallback(async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiClient.downvoteIssue(id);
      
      if (response.success) {
        // Update local state
        const updateVote = (prevIssues: Issue[]) =>
          prevIssues.map(issue => 
            issue._id === id 
              ? { 
                  ...issue, 
                  upvotes: response.data.upvotes,
                  downvotes: response.data.downvotes,
                  userVote: response.data.userVote
                }
              : issue
          );
        
        setIssues(updateVote);
        setMyIssues(updateVote);
        setNearbyIssues(updateVote);
        
        return {
          success: true,
          message: 'Vote registered successfully!'
        };
      }
      
      return {
        success: false,
        message: response.message || 'Failed to vote'
      };
    } catch (error: any) {
      console.error('Error downvoting issue:', error);
      return {
        success: false,
        message: error.message || 'Failed to vote'
      };
    }
  }, []);

  // Legacy method for backward compatibility
  const addReport = useCallback((report: LocalReport) => {
    setReports(prevReports => [...prevReports, report]);
  }, []);

  // Refresh all data
  const refreshData = useCallback(async () => {
    try {
      setIsRefreshing(true);
      await Promise.all([
        fetchIssues(),
        fetchMyIssues(),
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchIssues, fetchMyIssues]);

  // Initial data load
  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  const contextValue: ReportsContextProps = {
    // Backend data
    issues,
    myIssues,
    nearbyIssues,
    
    // Loading states
    isLoading,
    isRefreshing,
    
    // Legacy reports
    reports,
    
    // CRUD operations
    fetchIssues,
    fetchMyIssues,
    fetchNearbyIssues,
    fetchIssuesByStatus,
    fetchIssuesByCategory,
    createIssue,
    updateIssue,
    deleteIssue,
    
    // Voting operations
    upvoteIssue,
    downvoteIssue,
    
    // Legacy methods
    addReport,
    
    // Refresh
    refreshData,
  };

  return (
    <ReportsContext.Provider value={contextValue}>
      {children}
    </ReportsContext.Provider>
  );
};

export const useReports = () => {
  const context = useContext(ReportsContext);
  if (!context) {
    throw new Error('useReports must be used within a ReportsProvider');
  }
  return context;
};

export { ReportsContext };

