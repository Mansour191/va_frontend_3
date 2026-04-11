const API_BASE = (import.meta.env.VUE_APP_API_URL || '').replace(/\/+$/, '');

class SemanticSearchService {
  async searchProducts(query, options = {}) {
    const response = await fetch(`${API_BASE}/v1/semantic-search/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        category: options.category || 'all',
        top_k: options.topK || 18,
      }),
    });
    if (!response.ok) {
      throw new Error('Semantic search unavailable');
    }
    return response.json();
  }
}

export default new SemanticSearchService();
