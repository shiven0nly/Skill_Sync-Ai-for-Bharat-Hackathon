# Skill-Sync API Documentation

## Overview

The Skill-Sync API provides HTTP endpoints for analyzing repository complexity using Tree-sitter parsing and cognitive load calculation.

## Starting the Server

```bash
# Build and start the server
npm run server

# Development mode (rebuilds on changes)
npm run server:dev

# Custom port
PORT=8080 npm run server
```

The server will start on port 3000 by default (or the port specified in the `PORT` environment variable).

## API Endpoints

### POST /analyze

Analyzes a repository and returns a JSON complexity map.

#### Request Body

```json
{
  "repositoryPath": "/path/to/repository",
  "skillLevel": 5,
  "excludePatterns": ["*.test.ts", "node_modules/**"],
  "includePatterns": ["src/**/*.ts", "src/**/*.js"],
  "maxFiles": 100
}
```

#### Parameters

- `repositoryPath` (required): Absolute path to the repository to analyze
- `skillLevel` (required): User's skill level from 1-10 (affects cognitive load calculation)
- `excludePatterns` (optional): Array of glob patterns for files to exclude
- `includePatterns` (optional): Array of glob patterns for files to include (if specified, only these files will be analyzed)
- `maxFiles` (optional): Maximum number of files to analyze

#### Response

```json
{
  "success": true,
  "data": {
    "repositoryPath": "/path/to/repository",
    "totalFiles": 150,
    "analyzedFiles": 45,
    "skippedFiles": 105,
    "files": [
      {
        "filePath": "/path/to/file.ts",
        "language": "javascript",
        "complexity": {
          "cognitiveLoad": 2.4,
          "metrics": {
            "cyclomaticComplexity": 8,
            "dependencyDepth": 5,
            "linesOfCode": 120
          },
          "skillLevel": 5
        },
        "category": "Medium"
      }
    ],
    "summary": {
      "averageComplexity": 1.8,
      "highComplexityFiles": 3,
      "languageDistribution": {
        "javascript": 25,
        "python": 15,
        "go": 5
      }
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### Error Response

```json
{
  "success": false,
  "error": "repositoryPath is required",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### GET /health

Health check endpoint to verify the server is running.

#### Response

```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "service": "Skill-Sync API",
    "version": "1.0.0"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Complexity Calculation

The API uses the cognitive load formula from the design document:

```
C_L = ((V_c × 0.5) + (D_d × 0.3) + (log₁₀(LOC) × 0.2)) / S_level
```

Where:
- `V_c` = Cyclomatic Complexity (decision points)
- `D_d` = Dependency Depth (import count)
- `LOC` = Lines of Code
- `S_level` = Skill Level (1-10)

## Complexity Categories

- **Low**: Cognitive Load ≤ 1
- **Medium**: Cognitive Load ≤ 2
- **High**: Cognitive Load ≤ 3
- **Very High**: Cognitive Load > 3

## Supported Languages

- JavaScript/TypeScript (.js, .jsx, .ts, .tsx, .mjs, .cjs)
- Python (.py, .pyw, .pyi)
- Go (.go)

## Default Exclusions

The following patterns are excluded by default:
- `node_modules/**`
- `.git/**`
- `dist/**`
- `build/**`
- `*.min.js`
- `*.bundle.js`
- `.DS_Store`
- `Thumbs.db`

## Example Usage

### Using curl

```bash
# Health check
curl http://localhost:3000/health

# Analyze repository
curl -X POST http://localhost:3000/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "repositoryPath": "/path/to/your/repo",
    "skillLevel": 5,
    "maxFiles": 50
  }'
```

### Using the example script

```bash
# Build the example
npm run build

# Run the example (make sure server is running first)
node dist/examples/api-usage.js
```

## Error Handling

The API returns appropriate HTTP status codes:

- `200` - Success
- `400` - Bad Request (invalid parameters)
- `404` - Not Found (invalid endpoint)
- `405` - Method Not Allowed
- `500` - Internal Server Error

All error responses include a descriptive error message in the `error` field.