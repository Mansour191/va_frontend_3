import { gql } from '@apollo/client/core';

// Blog Category Queries
export const GET_BLOG_CATEGORIES = gql`
  query GetBlogCategories {
    blogCategories {
      id
      nameAr
      nameEn
      slug
      description
      descriptionAr
      iconClass
      orderPriority
      isFeatured
      isActive
      metaTitle
      createdAt
      updatedAt
    }
  }
`;

export const GET_BLOG_CATEGORY = gql`
  query GetBlogCategory($id: ID!) {
    blogCategory(id: $id) {
      id
      nameAr
      nameEn
      slug
      description
      descriptionAr
      iconClass
      orderPriority
      isFeatured
      isActive
      metaTitle
      createdAt
      updatedAt
    }
  }
`;

export const GET_FEATURED_BLOG_CATEGORIES = gql`
  query GetFeaturedBlogCategories {
    blogCategories(isFeatured: true, isActive: true) {
      id
      nameAr
      nameEn
      slug
      description
      descriptionAr
      iconClass
      orderPriority
      isFeatured
      isActive
      metaTitle
      createdAt
      updatedAt
    }
  }
`;

// Blog Category Mutations
export const CREATE_BLOG_CATEGORY = gql`
  mutation CreateBlogCategory($input: BlogCategoryInput!) {
    createBlogCategory(input: $input) {
      success
      message
      blogCategory {
        id
        nameAr
        nameEn
        slug
        description
        descriptionAr
        iconClass
        orderPriority
        isFeatured
        isActive
        metaTitle
        createdAt
        updatedAt
      }
      errors
    }
  }
`;

export const UPDATE_BLOG_CATEGORY = gql`
  mutation UpdateBlogCategory($id: ID!, $input: BlogCategoryInput!) {
    updateBlogCategory(id: $id, input: $input) {
      success
      message
      blogCategory {
        id
        nameAr
        nameEn
        slug
        description
        descriptionAr
        iconClass
        orderPriority
        isFeatured
        isActive
        metaTitle
        createdAt
        updatedAt
      }
      errors
    }
  }
`;

export const DELETE_BLOG_CATEGORY = gql`
  mutation DeleteBlogCategory($id: ID!) {
    deleteBlogCategory(id: $id) {
      success
      message
      errors
    }
  }
`;

export const UPDATE_CATEGORY_ORDER = gql`
  mutation UpdateCategoryOrder($categories: [CategoryOrderInput!]!) {
    updateCategoryOrder(categories: $categories) {
      success
      message
      errors
    }
  }
`;

// Blog Post Queries (Enhanced)
export const GET_BLOG_POSTS = gql`
  query GetBlogPosts($limit: Int, $offset: Int, $category: ID, $status: String) {
    blogPosts(limit: $limit, offset: $offset, category: $category, status: $status) {
      id
      titleAr
      titleEn
      slug
      excerpt
      summaryAr
      summaryEn
      contentAr
      contentEn
      category {
        id
        nameAr
        nameEn
        slug
        iconClass
      }
      author {
        id
        username
        email
        firstName
        lastName
      }
      featuredImage
      featuredImageUrl
      tags
      views
      viewCount
      readTimeMinutes
      isPublished
      status
      scheduledAt
      publishedAt
      createdAt
      updatedAt
    }
  }
`;

export const GET_BLOG_POST = gql`
  query GetBlogPost($id: ID!) {
    blogPost(id: $id) {
      id
      titleAr
      titleEn
      slug
      excerpt
      summaryAr
      summaryEn
      contentAr
      contentEn
      category {
        id
        nameAr
        nameEn
        slug
        iconClass
      }
      author {
        id
        username
        email
        firstName
        lastName
      }
      featuredImage
      featuredImageUrl
      tags
      views
      viewCount
      readTimeMinutes
      isPublished
      status
      scheduledAt
      publishedAt
      createdAt
      updatedAt
    }
  }
`;

export const GET_FEATURED_BLOG_POSTS = gql`
  query GetFeaturedBlogPosts($limit: Int) {
    featuredBlogPosts(limit: $limit) {
      id
      titleAr
      titleEn
      slug
      excerpt
      summaryAr
      summaryEn
      featuredImage
      featuredImageUrl
      category {
        id
        nameAr
        nameEn
        slug
        iconClass
      }
      author {
        id
        username
        firstName
        lastName
      }
      views
      viewCount
      readTimeMinutes
      publishedAt
      createdAt
    }
  }
`;

// Blog Post Mutations (Enhanced)
export const CREATE_BLOG_POST = gql`
  mutation CreateBlogPost($input: BlogPostInput!) {
    createBlogPost(input: $input) {
      success
      message
      blogPost {
        id
        titleAr
        titleEn
        slug
        excerpt
        summaryAr
        summaryEn
        contentAr
        contentEn
        category {
          id
          nameAr
          nameEn
          slug
          iconClass
        }
        author {
          id
          username
          firstName
          lastName
        }
        featuredImage
        featuredImageUrl
        tags
        views
        viewCount
        readTimeMinutes
        isPublished
        status
        scheduledAt
        publishedAt
        createdAt
        updatedAt
      }
      errors
    }
  }
`;

export const UPDATE_BLOG_POST = gql`
  mutation UpdateBlogPost($id: ID!, $input: BlogPostInput!) {
    updateBlogPost(id: $id, input: $input) {
      success
      message
      blogPost {
        id
        titleAr
        titleEn
        slug
        excerpt
        summaryAr
        summaryEn
        contentAr
        contentEn
        category {
          id
          nameAr
          nameEn
          slug
          iconClass
        }
        author {
          id
          username
          firstName
          lastName
        }
        featuredImage
        featuredImageUrl
        tags
        views
        viewCount
        readTimeMinutes
        isPublished
        status
        scheduledAt
        publishedAt
        createdAt
        updatedAt
      }
      errors
    }
  }
`;

export const DELETE_BLOG_POST = gql`
  mutation DeleteBlogPost($id: ID!) {
    deleteBlogPost(id: $id) {
      success
      message
      errors
    }
  }
`;

export const INCREMENT_BLOG_POST_VIEW_COUNT = gql`
  mutation IncrementBlogPostViewCount($id: ID!) {
    incrementBlogPostViewCount(id: $id) {
      success
      message
      viewCount
    }
  }
`;

// Combined Queries for Dashboard
export const GET_BLOG_DASHBOARD = gql`
  query GetBlogDashboard {
    blogStats {
      totalPosts
      publishedPosts
      draftPosts
      scheduledPosts
      totalCategories
      activeCategories
      featuredCategories
      totalViews
    }
    recentPosts: blogPosts(limit: 5) {
      id
      titleAr
      titleEn
      slug
      status
      views
      createdAt
    }
    recentCategories: blogCategories(limit: 5) {
      id
      nameAr
      nameEn
      slug
      isFeatured
      isActive
      createdAt
    }
  }
`;

// Search and Filter Queries
export const SEARCH_BLOG_POSTS = gql`
  query SearchBlogPosts($query: String!, $limit: Int, $category: ID) {
    searchBlogPosts(query: $query, limit: $limit, category: $category) {
      id
      titleAr
      titleEn
      slug
      summaryAr
      summaryEn
      featuredImage
      category {
        id
        nameAr
        nameEn
        slug
        iconClass
      }
      author {
        id
        username
        firstName
        lastName
      }
      views
      publishedAt
      createdAt
    }
  }
`;

export const SEARCH_BLOG_CATEGORIES = gql`
  query SearchBlogCategories($query: String!) {
    searchBlogCategories(query: $query) {
      id
      nameAr
      nameEn
      slug
      description
      descriptionAr
      iconClass
      orderPriority
      isFeatured
      isActive
      metaTitle
      createdAt
      updatedAt
    }
  }
`;
