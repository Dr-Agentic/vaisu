import { describe, it, expect } from 'vitest';
import { detectLanguage } from '../languageDetector.js';

describe('languageDetector', () => {
  it('should detect English correctly', () => {
    const englishText = 'The quick brown fox jumps over the lazy dog and with this that from have.';
    expect(detectLanguage(englishText)).toBe('en');
  });

  it('should detect Spanish correctly', () => {
    const spanishText = 'El rápido zorro marrón salta sobre el perro perezoso de que en los las por para con.';
    expect(detectLanguage(spanishText)).toBe('es');
  });

  it('should detect French correctly', () => {
    const frenchText = 'Le renard brun rapide saute par-dessus le chien paresseux les des est une dans pour plus avec.';
    expect(detectLanguage(frenchText)).toBe('fr');
  });

  it('should default to English for empty or very short strings', () => {
    expect(detectLanguage('')).toBe('en');
    expect(detectLanguage('hello')).toBe('en');
  });

  it('should default to English for unknown languages or gibberish', () => {
    expect(detectLanguage('asdfghjkl qwertyuiop zxcvbnm')).toBe('en');
  });
});
