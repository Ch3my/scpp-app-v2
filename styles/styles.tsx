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
    totalDiv: {
        alignItems: 'flex-end',
        padding: 15,
        marginTop: 5
    },
    textFontSize: {
        fontSize: 16
    }
});