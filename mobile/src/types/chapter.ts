import { Day } from './api';

/**
 * YouVersion book codes for all 66 Bible books
 * Used for generating deep links to the YouVersion app
 */
export type BibleBookCode =
  // Old Testament
  | 'GEN'  // Génesis
  | 'EXO'  // Éxodo
  | 'LEV'  // Levítico
  | 'NUM'  // Números
  | 'DEU'  // Deuteronomio
  | 'JOS'  // Josué
  | 'JDG'  // Jueces
  | 'RUT'  // Rut
  | '1SA'  // 1 Samuel
  | '2SA'  // 2 Samuel
  | '1KI'  // 1 Reyes
  | '2KI'  // 2 Reyes
  | '1CH'  // 1 Crónicas
  | '2CH'  // 2 Crónicas
  | 'EZR'  // Esdras
  | 'NEH'  // Nehemías
  | 'EST'  // Ester
  | 'JOB'  // Job
  | 'PSA'  // Salmos
  | 'PRO'  // Proverbios
  | 'ECC'  // Eclesiastés
  | 'SNG'  // Cantares
  | 'ISA'  // Isaías
  | 'JER'  // Jeremías
  | 'LAM'  // Lamentaciones
  | 'EZK'  // Ezequiel
  | 'DAN'  // Daniel
  | 'HOS'  // Oseas
  | 'JOL'  // Joel
  | 'AMO'  // Amós
  | 'OBA'  // Abdías
  | 'JON'  // Jonás
  | 'MIC'  // Miqueas
  | 'NAM'  // Nahúm
  | 'HAB'  // Habacuc
  | 'ZEP'  // Sofonías
  | 'HAG'  // Hageo
  | 'ZEC'  // Zacarías
  | 'MAL'  // Malaquías
  // New Testament
  | 'MAT'  // Mateo
  | 'MRK'  // Marcos
  | 'LUK'  // Lucas
  | 'JHN'  // Juan
  | 'ACT'  // Hechos
  | 'ROM'  // Romanos
  | '1CO'  // 1 Corintios
  | '2CO'  // 2 Corintios
  | 'GAL'  // Gálatas
  | 'EPH'  // Efesios
  | 'PHP'  // Filipenses
  | 'COL'  // Colosenses
  | '1TH'  // 1 Tesalonicenses
  | '2TH'  // 2 Tesalonicenses
  | '1TI'  // 1 Timoteo
  | '2TI'  // 2 Timoteo
  | 'TIT'  // Tito
  | 'PHM'  // Filemón
  | 'HEB'  // Hebreos
  | 'JAS'  // Santiago
  | '1PE'  // 1 Pedro
  | '2PE'  // 2 Pedro
  | '1JN'  // 1 Juan
  | '2JN'  // 2 Juan
  | '3JN'  // 3 Juan
  | 'JUD'  // Judas
  | 'REV'; // Apocalipsis

/**
 * Represents a single Bible chapter assigned to a reading day
 */
export interface DayChapter {
  id: number;
  day_id: number;
  book: string;
  book_code: BibleBookCode;
  chapter_number: number;
  order: number;
  display_name: string;
  youversion_reference: string;
  biblegateway_url: string;
  youtube_link: string | null;
}

/**
 * DayChapter with user's reading progress
 */
export interface ChapterWithProgress extends DayChapter {
  is_read: boolean;
  read_at: string | null;
}

/**
 * Day with its chapters and progress information
 */
export interface DayWithChapters extends Day {
  day_chapters: ChapterWithProgress[];
  progress_count: number;
  total_chapters: number;
}

/**
 * User's preferred Bible source for reading
 */
export type BibleSource = 'youversion' | 'biblegateway';

/**
 * User settings for Bible reading preferences
 */
export interface UserSettings {
  bible_source: BibleSource;
  bible_version: string;
}
