#!/usr/bin/env node

/**
 * Skill-Sync API Server Entry Point
 * 
 * Starts the HTTP API server for repository complexity analysis.
 * 
 * Usage:
 *   npm run server
 *   node dist/server.js
 *   PORT=8080 node dist/server.js
 */

import { startApiServer } from '../.kiro/core/api-server';

async function main() {
  const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
  
  console.log('🧠 Starting Skill-Sync API Server...');
  console.log(`📊 Cognitive Load Analyzer with Tree-sitter parsing`);
  console.log(`🌐 Server will start on port ${port}`);
  console.log('');

  try {
    const server = await startApiServer(port);
    
    // Graceful shutdown handlers
    const shutdown = async () => {
      console.log('\n🛑 Shutting down gracefully...');
      await server.stop();
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

  } catch (error) {
    console.error('❌ Failed to start API server:', error);
    process.exit(1);
  }
}

// Run the server
main().catch((error) => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});