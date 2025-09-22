const Certificate = require('../models/Certificate');
const Achievement = require('../models/Achievement');
const User = require('../models/User');
const gamificationService = require('./GamificationService');
const notificationService = require('./notificationService');

class CertificateService {
  constructor() {
    this.gamificationService = gamificationService;
  }

  // Initialize default certificates
  async initializeDefaultCertificates() {
    const defaultCertificates = [
      {
        name: 'contribution_certificate',
        displayName: 'Certificate of Contribution',
        description: 'Awarded for consistent contributions to community improvement over 6 months',
        template: 'contribution',
        category: 'contribution',
        level: 'bronze',
        requirements: {
          type: 'time_based',
          criteria: [
            {
              metric: 'consecutive_months',
              threshold: 6,
              timeFrame: 'monthly'
            },
            {
              metric: 'issues_reported',
              threshold: 30,
              timeFrame: 'all_time'
            }
          ]
        },
        points: 200,
        validityPeriod: 12,
        design: {
          backgroundColor: '#f8f9fa',
          borderColor: '#CD7F32',
          textColor: '#2c3e50',
          logo: null
        }
      },
      {
        name: 'community_champion',
        displayName: 'Community Champion Certificate',
        description: 'Awarded to citizens who have earned multiple badges and significantly contributed',
        template: 'community_champion',
        category: 'achievement',
        level: 'gold',
        requirements: {
          type: 'badge_count',
          criteria: [
            {
              metric: 'badges_earned',
              threshold: 8,
              timeFrame: 'all_time'
            },
            {
              metric: 'total_points',
              threshold: 500,
              timeFrame: 'all_time'
            }
          ]
        },
        points: 300,
        validityPeriod: null,
        design: {
          backgroundColor: '#fff8dc',
          borderColor: '#FFD700',
          textColor: '#2c3e50',
          logo: null
        }
      },
      {
        name: 'top_reporter_monthly',
        displayName: 'Top Reporter Certificate',
        description: 'Monthly certificate for the citizen with highest verified reports',
        template: 'top_reporter',
        category: 'recognition',
        level: 'silver',
        requirements: {
          type: 'combined',
          criteria: [
            {
              metric: 'top_reporter_months',
              threshold: 1,
              timeFrame: 'monthly'
            }
          ]
        },
        points: 150,
        validityPeriod: 3,
        design: {
          backgroundColor: '#f0f8ff',
          borderColor: '#C0C0C0',
          textColor: '#2c3e50',
          logo: null
        }
      },
      {
        name: 'annual_contributor',
        displayName: 'Annual Contributor Certificate',
        description: 'Awarded for outstanding contribution throughout the year',
        template: 'annual_contributor',
        category: 'milestone',
        level: 'platinum',
        requirements: {
          type: 'combined',
          criteria: [
            {
              metric: 'issues_reported',
              threshold: 100,
              timeFrame: 'yearly'
            },
            {
              metric: 'community_engagement',
              threshold: 200,
              timeFrame: 'yearly'
            }
          ]
        },
        points: 500,
        validityPeriod: null,
        design: {
          backgroundColor: '#fafafa',
          borderColor: '#E5E4E2',
          textColor: '#2c3e50',
          logo: null
        }
      }
    ];

    try {
      for (const certData of defaultCertificates) {
        await Certificate.findOneAndUpdate(
          { name: certData.name },
          certData,
          { upsert: true, new: true }
        );
      }
      console.log('✅ Default certificates initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Error initializing default certificates:', error);
      return false;
    }
  }

  // Generate HTML certificate
  generateCertificateHTML(certificate, user, awardDate) {
    const templates = {
      contribution: this.generateContributionTemplate,
      community_champion: this.generateCommunityChampionTemplate,
      top_reporter: this.generateTopReporterTemplate,
      annual_contributor: this.generateAnnualContributorTemplate
    };

    const templateFunction = templates[certificate.template];
    if (!templateFunction) {
      throw new Error(`Template ${certificate.template} not found`);
    }

    return templateFunction.call(this, certificate, user, awardDate);
  }

  // Contribution certificate template
  generateContributionTemplate(certificate, user, awardDate) {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Certificate of Contribution</title>
    <style>
        body {
            font-family: 'Times New Roman', serif;
            margin: 0;
            padding: 40px;
            background: linear-gradient(45deg, #f0f8ff, #e6f3ff);
        }
        .certificate {
            background: ${certificate.design.backgroundColor};
            border: 8px solid ${certificate.design.borderColor};
            border-radius: 20px;
            padding: 60px;
            text-align: center;
            max-width: 800px;
            margin: 0 auto;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .header {
            font-size: 48px;
            font-weight: bold;
            color: ${certificate.design.borderColor};
            margin-bottom: 20px;
            text-transform: uppercase;
            letter-spacing: 3px;
        }
        .title {
            font-size: 36px;
            color: ${certificate.design.textColor};
            margin-bottom: 40px;
            font-style: italic;
        }
        .recipient {
            font-size: 32px;
            font-weight: bold;
            color: ${certificate.design.textColor};
            margin: 30px 0;
            text-decoration: underline;
        }
        .description {
            font-size: 18px;
            color: ${certificate.design.textColor};
            line-height: 1.6;
            margin: 30px 0;
            max-width: 600px;
            margin-left: auto;
            margin-right: auto;
        }
        .date {
            font-size: 16px;
            color: ${certificate.design.textColor};
            margin-top: 50px;
        }
        .signature-line {
            border-top: 2px solid ${certificate.design.textColor};
            width: 200px;
            margin: 60px auto 10px;
        }
        .signature {
            font-size: 14px;
            color: ${certificate.design.textColor};
        }
        .seal {
            position: absolute;
            bottom: 40px;
            right: 40px;
            width: 80px;
            height: 80px;
            border: 3px solid ${certificate.design.borderColor};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: ${certificate.design.backgroundColor};
            font-size: 24px;
        }
    </style>
</head>
<body>
    <div class="certificate">
        <div class="header">Certificate</div>
        <div class="title">of Contribution</div>
        
        <div style="font-size: 20px; margin: 20px 0;">This certifies that</div>
        
        <div class="recipient">${user.name}</div>
        
        <div class="description">
            Has demonstrated exceptional commitment to community improvement through consistent 
            civic participation and issue reporting. This certificate recognizes ${user.name}'s 
            valuable contributions to making our community a better place for all citizens.
        </div>
        
        <div class="date">
            Awarded on ${new Date(awardDate).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
        </div>
        
        <div class="signature-line"></div>
        <div class="signature">Civic Platform Administrator</div>
        
        <div class="seal">🏆</div>
    </div>
</body>
</html>`;
  }

  // Community Champion certificate template
  generateCommunityChampionTemplate(certificate, user, awardDate) {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Community Champion Certificate</title>
    <style>
        body {
            font-family: 'Times New Roman', serif;
            margin: 0;
            padding: 40px;
            background: linear-gradient(45deg, #fff8dc, #f0e68c);
        }
        .certificate {
            background: ${certificate.design.backgroundColor};
            border: 10px solid ${certificate.design.borderColor};
            border-radius: 25px;
            padding: 80px;
            text-align: center;
            max-width: 900px;
            margin: 0 auto;
            box-shadow: 0 15px 40px rgba(0,0,0,0.3);
            position: relative;
        }
        .crown {
            font-size: 72px;
            margin-bottom: 20px;
        }
        .header {
            font-size: 52px;
            font-weight: bold;
            color: ${certificate.design.borderColor};
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 4px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
        }
        .title {
            font-size: 40px;
            color: ${certificate.design.textColor};
            margin-bottom: 40px;
            font-style: italic;
            font-weight: bold;
        }
        .recipient {
            font-size: 36px;
            font-weight: bold;
            color: ${certificate.design.textColor};
            margin: 40px 0;
            text-decoration: underline;
            text-decoration-color: ${certificate.design.borderColor};
        }
        .achievement {
            font-size: 20px;
            color: ${certificate.design.textColor};
            line-height: 1.8;
            margin: 40px 0;
            max-width: 700px;
            margin-left: auto;
            margin-right: auto;
            font-weight: 500;
        }
        .stats {
            display: flex;
            justify-content: center;
            gap: 50px;
            margin: 40px 0;
            flex-wrap: wrap;
        }
        .stat {
            text-align: center;
            padding: 15px;
            background: rgba(255,215,0,0.1);
            border-radius: 10px;
            min-width: 120px;
        }
        .stat-number {
            font-size: 32px;
            font-weight: bold;
            color: ${certificate.design.borderColor};
        }
        .stat-label {
            font-size: 14px;
            color: ${certificate.design.textColor};
            margin-top: 5px;
        }
        .date {
            font-size: 18px;
            color: ${certificate.design.textColor};
            margin-top: 60px;
        }
    </style>
</head>
<body>
    <div class="certificate">
        <div class="crown">👑</div>
        <div class="header">Community</div>
        <div class="title">Champion</div>
        
        <div style="font-size: 24px; margin: 30px 0;">Proudly Awarded To</div>
        
        <div class="recipient">${user.name}</div>
        
        <div class="achievement">
            In recognition of exceptional leadership and outstanding contributions to community welfare. 
            ${user.name} has consistently demonstrated civic responsibility, engaged fellow citizens, 
            and made significant positive impacts through dedicated service and community participation.
        </div>
        
        <div class="stats">
            <div class="stat">
                <div class="stat-number">${user.gamification?.points || 0}</div>
                <div class="stat-label">Total Points</div>
            </div>
            <div class="stat">
                <div class="stat-number">${user.gamification?.badges?.length || 0}</div>
                <div class="stat-label">Badges Earned</div>
            </div>
            <div class="stat">
                <div class="stat-number">${user.gamification?.level || 'Bronze'}</div>
                <div class="stat-label">Current Level</div>
            </div>
        </div>
        
        <div class="date">
            Certified this ${new Date(awardDate).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
        </div>
    </div>
</body>
</html>`;
  }

  // Check and award certificates
  async checkAndAwardCertificates(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) return [];

      const certificates = await Certificate.find({ isActive: true });
      const userAchievements = await Achievement.find({ user: userId, type: 'certificate' });
      const userStats = await this.gamificationService.getUserStats(userId);
      
      const newlyAwardedCertificates = [];

      for (const certificate of certificates) {
        // Check if user already has this certificate
        const hasCertificate = userAchievements.some(
          achievement => achievement.certificate?.toString() === certificate._id.toString()
        );

        if (!hasCertificate && this.checkCertificateRequirement(certificate, userStats, user)) {
          // Award the certificate
          const achievement = await Achievement.create({
            user: userId,
            certificate: certificate._id,
            pointsAwarded: certificate.points,
            type: 'certificate',
            details: `Earned ${certificate.displayName} certificate`
          });

          // Award points for the certificate
          user.addPoints(certificate.points);
          await user.save();

          // Send certificate notification
          await notificationService.sendCertificateEarnedNotification(
            userId,
            certificate,
            certificate.points
          );

          newlyAwardedCertificates.push({
            certificate,
            achievement,
            htmlContent: this.generateCertificateHTML(certificate, user, new Date())
          });
        }
      }

      if (newlyAwardedCertificates.length > 0) {
        console.log(`✅ Awarded ${newlyAwardedCertificates.length} new certificates to user ${userId}`);
      }

      return newlyAwardedCertificates;
    } catch (error) {
      console.error('❌ Error checking and awarding certificates:', error);
      return [];
    }
  }

  // Check certificate requirements
  checkCertificateRequirement(certificate, userStats, user) {
    const { requirements } = certificate;
    
    switch (requirements.type) {
      case 'badge_count':
        return requirements.criteria.every(criterion => {
          if (criterion.metric === 'badges_earned') {
            return (user.gamification?.badges?.length || 0) >= criterion.threshold;
          }
          if (criterion.metric === 'total_points') {
            return userStats.total_points >= criterion.threshold;
          }
          return false;
        });
      
      case 'time_based':
        // This would require more complex logic to track consecutive months
        // For now, we'll use a simplified version
        return requirements.criteria.every(criterion => {
          if (criterion.metric === 'consecutive_months') {
            // Simplified: check if user has been active for the required period
            const userAge = Date.now() - user.createdAt;
            const monthsActive = userAge / (1000 * 60 * 60 * 24 * 30);
            return monthsActive >= criterion.threshold;
          }
          return userStats[criterion.metric] >= criterion.threshold;
        });
      
      case 'combined':
        return requirements.criteria.every(criterion => {
          return userStats[criterion.metric] >= criterion.threshold;
        });
      
      default:
        return false;
    }
  }

  // Get user certificates
  async getUserCertificates(userId) {
    try {
      const achievements = await Achievement.find({ 
        user: userId, 
        type: 'certificate' 
      }).populate('certificate');
      
      const certificates = achievements.map(achievement => ({
        certificate: achievement.certificate,
        awardedAt: achievement.awardedAt,
        achievementId: achievement._id
      }));

      return certificates;
    } catch (error) {
      console.error('❌ Error getting user certificates:', error);
      return [];
    }
  }
}

module.exports = CertificateService;