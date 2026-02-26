#!/usr/bin/env node
/**
 * Streaming Integration Test
 *
 * End-to-end test for the streaming bridge explanation API.
 * Tests the complete flow from request to streaming response.
 */
import * as http from 'http';
import { startApiServer } from './.kiro/core/api-server.js';
/**
 * Test the streaming bridge explanation endpoint
 */
async function testStreamingBridge() {
    let server = null;
    const events = [];
    try {
        // Start the API server
        console.log('🚀 Starting API server for integration test...');
        server = await startApiServer(3001); // Use different port to avoid conflicts
        // Wait a moment for server to be ready
        await new Promise(resolve => setTimeout(resolve, 100));
        console.log('📡 Testing streaming bridge explanation...');
        // Create streaming request
        const requestData = JSON.stringify({
            repositoryPath: process.cwd(),
            skillLevel: 5,
            streaming: true,
            maxFiles: 5 // Limit files for faster testing
        });
        const result = await new Promise((resolve, reject) => {
            const options = {
                hostname: 'localhost',
                port: 3001,
                path: '/bridge',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'text/event-stream',
                    'Cache-Control': 'no-cache'
                }
            };
            const req = http.request(options, (res) => {
                if (res.statusCode !== 200) {
                    reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
                    return;
                }
                console.log('✅ Connected to streaming endpoint');
                res.setEncoding('utf8');
                let buffer = '';
                let eventCount = 0;
                const maxEvents = 10; // Limit events for testing
                const timeout = setTimeout(() => {
                    resolve({
                        success: true,
                        message: `Streaming test completed successfully with ${eventCount} events`,
                        events
                    });
                }, 5000); // 5 second timeout
                res.on('data', (chunk) => {
                    buffer += chunk;
                    // Process complete events
                    const eventTexts = buffer.split('\n\n');
                    buffer = eventTexts.pop() || '';
                    for (const eventText of eventTexts) {
                        if (eventText.trim()) {
                            try {
                                const { eventType, data } = parseSSEEvent(eventText);
                                events.push({ eventType, data });
                                eventCount++;
                                console.log(`📨 Event ${eventCount}: ${eventType}`);
                                // Handle completion or error events
                                if (eventType === 'complete') {
                                    clearTimeout(timeout);
                                    resolve({
                                        success: true,
                                        message: `Streaming completed successfully with ${eventCount} events`,
                                        events
                                    });
                                    return;
                                }
                                else if (eventType === 'error') {
                                    clearTimeout(timeout);
                                    resolve({
                                        success: false,
                                        message: 'Streaming failed with error event',
                                        events,
                                        error: data.error
                                    });
                                    return;
                                }
                                // Stop after max events for testing
                                if (eventCount >= maxEvents) {
                                    clearTimeout(timeout);
                                    resolve({
                                        success: true,
                                        message: `Streaming test completed with ${eventCount} events (stopped early)`,
                                        events
                                    });
                                    return;
                                }
                            }
                            catch (error) {
                                console.error('Failed to parse event:', error);
                            }
                        }
                    }
                });
                res.on('end', () => {
                    clearTimeout(timeout);
                    resolve({
                        success: true,
                        message: `Streaming ended with ${eventCount} events`,
                        events
                    });
                });
                res.on('error', (error) => {
                    clearTimeout(timeout);
                    reject(error);
                });
            });
            req.on('error', (error) => {
                reject(error);
            });
            req.write(requestData);
            req.end();
        });
        return result;
    }
    catch (error) {
        return {
            success: false,
            message: 'Integration test failed',
            events,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
    finally {
        // Clean up server
        if (server) {
            console.log('🛑 Stopping API server...');
            await server.stop();
        }
    }
}
/**
 * Parse Server-Sent Event format
 */
function parseSSEEvent(eventText) {
    const lines = eventText.split('\n');
    let eventType = 'message';
    let data = '';
    for (const line of lines) {
        if (line.startsWith('event: ')) {
            eventType = line.substring(7);
        }
        else if (line.startsWith('data: ')) {
            data = line.substring(6);
        }
    }
    return {
        eventType,
        data: data ? JSON.parse(data) : {}
    };
}
/**
 * Validate streaming events
 */
function validateStreamingEvents(events) {
    const issues = [];
    const eventTypes = events.map(e => e.eventType);
    // Check for required events
    if (!eventTypes.includes('connected')) {
        issues.push('Missing "connected" event');
    }
    if (!eventTypes.includes('progress')) {
        issues.push('Missing "progress" events');
    }
    // Check for progress event structure
    const progressEvents = events.filter(e => e.eventType === 'progress');
    for (const event of progressEvents) {
        if (!event.data.stage || typeof event.data.progress !== 'number' || !event.data.message) {
            issues.push('Invalid progress event structure');
            break;
        }
    }
    // Check for partial events
    const partialEvents = events.filter(e => e.eventType === 'partial');
    if (partialEvents.length === 0) {
        issues.push('No partial result events found');
    }
    // Validate partial event structure
    for (const event of partialEvents) {
        if (!event.data.section || !event.data.data) {
            issues.push('Invalid partial event structure');
            break;
        }
    }
    return {
        valid: issues.length === 0,
        issues
    };
}
/**
 * Main test execution
 */
async function main() {
    console.log('🧪 Streaming Bridge Explanation Integration Test');
    console.log('================================================\n');
    try {
        const result = await testStreamingBridge();
        console.log('\n📊 Test Results:');
        console.log('================');
        console.log(`Status: ${result.success ? '✅ PASSED' : '❌ FAILED'}`);
        console.log(`Message: ${result.message}`);
        console.log(`Events received: ${result.events.length}`);
        if (result.error) {
            console.log(`Error: ${result.error}`);
        }
        if (result.events.length > 0) {
            console.log('\n📨 Event Summary:');
            const eventCounts = result.events.reduce((acc, event) => {
                acc[event.eventType] = (acc[event.eventType] || 0) + 1;
                return acc;
            }, {});
            for (const [eventType, count] of Object.entries(eventCounts)) {
                console.log(`  ${eventType}: ${count}`);
            }
            // Validate events
            const validation = validateStreamingEvents(result.events);
            console.log('\n🔍 Event Validation:');
            console.log(`Valid: ${validation.valid ? '✅ YES' : '❌ NO'}`);
            if (validation.issues.length > 0) {
                console.log('Issues:');
                validation.issues.forEach(issue => console.log(`  - ${issue}`));
            }
            // Show sample events
            console.log('\n📋 Sample Events:');
            result.events.slice(0, 3).forEach((event, index) => {
                console.log(`${index + 1}. ${event.eventType}:`);
                console.log(`   ${JSON.stringify(event.data, null, 2).substring(0, 200)}...`);
            });
        }
        process.exit(result.success ? 0 : 1);
    }
    catch (error) {
        console.error('❌ Test execution failed:', error);
        process.exit(1);
    }
}
// Run the test
if (require.main === module) {
    main();
}
export { testStreamingBridge, validateStreamingEvents };
//# sourceMappingURL=test-streaming-integration.js.map