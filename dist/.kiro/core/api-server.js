/**
 * API Server Module
 *
 * Provides HTTP API endpoints for the Skill-Sync complexity analyzer.
 * Main endpoint: POST /analyze - Returns a JSON complexity map of a repository.
 */
import * as http from 'http';
import * as url from 'url';
import { analyzeRepository } from './repository-analyzer.js';
import { generateRepositoryBridgeExplanation, generateFileBridgeExplanation } from './bridge-prompt.js';
/**
 * API Server class
 */
export class SkillSyncApiServer {
    constructor(port = 3000) {
        this.port = port;
        this.server = http.createServer(this.handleRequest.bind(this));
    }
    /**
     * Start the API server
     */
    async start() {
        return new Promise((resolve, reject) => {
            this.server.listen(this.port, (error) => {
                if (error) {
                    reject(error);
                }
                else {
                    console.log(`Skill-Sync API server running on port ${this.port}`);
                    console.log(`Available endpoints:`);
                    console.log(`  POST /analyze - Analyze repository complexity`);
                    console.log(`  POST /bridge - Generate bridge explanations`);
                    console.log(`  POST /bridge (streaming=true) - Generate streaming bridge explanations`);
                    console.log(`  POST /bridge/stream - Generate streaming bridge explanations (legacy)`);
                    console.log(`  GET /health - Health check`);
                    resolve();
                }
            });
        });
    }
    /**
     * Stop the API server
     */
    async stop() {
        return new Promise((resolve) => {
            this.server.close(() => {
                console.log('Skill-Sync API server stopped');
                resolve();
            });
        });
    }
    /**
     * Handle incoming HTTP requests
     */
    async handleRequest(req, res) {
        // Set CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        // Handle preflight requests
        if (req.method === 'OPTIONS') {
            res.writeHead(200);
            res.end();
            return;
        }
        try {
            const parsedUrl = url.parse(req.url || '', true);
            const pathname = parsedUrl.pathname || '';
            // Route requests
            switch (pathname) {
                case '/analyze':
                    await this.handleAnalyze(req, res);
                    break;
                case '/bridge':
                    await this.handleBridge(req, res);
                    break;
                case '/bridge/stream':
                    // Handle streaming bridge requests (legacy endpoint)
                    const body = await this.parseRequestBody(req);
                    const bridgeRequest = JSON.parse(body);
                    bridgeRequest.streaming = true;
                    await this.handleBridge(req, res);
                    break;
                case '/health':
                    await this.handleHealth(req, res);
                    break;
                default:
                    this.sendResponse(res, 404, {
                        success: false,
                        error: 'Endpoint not found',
                        timestamp: new Date().toISOString()
                    });
            }
        }
        catch (error) {
            console.error('Request handling error:', error);
            this.sendResponse(res, 500, {
                success: false,
                error: 'Internal server error',
                timestamp: new Date().toISOString()
            });
        }
    }
    /**
     * Handle repository analysis requests
     */
    async handleAnalyze(req, res) {
        if (req.method !== 'POST') {
            this.sendResponse(res, 405, {
                success: false,
                error: 'Method not allowed. Use POST.',
                timestamp: new Date().toISOString()
            });
            return;
        }
        try {
            // Parse request body
            const body = await this.parseRequestBody(req);
            const analyzeRequest = JSON.parse(body);
            // Validate request
            const validationError = this.validateAnalyzeRequest(analyzeRequest);
            if (validationError) {
                this.sendResponse(res, 400, {
                    success: false,
                    error: validationError,
                    timestamp: new Date().toISOString()
                });
                return;
            }
            // Prepare analysis options
            const options = {
                skillLevel: analyzeRequest.skillLevel,
                excludePatterns: analyzeRequest.excludePatterns,
                includePatterns: analyzeRequest.includePatterns,
                maxFiles: analyzeRequest.maxFiles
            };
            console.log(`Starting analysis of repository: ${analyzeRequest.repositoryPath}`);
            console.log(`Skill level: ${analyzeRequest.skillLevel}`);
            // Perform repository analysis
            const complexityMap = await analyzeRepository(analyzeRequest.repositoryPath, options);
            console.log(`Analysis complete. Analyzed ${complexityMap.analyzedFiles} files.`);
            // Send successful response
            this.sendResponse(res, 200, {
                success: true,
                data: complexityMap,
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            console.error('Analysis error:', error);
            this.sendResponse(res, 500, {
                success: false,
                error: error instanceof Error ? error.message : 'Analysis failed',
                timestamp: new Date().toISOString()
            });
        }
    }
    /**
     * Handle bridge explanation requests
     */
    async handleBridge(req, res) {
        if (req.method !== 'POST') {
            this.sendResponse(res, 405, {
                success: false,
                error: 'Method not allowed. Use POST.',
                timestamp: new Date().toISOString()
            });
            return;
        }
        try {
            // Parse request body
            const body = await this.parseRequestBody(req);
            const bridgeRequest = JSON.parse(body);
            // Validate request
            const validationError = this.validateBridgeRequest(bridgeRequest);
            if (validationError) {
                this.sendResponse(res, 400, {
                    success: false,
                    error: validationError,
                    timestamp: new Date().toISOString()
                });
                return;
            }
            // Check if streaming is requested
            if (bridgeRequest.streaming) {
                await this.handleStreamingBridge(req, res, bridgeRequest);
                return;
            }
            // Prepare analysis options
            const options = {
                skillLevel: bridgeRequest.skillLevel,
                excludePatterns: bridgeRequest.excludePatterns,
                includePatterns: bridgeRequest.includePatterns,
                maxFiles: bridgeRequest.maxFiles
            };
            console.log(`Starting bridge analysis of repository: ${bridgeRequest.repositoryPath}`);
            console.log(`Skill level: ${bridgeRequest.skillLevel}`);
            if (bridgeRequest.targetFile) {
                console.log(`Target file: ${bridgeRequest.targetFile}`);
            }
            // First, perform repository analysis
            const complexityMap = await analyzeRepository(bridgeRequest.repositoryPath, options);
            let bridgeResult;
            if (bridgeRequest.targetFile) {
                // Generate explanation for specific file
                const targetFileResult = complexityMap.files.find(file => file.filePath === bridgeRequest.targetFile ||
                    file.filePath.endsWith(bridgeRequest.targetFile));
                if (!targetFileResult) {
                    this.sendResponse(res, 404, {
                        success: false,
                        error: `Target file not found: ${bridgeRequest.targetFile}`,
                        timestamp: new Date().toISOString()
                    });
                    return;
                }
                bridgeResult = generateFileBridgeExplanation(targetFileResult, bridgeRequest.skillLevel);
            }
            else {
                // Generate explanation for entire repository
                bridgeResult = generateRepositoryBridgeExplanation(complexityMap, bridgeRequest.skillLevel);
            }
            console.log(`Bridge analysis complete.`);
            // Send successful response
            this.sendResponse(res, 200, {
                success: true,
                data: bridgeResult,
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            console.error('Bridge analysis error:', error);
            this.sendResponse(res, 500, {
                success: false,
                error: error instanceof Error ? error.message : 'Bridge analysis failed',
                timestamp: new Date().toISOString()
            });
        }
    }
    /**
     * Handle streaming bridge explanation requests using Server-Sent Events
     */
    async handleStreamingBridge(req, res, bridgeRequest) {
        // Set up Server-Sent Events headers
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Cache-Control'
        });
        // Helper function to send SSE data
        const sendEvent = (eventType, data) => {
            res.write(`event: ${eventType}\n`);
            res.write(`data: ${JSON.stringify(data)}\n\n`);
        };
        // Helper function to send progress updates
        const sendProgress = (stage, progress, message) => {
            sendEvent('progress', {
                stage,
                progress,
                message,
                timestamp: new Date().toISOString()
            });
        };
        try {
            // Send initial connection event
            sendEvent('connected', {
                message: 'Connected to streaming bridge analysis',
                timestamp: new Date().toISOString()
            });
            // Prepare analysis options
            const options = {
                skillLevel: bridgeRequest.skillLevel,
                excludePatterns: bridgeRequest.excludePatterns,
                includePatterns: bridgeRequest.includePatterns,
                maxFiles: bridgeRequest.maxFiles
            };
            console.log(`Starting streaming bridge analysis of repository: ${bridgeRequest.repositoryPath}`);
            console.log(`Skill level: ${bridgeRequest.skillLevel}`);
            if (bridgeRequest.targetFile) {
                console.log(`Target file: ${bridgeRequest.targetFile}`);
            }
            // Stage 1: Repository Analysis
            sendProgress('analysis', 10, 'Starting repository analysis...');
            const complexityMap = await analyzeRepository(bridgeRequest.repositoryPath, options);
            sendProgress('analysis', 50, `Analyzed ${complexityMap.analyzedFiles} files`);
            // Stage 2: Generate Bridge Explanations
            sendProgress('explanation', 60, 'Generating bridge explanations...');
            if (bridgeRequest.targetFile) {
                // Generate explanation for specific file
                const targetFileResult = complexityMap.files.find(file => file.filePath === bridgeRequest.targetFile ||
                    file.filePath.endsWith(bridgeRequest.targetFile));
                if (!targetFileResult) {
                    sendEvent('error', {
                        error: `Target file not found: ${bridgeRequest.targetFile}`,
                        timestamp: new Date().toISOString()
                    });
                    res.end();
                    return;
                }
                sendProgress('explanation', 70, `Analyzing file: ${targetFileResult.filePath}`);
                // Stream the explanation generation process
                const bridgeResult = await this.generateStreamingFileBridgeExplanation(targetFileResult, bridgeRequest.skillLevel, sendEvent, sendProgress);
                sendProgress('explanation', 100, 'File explanation complete');
                // Send final result
                sendEvent('result', {
                    type: 'file',
                    data: bridgeResult,
                    timestamp: new Date().toISOString()
                });
            }
            else {
                // Generate explanation for entire repository
                sendProgress('explanation', 70, 'Generating repository overview...');
                const bridgeResult = await this.generateStreamingRepositoryBridgeExplanation(complexityMap, bridgeRequest.skillLevel, sendEvent, sendProgress);
                sendProgress('explanation', 100, 'Repository explanation complete');
                // Send final result
                sendEvent('result', {
                    type: 'repository',
                    data: bridgeResult,
                    timestamp: new Date().toISOString()
                });
            }
            console.log(`Streaming bridge analysis complete.`);
            // Send completion event
            sendEvent('complete', {
                message: 'Bridge analysis completed successfully',
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            console.error('Streaming bridge analysis error:', error);
            sendEvent('error', {
                error: error instanceof Error ? error.message : 'Streaming bridge analysis failed',
                timestamp: new Date().toISOString()
            });
        }
        finally {
            // Close the connection
            res.end();
        }
    }
    /**
     * Generate streaming file bridge explanation with progress updates
     */
    async generateStreamingFileBridgeExplanation(fileResult, skillLevel, sendEvent, sendProgress) {
        const { filePath, language, complexity } = fileResult;
        sendProgress('explanation', 75, 'Calculating cognitive load...');
        const cognitiveLoad = complexity.cognitiveLoad;
        sendProgress('explanation', 80, 'Generating overview...');
        const overview = this.generateOverviewWithDelay(filePath, language, cognitiveLoad, skillLevel);
        sendProgress('explanation', 85, 'Mapping mental models...');
        const mentalModels = this.getMentalModelsForSkillLevelWithDelay(language, skillLevel);
        sendProgress('explanation', 90, 'Creating metaphor...');
        const metaphor = this.generateMetaphorWithDelay(cognitiveLoad, skillLevel);
        sendProgress('explanation', 95, 'Analyzing complexity...');
        const complexityExplanation = this.generateComplexityExplanationWithDelay(complexity, skillLevel);
        // Stream partial results as they become available
        sendEvent('partial', {
            section: 'overview',
            data: await overview,
            timestamp: new Date().toISOString()
        });
        sendEvent('partial', {
            section: 'mentalModels',
            data: await mentalModels,
            timestamp: new Date().toISOString()
        });
        sendEvent('partial', {
            section: 'metaphor',
            data: await metaphor,
            timestamp: new Date().toISOString()
        });
        sendEvent('partial', {
            section: 'complexity',
            data: await complexityExplanation,
            timestamp: new Date().toISOString()
        });
        return {
            filePath,
            language,
            cognitiveLoad,
            skillLevel,
            explanation: {
                overview: await overview,
                mentalModels: await mentalModels,
                metaphor: await metaphor,
                complexity: await complexityExplanation
            }
        };
    }
    /**
     * Generate streaming repository bridge explanation with progress updates
     */
    async generateStreamingRepositoryBridgeExplanation(repositoryMap, skillLevel, sendEvent, sendProgress) {
        const { repositoryPath, files } = repositoryMap;
        sendProgress('explanation', 75, 'Generating repository overview...');
        const overview = this.generateRepositoryOverviewWithDelay(repositoryMap, skillLevel);
        sendProgress('explanation', 80, 'Identifying complexity hotspots...');
        const hotspotFiles = files
            .filter(file => file.complexity.cognitiveLoad > 2)
            .sort((a, b) => b.complexity.cognitiveLoad - a.complexity.cognitiveLoad)
            .slice(0, 5);
        sendProgress('explanation', 85, `Analyzing ${hotspotFiles.length} hotspot files...`);
        const hotspots = [];
        for (let i = 0; i < hotspotFiles.length; i++) {
            const file = hotspotFiles[i];
            const progress = 85 + (i / hotspotFiles.length) * 10;
            sendProgress('explanation', progress, `Analyzing hotspot: ${file.filePath}`);
            const hotspot = await this.generateStreamingFileBridgeExplanation(file, skillLevel, sendEvent, () => { } // Don't send nested progress updates
            );
            hotspots.push(hotspot);
            // Stream hotspot as it becomes available
            sendEvent('hotspot', {
                index: i,
                total: hotspotFiles.length,
                data: hotspot,
                timestamp: new Date().toISOString()
            });
        }
        sendProgress('explanation', 95, 'Generating recommendations...');
        const recommendations = this.generateRecommendationsWithDelay(repositoryMap, skillLevel);
        const learningPath = this.generateLearningPathWithDelay(repositoryMap, skillLevel);
        // Stream final sections
        sendEvent('partial', {
            section: 'overview',
            data: await overview,
            timestamp: new Date().toISOString()
        });
        sendEvent('partial', {
            section: 'recommendations',
            data: await recommendations,
            timestamp: new Date().toISOString()
        });
        sendEvent('partial', {
            section: 'learningPath',
            data: await learningPath,
            timestamp: new Date().toISOString()
        });
        return {
            repositoryPath,
            skillLevel,
            overview: await overview,
            hotspots,
            recommendations: await recommendations,
            learningPath: await learningPath
        };
    }
    // Helper methods with artificial delays to simulate streaming
    async generateOverviewWithDelay(filePath, language, cognitiveLoad, skillLevel) {
        await this.delay(100);
        return generateFileBridgeExplanation({ filePath, language, complexity: { cognitiveLoad } }, skillLevel).explanation.overview;
    }
    async getMentalModelsForSkillLevelWithDelay(language, skillLevel) {
        await this.delay(150);
        return generateFileBridgeExplanation({ filePath: '', language, complexity: { cognitiveLoad: 1 } }, skillLevel).explanation.mentalModels;
    }
    async generateMetaphorWithDelay(cognitiveLoad, skillLevel) {
        await this.delay(200);
        return generateFileBridgeExplanation({ filePath: '', language: 'javascript', complexity: { cognitiveLoad } }, skillLevel).explanation.metaphor;
    }
    async generateComplexityExplanationWithDelay(complexity, skillLevel) {
        await this.delay(100);
        return generateFileBridgeExplanation({ filePath: '', language: 'javascript', complexity }, skillLevel).explanation.complexity;
    }
    async generateRepositoryOverviewWithDelay(repositoryMap, skillLevel) {
        await this.delay(200);
        return generateRepositoryBridgeExplanation(repositoryMap, skillLevel).overview;
    }
    async generateRecommendationsWithDelay(repositoryMap, skillLevel) {
        await this.delay(150);
        return generateRepositoryBridgeExplanation(repositoryMap, skillLevel).recommendations;
    }
    async generateLearningPathWithDelay(repositoryMap, skillLevel) {
        await this.delay(100);
        return generateRepositoryBridgeExplanation(repositoryMap, skillLevel).learningPath;
    }
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    async handleHealth(req, res) {
        if (req.method !== 'GET') {
            this.sendResponse(res, 405, {
                success: false,
                error: 'Method not allowed. Use GET.',
                timestamp: new Date().toISOString()
            });
            return;
        }
        this.sendResponse(res, 200, {
            success: true,
            data: {
                status: 'healthy',
                service: 'Skill-Sync API',
                version: '1.0.0'
            },
            timestamp: new Date().toISOString()
        });
    }
    /**
     * Parse request body from stream
     */
    async parseRequestBody(req) {
        return new Promise((resolve, reject) => {
            let body = '';
            req.on('data', (chunk) => {
                body += chunk.toString();
            });
            req.on('end', () => {
                resolve(body);
            });
            req.on('error', (error) => {
                reject(error);
            });
        });
    }
    /**
     * Validate analyze request parameters
     */
    validateAnalyzeRequest(request) {
        if (!request.repositoryPath) {
            return 'repositoryPath is required';
        }
        if (typeof request.repositoryPath !== 'string') {
            return 'repositoryPath must be a string';
        }
        if (!request.skillLevel) {
            return 'skillLevel is required';
        }
        if (typeof request.skillLevel !== 'number' || request.skillLevel < 1 || request.skillLevel > 10) {
            return 'skillLevel must be a number between 1 and 10';
        }
        if (request.excludePatterns && !Array.isArray(request.excludePatterns)) {
            return 'excludePatterns must be an array of strings';
        }
        if (request.includePatterns && !Array.isArray(request.includePatterns)) {
            return 'includePatterns must be an array of strings';
        }
        if (request.maxFiles && (typeof request.maxFiles !== 'number' || request.maxFiles < 1)) {
            return 'maxFiles must be a positive number';
        }
        return null;
    }
    /**
     * Validate bridge request parameters
     */
    validateBridgeRequest(request) {
        if (!request.repositoryPath) {
            return 'repositoryPath is required';
        }
        if (typeof request.repositoryPath !== 'string') {
            return 'repositoryPath must be a string';
        }
        if (!request.skillLevel) {
            return 'skillLevel is required';
        }
        if (typeof request.skillLevel !== 'number' || request.skillLevel < 1 || request.skillLevel > 10) {
            return 'skillLevel must be a number between 1 and 10';
        }
        if (request.targetFile && typeof request.targetFile !== 'string') {
            return 'targetFile must be a string';
        }
        if (request.excludePatterns && !Array.isArray(request.excludePatterns)) {
            return 'excludePatterns must be an array of strings';
        }
        if (request.includePatterns && !Array.isArray(request.includePatterns)) {
            return 'includePatterns must be an array of strings';
        }
        if (request.maxFiles && (typeof request.maxFiles !== 'number' || request.maxFiles < 1)) {
            return 'maxFiles must be a positive number';
        }
        return null;
    }
    sendResponse(res, statusCode, data) {
        res.writeHead(statusCode, {
            'Content-Type': 'application/json'
        });
        res.end(JSON.stringify(data, null, 2));
    }
}
/**
 * Create and start the API server
 */
export async function startApiServer(port = 3000) {
    const server = new SkillSyncApiServer(port);
    await server.start();
    return server;
}
/**
 * Example usage and CLI entry point
 */
if (require.main === module) {
    const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
    startApiServer(port).catch((error) => {
        console.error('Failed to start API server:', error);
        process.exit(1);
    });
    // Graceful shutdown
    process.on('SIGINT', async () => {
        console.log('\nReceived SIGINT, shutting down gracefully...');
        process.exit(0);
    });
    process.on('SIGTERM', async () => {
        console.log('\nReceived SIGTERM, shutting down gracefully...');
        process.exit(0);
    });
}
//# sourceMappingURL=api-server.js.map