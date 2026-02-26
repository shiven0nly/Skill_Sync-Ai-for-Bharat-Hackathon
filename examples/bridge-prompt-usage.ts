#!/usr/bin/env node

/**
 * Bridge Prompt Usage Example
 * 
 * Demonstrates how to use the Bridge Prompt functionality to generate
 * human-readable explanations of code complexity.
 */

import { 
  generateFileBridgeExplanation, 
  generateRepositoryBridgeExplanation 
} from '../.kiro/core/bridge-prompt.js';
import { FileComplexityResult, RepositoryComplexityMap } from '../.kiro/core/repository-analyzer.js';

// Example: Complex React component analysis
const complexReactFile: FileComplexityResult = {
  filePath: 'src/components/UserDashboard.jsx',
  language: 'javascript',
  complexity: {
    cognitiveLoad: 3.2,
    skillLevel: 5,
    metrics: {
      cyclomaticComplexity: 15,
      dependencyDepth: 8,
      linesOfCode: 280
    }
  },
  category: 'Very High'
};

// Example: Simple utility function
const simpleUtilFile: FileComplexityResult = {
  filePath: 'src/utils/formatDate.js',
  language: 'javascript',
  complexity: {
    cognitiveLoad: 0.7,
    skillLevel: 5,
    metrics: {
      cyclomaticComplexity: 2,
      dependencyDepth: 1,
      linesOfCode: 25
    }
  },
  category: 'Low'
};

// Example repository map
const exampleRepository: RepositoryComplexityMap = {
  repositoryPath: '/projects/my-react-app',
  totalFiles: 120,
  analyzedFiles: 85,
  skippedFiles: 35,
  files: [complexReactFile, simpleUtilFile],
  summary: {
    averageComplexity: 1.8,
    highComplexityFiles: 12,
    languageDistribution: {
      javascript: 65,
      python: 15,
      go: 5
    }
  }
};

async function demonstrateBridgePrompt() {
  console.log('🌉 Bridge Prompt Demonstration\n');
  console.log('=' .repeat(60));

  // Example 1: Beginner developer looking at complex file
  console.log('\n📚 Example 1: Beginner Developer (Skill Level 2)');
  console.log('-'.repeat(50));
  
  const beginnerExplanation = generateFileBridgeExplanation(complexReactFile, 2);
  
  console.log(`File: ${beginnerExplanation.filePath}`);
  console.log(`Language: ${beginnerExplanation.language}`);
  console.log(`Cognitive Load: ${beginnerExplanation.cognitiveLoad}`);
  console.log(`\nOverview:`);
  console.log(beginnerExplanation.explanation.overview);
  console.log(`\nMetaphor:`);
  console.log(beginnerExplanation.explanation.metaphor);
  console.log(`\nComplexity Analysis:`);
  console.log(`Level: ${beginnerExplanation.explanation.complexity.level}`);
  console.log(`Reasoning: ${beginnerExplanation.explanation.complexity.reasoning}`);
  console.log(`\nSuggestions:`);
  beginnerExplanation.explanation.complexity.suggestions.forEach((suggestion, i) => {
    console.log(`${i + 1}. ${suggestion}`);
  });

  // Example 2: Expert developer looking at the same file
  console.log('\n🎯 Example 2: Expert Developer (Skill Level 8)');
  console.log('-'.repeat(50));
  
  const expertExplanation = generateFileBridgeExplanation(complexReactFile, 8);
  
  console.log(`File: ${expertExplanation.filePath}`);
  console.log(`\nOverview:`);
  console.log(expertExplanation.explanation.overview);
  console.log(`\nAvailable Mental Models:`);
  expertExplanation.explanation.mentalModels.forEach((model, i) => {
    console.log(`${i + 1}. ${model.construct} → ${model.mentalModel}`);
    console.log(`   ${model.description}`);
  });

  // Example 3: Repository-level analysis
  console.log('\n🏗️  Example 3: Repository Analysis (Skill Level 5)');
  console.log('-'.repeat(50));
  
  const repoExplanation = generateRepositoryBridgeExplanation(exampleRepository, 5);
  
  console.log(`Repository: ${repoExplanation.repositoryPath}`);
  console.log(`\nOverview:`);
  console.log(repoExplanation.overview);
  console.log(`\nHotspots (${repoExplanation.hotspots.length} files need attention):`);
  repoExplanation.hotspots.forEach((hotspot, i) => {
    console.log(`${i + 1}. ${hotspot.filePath} (Cognitive Load: ${hotspot.cognitiveLoad})`);
  });
  console.log(`\nRecommendations:`);
  repoExplanation.recommendations.forEach((rec, i) => {
    console.log(`${i + 1}. ${rec}`);
  });
  console.log(`\nLearning Path:`);
  repoExplanation.learningPath.forEach((step, i) => {
    console.log(`${step}`);
  });

  // Example 4: Simple file analysis
  console.log('\n✨ Example 4: Simple File Analysis');
  console.log('-'.repeat(50));
  
  const simpleExplanation = generateFileBridgeExplanation(simpleUtilFile, 4);
  
  console.log(`File: ${simpleExplanation.filePath}`);
  console.log(`Cognitive Load: ${simpleExplanation.cognitiveLoad}`);
  console.log(`\nOverview:`);
  console.log(simpleExplanation.explanation.overview);
  console.log(`\nMetaphor:`);
  console.log(simpleExplanation.explanation.metaphor);

  console.log('\n' + '='.repeat(60));
  console.log('🎉 Bridge Prompt demonstration complete!');
  console.log('\nThe Bridge Prompt system successfully:');
  console.log('✅ Adapts explanations to user skill level');
  console.log('✅ Provides contextual metaphors');
  console.log('✅ Maps code constructs to mental models');
  console.log('✅ Offers actionable suggestions');
  console.log('✅ Generates learning paths');
}

// API Usage Example
function demonstrateApiUsage() {
  console.log('\n🔌 API Usage Examples');
  console.log('-'.repeat(50));

  console.log('\n1. Repository Bridge Analysis:');
  console.log('POST /bridge');
  console.log(JSON.stringify({
    repositoryPath: '/path/to/repo',
    skillLevel: 5,
    excludePatterns: ['node_modules/**', '*.test.js'],
    maxFiles: 100
  }, null, 2));

  console.log('\n2. Single File Bridge Analysis:');
  console.log('POST /bridge');
  console.log(JSON.stringify({
    repositoryPath: '/path/to/repo',
    skillLevel: 3,
    targetFile: 'src/components/ComplexComponent.jsx'
  }, null, 2));
}

// Run the demonstration
demonstrateBridgePrompt()
  .then(() => demonstrateApiUsage())
  .catch(console.error);

export { demonstrateBridgePrompt, demonstrateApiUsage };