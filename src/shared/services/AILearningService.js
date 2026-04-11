// Enhanced AILearningService with API Integration
import BaseService from './base/BaseService';
import AIService from './ai/AIService';
import PricingService from './ai/PricingService';
import ChatService from '@/shared/integration/services/ChatService';

class AILearningService extends BaseService {
  constructor() {
    super();
    this.endpoint = '/ai/learning';
    this.learningData = this.loadLearningData();
    this.trainingSessions = this.loadTrainingSessions();
    this.aiModels = this.loadAIModels();
    this.isTraining = false;
    this.currentTrainingSession = null;
    
    // Initialize learning system
    this.initializeLearningSystem();
  }

  // Initialize Learning System
  async initializeLearningSystem() {
    console.log('🧠 Initializing AI Learning System...');
    
    try {
      // Test API connection with better error handling
      const response = await this.get('/api/health');
      if (response.success) {
        console.log('✅ AI Learning System Initialized with API');
      } else {
        console.log('⚠️ AI Learning System in fallback mode');
      }
    } catch (error) {
      console.log('⚠️ AI Learning System in fallback mode:', error.message);
    }
    
    // Start continuous learning
    this.startContinuousLearning();
    
    // Initialize models
    this.initializeModels();
    
    // Start adaptive learning
    this.startAdaptiveLearning();
  }

  // API Methods
  async getModels() {
    try {
      const response = await this.get('/models');
      if (response.success) {
        this.aiModels = response.data;
        this.saveAIModels(response.data);
      }
      return response;
    } catch (error) {
      console.error('Error getting AI models:', error);
      return {
        success: false,
        data: this.getMockAIModels(),
        error: error.message
      };
    }
  }

  async getTrainingSessions() {
    try {
      const response = await this.get('/training/sessions');
      if (response.success) {
        this.trainingSessions = response.data;
        this.saveTrainingSessions(response.data);
      }
      return response;
    } catch (error) {
      console.error('Error getting training sessions:', error);
      return {
        success: false,
        data: this.getMockTrainingSessions(),
        error: error.message
      };
    }
  }

  async getLearningData() {
    try {
      const response = await this.get('/data');
      if (response.success) {
        this.learningData = response.data;
        this.saveLearningData(response.data);
      }
      return response;
    } catch (error) {
      console.error('Error getting learning data:', error);
      return {
        success: false,
        data: this.getMockLearningData(),
        error: error.message
      };
    }
  }

  async trainModel(modelName) {
    try {
      const response = await this.post('/training/start', { modelName });
      if (response.success) {
        this.currentTrainingSession = response.data;
        this.isTraining = true;
      }
      return response;
    } catch (error) {
      console.error('Error training model:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async startAllTraining() {
    try {
      const response = await this.post('/training/start-all');
      if (response.success) {
        this.currentTrainingSession = response.data;
        this.isTraining = true;
      }
      return response;
    } catch (error) {
      console.error('Error starting all training:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async resetModel(modelName) {
    try {
      const response = await this.post(`/models/${modelName}/reset`);
      if (response.success) {
        // Refresh models data
        await this.getModels();
      }
      return response;
    } catch (error) {
      console.error('Error resetting model:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async saveSettings(settings) {
    try {
      const response = await this.post('/settings', settings);
      if (response.success) {
        // Update local settings
        if (settings.training) {
          Object.assign(this.trainingSettings || {}, settings.training);
        }
        if (settings.learning) {
          Object.assign(this.learningSettings || {}, settings.learning);
        }
        if (settings.system) {
          Object.assign(this.systemSettings || {}, settings.system);
        }
      }
      return response;
    } catch (error) {
      console.error('Error saving settings:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Initialize Models
  initializeModels() {
    console.log('🤖 Initializing AI Models...');
    // Initial check of model versions and performance
    Object.keys(this.aiModels).forEach(modelName => {
      const model = this.aiModels[modelName];
      console.log(`- ${modelName}: v${model.version} (Accuracy: ${(model.accuracy * 100).toFixed(1)}%)`);
    });
  }

  // Load Learning Data
  loadLearningData() {
    const stored = localStorage.getItem('ai_learning_data');
    return stored ? JSON.parse(stored) : {
      userInteractions: [],
      pricingPatterns: [],
      productInsights: [],
      conversationContexts: [],
      marketTrends: [],
      userPreferences: {},
      systemPerformance: [],
      lastUpdate: new Date().toISOString()
    };
  }

  loadTrainingSessions() {
    const stored = localStorage.getItem('ai_training_sessions');
    return stored ? JSON.parse(stored) : [];
  }

  loadAIModels() {
    const stored = localStorage.getItem('ai_models');
    return stored ? JSON.parse(stored) : {
      chatbot: {
        version: '1.0',
        accuracy: 0.85,
        trainingData: [],
        lastTrained: null,
        performance: {
          precision: 0.82,
          recall: 0.78,
          f1Score: 0.80
        }
      },
      pricing: {
        version: '1.0',
        accuracy: 0.88,
        trainingData: [],
        lastTrained: null,
        performance: {
          mae: 0.12,
          rmse: 0.18,
          r2Score: 0.75
        }
      },
      recommendations: {
        version: '1.0',
        accuracy: 0.79,
        trainingData: [],
        lastTrained: null,
        performance: {
          precision: 0.76,
          recall: 0.72,
          f1Score: 0.74
        }
      },
      sentiment: {
        version: '1.0',
        accuracy: 0.83,
        trainingData: [],
        lastTrained: null,
        performance: {
          accuracy: 0.83,
          precision: 0.81,
          recall: 0.79
        }
      }
    };
  }

  // Continuous Learning
  startContinuousLearning() {
    // Learn from user interactions every 5 minutes
    setInterval(() => {
      this.learnFromInteractions();
    }, 300000);

    // Learn from pricing patterns every hour
    setInterval(() => {
      this.learnFromPricingPatterns();
    }, 3600000);

    // Learn from market trends every 6 hours
    setInterval(() => {
      this.learnFromMarketTrends();
    }, 21600000);

    console.log('🔄 Continuous Learning Started');
  }

  // Learn from User Interactions
  async learnFromInteractions() {
    try {
      // Get recent user interactions
      const interactions = await this.getUserInteractions();
      
      // Process and learn from interactions
      for (const interaction of interactions) {
        await this.processInteraction(interaction);
      }
      
      // Update learning data
      this.learningData.userInteractions.push(...interactions);
      this.saveLearningData();
      
      console.log(`📚 Learned from ${interactions.length} user interactions`);
    } catch (error) {
      console.error('Error learning from interactions:', error);
    }
  }

  // Learn from Pricing Patterns
  async learnFromPricingPatterns() {
    try {
      // Get pricing analytics
      const analytics = await PricingService.getPricingAnalytics(null, '7days');
      
      // Extract patterns
      const patterns = this.extractPricingPatterns(analytics);
      
      // Update pricing model
      await this.updatePricingModel(patterns);
      
      // Save learning data
      this.learningData.pricingPatterns.push(...patterns);
      this.saveLearningData();
      
      console.log(`💰 Learned ${patterns.length} pricing patterns`);
    } catch (error) {
      console.error('Error learning from pricing patterns:', error);
    }
  }

  // Learn from Market Trends
  async learnFromMarketTrends() {
    try {
      // Get market trends
      const trends = await AIService.getInstance().getMarketTrends();
      
      // Process trends
      const processedTrends = this.processMarketTrends(trends);
      
      // Update models
      await this.updateModelsFromTrends(processedTrends);
      
      // Save learning data
      this.learningData.marketTrends.push(...processedTrends);
      this.saveLearningData();
      
      console.log(`📈 Learned from ${processedTrends.length} market trends`);
    } catch (error) {
      console.error('Error learning from market trends:', error);
    }
  }

  // Adaptive Learning
  startAdaptiveLearning() {
    // Adapt to user behavior in real-time
    setInterval(() => {
      this.adaptToUserBehavior();
    }, 60000); // Every minute

    // Adapt to seasonal patterns
    setInterval(() => {
      this.adaptToSeasonalPatterns();
    }, 3600000); // Every hour

    console.log('🎯 Adaptive Learning Started');
  }

  // Training Methods
  async trainModel(modelName, trainingData = null) {
    if (this.isTraining) {
      console.warn('Training already in progress');
      return false;
    }

    this.isTraining = true;
    this.currentTrainingSession = {
      id: this.generateTrainingId(),
      modelName,
      startTime: new Date(),
      status: 'training',
      progress: 0
    };

    try {
      console.log(`🎓 Starting training for ${modelName} model...`);
      
      // Get training data
      const data = trainingData || await this.getTrainingData(modelName);
      
      // Train the model
      const trainingResult = await this.performTraining(modelName, data);
      
      // Update model
      this.updateModel(modelName, trainingResult);
      
      // Save training session
      this.currentTrainingSession.status = 'completed';
      this.currentTrainingSession.endTime = new Date();
      this.currentTrainingSession.result = trainingResult;
      this.trainingSessions.push(this.currentTrainingSession);
      this.saveTrainingSessions();
      
      console.log(`✅ Training completed for ${modelName} model`);
      return trainingResult;
      
    } catch (error) {
      console.error(`Error training ${modelName} model:`, error);
      this.currentTrainingSession.status = 'failed';
      this.currentTrainingSession.error = error.message;
      return false;
    } finally {
      this.isTraining = false;
      this.currentTrainingSession = null;
    }
  }

  // Get Training Data
  async getTrainingData(modelName) {
    switch (modelName) {
      case 'chatbot':
        return this.getChatbotTrainingData();
      case 'pricing':
        return this.getPricingTrainingData();
      case 'recommendations':
        return this.getRecommendationsTrainingData();
      case 'sentiment':
        return this.getSentimentTrainingData();
      default:
        return [];
    }
  }

  // Chatbot Training Data
  getChatbotTrainingData() {
    const conversations = this.learningData.conversationContexts;
    const userPreferences = this.learningData.userPreferences;
    
    return {
      conversations: conversations.slice(-1000), // Last 1000 conversations
      userPreferences: userPreferences,
      commonQuestions: this.extractCommonQuestions(conversations),
      responsePatterns: this.extractResponsePatterns(conversations),
      domainKnowledge: this.extractDomainKnowledge()
    };
  }

  // Pricing Training Data
  getPricingTrainingData() {
    const pricingPatterns = this.learningData.pricingPatterns;
    const marketTrends = this.learningData.marketTrends;
    
    return {
      historicalPricing: pricingPatterns.slice(-500), // Last 500 patterns
      marketTrends: marketTrends.slice(-100), // Last 100 trends
      competitorAnalysis: this.getCompetitorAnalysis(),
      seasonalPatterns: this.getSeasonalPatterns(),
      customerSegments: this.getCustomerSegments()
    };
  }

  // Recommendations Training Data
  getRecommendationsTrainingData() {
    const userInteractions = this.learningData.userInteractions;
    const productInsights = this.learningData.productInsights;
    
    return {
      userBehavior: userInteractions.slice(-1000),
      productInsights: productInsights.slice(-500),
      collaborativeFiltering: this.getCollaborativeFilteringData(),
      contentBasedFiltering: this.getContentBasedFilteringData(),
      contextualFactors: this.getContextualFactors()
    };
  }

  // Sentiment Training Data
  getSentimentTrainingData() {
    const userInteractions = this.learningData.userInteractions;
    
    return {
      feedbackData: this.extractFeedbackData(userInteractions),
      sentimentLabels: this.extractSentimentLabels(userInteractions),
      contextualSentiments: this.getContextualSentiments(),
      domainSpecificSentiments: this.getDomainSpecificSentiments()
    };
  }

  // Perform Training
  async performTraining(modelName, trainingData) {
    console.log(`🎯 Training ${modelName} with ${trainingData.length} data points...`);
    
    // Simulate training process
    const trainingSteps = [
      { step: 'data_preprocessing', progress: 20 },
      { step: 'feature_extraction', progress: 40 },
      { step: 'model_training', progress: 70 },
      { step: 'validation', progress: 90 },
      { step: 'finalization', progress: 100 }
    ];

    for (const step of trainingSteps) {
      this.currentTrainingSession.progress = step.progress;
      this.currentTrainingSession.currentStep = step.step;
      
      // Simulate training time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log(`📊 Training ${step.step}: ${step.progress}%`);
    }

    // Generate training result
    const result = {
      accuracy: this.calculateAccuracy(modelName, trainingData),
      performance: this.calculatePerformance(modelName, trainingData),
      improvements: this.calculateImprovements(modelName, trainingData),
      modelVersion: this.generateModelVersion(),
      trainingMetrics: {
        dataPoints: trainingData.length,
        trainingTime: Date.now() - this.currentTrainingSession.startTime.getTime(),
        convergence: Math.random() * 0.3 + 0.7, // Simulated convergence
        epochs: Math.floor(Math.random() * 50) + 10
      }
    };

    return result;
  }

  // Update Model
  updateModel(modelName, trainingResult) {
    if (!this.aiModels[modelName]) {
      this.aiModels[modelName] = {};
    }

    this.aiModels[modelName] = {
      ...this.aiModels[modelName],
      ...trainingResult,
      lastTrained: new Date(),
      version: trainingResult.modelVersion
    };

    this.saveAIModels();
    
    // Apply the updated model
    this.applyModelUpdate(modelName, trainingResult);
    
    console.log(`🔄 Updated ${modelName} model to version ${trainingResult.modelVersion}`);
  }

  // Apply Model Update
  applyModelUpdate(modelName, trainingResult) {
    switch (modelName) {
      case 'chatbot':
        this.applyChatbotUpdate(trainingResult);
        break;
      case 'pricing':
        this.applyPricingUpdate(trainingResult);
        break;
      case 'recommendations':
        this.applyRecommendationsUpdate(trainingResult);
        break;
      case 'sentiment':
        this.applySentimentUpdate(trainingResult);
        break;
    }
  }

  // Chatbot Update
  applyChatbotUpdate(trainingResult) {
    // Update chatbot responses based on new training
    const chatService = ChatService;
    
    // Add new response patterns
    chatService.responsePatterns = trainingResult.responsePatterns || [];
    
    // Update confidence thresholds
    chatService.confidenceThreshold = trainingResult.accuracy * 0.9;
    
    console.log('💬 Chatbot model updated');
  }

  // Pricing Update
  applyPricingUpdate(trainingResult) {
    // Update pricing algorithms
    const pricingService = PricingService;
    
    // Update factor weights
    if (trainingResult.factorWeights) {
      pricingService.factorWeights = trainingResult.factorWeights;
    }
    
    // Update accuracy
    pricingService.pricingAccuracy = trainingResult.accuracy;
    
    console.log('💰 Pricing model updated');
  }

  // Adaptive Methods
  async adaptToUserBehavior() {
    try {
      // Get recent user behavior
      const recentBehavior = await this.getRecentUserBehavior();
      
      // Analyze patterns using existing analysis methods
      const patterns = this.analyzeUserPatterns(recentBehavior);
      
      // Adapt responses and recommendations
      await this.adaptResponses(patterns);
      await this.adaptRecommendations(patterns);
      
      console.log('👤 Adapted to user behavior');
    } catch (error) {
      console.error('Error adapting to user behavior:', error);
    }
  }

  // Analyze user behavior patterns - Missing method implementation
  analyzeUserPatterns(recentBehavior) {
    if (!recentBehavior || !recentBehavior.interactions) {
      return {
        preferredCategories: {},
        activeHours: {},
        interactionTypes: {},
        frequency: 0,
        sentiment: 'neutral'
      };
    }

    const interactions = recentBehavior.interactions.slice(-100); // Last 100 interactions
    
    return {
      preferredCategories: this.analyzePreferredCategories(interactions),
      activeHours: this.analyzeActiveHours(interactions),
      interactionTypes: this.analyzeInteractionTypes(interactions),
      frequency: this.analyzeFrequency(interactions),
      sentiment: this.analyzeSentiment(interactions)
    };
  }

  // Analyze sentiment from interactions
  analyzeSentiment(interactions) {
    if (!interactions.length) return 'neutral';
    
    const sentiments = interactions
      .filter(i => i.sentiment)
      .map(i => i.sentiment);
    
    if (!sentiments.length) return 'neutral';
    
    const positiveCount = sentiments.filter(s => s === 'positive').length;
    const negativeCount = sentiments.filter(s => s === 'negative').length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  // Adapt responses based on user patterns
  async adaptResponses(patterns) {
    try {
      console.log('🧠 Adapting responses based on patterns:', patterns);
      
      // Store adaptation data for future use
      const adaptationData = {
        timestamp: new Date().toISOString(),
        patterns,
        adaptations: {
          responseStyle: this.calculateResponseStyle(patterns),
          languageComplexity: this.calculateLanguageComplexity(patterns),
          interactionSpeed: this.calculateInteractionSpeed(patterns)
        }
      };
      
      // Save to learning data
      this.learningData.responseAdaptations = this.learningData.responseAdaptations || [];
      this.learningData.responseAdaptations.push(adaptationData);
      this.saveLearningData();
      
      console.log('✅ Responses adapted successfully');
      return adaptationData;
    } catch (error) {
      console.error('❌ Error adapting responses:', error);
      return null;
    }
  }

  // Adapt recommendations based on user patterns
  async adaptRecommendations(patterns) {
    try {
      console.log('🎯 Adapting recommendations based on patterns:', patterns);
      
      // Store adaptation data for future use
      const adaptationData = {
        timestamp: new Date().toISOString(),
        patterns,
        adaptations: {
          categoryPreferences: patterns.preferredCategories,
          timePreferences: patterns.activeHours,
          recommendationWeights: this.calculateRecommendationWeights(patterns),
          diversityFactor: this.calculateDiversityFactor(patterns)
        }
      };
      
      // Save to learning data
      this.learningData.recommendationAdaptations = this.learningData.recommendationAdaptations || [];
      this.learningData.recommendationAdaptations.push(adaptationData);
      this.saveLearningData();
      
      console.log('✅ Recommendations adapted successfully');
      return adaptationData;
    } catch (error) {
      console.error('❌ Error adapting recommendations:', error);
      return null;
    }
  }

  // Helper methods for adaptation calculations
  calculateResponseStyle(patterns) {
    const sentiment = patterns.sentiment;
    const frequency = patterns.frequency;
    
    if (sentiment === 'positive' && frequency > 5) {
      return 'enthusiastic';
    } else if (sentiment === 'positive') {
      return 'friendly';
    } else if (sentiment === 'negative') {
      return 'supportive';
    } else {
      return 'neutral';
    }
  }

  calculateLanguageComplexity(patterns) {
    const frequency = patterns.frequency;
    
    if (frequency > 10) return 'advanced';
    if (frequency > 5) return 'intermediate';
    return 'simple';
  }

  calculateInteractionSpeed(patterns) {
    const frequency = patterns.frequency;
    
    if (frequency > 10) return 'fast';
    if (frequency > 5) return 'normal';
    return 'slow';
  }

  calculateRecommendationWeights(patterns) {
    const weights = {};
    
    // Weight categories based on preferences
    Object.entries(patterns.preferredCategories).forEach(([category, count]) => {
      weights[category] = Math.min(count / 10, 1.0); // Normalize to 0-1
    });
    
    return weights;
  }

  calculateDiversityFactor(patterns) {
    const categoryCount = Object.keys(patterns.preferredCategories).length;
    const interactionCount = Object.values(patterns.preferredCategories).reduce((sum, count) => sum + count, 0);
    
    // Higher diversity if user interacts with many categories
    return categoryCount / Math.max(interactionCount, 1);
  }

  async adaptToSeasonalPatterns() {
    try {
      const currentSeason = this.getCurrentSeason();
      const seasonalData = this.getSeasonalData(currentSeason);
      
      // Adjust models based on season
      await this.adjustModelsForSeason(currentSeason, seasonalData);
      
      console.log(`🌸 Adapted to ${currentSeason} season`);
    } catch (error) {
      console.error('Error adapting to seasonal patterns:', error);
    }
  }

  // Helper Methods
  async getRecentUserBehavior() {
    try {
      // Get recent interactions from learning data
      const recentInteractions = this.learningData.userInteractions.slice(-100); // Last 100 interactions
      
      // Analyze behavior patterns
      const behaviorPatterns = {
        preferredCategories: this.analyzePreferredCategories(recentInteractions),
        activeHours: this.analyzeActiveHours(recentInteractions),
        interactionTypes: this.analyzeInteractionTypes(recentInteractions),
        frequency: this.analyzeFrequency(recentInteractions)
      };
      
      return {
        patterns: behaviorPatterns,
        interactions: recentInteractions,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting recent user behavior:', error);
      return {
        patterns: {},
        interactions: [],
        lastUpdated: new Date().toISOString()
      };
    }
  }

  analyzePreferredCategories(interactions) {
    const categories = {};
    interactions.forEach(interaction => {
      if (interaction.category) {
        categories[interaction.category] = (categories[interaction.category] || 0) + 1;
      }
    });
    return categories;
  }

  analyzeActiveHours(interactions) {
    const hours = {};
    interactions.forEach(interaction => {
      if (interaction.timestamp) {
        const hour = new Date(interaction.timestamp).getHours();
        hours[hour] = (hours[hour] || 0) + 1;
      }
    });
    return hours;
  }

  analyzeInteractionTypes(interactions) {
    const types = {};
    interactions.forEach(interaction => {
      if (interaction.type) {
        types[interaction.type] = (types[interaction.type] || 0) + 1;
      }
    });
    return types;
  }

  analyzeFrequency(interactions) {
    if (interactions.length === 0) return 0;
    
    const now = Date.now();
    const weekAgo = now - (7 * 24 * 60 * 60 * 1000);
    const recentInteractions = interactions.filter(i => 
      new Date(i.timestamp).getTime() > weekAgo
    );
    
    return recentInteractions.length / 7; // Average per day
  }

  generateTrainingId() {
    return 'training_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  generateModelVersion() {
    const currentVersion = this.aiModels.chatbot?.version || '1.0';
    const versionParts = currentVersion.split('.');
    const patchVersion = parseInt(versionParts[2] || 0) + 1;
    return `${versionParts[0]}.${versionParts[1]}.${patchVersion}`;
  }

  calculateAccuracy(modelName, trainingData) {
    // Simulate accuracy calculation
    const baseAccuracy = this.aiModels[modelName]?.accuracy || 0.8;
    const improvement = Math.random() * 0.05; // 0-5% improvement
    return Math.min(baseAccuracy + improvement, 0.99);
  }

  calculatePerformance(modelName, trainingData) {
    // Simulate performance metrics
    return {
      accuracy: this.calculateAccuracy(modelName, trainingData),
      precision: Math.random() * 0.1 + 0.85,
      recall: Math.random() * 0.1 + 0.80,
      f1Score: Math.random() * 0.05 + 0.75,
      processingTime: Math.random() * 100 + 50 // ms
    };
  }

  calculateImprovements(modelName, trainingData) {
    return {
      accuracyImprovement: Math.random() * 0.05,
      speedImprovement: Math.random() * 0.1,
      reliabilityImprovement: Math.random() * 0.03,
      errorReduction: Math.random() * 0.08
    };
  }

  // Data Persistence
  saveLearningData() {
    this.learningData.lastUpdate = new Date().toISOString();
    localStorage.setItem('ai_learning_data', JSON.stringify(this.learningData));
  }

  saveTrainingSessions() {
    localStorage.setItem('ai_training_sessions', JSON.stringify(this.trainingSessions));
  }

  saveAIModels() {
    localStorage.setItem('ai_models', JSON.stringify(this.aiModels));
  }

  // Analytics and Monitoring
  getLearningAnalytics() {
    return {
      totalInteractions: this.learningData.userInteractions.length,
      totalTrainingSessions: this.trainingSessions.length,
      modelVersions: Object.keys(this.aiModels).reduce((acc, key) => {
        acc[key] = this.aiModels[key].version;
        return acc;
      }, {}),
      averageAccuracy: this.calculateAverageAccuracy(),
      learningRate: this.calculateLearningRate(),
      lastUpdate: this.learningData.lastUpdate
    };
  }

  calculateAverageAccuracy() {
    const models = Object.values(this.aiModels);
    const totalAccuracy = models.reduce((sum, model) => sum + (model.accuracy || 0), 0);
    return totalAccuracy / models.length;
  }

  calculateLearningRate() {
    const recentSessions = this.trainingSessions.slice(-10);
    if (recentSessions.length === 0) return 0;
    
    const totalImprovement = recentSessions.reduce((sum, session) => {
      return sum + (session.result?.improvements?.accuracyImprovement || 0);
    }, 0);
    
    return totalImprovement / recentSessions.length;
  }

  // Public API Methods
  async startTraining(modelName, customData = null) {
    return await this.trainModel(modelName, customData);
  }

  getTrainingStatus() {
    return {
      isTraining: this.isTraining,
      currentSession: this.currentTrainingSession,
      completedSessions: this.trainingSessions.filter(s => s.status === 'completed'),
      failedSessions: this.trainingSessions.filter(s => s.status === 'failed')
    };
  }

  getModelPerformance(modelName) {
    return this.aiModels[modelName] || null;
  }

  getAllModels() {
    return this.aiModels;
  }

  // Mock Data Methods
  getMockAIModels() {
    return {
      chatbot: {
        version: '2.1.0',
        accuracy: 0.92,
        lastTrained: new Date(Date.now() - 86400000).toISOString(),
        performance: {
          precision: 0.88,
          recall: 0.91,
          f1Score: 0.89
        },
        trainingData: Array.from({ length: 1250 }, (_, i) => ({ id: i + 1 }))
      },
      pricing: {
        version: '1.8.3',
        accuracy: 0.87,
        lastTrained: new Date(Date.now() - 172800000).toISOString(),
        performance: {
          precision: 0.85,
          recall: 0.88,
          f1Score: 0.86
        },
        trainingData: Array.from({ length: 890 }, (_, i) => ({ id: i + 1 }))
      },
      recommendations: {
        version: '3.0.1',
        accuracy: 0.94,
        lastTrained: new Date(Date.now() - 259200000).toISOString(),
        performance: {
          precision: 0.92,
          recall: 0.94,
          f1Score: 0.93
        },
        trainingData: Array.from({ length: 2100 }, (_, i) => ({ id: i + 1 }))
      },
      sentiment: {
        version: '1.5.2',
        accuracy: 0.89,
        lastTrained: new Date(Date.now() - 345600000).toISOString(),
        performance: {
          precision: 0.87,
          recall: 0.90,
          f1Score: 0.88
        },
        trainingData: Array.from({ length: 1560 }, (_, i) => ({ id: i + 1 }))
      }
    };
  }

  getMockTrainingSessions() {
    return [
      {
        id: 1,
        modelName: 'chatbot',
        startTime: new Date(Date.now() - 3600000).toISOString(),
        endTime: new Date(Date.now() - 3000000).toISOString(),
        status: 'completed',
        result: {
          accuracy: 0.92,
          improvements: {
            accuracyImprovement: 0.03
          }
        }
      },
      {
        id: 2,
        modelName: 'pricing',
        startTime: new Date(Date.now() - 7200000).toISOString(),
        endTime: new Date(Date.now() - 6000000).toISOString(),
        status: 'completed',
        result: {
          accuracy: 0.87,
          improvements: {
            accuracyImprovement: 0.02
          }
        }
      }
    ];
  }

  getMockLearningData() {
    return {
      userInteractions: Array.from({ length: 450 }, (_, i) => ({ id: i + 1 })),
      pricingPatterns: Array.from({ length: 230 }, (_, i) => ({ id: i + 1 })),
      productInsights: Array.from({ length: 180 }, (_, i) => ({ id: i + 1 })),
      conversationContexts: Array.from({ length: 320 }, (_, i) => ({ id: i + 1 }))
    };
  }

  // Export singleton instance
  static getInstance() {
    if (!window.aiLearningServiceInstance) {
      window.aiLearningServiceInstance = new AILearningService();
    }
    return window.aiLearningServiceInstance;
  }
}

// Export class as default and named export for the instance
const aiLearningServiceInstance = AILearningService.getInstance();
export default AILearningService;
export { aiLearningServiceInstance };
export const initializeLearningSystem = () => aiLearningServiceInstance.initializeLearningSystem();
