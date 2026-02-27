/**
 * Amazon Bedrock Integration Module
 * 
 * Provides seamless integration with Amazon Bedrock foundation models
 * for advanced AI-powered code analysis and explanation generation.
 */

import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
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
export class BedrockAIService {
  private client: BedrockRuntimeClient;
  private config: BedrockConfig;

  constructor(config: BedrockConfig) {
    this.config = config;
    this.client = new BedrockRuntimeClient({ 
      region: config.region,
      // Credentials will be automatically loaded from environment or IAM role
    });
  }

  /**
   * Generate AI-powered code explanation using Claude 3.5 Sonnet
   */
  async generateExplanation(request: AIAnalysisRequest): Promise<AIExplanationResponse> {
    const startTime = Date.now();

    try {
      const prompt = this.buildAnalysisPrompt(request);
      
      const command = new InvokeModelCommand({
        modelId: this.config.modelId,
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify({
          anthropic_version: 'bedrock-2023-05-31',
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        })
      });

      const response = await this.client.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      
      const explanation = this.parseAIResponse(responseBody.content[0].text);
      
      return {
        ...explanation,
        processingTime: Date.now() - startTime
      };

    } catch (error) {
      console.error('Bedrock AI analysis failed:', error);
      throw new Error(`AI analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Build comprehensive analysis prompt for Claude
   */
  private buildAnalysisPrompt(request: AIAnalysisRequest): string {
    return `
You are an expert AI code analyst powered by Amazon Bedrock. Analyze the following ${request.language} code and provide insights tailored to a developer with skill level ${request.userSkillLevel}/10.

CODE TO ANALYZE:
\`\`\`${request.language}
${request.code}
\`\`\`

${request.context ? `ADDITIONAL CONTEXT: ${request.context}` : ''}

${request.previousAnalysis ? `COMPLEXITY METRICS: 
- Cyclomatic Complexity: ${request.previousAnalysis.cyclomaticComplexity}
- Cognitive Load: ${request.previousAnalysis.cognitiveLoad}
- Lines of Code: ${request.previousAnalysis.linesOfCode}
- Complexity Level: ${request.previousAnalysis.complexity}` : ''}

Please provide your analysis in the following JSON format:
{
  "bedrockInsight": "Technical analysis of the code structure, patterns, and complexity",
  "metaphor": "Real-world analogy that explains the code concept simply",
  "learningPath": ["concept1", "concept2", "concept3"],
  "confidenceScore": 0.95
}

Guidelines:
- Adjust explanation complexity based on skill level (${request.userSkillLevel}/10)
- Use clear, educational language
- Provide actionable learning recommendations
- Include confidence score (0-1) for your analysis accuracy
- Focus on practical understanding over theoretical concepts
`;
  }

  /**
   * Parse and validate AI response
   */
  private parseAIResponse(responseText: string): Omit<AIExplanationResponse, 'processingTime'> {
    try {
      // Extract JSON from response (Claude sometimes adds extra text)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in AI response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      return {
        bedrockInsight: parsed.bedrockInsight || 'AI analysis unavailable',
        metaphor: parsed.metaphor || 'No metaphor generated',
        learningPath: Array.isArray(parsed.learningPath) ? parsed.learningPath : [],
        confidenceScore: typeof parsed.confidenceScore === 'number' ? parsed.confidenceScore : 0.5
      };

    } catch (error) {
      console.warn('Failed to parse AI response:', error);
      return {
        bedrockInsight: 'AI analysis parsing failed',
        metaphor: 'Unable to generate metaphor',
        learningPath: [],
        confidenceScore: 0.1
      };
    }
  }

  /**
   * Generate embeddings for RAG system using Titan
   */
  async generateEmbeddings(text: string): Promise<number[]> {
    try {
      const command = new InvokeModelCommand({
        modelId: 'amazon.titan-embed-text-v1',
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify({
          inputText: text
        })
      });

      const response = await this.client.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      
      return responseBody.embedding;

    } catch (error) {
      console.error('Embedding generation failed:', error);
      throw new Error(`Embedding generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Batch process multiple code snippets
   */
  async batchAnalyze(requests: AIAnalysisRequest[]): Promise<AIExplanationResponse[]> {
    const results = await Promise.allSettled(
      requests.map(request => this.generateExplanation(request))
    );

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        console.error(`Batch analysis failed for request ${index}:`, result.reason);
        return {
          bedrockInsight: 'Batch analysis failed',
          metaphor: 'Analysis unavailable',
          learningPath: [],
          confidenceScore: 0,
          processingTime: 0
        };
      }
    });
  }
}

/**
 * Factory function to create Bedrock AI service with default configuration
 */
export function createBedrockAIService(region: string = 'us-east-1'): BedrockAIService {
  const config: BedrockConfig = {
    region,
    modelId: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
    maxTokens: 4000,
    temperature: 0.3
  };

  return new BedrockAIService(config);
}

/**
 * Utility functions for common AI operations
 */
export const BedrockUtils = {
  /**
   * Check if Bedrock is available in the current environment
   */
  async isAvailable(): Promise<boolean> {
    try {
      const service = createBedrockAIService();
      // Try a simple embedding generation to test connectivity
      await service.generateEmbeddings('test');
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Get available Bedrock models for the region
   */
  getSupportedModels(): string[] {
    return [
      'anthropic.claude-3-5-sonnet-20241022-v2:0',
      'anthropic.claude-3-haiku-20240307-v1:0',
      'amazon.titan-embed-text-v1',
      'ai21.j2-ultra-v1',
      'cohere.command-text-v14'
    ];
  },

  /**
   * Estimate cost for AI analysis
   */
  estimateCost(inputTokens: number, outputTokens: number, modelId: string): number {
    // Simplified cost estimation (actual costs vary by model and region)
    const costs: Record<string, { input: number; output: number }> = {
      'anthropic.claude-3-5-sonnet-20241022-v2:0': { input: 0.003, output: 0.015 },
      'anthropic.claude-3-haiku-20240307-v1:0': { input: 0.00025, output: 0.00125 },
      'amazon.titan-embed-text-v1': { input: 0.0001, output: 0 }
    };

    const modelCost = costs[modelId] || costs['anthropic.claude-3-haiku-20240307-v1:0'];
    return (inputTokens * modelCost.input + outputTokens * modelCost.output) / 1000;
  }
};