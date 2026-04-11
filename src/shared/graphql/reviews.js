/**
 * GraphQL Queries and Mutations for Reviews
 * Centralized GraphQL operations for the reviews system
 */

import { gql } from '@apollo/client/core'

// Queries
export const GET_PRODUCT_REVIEWS = gql`
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

export const GET_USER_REVIEWS = gql`
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

export const GET_REVIEW_BY_ID = gql`
  query GetReviewById($id: ID!) {
    review(id: $id) {
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

// Mutations
export const SUBMIT_REVIEW = gql`
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

export const UPDATE_REVIEW = gql`
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

export const DELETE_REVIEW = gql`
  mutation DeleteReview($reviewId: ID!) {
    deleteReview(reviewId: $reviewId) {
      success
      message
    }
  }
`

export const HELPFUL_REVIEW = gql`
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

export const REPORT_REVIEW = gql`
  mutation ReportReview($reviewId: ID!, $reason: String!) {
    reportReview(reviewId: $reviewId, reason: $reason) {
      success
      message
      report {
        id
        reason
        createdAt
        user {
          id
          firstName
          lastName
          username
        }
        review {
          id
          rating
          comment
        }
      }
    }
  }
`

export const VERIFY_REVIEW = gql`
  mutation VerifyReview($reviewId: ID!, $isVerified: Boolean!) {
    verifyReview(reviewId: $reviewId, isVerified: $isVerified) {
      success
      message
      review {
        id
        isVerified
        rating
        comment
        helpfulCount
        createdAt
        updatedAt
      }
    }
  }
`

// Subscription for real-time updates (optional)
export const REVIEW_ADDED_SUBSCRIPTION = gql`
  subscription ReviewAdded($productId: ID!) {
    reviewAdded(productId: $productId) {
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

export const REVIEW_UPDATED_SUBSCRIPTION = gql`
  subscription ReviewUpdated($productId: ID!) {
    reviewUpdated(productId: $productId) {
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

// Combined queries for better performance
export const GET_PRODUCT_WITH_REVIEWS = gql`
  query GetProductWithReviews($productId: ID!, $verifiedOnly: Boolean) {
    product(id: $productId) {
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
    }
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
    }
  }
`

// Admin queries for review management
export const GET_ALL_REVIEWS = gql`
  query GetAllReviews($first: Int, $after: String, $verified: Boolean) {
    allReviews(
      first: $first
      after: $after
      filter: { isVerified: $verified }
    ) {
      edges {
        node {
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
            email
          }
          product {
            id
            nameAr
            nameEn
            slug
          }
        }
        cursor
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      totalCount
    }
  }
`

export const GET_REVIEW_REPORTS = gql`
  query GetReviewReports($reviewId: ID) {
    allReviewReports(filter: { review: $reviewId }) {
      edges {
        node {
          id
          reason
          createdAt
          user {
            id
            firstName
            lastName
            username
          }
          review {
            id
            rating
            comment
            user {
              firstName
              lastName
            }
          }
        }
      }
    }
  }
`

// Fragments for reusable fields
export const REVIEW_FIELDS = gql`
  fragment ReviewFields on ReviewType {
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
`

export const USER_FIELDS = gql`
  fragment UserFields on UserType {
    id
    firstName
    lastName
    username
    email
  }
`

export const PRODUCT_FIELDS = gql`
  fragment ProductFields on ProductType {
    id
    nameAr
    nameEn
    slug
    basePrice
  }
`
