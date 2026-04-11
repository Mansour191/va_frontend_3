// Complete GraphQL Authentication Test Suite
import GraphQLAuthService from '@/integration/services/authGraphQL.js';
import apolloClient from '@/integration/services/apollo.js';
import { gql } from '@apollo/client/core';

// Test queries and mutations
const TEST_QUERIES = {
  connection: gql`query TestConnection { __typename }`,
  me: gql`query TestMe { me { id username email firstName lastName isStaff } }`,
  categories: gql`query TestCategories { categories { id nameEn nameAr slug } }`,
  products: gql`query TestProducts { products { id nameEn nameAr slug basePrice } }`,
};

const TEST_MUTATIONS = {
  login: gql`
    mutation TestLogin($emailOrUsername: String!, $password: String!) {
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
        }
        tokens
      }
    }
  `,
  register: gql`
    mutation TestRegister($username: String!, $email: String!, $password: String!, $passwordConfirm: String!, $firstName: String!, $lastName: String) {
      register(username: $username, email: $email, password: $password, passwordConfirm: $passwordConfirm, firstName: $firstName, lastName: $lastName) {
        success
        message
        user {
          id
          username
          email
        }
        tokens
      }
    }
  `,
};

export class GraphQLAuthTester {
  static async runCompleteTestSuite() {
    console.log('🚀 Starting Complete GraphQL Auth Test Suite...');
    
    const results = {
      connection: await this.testConnection(),
      login: await this.testLogin(),
      authenticatedRequest: await this.testAuthenticatedRequest(),
      register: await this.testRegister(),
      categoriesQuery: await this.testCategoriesQuery(),
      productsQuery: await this.testProductsQuery(),
      apolloHeaders: await this.testApolloHeaders(),
    };
    
    const passedTests = Object.values(results).filter(r => r.success).length;
    const totalTests = Object.keys(results).length;
    
    console.log(`📊 Test Results: ${passedTests}/${totalTests} tests passed`);
    console.log('📋 Detailed Results:', results);
    
    return {
      summary: {
        passed: passedTests,
        total: totalTests,
        success: passedTests === totalTests
      },
      details: results
    };
  }

  static async testConnection() {
    console.log('🧪 Testing GraphQL Connection...');
    
    try {
      const response = await apolloClient.query({
        query: TEST_QUERIES.connection,
        errorPolicy: 'all',
      });
      
      console.log('✅ GraphQL Connection Test Passed');
      return { success: true, message: 'GraphQL connection working', data: response.data };
    } catch (error) {
      console.error('❌ GraphQL Connection Test Failed:', error);
      return { success: false, error: error.message };
    }
  }

  static async testLogin() {
    console.log('🧪 Testing GraphQL Login...');
    
    try {
      const response = await apolloClient.mutate({
        mutation: TEST_MUTATIONS.login,
        variables: {
          emailOrUsername: 'testuser3',
          password: 'StrongPass123!',
        },
        errorPolicy: 'all',
      });
      
      const data = response.data?.login;
      
      if (data?.success) {
        console.log('✅ GraphQL Login Test Passed');
        return { success: true, message: 'Login successful', data };
      } else {
        console.log('❌ GraphQL Login Test Failed:', data?.message);
        return { success: false, error: data?.message || 'Login failed' };
      }
    } catch (error) {
      console.error('❌ GraphQL Login Test Failed:', error);
      return { success: false, error: error.message };
    }
  }

  static async testAuthenticatedRequest() {
    console.log('🧪 Testing Authenticated Request...');
    
    try {
      const response = await apolloClient.query({
        query: TEST_QUERIES.me,
        errorPolicy: 'all',
      });
      
      const user = response.data?.me;
      
      if (user) {
        console.log('✅ Authenticated Request Test Passed:', user);
        return { success: true, user };
      } else {
        console.log('⚠️  Authenticated Request Test: No user data (might be expected if not logged in)');
        return { success: false, message: 'No user data returned' };
      }
    } catch (error) {
      console.error('❌ Authenticated Request Test Failed:', error);
      return { success: false, error: error.message };
    }
  }

  static async testRegister() {
    console.log('🧪 Testing GraphQL Register...');
    
    const timestamp = Date.now();
    const userData = {
      username: `testuser_${timestamp}`,
      email: `test_${timestamp}@example.com`,
      password: 'StrongPass123!',
      passwordConfirm: 'StrongPass123!',
      firstName: 'Test',
      lastName: 'User',
    };
    
    try {
      const response = await apolloClient.mutate({
        mutation: TEST_MUTATIONS.register,
        variables: userData,
        errorPolicy: 'all',
      });
      
      const data = response.data?.register;
      
      if (data?.success) {
        console.log('✅ GraphQL Register Test Passed');
        return { success: true, message: 'Register successful', data };
      } else {
        console.log('❌ GraphQL Register Test Failed:', data?.message);
        return { success: false, error: data?.message || 'Register failed' };
      }
    } catch (error) {
      console.error('❌ GraphQL Register Test Failed:', error);
      return { success: false, error: error.message };
    }
  }

  static async testCategoriesQuery() {
    console.log('🧪 Testing Categories Query...');
    
    try {
      const response = await apolloClient.query({
        query: TEST_QUERIES.categories,
        errorPolicy: 'all',
      });
      
      const categories = response.data?.categories;
      
      if (categories && Array.isArray(categories)) {
        console.log('✅ Categories Query Test Passed:', categories.length, 'categories found');
        return { success: true, count: categories.length, data: categories };
      } else {
        console.log('❌ Categories Query Test Failed: Invalid response');
        return { success: false, error: 'Invalid categories response' };
      }
    } catch (error) {
      console.error('❌ Categories Query Test Failed:', error);
      return { success: false, error: error.message };
    }
  }

  static async testProductsQuery() {
    console.log('🧪 Testing Products Query...');
    
    try {
      const response = await apolloClient.query({
        query: TEST_QUERIES.products,
        errorPolicy: 'all',
      });
      
      const products = response.data?.products;
      
      if (products && Array.isArray(products)) {
        console.log('✅ Products Query Test Passed:', products.length, 'products found');
        return { success: true, count: products.length, data: products };
      } else {
        console.log('❌ Products Query Test Failed: Invalid response');
        return { success: false, error: 'Invalid products response' };
      }
    } catch (error) {
      console.error('❌ Products Query Test Failed:', error);
      return { success: false, error: error.message };
    }
  }

  static async testApolloHeaders() {
    console.log('🧪 Testing Apollo Headers...');
    
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.log('⚠️  No token found in localStorage');
      return { success: false, message: 'No token found' };
    }
    
    try {
      // Decode token to check it's valid
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      console.log('🔍 Token Details:', {
        userId: payload.user_id,
        exp: new Date(payload.exp * 1000).toISOString(),
        timeUntilExpiry: payload.exp - currentTime,
        isValid: payload.exp > currentTime
      });
      
      if (payload.exp <= currentTime) {
        console.log('⚠️  Token has expired');
        return { success: false, message: 'Token expired' };
      }
      
      // Test that Apollo sends the header
      const originalFetch = global.fetch;
      let capturedHeaders = null;
      
      global.fetch = function(uri, options) {
        capturedHeaders = options?.headers;
        console.log('🔍 Captured Apollo Headers:', capturedHeaders);
        return originalFetch.call(this, uri, options);
      };
      
      try {
        await apolloClient.query({
          query: TEST_QUERIES.connection,
          errorPolicy: 'all',
        });
        
        global.fetch = originalFetch;
        
        if (capturedHeaders?.Authorization) {
          console.log('✅ Apollo Headers Test Passed - Authorization header found');
          return { success: true, headers: capturedHeaders };
        } else {
          console.log('⚠️  Apollo Headers Test: No Authorization header found');
          return { success: false, message: 'No Authorization header' };
        }
      } catch (error) {
        global.fetch = originalFetch;
        throw error;
      }
    } catch (error) {
      console.error('❌ Apollo Headers Test Failed:', error);
      return { success: false, error: error.message };
    }
  }

  static async testTokenRefresh() {
    console.log('🧪 Testing Token Refresh...');
    
    try {
      const result = await GraphQLAuthService.refreshToken();
      console.log('✅ Token Refresh Test Passed');
      return { success: true, newToken: result };
    } catch (error) {
      console.log('⚠️  Token Refresh Test: Not implemented or failed');
      return { success: false, error: error.message };
    }
  }

  static async testTokenValidation() {
    console.log('🧪 Testing Token Validation...');
    
    try {
      const result = await GraphQLAuthService.ensureValidToken();
      if (result) {
        console.log('✅ Token Validation Test Passed');
        return { success: true, token: result };
      } else {
        console.log('⚠️  Token Validation Test: No valid token');
        return { success: false, message: 'No valid token' };
      }
    } catch (error) {
      console.error('❌ Token Validation Test Failed:', error);
      return { success: false, error: error.message };
    }
  }

  static async testLogout() {
    console.log('🧪 Testing Logout...');
    
    try {
      GraphQLAuthService.logout();
      console.log('✅ Logout Test Passed');
      return { success: true, message: 'Logout successful' };
    } catch (error) {
      console.error('❌ Logout Test Failed:', error);
      return { success: false, error: error.message };
    }
  }
}

// Export for use in components
export default GraphQLAuthTester;
