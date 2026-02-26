/**
 * Multi-Agent Orchestrator
 *
 * Coordinates multiple AI agents to provide comprehensive code analysis
 * and explanation generation using Amazon Bedrock and RAG systems.
 */
import { BedrockAIService, AIExplanationResponse } from './bedrock-integration';
import { RAGSystem, RAGContext } from './rag-system';
import { ComplexityMetrics } from '../analysis/complexityAnalyzer';
import { MetaphorCardData } from '../ui/MetaphorCard';
/**
 * Agent types in the system
 */
export declare enum AgentType {
    ORCHESTRATOR = "orchestrator",
    ANALYSIS = "analysis",
    KNOWLEDGE = "knowledge",
    EXPLANATION = "explanation",
    METAPHOR = "metaphor",
    LEARNING = "learning"
}
/**
 * Agent execution result
 */
export interface AgentResult {
    agentType: AgentType;
    success: boolean;
    data?: any;
    error?: string;
    executionTime: number;
    confidence: number;
}
/**
 * Comprehensive AI analysis request
 */
export interface ComprehensiveAnalysisRequest {
    code: string;
    language: string;
    filePath?: string;
    userSkillLevel: number;
    userPreferences?: {
        metaphorDomains?: string[];
        explanationStyle?: 'concise' | 'detailed' | 'interactive';
        includeExamples?: boolean;
    };
    context?: {
        projectType?: string;
        framework?: string;
        teamSize?: number;
    };
}
/**
 * Complete AI-powered analysis response
 */
export interface ComprehensiveAnalysisResponse {
    complexity: ComplexityMetrics;
    bedrockAnalysis: AIExplanationResponse;
    ragContext: RAGContext;
    metaphorCard: MetaphorCardData;
    learningPath: {
        currentLevel: number;
        nextConcepts: string[];
        practiceExercises: string[];
        estimatedTimeToMaster: string;
    };
    processingTime: number;
    agentResults: AgentResult[];
    overallConfidence: number;
}
/**
 * Multi-Agent Orchestrator Implementation
 */
export declare class AgentOrchestrator {
    private bedrockService;
    private ragSystem;
    private metaphorGenerator;
    private activeAgents;
    constructor(bedrockService: BedrockAIService, ragSystem: RAGSystem);
    /**
     * Orchestrate comprehensive AI analysis
     */
    analyzeCode(request: ComprehensiveAnalysisRequest): Promise<ComprehensiveAnalysisResponse>;
    /**
     * Execute Phase 1 agents (independent operations)
     */
    private executePhase1;
    /**
     * Execute Phase 2 agents (dependent on Phase 1)
     */
    private executePhase2;
    /**
     * Analysis Agent: Compute complexity metrics
     */
    private executeAnalysisAgent;
    /**
     * Knowledge Agent: Retrieve RAG context
     */
    private executeKnowledgeAgent;
    /**
     * Explanation Agent: Generate AI-powered explanation
     */
    private executeExplanationAgent;
    /**
     * Metaphor Agent: Generate metaphorical explanations
     */
    private executeMetaphorAgent;
    /**
     * Learning Agent: Generate personalized learning recommendations
     */
    private executeLearningAgent;
    /**
     * Generate personalized learning path
     */
    private generateLearningPath;
    /**
     * Calculate overall confidence from agent results
     */
    private calculateOverallConfidence;
    /**
     * Get default explanation when AI fails
     */
    private getDefaultExplanation;
    /**
     * Get default metaphor when generation fails
     */
    private getDefaultMetaphor;
    /**
     * Get default learning path
     */
    private getDefaultLearningPath;
    /**
     * Get fallback response when orchestration fails
     */
    private getFallbackResponse;
    /**
     * Get system status and performance metrics
     */
    getSystemStatus(): {
        activeAgents: number;
        ragStats: any;
        bedrockAvailable: boolean;
        averageResponseTime: number;
    };
}
/**
 * Factory function to create orchestrator with all dependencies
 */
export declare function createAgentOrchestrator(region?: string): Promise<AgentOrchestrator>;
//# sourceMappingURL=agent-orchestrator.d.ts.map