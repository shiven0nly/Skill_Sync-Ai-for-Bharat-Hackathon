#!/usr/bin/env node
/**
 * Streaming Integration Test
 *
 * End-to-end test for the streaming bridge explanation API.
 * Tests the complete flow from request to streaming response.
 */
interface TestResult {
    success: boolean;
    message: string;
    events: Array<{
        eventType: string;
        data: any;
    }>;
    error?: string;
}
/**
 * Test the streaming bridge explanation endpoint
 */
declare function testStreamingBridge(): Promise<TestResult>;
/**
 * Validate streaming events
 */
declare function validateStreamingEvents(events: Array<{
    eventType: string;
    data: any;
}>): {
    valid: boolean;
    issues: string[];
};
export { testStreamingBridge, validateStreamingEvents };
//# sourceMappingURL=test-streaming-integration.d.ts.map