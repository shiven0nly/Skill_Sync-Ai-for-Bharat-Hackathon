/**
 * API Server Module
 *
 * Provides HTTP API endpoints for the Skill-Sync complexity analyzer.
 * Main endpoint: POST /analyze - Returns a JSON complexity map of a repository.
 */
/**
 * API Server class
 */
export declare class SkillSyncApiServer {
    private server;
    private port;
    constructor(port?: number);
    /**
     * Start the API server
     */
    start(): Promise<void>;
    /**
     * Stop the API server
     */
    stop(): Promise<void>;
    /**
     * Handle incoming HTTP requests
     */
    private handleRequest;
    /**
     * Handle repository analysis requests
     */
    private handleAnalyze;
    /**
     * Handle bridge explanation requests
     */
    private handleBridge;
    /**
     * Handle streaming bridge explanation requests using Server-Sent Events
     */
    private handleStreamingBridge;
    /**
     * Generate streaming file bridge explanation with progress updates
     */
    private generateStreamingFileBridgeExplanation;
    /**
     * Generate streaming repository bridge explanation with progress updates
     */
    private generateStreamingRepositoryBridgeExplanation;
    private generateOverviewWithDelay;
    private getMentalModelsForSkillLevelWithDelay;
    private generateMetaphorWithDelay;
    private generateComplexityExplanationWithDelay;
    private generateRepositoryOverviewWithDelay;
    private generateRecommendationsWithDelay;
    private generateLearningPathWithDelay;
    private delay;
    private handleHealth;
    /**
     * Parse request body from stream
     */
    private parseRequestBody;
    /**
     * Validate analyze request parameters
     */
    private validateAnalyzeRequest;
    /**
     * Validate bridge request parameters
     */
    private validateBridgeRequest;
    private sendResponse;
}
/**
 * Create and start the API server
 */
export declare function startApiServer(port?: number): Promise<SkillSyncApiServer>;
//# sourceMappingURL=api-server.d.ts.map