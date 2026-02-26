/**
 * Tests for Language Detector
 */

import {
  detectLanguageFromPath,
  detectLanguageFromContent,
  detectLanguage,
  getSupportedLanguages,
  isLanguageSupported,
} from './languageDetector';

describe('Language Detector', () => {
  describe('detectLanguageFromPath', () => {
    describe('JavaScript files', () => {
      it('should detect .js files', () => {
        expect(detectLanguageFromPath('app.js')).toBe('javascript');
      });

      it('should detect .jsx files', () => {
        expect(detectLanguageFromPath('component.jsx')).toBe('javascript');
      });

      it('should detect .ts files', () => {
        expect(detectLanguageFromPath('app.ts')).toBe('javascript');
      });

      it('should detect .tsx files', () => {
        expect(detectLanguageFromPath('component.tsx')).toBe('javascript');
      });

      it('should detect .mjs files', () => {
        expect(detectLanguageFromPath('module.mjs')).toBe('javascript');
      });

      it('should detect .cjs files', () => {
        expect(detectLanguageFromPath('module.cjs')).toBe('javascript');
      });
    });

    describe('Python files', () => {
      it('should detect .py files', () => {
        expect(detectLanguageFromPath('script.py')).toBe('python');
      });

      it('should detect .pyw files', () => {
        expect(detectLanguageFromPath('app.pyw')).toBe('python');
      });

      it('should detect .pyi files', () => {
        expect(detectLanguageFromPath('module.pyi')).toBe('python');
      });
    });

    describe('Go files', () => {
      it('should detect .go files', () => {
        expect(detectLanguageFromPath('main.go')).toBe('go');
      });
    });

    describe('Unknown files', () => {
      it('should return null for unknown extensions', () => {
        expect(detectLanguageFromPath('file.txt')).toBeNull();
      });

      it('should return null for files without extension', () => {
        expect(detectLanguageFromPath('Makefile')).toBeNull();
      });
    });

    describe('case insensitivity', () => {
      it('should handle uppercase extensions', () => {
        expect(detectLanguageFromPath('app.JS')).toBe('javascript');
        expect(detectLanguageFromPath('script.PY')).toBe('python');
        expect(detectLanguageFromPath('main.GO')).toBe('go');
      });

      it('should handle mixed case extensions', () => {
        expect(detectLanguageFromPath('app.Js')).toBe('javascript');
        expect(detectLanguageFromPath('script.Py')).toBe('python');
      });
    });

    describe('full paths', () => {
      it('should detect language from full file paths', () => {
        expect(detectLanguageFromPath('/home/user/project/src/app.js')).toBe('javascript');
        expect(detectLanguageFromPath('C:\\Users\\user\\project\\script.py')).toBe('python');
        expect(detectLanguageFromPath('./src/main.go')).toBe('go');
      });
    });
  });

  describe('detectLanguageFromContent', () => {
    describe('JavaScript detection', () => {
      it('should detect ES6 import statements', () => {
        const code = "import React from 'react';";
        expect(detectLanguageFromContent(code)).toBe('javascript');
      });

      it('should detect export statements', () => {
        const code = 'export default function App() {}';
        expect(detectLanguageFromContent(code)).toBe('javascript');
      });

      it('should detect const declarations', () => {
        const code = 'const x = 1;';
        expect(detectLanguageFromContent(code)).toBe('javascript');
      });

      it('should detect arrow functions', () => {
        const code = 'const fn = () => { return 42; };';
        expect(detectLanguageFromContent(code)).toBe('javascript');
      });

      it('should detect async/await', () => {
        const code = 'async function fetch() { await getData(); }';
        expect(detectLanguageFromContent(code)).toBe('javascript');
      });

      it('should detect CommonJS require', () => {
        const code = "const express = require('express');";
        expect(detectLanguageFromContent(code)).toBe('javascript');
      });
    });

    describe('Python detection', () => {
      it('should detect function definitions', () => {
        const code = 'def hello(name):\n    print(f"Hello {name}")';
        expect(detectLanguageFromContent(code)).toBe('python');
      });

      it('should detect class definitions', () => {
        const code = 'class MyClass:\n    def __init__(self):\n        pass';
        expect(detectLanguageFromContent(code)).toBe('python');
      });

      it('should detect import statements', () => {
        const code = 'import os\nimport sys';
        expect(detectLanguageFromContent(code)).toBe('python');
      });

      it('should detect from import statements', () => {
        const code = 'from os import path\nfrom sys import argv';
        expect(detectLanguageFromContent(code)).toBe('python');
      });

      it('should detect main guard', () => {
        const code = 'if __name__ == "__main__":\n    main()';
        expect(detectLanguageFromContent(code)).toBe('python');
      });

      it('should detect decorators', () => {
        const code = '@property\ndef value(self):\n    return self._value';
        expect(detectLanguageFromContent(code)).toBe('python');
      });

      it('should detect async functions', () => {
        const code = 'async def fetch_data():\n    await asyncio.sleep(1)';
        expect(detectLanguageFromContent(code)).toBe('python');
      });
    });

    describe('Go detection', () => {
      it('should detect package declaration', () => {
        const code = 'package main';
        expect(detectLanguageFromContent(code)).toBe('go');
      });

      it('should detect import block', () => {
        const code = 'import (\n    "fmt"\n    "os"\n)';
        expect(detectLanguageFromContent(code)).toBe('go');
      });

      it('should detect function declaration', () => {
        const code = 'func main() {\n    fmt.Println("Hello")\n}';
        expect(detectLanguageFromContent(code)).toBe('go');
      });

      it('should detect method declaration', () => {
        const code = 'func (r *Reader) Read(p []byte) (n int, err error) {}';
        expect(detectLanguageFromContent(code)).toBe('go');
      });

      it('should detect interface definition', () => {
        const code = 'type Reader interface {\n    Read(p []byte) (n int, err error)\n}';
        expect(detectLanguageFromContent(code)).toBe('go');
      });

      it('should detect struct definition', () => {
        const code = 'type Person struct {\n    Name string\n    Age int\n}';
        expect(detectLanguageFromContent(code)).toBe('go');
      });

      it('should detect defer statement', () => {
        const code = 'defer file.Close()';
        expect(detectLanguageFromContent(code)).toBe('go');
      });

      it('should detect goroutine', () => {
        const code = 'go fetchData()';
        expect(detectLanguageFromContent(code)).toBe('go');
      });

      it('should detect make function', () => {
        const code = 'ch := make(chan int)';
        expect(detectLanguageFromContent(code)).toBe('go');
      });
    });

    describe('edge cases', () => {
      it('should return null for empty content', () => {
        expect(detectLanguageFromContent('')).toBeNull();
      });

      it('should return null for ambiguous content', () => {
        const code = 'x = 1\ny = 2';
        expect(detectLanguageFromContent(code)).toBeNull();
      });

      it('should handle whitespace', () => {
        const code = '  \n  import React from "react";\n  ';
        expect(detectLanguageFromContent(code)).toBe('javascript');
      });
    });
  });

  describe('detectLanguage', () => {
    it('should prioritize path-based detection', () => {
      const filePath = 'app.js';
      const content = 'def hello():\n    pass'; // Python content
      expect(detectLanguage(filePath, content)).toBe('javascript');
    });

    it('should fall back to content detection when path is ambiguous', () => {
      const filePath = 'unknown.txt';
      const content = 'def hello():\n    pass';
      expect(detectLanguage(filePath, content)).toBe('python');
    });

    it('should return null when both path and content are ambiguous', () => {
      const filePath = 'unknown.txt';
      const content = 'x = 1';
      expect(detectLanguage(filePath, content)).toBeNull();
    });

    it('should work with path only', () => {
      expect(detectLanguage('app.js')).toBe('javascript');
      expect(detectLanguage('script.py')).toBe('python');
      expect(detectLanguage('main.go')).toBe('go');
    });
  });

  describe('getSupportedLanguages', () => {
    it('should return all supported languages', () => {
      const languages = getSupportedLanguages();
      expect(languages).toContain('javascript');
      expect(languages).toContain('python');
      expect(languages).toContain('go');
      expect(languages.length).toBe(3);
    });
  });

  describe('isLanguageSupported', () => {
    it('should return true for supported languages', () => {
      expect(isLanguageSupported('javascript')).toBe(true);
      expect(isLanguageSupported('python')).toBe(true);
      expect(isLanguageSupported('go')).toBe(true);
    });

    it('should return false for unsupported languages', () => {
      expect(isLanguageSupported('java')).toBe(false);
      expect(isLanguageSupported('rust')).toBe(false);
      expect(isLanguageSupported('c++')).toBe(false);
      expect(isLanguageSupported('')).toBe(false);
    });
  });
});
