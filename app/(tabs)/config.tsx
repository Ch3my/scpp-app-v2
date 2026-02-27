import { ScrollView } from "react-native"
import { Stack, useRouter } from "expo-router";
import { ScppContext } from "../ScppContext"
import { ScppThemeContext, useTheme } from '../ScppThemeContext';
import { useContext } from 'react';
import { GetAppStyles } from "../../styles/styles"
import { AppListItem } from '../../components/ui/AppListItem';
import { useLogout } from '../../api/hooks';

export default () => {
    const { theme, navTheme, themeName, toggleTheme } = useContext(ScppThemeContext);
    const appTheme = useTheme();
    const appStyles = GetAppStyles(appTheme)
    const { clearSession } = useContext(ScppContext);
    const router = useRouter();
    const logoutMutation = useLogout();

    const logout = async () => {
        logoutMutation.mutate(undefined, {
            onSuccess: async () => {
                await clearSession();
                router.replace('/entrance/login');
            },
            onError: (error) => {
                console.log("Logout error:", error);
            },
        });
    }

    return (
        <ScrollView style={appStyles.container}>
            <Stack.Screen options={{ headerTitle: "Mas opciones" }} />
            <AppListItem title="Lista Food Storage" onPress={() => router.push("/food/food-list")} />
            <AppListItem title={'Tema Activo: ' + themeName} onPress={() => toggleTheme()} />
            <AppListItem title="Salir" onPress={logout} />
        </ScrollView>
    )
}
