import { Stack } from "expo-router";
import { useContext, useMemo, useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { Keyboard } from "react-native";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../api/queryClient";
import { ScppThemeProvider, ScppThemeContext } from "./ScppThemeContext";
import { ScppProvider } from "./ScppContext";
import { ThemeProvider } from "expo-router/react-navigation";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Toaster } from "sonner-native";
import { NavigationBar } from "expo-navigation-bar";
import * as SystemUI from "expo-system-ui";

const StackLayout: React.FC = () => {
    const { navTheme, themeName } = useContext(ScppThemeContext);
    const [keyboardHeight, setKeyboardHeight] = useState(0);

    useEffect(() => {
        const show = Keyboard.addListener("keyboardDidShow", (e) => setKeyboardHeight(e.endCoordinates.height));
        const hide = Keyboard.addListener("keyboardDidHide", () => setKeyboardHeight(0));
        return () => { show.remove(); hide.remove(); };
    }, []);

    const statusBarStyle = useMemo(() => (themeName === "dark" ? "light" : "dark"), [themeName]);

    useEffect(() => {
        SystemUI.setBackgroundColorAsync(themeName === "dark" ? "#1C1B1F" : "#FFFBFE");
    }, [themeName]);

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <ThemeProvider value={navTheme}>
                <NavigationBar style={themeName === "dark" ? "light" : "dark"} />
                <StatusBar style={statusBarStyle} />
                <Stack>
                    {/* Had to add index here first, otherwise index.tsx did not execute in SDK 53 */}
                    <Stack.Screen name="index" />
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                </Stack>
                <Toaster theme={themeName} position="bottom-center" offset={keyboardHeight} />
            </ThemeProvider>
        </GestureHandlerRootView>
    );
};

// App component to wrap providers and optimize context rendering
const App: React.FC = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <SafeAreaProvider>
                <ScppProvider>
                    <ScppThemeProvider>
                        <StackLayout />
                    </ScppThemeProvider>
                </ScppProvider>
            </SafeAreaProvider>
        </QueryClientProvider>
    );
};

export default App;
