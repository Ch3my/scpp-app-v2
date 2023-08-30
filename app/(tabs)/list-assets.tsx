import { Text, ScrollView, View } from "react-native"
import { Link, useNavigation, Redirect, Stack } from "expo-router";
import { IconButton, MD3Colors, useTheme } from 'react-native-paper';
import { GetAppStyles } from "../../styles/styles"

export default () => {
    const theme = useTheme();
    const appStyles = GetAppStyles(theme)

    return (
        <ScrollView style={appStyles.container}>
            <Stack.Screen options={{ headerTitle: "Assets" }} />
            <View style={appStyles.btnRow}>
                <Link href="/assets/add-asset" asChild>
                    <IconButton
                        style={appStyles.btnRowBtn}
                        icon="plus"
                        mode="contained-tonal"
                        containerColor={theme.colors.primary}
                        iconColor={theme.colors.onPrimary}
                    />
                </Link>
            </View>
        </ScrollView>
    )
}