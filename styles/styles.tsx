import { StyleSheet } from 'react-native';

export const GetAppStyles = (theme: any) => StyleSheet.create({
    container: {
        backgroundColor: theme.colors.background,
        padding: 10,
        flex: 1
    },
    btnRow: {
        flexDirection: "row",
        justifyContent: "flex-start",
        backgroundColor: theme.colors.background,
        paddingVertical: 2,
        paddingHorizontal: 10
    },
    btnRowBtn: {
        marginHorizontal: 5
    },
    centerContentContainer: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    textFontSize: {
        fontSize: 16,
        color: theme.colors.onBackground,
    },
    // Text variants (replaces react-native-paper Text variants)
    titleLarge: {
        fontSize: 22,
        fontWeight: '400',
        color: theme.colors.onBackground,
    },
    titleMedium: {
        fontSize: 16,
        fontWeight: '500',
        color: theme.colors.onBackground,
    },
    bodyMedium: {
        fontSize: 14,
        fontWeight: '400',
        color: theme.colors.onBackground,
    },
    headlineSmall: {
        fontSize: 24,
        fontWeight: '400',
        color: theme.colors.onBackground,
    },
});