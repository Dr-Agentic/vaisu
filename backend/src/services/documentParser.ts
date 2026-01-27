import mammoth from 'mammoth';
import pdfParse from 'pdf-parse';
import { v4 as uuidv4 } from 'uuid';

import { detectLanguage } from '../utils/languageDetector.js';

import type { Document, DocumentStructure, Section } from '../../../shared/src/types.js';


export class DocumentParser {
  /**
   * Parse a document from a file buffer (for file uploads)
   */
  async parseDocument(buffer: Buffer, filename: string, documentId?: string): Promise<Document> {
    const fileType = this.getFileType(filename);
    const text = await this.extractText(buffer, fileType);
    const structure = await this.detectStructure(text);

    const finalDocumentId = documentId || this.generateDocumentId(text);

    return {
      id: finalDocumentId,
      title: this.extractTitle(text, filename),
      content: text,
      metadata: {
        wordCount: this.countWords(text),
        uploadDate: new Date(),
        fileType,
        language: detectLanguage(text),
      },
      structure,
    };
  }

  /**
   * Parse plain text directly (for paste functionality and testing)
   */
  async parseText(text: string, title: string = 'Untitled'): Promise<Document> {
    // Sanitize input to prevent XSS
    const sanitizedText = this.sanitizeText(text);

    // Detect structure
    const structure = await this.detectStructure(sanitizedText);

    // Generate document ID
    const documentId = this.generateDocumentId(sanitizedText);

    return {
      id: documentId,
      title: this.extractTitle(sanitizedText, title),
      content: sanitizedText,
      metadata: {
        wordCount: this.countWords(sanitizedText),
        uploadDate: new Date(),
        fileType: 'txt',
        language: detectLanguage(sanitizedText),
      },
      structure,
    };
  }

  async extractText(buffer: Buffer, fileType: string): Promise<string> {
    switch (fileType) {
      case 'md':
      case 'txt':
        return buffer.toString('utf-8');

      case 'pdf':
        const pdfData = await pdfParse(buffer);
        return pdfData.text;

      default:
        throw new Error(`Unsupported file type: ${fileType}`);
    }
  }

  async detectStructure(text: string): Promise<DocumentStructure> {
    const flatSections = this.identifySections(text);
    const sections = this.buildSectionHierarchy(flatSections);
    const hierarchy = this.buildHierarchy(flatSections);

    return {
      sections,
      hierarchy,
    };
  }

  /**
   * Build hierarchical section structure where child sections are nested in parent sections
   */
  private buildSectionHierarchy(flatSections: Section[]): Section[] {
    if (flatSections.length === 0) return [];

    const result: Section[] = [];
    const stack: Section[] = [];

    for (const section of flatSections) {
      // Clear children array (will be populated)
      section.children = [];

      // Find parent by popping stack until we find a section with lower level
      while (stack.length > 0 && stack[stack.length - 1].level >= section.level) {
        stack.pop();
      }

      if (stack.length === 0) {
        // Top-level section
        result.push(section);
      } else {
        // Child section - add to parent's children
        stack[stack.length - 1].children.push(section);
      }

      stack.push(section);
    }

    return result;
  }

  /**
   * Sanitize text to prevent XSS attacks
   */
  private sanitizeText(text: string): string {
    if (!text) return '';

    // Remove script tags and their content
    let sanitized = text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

    // Remove event handlers (onclick, onerror, etc.)
    sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');

    // Remove javascript: protocol
    sanitized = sanitized.replace(/javascript:/gi, '');

    return sanitized;
  }

  private identifySections(text: string): Section[] {
    // Handle empty text
    if (!text || text.trim().length === 0) {
      return [];
    }

    const sections: Section[] = [];
    const lines = text.split('\n');

    let currentSection: Partial<Section> | null = null;
    let currentContent: string[] = [];
    let currentIndex = 0;

    for (let i = 0; i < lines.length; i++) {
      const rawLine = lines[i];
      const line = rawLine.trim();

      // Detect headings
      const headingMatch = this.detectHeading(rawLine);

      if (headingMatch) {
        // Save previous section
        if (currentSection) {
          currentSection.content = currentContent.join('\n').trim();
          currentSection.endIndex = currentIndex;
          sections.push(currentSection as Section);
        }

        // Start new section
        currentSection = {
          id: `section-${sections.length}`,
          level: headingMatch.level,
          title: headingMatch.title,
          startIndex: currentIndex,
          summary: '', // Will be filled by AI
          keywords: [],
          children: [],
        };
        currentContent = [];
      } else if (line) {
        currentContent.push(line);
      }

      currentIndex += line.length + 1;
    }

    // Save last section
    if (currentSection) {
      currentSection.content = currentContent.join('\n').trim();
      currentSection.endIndex = currentIndex;
      sections.push(currentSection as Section);
    }

    // If no sections detected and text is not empty, create one section for entire document
    if (sections.length === 0 && text.trim().length > 0) {
      sections.push({
        id: 'section-0',
        level: 1,
        title: 'Document',
        content: text,
        startIndex: 0,
        endIndex: text.length,
        summary: '',
        keywords: [],
        children: [],
      });
    }

    return sections;
  }

  private detectHeading(line: string): { level: number; title: string } | null {
    const trimmed = line.trim();

    // Calculate indentation level (2 spaces or 1 tab = 1 extra level)
    const indentation = line.match(/^(\s*)/)?.[1].length || 0;
    const indentLevel = Math.floor(indentation / 2);

    // Markdown style headings (allow missing space after # for leniency)
    const mdMatch = trimmed.match(/^(#{1,5})\s*(.+)$/);
    if (mdMatch) {
      return {
        level: mdMatch[1].length,
        title: mdMatch[2].trim(),
      };
    }

    // Numbered headings (1., 1.1., etc.)
    const numberedMatch = trimmed.match(/^(\d+(?:\.\d+)*)\.\s+(.+)$/);
    if (numberedMatch) {
      const numberPart = numberedMatch[1];
      // If it's just "1", "2" etc, rely on indentation + 1
      // If it's "1.1", "1.2.1", calculate from dots
      const dotLevel = numberPart.split('.').length;

      // Use the greater of explicit numbering depth or indentation
      // But if it's "1." (dotLevel=1) and indented, use indentation
      let level = dotLevel;
      if (dotLevel === 1 && indentLevel > 0) {
        level = indentLevel + 1;
      }

      return {
        level: Math.min(level, 5),
        title: numberedMatch[2].trim(),
      };
    }

    // ALL CAPS headings (at least 3 words)
    if (trimmed === trimmed.toUpperCase() && trimmed.split(' ').length >= 3 && trimmed.length < 100) {
      return {
        level: 1 + indentLevel,
        title: trimmed,
      };
    }

    return null;
  }

  private buildHierarchy(sections: Section[]) {
    const hierarchy: any[] = [];
    const stack: any[] = [];

    for (const section of sections) {
      const node = {
        id: `node-${section.id}`,
        sectionId: section.id,
        level: section.level,
        children: [],
      };

      // Find parent
      while (stack.length > 0 && stack[stack.length - 1].level >= section.level) {
        stack.pop();
      }

      if (stack.length === 0) {
        hierarchy.push(node);
      } else {
        stack[stack.length - 1].children.push(node);
      }

      stack.push(node);
    }

    return hierarchy;
  }

  private extractTitle(text: string, filename: string): string {
    // Try to find title in first few lines
    const lines = text.split('\n').slice(0, 5);

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.length > 10 && trimmed.length < 100) {
        // Remove markdown heading markers
        const cleaned = trimmed.replace(/^#+\s*/, '');
        if (cleaned) {
          return cleaned;
        }
      }
    }

    // Fallback to filename
    return filename.replace(/\.[^/.]+$/, '');
  }

  private countWords(text: string): number {
    return text.split(/\s+/).filter(word => word.length > 0).length;
  }

  private getFileType(filename: string): string {
    // Check if filename contains a dot (has an extension)
    if (!filename.includes('.') || filename.startsWith('.')) {
      return 'txt'; // No extension or hidden file, default to txt
    }

    const ext = filename.split('.').pop()?.toLowerCase();
    // Only treat it as an extension if it looks like a valid file extension
    if (!ext || !(/^[a-z0-9_-]+$/).test(ext)) {
      return 'txt';
    }
    return ext;
  }

  private generateDocumentId(text: string): string {
    return uuidv4();
  }
}

export const documentParser = new DocumentParser();
