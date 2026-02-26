/**
 * Configuration for Tree-sitter Parser Setup
 */
/**
 * Parser configuration
 */
export declare const PARSER_CONFIG: {
    wasmPath: string;
    languages: {
        javascript: {
            name: string;
            extensions: string[];
            grammarPackage: string;
        };
        python: {
            name: string;
            extensions: string[];
            grammarPackage: string;
        };
        go: {
            name: string;
            extensions: string[];
            grammarPackage: string;
        };
    };
    options: {
        incremental: boolean;
        maxFileSize: number;
        parseTimeout: number;
    };
};
/**
 * Complexity analysis configuration
 */
export declare const COMPLEXITY_CONFIG: {
    weights: {
        cyclomaticComplexity: number;
        dependencyDepth: number;
        linesOfCode: number;
    };
    thresholds: {
        low: number;
        medium: number;
        high: number;
    };
    defaultSkillLevel: number;
    skillLevelFactor: number;
};
/**
 * Language detection configuration
 */
export declare const DETECTION_CONFIG: {
    minIndicators: number;
    caseSensitive: boolean;
};
/**
 * Export all configurations
 */
declare const _default: {
    PARSER_CONFIG: {
        wasmPath: string;
        languages: {
            javascript: {
                name: string;
                extensions: string[];
                grammarPackage: string;
            };
            python: {
                name: string;
                extensions: string[];
                grammarPackage: string;
            };
            go: {
                name: string;
                extensions: string[];
                grammarPackage: string;
            };
        };
        options: {
            incremental: boolean;
            maxFileSize: number;
            parseTimeout: number;
        };
    };
    COMPLEXITY_CONFIG: {
        weights: {
            cyclomaticComplexity: number;
            dependencyDepth: number;
            linesOfCode: number;
        };
        thresholds: {
            low: number;
            medium: number;
            high: number;
        };
        defaultSkillLevel: number;
        skillLevelFactor: number;
    };
    DETECTION_CONFIG: {
        minIndicators: number;
        caseSensitive: boolean;
    };
};
export default _default;
//# sourceMappingURL=config.d.ts.map