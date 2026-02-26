#!/usr/bin/env node

/**
 * CLI Entry Point for Skill-Sync Complexity Analysis
 * 
 * Usage:
 *   npm run analyze <repository-path> [skill-level]
 *   node dist/.kiro/core/api/cli.js <repository-path> [skill-level]
 */

import { analyzeRepositoryCLI, ComplexityApiServer } from './server';

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Skill-Sync Complexity Analyzer');
    console.log('');
    console.log('Usage:');
    console.log('  analyze <repository-path> [skill-level]  - Analyze a repository');
    console.log('  server [port]                           - Start API server');
    console.log('');
    console.log('Examples:');
    console.log('  npm run analyze . 7                     - Analyze current directory with skill level 7');
    console.log('  npm run analyze /path/to/repo           - Analyze repository with default skill level 5');
    console.log('  npm run server 3000                     - Start API server on port 3000');
    process.exit(1);
  }
  
  const command = args[0];
  
  if (command === 'server') {
    const port = args[1] ? parseInt(args[1]) : 3000;
    const server = new ComplexityApiServer(port);
    await server.start();
    
    // Keep the process running
    process.stdin.resume();
  } else {
    // Treat first argument as repository path
    const repositoryPath = command;
    const userSkillLevel = args[1] ? parseInt(args[1]) : 5;
    
    if (isNaN(userSkillLevel) || userSkillLevel < 1 || userSkillLevel > 10) {
      console.error('Error: Skill level must be a number between 1 and 10');
      process.exit(1);
    }
    
    try {
      await analyzeRepositoryCLI(repositoryPath, userSkillLevel);
    } catch (error: any) {
      console.error('Error analyzing repository:', error.message);
      process.exit(1);
    }
  }
}

main().catch((error: any) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});