import { gql } from '@apollo/client/core';

// Get wishlist settings
export const GET_WISHLIST_SETTINGS = gql`
  query GetWishlistSettings {
    wishlistSettings {
      id
      itemsPerPage
      sortBy
      sortOrder
      emailNotifications
      pushNotifications
      autoRemoveOutOfStock
      autoRemoveDiscontinued
      makePublic
      privacyLevel
      shareToken
      maxItemsAllowed
      notifyOnPriceDrop
      alertOnLowStock
      createdAt
      updatedAt
    }
  }
`;

// Update wishlist settings
export const UPDATE_WISHLIST_SETTINGS = gql`
  mutation UpdateWishlistSettings($input: WishlistSettingsInput!) {
    updateWishlistSettings(input: $input) {
      success
      message
      settings {
        id
        itemsPerPage
        sortBy
        sortOrder
        emailNotifications
        pushNotifications
        autoRemoveOutOfStock
        autoRemoveDiscontinued
        makePublic
        privacyLevel
        shareToken
        maxItemsAllowed
        notifyOnPriceDrop
        alertOnLowStock
        createdAt
        updatedAt
      }
    }
  }
`;

// Generate or reset share token
export const GENERATE_SHARE_TOKEN = gql`
  mutation GenerateShareToken {
    generateShareToken {
      success
      message
      shareToken
      shareUrl
      settings {
        id
        shareToken
        privacyLevel
        makePublic
      }
    }
  }
`;

// Get public wishlist by token
export const GET_PUBLIC_WISHLIST = gql`
  query GetPublicWishlist($token: String!) {
    publicWishlist(token: $token) {
      id
      user {
        id
        username
        email
      }
      items {
        id
        product {
          id
          nameAr
          nameEn
          slug
          basePrice
          stock
          isActive
          onSale
          discountPercent
          images {
            id
            imageUrl
            isMain
          }
        }
        createdAt
      }
      settings {
        privacyLevel
        maxItemsAllowed
      }
    }
  }
`;

// Get wishlist items
export const GET_WISHLIST_ITEMS = gql`
  query GetMyWishlist {
    myWishlist {
      id
      product {
        id
        nameAr
        nameEn
        slug
        basePrice
        stock
        isActive
        onSale
        discountPercent
        images {
          id
          imageUrl
          isMain
        }
      }
      createdAt
    }
  }
`;

// Toggle wishlist item
export const TOGGLE_WISHLIST_ITEM = gql`
  mutation ToggleWishlist($input: WishlistItemInput!) {
    toggleWishlist(input: $input) {
      success
      message
      isInWishlist
      wishlistItem {
        id
        product {
          id
          nameAr
          nameEn
        }
        createdAt
      }
      wishlistCount
    }
  }
`;

// Clear wishlist
export const CLEAR_WISHLIST = gql`
  mutation ClearWishlist {
    clearWishlist {
      success
      message
      clearedCount
    }
  }
`;

// Move to cart
export const MOVE_TO_CART = gql`
  mutation MoveToCart($wishlistItemId: ID!, $quantity: Int) {
    moveToCart(wishlistItemId: $wishlistItemId, quantity: $quantity) {
      success
      message
      cartItem {
        id
        quantity
        product {
          id
          nameAr
          nameEn
        }
      }
      removedFromWishlist
    }
  }
`;
