/**
 * Example: Using the Skill-Sync API
 *
 * This example demonstrates how to use the repository complexity analysis API.
 */
import * as http from 'http';
/**
 * Example API request to analyze a repository
 */
async function analyzeRepositoryExample() {
    const requestData = {
        repositoryPath: process.cwd(), // Analyze current directory
        skillLevel: 5, // Medium skill level
        excludePatterns: ['*.test.ts', '*.spec.ts'], // Exclude test files
        maxFiles: 50 // Limit to 50 files for demo
    };
    const postData = JSON.stringify(requestData);
    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/analyze',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    resolve(response);
                }
                catch (error) {
                    reject(new Error(`Failed to parse response: ${error}`));
                }
            });
        });
        req.on('error', (error) => {
            reject(error);
        });
        req.write(postData);
        req.end();
    });
}
/**
 * Health check example
 */
async function healthCheckExample() {
    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/health',
        method: 'GET'
    };
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    resolve(response);
                }
                catch (error) {
                    reject(new Error(`Failed to parse response: ${error}`));
                }
            });
        });
        req.on('error', (error) => {
            reject(error);
        });
        req.end();
    });
}
/**
 * Main example function
 */
async function main() {
    console.log('🧠 Skill-Sync API Usage Examples');
    console.log('================================\n');
    try {
        // Health check
        console.log('1. Health Check:');
        const healthResponse = await healthCheckExample();
        console.log(JSON.stringify(healthResponse, null, 2));
        console.log('');
        // Repository analysis
        console.log('2. Repository Analysis:');
        console.log('Analyzing current directory...');
        const analysisResponse = await analyzeRepositoryExample();
        console.log(JSON.stringify(analysisResponse, null, 2));
    }
    catch (error) {
        console.error('❌ Error:', error);
        console.log('\n💡 Make sure the API server is running:');
        console.log('   npm run server');
    }
}
// Run examples if this file is executed directly
if (require.main === module) {
    main();
}
//# sourceMappingURL=api-usage.js.map