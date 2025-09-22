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