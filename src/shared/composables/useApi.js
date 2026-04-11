// DEPRECATED - MIGRATED TO GRAPHQL
// This file is replaced by useGraphQL.js
// All API calls should now use GraphQL queries/mutations

import { useQuery, useMutation } from '@apollo/client';

// Legacy wrapper for backward compatibility - DO NOT USE FOR NEW CODE
export function useApi() {
  console.warn('⚠️ useApi is deprecated. Please use GraphQL composables from useGraphQL.js instead.');
  
  return {
    get: (url) => ({
      execute: () => Promise.reject(new Error('useApi.get() is deprecated - use GraphQL queries instead')),
      data: { value: null },
      error: { value: new Error('REST API deprecated') }
    }),
    post: (url, data) => ({
      execute: () => Promise.reject(new Error('useApi.post() is deprecated - use GraphQL mutations instead')),
      data: { value: null },
      error: { value: new Error('REST API deprecated') }
    }),
    put: (url, data) => ({
      execute: () => Promise.reject(new Error('useApi.put() is deprecated - use GraphQL mutations instead')),
      data: { value: null },
      error: { value: new Error('REST API deprecated') }
    }),
    delete: (url) => ({
      execute: () => Promise.reject(new Error('useApi.delete() is deprecated - use GraphQL mutations instead')),
      data: { value: null },
      error: { value: new Error('REST API deprecated') }
    })
  };
}

// Export GraphQL composables as migration path
export { 
  useGraphQLQuery,
  useGraphQLMutation,
  useProducts,
  useProduct,
  useCategories,
  useAIHealth,
  useMarketTrends,
  useDemandForecast,
  useCompetitorPrices,
  usePricingAnalysis
} from './useGraphQL';

console.log('📦 useApi.js - MIGRATED TO GRAPHQL');