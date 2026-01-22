import { Stack } from "expo-router";
import { useContext, useMemo } from "react";
import { StatusBar } from "expo-status-bar";
import { ScppThemeProvider, ScppThemeContext } from "./ScppThemeContext";
import { ScppProvider } from "./ScppContext";
import { ThemeProvider } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

const StackLayout: React.FC = () => {
    const { navTheme, themeName } = useContext(ScppThemeContext);

    // Memoize styles and theme-related values to avoid recalculation
    const statusBarStyle = useMemo(() => (themeName === "dark" ? "light" : "dark"), [themeName]);

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <ThemeProvider value={navTheme}>
                <StatusBar style={statusBarStyle} translucent={false} backgroundColor={navTheme.colors.card} />
                <Stack>
                    {/* Had to add index here first, otherwise index.tsx did not execute in SDK 53 */}
                    <Stack.Screen name="index" />
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                </Stack>
            </ThemeProvider>
        </GestureHandlerRootView>
    );
};

// App component to wrap providers and optimize context rendering
const App: React.FC = () => {
    return (
        <SafeAreaProvider>
            <ScppProvider>
                <ScppThemeProvider>
                    <StackLayout />
                </ScppThemeProvider>
            </ScppProvider>
        </SafeAreaProvider>
    );
};

export default App;
