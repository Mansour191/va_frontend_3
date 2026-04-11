// Enhanced GraphQL Mutations - Complete mutation definitions for all operations
import { gql } from '@apollo/client';

// Authentication Mutations
export const LOGIN = gql`
  mutation Login($emailOrUsername: String!, $password: String!) {
    login(emailOrUsername: $emailOrUsername, password: $password) {
      success
      message
      user {
        id
        username
        email
        firstName
        lastName
        isStaff
        isActive
        profile {
          id
          phone
          address
          avatar
        }
      }
      tokens
    }
  }
`;

export const REGISTER = gql`
  mutation Register($username: String!, $email: String!, $password: String!, $passwordConfirm: String!, $firstName: String!, $lastName: String, $phone: String) {
    register(username: $username, email: $email, password: $password, passwordConfirm: $passwordConfirm, firstName: $firstName, lastName: $lastName, phone: $phone) {
      success
      message
      user {
        id
        username
        email
        firstName
        lastName
        isStaff
        isActive
        profile {
          id
          phone
          address
          avatar
        }
      }
      tokens
    }
  }
`;

export const UPDATE_PROFILE = gql`
  mutation UpdateProfile($firstName: String, $lastName: String, $email: String, $phone: String, $address: String) {
    updateProfile(firstName: $firstName, lastName: $lastName, email: $email, phone: $phone, address: $address) {
      success
      message
      user {
        id
        username
        email
        firstName
        lastName
        isStaff
        isActive
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
  }
`;

export const UPDATE_PASSWORD = gql`
  mutation UpdatePassword($currentPassword: String!, $newPassword: String!, $confirmPassword: String!) {
    updatePassword(currentPassword: $currentPassword, newPassword: $newPassword, confirmPassword: $confirmPassword) {
      success
      message
    }
  }
`;

export const DELETE_ACCOUNT = gql`
  mutation DeleteAccount($password: String!) {
    deleteAccount(password: $password) {
      success
      message
    }
  }
`;

// Category Mutations
export const CREATE_CATEGORY = gql`
  mutation CreateCategory($input: CategoryInput!) {
    createCategory(input: $input) {
      success
      message
      category {
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
        createdAt
      }
    }
  }
`;

export const UPDATE_CATEGORY = gql`
  mutation UpdateCategory($id: ID!, $input: CategoryInput!) {
    updateCategory(id: $id, input: $input) {
      success
      message
      category {
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
        updatedAt
      }
    }
  }
`;

export const DELETE_CATEGORY = gql`
  mutation DeleteCategory($id: ID!) {
    deleteCategory(id: $id) {
      success
      message
    }
  }
`;

// Product Mutations
export const CREATE_PRODUCT = gql`
  mutation CreateProduct($input: ProductInput!) {
    createProduct(input: $input) {
      success
      message
      product {
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
      }
    }
  }
`;

export const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($slug: String!, $input: ProductInput!) {
    updateProduct(slug: $slug, input: $input) {
      success
      message
      product {
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
        onSale
        discountPercent
        isFeatured
        isNew
        isActive
        stock
        weight
        dimensions
        tags
        updatedAt
      }
    }
  }
`;

export const DELETE_PRODUCT = gql`
  mutation DeleteProduct($slug: String!) {
    deleteProduct(slug: $slug) {
      success
      message
    }
  }
`;

// Order Mutations
export const CREATE_ORDER = gql`
  mutation CreateOrder($input: OrderInput!) {
    createOrder(input: $input) {
      success
      message
      order {
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
        createdAt
      }
    }
  }
`;

export const UPDATE_ORDER_STATUS = gql`
  mutation UpdateOrderStatus($orderId: ID!, $status: String!) {
    updateOrderStatus(orderId: $orderId, status: $status) {
      success
      message
      order {
        id
        orderNumber
        status
        updatedAt
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
      }
    }
  }
`;

export const CANCEL_ORDER = gql`
  mutation CancelOrder($orderId: ID!, $reason: String) {
    cancelOrder(orderId: $orderId, reason: $reason) {
      success
      message
      order {
        id
        orderNumber
        status
        updatedAt
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
      }
    }
  }
`;

export const ADD_ORDER_ITEM = gql`
  mutation AddOrderItem($orderId: ID!, $input: OrderItemInput!) {
    addOrderItem(orderId: $orderId, input: $input) {
      success
      message
      orderItem {
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
  }
`;

export const UPDATE_ORDER_ITEM = gql`
  mutation UpdateOrderItem($orderItemId: ID!, $input: OrderItemInput!) {
    updateOrderItem(orderItemId: $orderItemId, input: $input) {
      success
      message
      orderItem {
        id
        product {
          id
          nameAr
          nameEn
          slug
        }
        material {
          id
          nameAr
          nameEn
        }
        width
        height
        dimensionUnit
        marbleTexture
        customDesign
        quantity
        price
        updatedAt
      }
    }
  }
`;

export const REMOVE_ORDER_ITEM = gql`
  mutation RemoveOrderItem($orderItemId: ID!) {
    removeOrderItem(orderItemId: $orderItemId) {
      success
      message
    }
  }
`;

// Payment Mutations
export const CREATE_PAYMENT = gql`
  mutation CreatePayment($input: PaymentInput!) {
    createPayment(input: $input) {
      success
      message
      payment {
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
        }
        amount
        method
        status
        transactionId
        gatewayResponse
        createdAt
      }
    }
  }
`;

export const UPDATE_PAYMENT = gql`
  mutation UpdatePayment($paymentId: ID!, $input: PaymentInput!) {
    updatePayment(paymentId: $paymentId, input: $input) {
      success
      message
      payment {
        id
        amount
        method
        status
        transactionId
        gatewayResponse
        updatedAt
      }
    }
  }
`;

export const PROCESS_PAYMENT = gql`
  mutation ProcessPayment($paymentId: ID!, $method: String!) {
    processPayment(paymentId: $paymentId, method: $method) {
      success
      message
      payment {
        id
        status
        gatewayResponse
        updatedAt
      }
    }
  }
`;

export const REFUND_PAYMENT = gql`
  mutation RefundPayment($paymentId: ID!, $amount: Float!, $reason: String) {
    refundPayment(paymentId: $paymentId, amount: $amount, reason: $reason) {
      success
      message
      payment {
        id
        status
        gatewayResponse
        updatedAt
      }
    }
  }
`;

// Cart Mutations
export const ADD_TO_CART = gql`
  mutation AddToCart($input: CartItemInput!) {
    addToCart(input: $input) {
      success
      message
      cartItem {
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
      }
    }
  }
`;

export const REMOVE_FROM_CART = gql`
  mutation RemoveFromCart($cartItemId: ID!) {
    removeFromCart(cartItemId: $cartItemId) {
      success
      message
    }
  }
`;

export const UPDATE_CART_ITEM_QUANTITY = gql`
  mutation UpdateCartItemQuantity($cartItemId: ID!, $quantity: Int!) {
    updateCartItemQuantity(cartItemId: $cartItemId, quantity: $quantity) {
      success
      message
      cartItem {
        id
        quantity
        updatedAt
      }
    }
  }
`;

export const CLEAR_CART = gql`
  mutation ClearCart {
    clearCart {
      success
      message
    }
  }
`;

// Wishlist Mutations
export const ADD_TO_WISHLIST = gql`
  mutation AddToWishlist($productId: ID!) {
    addToWishlist(productId: $productId) {
      success
      message
      wishlistItem {
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
  }
`;

export const REMOVE_FROM_WISHLIST = gql`
  mutation RemoveFromWishlist($wishlistItemId: ID!) {
    removeFromWishlist(wishlistItemId: $wishlistItemId) {
      success
      message
    }
  }
`;

// Review Mutations
export const CREATE_REVIEW = gql`
  mutation CreateReview($input: ReviewInput!) {
    createReview(input: $input) {
      success
      message
      review {
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
      }
    }
  }
`;

export const UPDATE_REVIEW = gql`
  mutation UpdateReview($reviewId: ID!, $input: ReviewInput!) {
    updateReview(reviewId: $reviewId, input: $input) {
      success
      message
      review {
        id
        rating
        comment
        updatedAt
      }
    }
  }
`;

export const DELETE_REVIEW = gql`
  mutation DeleteReview($reviewId: ID!) {
    deleteReview(reviewId: $reviewId) {
      success
      message
    }
  }
`;

export const MARK_REVIEW_HELPFUL = gql`
  mutation MarkReviewHelpful($reviewId: ID!) {
    markReviewHelpful(reviewId: $reviewId) {
      success
      message
      review {
        id
        helpfulCount
      }
    }
  }
`;

// Design Mutations
export const CREATE_DESIGN = gql`
  mutation CreateDesign($input: DesignInput!) {
    createDesign(input: $input) {
      success
      message
      design {
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
      }
    }
  }
`;

export const UPDATE_DESIGN = gql`
  mutation UpdateDesign($designId: ID!, $input: DesignInput!) {
    updateDesign(designId: $designId, input: $input) {
      success
      message
      design {
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
        tags
        updatedAt
      }
    }
  }
`;

export const DELETE_DESIGN = gql`
  mutation DeleteDesign($designId: ID!) {
    deleteDesign(designId: $designId) {
      success
      message
    }
  }
`;

export const GENERATE_DESIGN = gql`
  mutation GenerateDesign($prompt: String!, $categoryId: ID!, $options: GenerateDesignOptions) {
    generateDesign(prompt: $prompt, categoryId: $categoryId, options: $options) {
      success
      message
      design {
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
        status
        generatedAt
      }
    }
  }
`;

export const LIKE_DESIGN = gql`
  mutation LikeDesign($designId: ID!) {
    likeDesign(designId: $designId) {
      success
      message
      design {
        id
        likes
      }
    }
  }
`;

export const DOWNLOAD_DESIGN = gql`
  mutation DownloadDesign($designId: ID!) {
    downloadDesign(designId: $designId) {
      success
      message
      design {
        id
        downloads
      }
      downloadUrl
    }
  }
`;

// Coupon Mutations
export const APPLY_COUPON = gql`
  mutation ApplyCoupon($orderId: ID!, $couponCode: String!) {
    applyCoupon(orderId: $orderId, couponCode: $couponCode) {
      success
      message
      order {
        id
        totalAmount
        subtotal
        discount
        coupon {
          id
          code
          discountType
          discountValue
        }
      }
    }
  }
`;

export const REMOVE_COUPON = gql`
  mutation RemoveCoupon($orderId: ID!) {
    removeCoupon(orderId: $orderId) {
      success
      message
      order {
        id
        totalAmount
        subtotal
        discount
      }
    }
  }
`;

// Notification Mutations
export const CREATE_NOTIFICATION = gql`
  mutation CreateNotification($input: NotificationInput!) {
    createNotification(input: $input) {
      success
      message
      notification {
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
  }
`;

export const MARK_NOTIFICATION_READ = gql`
  mutation MarkNotificationRead($notificationId: ID!) {
    markNotificationRead(notificationId: $notificationId) {
      success
      message
      notification {
        id
        isRead
      }
    }
  }
`;

export const MARK_ALL_NOTIFICATIONS_READ = gql`
  mutation MarkAllNotificationsRead {
    markAllNotificationsRead {
      success
      message
    }
  }
`;

export const DELETE_NOTIFICATION = gql`
  mutation DeleteNotification($notificationId: ID!) {
    deleteNotification(notificationId: $notificationId) {
      success
      message
    }
  }
`;

// Alert Mutations
export const CREATE_ALERT = gql`
  mutation CreateAlert($input: AlertInput!) {
    createAlert(input: $input) {
      success
      message
      alert {
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
  }
`;

export const UPDATE_ALERT = gql`
  mutation UpdateAlert($alertId: ID!, $input: AlertInput!) {
    updateAlert(alertId: $alertId, input: $input) {
      success
      message
      alert {
        id
        type
        message
        isActive
        conditions
        updatedAt
      }
    }
  }
`;

export const DELETE_ALERT = gql`
  mutation DeleteAlert($alertId: ID!) {
    deleteAlert(alertId: $alertId) {
      success
      message
    }
  }
`;

// AI Service Mutations
export const CHAT_WITH_AI = gql`
  mutation ChatWithAI($message: String!, $context: JSON) {
    chatWithAi(message: $message, context: $context) {
      response
      success
      metadata
    }
  }
`;

export const ANALYZE_IMAGE = gql`
  mutation AnalyzeImage($imageData: String!, $analysisType: String) {
    analyzeImage(imageData: $imageData, analysisType: $analysisType) {
      success
      analysis
      confidence
      metadata
    }
  }
`;

// User Management Mutations (Admin)
export const UPDATE_USER = gql`
  mutation UpdateUser($userId: ID!, $input: UserInput!) {
    updateUser(userId: $userId, input: $input) {
      success
      message
      user {
        id
        username
        email
        firstName
        lastName
        isStaff
        isActive
        profile {
          phone
          address
          bio
          avatar
          preferences
          settings
        }
        updatedAt
      }
    }
  }
`;

export const DELETE_USER = gql`
  mutation DeleteUser($userId: ID!) {
    deleteUser(userId: $userId) {
      success
      message
    }
  }
`;

export const UPDATE_USER_PREFERENCES = gql`
  mutation UpdateUserPreferences($input: UserPreferencesInput!) {
    updateUserPreferences(input: $input) {
      success
      message
    }
  }
`;

export const UPDATE_USER_SETTINGS = gql`
  mutation UpdateUserSettings($input: UserSettingsInput!) {
    updateUserSettings(input: $input) {
      success
      message
    }
  }
`;

// Session Management Mutations
export const REVOKE_SESSION = gql`
  mutation RevokeSession($sessionId: ID!) {
    revokeSession(sessionId: $sessionId) {
      success
      message
    }
  }
`;

export const REVOKE_ALL_SESSIONS = gql`
  mutation RevokeAllSessions($userId: ID!) {
    revokeAllSessions(userId: $userId) {
      success
      message
    }
  }
`;

// Bulk Operations Mutations
export const BULK_UPDATE_PRODUCTS = gql`
  mutation BulkUpdateProducts($updates: [BulkProductUpdateInput!]!) {
    bulkUpdateProducts(updates: $updates) {
      success
      message
      results {
        id
        success
        message
      }
    }
  }
`;

export const BULK_DELETE_PRODUCTS = gql`
  mutation BulkDeleteProducts($slugs: [String!]!) {
    bulkDeleteProducts(slugs: $slugs) {
      success
      message
      results {
        slug
        success
        message
      }
    }
  }
`;

export const BULK_UPDATE_ORDER_STATUS = gql`
  mutation BulkUpdateOrderStatus($updates: [BulkOrderStatusUpdateInput!]!) {
    bulkUpdateOrderStatus(updates: $updates) {
      success
      message
      results {
        orderId
        success
        message
      }
    }
  }
`;

export const BULK_CANCEL_ORDERS = gql`
  mutation BulkCancelOrders($cancellations: [BulkOrderCancellationInput!]!) {
    bulkCancelOrders(cancellations: $cancellations) {
      success
      message
      results {
        orderId
        success
        message
      }
    }
  }
`;

// Analytics Mutations
export const TRACK_EVENT = gql`
  mutation TrackEvent($input: EventTrackingInput!) {
    trackEvent(input: $input) {
      success
      message
    }
  }
`;

export const UPDATE_ANALYTICS = gql`
  mutation UpdateAnalytics($input: AnalyticsInput!) {
    updateAnalytics(input: $input) {
      success
      message
    }
  }
`;

// System Mutations
export const CLEAR_CACHE = gql`
  mutation ClearCache($pattern: String) {
    clearCache(pattern: $pattern) {
      success
      message
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

console.log('🔄 Enhanced GraphQL Mutations loaded');
