import { gql } from '@apollo/client';

// Location Queries
export const GET_LOCATION_INFO = gql`
  query GetLocationInfo {
    locationInfo {
      latitude
      longitude
      city
      country
      address
      postalCode
      region
    }
  }
`;

export const GET_NEARBY_BRANCHES = gql`
  query GetNearbyBranches($latitude: Float!, $longitude: Float!, $radius: Int = 50) {
    nearbyBranches(latitude: $latitude, longitude: $longitude, radius: $radius) {
      id
      name
      latitude
      longitude
      address
      phone
      email
      distance
      openingHours
      services
    }
  }
`;

// Blog Queries
export const GET_LATEST_BLOG_POSTS = gql`
  query GetLatestBlogPosts($limit: Int = 4) {
    latestBlogPosts(limit: $limit) {
      id
      title
      slug
      excerpt
      content
      featuredImage
      author {
        id
        username
        firstName
        lastName
      }
      category {
        id
        name
        slug
      }
      tags
      publishedAt
      createdAt
      updatedAt
    }
  }
`;

export const GET_BLOG_POSTS = gql`
  query GetBlogPosts($limit: Int = 10, $offset: Int = 0, $category: String) {
    blogPosts(limit: $limit, offset: $offset, category: $category) {
      id
      title
      slug
      excerpt
      content
      featuredImage
      author {
        id
        username
        firstName
        lastName
      }
      category {
        id
        name
        slug
      }
      tags
      publishedAt
      createdAt
      updatedAt
    }
  }
`;

export const GET_BLOG_POST = gql`
  query GetBlogPost($slug: String!) {
    blogPost(slug: $slug) {
      id
      title
      slug
      content
      featuredImage
      author {
        id
        username
        firstName
        lastName
        email
        bio
      }
      category {
        id
        name
        slug
      }
      tags
      publishedAt
      createdAt
      updatedAt
      seoTitle
      seoDescription
      readingTime
    }
  }
`;
