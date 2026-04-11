// Comprehensive Pricing Service - Advanced Pricing Operations
import BaseService from '@/shared/services/base/BaseService';

class PricingService extends BaseService {
  constructor() {
    super();
    this.endpoint = '/pricing';
    this.wsEndpoint = 'ws://localhost:8080';
  }

  // Core pricing operations
  async getProductPricing(productId, params = {}) {
    try {
      const response = await this.get(`${this.endpoint}/products/${productId}/pricing`);
      return {
        success: true,
        data: response.data || response,
        message: 'Product pricing fetched successfully'
      };
    } catch (error) {
      console.error('Error fetching product pricing:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to fetch product pricing',
        mockData: this.getMockProductPricing(productId)
      };
    }
  }

  async updateProductPricing(productId, pricingData) {
    try {
      const response = await this.put(`${this.endpoint}/products/${productId}/pricing`, pricingData);
      return {
        success: true,
        data: response.data || response,
        message: 'Product pricing updated successfully'
      };
    } catch (error) {
      console.error('Error updating product pricing:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to update product pricing'
      };
    }
  }

  async getBulkProductPricing(productIds, params = {}) {
    try {
      const response = await this.post(`${this.endpoint}/products/bulk-pricing`, { productIds, ...params });
      return {
        success: true,
        data: response.data || response,
        message: 'Bulk product pricing fetched successfully'
      };
    } catch (error) {
      console.error('Error fetching bulk product pricing:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to fetch bulk product pricing',
        mockData: this.getMockBulkProductPricing(productIds)
      };
    }
  }

  async updateBulkProductPricing(pricingUpdates) {
    try {
      const response = await this.put(`${this.endpoint}/products/bulk-pricing`, pricingUpdates);
      return {
        success: true,
        data: response.data || response,
        message: 'Bulk product pricing updated successfully'
      };
    } catch (error) {
      console.error('Error updating bulk product pricing:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to update bulk product pricing'
      };
    }
  }

  // Dynamic pricing
  async getDynamicPricingRules(params = {}) {
    try {
      const response = await this.get(`${this.endpoint}/dynamic/rules`);
      return {
        success: true,
        data: response.data || response,
        message: 'Dynamic pricing rules fetched successfully'
      };
    } catch (error) {
      console.error('Error fetching dynamic pricing rules:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to fetch dynamic pricing rules',
        mockData: this.getMockDynamicPricingRules()
      };
    }
  }

  async createDynamicPricingRule(ruleData) {
    try {
      const response = await this.post(`${this.endpoint}/dynamic/rules`, ruleData);
      return {
        success: true,
        data: response.data || response,
        message: 'Dynamic pricing rule created successfully'
      };
    } catch (error) {
      console.error('Error creating dynamic pricing rule:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to create dynamic pricing rule'
      };
    }
  }

  async calculateDynamicPrice(productId, context = {}) {
    try {
      const response = await this.post(`${this.endpoint}/dynamic/calculate`, { productId, context });
      return {
        success: true,
        data: response.data || response,
        message: 'Dynamic price calculated successfully'
      };
    } catch (error) {
      console.error('Error calculating dynamic price:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to calculate dynamic price',
        mockData: this.getMockDynamicPrice(productId, context)
      };
    }
  }

  // Price optimization
  async getPriceOptimization(params = {}) {
    try {
      const response = await this.get(`${this.endpoint}/optimization`);
      return {
        success: true,
        data: response.data || response,
        message: 'Price optimization fetched successfully'
      };
    } catch (error) {
      console.error('Error fetching price optimization:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to fetch price optimization',
        mockData: this.getMockPriceOptimization()
      };
    }
  }

  async runPriceOptimization(optimizationRequest) {
    try {
      const response = await this.post(`${this.endpoint}/optimization/run`, optimizationRequest);
      return {
        success: true,
        data: response.data || response,
        message: 'Price optimization completed successfully'
      };
    } catch (error) {
      console.error('Error running price optimization:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to run price optimization',
        mockData: this.getMockOptimizationResults(optimizationRequest)
      };
    }
  }

  async getOptimizationHistory(params = {}) {
    try {
      const response = await this.get(`${this.endpoint}/optimization/history`);
      return {
        success: true,
        data: response.data || response,
        message: 'Optimization history fetched successfully'
      };
    } catch (error) {
      console.error('Error fetching optimization history:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to fetch optimization history',
        mockData: this.getMockOptimizationHistory()
      };
    }
  }

  // Price testing and simulation
  async createPriceTest(testData) {
    try {
      const response = await this.post(`${this.endpoint}/tests`, testData);
      return {
        success: true,
        data: response.data || response,
        message: 'Price test created successfully'
      };
    } catch (error) {
      console.error('Error creating price test:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to create price test'
      };
    }
  }

  async getPriceTest(testId) {
    try {
      const response = await this.get(`${this.endpoint}/tests/${testId}`);
      return {
        success: true,
        data: response.data || response,
        message: 'Price test fetched successfully'
      };
    } catch (error) {
      console.error('Error fetching price test:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to fetch price test',
        mockData: this.getMockPriceTest(testId)
      };
    }
  }

  async runPriceSimulation(simulationData) {
    try {
      const response = await this.post(`${this.endpoint}/simulation`, simulationData);
      return {
        success: true,
        data: response.data || response,
        message: 'Price simulation completed successfully'
      };
    } catch (error) {
      console.error('Error running price simulation:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to run price simulation',
        mockData: this.getMockPriceSimulation(simulationData)
      };
    }
  }

  // Customer segment pricing
  async getCustomerSegmentPricing(params = {}) {
    try {
      const response = await this.get(`${this.endpoint}/segments/pricing`);
      return {
        success: true,
        data: response.data || response,
        message: 'Customer segment pricing fetched successfully'
      };
    } catch (error) {
      console.error('Error fetching customer segment pricing:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to fetch customer segment pricing',
        mockData: this.getMockCustomerSegmentPricing()
      };
    }
  }

  async updateCustomerSegmentPricing(segmentId, pricingData) {
    try {
      const response = await this.put(`${this.endpoint}/segments/${segmentId}/pricing`, pricingData);
      return {
        success: true,
        data: response.data || response,
        message: 'Customer segment pricing updated successfully'
      };
    } catch (error) {
      console.error('Error updating customer segment pricing:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to update customer segment pricing'
      };
    }
  }

  async getPersonalizedPrice(customerId, productId, context = {}) {
    try {
      const response = await this.post(`${this.endpoint}/personalized`, { customerId, productId, context });
      return {
        success: true,
        data: response.data || response,
        message: 'Personalized price calculated successfully'
      };
    } catch (error) {
      console.error('Error calculating personalized price:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to calculate personalized price',
        mockData: this.getMockPersonalizedPrice(customerId, productId, context)
      };
    }
  }

  // Competitor pricing
  async getCompetitorPricing(params = {}) {
    try {
      const response = await this.get(`${this.endpoint}/competitors`);
      return {
        success: true,
        data: response.data || response,
        message: 'Competitor pricing fetched successfully'
      };
    } catch (error) {
      console.error('Error fetching competitor pricing:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to fetch competitor pricing',
        mockData: this.getMockCompetitorPricing()
      };
    }
  }

  async updateCompetitorPricing(competitorId, pricingData) {
    try {
      const response = await this.put(`${this.endpoint}/competitors/${competitorId}`, pricingData);
      return {
        success: true,
        data: response.data || response,
        message: 'Competitor pricing updated successfully'
      };
    } catch (error) {
      console.error('Error updating competitor pricing:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to update competitor pricing'
      };
    }
  }

  async analyzeCompetitorPricing(params = {}) {
    try {
      const response = await this.get(`${this.endpoint}/competitors/analysis`);
      return {
        success: true,
        data: response.data || response,
        message: 'Competitor pricing analysis completed successfully'
      };
    } catch (error) {
      console.error('Error analyzing competitor pricing:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to analyze competitor pricing',
        mockData: this.getMockCompetitorAnalysis()
      };
    }
  }

  // Pricing analytics and insights
  async getPricingInsights(params = {}) {
    try {
      const response = await this.get(`${this.endpoint}/insights`);
      return {
        success: true,
        data: response.data || response,
        message: 'Pricing insights fetched successfully'
      };
    } catch (error) {
      console.error('Error fetching pricing insights:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to fetch pricing insights',
        mockData: this.getMockPricingInsights()
      };
    }
  }

  async getPricingTrends(params = {}) {
    try {
      const response = await this.get(`${this.endpoint}/trends`);
      return {
        success: true,
        data: response.data || response,
        message: 'Pricing trends fetched successfully'
      };
    } catch (error) {
      console.error('Error fetching pricing trends:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to fetch pricing trends',
        mockData: this.getMockPricingTrends()
      };
    }
  }

  async getPriceElasticity(params = {}) {
    try {
      const response = await this.get(`${this.endpoint}/elasticity`);
      return {
        success: true,
        data: response.data || response,
        message: 'Price elasticity fetched successfully'
      };
    } catch (error) {
      console.error('Error fetching price elasticity:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to fetch price elasticity',
        mockData: this.getMockPriceElasticity()
      };
    }
  }

  // Pricing strategies
  async getPricingStrategies(params = {}) {
    try {
      const response = await this.get(`${this.endpoint}/strategies`);
      return {
        success: true,
        data: response.data || response,
        message: 'Pricing strategies fetched successfully'
      };
    } catch (error) {
      console.error('Error fetching pricing strategies:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to fetch pricing strategies',
        mockData: this.getMockPricingStrategies()
      };
    }
  }

  async createPricingStrategy(strategyData) {
    try {
      const response = await this.post(`${this.endpoint}/strategies`, strategyData);
      return {
        success: true,
        data: response.data || response,
        message: 'Pricing strategy created successfully'
      };
    } catch (error) {
      console.error('Error creating pricing strategy:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to create pricing strategy'
      };
    }
  }

  async applyPricingStrategy(strategyId, params = {}) {
    try {
      const response = await this.post(`${this.endpoint}/strategies/${strategyId}/apply`, params);
      return {
        success: true,
        data: response.data || response,
        message: 'Pricing strategy applied successfully'
      };
    } catch (error) {
      console.error('Error applying pricing strategy:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to apply pricing strategy'
      };
    }
  }

  // Real-time pricing updates
  subscribeToPricingUpdates(callback) {
    if (typeof WebSocket !== 'undefined') {
      const ws = new WebSocket(`${this.wsEndpoint}/pricing-updates`);
      
      ws.onopen = () => {
        console.log('Connected to pricing updates WebSocket');
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          callback(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
      
      ws.onclose = () => {
        console.log('Disconnected from pricing updates WebSocket');
      };
      
      return ws;
    }
    
    // Fallback to polling
    const interval = setInterval(async () => {
      try {
        const updates = await this.getPricingUpdates();
        callback(updates);
      } catch (error) {
        console.error('Error fetching pricing updates:', error);
      }
    }, 30000);
    
    return { close: () => clearInterval(interval) };
  }

  async getPricingUpdates(params = {}) {
    try {
      const response = await this.get(`${this.endpoint}/updates`);
      return {
        success: true,
        data: response.data || response,
        message: 'Pricing updates fetched successfully'
      };
    } catch (error) {
      console.error('Error fetching pricing updates:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to fetch pricing updates',
        mockData: this.getMockPricingUpdates()
      };
    }
  }

  // Pricing reports and exports
  async generatePricingReport(reportType, params = {}) {
    try {
      const response = await this.post(`${this.endpoint}/reports/${reportType}`, params);
      return {
        success: true,
        data: response.data || response,
        message: 'Pricing report generated successfully'
      };
    } catch (error) {
      console.error('Error generating pricing report:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to generate pricing report',
        mockData: this.getMockPricingReport(reportType)
      };
    }
  }

  async exportPricingData(params = {}) {
    try {
      const response = await this.post(`${this.endpoint}/export`, params);
      return {
        success: true,
        data: response.data || response,
        message: 'Pricing data exported successfully'
      };
    } catch (error) {
      console.error('Error exporting pricing data:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to export pricing data'
      };
    }
  }

  // Mock data methods
  getMockProductPricing(productId) {
    return {
      productId,
      basePrice: 2500,
      currentPrice: 2750,
      cost: 1800,
      margin: 34.5,
      pricingHistory: [
        { date: '2024-01-01', price: 2500, reason: 'السعر الأساسي' },
        { date: '2024-01-15', price: 2600, reason: 'زيادة التكاليف' },
        { date: '2024-02-01', price: 2750, reason: 'تحسين الهامش' }
      ],
      dynamicPricing: {
        enabled: true,
        rules: ['demand_based', 'competitor_based'],
        lastCalculated: '2024-01-20T10:30:00Z',
        nextCalculation: '2024-01-20T11:30:00Z'
      },
      segmentation: {
        segments: [
          { name: 'عملاء VIP', price: 3200, discount: 0 },
          { name: 'عملاء عائدون', price: 2600, discount: 5.5 },
          { name: 'عملاء جدد', price: 2475, discount: 10 }
        ]
      }
    };
  }

  getMockBulkProductPricing(productIds) {
    return productIds.map(id => ({
      productId: id,
      basePrice: 2000 + (id * 100),
      currentPrice: 2200 + (id * 110),
      cost: 1500 + (id * 80),
      margin: 32.5 + (id * 2),
      lastUpdated: '2024-01-20T10:30:00Z'
    }));
  }

  getMockDynamicPricingRules() {
    return {
      rules: [
        {
          id: 1,
          name: 'تسعير بناءً على الطلب',
          type: 'demand_based',
          conditions: ['demand > 100', 'inventory < 50'],
          adjustments: [
            { condition: 'demand > 150', adjustment: 1.2 },
            { condition: 'demand > 100', adjustment: 1.1 },
            { condition: 'inventory < 20', adjustment: 1.15 }
          ],
          isActive: true,
          priority: 'high'
        },
        {
          id: 2,
          name: 'تسعير تنافسي',
          type: 'competitor_based',
          conditions: ['competitor_price_available'],
          adjustments: [
            { condition: 'competitor_price < our_price * 0.95', adjustment: 0.97 },
            { condition: 'competitor_price > our_price * 1.05', adjustment: 1.03 }
          ],
          isActive: true,
          priority: 'medium'
        }
      ]
    };
  }

  getMockDynamicPrice(productId, context) {
    const basePrice = 2500;
    let finalPrice = basePrice;
    
    // Apply demand-based adjustment
    if (context.demand > 100) {
      finalPrice *= 1.1;
    }
    
    // Apply competitor-based adjustment
    if (context.competitorPrice && context.competitorPrice < basePrice * 0.95) {
      finalPrice *= 0.97;
    }
    
    // Apply time-based adjustment
    const hour = new Date().getHours();
    if (hour >= 18 && hour <= 22) {
      finalPrice *= 1.05; // Peak hours
    }
    
    return {
      productId,
      basePrice,
      finalPrice: Math.round(finalPrice),
      adjustments: [
        { type: 'demand', factor: context.demand > 100 ? 1.1 : 1.0 },
        { type: 'competitor', factor: context.competitorPrice ? 0.97 : 1.0 },
        { type: 'time', factor: (hour >= 18 && hour <= 22) ? 1.05 : 1.0 }
      ],
      calculatedAt: new Date().toISOString()
    };
  }

  getMockPriceOptimization() {
    return {
      overview: {
        totalProducts: 125,
        optimizedProducts: 89,
        potentialRevenueIncrease: 45000,
        optimizationScore: 78.5
      },
      recommendations: [
        {
          productId: 1,
          productName: 'فينيل ديكوري فاخر',
          currentPrice: 2500,
          suggestedPrice: 2750,
          expectedImpact: 8500,
          confidence: 92,
          reason: 'مرونة الطلب المنخفضة'
        },
        {
          productId: 2,
          productName: 'فينيل جدران عصري',
          currentPrice: 1800,
          suggestedPrice: 1650,
          expectedImpact: 6200,
          confidence: 85,
          reason: 'زيادة الحساسية للسعر'
        }
      ],
      optimizationStrategies: [
        {
          name: 'زيادة هوامش الربح',
          products: [1, 3, 5],
          expectedImpact: 25000,
          complexity: 'low'
        },
        {
          name: 'تسعير تنافسي',
          products: [2, 4, 6],
          expectedImpact: 15000,
          complexity: 'medium'
        }
      ]
    };
  }

  getMockOptimizationResults(request) {
    return {
      requestId: request.id || 'mock-request-1',
      status: 'completed',
      results: {
        totalRevenueIncrease: 45000,
        productsOptimized: 89,
        averagePriceChange: 8.5,
        implementationPlan: {
          phase1: { duration: '2 weeks', products: 30 },
          phase2: { duration: '3 weeks', products: 59 }
        }
      },
      completedAt: new Date().toISOString()
    };
  }

  getMockOptimizationHistory() {
    return {
      history: [
        {
          id: 1,
          name: 'تحسين أسعار الربيع',
          status: 'completed',
          createdAt: '2024-01-15T10:00:00Z',
          completedAt: '2024-01-20T15:30:00Z',
          results: { revenueIncrease: 25000, productsOptimized: 45 }
        },
        {
          id: 2,
          name: 'تحسين أسعار الصيف',
          status: 'in_progress',
          createdAt: '2024-01-18T09:00:00Z',
          progress: 65
        }
      ],
      summary: {
        total: 12,
        completed: 8,
        inProgress: 2,
        failed: 2
      }
    };
  }

  getMockPriceTest(testId) {
    return {
      id: testId,
      name: 'اختبار سعر فينيل الديكوري',
      status: 'running',
      duration: '14 days',
      startedAt: '2024-01-15T10:00:00Z',
      estimatedCompletion: '2024-01-29T10:00:00Z',
      variants: [
        { name: 'السعر الحالي', price: 2500, traffic: 50, conversions: 12 },
        { name: 'السعر المقترح', price: 2750, traffic: 50, conversions: 10 }
      ],
      results: {
        statisticalSignificance: 0.85,
        winner: 'السعر الحالي',
        confidence: 78
      }
    };
  }

  getMockPriceSimulation(simulationData) {
    return {
      simulationId: 'mock-sim-1',
      scenario: simulationData.scenario || 'price_increase_10',
      results: {
        baseline: { revenue: 168000, orders: 680, avgPrice: 247 },
        simulated: { revenue: 185000, orders: 720, avgPrice: 257 },
        impact: {
          revenueChange: 17000,
          revenueChangePercent: 10.1,
          ordersChange: 40,
          priceChange: 10
        }
      },
      assumptions: ['مرونة الطلب ثابتة', 'لا تغيير في سلوك المنافسين'],
      confidence: 85
    };
  }

  getMockCustomerSegmentPricing() {
    return {
      segments: [
        {
          id: 1,
          name: 'عملاء VIP',
          size: 340,
          pricingStrategy: 'premium',
          avgDiscount: 0,
          avgPrice: 3200,
          characteristics: ['دفع مسبق', 'خدمة مميزة']
        },
        {
          id: 2,
          name: 'عملاء عائدون',
          size: 890,
          pricingStrategy: 'value_based',
          avgDiscount: 5.5,
          avgPrice: 2600,
          characteristics: ['ولاء للعلامة', 'أقل حساسية للسعر']
        },
        {
          id: 3,
          name: 'عملاء جدد',
          size: 1250,
          pricingStrategy: 'acquisition',
          avgDiscount: 10,
          avgPrice: 2475,
          characteristics: ['بحث عن أفضل سعر', 'يتأثر بالخصومات']
        }
      ]
    };
  }

  getMockPersonalizedPrice(customerId, productId, context) {
    const basePrice = 2500;
    let finalPrice = basePrice;
    
    // Apply customer segment discount
    if (context.customerSegment === 'VIP') {
      finalPrice *= 1.0; // No discount for VIP
    } else if (context.customerSegment === 'returning') {
      finalPrice *= 0.945; // 5.5% discount
    } else if (context.customerSegment === 'new') {
      finalPrice *= 0.90; // 10% discount
    }
    
    return {
      customerId,
      productId,
      basePrice,
      personalizedPrice: Math.round(finalPrice),
      discount: Math.round((1 - finalPrice / basePrice) * 100),
      factors: [
        { type: 'segment', impact: context.customerSegment || 'standard' },
        { type: 'purchase_history', impact: context.purchaseHistory || 'none' },
        { type: 'location', impact: context.location || 'standard' }
      ],
      calculatedAt: new Date().toISOString()
    };
  }

  getMockCompetitorPricing() {
    return {
      competitors: [
        {
          id: 1,
          name: 'المنافس أ',
          products: [
            { productId: 1, price: 2400, lastUpdated: '2024-01-20T09:00:00Z' },
            { productId: 2, price: 1700, lastUpdated: '2024-01-20T09:00:00Z' }
          ],
          marketShare: 18.2,
          pricingStrategy: 'competitive'
        },
        {
          id: 2,
          name: 'المنافس ب',
          products: [
            { productId: 1, price: 2600, lastUpdated: '2024-01-19T14:00:00Z' },
            { productId: 2, price: 1900, lastUpdated: '2024-01-19T14:00:00Z' }
          ],
          marketShare: 15.7,
          pricingStrategy: 'premium'
        }
      ],
      lastUpdated: '2024-01-20T10:30:00Z'
    };
  }

  getMockCompetitorAnalysis() {
    return {
      marketOverview: {
        totalMarketSize: 2500000,
        ourMarketShare: 23.5,
        avgMarketPrice: 2450,
        pricePosition: 'competitive'
      },
      priceComparison: [
        {
          category: 'فينيل ديكوري',
          ourPrice: 2500,
          marketAvg: 2450,
          competitorLow: 2200,
          competitorHigh: 2800,
          position: 'slightly_above_average'
        }
      ],
      recommendations: [
        {
          type: 'price_adjustment',
          priority: 'medium',
          suggestion: 'زيادة السعر بنسبة 2%',
          reason: 'سعرنا أقل من المتوسط السوقي',
          expectedImpact: 5000
        }
      ]
    };
  }

  getMockPricingInsights() {
    return {
      insights: [
        {
          type: 'opportunity',
          title: 'فرصة لزيادة الأسعار',
          description: 'منتجات فينيل الديكوري لديها مرونة طلب منخفضة',
          potentialImpact: 8500,
          confidence: 92
        },
        {
          type: 'warning',
          title: 'منافسون يخفضون الأسعار',
          description: 'المنافس الرئيسي خفض الأسعار بنسبة 15%',
          potentialImpact: -12000,
          confidence: 78
        }
      ],
      summary: {
        total: 8,
        opportunities: 3,
        warnings: 3,
        risks: 2
      }
    };
  }

  getMockPricingTrends() {
    return {
      trends: {
        monthly: [
          { month: 'يناير', avgPrice: 247, revenue: 168000, orders: 680 },
          { month: 'فبراير', avgPrice: 252, revenue: 185000, orders: 735 },
          { month: 'مارس', avgPrice: 248, revenue: 172000, orders: 694 }
        ],
        categories: [
          {
            name: 'فينيل ديكوري',
            trend: 'increasing',
            change: 5.2,
            confidence: 85
          },
          {
            name: 'فينيل جدران',
            trend: 'stable',
            change: 0.8,
            confidence: 72
          }
        ]
      },
      predictions: {
        nextMonth: { avgPrice: 251, confidence: 78 },
        nextQuarter: { avgPrice: 253, confidence: 65 }
      }
    };
  }

  getMockPriceElasticity() {
    return {
      overview: {
        avgElasticity: -1.8,
        priceSensitivity: 'medium',
        revenueOptimization: 15.3
      },
      products: [
        {
          productId: 1,
          name: 'فينيل ديكوري فاخر',
          currentPrice: 2500,
          elasticity: -1.2,
          sensitivity: 'low',
          optimalPrice: 2750,
          expectedRevenue: 330000
        },
        {
          productId: 2,
          name: 'فينيل جدران عصري',
          currentPrice: 1800,
          elasticity: -2.1,
          sensitivity: 'high',
          optimalPrice: 1650,
          expectedRevenue: 462000
        }
      ]
    };
  }

  getMockPricingStrategies() {
    return {
      strategies: [
        {
          id: 1,
          name: 'استراتيجية التسعير المميز',
          type: 'premium',
          description: 'تركيز على الجودة العالية والسعر المرتفع',
          targetSegments: ['عملاء VIP'],
          conditions: ['جودة فائقة', 'خدمة مميزة'],
          isActive: true,
          performance: { revenue: 85000, margin: 45.2 }
        },
        {
          id: 2,
          name: 'استراتيجية التسعير التنافسي',
          type: 'competitive',
          description: 'مطابقة أو التفوق على أسعار المنافسين',
          targetSegments: ['عملاء عائدون'],
          conditions: ['سعر المنافس', 'جودة مماثلة'],
          isActive: true,
          performance: { revenue: 62000, margin: 28.5 }
        }
      ]
    };
  }

  getMockPricingUpdates() {
    return {
      updates: [
        {
          id: 1,
          type: 'price_change',
          productId: 1,
          oldPrice: 2500,
          newPrice: 2750,
          changePercent: 10,
          reason: 'زيادة هوامش الربح',
          timestamp: '2024-01-20T10:30:00Z'
        },
        {
          id: 2,
          type: 'dynamic_calculation',
          productId: 2,
          calculatedPrice: 1650,
          factors: ['demand', 'competitor', 'time'],
          timestamp: '2024-01-20T11:15:00Z'
        }
      ],
      summary: {
        total: 15,
        today: 3,
        thisHour: 1
      }
    };
  }

  getMockPricingReport(reportType) {
    const reports = {
      monthly: {
        title: 'تقرير التسعير الشهري',
        period: 'يناير 2024',
        data: {
          totalRevenue: 168000,
          avgPrice: 247,
          totalOrders: 680,
          topPerformingProducts: [
            { name: 'فينيل ديكوري فاخر', revenue: 85000, orders: 34 },
            { name: 'فينيل جدران عصري', revenue: 52000, orders: 29 }
          ]
        }
      },
      optimization: {
        title: 'تقرير تحسين التسعير',
        period: 'الربع الأول 2024',
        data: {
          optimizationsCompleted: 8,
          revenueIncrease: 45000,
          productsOptimized: 89,
          avgImprovement: 12.5
        }
      }
    };
    
    return reports[reportType] || reports.monthly;
  }
}

// Export singleton instance
const pricingServiceInstance = new PricingService();

// Add singleton pattern for compatibility
PricingService.getInstance = function() {
  return pricingServiceInstance;
};

export default pricingServiceInstance;
export { PricingService };
