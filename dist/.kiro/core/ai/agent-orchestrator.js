/**
 * Multi-Agent Orchestrator
 *
 * Coordinates multiple AI agents to provide comprehensive code analysis
 * and explanation generation using Amazon Bedrock and RAG systems.
 */
import { calculateComplexity } from '../analysis/complexityAnalyzer';
import { MetaphorCardGenerator } from '../ui/MetaphorCard';
/**
 * Agent types in the system
 */
export var AgentType;
(function (AgentType) {
    AgentType["ORCHESTRATOR"] = "orchestrator";
    AgentType["ANALYSIS"] = "analysis";
    AgentType["KNOWLEDGE"] = "knowledge";
    AgentType["EXPLANATION"] = "explanation";
    AgentType["METAPHOR"] = "metaphor";
    AgentType["LEARNING"] = "learning";
})(AgentType || (AgentType = {}));
/**
 * Multi-Agent Orchestrator Implementation
 */
export class AgentOrchestrator {
    constructor(bedrockService, ragSystem) {
        this.activeAgents = new Map();
        this.bedrockService = bedrockService;
        this.ragSystem = ragSystem;
        this.metaphorGenerator = new MetaphorCardGenerator({ userSkillLevel: 5 });
    }
    /**
     * Orchestrate comprehensive AI analysis
     */
    async analyzeCode(request) {
        const startTime = Date.now();
        const agentResults = [];
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
            const complexity = analysisResult.data;
            const ragContext = knowledgeResult.data;
            // Phase 2: Dependent agents that need Phase 1 results
            const phase2Agents = await this.executePhase2(request, complexity, ragContext);
            agentResults.push(...phase2Agents);
            // Extract results from Phase 2
            const explanationResult = phase2Agents.find(r => r.agentType === AgentType.EXPLANATION);
            const metaphorResult = phase2Agents.find(r => r.agentType === AgentType.METAPHOR);
            const learningResult = phase2Agents.find(r => r.agentType === AgentType.LEARNING);
            // Compile comprehensive response
            const response = {
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
        }
        catch (error) {
            console.error('Agent orchestration failed:', error);
            // Return fallback response
            return this.getFallbackResponse(request, Date.now() - startTime, agentResults);
        }
    }
    /**
     * Execute Phase 1 agents (independent operations)
     */
    async executePhase1(request) {
        const agents = [
            this.executeAnalysisAgent(request),
            this.executeKnowledgeAgent(request)
        ];
        const results = await Promise.allSettled(agents);
        return results.map((result, index) => {
            const agentType = index === 0 ? AgentType.ANALYSIS : AgentType.KNOWLEDGE;
            if (result.status === 'fulfilled') {
                return result.value;
            }
            else {
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
    async executePhase2(request, complexity, ragContext) {
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
            }
            else {
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
    async executeAnalysisAgent(request) {
        const startTime = Date.now();
        try {
            // For now, use the legacy analyzer since Tree-sitter setup is complex
            // In production, this would use the full Tree-sitter analysis
            const mockRootNode = { type: 'program', childCount: 0 };
            const complexity = calculateComplexity(mockRootNode, request.code, request.userSkillLevel, request.language);
            return {
                agentType: AgentType.ANALYSIS,
                success: true,
                data: complexity,
                executionTime: Date.now() - startTime,
                confidence: 0.9
            };
        }
        catch (error) {
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
    async executeKnowledgeAgent(request) {
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
        }
        catch (error) {
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
    async executeExplanationAgent(request, complexity, ragContext) {
        const startTime = Date.now();
        try {
            const aiRequest = {
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
        }
        catch (error) {
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
    async executeMetaphorAgent(request, complexity) {
        const startTime = Date.now();
        try {
            const metaphorCard = this.metaphorGenerator.createMetaphorCard(request.code, request.language, request.filePath || 'unknown', complexity);
            return {
                agentType: AgentType.METAPHOR,
                success: true,
                data: metaphorCard,
                executionTime: Date.now() - startTime,
                confidence: 0.85
            };
        }
        catch (error) {
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
    async executeLearningAgent(request, complexity) {
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
        }
        catch (error) {
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
    generateLearningPath(request, complexity) {
        const skillLevel = request.userSkillLevel;
        const codeComplexity = complexity.complexity;
        let nextConcepts = [];
        let practiceExercises = [];
        let estimatedTime = '';
        // Determine next learning steps based on skill level and code complexity
        if (skillLevel <= 3) {
            nextConcepts = ['Basic syntax', 'Variables and functions', 'Control structures'];
            practiceExercises = ['Write simple functions', 'Practice if/else statements', 'Create basic loops'];
            estimatedTime = '2-4 weeks';
        }
        else if (skillLevel <= 6) {
            nextConcepts = ['Object-oriented programming', 'Async programming', 'Error handling'];
            practiceExercises = ['Build a class hierarchy', 'Practice Promise patterns', 'Implement try/catch blocks'];
            estimatedTime = '4-6 weeks';
        }
        else {
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
    calculateOverallConfidence(results) {
        const successfulResults = results.filter(r => r.success);
        if (successfulResults.length === 0)
            return 0;
        const avgConfidence = successfulResults.reduce((sum, r) => sum + r.confidence, 0) / successfulResults.length;
        const successRate = successfulResults.length / results.length;
        return avgConfidence * successRate;
    }
    /**
     * Get default explanation when AI fails
     */
    getDefaultExplanation() {
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
    getDefaultMetaphor(request) {
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
    getDefaultLearningPath(skillLevel) {
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
    getFallbackResponse(request, processingTime, agentResults) {
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
    getSystemStatus() {
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
export async function createAgentOrchestrator(region = 'us-east-1') {
    const { createBedrockAIService } = await import('./bedrock-integration');
    const { createRAGSystem } = await import('./rag-system');
    const bedrockService = createBedrockAIService(region);
    const ragSystem = createRAGSystem(bedrockService);
    return new AgentOrchestrator(bedrockService, ragSystem);
}
//# sourceMappingURL=agent-orchestrator.js.map