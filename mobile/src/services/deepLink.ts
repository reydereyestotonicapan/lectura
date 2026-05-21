import * as Linking from 'expo-linking';
import { BIBLE_BOOK_CODES, YOUVERSION_VERSION_CODE } from '../constants/bible';
import { BibleSource } from '../types/chapter';

/**
 * Generates a YouVersion deep link URL for a specific Bible chapter.
 * Uses the TLA (Traducción en Lenguaje Actual) version by default.
 * 
 * @param book - Spanish Bible book name (e.g., "Romanos")
 * @param chapter - Chapter number
 * @returns YouVersion deep link URL
 */
export function getYouVersionUrl(book: string, chapter: number): string {
  const bookCode = BIBLE_BOOK_CODES[book] ?? 'GEN';
  return `youversion://bible?reference=${bookCode}.${chapter}&version=${YOUVERSION_VERSION_CODE}`;
}

/**
 * Generates a BibleGateway web URL for a specific Bible chapter.
 * Uses the TLA (Traducción en Lenguaje Actual) version.
 * 
 * @param book - Spanish Bible book name (e.g., "Romanos")
 * @param chapter - Chapter number
 * @returns BibleGateway web URL
 */
export function getBibleGatewayUrl(book: string, chapter: number): string {
  const encodedBook = encodeURIComponent(book);
  return `https://www.biblegateway.com/passage/?search=${encodedBook}%20${chapter}&version=TLA`;
}

/**
 * Checks if the YouVersion app is installed and can be opened.
 * 
 * @returns Promise resolving to true if YouVersion can be opened
 */
export async function canOpenYouVersion(): Promise<boolean> {
  const url = 'youversion://';
  return Linking.canOpenURL(url);
}

/**
 * Opens a Bible chapter in the user's preferred Bible source.
 * If YouVersion is preferred but not installed, falls back to BibleGateway.
 * 
 * @param book - Spanish Bible book name (e.g., "Romanos")
 * @param chapter - Chapter number
 * @param preference - User's preferred Bible source ('youversion' or 'biblegateway')
 */
export async function openChapter(
  book: string,
  chapter: number,
  preference: BibleSource
): Promise<void> {
  if (preference === 'youversion') {
    const youversionUrl = getYouVersionUrl(book, chapter);
    const canOpen = await Linking.canOpenURL(youversionUrl);

    if (canOpen) {
      await Linking.openURL(youversionUrl);
      return;
    }
    // Fall through to BibleGateway if YouVersion is not available
  }

  // Fallback to BibleGateway (or direct preference)
  const bibleGatewayUrl = getBibleGatewayUrl(book, chapter);
  await Linking.openURL(bibleGatewayUrl);
}
