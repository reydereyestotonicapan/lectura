import * as Linking from 'expo-linking';
import { BIBLE_BOOK_CODES, YOUVERSION_VERSION_CODE } from '../constants/bible';
import { BibleSource } from '../types/chapter';

/**
 * Builds the verse suffix for a reference given an optional verse range.
 * Whole chapter -> "". Single verse -> "{sep}5". Range -> "{sep}1-80".
 * The separator differs per target (YouVersion uses ".", BibleGateway ":").
 */
function verseSuffix(
  separator: string,
  verseStart?: number | null,
  verseEnd?: number | null
): string {
  if (verseStart == null) {
    return '';
  }
  if (verseEnd == null || verseEnd === verseStart) {
    return `${separator}${verseStart}`;
  }
  return `${separator}${verseStart}-${verseEnd}`;
}

/**
 * Generates a YouVersion deep link URL for a specific Bible passage.
 * Uses the TLA (Traducción en Lenguaje Actual) version by default.
 * Whole chapter:  youversion://bible?reference=NUM.5&version=176
 * Verse range:    youversion://bible?reference=PSA.119.1-80&version=176
 *
 * @param book - Spanish Bible book name (e.g., "Romanos")
 * @param chapter - Chapter number
 * @param verseStart - Optional starting verse (null/undefined = whole chapter)
 * @param verseEnd - Optional ending verse
 * @returns YouVersion deep link URL
 */
export function getYouVersionUrl(
  book: string,
  chapter: number,
  verseStart?: number | null,
  verseEnd?: number | null
): string {
  const bookCode = BIBLE_BOOK_CODES[book] ?? 'GEN';
  const reference = `${bookCode}.${chapter}${verseSuffix('.', verseStart, verseEnd)}`;
  return `youversion://bible?reference=${reference}&version=${YOUVERSION_VERSION_CODE}`;
}

/**
 * Generates a BibleGateway web URL for a specific Bible passage.
 * Uses the TLA (Traducción en Lenguaje Actual) version.
 * Whole chapter:  ...?search=N%C3%BAmeros%205&version=TLA
 * Verse range:    ...?search=Salmos%20119%3A1-80&version=TLA
 *
 * @param book - Spanish Bible book name (e.g., "Romanos")
 * @param chapter - Chapter number
 * @param verseStart - Optional starting verse (null/undefined = whole chapter)
 * @param verseEnd - Optional ending verse
 * @returns BibleGateway web URL
 */
export function getBibleGatewayUrl(
  book: string,
  chapter: number,
  verseStart?: number | null,
  verseEnd?: number | null
): string {
  const search = encodeURIComponent(
    `${book} ${chapter}${verseSuffix(':', verseStart, verseEnd)}`
  );
  return `https://www.biblegateway.com/passage/?search=${search}&version=TLA`;
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
 * Opens a Bible passage in the user's preferred Bible source.
 * If YouVersion is preferred but not installed, falls back to BibleGateway.
 *
 * @param book - Spanish Bible book name (e.g., "Romanos")
 * @param chapter - Chapter number
 * @param preference - User's preferred Bible source ('youversion' or 'biblegateway')
 * @param verseStart - Optional starting verse (null/undefined = whole chapter)
 * @param verseEnd - Optional ending verse
 */
export async function openChapter(
  book: string,
  chapter: number,
  preference: BibleSource,
  verseStart?: number | null,
  verseEnd?: number | null
): Promise<void> {
  if (preference === 'youversion') {
    const youversionUrl = getYouVersionUrl(book, chapter, verseStart, verseEnd);
    let canOpen = false;
    try {
        canOpen = await Linking.canOpenURL(youversionUrl);
    }
    catch {
        // scheme not in LSApplicationQueriesSchemes yet; treat as not installed
    }

    if (canOpen) {
      await Linking.openURL(youversionUrl);
      return;
    }
    // Fall through to BibleGateway if YouVersion is not available
  }

  // Fallback to BibleGateway (or direct preference)
  const bibleGatewayUrl = getBibleGatewayUrl(book, chapter, verseStart, verseEnd);
  await Linking.openURL(bibleGatewayUrl);
}
