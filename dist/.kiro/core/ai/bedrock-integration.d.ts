/**
 * Amazon Bedrock Integration Module
 *
 * Provides seamless integration with Amazon Bedrock foundation models
 * for advanced AI-powered code analysis and explanation generation.
 */
import { ComplexityMetrics } from '../analysis/complexityAnalyzer';
/**
 * Bedrock model configurations
 */
export interface BedrockConfig {
    region: string;
    modelId: string;
    maxTokens: number;
    temperature: number;
}
/**
 * AI analysis request structure
 */
export interface AIAnalysisRequest {
    code: string;
    language: string;
    userSkillLevel: number;
    context?: string;
    previousAnalysis?: ComplexityMetrics;
}
/**
 * AI-enhanced explanation response
 */
export interface AIExplanationResponse {
    bedrockInsight: string;
    metaphor: string;
    learningPath: string[];
    confidenceScore: number;
    processingTime: number;
}
/**
 * Amazon Bedrock AI Service
 */
export declare class BedrockAIService {
    private client;
    private config;
    constructor(config: BedrockConfig);
    /**
     * Generate AI-powered code explanation using Claude 3.5 Sonnet
     */
    generateExplanation(request: AIAnalysisRequest): Promise<AIExplanationResponse>;
    /**
     * Build comprehensive analysis prompt for Claude
     */
    private buildAnalysisPrompt;
    /**
     * Parse and validate AI response
     */
    private parseAIResponse;
    /**
     * Generate embeddings for RAG system using Titan
     */
    generateEmbeddings(text: string): Promise<number[]>;
    /**
     * Batch process multiple code snippets
     */
    batchAnalyze(requests: AIAnalysisRequest[]): Promise<AIExplanationResponse[]>;
}
/**
 * Factory function to create Bedrock AI service with default configuration
 */
export declare function createBedrockAIService(region?: string): BedrockAIService;
/**
 * Utility functions for common AI operations
 */
export declare const BedrockUtils: {
    /**
     * Check if Bedrock is available in the current environment
     */
    isAvailable(): Promise<boolean>;
    /**
     * Get available Bedrock models for the region
     */
    getSupportedModels(): string[];
    /**
     * Estimate cost for AI analysis
     */
    estimateCost(inputTokens: number, outputTokens: number, modelId: string): number;
};
//# sourceMappingURL=bedrock-integration.d.ts.map