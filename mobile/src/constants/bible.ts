/**
 * Bible book codes mapping for YouVersion deep links.
 * Maps Spanish Bible book names to YouVersion book codes.
 * 
 * This mapping mirrors the backend DayChapter model's BIBLE_BOOK_CODES constant
 * to ensure consistency between the mobile app and Laravel API.
 * 
 * @see app/Models/DayChapter.php
 */

/**
 * YouVersion TLA (Traducción en Lenguaje Actual) version code
 */
export const YOUVERSION_VERSION_CODE = 176;

/**
 * Mapping of Spanish Bible book names to YouVersion book codes.
 * Contains all 66 books of the Bible.
 */
export const BIBLE_BOOK_CODES: Record<string, string> = {
  // Old Testament (39 books)
  'Génesis': 'GEN',
  'Éxodo': 'EXO',
  'Levítico': 'LEV',
  'Números': 'NUM',
  'Deuteronomio': 'DEU',
  'Josué': 'JOS',
  'Jueces': 'JDG',
  'Rut': 'RUT',
  '1 Samuel': '1SA',
  '2 Samuel': '2SA',
  '1 Reyes': '1KI',
  '2 Reyes': '2KI',
  '1 Crónicas': '1CH',
  '2 Crónicas': '2CH',
  'Esdras': 'EZR',
  'Nehemías': 'NEH',
  'Ester': 'EST',
  'Job': 'JOB',
  'Salmos': 'PSA',
  'Proverbios': 'PRO',
  'Eclesiastés': 'ECC',
  'Cantares': 'SNG',
  'Isaías': 'ISA',
  'Jeremías': 'JER',
  'Lamentaciones': 'LAM',
  'Ezequiel': 'EZK',
  'Daniel': 'DAN',
  'Oseas': 'HOS',
  'Joel': 'JOL',
  'Amós': 'AMO',
  'Abdías': 'OBA',
  'Jonás': 'JON',
  'Miqueas': 'MIC',
  'Nahúm': 'NAM',
  'Habacuc': 'HAB',
  'Sofonías': 'ZEP',
  'Hageo': 'HAG',
  'Zacarías': 'ZEC',
  'Malaquías': 'MAL',
  // New Testament (27 books)
  'Mateo': 'MAT',
  'Marcos': 'MRK',
  'Lucas': 'LUK',
  'Juan': 'JHN',
  'Hechos': 'ACT',
  'Romanos': 'ROM',
  '1 Corintios': '1CO',
  '2 Corintios': '2CO',
  'Gálatas': 'GAL',
  'Efesios': 'EPH',
  'Filipenses': 'PHP',
  'Colosenses': 'COL',
  '1 Tesalonicenses': '1TH',
  '2 Tesalonicenses': '2TH',
  '1 Timoteo': '1TI',
  '2 Timoteo': '2TI',
  'Tito': 'TIT',
  'Filemón': 'PHM',
  'Hebreos': 'HEB',
  'Santiago': 'JAS',
  '1 Pedro': '1PE',
  '2 Pedro': '2PE',
  '1 Juan': '1JN',
  '2 Juan': '2JN',
  '3 Juan': '3JN',
  'Judas': 'JUD',
  'Apocalipsis': 'REV',
};

/**
 * Get the YouVersion book code for a Spanish Bible book name.
 * @param bookName - The Spanish name of the Bible book
 * @returns The YouVersion book code, or undefined if not found
 */
export function getBookCode(bookName: string): string | undefined {
  return BIBLE_BOOK_CODES[bookName];
}

/**
 * Get all valid Spanish Bible book names.
 * @returns Array of all valid Spanish Bible book names
 */
export function getValidBookNames(): string[] {
  return Object.keys(BIBLE_BOOK_CODES);
}
