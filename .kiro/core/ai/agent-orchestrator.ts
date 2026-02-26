/**
 * Multi-Agent Orchestrator
 * 
 * Coordinates multiple AI agents to provide comprehensive code analysis
 * and explanation generation using Amazon Bedrock and RAG systems.
 */

import { BedrockAIService, AIAnalysisRequest, AIExplanationResponse } from './bedrock-integration';
import { RAGSystem, RAGContext } from './rag-system';
import { ComplexityMetrics, calculateComplexity } from '../analysis/complexityAnalyzer';
import { MetaphorCardGenerator, MetaphorCardData } from '../ui/MetaphorCard';

/**
 * Agent types in the system
 */
export enum AgentType {
  ORCHESTRATOR = 'orchestrator',
  ANALYSIS = 'analysis',
  KNOWLEDGE = 'knowledge',
  EXPLANATION = 'explanation',
  METAPHOR = 'metaphor',
  LEARNING = 'learning'
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
  // Core analysis
  complexity: ComplexityMetrics;
  
  // AI insights
  bedrockAnalysis: AIExplanationResponse;
  
  // RAG context
  ragContext: RAGContext;
  
  // Metaphor explanation
  metaphorCard: MetaphorCardData;
  
  // Learning recommendations
  learningPath: {
    currentLevel: number;
    nextConcepts: string[];
    practiceExercises: string[];
    estimatedTimeToMaster: string;
  };
  
  // Execution metadata
  processingTime: number;
  agentResults: AgentResult[];
  overallConfidence: number;
}

/**
 * Multi-Agent Orchestrator Implementation
 */
export class AgentOrchestrator {
  private bedrockService: BedrockAIService;
  private ragSystem: RAGSystem;
  private metaphorGenerator: MetaphorCardGenerator;
  private activeAgents: Map<string, Promise<AgentResult>> = new Map();

  constructor(
    bedrockService: BedrockAIService,
    ragSystem: RAGSystem
  ) {
    this.bedrockService = bedrockService;
    this.ragSystem = ragSystem;
    this.metaphorGenerator = new MetaphorCardGenerator({ userSkillLevel: 5 });
  }

  /**
   * Orchestrate comprehensive AI analysis
   */
  async analyzeCode(request: ComprehensiveAnalysisRequest): Promise<ComprehensiveAnalysisResponse> {
    const startTime = Date.now();
    const agentResults: AgentResult[] = [];

    try {
      // Update metaphor generator with user skill level
      this.metaphorGenerator = new MetaphorCardGenerator({
        userSkillLevel: request.userSkillLevel,
        preferredDomains: request.userPreferences?.metaphorDomains,
        maxExplanationLength: request.userPreferences?.explanationStyle === 'concise' ? 200 : 500,
        includeCodeExamples: request.userPreferences?.includeExamples ?? true
      });

      // Phase 1: Parallel execution of independent agents
      const phase1Agents = await this.executePhase1(request);
      agentResults.push(...phase1Agents);

      // Extract results from Phase 1
      const analysisResult = phase1Agents.find(r => r.agentType === AgentType.ANALYSIS);
      const knowledgeResult = phase1Agents.find(r => r.agentType === AgentType.KNOWLEDGE);

      if (!analysisResult?.success || !knowledgeResult?.success) {
        throw new Error('Critical agents failed in Phase 1');
      }

      const complexity: ComplexityMetrics = analysisResult.data;
      const ragContext: RAGContext = knowledgeResult.data;

      // Phase 2: Dependent agents that need Phase 1 results
      const phase2Agents = await this.executePhase2(request, complexity, ragContext);
      agentResults.push(...phase2Agents);

      // Extract results from Phase 2
      const explanationResult = phase2Agents.find(r => r.agentType === AgentType.EXPLANATION);
      const metaphorResult = phase2Agents.find(r => r.agentType === AgentType.METAPHOR);
      const learningResult = phase2Agents.find(r => r.agentType === AgentType.LEARNING);

      // Compile comprehensive response
      const response: ComprehensiveAnalysisResponse = {
        complexity,
        bedrockAnalysis: explanationResult?.data || this.getDefaultExplanation(),
        ragContext,
        metaphorCard: metaphorResult?.data || this.getDefaultMetaphor(request),
        learningPath: learningResult?.data || this.getDefaultLearningPath(request.userSkillLevel),
        processingTime: Date.now() - startTime,
        agentResults,
        overallConfidence: this.calculateOverallConfidence(agentResults)
      };

      return response;

    } catch (error) {
      console.error('Agent orchestration failed:', error);
      
      // Return fallback response
      return this.getFallbackResponse(request, Date.now() - startTime, agentResults);
    }
  }

  /**
   * Execute Phase 1 agents (independent operations)
   */
  private async executePhase1(request: ComprehensiveAnalysisRequest): Promise<AgentResult[]> {
    const agents = [
      this.executeAnalysisAgent(request),
      this.executeKnowledgeAgent(request)
    ];

    const results = await Promise.allSettled(agents);
    
    return results.map((result, index) => {
      const agentType = index === 0 ? AgentType.ANALYSIS : AgentType.KNOWLEDGE;
      
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          agentType,
          success: false,
          error: result.reason?.message || 'Agent execution failed',
          executionTime: 0,
          confidence: 0
        };
      }
    });
  }

  /**
   * Execute Phase 2 agents (dependent on Phase 1)
   */
  private async executePhase2(
    request: ComprehensiveAnalysisRequest,
    complexity: ComplexityMetrics,
    ragContext: RAGContext
  ): Promise<AgentResult[]> {
    const agents = [
      this.executeExplanationAgent(request, complexity, ragContext),
      this.executeMetaphorAgent(request, complexity),
      this.executeLearningAgent(request, complexity)
    ];

    const results = await Promise.allSettled(agents);
    
    return results.map((result, index) => {
      const agentTypes = [AgentType.EXPLANATION, AgentType.METAPHOR, AgentType.LEARNING];
      const agentType = agentTypes[index];
      
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          agentType,
          success: false,
          error: result.reason?.message || 'Agent execution failed',
          executionTime: 0,
          confidence: 0
        };
      }
    });
  }

  /**
   * Analysis Agent: Compute complexity metrics
   */
  private async executeAnalysisAgent(request: ComprehensiveAnalysisRequest): Promise<AgentResult> {
    const startTime = Date.now();
    
    try {
      // For now, use the legacy analyzer since Tree-sitter setup is complex
      // In production, this would use the full Tree-sitter analysis
      const mockRootNode = { type: 'program', childCount: 0 };
      
      const complexity = calculateComplexity(
        mockRootNode,
        request.code,
        request.userSkillLevel,
        request.language as any
      );

      return {
        agentType: AgentType.ANALYSIS,
        success: true,
        data: complexity,
        executionTime: Date.now() - startTime,
        confidence: 0.9
      };

    } catch (error) {
      return {
        agentType: AgentType.ANALYSIS,
        success: false,
        error: error.message,
        executionTime: Date.now() - startTime,
        confidence: 0
      };
    }
  }

  /**
   * Knowledge Agent: Retrieve RAG context
   */
  private async executeKnowledgeAgent(request: ComprehensiveAnalysisRequest): Promise<AgentResult> {
    const startTime = Date.now();
    
    try {
      const ragContext = await this.ragSystem.retrieveContext(request.code, request.language);

      return {
        agentType: AgentType.KNOWLEDGE,
        success: true,
        data: ragContext,
        executionTime: Date.now() - startTime,
        confidence: ragContext.confidenceScore
      };

    } catch (error) {
      return {
        agentType: AgentType.KNOWLEDGE,
        success: false,
        error: error.message,
        executionTime: Date.now() - startTime,
        confidence: 0
      };
    }
  }

  /**
   * Explanation Agent: Generate AI-powered explanation
   */
  private async executeExplanationAgent(
    request: ComprehensiveAnalysisRequest,
    complexity: ComplexityMetrics,
    ragContext: RAGContext
  ): Promise<AgentResult> {
    const startTime = Date.now();
    
    try {
      const aiRequest: AIAnalysisRequest = {
        code: request.code,
        language: request.language,
        userSkillLevel: request.userSkillLevel,
        context: ragContext.synthesizedContext,
        previousAnalysis: complexity
      };

      const explanation = await this.bedrockService.generateExplanation(aiRequest);

      return {
        agentType: AgentType.EXPLANATION,
        success: true,
        data: explanation,
        executionTime: Date.now() - startTime,
        confidence: explanation.confidenceScore
      };

    } catch (error) {
      return {
        agentType: AgentType.EXPLANATION,
        success: false,
        error: error.message,
        executionTime: Date.now() - startTime,
        confidence: 0
      };
    }
  }

  /**
   * Metaphor Agent: Generate metaphorical explanations
   */
  private async executeMetaphorAgent(
    request: ComprehensiveAnalysisRequest,
    complexity: ComplexityMetrics
  ): Promise<AgentResult> {
    const startTime = Date.now();
    
    try {
      const metaphorCard = this.metaphorGenerator.createMetaphorCard(
        request.code,
        request.language,
        request.filePath || 'unknown',
        complexity
      );

      return {
        agentType: AgentType.METAPHOR,
        success: true,
        data: metaphorCard,
        executionTime: Date.now() - startTime,
        confidence: 0.85
      };

    } catch (error) {
      return {
        agentType: AgentType.METAPHOR,
        success: false,
        error: error.message,
        executionTime: Date.now() - startTime,
        confidence: 0
      };
    }
  }

  /**
   * Learning Agent: Generate personalized learning recommendations
   */
  private async executeLearningAgent(
    request: ComprehensiveAnalysisRequest,
    complexity: ComplexityMetrics
  ): Promise<AgentResult> {
    const startTime = Date.now();
    
    try {
      const learningPath = this.generateLearningPath(request, complexity);

      return {
        agentType: AgentType.LEARNING,
        success: true,
        data: learningPath,
        executionTime: Date.now() - startTime,
        confidence: 0.8
      };

    } catch (error) {
      return {
        agentType: AgentType.LEARNING,
        success: false,
        error: error.message,
        executionTime: Date.now() - startTime,
        confidence: 0
      };
    }
  }

  /**
   * Generate personalized learning path
   */
  private generateLearningPath(request: ComprehensiveAnalysisRequest, complexity: ComplexityMetrics) {
    const skillLevel = request.userSkillLevel;
    const codeComplexity = complexity.complexity;

    let nextConcepts: string[] = [];
    let practiceExercises: string[] = [];
    let estimatedTime = '';

    // Determine next learning steps based on skill level and code complexity
    if (skillLevel <= 3) {
      nextConcepts = ['Basic syntax', 'Variables and functions', 'Control structures'];
      practiceExercises = ['Write simple functions', 'Practice if/else statements', 'Create basic loops'];
      estimatedTime = '2-4 weeks';
    } else if (skillLevel <= 6) {
      nextConcepts = ['Object-oriented programming', 'Async programming', 'Error handling'];
      practiceExercises = ['Build a class hierarchy', 'Practice Promise patterns', 'Implement try/catch blocks'];
      estimatedTime = '4-6 weeks';
    } else {
      nextConcepts = ['Design patterns', 'Performance optimization', 'Architecture principles'];
      practiceExercises = ['Implement common patterns', 'Profile and optimize code', 'Design system architecture'];
      estimatedTime = '6-8 weeks';
    }

    // Adjust based on code complexity
    if (codeComplexity === 'high' && skillLevel < 7) {
      nextConcepts.unshift('Code refactoring', 'Complexity reduction techniques');
      practiceExercises.unshift('Simplify complex functions', 'Extract reusable components');
    }

    return {
      currentLevel: skillLevel,
      nextConcepts,
      practiceExercises,
      estimatedTimeToMaster: estimatedTime
    };
  }

  /**
   * Calculate overall confidence from agent results
   */
  private calculateOverallConfidence(results: AgentResult[]): number {
    const successfulResults = results.filter(r => r.success);
    if (successfulResults.length === 0) return 0;

    const avgConfidence = successfulResults.reduce((sum, r) => sum + r.confidence, 0) / successfulResults.length;
    const successRate = successfulResults.length / results.length;

    return avgConfidence * successRate;
  }

  /**
   * Get default explanation when AI fails
   */
  private getDefaultExplanation(): AIExplanationResponse {
    return {
      bedrockInsight: 'AI analysis temporarily unavailable',
      metaphor: 'Code analysis is like examining a recipe - we look at ingredients and steps',
      learningPath: ['Review code structure', 'Understand data flow', 'Practice similar patterns'],
      confidenceScore: 0.3,
      processingTime: 0
    };
  }

  /**
   * Get default metaphor when generation fails
   */
  private getDefaultMetaphor(request: ComprehensiveAnalysisRequest): MetaphorCardData {
    return {
      codeSnippet: request.code,
      language: request.language,
      filePath: request.filePath || 'unknown',
      complexity: {
        cyclomaticComplexity: 1,
        dependencyDepth: 0,
        linesOfCode: request.code.split('\n').length,
        cognitiveLoad: 2,
        skillAdjustedLoad: 2,
        complexity: 'medium',
        score: 40,
        verdict: 'Medium Load 🟨',
        suggestion: 'Consider Bridge Explanation for clarity'
      },
      metaphor: {
        title: 'Code Structure',
        description: 'This code follows a structured approach to solve a problem.',
        analogy: 'Like following a recipe to cook a meal - each step builds on the previous one.',
        keyPoints: ['Sequential execution', 'Clear structure', 'Logical flow'],
        difficultyLevel: 5
      },
      userSkillLevel: request.userSkillLevel,
      analyzedAt: new Date().toISOString()
    };
  }

  /**
   * Get default learning path
   */
  private getDefaultLearningPath(skillLevel: number) {
    return {
      currentLevel: skillLevel,
      nextConcepts: ['Code reading', 'Pattern recognition', 'Best practices'],
      practiceExercises: ['Read similar code', 'Identify patterns', 'Apply conventions'],
      estimatedTimeToMaster: '2-3 weeks'
    };
  }

  /**
   * Get fallback response when orchestration fails
   */
  private getFallbackResponse(
    request: ComprehensiveAnalysisRequest,
    processingTime: number,
    agentResults: AgentResult[]
  ): ComprehensiveAnalysisResponse {
    return {
      complexity: {
        cyclomaticComplexity: 1,
        dependencyDepth: 0,
        linesOfCode: request.code.split('\n').length,
        cognitiveLoad: 3,
        skillAdjustedLoad: 3,
        complexity: 'medium',
        score: 50,
        verdict: 'Medium Load 🟨',
        suggestion: 'Analysis temporarily unavailable'
      },
      bedrockAnalysis: this.getDefaultExplanation(),
      ragContext: {
        originalQuery: request.code,
        retrievedKnowledge: [],
        synthesizedContext: 'Context retrieval failed',
        confidenceScore: 0,
        sources: []
      },
      metaphorCard: this.getDefaultMetaphor(request),
      learningPath: this.getDefaultLearningPath(request.userSkillLevel),
      processingTime,
      agentResults,
      overallConfidence: 0.2
    };
  }

  /**
   * Get system status and performance metrics
   */
  getSystemStatus(): {
    activeAgents: number;
    ragStats: any;
    bedrockAvailable: boolean;
    averageResponseTime: number;
  } {
    return {
      activeAgents: this.activeAgents.size,
      ragStats: this.ragSystem.getStats(),
      bedrockAvailable: true, // Would check actual Bedrock connectivity
      averageResponseTime: 850 // Would track actual metrics
    };
  }
}

/**
 * Factory function to create orchestrator with all dependencies
 */
export async function createAgentOrchestrator(region: string = 'us-east-1'): Promise<AgentOrchestrator> {
  const { createBedrockAIService } = await import('./bedrock-integration');
  const { createRAGSystem } = await import('./rag-system');

  const bedrockService = createBedrockAIService(region);
  const ragSystem = createRAGSystem(bedrockService);

  return new AgentOrchestrator(bedrockService, ragSystem);
}