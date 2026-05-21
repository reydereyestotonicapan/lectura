// Theme exports
export { ThemeProvider, useTheme } from './ThemeContext';
export { lightColors, darkColors, palette, Gradients } from './colors';
export type { ThemeColors, ThemeMode } from './colors';

// Design tokens (static, don't change with theme)
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
};

export const Radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
};

// Shadow factory - call with isDark to get appropriate shadows
export const createShadows = (isDark: boolean) => ({
  xs: {
    shadowColor: isDark ? '#000' : '#895301',
    shadowOpacity: isDark ? 0.3 : 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  sm: {
    shadowColor: isDark ? '#000' : '#895301',
    shadowOpacity: isDark ? 0.4 : 0.09,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  md: {
    shadowColor: isDark ? '#000' : '#895301',
    shadowOpacity: isDark ? 0.5 : 0.13,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  lg: {
    shadowColor: isDark ? '#000' : '#895301',
    shadowOpacity: isDark ? 0.6 : 0.18,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  gold: {
    shadowColor: '#D6A21E',
    shadowOpacity: isDark ? 0.5 : 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
});

// Legacy static Shadows export for backward compatibility during migration
export const Shadows = createShadows(false);

// Legacy Colors export for backward compatibility during migration
// Components should migrate to useTheme() hook
export { lightColors as Colors } from './colors';

import { Gradients as GradientsObj } from './colors';
// Legacy Gradients export for backward compatibility
// Components should migrate to useTheme().gradients
export const LegacyGradients = GradientsObj.light;
