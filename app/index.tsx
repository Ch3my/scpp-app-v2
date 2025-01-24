import { Redirect } from "expo-router"
import { useEffect, useState, useContext } from 'react';
import { ScppContext } from "./ScppContext"
import { Stack } from "expo-router";
import { StyleSheet, View, Image } from 'react-native';
import { Text, useTheme } from "react-native-paper"
import { GetAppStyles } from "../styles/styles"

const StartPage = () => {
    const [redirect, setRedirect] = useState("/entrance/login");
    const [apiReady, setApiReady] = useState(false);
    const { sessionHash, apiPrefix, isReady, fetchAyudas } = useContext(ScppContext);
    const theme = useTheme();
    const appStyles = GetAppStyles(theme)

    // Check if login, if not show LoginPage
    useEffect(() => {
        const checkLoggedIn = async () => {
            if (!sessionHash && !isReady) {
                return
            }
            if (!sessionHash && isReady) {
                setApiReady(true)
                return
            }
            try {
                const queryParams = new URLSearchParams({
                    sessionHash
                });
                const response = await fetch(apiPrefix + "/check-session?" + queryParams.toString())
                const data = await response.json();
                if (data.success) {
                    setRedirect("/dashboard");
                }
                setApiReady(true)
            } catch (error) {
                console.error("Error checking login:", error);
            }
        }
        checkLoggedIn();
    }, [isReady])

    useEffect(()=> {
        fetchAyudas()
    }, [])

    return (
        <View style={appStyles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            {(isReady && apiReady) &&
                <Redirect href={redirect} />
            }
            <View style={[appStyles.centerContentContainer, { flex: 1 }]}>
                <Image source={require('../assets/images/splash.png')}
                    style={{ width: 350  }}
                    resizeMode='center'
                />
            </View>
        </View>
    )
}

export default StartPage