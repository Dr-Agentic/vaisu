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
      expect(result.structure.sections).toHaveLength(3); // 3 main sections
      expect(result.structure.sections[0].title).toBe('Introduction');
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

      expect(sections[0].content).toBeDefined();
      expect(sections[0].content.length).toBeGreaterThan(0);
    });

    it('should handle documents without headings', async () => {
      const plainText = 'This is just plain text without any headings.';
      const result = await parser.parseText(plainText);

      expect(result.structure.sections).toHaveLength(0);
    });

    it('should preserve section order', async () => {
      const result = await parser.parseText(HIERARCHICAL_DOCUMENT);
      const sections = result.structure.sections;

      expect(sections[0].title).toBe('Introduction');
      expect(sections[1].title).toBe('Backend Architecture');
      expect(sections[2].title).toBe('Frontend Architecture');
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
});
