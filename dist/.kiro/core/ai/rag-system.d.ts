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
export declare class RAGSystem {
    private vectorDatabase;
    private bedrockService;
    private config;
    constructor(bedrockService: BedrockAIService, config?: Partial<RAGConfig>);
    /**
     * Add knowledge to the vector database
     */
    addKnowledge(content: string, metadata: VectorEntry['metadata']): Promise<string>;
    /**
     * Retrieve relevant context for a code query
     */
    retrieveContext(query: string, language: string): Promise<RAGContext>;
    /**
     * Semantic search using cosine similarity
     */
    private semanticSearch;
    /**
     * Apply diversity filtering to avoid redundant results
     */
    private applyDiversityFiltering;
    /**
     * Rerank results using AI-powered relevance assessment
     */
    private rerankResults;
    /**
     * Synthesize retrieved knowledge into coherent context
     */
    private synthesizeContext;
    /**
     * Calculate cosine similarity between two vectors
     */
    private cosineSimilarity;
    /**
     * Calculate text similarity using simple overlap
     */
    private textSimilarity;
    /**
     * Calculate relevance score combining similarity and metadata
     */
    private calculateRelevanceScore;
    /**
     * Calculate confidence score for the overall retrieval
     */
    private calculateConfidence;
    /**
     * Generate unique ID for content
     */
    private generateId;
    /**
     * Initialize with sample knowledge base
     */
    private initializeKnowledgeBase;
    /**
     * Get statistics about the knowledge base
     */
    getStats(): {
        totalEntries: number;
        languageDistribution: Record<string, number>;
        sourceDistribution: Record<string, number>;
        complexityDistribution: Record<string, number>;
    };
}
/**
 * Factory function to create RAG system with Bedrock integration
 */
export declare function createRAGSystem(bedrockService: BedrockAIService, config?: Partial<RAGConfig>): RAGSystem;
/**
 * Utility functions for RAG operations
 */
export declare const RAGUtils: {
    /**
     * Validate vector entry before adding to database
     */
    validateEntry(entry: Partial<VectorEntry>): boolean;
    /**
     * Estimate memory usage of the vector database
     */
    estimateMemoryUsage(entryCount: number, embeddingDimensions?: number): string;
    /**
     * Generate search query suggestions
     */
    generateQuerySuggestions(code: string, language: string): string[];
};
//# sourceMappingURL=rag-system.d.ts.map