// Debug utility to clear app data and test authentication flow
import AsyncStorage from '@react-native-async-storage/async-storage';

export class DebugUtils {
  
  // Clear all authentication data (use this to test fresh start)
  static async clearAuthData(): Promise<void> {
    try {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');
      console.log('✅ Authentication data cleared successfully');
    } catch (error) {
      console.error('❌ Error clearing auth data:', error);
    }
  }

  // Clear all app data
  static async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.clear();
      console.log('✅ All app data cleared successfully');
    } catch (error) {
      console.error('❌ Error clearing all data:', error);
    }
  }

  // Check current authentication status
  static async checkAuthStatus(): Promise<void> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const user = await AsyncStorage.getItem('user');
      
      console.log('🔍 Current Auth Status:');
      console.log('Token exists:', !!token);
      console.log('User data exists:', !!user);
      
      if (user) {
        try {
          const parsedUser = JSON.parse(user);
          console.log('User role:', parsedUser.role);
          console.log('User email:', parsedUser.email);
        } catch {
          console.log('Invalid user data format');
        }
      }
    } catch (error) {
      console.error('❌ Error checking auth status:', error);
    }
  }

  // Force app to start from beginning
  static async forceStartFromBeginning(): Promise<void> {
    console.log('🔄 Forcing app to start from beginning...');
    await this.clearAuthData();
    console.log('✅ App will now start from StartingScreen on next reload');
  }
}

// Export individual functions for convenience
export const clearAuthData = DebugUtils.clearAuthData;
export const clearAllData = DebugUtils.clearAllData;
export const checkAuthStatus = DebugUtils.checkAuthStatus;
export const forceStartFromBeginning = DebugUtils.forceStartFromBeginning;
