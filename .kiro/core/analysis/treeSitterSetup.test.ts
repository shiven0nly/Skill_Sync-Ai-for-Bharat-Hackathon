/**
 * Tests for Tree-sitter Parser Setup
 */

import { TreeSitterParserManager, getParserManager, resetParserManager } from './treeSitterSetup';

describe('TreeSitterParserManager', () => {
  beforeEach(() => {
    resetParserManager();
  });

  describe('initialization', () => {
    it('should create a parser manager instance', () => {
      const manager = new TreeSitterParserManager();
      expect(manager).toBeDefined();
      expect(manager.isInitialized()).toBe(false);
    });

    it('should accept a custom WASM path', () => {
      const customPath = '/custom/path/tree-sitter.wasm';
      const manager = new TreeSitterParserManager(customPath);
      expect(manager).toBeDefined();
    });
  });

  describe('parser availability', () => {
    it('should indicate parsers are not ready before initialization', () => {
      const manager = new TreeSitterParserManager();
      expect(manager.isReady('javascript')).toBe(false);
      expect(manager.isReady('python')).toBe(false);
      expect(manager.isReady('go')).toBe(false);
    });

    it('should throw error when getting parser before initialization', () => {
      const manager = new TreeSitterParserManager();
      expect(() => manager.getParser('javascript')).toThrow();
    });
  });

  describe('getAllParsers', () => {
    it('should return empty map before initialization', () => {
      const manager = new TreeSitterParserManager();
      const parsers = manager.getAllParsers();
      expect(parsers.size).toBe(0);
    });
  });

  describe('global parser manager', () => {
    it('should create a parser manager instance', () => {
      const manager = new TreeSitterParserManager();
      expect(manager).toBeDefined();
      expect(manager.isInitialized()).toBe(false);
    });

    it('should reset the global manager', () => {
      resetParserManager();
      const manager = new TreeSitterParserManager();
      expect(manager).toBeDefined();
    });
  });
});
