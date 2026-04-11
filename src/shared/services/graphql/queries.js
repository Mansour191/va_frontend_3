import { gql } from '@apollo/client';

// Basic Connection Test Query
export const HELLO_QUERY = gql`
  query {
    hello
  }
`;

// AI Service GraphQL Queries
export const AI_HEALTH_CHECK = gql`
  query GetAIHealth($service: String) {
    aiHealth(service: $service) {
      status
      available
    }
  }
`;

export const CHECK_AI_HEALTH = gql`
  query CheckAIHealth($service: String) {
    checkAIHealth(service: $service) {
      status
      available
    }
  }
`;

export const SYSTEM_HEALTH_CHECK = gql`
  query SystemHealthCheck {
    systemHealthCheck {
      status
      available
    }
  }
`;

export const MARKET_TRENDS = gql`
  query MarketTrends($category: String, $period: String) {
    marketTrends(category: $category, period: $period) {
      trend
      confidence
      factors
      category
      period
    }
  }
`;

// ERPNext Sync Logs Query
export const GET_SYNC_LOGS = gql`
  query GetSyncLogs($limit: Int, $status: String) {
    syncLogs(limit: $limit, status: $status) {
      id
      action
      status
      message
      recordsSynced
      errorMessage
      timestamp
    }
  }
`;

export const DEMAND_FORECAST = gql`
  query DemandForecast($productId: String!, $period: String) {
    demandForecast(productId: $productId, period: $period) {
      forecast
      confidence
      predictedDemand
      timePeriod
      productId
    }
  }
`;

export const COMPETITOR_PRICES = gql`
  query CompetitorPrices($productId: String!) {
    competitorPrices(productId: $productId) {
      productId
      competitorName
      price
      currency
      lastUpdated
    }
  }
`;

export const PRICING_ANALYSIS = gql`
  query PricingAnalysis($productId: String!) {
    pricingAnalysis(productId: $productId) {
      productId
      optimalPrice
      marketAnalysis {
        trend
        confidence
        factors
        category
        period
      }
      competitorData {
        productId
        competitorName
        price
        currency
        lastUpdated
      }
      demandForecast {
        forecast
        confidence
        predictedDemand
        timePeriod
        productId
      }
      confidence
    }
  }
`;

// Product Queries
export const GET_PRODUCTS = gql`
  query GetProducts($categorySlug: String) {
    products(categorySlug: $categorySlug) {
      id
      nameAr
      nameEn
      slug
      descriptionAr
      descriptionEn
      basePrice
      image
      onSale
      discountPercent
      isNew
      createdAt
      syncStatus
      category {
        id
        nameAr
        nameEn
        slug
      }
      images {
        id
        image
        altText
      }
      variants {
        id
        nameAr
        nameEn
        priceAdjustment
      }
    }
  }
`;

export const GET_PRODUCT = gql`
  query GetProduct($id: ID!) {
    product(id: $id) {
      id
      name
      slug
      description
      price
      category {
        id
        nameAr
        nameEn
        slug
      }
      images {
        id
        image
        altText
      }
      variants {
        id
        nameAr
        nameEn
        priceAdjustment
      }
      inStock
      featured
      rating
      reviewsCount
      materials {
        id
        nameAr
        nameEn
      }
      specifications
    }
  }
`;

export const GET_CATEGORIES = gql`
  query GetCategories {
    categories {
      id
      nameAr
      nameEn
      slug
      icon
      wastePercent
    }
  }
`;

// User Queries
export const GET_ME = gql`
  query GetMe {
    me {
      id
      username
      email
      firstName
      lastName
      isStaff
      dateJoined
      profile {
        phone
        address
        wilaya {
          id
          nameAr
          nameFr
        }
        preferences
      }
    }
  }
`;

export const GET_SHIPPING_OPTIONS = gql`
  query GetShippingOptions {
    shippingOptions {
      id
      wilayaId
      nameAr
      nameFr
      stopDeskPrice
      homeDeliveryPrice
    }
  }
`;

// Forecast Queries
export const GET_PRODUCT_FORECASTS = gql`
  query GetProductForecasts($productId: ID!) {
    productForecasts(productId: $productId) {
      id
      product {
        id
        nameAr
        nameEn
      }
      forecastType
      period
      predictedDemand
      actualDemand
      errorMargin
      algorithmUsed
      confidence
      createdAt
    }
  }
`;

export const GET_ALL_FORECASTS = gql`
  query GetAllForecasts {
    forecasts {
      id
      product {
        id
        nameAr
        nameEn
      }
      forecastType
      period
      predictedDemand
      actualDemand
      errorMargin
      algorithmUsed
      confidence
      createdAt
    }
  }
`;
