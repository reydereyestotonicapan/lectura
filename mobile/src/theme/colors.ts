// gRafé Design System - Color Tokens
// "Iglesia de Dios Pentecostés del Rey de Reyes"

export const palette = {
  // ── Brand Gold ─────────────────────────────────────────
  gold: '#D6A21E',
  goldBright: '#E8B848',
  goldDark: '#895301',
  goldDeep: '#6B4000',
  goldLight: '#F5E8BE',
  goldFaint: '#FEF8E8',
  goldGlow: 'rgba(214,162,30,0.18)',

  // ── Neutrals ───────────────────────────────────────────
  white: '#FFFFFF',
  black: '#000000',

  // ── Warm Creams (Light Mode) ───────────────────────────
  cream50: '#FFFCF6',
  cream100: '#FDF8F0',
  cream200: '#FAF4E6',
  cream300: '#EDE5D8',
  cream400: '#D8CCB8',
  cream500: '#C4B5A5',
  cream600: '#A89A88',
  cream700: '#8A7A6A',
  cream800: '#4A3928',
  cream900: '#1C1410',

  // ── Charcoal (Dark Mode) ───────────────────────────────
  charcoal50: '#2A2520',
  charcoal100: '#1F1B17',
  charcoal200: '#181512',
  charcoal300: '#12100E',
  charcoal400: '#0D0B0A',
  charcoalSurface: '#252118',
  charcoalCard: '#2E2920',

  // ── Semantic ───────────────────────────────────────────
  success: '#2A6E48',
  successLight: '#3D9960',
  successBg: '#EDFAF4',
  successBgDark: '#1A2E22',
  successBorder: '#96D8B4',

  error: '#B83030',
  errorLight: '#E04545',
  errorBg: '#FDECEA',
  errorBgDark: '#2E1A1A',
  errorBorder: '#F5B0B0',

  warning: '#C27B0A',
  warningLight: '#E8A020',
  warningBg: '#FEF8E8',
  warningBgDark: '#2E2518',
  warningBorder: '#ECC870',
};

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeColors {
  // Backgrounds
  background: string;
  backgroundAlt: string;
  surface: string;
  surfaceElevated: string;
  surfaceWarm: string;

  // Text
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textDisabled: string;
  textInverse: string;

  // Borders
  border: string;
  borderMed: string;
  borderStrong: string;

  // Brand
  primary: string;
  primaryLight: string;
  gold: string;
  goldBright: string;
  goldDark: string;
  goldDeep: string;
  goldLight: string;
  goldFaint: string;
  goldGlow: string;

  // Semantic
  success: string;
  successBg: string;
  successBorder: string;
  error: string;
  errorBg: string;
  errorBorder: string;
  warning: string;
  warningBg: string;
  warningBorder: string;

  // Special
  overlay: string;
  shimmer: string;
}

export const lightColors: ThemeColors = {
  // Backgrounds
  background: palette.cream100,
  backgroundAlt: palette.cream200,
  surface: palette.white,
  surfaceElevated: palette.cream50,
  surfaceWarm: palette.cream50,

  // Text
  textPrimary: palette.cream900,
  textSecondary: palette.cream800,
  textMuted: palette.cream700,
  textDisabled: palette.cream500,
  textInverse: palette.white,

  // Borders
  border: palette.cream300,
  borderMed: palette.cream400,
  borderStrong: palette.cream500,

  // Brand
  primary: palette.goldDark,
  primaryLight: palette.goldFaint,
  gold: palette.gold,
  goldBright: palette.goldBright,
  goldDark: palette.goldDark,
  goldDeep: palette.goldDeep,
  goldLight: palette.goldLight,
  goldFaint: palette.goldFaint,
  goldGlow: palette.goldGlow,

  // Semantic
  success: palette.success,
  successBg: palette.successBg,
  successBorder: palette.successBorder,
  error: palette.error,
  errorBg: palette.errorBg,
  errorBorder: palette.errorBorder,
  warning: palette.warning,
  warningBg: palette.warningBg,
  warningBorder: palette.warningBorder,

  // Special
  overlay: 'rgba(28, 20, 16, 0.5)',
  shimmer: palette.cream300,
};

export const darkColors: ThemeColors = {
  // Backgrounds
  background: palette.charcoal300,
  backgroundAlt: palette.charcoal200,
  surface: palette.charcoalSurface,
  surfaceElevated: palette.charcoalCard,
  surfaceWarm: palette.charcoalCard,

  // Text
  textPrimary: palette.cream100,
  textSecondary: palette.cream300,
  textMuted: palette.cream500,
  textDisabled: palette.cream600,
  textInverse: palette.charcoal300,

  // Borders
  border: palette.charcoal50,
  borderMed: 'rgba(214, 162, 30, 0.2)',
  borderStrong: 'rgba(214, 162, 30, 0.35)',

  // Brand
  primary: palette.gold,
  primaryLight: 'rgba(214, 162, 30, 0.15)',
  gold: palette.gold,
  goldBright: palette.goldBright,
  goldDark: palette.goldDark,
  goldDeep: palette.goldDeep,
  goldLight: 'rgba(214, 162, 30, 0.25)',
  goldFaint: 'rgba(214, 162, 30, 0.1)',
  goldGlow: 'rgba(214, 162, 30, 0.25)',

  // Semantic
  success: palette.successLight,
  successBg: palette.successBgDark,
  successBorder: 'rgba(61, 153, 96, 0.4)',
  error: palette.errorLight,
  errorBg: palette.errorBgDark,
  errorBorder: 'rgba(224, 69, 69, 0.4)',
  warning: palette.warningLight,
  warningBg: palette.warningBgDark,
  warningBorder: 'rgba(232, 160, 32, 0.4)',

  // Special
  overlay: 'rgba(0, 0, 0, 0.7)',
  shimmer: palette.charcoal50,
};

export const Gradients = {
  light: {
    gold: ['#E8B848', '#D6A21E'] as [string, string],
    goldDeep: ['#C4880E', '#895301'] as [string, string],
    hero: ['#A87030', '#895301'] as [string, string],
    surface: ['#FFFCF6', '#FDF8F0'] as [string, string],
  },
  dark: {
    gold: ['#E8B848', '#D6A21E'] as [string, string],
    goldDeep: ['#D6A21E', '#895301'] as [string, string],
    hero: ['#3D3020', '#252118'] as [string, string],
    surface: ['#2E2920', '#252118'] as [string, string],
  },
};
