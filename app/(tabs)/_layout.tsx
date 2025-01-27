import { Tabs } from "expo-router";
import { useTheme } from "react-native-paper";
import { FontAwesome } from "@expo/vector-icons";
import { useMemo } from "react";

export default () => {
    const theme = useTheme();

    // Memoize common styles and options
    const tabBarStyles = useMemo(() => ({
        tabBarShowLabel: false,
        lazy: true,
        tabBarActiveBackgroundColor: theme.colors.primaryContainer,
    }), [theme]);

    const getTabScreenOptions = (title: string, iconName: any, iconSize = 24, isLazy = true) => ({
        title,
        lazy: isLazy,
        tabBarIcon: () => (
            <FontAwesome
                name={iconName}
                size={iconSize}
                color={theme.colors.primary}
            />
        ),
    });

    return (
        <Tabs screenOptions={tabBarStyles}>
            <Tabs.Screen
                name="dashboard"
                options={getTabScreenOptions("Dashboard", "dashboard")}
            />
            <Tabs.Screen
                name="list-docs"
                options={getTabScreenOptions("Docs", "file", 20, false)}
            />
            <Tabs.Screen
                name="list-assets"
                options={getTabScreenOptions("Assets", "play-circle")}
            />
            <Tabs.Screen
                name="config"
                options={getTabScreenOptions("Config", "cog")}
            />
        </Tabs>
    );
};
