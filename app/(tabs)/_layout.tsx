import { Tabs } from "expo-router"
import { useTheme } from "react-native-paper"
import { FontAwesome } from "@expo/vector-icons";
import { GetAppStyles } from "../../styles/styles"

export default () => {
    const theme = useTheme();
    const appStyles = GetAppStyles(theme)

    return (
        <Tabs screenOptions={{ tabBarShowLabel: false }}>
            <Tabs.Screen name="dashboard" options={{
                title: "Dashboard",
                tabBarIcon: ({ focused }) => <FontAwesome name="dashboard" size={24} color={theme.colors.primary} />,
                tabBarActiveBackgroundColor: theme.colors.primaryContainer,
            }}
            />
            <Tabs.Screen name="list-docs" options={{
                title: "Docs",
                tabBarIcon: ({ focused }) => <FontAwesome name="file" size={20} color={theme.colors.primary} />,
                tabBarActiveBackgroundColor: theme.colors.primaryContainer

            }} />
            <Tabs.Screen name="list-assets" options={{
                title: "Assets",
                tabBarIcon: ({ focused }) => <FontAwesome name="play-circle" size={24} color={theme.colors.primary} />,
                tabBarActiveBackgroundColor: theme.colors.primaryContainer
            }} />
            <Tabs.Screen name="config" options={{
                title: "Config",
                tabBarIcon: ({ focused }) => <FontAwesome name="cog" size={24} color={theme.colors.primary} />,
                tabBarActiveBackgroundColor: theme.colors.primaryContainer
            }} />
        </Tabs>
    )
}