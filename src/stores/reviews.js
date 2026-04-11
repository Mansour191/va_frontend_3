/**
 * Reviews Store (Pinia)
 * This store manages all review state and operations
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apolloClient } from '@/shared/services/graphql/apolloClient'
import { useToast } from 'vuetify'

// GraphQL Queries and Mutations
const GET_PRODUCT_REVIEWS = `
  query GetProductReviews($productId: ID!, $verifiedOnly: Boolean) {
    productReviews(productId: $productId, verifiedOnly: $verifiedOnly) {
      id
      rating
      comment
      isVerified
      helpfulCount
      createdAt
      updatedAt
      user {
        id
        firstName
        lastName
        username
      }
      product {
        id
        nameAr
        nameEn
        slug
      }
    }
  }
`

const GET_USER_REVIEWS = `
  query GetUserReviews($userId: ID) {
    userReviews(userId: $userId) {
      id
      rating
      comment
      isVerified
      helpfulCount
      createdAt
      updatedAt
      user {
        id
        firstName
        lastName
        username
      }
      product {
        id
        nameAr
        nameEn
        slug
      }
    }
  }
`

const SUBMIT_REVIEW = `
  mutation SubmitReview($productId: ID!, $rating: Int!, $comment: String) {
    submitReview(productId: $productId, rating: $rating, comment: $comment) {
      success
      message
      review {
        id
        rating
        comment
        isVerified
        helpfulCount
        createdAt
        updatedAt
        user {
          id
          firstName
          lastName
          username
        }
        product {
          id
          nameAr
          nameEn
          slug
        }
      }
    }
  }
`

const UPDATE_REVIEW = `
  mutation UpdateReview($reviewId: ID!, $rating: Int, $comment: String) {
    updateReview(reviewId: $reviewId, rating: $rating, comment: $comment) {
      success
      message
      review {
        id
        rating
        comment
        isVerified
        helpfulCount
        createdAt
        updatedAt
        user {
          id
          firstName
          lastName
          username
        }
        product {
          id
          nameAr
          nameEn
          slug
        }
      }
    }
  }
`

const DELETE_REVIEW = `
  mutation DeleteReview($reviewId: ID!) {
    deleteReview(reviewId: $reviewId) {
      success
      message
    }
  }
`

const HELPFUL_REVIEW = `
  mutation HelpfulReview($reviewId: ID!) {
    helpfulReview(reviewId: $reviewId) {
      success
      message
      review {
        id
        helpfulCount
      }
    }
  }
`

const REPORT_REVIEW = `
  mutation ReportReview($reviewId: ID!, $reason: String!) {
    reportReview(reviewId: $reviewId, reason: $reason) {
      success
      message
      report {
        id
        reason
        createdAt
      }
    }
  }
`

export const useReviewsStore = defineStore('reviews', () => {
  // State
  const reviews = ref([])
  const userReviews = ref([])
  const userReview = ref(null)
  const isLoading = ref(false)
  const isSubmitting = ref(false)
  const lastFetched = ref(null)
  const error = ref(null)
  
  // Toast system
  const toast = useToast()

  // Computed properties
  const totalReviews = computed(() => reviews.value.length)
  
  const averageRating = computed(() => {
    if (reviews.value.length === 0) return 0
    const sum = reviews.value.reduce((acc, review) => acc + review.rating, 0)
    return sum / reviews.value.length
  })

  const ratingDistribution = computed(() => {
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    reviews.value.forEach(review => {
      if (distribution[review.rating] !== undefined) {
        distribution[review.rating]++
      }
    })
    return distribution
  })

  const verifiedReviews = computed(() => 
    reviews.value.filter(review => review.isVerified)
  )

  const reviewsByRating = computed(() => {
    const byRating = { 1: [], 2: [], 3: [], 4: [], 5: [] }
    reviews.value.forEach(review => {
      if (byRating[review.rating]) {
        byRating[review.rating].push(review)
      }
    })
    return byRating
  })

  // Actions
  const setLoading = (loading) => {
    isLoading.value = loading
  }

  const setSubmitting = (submitting) => {
    isSubmitting.value = submitting
  }

  const setError = (errorMessage) => {
    error.value = errorMessage
    if (errorMessage) {
      toast.error(errorMessage)
    }
  }

  const clearError = () => {
    error.value = null
  }

  const fetchProductReviews = async (productId, verifiedOnly = false) => {
    setLoading(true)
    clearError()
    
    try {
      const { data } = await apolloClient.query({
        query: GET_PRODUCT_REVIEWS,
        variables: {
          productId: productId.toString(),
          verifiedOnly
        },
        fetchPolicy: 'network-only'
      })

      if (data?.productReviews) {
        reviews.value = data.productReviews
        lastFetched.value = new Date().toISOString()
        
        // Check if current user has a review for this product
        const currentUserId = localStorage.getItem('userId')
        if (currentUserId) {
          userReview.value = reviews.value.find(review => 
            review.user?.id === parseInt(currentUserId)
          ) || null
        }
      }
    } catch (err) {
      console.error('Error fetching product reviews:', err)
      setError('Failed to load reviews')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const fetchUserReviews = async (userId = null) => {
    setLoading(true)
    clearError()
    
    try {
      const { data } = await apolloClient.query({
        query: GET_USER_REVIEWS,
        variables: {
          userId: userId?.toString()
        },
        fetchPolicy: 'network-only'
      })

      if (data?.userReviews) {
        userReviews.value = data.userReviews
      }
    } catch (err) {
      console.error('Error fetching user reviews:', err)
      setError('Failed to load your reviews')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const fetchUserReview = async (productId) => {
    try {
      await fetchProductReviews(productId)
      // The user review is set in fetchProductReviews
    } catch (err) {
      console.error('Error fetching user review:', err)
      throw err
    }
  }

  const submitReview = async ({ productId, rating, comment }) => {
    setSubmitting(true)
    clearError()
    
    try {
      const { data } = await apolloClient.mutate({
        mutation: SUBMIT_REVIEW,
        variables: {
          productId: productId.toString(),
          rating,
          comment: comment || null
        }
      })

      if (data?.submitReview?.success) {
        const newReview = data.submitReview.review
        
        // Add to reviews list
        reviews.value.unshift(newReview)
        
        // Set as user review
        userReview.value = newReview
        
        // Update last fetched time
        lastFetched.value = new Date().toISOString()
        
        return newReview
      } else {
        throw new Error(data?.submitReview?.message || 'Failed to submit review')
      }
    } catch (err) {
      console.error('Error submitting review:', err)
      setError(err.message || 'Failed to submit review')
      throw err
    } finally {
      setSubmitting(false)
    }
  }

  const updateReview = async ({ reviewId, rating, comment }) => {
    setSubmitting(true)
    clearError()
    
    try {
      const { data } = await apolloClient.mutate({
        mutation: UPDATE_REVIEW,
        variables: {
          reviewId: reviewId.toString(),
          rating,
          comment: comment || null
        }
      })

      if (data?.updateReview?.success) {
        const updatedReview = data.updateReview.review
        
        // Update in reviews list
        const index = reviews.value.findIndex(r => r.id === updatedReview.id)
        if (index !== -1) {
          reviews.value[index] = updatedReview
        }
        
        // Update user review if it matches
        if (userReview.value?.id === updatedReview.id) {
          userReview.value = updatedReview
        }
        
        // Update in user reviews list
        const userIndex = userReviews.value.findIndex(r => r.id === updatedReview.id)
        if (userIndex !== -1) {
          userReviews.value[userIndex] = updatedReview
        }
        
        return updatedReview
      } else {
        throw new Error(data?.updateReview?.message || 'Failed to update review')
      }
    } catch (err) {
      console.error('Error updating review:', err)
      setError(err.message || 'Failed to update review')
      throw err
    } finally {
      setSubmitting(false)
    }
  }

  const deleteReview = async (reviewId) => {
    setSubmitting(true)
    clearError()
    
    try {
      const { data } = await apolloClient.mutate({
        mutation: DELETE_REVIEW,
        variables: {
          reviewId: reviewId.toString()
        }
      })

      if (data?.deleteReview?.success) {
        // Remove from reviews list
        reviews.value = reviews.value.filter(r => r.id !== reviewId)
        
        // Clear user review if it matches
        if (userReview.value?.id === reviewId) {
          userReview.value = null
        }
        
        // Remove from user reviews list
        userReviews.value = userReviews.value.filter(r => r.id !== reviewId)
        
        return true
      } else {
        throw new Error(data?.deleteReview?.message || 'Failed to delete review')
      }
    } catch (err) {
      console.error('Error deleting review:', err)
      setError(err.message || 'Failed to delete review')
      throw err
    } finally {
      setSubmitting(false)
    }
  }

  const markReviewHelpful = async (reviewId) => {
    clearError()
    
    try {
      const { data } = await apolloClient.mutate({
        mutation: HELPFUL_REVIEW,
        variables: {
          reviewId: reviewId.toString()
        }
      })

      if (data?.helpfulReview?.success) {
        const updatedReview = data.helpfulReview.review
        
        // Update helpful count in reviews list
        const index = reviews.value.findIndex(r => r.id === reviewId)
        if (index !== -1) {
          reviews.value[index].helpfulCount = updatedReview.helpfulCount
        }
        
        // Update in user reviews list if present
        const userIndex = userReviews.value.findIndex(r => r.id === reviewId)
        if (userIndex !== -1) {
          userReviews.value[userIndex].helpfulCount = updatedReview.helpfulCount
        }
        
        return updatedReview
      } else {
        throw new Error(data?.helpfulReview?.message || 'Failed to mark review as helpful')
      }
    } catch (err) {
      console.error('Error marking review as helpful:', err)
      setError(err.message || 'Failed to mark review as helpful')
      throw err
    }
  }

  const reportReview = async ({ reviewId, reason }) => {
    clearError()
    
    try {
      const { data } = await apolloClient.mutate({
        mutation: REPORT_REVIEW,
        variables: {
          reviewId: reviewId.toString(),
          reason
        }
      })

      if (data?.reportReview?.success) {
        return data.reportReview.report
      } else {
        throw new Error(data?.reportReview?.message || 'Failed to report review')
      }
    } catch (err) {
      console.error('Error reporting review:', err)
      setError(err.message || 'Failed to report review')
      throw err
    }
  }

  const clearReviews = () => {
    reviews.value = []
    userReviews.value = []
    userReview.value = null
    lastFetched.value = null
    clearError()
  }

  const refreshReviews = async (productId) => {
    if (productId) {
      await fetchProductReviews(productId)
    }
  }

  // Utility methods
  const getReviewById = (reviewId) => {
    return reviews.value.find(r => r.id === reviewId)
  }

  const getUserReviewForProduct = (productId) => {
    return reviews.value.find(r => 
      r.product?.id === parseInt(productId) && 
      r.user?.id === parseInt(localStorage.getItem('userId'))
    )
  }

  const getReviewsByRating = (rating) => {
    return reviews.value.filter(r => r.rating === rating)
  }

  const getVerifiedReviews = () => {
    return reviews.value.filter(r => r.isVerified)
  }

  return {
    // State
    reviews,
    userReviews,
    userReview,
    isLoading,
    isSubmitting,
    lastFetched,
    error,
    
    // Computed
    totalReviews,
    averageRating,
    ratingDistribution,
    verifiedReviews,
    reviewsByRating,
    
    // Actions
    fetchProductReviews,
    fetchUserReviews,
    fetchUserReview,
    submitReview,
    updateReview,
    deleteReview,
    markReviewHelpful,
    reportReview,
    clearReviews,
    refreshReviews,
    
    // Utility methods
    getReviewById,
    getUserReviewForProduct,
    getReviewsByRating,
    getVerifiedReviews
  }
})
