import {
    useTheme, Text, Appbar,
    Modal, Portal, IconButton,
    List
} from 'react-native-paper';
import { ScrollView, View } from "react-native"
import { Link, useNavigation, Redirect, Stack } from "expo-router";
import { ScppProvider, ScppContext } from "../ScppContext"
import { ScppThemeProvider, ScppThemeContext } from '../ScppThemeContext';
import { useState, useContext } from 'react';

export default () => {
    const { paperTheme, navTheme, themeName, toggleTheme } = useContext(ScppThemeContext);

    return (
        <ScrollView>
            <Stack.Screen options={{ headerTitle: "Config" }} />
            <List.Item title={'Tema Activo: ' + themeName}   onPress={()=> toggleTheme()} />
        </ScrollView>
    )
}