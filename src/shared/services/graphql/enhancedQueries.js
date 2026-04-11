// Enhanced GraphQL Queries - Complete query definitions for all operations
import { gql } from '@apollo/client';

// Authentication Queries
export const GET_ME = gql`
  query GetMe {
    me {
      id
      username
      email
      firstName
      lastName
      isStaff
      isActive
      dateJoined
      lastLogin
      profile {
        id
        phone
        address
        bio
        avatar
        preferences
        settings
      }
    }
  }
`;

export const GET_MY_PROFILE = gql`
  query GetMyProfile {
    myProfile {
      id
      phone
      address
      bio
      avatar
      preferences
      settings
      user {
        id
        username
        email
        firstName
        lastName
      }
    }
  }
`;

// Product and Catalog Queries
export const GET_PRODUCTS = gql`
  query GetProducts($categorySlug: String, $limit: Int, $offset: Int, $search: String, $featured: Boolean, $onSale: Boolean, $isNew: Boolean) {
    products(categorySlug: $categorySlug, limit: $limit, offset: $offset, search: $search, featured: $featured, onSale: $onSale, isNew: $isNew) {
      id
      nameAr
      nameEn
      slug
      descriptionAr
      descriptionEn
      basePrice
      category {
        id
        nameAr
        nameEn
        slug
      }
      images {
        id
        imageUrl
        altText
        isMain
      }
      variants {
        id
        name
        sku
        price
        stock
        attributes
      }
      onSale
      discountPercent
      isFeatured
      isNew
      isActive
      stock
      weight
      dimensions
      tags
      createdAt
      updatedAt
    }
  }
`;

export const GET_PRODUCT = gql`
  query GetProduct($slug: String, $id: ID) {
    product(slug: $slug, id: $id) {
      id
      nameAr
      nameEn
      slug
      descriptionAr
      descriptionEn
      basePrice
      category {
        id
        nameAr
        nameEn
        slug
        icon
      }
      images {
        id
        imageUrl
        altText
        isMain
      }
      variants {
        id
        name
        sku
        price
        stock
        attributes
      }
      materials {
        id
        nameAr
        nameEn
        pricePerM2
        isPremium
      }
      onSale
      discountPercent
      isFeatured
      isNew
      isActive
      stock
      weight
      dimensions
      tags
      seoTitle
      seoDescription
      createdAt
      updatedAt
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
      isActive
      productCount
      image
      description
      parent {
        id
        nameAr
        nameEn
        slug
      }
      children {
        id
        nameAr
        nameEn
        slug
        icon
        productCount
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_CATEGORY = gql`
  query GetCategory($slug: String) {
    category(slug: $slug) {
      id
      nameAr
      nameEn
      slug
      icon
      wastePercent
      isActive
      productCount
      image
      description
      parent {
        id
        nameAr
        nameEn
        slug
      }
      children {
        id
        nameAr
        nameEn
        slug
        icon
        productCount
      }
      products {
        id
        nameAr
        nameEn
        slug
        basePrice
        images {
          id
          imageUrl
          altText
          isMain
        }
        onSale
        discountPercent
        isFeatured
        isNew
        stock
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_MATERIALS = gql`
  query GetMaterials {
    materials {
      id
      nameAr
      nameEn
      description
      pricePerM2
      isPremium
      isActive
      image
      properties
      createdAt
      updatedAt
    }
  }
`;

export const GET_MATERIAL = gql`
  query GetMaterial($id: ID!) {
    material(id: $id) {
      id
      nameAr
      nameEn
      description
      pricePerM2
      isPremium
      isActive
      image
      properties
      products {
        id
        nameAr
        nameEn
        slug
        basePrice
        images {
          id
          imageUrl
          altText
        }
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_PRODUCT_VARIANTS = gql`
  query GetProductVariants($productId: ID!) {
    productVariants(productId: $productId) {
      id
      name
      sku
      price
      stock
      attributes
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const GET_SHIPPING_OPTIONS = gql`
  query GetShippingOptions {
    shippingOptions {
      id
      nameAr
      nameEn
      homeDeliveryPrice
      agencyDeliveryPrice
      estimatedDays
      isActive
      regions
      createdAt
      updatedAt
    }
  }
`;

// Order and Payment Queries
export const GET_ORDERS = gql`
  query GetOrders($limit: Int, $offset: Int, $status: String, $dateFrom: String, $dateTo: String) {
    orders(limit: $limit, offset: $offset, status: $status, dateFrom: $dateFrom, dateTo: $dateTo) {
      id
      orderNumber
      user {
        id
        username
        email
        firstName
        lastName
      }
      status
      totalAmount
      subtotal
      shippingCost
      tax
      discount
      shippingAddress
      phone
      notes
      paymentMethod
      paymentStatus
      items {
        id
        product {
          id
          nameAr
          nameEn
          slug
          images {
            id
            imageUrl
            altText
          }
        }
        material {
          id
          nameAr
          nameEn
          pricePerM2
        }
        width
        height
        dimensionUnit
        marbleTexture
        customDesign
        quantity
        price
      }
      payments {
        id
        amount
        method
        status
        transactionId
        createdAt
      }
      timeline {
        id
        status
        note
        timestamp
        user {
          id
          username
        }
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_MY_ORDERS = gql`
  query GetMyOrders {
    myOrders {
      id
      orderNumber
      status
      totalAmount
      subtotal
      shippingCost
      tax
      discount
      shippingAddress
      phone
      notes
      paymentMethod
      paymentStatus
      items {
        id
        product {
          id
          nameAr
          nameEn
          slug
          images {
            id
            imageUrl
            altText
          }
        }
        material {
          id
          nameAr
          nameEn
        }
        width
        height
        dimensionUnit
        quantity
        price
      }
      payments {
        id
        amount
        method
        status
        transactionId
        createdAt
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_ORDER = gql`
  query GetOrder($id: ID!) {
    order(id: $id) {
      id
      orderNumber
      user {
        id
        username
        email
        firstName
        lastName
        profile {
          phone
          address
        }
      }
      status
      totalAmount
      subtotal
      shippingCost
      tax
      discount
      shippingAddress
      phone
      notes
      paymentMethod
      paymentStatus
      items {
        id
        product {
          id
          nameAr
          nameEn
          slug
          descriptionAr
          descriptionEn
          basePrice
          images {
            id
            imageUrl
            altText
            isMain
          }
          category {
            id
            nameAr
            nameEn
            slug
          }
        }
        material {
          id
          nameAr
          nameEn
          description
          pricePerM2
          isPremium
        }
        width
        height
        dimensionUnit
        marbleTexture
        customDesign
        quantity
        price
      }
      payments {
        id
        amount
        method
        status
        transactionId
        createdAt
      }
      timeline {
        id
        status
        note
        timestamp
        user {
          id
          username
        }
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_ORDER_ITEMS = gql`
  query GetOrderItems($orderId: ID!) {
    orderItems(orderId: $orderId) {
      id
      product {
        id
        nameAr
        nameEn
        slug
        images {
          id
          imageUrl
          altText
        }
      }
      material {
        id
        nameAr
        nameEn
        pricePerM2
      }
      width
      height
      dimensionUnit
      marbleTexture
      customDesign
      quantity
      price
      createdAt
    }
  }
`;

export const GET_PAYMENTS = gql`
  query GetPayments($limit: Int, $offset: Int, $status: String, $method: String) {
    payments(limit: $limit, offset: $offset, status: $status, method: $method) {
      id
      order {
        id
        orderNumber
        user {
          id
          username
          email
        }
      }
      amount
      method
      status
      transactionId
      gatewayResponse
      createdAt
      updatedAt
    }
  }
`;

export const GET_PAYMENT = gql`
  query GetPayment($id: ID!) {
    payment(id: $id) {
      id
      order {
        id
        orderNumber
        user {
          id
          username
          email
        }
        totalAmount
        items {
          id
          product {
            id
            nameAr
            nameEn
            slug
          }
          quantity
          price
        }
      }
      amount
      method
      status
      transactionId
      gatewayResponse
      createdAt
      updatedAt
    }
  }
`;

export const GET_COUPONS = gql`
  query GetCoupons($active: Boolean) {
    coupons(active: $active) {
      id
      code
      discountType
      discountValue
      minAmount
      maxDiscount
      usageLimit
      usedCount
      isActive
      validFrom
      validUntil
      createdAt
      updatedAt
    }
  }
`;

export const GET_COUPON = gql`
  query GetCoupon($code: String!) {
    coupon(code: $code) {
      id
      code
      discountType
      discountValue
      minAmount
      maxDiscount
      usageLimit
      usedCount
      isActive
      validFrom
      validUntil
      createdAt
      updatedAt
    }
  }
`;

// Cart and Wishlist Queries
export const GET_MY_CART = gql`
  query GetMyCart {
    myCart {
      id
      product {
        id
        nameAr
        nameEn
        slug
        basePrice
        images {
          id
          imageUrl
          altText
          isMain
        }
        stock
        isActive
      }
      material {
        id
        nameAr
        nameEn
        pricePerM2
        isActive
      }
      quantity
      options
      createdAt
      updatedAt
    }
  }
`;

export const GET_MY_WISHLIST = gql`
  query GetMyWishlist {
    myWishlist {
      id
      product {
        id
        nameAr
        nameEn
        slug
        basePrice
        images {
          id
          imageUrl
          altText
          isMain
        }
        stock
        isActive
        category {
          id
          nameAr
          nameEn
          slug
        }
      }
      createdAt
    }
  }
`;

// Review Queries
export const GET_REVIEWS = gql`
  query GetReviews($productId: ID, $limit: Int, $offset: Int, $rating: Int) {
    reviews(productId: $productId, limit: $limit, offset: $offset, rating: $rating) {
      id
      user {
        id
        username
        firstName
        lastName
        profile {
          avatar
        }
      }
      product {
        id
        nameAr
        nameEn
        slug
      }
      rating
      comment
      isVerified
      helpfulCount
      createdAt
      updatedAt
    }
  }
`;

export const GET_PRODUCT_REVIEWS = gql`
  query GetProductReviews($productSlug: String!) {
    productReviews(productSlug: $productSlug) {
      id
      user {
        id
        username
        firstName
        lastName
        profile {
          avatar
        }
      }
      product {
        id
        nameAr
        nameEn
        slug
      }
      rating
      comment
      isVerified
      helpfulCount
      createdAt
      updatedAt
    }
  }
`;

export const GET_MY_REVIEWS = gql`
  query GetMyReviews {
    myReviews {
      id
      user {
        id
        username
        firstName
        lastName
      }
      product {
        id
        nameAr
        nameEn
        slug
        images {
          id
          imageUrl
          altText
        }
      }
      rating
      comment
      isVerified
      helpfulCount
      createdAt
      updatedAt
    }
  }
`;

// Design Queries
export const GET_DESIGN_CATEGORIES = gql`
  query GetDesignCategories {
    designCategories {
      id
      nameAr
      nameEn
      slug
      description
      image
      isActive
      designCount
      createdAt
      updatedAt
    }
  }
`;

export const GET_DESIGNS = gql`
  query GetDesigns($categoryId: ID, $limit: Int, $offset: Int, $featured: Boolean) {
    designs(categoryId: $categoryId, limit: $limit, offset: $offset, featured: $featured) {
      id
      name
      description
      image
      category {
        id
        nameAr
        nameEn
        slug
      }
      user {
        id
        username
        firstName
        lastName
        profile {
          avatar
        }
      }
      isFeatured
      isActive
      likes
      downloads
      tags
      createdAt
      updatedAt
    }
  }
`;

export const GET_MY_DESIGNS = gql`
  query GetMyDesigns {
    myDesigns {
      id
      name
      description
      image
      category {
        id
        nameAr
        nameEn
        slug
      }
      isFeatured
      isActive
      likes
      downloads
      tags
      createdAt
      updatedAt
    }
  }
`;

// AI Service Queries
export const AI_HEALTH_CHECK = gql`
  query AiHealth($service: String) {
    aiHealth(service: $service) {
      status
      service
      available
      responseTime
      lastCheck
    }
  }
`;

export const MARKET_TRENDS = gql`
  query MarketTrends($category: String, $period: String) {
    marketTrends(category: $category, period: $period) {
      trend
      confidence
      factors {
        demand
        competition
        seasonality
      }
      category
      period
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
      confidence
    }
  }
`;

// Notification and Alert Queries
export const GET_NOTIFICATIONS = gql`
  query GetNotifications($limit: Int, $offset: Int, $unread: Boolean) {
    notifications(limit: $limit, offset: $offset, unread: $unread) {
      id
      user {
        id
        username
        firstName
        lastName
      }
      title
      message
      type
      isRead
      data
      createdAt
    }
  }
`;

export const GET_MY_NOTIFICATIONS = gql`
  query GetMyNotifications {
    myNotifications {
      id
      title
      message
      type
      isRead
      data
      createdAt
    }
  }
`;

export const GET_ALERTS = gql`
  query GetAlerts($limit: Int, $offset: Int, $active: Boolean) {
    alerts(limit: $limit, offset: $offset, active: $active) {
      id
      user {
        id
        username
        firstName
        lastName
      }
      type
      message
      isActive
      conditions
      createdAt
    }
  }
`;

export const GET_MY_ALERTS = gql`
  query GetMyAlerts {
    myAlerts {
      id
      type
      message
      isActive
      conditions
      createdAt
    }
  }
`;

// User Management Queries (Admin)
export const GET_USERS = gql`
  query GetUsers($limit: Int, $offset: Int, $role: String, $isActive: Boolean, $search: String) {
    users(limit: $limit, offset: $offset, role: $role, isActive: $isActive, search: $search) {
      id
      username
      email
      firstName
      lastName
      isStaff
      isActive
      dateJoined
      lastLogin
      profile {
        phone
        address
        avatar
      }
      orderCount
      totalSpent
    }
  }
`;

export const GET_USER = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      username
      email
      firstName
      lastName
      isStaff
      isActive
      dateJoined
      lastLogin
      profile {
        phone
        address
        bio
        avatar
        preferences
        settings
      }
      orders {
        id
        orderNumber
        status
        totalAmount
        createdAt
      }
      reviews {
        id
        rating
        comment
        product {
          id
          nameAr
          nameEn
          slug
        }
        createdAt
      }
    }
  }
`;

export const GET_USER_REVIEWS = gql`
  query GetUserReviews($userId: ID!) {
    userReviews(userId: $userId) {
      id
      user {
        id
        username
        firstName
        lastName
        profile {
          avatar
        }
      }
      product {
        id
        nameAr
        nameEn
        slug
        images {
          id
          imageUrl
          altText
        }
      }
      rating
      comment
      isVerified
      helpfulCount
      createdAt
      updatedAt
    }
  }
`;

export const GET_USER_DESIGNS = gql`
  query GetUserDesigns($userId: ID!) {
    userDesigns(userId: $userId) {
      id
      name
      description
      image
      category {
        id
        nameAr
        nameEn
        slug
      }
      isFeatured
      isActive
      likes
      downloads
      tags
      createdAt
      updatedAt
    }
  }
`;

export const GET_USER_ORDERS = gql`
  query GetUserOrders($userId: ID!) {
    userOrders(userId: $userId) {
      id
      orderNumber
      status
      totalAmount
      subtotal
      shippingCost
      tax
      discount
      paymentMethod
      paymentStatus
      items {
        id
        product {
          id
          nameAr
          nameEn
          slug
          images {
            id
            imageUrl
            altText
          }
        }
        quantity
        price
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_USER_NOTIFICATIONS = gql`
  query GetUserNotifications($userId: ID!) {
    userNotifications(userId: $userId) {
      id
      title
      message
      type
      isRead
      data
      createdAt
    }
  }
`;

export const GET_USER_ALERTS = gql`
  query GetUserAlerts($userId: ID!) {
    userAlerts(userId: $userId) {
      id
      type
      message
      isActive
      conditions
      createdAt
    }
  }
`;

// Analytics Queries
export const GET_DASHBOARD_STATS = gql`
  query GetDashboardStats {
    dashboardStats {
      totalOrders
      totalRevenue
      totalUsers
      totalProducts
      recentOrders {
        id
        orderNumber
        status
        totalAmount
        createdAt
      }
      topProducts {
        id
        nameAr
        nameEn
        slug
        sales
        revenue
      }
      salesData {
        date
        orders
        revenue
      }
    }
  }
`;

export const GET_ANALYTICS = gql`
  query GetAnalytics($period: String, $type: String) {
    analytics(period: $period, type: $type) {
      period
      type
      data
      summary
    }
  }
`;

// Search Queries
export const GLOBAL_SEARCH = gql`
  query GlobalSearch($query: String!, $types: [String]) {
    globalSearch(query: $query, types: $types) {
      products {
        id
        nameAr
        nameEn
        slug
        images {
          id
          imageUrl
          altText
        }
        basePrice
      }
      categories {
        id
        nameAr
        nameEn
        slug
        icon
      }
      designs {
        id
        name
        description
        image
        category {
          id
          nameAr
          nameEn
        }
      }
      users {
        id
        username
        firstName
        lastName
        profile {
          avatar
        }
      }
    }
  }
`;

console.log('📋 Enhanced GraphQL Queries loaded');
