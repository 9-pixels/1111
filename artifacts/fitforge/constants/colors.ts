const palette = {
  text: '#f3f6f4',
  tint: '#b8f23a',
  background: '#0c0f0d',
  foreground: '#f3f6f4',
  card: '#161b19',
  cardForeground: '#f3f6f4',
  primary: '#b8f23a',
  primaryForeground: '#11150d',
  secondary: '#202723',
  secondaryForeground: '#e8edea',
  muted: '#202723',
  mutedForeground: '#9aa39e',
  accent: '#29351d',
  accentForeground: '#b8f23a',
  destructive: '#ff6b6b',
  destructiveForeground: '#ffffff',
  border: '#232a26',
  input: '#232a26',
};

const lightPalette = {
  text: '#151b17',
  tint: '#6f971a',
  background: '#f4f7f3',
  foreground: '#151b17',
  card: '#ffffff',
  cardForeground: '#151b17',
  primary: '#a9df32',
  primaryForeground: '#17200c',
  secondary: '#e9eee8',
  secondaryForeground: '#253027',
  muted: '#e9eee8',
  mutedForeground: '#647067',
  accent: '#eef5df',
  accentForeground: '#42620f',
  destructive: '#c23b4d',
  destructiveForeground: '#ffffff',
  border: '#dce3dc',
  input: '#dce3dc',
};

const colors = {
  light: lightPalette,
  dark: palette,
  radius: 26,
};

export default colors;

export const muscleColors = {
  Chest: '#b8f23a',
  Back: '#67d7ff',
  Shoulders: '#ffbd66',
  Biceps: '#e78aff',
  Triceps: '#ff7e93',
  Legs: '#82f5b1',
  Glutes: '#ff8d61',
  Calves: '#52a9ff',
  Core: '#f5e56b',
  Forearms: '#d7a77a',
  Neck: '#c9f878',
  'Jaw & Face': '#d3a3ff',
} as const;
