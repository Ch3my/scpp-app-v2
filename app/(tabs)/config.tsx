import {
    useTheme, Text, Appbar,
    Modal, Portal, IconButton,
    List
} from 'react-native-paper';
import { ScrollView, View } from "react-native"
import { Link, useNavigation, Redirect, Stack, router, useRouter } from "expo-router";
import { ScppContext } from "../ScppContext"
import { ScppThemeContext } from '../ScppThemeContext';
import { useState, useContext } from 'react';
import { GetAppStyles } from "../../styles/styles"
import axios, { AxiosResponse } from 'axios'
import { DeleteData } from "../../helpers/async-storage-helper"

export default () => {
    const { paperTheme, navTheme, themeName, toggleTheme } = useContext(ScppThemeContext);
    const theme = useTheme();
    const appStyles = GetAppStyles(theme)
    const { sessionHash, apiPrefix } = useContext(ScppContext);
    const router = useRouter();

    const logout = async () => {
        let response: any = {}
        try {
            response = await axios.post(
                apiPrefix + '/logout',
                { sessionHash }
            )
        } catch (error) {
            console.log(error)
            return
        }
        if (response.status != 200) {
            console.log("Error al cerrar la sesion")
            return
        }
        if (await DeleteData("sessionHash")) {
            router.replace('/entrance/login');
        }
    }

    return (
        <ScrollView style={appStyles.container}>
            <Stack.Screen options={{ headerTitle: "Mas opciones" }} />
            <List.Item title="Lista Food Storage" onPress={() => router.push("/food/food-list")} />
            <List.Item title={'Tema Activo: ' + themeName} onPress={() => toggleTheme()} />
            <List.Item title="Salir" onPress={() => logout()} />
        </ScrollView>
    )
}