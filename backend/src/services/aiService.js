const axios = require('axios');

class AIService {
  constructor() {
    this.apiKey = process.env.AI_API_KEY;
    this.serviceUrl = process.env.AI_SERVICE_URL;
  }

  // Analyze text for spam detection
  async analyzeSpam(text, title = '') {
    try {
      // Simple rule-based spam detection for now
      // In production, you would use a proper ML service
      const spamKeywords = [
        'click here', 'free money', 'urgent', 'limited time',
        'act now', 'guarantee', 'no risk', 'winner',
        'congratulations', 'selected', 'bonus', 'offer expires'
      ];

      const combinedText = `${title} ${text}`.toLowerCase();
      let spamScore = 0;
      let matchedKeywords = [];

      spamKeywords.forEach(keyword => {
        if (combinedText.includes(keyword)) {
          spamScore += 0.2;
          matchedKeywords.push(keyword);
        }
      });

      // Check for excessive capitalization
      const capsRatio = (combinedText.match(/[A-Z]/g) || []).length / combinedText.length;
      if (capsRatio > 0.3) {
        spamScore += 0.3;
      }

      // Check for excessive punctuation
      const punctuationRatio = (combinedText.match(/[!?]{2,}/g) || []).length;
      if (punctuationRatio > 0) {
        spamScore += 0.2;
      }

      // Check for repeated characters
      if (/(.)\1{3,}/.test(combinedText)) {
        spamScore += 0.2;
      }

      // Normalize score
      spamScore = Math.min(spamScore, 1);

      return {
        spamScore,
        isSpam: spamScore > 0.7,
        confidence: spamScore > 0.5 ? 0.8 : 0.6,
        reasons: matchedKeywords
      };
    } catch (error) {
      console.error('Spam analysis error:', error);
      return {
        spamScore: 0,
        isSpam: false,
        confidence: 0,
        reasons: []
      };
    }
  }

  // Classify issue category
  async classifyIssue(title, description, images = []) {
    try {
      const text = `${title} ${description}`.toLowerCase();
      
      const categoryKeywords = {
        road_maintenance: ['pothole', 'road', 'street', 'asphalt', 'crack', 'pavement'],
        street_lighting: ['light', 'lamp', 'dark', 'bulb', 'illuminate', 'streetlight'],
        water_supply: ['water', 'pipe', 'leak', 'tap', 'supply', 'pressure'],
        garbage_collection: ['garbage', 'trash', 'waste', 'bin', 'collection', 'dump'],
        drainage: ['drain', 'flood', 'water', 'sewer', 'overflow', 'block'],
        public_transport: ['bus', 'train', 'transport', 'station', 'stop', 'route'],
        traffic_management: ['traffic', 'signal', 'congestion', 'parking', 'sign'],
        parks_recreation: ['park', 'garden', 'playground', 'recreation', 'green', 'tree'],
        healthcare: ['hospital', 'clinic', 'health', 'medical', 'doctor', 'ambulance'],
        education: ['school', 'education', 'teacher', 'student', 'classroom', 'book'],
        safety_security: ['safety', 'security', 'crime', 'police', 'theft', 'violence'],
        noise_pollution: ['noise', 'loud', 'sound', 'music', 'pollution', 'disturb'],
        air_pollution: ['air', 'pollution', 'smoke', 'dust', 'smell', 'fumes']
      };

      let bestMatch = 'other';
      let bestScore = 0;

      for (const [category, keywords] of Object.entries(categoryKeywords)) {
        let score = 0;
        keywords.forEach(keyword => {
          if (text.includes(keyword)) {
            score += 1;
          }
        });

        if (score > bestScore) {
          bestScore = score;
          bestMatch = category;
        }
      }

      return {
        suggestedCategory: bestMatch,
        confidence: bestScore > 0 ? Math.min(bestScore / 3, 1) : 0.3
      };
    } catch (error) {
      console.error('Issue classification error:', error);
      return {
        suggestedCategory: 'other',
        confidence: 0.3
      };
    }
  }

  // Analyze sentiment
  async analyzeSentiment(text) {
    try {
      // Simple sentiment analysis
      const positiveWords = ['good', 'great', 'excellent', 'happy', 'satisfied', 'perfect'];
      const negativeWords = ['bad', 'terrible', 'awful', 'angry', 'frustrated', 'disappointed'];

      const lowercaseText = text.toLowerCase();
      let positiveScore = 0;
      let negativeScore = 0;

      positiveWords.forEach(word => {
        if (lowercaseText.includes(word)) positiveScore++;
      });

      negativeWords.forEach(word => {
        if (lowercaseText.includes(word)) negativeScore++;
      });

      let sentimentScore = 0;
      if (positiveScore > negativeScore) {
        sentimentScore = 0.5 + (positiveScore - negativeScore) * 0.1;
      } else if (negativeScore > positiveScore) {
        sentimentScore = 0.5 - (negativeScore - positiveScore) * 0.1;
      } else {
        sentimentScore = 0.5; // neutral
      }

      return Math.max(0, Math.min(1, sentimentScore));
    } catch (error) {
      console.error('Sentiment analysis error:', error);
      return 0.5; // neutral
    }
  }

  // Generate content tags
  async generateTags(title, description) {
    try {
      const text = `${title} ${description}`.toLowerCase();
      const words = text.split(/\s+/).filter(word => word.length > 3);
      
      // Simple keyword extraction
      const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
      const tags = words
        .filter(word => !commonWords.includes(word))
        .reduce((acc, word) => {
          acc[word] = (acc[word] || 0) + 1;
          return acc;
        }, {});

      return Object.entries(tags)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([word]) => word);
    } catch (error) {
      console.error('Tag generation error:', error);
      return [];
    }
  }

  // Complete analysis
  async analyzeIssue(title, description, images = []) {
    try {
      const [spamAnalysis, classification, sentimentScore, tags] = await Promise.all([
        this.analyzeSpam(description, title),
        this.classifyIssue(title, description, images),
        this.analyzeSentiment(description),
        this.generateTags(title, description)
      ]);

      return {
        spamScore: spamAnalysis.spamScore,
        isSpam: spamAnalysis.isSpam,
        confidence: spamAnalysis.confidence,
        suggestedCategory: classification.suggestedCategory,
        sentimentScore,
        tags: tags.slice(0, 3) // Limit to 3 tags
      };
    } catch (error) {
      console.error('Issue analysis error:', error);
      return {
        spamScore: 0,
        isSpam: false,
        confidence: 0.5,
        suggestedCategory: 'other',
        sentimentScore: 0.5,
        tags: []
      };
    }
  }
}

module.exports = new AIService();