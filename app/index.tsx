import { useEffect, useContext } from "react";
import { useRouter } from "expo-router";
import { ScppContext } from "./ScppContext";
import { Stack } from "expo-router";
import { View, Image } from "react-native";
import { useTheme } from "./ScppThemeContext";
import { GetAppStyles } from "../styles/styles";
import { useCheckSession } from "../api/hooks";

const StartPage = () => {
    const { sessionHash, isReady } = useContext(ScppContext);
    const router = useRouter();
    const theme = useTheme();
    const appStyles = GetAppStyles(theme);

    const { data: sessionData, isLoading, isError } = useCheckSession(isReady && !!sessionHash);

    useEffect(() => {
        if (!isReady) return;

        if (!sessionHash) {
            router.replace("/entrance/login");
            return;
        }

        if (isLoading) return;

        if (isError || !sessionData?.success) {
            router.replace("/entrance/login");
        } else {
            router.replace("/list-docs");
        }
    }, [isReady, sessionHash, isLoading, isError, sessionData]);

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
};

export default StartPage;
