export type Theme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'stellar-picker-theme';

export const DEFAULT_THEME: Theme = 'light';

const THEME_COLORS: Record<Theme, string> = {
  light: '#eaf6ff',
  dark: '#07111f',
};

export const isTheme = (value: string | null): value is Theme => value === 'light' || value === 'dark';

export const getThemeColor = (theme: Theme): string => THEME_COLORS[theme];
