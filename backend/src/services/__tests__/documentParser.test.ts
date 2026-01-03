import { describe, it, expect, beforeEach } from 'vitest';
import { DocumentParser } from '../documentParser';
import { 
  SMALL_BUSINESS_REPORT, 
  HIERARCHICAL_DOCUMENT,
  EMPTY_DOCUMENT,
  MALFORMED_DOCUMENT 
} from '../../../../test/fixtures/documents';

describe('DocumentParser', () => {
  let parser: DocumentParser;

  beforeEach(() => {
    parser = new DocumentParser();
  });

  describe('parseText', () => {
    it('should parse plain text successfully', async () => {
      const result = await parser.parseText(SMALL_BUSINESS_REPORT);

      expect(result).toBeDefined();
      expect(result.content).toBe(SMALL_BUSINESS_REPORT);
      expect(result.metadata.wordCount).toBeGreaterThan(0);
    });

    it('should detect document structure', async () => {
      const result = await parser.parseText(HIERARCHICAL_DOCUMENT);

      expect(result.structure).toBeDefined();
      // Document has 1 top-level section (H1 title) with 3 H2 children
      expect(result.structure.sections).toHaveLength(1);
      expect(result.structure.sections[0].title).toBe('Software Architecture Guide');
      expect(result.structure.sections[0].children).toHaveLength(3);
      expect(result.structure.sections[0].children[0].title).toBe('1. Introduction');
    });

    it('should handle empty documents', async () => {
      const result = await parser.parseText(EMPTY_DOCUMENT);

      expect(result.content).toBe('');
      expect(result.metadata.wordCount).toBe(0);
      expect(result.structure.sections).toHaveLength(0);
    });

    it('should sanitize malformed content', async () => {
      const result = await parser.parseText(MALFORMED_DOCUMENT);

      expect(result.content).not.toContain('<script>');
      expect(result.content).not.toContain('alert');
    });
  });

  describe('detectStructure', () => {
    it('should identify heading hierarchy', async () => {
      const result = await parser.parseText(HIERARCHICAL_DOCUMENT);
      const sections = result.structure.sections;

      expect(sections[0].level).toBe(1); // H1
      expect(sections[0].children).toBeDefined();
      expect(sections[0].children.length).toBeGreaterThan(0);
      expect(sections[0].children[0].level).toBe(2); // H2
    });

    it('should extract section content', async () => {
      const result = await parser.parseText(SMALL_BUSINESS_REPORT);
      const sections = result.structure.sections;

      // Top-level section (H1) has children (H2 sections) with content
      expect(sections[0].children).toBeDefined();
      expect(sections[0].children.length).toBeGreaterThan(0);
      expect(sections[0].children[0].content).toBeDefined();
      expect(sections[0].children[0].content.length).toBeGreaterThan(0);
    });

    it('should handle documents without headings', async () => {
      const plainText = 'This is just plain text without any headings.';
      const result = await parser.parseText(plainText);

      // Document without headings should have 1 section containing all content
      expect(result.structure.sections).toHaveLength(1);
      expect(result.structure.sections[0].title).toBe('Document');
      expect(result.structure.sections[0].content).toBe(plainText);
    });

    it('should preserve section order', async () => {
      const result = await parser.parseText(HIERARCHICAL_DOCUMENT);
      const sections = result.structure.sections;

      // Check the order of H2 children under the H1 title
      expect(sections[0].children[0].title).toBe('1. Introduction');
      expect(sections[0].children[1].title).toBe('2. Backend Architecture');
      expect(sections[0].children[2].title).toBe('3. Frontend Architecture');
    });
  });

  describe('metadata extraction', () => {
    it('should calculate word count accurately', async () => {
      const text = 'one two three four five';
      const result = await parser.parseText(text);

      expect(result.metadata.wordCount).toBe(5);
    });

    it('should detect language', async () => {
      const result = await parser.parseText(SMALL_BUSINESS_REPORT);

      expect(result.metadata.language).toBe('en');
    });

    it('should set upload date', async () => {
      const result = await parser.parseText(SMALL_BUSINESS_REPORT);

      expect(result.metadata.uploadDate).toBeInstanceOf(Date);
    });
  });

  describe('performance', () => {
    it('should parse document within 2 seconds', async () => {
      const start = Date.now();
      await parser.parseText(SMALL_BUSINESS_REPORT);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(2000);
    });

    it('should handle large documents efficiently', async () => {
      const largeText = 'word '.repeat(10000); // 10k words
      const start = Date.now();
      await parser.parseText(largeText);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(5000);
    });
  });

  describe('getFileType', () => {
    it('should handle filenames without extensions', async () => {
      // Test the scenario that caused the original bug
      const filename = 'ui component classes and types';
      const document = await parser.parseDocument(Buffer.from('Test content'), filename);

      expect(document.metadata.fileType).toBe('txt');
    });

    it('should handle filenames with valid extensions', async () => {
      const testCases = [
        { filename: 'document.txt', expected: 'txt', content: Buffer.from('Plain text content') },
        { filename: 'readme.md', expected: 'md', content: Buffer.from('# Markdown content') },
        { filename: 'no-extension', expected: 'txt', content: Buffer.from('No extension content') },
        { filename: 'file.with.dots.txt', expected: 'txt', content: Buffer.from('Dots in filename') }
      ];

      for (const { filename, expected, content } of testCases) {
        const document = await parser.parseDocument(content, filename);
        expect(document.metadata.fileType).toBe(expected);
      }
    });

    it('should handle edge cases in filename parsing', async () => {
      const testCases = [
        { filename: '', expected: 'txt', content: Buffer.from('Empty filename') },
        { filename: 'file.', expected: 'txt', content: Buffer.from('File with trailing dot') },
        { filename: '.hidden', expected: 'txt', content: Buffer.from('Hidden file content') },
        { filename: 'file with spaces', expected: 'txt', content: Buffer.from('Spaces in filename') }
      ];

      for (const { filename, expected, content } of testCases) {
        const document = await parser.parseDocument(content, filename);
        expect(document.metadata.fileType).toBe(expected);
      }
    });
  });
});
