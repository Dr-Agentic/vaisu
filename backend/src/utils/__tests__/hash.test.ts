import { describe, it, expect } from 'vitest';
import { calculateContentHash } from '../hash.js';

describe('calculateContentHash', () => {
  it('should return consistent hash for same content', () => {
    const content = 'This is a test document';
    const hash1 = calculateContentHash(content);
    const hash2 = calculateContentHash(content);
    
    expect(hash1).toBe(hash2);
  });

  it('should return different hashes for different content', () => {
    const content1 = 'Document A';
    const content2 = 'Document B';
    
    const hash1 = calculateContentHash(content1);
    const hash2 = calculateContentHash(content2);
    
    expect(hash1).not.toBe(hash2);
  });

  it('should return 64-character hex string (SHA-256)', () => {
    const content = 'Test content';
    const hash = calculateContentHash(content);
    
    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it('should handle empty string', () => {
    const hash = calculateContentHash('');
    
    expect(hash).toHaveLength(64);
    expect(hash).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  });

  it('should handle unicode characters', () => {
    const content = 'Hello 世界 🌍';
    const hash = calculateContentHash(content);
    
    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it('should be case-sensitive', () => {
    const hash1 = calculateContentHash('Test');
    const hash2 = calculateContentHash('test');
    
    expect(hash1).not.toBe(hash2);
  });

  it('should be whitespace-sensitive', () => {
    const hash1 = calculateContentHash('Test Document');
    const hash2 = calculateContentHash('TestDocument');
    
    expect(hash1).not.toBe(hash2);
  });
});
