// FR3SH Design Tokens — matches farmers-republic web app brand
// Primary: deep green (#065f46) | Secondary: lime (#bef264)

export const Colors = {
  // Brand — FR3SH green (matches web app)
  primary: '#065f46',
  primaryHover: '#022c22',
  primaryForeground: '#ffffff',
  primaryLight: '#047857',
  primaryMuted: '#eff6e8',

  // Secondary / Lime accent
  secondary: '#bef264',
  secondarySubtle: '#d9f99d',
  secondaryForeground: '#022c22',

  // Surfaces
  surface: '#eff6e8',
  surfaceCard: '#ffffff',

  // Foregrounds
  foregroundHeading: '#022c22',
  foregroundBody: '#44403c',
  foregroundMuted: '#78716c',

  // Brand inline color
  brand: '#047857',

  // Borders
  border: '#d1ead9',
  borderFocus: '#6ee7b7',

  // Status colors
  statusWarning: '#b45309',
  statusWarningSurface: '#fffbeb',
  statusInfo: '#1d4ed8',
  statusInfoSurface: '#eff6ff',
  statusSuccess: '#15803d',
  statusSuccessSurface: '#f0fdf4',
  statusDanger: '#b91c1c',
  statusDangerSurface: '#fef2f2',

  // Neutrals
  white: '#FFFFFF',
  black: '#0A0A0A',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',

  // Semantic shortcuts (for backward compat)
  success: '#15803d',
  error: '#b91c1c',
  warning: '#b45309',
  info: '#1d4ed8',
};

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 30,
  display: 36,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  lg: {
    shadowColor: '#065f46',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
};
