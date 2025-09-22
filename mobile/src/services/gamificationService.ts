import { getApiConfig } from '../config/api.config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Badge {
  _id: string;
  name: string;
  displayName: string;
  description: string;
  icon: string;
  color: string;
  category: string;
  rarity: string;
  points: number;
  earnedAt?: Date;
}

export interface Certificate {
  _id: string;
  name: string;
  displayName: string;
  description: string;
  template: string;
  category: string;
  level: string;
  points: number;
  awardedAt?: Date;
  achievementId?: string;
}

export interface Achievement {
  _id: string;
  badge?: Badge;
  certificate?: Certificate;
  pointsAwarded: number;
  awardedAt: Date;
  type: 'badge' | 'certificate' | 'level' | 'milestone';
  details: string;
}

export interface UserStats {
  issues_reported: number;
  votes_given: number;
  comments_made: number;
  shares_made: number;
  issues_verified: number;
  total_points: number;
  currentStreak: number;
  longestStreak: number;
}

export interface LeaderboardEntry {
  _id: string;
  totalPoints: number;
  actionsCount: number;
  user: {
    name: string;
    avatar?: string;
    gamification: {
      level: string;
      badges: Badge[];
    };
  };
}

class GamificationService {
  private baseURL: string;

  constructor() {
    this.baseURL = getApiConfig().baseUrl;
  }

  private async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('authToken');
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  private async makeRequest(endpoint: string, method: 'GET' | 'POST' = 'GET', requireAuth = true): Promise<any> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (requireAuth) {
        const token = await this.getAuthToken();
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }
      }

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method,
        headers,
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  /**
   * Get all available badges
   */
  async getBadges(filters?: {
    category?: string;
    rarity?: string;
  }): Promise<Badge[]> {
    try {
      const queryParams = new URLSearchParams();
      if (filters?.category) queryParams.append('category', filters.category);
      if (filters?.rarity) queryParams.append('rarity', filters.rarity);
      
      const endpoint = `/gamification/badges${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await this.makeRequest(endpoint, 'GET', false);
      
      return response.data || [];
    } catch (error) {
      console.error('Error fetching badges:', error);
      throw error;
    }
  }

  /**
   * Get all available certificates
   */
  async getCertificates(filters?: {
    category?: string;
    level?: string;
  }): Promise<Certificate[]> {
    try {
      const queryParams = new URLSearchParams();
      if (filters?.category) queryParams.append('category', filters.category);
      if (filters?.level) queryParams.append('level', filters.level);
      
      const endpoint = `/gamification/certificates${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await this.makeRequest(endpoint, 'GET', false);
      
      return response.data || [];
    } catch (error) {
      console.error('Error fetching certificates:', error);
      throw error;
    }
  }

  /**
   * Get user's achievements, badges, and certificates
   */
  async getUserAchievements(userId: string): Promise<{
    achievements: Achievement[];
    pointLogs: any[];
    statistics: UserStats;
  }> {
    try {
      const response = await this.makeRequest(
        `/gamification/user-achievements/${userId}`,
        'GET',
        true
      );
      
      return response.data || {
        achievements: [],
        pointLogs: [],
        statistics: {
          issues_reported: 0,
          votes_given: 0,
          comments_made: 0,
          shares_made: 0,
          issues_verified: 0,
          total_points: 0,
          currentStreak: 0,
          longestStreak: 0
        }
      };
    } catch (error) {
      console.error('Error fetching user achievements:', error);
      throw error;
    }
  }

  /**
   * Get user achievements for current user
   */
  async getUserAchievementsForCurrentUser(): Promise<Achievement[]> {
    try {
      const response = await this.makeRequest(
        `/gamification/user-achievements`,
        'GET',
        true
      );
      
      return response.data?.achievements || [];
    } catch (error) {
      console.error('Error fetching user achievements:', error);
      return [];
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(): Promise<UserStats> {
    try {
      const response = await this.makeRequest(
        `/gamification/user-stats`,
        'GET',
        true
      );
      
      return response.data || {
        issues_reported: 0,
        votes_given: 0,
        comments_made: 0,
        shares_made: 0,
        issues_verified: 0,
        total_points: 0,
        currentStreak: 0,
        longestStreak: 0
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return {
        issues_reported: 0,
        votes_given: 0,
        comments_made: 0,
        shares_made: 0,
        issues_verified: 0,
        total_points: 0,
        currentStreak: 0,
        longestStreak: 0
      };
    }
  }

  /**
   * Get community leaderboard
   */
  async getLeaderboard(options?: {
    timeFrame?: 'weekly' | 'monthly' | 'yearly' | 'all_time';
    limit?: number;
  }): Promise<LeaderboardEntry[]> {
    try {
      const queryParams = new URLSearchParams();
      if (options?.timeFrame) queryParams.append('timeFrame', options.timeFrame);
      if (options?.limit) queryParams.append('limit', options.limit.toString());
      
      const endpoint = `/gamification/leaderboard${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await this.makeRequest(endpoint, 'GET', false);
      
      return response.data || [];
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      throw error;
    }
  }

  /**
   * Get badge categories for filtering
   */
  getBadgeCategories(): { label: string; value: string; icon: string }[] {
    return [
      { label: 'All Badges', value: '', icon: '🏆' },
      { label: 'Reporting', value: 'reporting', icon: '📝' },
      { label: 'Engagement', value: 'engagement', icon: '🤝' },
      { label: 'Consistency', value: 'consistency', icon: '📅' },
      { label: 'Social', value: 'social', icon: '📢' },
      { label: 'Verification', value: 'verification', icon: '🛡️' },
      { label: 'Milestone', value: 'milestone', icon: '🎯' }
    ];
  }

  /**
   * Get badge rarity colors
   */
  getRarityColor(rarity: string): string {
    switch (rarity.toLowerCase()) {
      case 'common':
        return '#95A5A6';
      case 'uncommon':
        return '#27AE60';
      case 'rare':
        return '#3498DB';
      case 'epic':
        return '#9B59B6';
      case 'legendary':
        return '#F39C12';
      default:
        return '#BDC3C7';
    }
  }

  /**
   * Get level color based on user level
   */
  getLevelColor(level: string): string {
    switch (level.toLowerCase()) {
      case 'bronze':
        return '#CD7F32';
      case 'silver':
        return '#C0C0C0';
      case 'gold':
        return '#FFD700';
      case 'platinum':
        return '#E5E4E2';
      default:
        return '#CD7F32';
    }
  }

  /**
   * Format points with commas
   */
  formatPoints(points: number): string {
    return points.toLocaleString();
  }

  /**
   * Get progress percentage for next level
   */
  getLevelProgress(points: number): { progress: number; nextLevel: string; pointsToNext: number } {
    const levels = [
      { name: 'Bronze', threshold: 0 },
      { name: 'Silver', threshold: 100 },
      { name: 'Gold', threshold: 500 },
      { name: 'Platinum', threshold: 1000 }
    ];

    let currentLevel = levels[0];
    let nextLevel = levels[1];

    for (let i = 0; i < levels.length; i++) {
      if (points >= levels[i].threshold) {
        currentLevel = levels[i];
        nextLevel = levels[i + 1] || levels[i];
      }
    }

    if (currentLevel === nextLevel) {
      return {
        progress: 100,
        nextLevel: currentLevel.name,
        pointsToNext: 0
      };
    }

    const progress = ((points - currentLevel.threshold) / (nextLevel.threshold - currentLevel.threshold)) * 100;
    const pointsToNext = nextLevel.threshold - points;

    return {
      progress: Math.min(100, Math.max(0, progress)),
      nextLevel: nextLevel.name,
      pointsToNext: Math.max(0, pointsToNext)
    };
  }
}

export const gamificationService = new GamificationService();