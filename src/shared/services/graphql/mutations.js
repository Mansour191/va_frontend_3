import { gql } from '@apollo/client';

// Auth Mutations
export const LOGIN_MUTATION = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      success
      message
      token
      refreshToken
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

export const REGISTER_MUTATION = gql`
  mutation Register($username: String!, $email: String!, $password: String!, $firstName: String!, $lastName: String!) {
    register(username: $username, email: $email, password: $password, firstName: $firstName, lastName: $lastName) {
      success
      message
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

export const UPDATE_PROFILE_MUTATION = gql`
  mutation UpdateProfile($firstName: String, $lastName: String, $phone: String, $address: String, $wilayaId: ID) {
    updateProfile(firstName: $firstName, lastName: $lastName, phone: $phone, address: $address, wilayaId: $wilayaId) {
      success
      message
      user {
        id
        username
        email
        firstName
        lastName
        profile {
          phone
          address
          wilaya {
            id
            nameAr
            nameFr
          }
        }
      }
    }
  }
`;

// AI Chat Mutation
export const CHAT_WITH_AI_MUTATION = gql`
  mutation ChatWithAI($message: String!) {
    chatWithAi(message: $message) {
      response
      success
    }
  }
`;

// Order Mutations
export const CREATE_ORDER_MUTATION = gql`
  mutation CreateOrder($customerName: String!, $phone: String!, $email: String!, $address: String!, $wilayaId: ID!, $subtotal: Float!, $shippingCost: Float!, $total: Float!, $paymentMethod: String!, $items: [OrderItemInput!]!) {
    createOrder(customerName: $customerName, phone: $phone, email: $email, address: $address, wilayaId: $wilayaId, subtotal: $subtotal, shippingCost: $shippingCost, total: $total, paymentMethod: $paymentMethod, items: $items) {
      order {
        id
        orderNumber
        customerName
        phone
        email
        address
        subtotal
        shippingCost
        total
        paymentMethod
        status
        createdAt
        items {
          id
          product {
            id
            name
            price
          }
          quantity
          price
        }
      }
    }
  }
`;

// Contact Form Mutations - Based on Django Contact Model
export const SEND_CONTACT_FORM_MUTATION = gql`
  mutation SendContactForm($name: String!, $email: String!, $phone: String!, $message: String!) {
    sendContactForm(name: $name, email: $email, phone: $phone, message: $message) {
      success
      message
      contact {
        id
        name
        email
        phone
        message
        status
        createdAt
      }
    }
  }
`;

export const SEND_QUICK_MESSAGE_MUTATION = gql`
  mutation SendQuickMessage($name: String!, $phone: String!, $type: String!, $source: String!) {
    sendQuickMessage(name: $name, phone: $phone, type: $type, source: $source) {
      success
      message
      contact {
        id
        name
        phone
        type
        source
        status
        createdAt
      }
    }
  }
`;
