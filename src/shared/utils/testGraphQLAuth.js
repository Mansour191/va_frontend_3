// Test utility for GraphQL Authentication
import GraphQLAuthService from '@/integration/services/authGraphQL.js';
import apolloClient from '@/integration/services/apollo.js';
import { gql } from '@apollo/client/core';

// Test query to verify authentication
const TEST_AUTH_QUERY = gql`
  query TestAuth {
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

export class GraphQLAuthTester {
  static async testConnection() {
    console.log('🧪 Testing GraphQL Connection...');
    
    try {
      // Test basic connectivity
      const response = await apolloClient.query({
        query: gql`
          query TestConnection {
            __typename
          }
        `,
        errorPolicy: 'all',
      });
      
      console.log('✅ GraphQL Connection Test Passed');
      return { success: true, message: 'GraphQL connection working' };
    } catch (error) {
      console.error('❌ GraphQL Connection Test Failed:', error);
      return { success: false, error: error.message };
    }
  }
  
  static async testLogin(emailOrUsername = 'test@example.com', password = 'test123') {
    console.log('🧪 Testing GraphQL Login...');
    
    try {
      const response = await GraphQLAuthService.login(emailOrUsername, password);
      console.log('✅ GraphQL Login Test Response:', response);
      return response;
    } catch (error) {
      console.error('❌ GraphQL Login Test Failed:', error);
      return { success: false, error: error.message };
    }
  }
  
  static async testAuthenticatedRequest() {
    console.log('🧪 Testing Authenticated Request...');
    
    try {
      const response = await apolloClient.query({
        query: TEST_AUTH_QUERY,
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
  
  static async testTokenHeaders() {
    console.log('🧪 Testing Token Headers...');
    
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
        username: payload.username,
        exp: new Date(payload.exp * 1000).toISOString(),
        timeUntilExpiry: payload.exp - currentTime,
        isValid: payload.exp > currentTime
      });
      
      if (payload.exp <= currentTime) {
        console.log('⚠️  Token has expired');
        return { success: false, message: 'Token expired' };
      }
      
      console.log('✅ Token Headers Test Passed');
      return { success: true, payload };
    } catch (error) {
      console.error('❌ Token Headers Test Failed:', error);
      return { success: false, error: error.message };
    }
  }
  
  static async testApolloHeaders() {
    console.log('🧪 Testing Apollo Headers...');
    
    try {
      // Make a request and check the headers sent
      const originalFetch = global.fetch;
      let capturedHeaders = null;
      
      // Intercept fetch to capture headers
      global.fetch = function(uri, options) {
        capturedHeaders = options?.headers;
        console.log('🔍 Captured Apollo Headers:', capturedHeaders);
        return originalFetch.call(this, uri, options);
      };
      
      try {
        await apolloClient.query({
          query: gql`
            query TestHeaders {
              __typename
            }
          `,
          errorPolicy: 'all',
        });
        
        // Restore original fetch
        global.fetch = originalFetch;
        
        if (capturedHeaders?.Authorization) {
          console.log('✅ Apollo Headers Test Passed - Authorization header found');
          return { success: true, headers: capturedHeaders };
        } else {
          console.log('⚠️  Apollo Headers Test: No Authorization header found');
          return { success: false, message: 'No Authorization header' };
        }
      } catch (error) {
        // Restore original fetch in case of error
        global.fetch = originalFetch;
        throw error;
      }
    } catch (error) {
      console.error('❌ Apollo Headers Test Failed:', error);
      return { success: false, error: error.message };
    }
  }
  
  static async runFullTestSuite() {
    console.log('🚀 Starting Full GraphQL Auth Test Suite...');
    
    const results = {
      connection: await this.testConnection(),
      tokenHeaders: await this.testTokenHeaders(),
      apolloHeaders: await this.testApolloHeaders(),
      authenticatedRequest: await this.testAuthenticatedRequest(),
    };
    
    // Only test login if we have test credentials
    if (import.meta.env.VITE_TEST_USER_EMAIL && import.meta.env.VITE_TEST_USER_PASSWORD) {
      results.login = await this.testLogin(
        import.meta.env.VITE_TEST_USER_EMAIL,
        import.meta.env.VITE_TEST_USER_PASSWORD
      );
    }
    
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
}

export default GraphQLAuthTester;
