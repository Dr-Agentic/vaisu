import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import type { Document, DocumentStructure, Section } from '../../../shared/src/types.js';
import { createHash } from 'crypto';

export class DocumentParser {
  async parseDocument(buffer: Buffer, filename: string): Promise<Document> {
    const fileType = this.getFileType(filename);
    const text = await this.extractText(buffer, fileType);
    const structure = await this.detectStructure(text);

    const documentId = this.generateDocumentId(text);

    return {
      id: documentId,
      title: this.extractTitle(text, filename),
      content: text,
      metadata: {
        wordCount: this.countWords(text),
        uploadDate: new Date(),
        fileType,
        language: 'en' // TODO: detect language
      },
      structure
    };
  }

  async extractText(buffer: Buffer, fileType: string): Promise<string> {
    switch (fileType) {
      case 'txt':
        return buffer.toString('utf-8');
      
      case 'pdf':
        const pdfData = await pdfParse(buffer);
        return pdfData.text;
      
      case 'docx':
        const result = await mammoth.extractRawText({ buffer });
        return result.value;
      
      default:
        throw new Error(`Unsupported file type: ${fileType}`);
    }
  }

  async detectStructure(text: string): Promise<DocumentStructure> {
    const sections = this.identifySections(text);
    const hierarchy = this.buildHierarchy(sections);

    return {
      sections,
      hierarchy
    };
  }

  private identifySections(text: string): Section[] {
    const sections: Section[] = [];
    const lines = text.split('\n');
    
    let currentSection: Partial<Section> | null = null;
    let currentContent: string[] = [];
    let currentIndex = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Detect headings
      const headingMatch = this.detectHeading(line);
      
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
          children: []
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

    // If no sections detected, create one section for entire document
    if (sections.length === 0) {
      sections.push({
        id: 'section-0',
        level: 1,
        title: 'Document',
        content: text,
        startIndex: 0,
        endIndex: text.length,
        summary: '',
        keywords: [],
        children: []
      });
    }

    return sections;
  }

  private detectHeading(line: string): { level: number; title: string } | null {
    // Markdown style headings
    const mdMatch = line.match(/^(#{1,5})\s+(.+)$/);
    if (mdMatch) {
      return {
        level: mdMatch[1].length,
        title: mdMatch[2].trim()
      };
    }

    // Numbered headings (1., 1.1., etc.)
    const numberedMatch = line.match(/^(\d+(?:\.\d+)*)\.\s+(.+)$/);
    if (numberedMatch) {
      const level = numberedMatch[1].split('.').length;
      return {
        level: Math.min(level, 5),
        title: numberedMatch[2].trim()
      };
    }

    // ALL CAPS headings (at least 3 words)
    if (line === line.toUpperCase() && line.split(' ').length >= 3 && line.length < 100) {
      return {
        level: 1,
        title: line
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
        children: []
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
    const ext = filename.split('.').pop()?.toLowerCase();
    return ext || 'txt';
  }

  private generateDocumentId(text: string): string {
    const hash = createHash('sha256');
    hash.update(text);
    return hash.digest('hex').substring(0, 16);
  }
}

export const documentParser = new DocumentParser();
