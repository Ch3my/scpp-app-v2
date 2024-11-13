import React, { createContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import {
  MD3LightTheme,
  MD3DarkTheme
} from 'react-native-paper';
import {
  DarkTheme,
  DefaultTheme,
} from "@react-navigation/native";

type ThemeName = 'light' | 'dark';

type ScppThemeContextType = {
  themeName: ThemeName;
  paperTheme: any; // Updated variable name
  navTheme: any;
  toggleTheme: () => void;
};

type ScppThemeProviderProps = {
  children: React.ReactNode;
};

export const ScppThemeContext = createContext<ScppThemeContextType>({
  themeName: 'light',
  paperTheme: MD3LightTheme, // Updated variable name
  navTheme: DefaultTheme,
  toggleTheme: () => {console.log("HALO");
  },
});

export const ScppThemeProvider: React.FC<ScppThemeProviderProps> = ({
  children,
}) => {
  const systemColorScheme = useColorScheme();
  const [themeName, setThemeName] = useState<ThemeName>(
    systemColorScheme === 'dark' ? 'dark' : 'light'
  );
  const [paperTheme, setPaperTheme] = useState( // Updated variable name
    themeName === 'dark' ? MD3DarkTheme : MD3LightTheme
  );
  const [navTheme, setNavTheme] = useState(
    themeName === 'dark' ? DarkTheme : DefaultTheme
  );

  const toggleTheme = () => {
    const newThemeName = themeName == 'dark' ? 'light' : 'dark';
    setThemeName(newThemeName);
    setPaperTheme(newThemeName == 'dark' ? MD3DarkTheme : MD3LightTheme); // Updated variable name
    setNavTheme(newThemeName == 'dark' ? DarkTheme : DefaultTheme);
  };

  return (
    <ScppThemeContext.Provider
      value={{ themeName, paperTheme, navTheme, toggleTheme }} // Updated variable name
    >
      {children}
    </ScppThemeContext.Provider>
  );
};

export default ScppThemeProvider