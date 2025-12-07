import crypto from 'crypto';

/**
 * Calculate SHA-256 hash of content for deduplication
 * @param content - String content to hash
 * @returns Hex string representation of SHA-256 hash
 */
export function calculateContentHash(content: string): string {
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
}
