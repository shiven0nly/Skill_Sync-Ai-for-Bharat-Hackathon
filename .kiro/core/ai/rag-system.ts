/**
 * RAG (Retrieval-Augmented Generation) System
 * 
 * Implements advanced RAG architecture for contextual code explanation
 * using vector databases and semantic search capabilities.
 */

import { BedrockAIService } from './bedrock-integration';

/**
 * Vector database entry structure
 */
export interface VectorEntry {
  id: string;
  content: string;
  metadata: {
    language: string;
    framework?: string;
    complexity: 'low' | 'medium' | 'high';
    tags: string[];
    source: 'stackoverflow' | 'github' | 'documentation' | 'community';
    votes?: number;
    lastUpdated: string;
  };
  embedding: number[];
}

/**
 * Search result with similarity score
 */
export interface SearchResult {
  entry: VectorEntry;
  similarity: number;
  relevanceScore: number;
}

/**
 * RAG retrieval configuration
 */
export interface RAGConfig {
  maxResults: number;
  similarityThreshold: number;
  diversityFactor: number;
  contextWindow: number;
  enableReranking: boolean;
}

/**
 * Enhanced context for AI generation
 */
export interface RAGContext {
  originalQuery: string;
  retrievedKnowledge: SearchResult[];
  synthesizedContext: string;
  confidenceScore: number;
  sources: string[];
}

/**
 * RAG System Implementation
 */
export class RAGSystem {
  private vectorDatabase: Map<string, VectorEntry> = new Map();
  private bedrockService: BedrockAIService;
  private config: RAGConfig;

  constructor(bedrockService: BedrockAIService, config: Partial<RAGConfig> = {}) {
    this.bedrockService = bedrockService;
    this.config = {
      maxResults: 10,
      similarityThreshold: 0.7,
      diversityFactor: 0.3,
      contextWindow: 4000,
      enableReranking: true,
      ...config
    };

    // Initialize with sample knowledge base
    this.initializeKnowledgeBase();
  }

  /**
   * Add knowledge to the vector database
   */
  async addKnowledge(content: string, metadata: VectorEntry['metadata']): Promise<string> {
    const id = this.generateId(content);
    const embedding = await this.bedrockService.generateEmbeddings(content);

    const entry: VectorEntry = {
      id,
      content,
      metadata,
      embedding
    };

    this.vectorDatabase.set(id, entry);
    return id;
  }

  /**
   * Retrieve relevant context for a code query
   */
  async retrieveContext(query: string, language: string): Promise<RAGContext> {
    try {
      // Generate query embedding
      const queryEmbedding = await this.bedrockService.generateEmbeddings(query);

      // Search for similar entries
      const searchResults = await this.semanticSearch(queryEmbedding, language);

      // Apply diversity and reranking
      const diverseResults = this.applyDiversityFiltering(searchResults);
      const rerankedResults = this.config.enableReranking 
        ? await this.rerankResults(query, diverseResults)
        : diverseResults;

      // Synthesize context
      const synthesizedContext = this.synthesizeContext(rerankedResults);

      return {
        originalQuery: query,
        retrievedKnowledge: rerankedResults,
        synthesizedContext,
        confidenceScore: this.calculateConfidence(rerankedResults),
        sources: rerankedResults.map(r => r.entry.metadata.source)
      };

    } catch (error) {
      console.error('RAG retrieval failed:', error);
      return {
        originalQuery: query,
        retrievedKnowledge: [],
        synthesizedContext: 'No relevant context found',
        confidenceScore: 0,
        sources: []
      };
    }
  }

  /**
   * Semantic search using cosine similarity
   */
  private async semanticSearch(queryEmbedding: number[], language: string): Promise<SearchResult[]> {
    const results: SearchResult[] = [];

    for (const entry of this.vectorDatabase.values()) {
      // Filter by language if specified
      if (language && entry.metadata.language !== language) {
        continue;
      }

      const similarity = this.cosineSimilarity(queryEmbedding, entry.embedding);
      
      if (similarity >= this.config.similarityThreshold) {
        results.push({
          entry,
          similarity,
          relevanceScore: this.calculateRelevanceScore(entry, similarity)
        });
      }
    }

    // Sort by relevance score and limit results
    return results
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, this.config.maxResults);
  }

  /**
   * Apply diversity filtering to avoid redundant results
   */
  private applyDiversityFiltering(results: SearchResult[]): SearchResult[] {
    if (results.length <= 3) return results;

    const diverse: SearchResult[] = [results[0]]; // Always include top result
    const diversityThreshold = this.config.diversityFactor;

    for (let i = 1; i < results.length; i++) {
      const candidate = results[i];
      let isDiverse = true;

      // Check diversity against already selected results
      for (const selected of diverse) {
        const contentSimilarity = this.textSimilarity(
          candidate.entry.content,
          selected.entry.content
        );

        if (contentSimilarity > diversityThreshold) {
          isDiverse = false;
          break;
        }
      }

      if (isDiverse) {
        diverse.push(candidate);
      }

      // Stop when we have enough diverse results
      if (diverse.length >= Math.min(5, this.config.maxResults)) {
        break;
      }
    }

    return diverse;
  }

  /**
   * Rerank results using AI-powered relevance assessment
   */
  private async rerankResults(query: string, results: SearchResult[]): Promise<SearchResult[]> {
    // For now, return results as-is. In production, this would use
    // a specialized reranking model or additional AI analysis
    return results;
  }

  /**
   * Synthesize retrieved knowledge into coherent context
   */
  private synthesizeContext(results: SearchResult[]): string {
    if (results.length === 0) {
      return 'No relevant context available.';
    }

    let context = 'Relevant knowledge from the community:\n\n';
    let tokenCount = 0;

    for (const result of results) {
      const entry = result.entry;
      const snippet = `**${entry.metadata.source.toUpperCase()}** (${(result.similarity * 100).toFixed(1)}% match):\n${entry.content}\n\n`;
      
      // Rough token estimation (1 token ≈ 4 characters)
      const snippetTokens = snippet.length / 4;
      
      if (tokenCount + snippetTokens > this.config.contextWindow) {
        break;
      }

      context += snippet;
      tokenCount += snippetTokens;
    }

    return context;
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Vectors must have the same length');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Calculate text similarity using simple overlap
   */
  private textSimilarity(text1: string, text2: string): number {
    const words1 = new Set(text1.toLowerCase().split(/\W+/));
    const words2 = new Set(text2.toLowerCase().split(/\W+/));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }

  /**
   * Calculate relevance score combining similarity and metadata
   */
  private calculateRelevanceScore(entry: VectorEntry, similarity: number): number {
    let score = similarity * 0.7; // Base similarity weight

    // Boost based on source credibility
    const sourceBoost = {
      'documentation': 0.3,
      'stackoverflow': 0.2,
      'github': 0.15,
      'community': 0.1
    };
    score += sourceBoost[entry.metadata.source] || 0;

    // Boost based on votes (if available)
    if (entry.metadata.votes) {
      score += Math.min(0.1, entry.metadata.votes / 1000);
    }

    // Recency boost
    const daysSinceUpdate = (Date.now() - new Date(entry.metadata.lastUpdated).getTime()) / (1000 * 60 * 60 * 24);
    const recencyBoost = Math.max(0, 0.05 * (1 - daysSinceUpdate / 365));
    score += recencyBoost;

    return Math.min(1, score);
  }

  /**
   * Calculate confidence score for the overall retrieval
   */
  private calculateConfidence(results: SearchResult[]): number {
    if (results.length === 0) return 0;

    const avgSimilarity = results.reduce((sum, r) => sum + r.similarity, 0) / results.length;
    const diversityScore = results.length >= 3 ? 0.2 : results.length * 0.1;
    const sourceQuality = results.reduce((sum, r) => {
      const quality = { 'documentation': 1, 'stackoverflow': 0.8, 'github': 0.7, 'community': 0.5 };
      return sum + (quality[r.entry.metadata.source] || 0.5);
    }, 0) / results.length;

    return Math.min(1, avgSimilarity * 0.5 + diversityScore + sourceQuality * 0.3);
  }

  /**
   * Generate unique ID for content
   */
  private generateId(content: string): string {
    // Simple hash function for demo purposes
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Initialize with sample knowledge base
   */
  private async initializeKnowledgeBase(): Promise<void> {
    const sampleKnowledge = [
      {
        content: "Array.map() creates a new array by calling a function on every element of the original array. It's like having a factory assembly line where each item gets transformed.",
        metadata: {
          language: 'javascript',
          framework: 'vanilla',
          complexity: 'low' as const,
          tags: ['array', 'functional-programming', 'transformation'],
          source: 'documentation' as const,
          votes: 150,
          lastUpdated: '2024-01-15'
        }
      },
      {
        content: "Promise.all() runs multiple async operations in parallel and waits for all to complete. Think of it like ordering multiple dishes at a restaurant - they're all prepared simultaneously.",
        metadata: {
          language: 'javascript',
          complexity: 'medium' as const,
          tags: ['promises', 'async', 'parallel'],
          source: 'stackoverflow' as const,
          votes: 89,
          lastUpdated: '2024-02-01'
        }
      },
      {
        content: "React useEffect with empty dependency array runs only once after component mounts. It's like setting up furniture when you first move into a house.",
        metadata: {
          language: 'javascript',
          framework: 'react',
          complexity: 'medium' as const,
          tags: ['react', 'hooks', 'lifecycle'],
          source: 'github' as const,
          votes: 234,
          lastUpdated: '2024-01-28'
        }
      }
    ];

    // Add sample knowledge (in production, this would be loaded from a real database)
    for (const knowledge of sampleKnowledge) {
      try {
        await this.addKnowledge(knowledge.content, knowledge.metadata);
      } catch (error) {
        console.warn('Failed to add sample knowledge:', error);
      }
    }
  }

  /**
   * Get statistics about the knowledge base
   */
  getStats(): {
    totalEntries: number;
    languageDistribution: Record<string, number>;
    sourceDistribution: Record<string, number>;
    complexityDistribution: Record<string, number>;
  } {
    const stats = {
      totalEntries: this.vectorDatabase.size,
      languageDistribution: {} as Record<string, number>,
      sourceDistribution: {} as Record<string, number>,
      complexityDistribution: {} as Record<string, number>
    };

    for (const entry of this.vectorDatabase.values()) {
      // Language distribution
      stats.languageDistribution[entry.metadata.language] = 
        (stats.languageDistribution[entry.metadata.language] || 0) + 1;

      // Source distribution
      stats.sourceDistribution[entry.metadata.source] = 
        (stats.sourceDistribution[entry.metadata.source] || 0) + 1;

      // Complexity distribution
      stats.complexityDistribution[entry.metadata.complexity] = 
        (stats.complexityDistribution[entry.metadata.complexity] || 0) + 1;
    }

    return stats;
  }
}

/**
 * Factory function to create RAG system with Bedrock integration
 */
export function createRAGSystem(bedrockService: BedrockAIService, config?: Partial<RAGConfig>): RAGSystem {
  return new RAGSystem(bedrockService, config);
}

/**
 * Utility functions for RAG operations
 */
export const RAGUtils = {
  /**
   * Validate vector entry before adding to database
   */
  validateEntry(entry: Partial<VectorEntry>): boolean {
    return !!(
      entry.content &&
      entry.metadata &&
      entry.metadata.language &&
      entry.metadata.complexity &&
      entry.metadata.source
    );
  },

  /**
   * Estimate memory usage of the vector database
   */
  estimateMemoryUsage(entryCount: number, embeddingDimensions: number = 1536): string {
    const bytesPerEntry = embeddingDimensions * 4 + 1000; // 4 bytes per float + metadata
    const totalBytes = entryCount * bytesPerEntry;
    
    if (totalBytes < 1024 * 1024) {
      return `${(totalBytes / 1024).toFixed(1)} KB`;
    } else if (totalBytes < 1024 * 1024 * 1024) {
      return `${(totalBytes / (1024 * 1024)).toFixed(1)} MB`;
    } else {
      return `${(totalBytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    }
  },

  /**
   * Generate search query suggestions
   */
  generateQuerySuggestions(code: string, language: string): string[] {
    const suggestions = [
      `${language} ${code.includes('async') ? 'async await' : 'synchronous'} patterns`,
      `${language} best practices`,
      `${language} common mistakes`,
      `${language} performance optimization`
    ];

    // Add framework-specific suggestions
    if (code.includes('React') || code.includes('useState')) {
      suggestions.push('React hooks patterns', 'React component lifecycle');
    }
    if (code.includes('Express') || code.includes('app.')) {
      suggestions.push('Express.js routing', 'Node.js server patterns');
    }

    return suggestions;
  }
};