import { Stack } from "expo-router"
import { useState, useContext } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ScppThemeProvider, ScppThemeContext } from './ScppThemeContext';
import { ScppProvider, ScppContext } from "./ScppContext"
import {
    PaperProvider
} from 'react-native-paper';
import {
    ThemeProvider
} from "@react-navigation/native";

const StackLayout = () => {
    const { paperTheme, navTheme, themeName } = useContext(ScppThemeContext);

    return (
        <ThemeProvider value={navTheme}>
            <PaperProvider theme={paperTheme}>
                <StatusBar style={themeName == "dark" ? "light" : "dark"} />
                <Stack>
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }}></Stack.Screen>
                </Stack>
            </PaperProvider>
        </ThemeProvider>
    )
}

// Fue necesario crear un componente que contuviera al StackLayout para que StackLayout
// leyera correctamente el contexto (sino tenia un contexto con variables tal como se inicalizaron
// y no cambiaban al ejecutar toggleTheme)
const App: React.FC = () => {
    return (
        <ScppProvider>
            <ScppThemeProvider>
                <StackLayout />
            </ScppThemeProvider>
        </ScppProvider>
    );
};

export default App;

