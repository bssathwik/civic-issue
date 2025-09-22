// Backend Integration Validation Script
// This can be used to test if mobile app properly connects to backend

import { apiClient } from '../services/api';
import { ISSUE_CATEGORIES, ISSUE_STATUSES } from '../services/issueService';

export class BackendIntegrationValidator {
  
  static async validateConnection(): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      console.log('🔄 Validating backend connection...');
      
      // Test 1: Health Check
      const health = await apiClient.healthCheck();
      console.log('✅ Health Check:', health);
      
      // Test 2: Fetch Issues
      const issues = await apiClient.getIssues();
      console.log('✅ Issues Fetched:', { success: issues.success, count: issues.data?.length || 0 });
      
      return {
        success: true,
        message: 'Backend integration successful',
        details: {
          health,
          issuesCount: issues.data?.length || 0
        }
      };
      
    } catch (error: any) {
      console.error('❌ Backend validation failed:', error);
      return {
        success: false,
        message: `Backend validation failed: ${error.message}`,
        details: { error: error.message }
      };
    }
  }
  
  static validateCategories(): { success: boolean; message: string; details?: any } {
    try {
      console.log('🔄 Validating issue categories...');
      
      const validCategories = [
        'road_maintenance', 'street_lighting', 'water_supply', 'garbage_collection',
        'drainage', 'public_transport', 'traffic_management', 'parks_recreation',
        'healthcare', 'education', 'safety_security', 'noise_pollution',
        'air_pollution', 'other'
      ];
      
      const mobileCategories = ISSUE_CATEGORIES.map(cat => cat.id);
      const missingCategories = validCategories.filter(cat => !mobileCategories.includes(cat));
      const extraCategories = mobileCategories.filter(cat => !validCategories.includes(cat));
      
      if (missingCategories.length > 0 || extraCategories.length > 0) {
        return {
          success: false,
          message: 'Category mismatch found',
          details: {
            missing: missingCategories,
            extra: extraCategories,
            mobile: mobileCategories,
            backend: validCategories
          }
        };
      }
      
      console.log('✅ Categories validated successfully');
      return {
        success: true,
        message: 'All categories match backend requirements',
        details: { categories: mobileCategories }
      };
      
    } catch (error: any) {
      return {
        success: false,
        message: `Category validation failed: ${error.message}`
      };
    }
  }
  
  static validateStatuses(): { success: boolean; message: string; details?: any } {
    try {
      console.log('🔄 Validating issue statuses...');
      
      const validStatuses = [
        'reported', 'in_review', 'assigned', 'in_progress', 'resolved', 'closed', 'rejected'
      ];
      
      const mobileStatuses = ISSUE_STATUSES.map(status => status.id);
      const missingStatuses = validStatuses.filter(status => !mobileStatuses.includes(status));
      const extraStatuses = mobileStatuses.filter(status => !validStatuses.includes(status));
      
      if (missingStatuses.length > 0 || extraStatuses.length > 0) {
        return {
          success: false,
          message: 'Status mismatch found',
          details: {
            missing: missingStatuses,
            extra: extraStatuses,
            mobile: mobileStatuses,
            backend: validStatuses
          }
        };
      }
      
      console.log('✅ Statuses validated successfully');
      return {
        success: true,
        message: 'All statuses match backend requirements',
        details: { statuses: mobileStatuses }
      };
      
    } catch (error: any) {
      return {
        success: false,
        message: `Status validation failed: ${error.message}`
      };
    }
  }
  
  static async validateFullIntegration(): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      console.log('🚀 Running full backend integration validation...');
      
      // Test connection
      const connectionResult = await this.validateConnection();
      if (!connectionResult.success) {
        return connectionResult;
      }
      
      // Test categories
      const categoriesResult = this.validateCategories();
      if (!categoriesResult.success) {
        return categoriesResult;
      }
      
      // Test statuses
      const statusesResult = this.validateStatuses();
      if (!statusesResult.success) {
        return statusesResult;
      }
      
      console.log('🎉 Full integration validation successful!');
      return {
        success: true,
        message: 'Backend integration fully validated and working correctly',
        details: {
          connection: connectionResult.details,
          categories: categoriesResult.details,
          statuses: statusesResult.details
        }
      };
      
    } catch (error: any) {
      console.error('❌ Full integration validation failed:', error);
      return {
        success: false,
        message: `Integration validation failed: ${error.message}`
      };
    }
  }
}

export default BackendIntegrationValidator;
