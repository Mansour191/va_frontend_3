// GraphQL-based AIService - REST MIGRATION COMPLETE
import AIServiceGraphQL from './AIServiceGraphQL';

// Export the new GraphQL-based service as default
export default AIServiceGraphQL;

// For backward compatibility, also export as class
export { AIServiceGraphQL as AIService };

// Add static getInstance method to the exported class
AIServiceGraphQL.getInstance = AIServiceGraphQL.getInstance;