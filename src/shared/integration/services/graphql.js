import { gql } from '@apollo/client/core';
import apolloClient from '@/integration/services/apollo';

export const GET_CATEGORIES = gql`
  query GetCategories {
    categories {
      id
      nameAr
      nameEn
      slug
      icon
    }
  }
`;

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
      category {
        id
        slug
        nameEn
      }
    }
  }
`;

export const GET_PRODUCT_DETAIL = gql`
  query GetProductDetail($slug: String!) {
    productBySlug(slug: $slug) {
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
      category {
        id
        slug
        nameEn
      }
    }
  }
`;

export const UPSERT_PRODUCT = gql`
  mutation UpsertProduct(
    $id: ID
    $nameAr: String!
    $nameEn: String!
    $slug: String!
    $categoryId: ID!
    $descriptionAr: String
    $descriptionEn: String
    $basePrice: Float!
    $onSale: Boolean
    $discountPercent: Int
    $isNew: Boolean
  ) {
    upsertProduct(
      id: $id
      nameAr: $nameAr
      nameEn: $nameEn
      slug: $slug
      categoryId: $categoryId
      descriptionAr: $descriptionAr
      descriptionEn: $descriptionEn
      basePrice: $basePrice
      onSale: $onSale
      discountPercent: $discountPercent
      isNew: $isNew
    ) {
      product {
        id
        nameAr
        nameEn
        slug
        basePrice
      }
    }
  }
`;

export const DELETE_PRODUCT = gql`
  mutation DeleteProduct($id: ID!) {
    deleteProduct(id: $id) {
      ok
    }
  }
`;

export const CREATE_ORDER = gql`
  mutation CreateOrder(
    $customerName: String!
    $phone: String!
    $email: String!
    $address: String!
    $wilayaId: ID!
    $subtotal: Float!
    $shippingCost: Float!
    $total: Float!
    $paymentMethod: String!
    $items: [OrderItemInput]!
  ) {
    createOrder(
      customerName: $customerName
      phone: $phone
      email: $email
      address: $address
      wilayaId: $wilayaId
      subtotal: $subtotal
      shippingCost: $shippingCost
      total: $total
      paymentMethod: $paymentMethod
      items: $items
    ) {
      order {
        id
        orderNumber
      }
    }
  }
`;

export const LOGIN_MUTATION = gql`
  mutation TokenAuth($username: String!, $password: String!) {
    tokenAuth(username: $username, password: $password) {
      tokenAuth {
        token
        payload
        user {
          id
          username
          email
          firstName
          lastName
          isStaff
        }
      }
    }
  }
`;

export const REGISTER_MUTATION = gql`
  mutation Register($username: String!, $email: String!, $password: String!, $firstName: String!, $lastName: String!) {
    register(username: $username, email: $email, password: $password, firstName: $firstName, lastName: $lastName) {
      register {
        success
        errors {
          message
          field
        }
        user {
          id
          username
          email
          firstName
          lastName
        }
      }
    }
  }
`;

export const CHAT_MUTATION = gql`
  mutation ChatWithAI($message: String!) {
    chatWithAI(message: $message) {
      response
      success
      error
    }
  }
`;

export const SEMANTIC_SEARCH_QUERY = gql`
  query SemanticSearch($query: String!, $options: JSON) {
    semanticSearch(query: $query, options: $options) {
      products {
        id
        nameAr
        nameEn
        slug
        basePrice
        image
        category {
          id
          slug
          nameEn
        }
        relevanceScore
      }
      success
      error
    }
  }
`;

export const MEASURE_MUTATION = gql`
  mutation MeasureSurface($imageFile: Upload!, $referenceDimensionCm: Float!, $pricePerM2: Float) {
    measureSurface(imageFile: $imageFile, referenceDimensionCm: $referenceDimensionCm, pricePerM2: $pricePerM2) {
      measurements {
        width
        height
        area
        estimatedCost
      }
      success
      error
    }
  }
`;

export const GET_ME = gql`
  query GetMe {
    me {
      id
      username
      email
      firstName
      lastName
      isStaff
    }
  }
`;

// DRF Auth Kit Mutations
export const DRF_LOGIN_MUTATION = gql`
  mutation Login($email_or_username: String!, $password: String!) {
    login(emailOrUsername: $email_or_username, password: $password) {
      success
      message
      user {
        id
        username
        email
        firstName
        lastName
        phone
        isStaff
        dateJoined
      }
      tokens {
        access
        refresh
      }
      errors
    }
  }
`;

export const DRF_REGISTER_MUTATION = gql`
  mutation Register($username: String!, $email: String!, $password: String!, $password_confirm: String!, $first_name: String!, $last_name: String, $phone: String) {
    register(username: $username, email: $email, password: $password, passwordConfirm: $password_confirm, firstName: $first_name, lastName: $last_name, phone: $phone) {
      success
      message
      user {
        id
        username
        email
        firstName
        lastName
        phone
        isStaff
        dateJoined
      }
      tokens {
        access
        refresh
      }
      errors
    }
  }
`;

export const DRF_CHANGE_PASSWORD_MUTATION = gql`
  mutation ChangePassword($old_password: String!, $new_password: String!, $new_password_confirm: String!) {
    changePassword(oldPassword: $old_password, newPassword: $new_password, newPasswordConfirm: $new_password_confirm) {
      success
      message
      user {
        id
        username
        email
        firstName
        lastName
        phone
        isStaff
        dateJoined
      }
      errors
    }
  }
`;

export const DRF_UPDATE_PROFILE_MUTATION = gql`
  mutation UpdateProfile($first_name: String, $last_name: String, $email: String, $phone: String) {
    updateProfile(firstName: $first_name, lastName: $last_name, email: $email, phone: $phone) {
      success
      message
      user {
        id
        username
        email
        firstName
        lastName
        phone
        isStaff
        dateJoined
      }
      errors
    }
  }
`;

export const DRF_ME_QUERY = gql`
  query Me {
    me {
      id
      username
      email
      firstName
      lastName
      phone
      isStaff
      dateJoined
    }
  }
`;

export const graphqlQuery = async (query, variables = {}, fetchPolicy = 'network-only') => {
  try {
    const { data, errors } = await apolloClient.query({ query, variables, fetchPolicy });
    if (errors?.length) {
      throw new Error(errors.map((e) => e.message).join(' | '));
    }
    return data;
  } catch (error) {
    throw new Error(error?.message || 'GraphQL query failed');
  }
};

export const graphqlMutation = async (mutation, variables = {}) => {
  try {
    const { data, errors } = await apolloClient.mutate({ mutation, variables });
    if (errors?.length) {
      throw new Error(errors.map((e) => e.message).join(' | '));
    }
    return data;
  } catch (error) {
    throw new Error(error?.message || 'GraphQL mutation failed');
  }
};
