#!/usr/bin/env node
/**
 * Streaming Bridge Usage Example
 *
 * Demonstrates how to consume streaming bridge explanations using Server-Sent Events.
 * This example shows both browser-compatible EventSource usage and Node.js implementation.
 */
/**
 * Node.js Server-Sent Events client implementation
 */
declare class SSEClient {
    private url;
    private onEvent;
    private onError;
    private req;
    constructor(url: string, onEvent: (eventType: string, data: any) => void, onError: (error: Error) => void);
    connect(postData: string): void;
    private parseEvent;
    disconnect(): void;
}
/**
 * Example usage of streaming bridge explanations
 */
declare function demonstrateStreamingBridge(): Promise<void>;
export { SSEClient, demonstrateStreamingBridge };
//# sourceMappingURL=streaming-bridge-usage.d.ts.map