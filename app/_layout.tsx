import { Stack } from "expo-router";
import { useContext, useMemo } from "react";
import { StatusBar } from "expo-status-bar";
import { ScppThemeProvider, ScppThemeContext } from "./ScppThemeContext";
import { ScppProvider } from "./ScppContext";
import { PaperProvider } from "react-native-paper";
import { ThemeProvider } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const StackLayout: React.FC = () => {
    const { paperTheme, navTheme, themeName } = useContext(ScppThemeContext);

    // Memoize styles and theme-related values to avoid recalculation
    const statusBarStyle = useMemo(() => (themeName === "dark" ? "light" : "dark"), [themeName]);

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <ThemeProvider value={navTheme}>
                <PaperProvider theme={paperTheme}>
                    <StatusBar style={statusBarStyle} />
                    <Stack>
                        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                    </Stack>
                </PaperProvider>
            </ThemeProvider>
        </GestureHandlerRootView>
    );
};

// App component to wrap providers and optimize context rendering
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
