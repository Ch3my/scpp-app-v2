import React, { createContext, useState, useContext } from 'react';
import { useColorScheme } from 'react-native';
import {
  DarkTheme,
  DefaultTheme,
} from "@react-navigation/native";

// Custom theme colors (Material Design 3 palette)
const LightColors = {
  primary: '#6750A4',
  onPrimary: '#FFFFFF',
  primaryContainer: '#EADDFF',
  onPrimaryContainer: '#21005D',
  secondary: '#625B71',
  onSecondary: '#FFFFFF',
  secondaryContainer: '#E8DEF8',
  onSecondaryContainer: '#1D192B',
  background: '#FFFBFE',
  onBackground: '#1C1B1F',
  surface: '#FFFBFE',
  onSurface: '#1C1B1F',
  surfaceVariant: '#E7E0EC',
  onSurfaceVariant: '#49454F',
  outline: '#79747E',
  outlineVariant: '#CAC4D0',
  error: '#B3261E',
  onError: '#FFFFFF',
  errorContainer: '#F9DEDC',
  onErrorContainer: '#410E0B',
};

const DarkColors = {
  primary: '#D0BCFF',
  onPrimary: '#381E72',
  primaryContainer: '#4F378B',
  onPrimaryContainer: '#EADDFF',
  secondary: '#CCC2DC',
  onSecondary: '#332D41',
  secondaryContainer: '#4A4458',
  onSecondaryContainer: '#E8DEF8',
  background: '#1C1B1F',
  onBackground: '#E6E1E5',
  surface: '#1C1B1F',
  onSurface: '#E6E1E5',
  surfaceVariant: '#49454F',
  onSurfaceVariant: '#CAC4D0',
  outline: '#938F99',
  outlineVariant: '#49454F',
  error: '#F2B8B5',
  onError: '#601410',
  errorContainer: '#8C1D18',
  onErrorContainer: '#F9DEDC',
};

export type AppTheme = {
  dark: boolean;
  colors: typeof LightColors;
};

const AppLightTheme: AppTheme = {
  dark: false,
  colors: LightColors,
};

const AppDarkTheme: AppTheme = {
  dark: true,
  colors: DarkColors,
};

type ThemeName = 'light' | 'dark';

type ScppThemeContextType = {
  themeName: ThemeName;
  theme: AppTheme;
  navTheme: typeof DefaultTheme;
  toggleTheme: () => void;
};

type ScppThemeProviderProps = {
  children: React.ReactNode;
};

export const ScppThemeContext = createContext<ScppThemeContextType>({
  themeName: 'light',
  theme: AppLightTheme,
  navTheme: DefaultTheme,
  toggleTheme: () => {},
});

export const ScppThemeProvider: React.FC<ScppThemeProviderProps> = ({
  children,
}) => {
  const systemColorScheme = useColorScheme();
  const [themeName, setThemeName] = useState<ThemeName>(
    systemColorScheme === 'dark' ? 'dark' : 'light'
  );
  const [theme, setTheme] = useState<AppTheme>(
    themeName === 'dark' ? AppDarkTheme : AppLightTheme
  );
  const [navTheme, setNavTheme] = useState(
    themeName === 'dark' ? DarkTheme : DefaultTheme
  );

  const toggleTheme = () => {
    const newThemeName = themeName === 'dark' ? 'light' : 'dark';
    setThemeName(newThemeName);
    setTheme(newThemeName === 'dark' ? AppDarkTheme : AppLightTheme);
    setNavTheme(newThemeName === 'dark' ? DarkTheme : DefaultTheme);
  };

  return (
    <ScppThemeContext.Provider
      value={{ themeName, theme, navTheme, toggleTheme }}
    >
      {children}
    </ScppThemeContext.Provider>
  );
};

// Custom useTheme hook to replace react-native-paper's useTheme
export const useTheme = (): AppTheme => {
  const { theme } = useContext(ScppThemeContext);
  return theme;
};

export default ScppThemeProvider;
