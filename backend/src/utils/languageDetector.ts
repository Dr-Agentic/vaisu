/**
 * Simple language detection based on common word frequencies.
 */

const COMMON_WORDS: Record<string, string[]> = {
  en: ['the', 'and', 'with', 'this', 'that', 'from', 'have', 'would', 'their', 'there'],
  es: ['el', 'la', 'de', 'que', 'en', 'los', 'las', 'por', 'para', 'con'],
  fr: ['le', 'la', 'les', 'des', 'est', 'une', 'dans', 'pour', 'plus', 'avec'],
  de: ['der', 'die', 'das', 'und', 'mit', 'ist', 'von', 'eine', 'den', 'auf'],
  it: ['il', 'la', 'le', 'di', 'che', 'in', 'per', 'una', 'nella', 'con']
};

/**
 * Detects the language of a given text.
 * @param text The text to analyze
 * @returns ISO language code (e.g., 'en', 'es', 'fr')
 */
export function detectLanguage(text: string): string {
  if (!text || text.length < 10) return 'en';

  const lowerText = text.toLowerCase();
  const words = lowerText.split(/\W+/);
  
  const scores: Record<string, number> = {};

  for (const [lang, commonWords] of Object.entries(COMMON_WORDS)) {
    scores[lang] = 0;
    for (const word of words) {
      if (commonWords.includes(word)) {
        scores[lang]++;
      }
    }
  }

  let bestLang = 'en';
  let bestScore = 0;

  for (const [lang, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score;
      bestLang = lang;
    }
  }

  // If no common words matched, default to English
  return bestScore > 0 ? bestLang : 'en';
}
