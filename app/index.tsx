import { Redirect } from "expo-router"
import { GetData } from "../helpers/async-storage-helper"
import { useRef, useEffect, useState, useContext } from 'react';
import { ScppContext } from "./ScppContext"
import { Link, Stack } from "expo-router";
import { StyleSheet, View, ScrollView } from 'react-native';

const StartPage = () => {
    const [redirect, setRedirect] = useState("/entrance/login");
    const [apiReady, setApiReady] = useState(false);
    const { sessionHash, apiPrefix, isReady } = useContext(ScppContext);

    // Check if login, if not show LoginPage
    useEffect(() => {
        const checkLoggedIn = async () => {
            if (!sessionHash) {
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

    if (!isReady || !apiReady) {
        // TODO show APP LOGO
        return null
    }

    return (
            <Redirect href={redirect} />
    )
}

export default StartPage