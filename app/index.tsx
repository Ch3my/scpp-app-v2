import { useEffect, useState, useContext } from "react";
import { useRouter } from "expo-router"; // Programmatic navigation
import { ScppContext } from "./ScppContext";
import { Stack } from "expo-router";
import { View, Image } from "react-native";
import { useTheme } from "./ScppThemeContext";
import { GetAppStyles } from "../styles/styles";

const StartPage = () => {
    const [isRedirecting, setIsRedirecting] = useState(false); // Track redirection state
    const { sessionHash, apiPrefix, isReady, fetchAyudas } = useContext(ScppContext);
    const router = useRouter(); // For programmatic navigation
    const theme = useTheme();
    const appStyles = GetAppStyles(theme);

    // Check if the user is logged in
    useEffect(() => {
        if (!isReady) return; // Wait until the app is ready

        const checkLoggedIn = async () => {
            if (!sessionHash) {
                router.replace("/entrance/login"); // Navigate programmatically
                return;
            }

            try {
                const queryParams = new URLSearchParams({ sessionHash });
                const response = await fetch(`${apiPrefix}/check-session?${queryParams}`);
                const data = await response.json();

                if (data.success) {
                    fetchAyudas();
                    router.replace("/list-docs"); // Navigate to the target page
                } else {
                    router.replace("/entrance/login"); // Navigate to login if session is invalid
                }
            } catch (error) {
                console.error("Error checking login:", error);
                router.replace("/entrance/login"); // Navigate to login on error
            } finally {
                setIsRedirecting(false); // Ensure redirection state is cleared
            }
        };

        setIsRedirecting(true); // Indicate redirection is starting
        checkLoggedIn();
    }, [isReady])

    // Show splash screen while determining redirection or navigating
    if (!isReady || isRedirecting) {
        return (
            <View style={appStyles.container}>
                <Stack.Screen options={{ headerShown: false }} />
                <View style={[appStyles.centerContentContainer, { flex: 1 }]}>
                    <Image
                        source={require("../assets/images/splash.png")}
                        style={{ width: 350 }}
                        resizeMode="center"
                    />
                </View>
            </View>
        );
    }

    return null; // Avoid rendering anything else since navigation is handled programmatically
};

export default StartPage;
