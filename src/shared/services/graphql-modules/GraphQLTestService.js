import { gql } from '@apollo/client';
import { client } from '@/plugins/apolloPlugin';

// Simple test to isolate GraphQL issues
class GraphQLTestService {
  constructor() {
    this.client = client;
  }

  async testBasicQuery() {
    console.log('🧪 Testing basic GraphQL query...');
    
    try {
      // Test with the simplest possible query
      const simpleQuery = gql`
        query {
          __typename
        }
      `;
      
      const result = await this.client.query({
        query: simpleQuery,
        fetchPolicy: 'no-cache'
      });
      
      console.log('✅ Basic query success:', result);
      return { success: true, data: result.data };
      
    } catch (error) {
      console.error('❌ Basic query failed:', error);
      return { success: false, error: error.message };
    }
  }

  async testHelloQuery() {
    console.log('🧪 Testing hello query...');
    
    try {
      const helloQuery = gql`
        query {
          hello
        }
      `;
      
      const result = await this.client.query({
        query: helloQuery,
        fetchPolicy: 'no-cache'
      });
      
      console.log('✅ Hello query success:', result);
      return { success: true, data: result.data };
      
    } catch (error) {
      console.error('❌ Hello query failed:', error);
      return { success: false, error: error.message };
    }
  }

  async testAIHealthDirectly() {
    console.log('🧪 Testing AI Health query directly...');
    
    try {
      const aiHealthQuery = gql`
        query AiHealthCheck($service: String) {
          aiHealth(service: $service) {
            status
            service
            available
            responseTime
            lastCheck
          }
        }
      `;
      
      const result = await this.client.query({
        query: aiHealthQuery,
        variables: { service: 'general' },
        fetchPolicy: 'no-cache'
      });
      
      console.log('✅ AI Health query success:', result);
      return { success: true, data: result.data };
      
    } catch (error) {
      console.error('❌ AI Health query failed:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new GraphQLTestService();
