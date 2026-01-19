/**
 * Utility to parse various date formats into Date objects.
 */

/**
 * Attempts to parse a date string into a Date object.
 * Handles common formats like "2023", "January 2024", "2023-12-01", etc.
 * @param dateStr The date string to parse
 * @returns A Date object or the current date if parsing fails
 */
export function parseDate(dateStr: string): Date {
  if (!dateStr) return new Date();

  // Try standard parsing first
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    return parsed;
  }

  // Handle year-only (e.g., "2023")
  const yearMatch = dateStr.match(/^(\d{4})$/);
  if (yearMatch) {
    return new Date(parseInt(yearMatch[1]), 0, 1);
  }

  // Handle Month Year (e.g., "January 2023")
  const monthYearMatch = dateStr.match(/^(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})$/i);
  if (monthYearMatch) {
    const month = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
      .indexOf(monthYearMatch[1].toLowerCase());
    return new Date(parseInt(monthYearMatch[2]), month, 1);
  }

  // Handle relative descriptions (e.g., "mid-2023")
  if (dateStr.toLowerCase().includes('mid-')) {
    const year = dateStr.match(/\d{4}/);
    if (year) return new Date(parseInt(year[0]), 5, 15); // June 15th
  }

  // Fallback to current date
  return new Date();
}
