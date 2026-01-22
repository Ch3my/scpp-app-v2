import { ScrollView, View } from "react-native"
import { Link, useNavigation, Redirect, Stack, router, useRouter } from "expo-router";
import { ScppContext } from "../ScppContext"
import { ScppThemeContext, useTheme } from '../ScppThemeContext';
import { useState, useContext } from 'react';
import { GetAppStyles } from "../../styles/styles"
import axios, { AxiosResponse } from 'axios'
import { DeleteData } from "../../helpers/async-storage-helper"
import { AppListItem } from '../../components/ui/AppListItem';

export default () => {
    const { theme, navTheme, themeName, toggleTheme } = useContext(ScppThemeContext);
    const appTheme = useTheme();
    const appStyles = GetAppStyles(appTheme)
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
            <AppListItem title="Lista Food Storage" onPress={() => router.push("/food/food-list")} />
            <AppListItem title={'Tema Activo: ' + themeName} onPress={() => toggleTheme()} />
            <AppListItem title="Salir" onPress={() => logout()} />
        </ScrollView>
    )
}
